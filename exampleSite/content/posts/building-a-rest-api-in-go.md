---
title: "Building a REST API in Go"
date: 2026-02-05
tags:
  - go
  - tutorial
description: "A comprehensive guide to building production-ready REST APIs with Go's standard library."
---

Building REST APIs in Go is surprisingly pleasant. The [standard library](https://pkg.go.dev/std) gives you everything you need — no frameworks required. In this post, we'll build a **complete API** from scratch, covering routing, middleware, error handling, and testing.

## Prerequisites

Before we begin, make sure you have:

1. [Go 1.22](https://go.dev/doc/go1.22) or later installed
2. Basic familiarity with [HTTP concepts](https://developer.mozilla.org/en-US/docs/Web/HTTP)
3. A terminal and your favorite editor

You should also understand how [`net/http`](https://pkg.go.dev/net/http) works at a high level — we'll build on top of it rather than replacing it.

---

## Project Structure

A clean project layout makes all the difference. Here's what we'll end up with:

```
api-server/
├── main.go
├── handler/
│   ├── handler.go
│   └── handler_test.go
├── middleware/
│   └── logging.go
├── model/
│   └── post.go
└── go.mod
```

> [!NOTE]
> We're using Go's standard library exclusively. No Gin, no Echo, no Chi — just `net/http` and the new `ServeMux` routing patterns from Go 1.22.

## Defining the Model

Let's start with a simple `Post` struct. JSON struct tags control serialization, and we use pointer types for optional fields:

```go
package model

import "time"

// Post represents a blog post in the system.
type Post struct {
	ID        int        `json:"id"`
	Title     string     `json:"title"`
	Body      string     `json:"body"`
	Tags      []string   `json:"tags,omitempty"`
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt *time.Time `json:"updated_at,omitempty"`
}
```

A few things to note about this struct:

- **`omitempty`** — omits the field from JSON output when it's the zero value
- **`*time.Time`** — a pointer allows `null` in JSON (vs. `"0001-01-01T00:00:00Z"`)
- **`[]string`** — slices are `null` when nil, `[]` when empty; be intentional about which you want

### Validation

We could use a validation library, but for a small API, a method is enough:

```go
func (p Post) Validate() error {
	if strings.TrimSpace(p.Title) == "" {
		return errors.New("title is required")
	}
	if len(p.Title) > 200 {
		return fmt.Errorf("title too long: %d chars (max 200)", len(p.Title))
	}
	if strings.TrimSpace(p.Body) == "" {
		return errors.New("body is required")
	}
	return nil
}
```

> [!TIP]
> Return `error` rather than `bool` from validation — callers get a human-readable message they can pass directly to the API response.

## Building the Handler

The handler ties everything together. We'll use a struct to hold dependencies (the in-memory store) and register routes in a `Routes()` method:

```go
package handler

import (
	"encoding/json"
	"net/http"
	"strconv"
	"sync"

	"api-server/model"
)

type Handler struct {
	mu    sync.RWMutex
	posts map[int]model.Post
	nextID int
}

func New() *Handler {
	return &Handler{
		posts:  make(map[int]model.Post),
		nextID: 1,
	}
}

func (h *Handler) Routes() *http.ServeMux {
	mux := http.NewServeMux()

	mux.HandleFunc("GET /posts", h.listPosts)
	mux.HandleFunc("GET /posts/{id}", h.getPost)
	mux.HandleFunc("POST /posts", h.createPost)
	mux.HandleFunc("DELETE /posts/{id}", h.deletePost)

	return mux
}
```

> [!IMPORTANT]
> The `GET /posts` pattern syntax is **new in Go 1.22**. Previously, `HandleFunc("/posts", ...)` matched all HTTP methods. Now you can be explicit.

### Implementing Endpoints

Here's the `createPost` handler as an example. It demonstrates JSON decoding, validation, and proper HTTP status codes:

```go
func (h *Handler) createPost(w http.ResponseWriter, r *http.Request) {
	var p model.Post
	if err := json.NewDecoder(r.Body).Decode(&p); err != nil {
		http.Error(w, "invalid JSON: "+err.Error(), http.StatusBadRequest)
		return
	}

	if err := p.Validate(); err != nil {
		http.Error(w, err.Error(), http.StatusUnprocessableEntity)
		return
	}

	h.mu.Lock()
	p.ID = h.nextID
	p.CreatedAt = time.Now()
	h.posts[p.ID] = p
	h.nextID++
	h.mu.Unlock()

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(p)
}
```

The full set of endpoints follows this pattern:

| Method   | Path          | Status | Description        |
|----------|---------------|--------|--------------------|
| `GET`    | `/posts`      | 200    | List all posts     |
| `GET`    | `/posts/{id}` | 200    | Get a single post  |
| `POST`   | `/posts`      | 201    | Create a new post  |
| `DELETE`  | `/posts/{id}` | 204    | Delete a post      |

## Middleware

Middleware wraps handlers to add cross-cutting behavior. Here's a logging middleware that records method, path, status code, and duration:

```go
package middleware

import (
	"log/slog"
	"net/http"
	"time"
)

func Logging(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()

		// Wrap ResponseWriter to capture status code
		rec := &recorder{ResponseWriter: w, status: http.StatusOK}
		next.ServeHTTP(rec, r)

		slog.Info("request",
			"method", r.Method,
			"path", r.URL.Path,
			"status", rec.status,
			"duration", time.Since(start),
		)
	})
}

type recorder struct {
	http.ResponseWriter
	status int
}

func (r *recorder) WriteHeader(code int) {
	r.status = code
	r.ResponseWriter.WriteHeader(code)
}
```

> [!WARNING]
> The `recorder` wrapper only captures `WriteHeader` calls. If a handler writes the body without calling `WriteHeader` first, Go implicitly sends `200 OK` — which our default handles. But if you need to capture bytes written, you'd also need to wrap `Write`.

### Composing Middleware

Middleware composes by nesting. For multiple layers, a helper keeps it readable:

```go
func Chain(h http.Handler, middlewares ...func(http.Handler) http.Handler) http.Handler {
	// Apply in reverse so the first middleware is outermost
	for i := len(middlewares) - 1; i >= 0; i-- {
		h = middlewares[i](h)
	}
	return h
}
```

## Wiring It Up

The `main.go` brings everything together:

```go
package main

import (
	"fmt"
	"log/slog"
	"net/http"
	"os"

	"api-server/handler"
	"api-server/middleware"
)

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	h := handler.New()
	mux := h.Routes()

	srv := &http.Server{
		Addr:    ":" + port,
		Handler: middleware.Logging(mux),
	}

	slog.Info("starting server", "port", port)

	if err := srv.ListenAndServe(); err != nil {
		fmt.Fprintf(os.Stderr, "server error: %v\n", err)
		os.Exit(1)
	}
}
```

## Testing

Go's [`httptest`](https://pkg.go.dev/net/http/httptest) package makes API testing straightforward. Here's a test for the create + get flow:

```go
func TestCreateAndGetPost(t *testing.T) {
	h := New()
	srv := httptest.NewServer(h.Routes())
	defer srv.Close()

	// Create
	body := `{"title": "Test Post", "body": "Hello, world!"}`
	resp, err := http.Post(srv.URL+"/posts", "application/json",
		strings.NewReader(body))
	if err != nil {
		t.Fatal(err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusCreated {
		t.Fatalf("expected 201, got %d", resp.StatusCode)
	}

	var created model.Post
	json.NewDecoder(resp.Body).Decode(&created)

	// Get
	resp, err = http.Get(srv.URL + "/posts/" + strconv.Itoa(created.ID))
	if err != nil {
		t.Fatal(err)
	}
	defer resp.Body.Close()

	var fetched model.Post
	json.NewDecoder(resp.Body).Decode(&fetched)

	if fetched.Title != "Test Post" {
		t.Errorf("expected title %q, got %q", "Test Post", fetched.Title)
	}
}
```

Run with:

```bash
go test ./... -v -count=1
```

> [!CAUTION]
> Don't use `-count=1` in CI pipelines where you want test caching. It's useful during development to force re-runs, but in CI it just slows things down.

## Performance Considerations

A few things to keep in mind as traffic grows:

- **Connection pooling** — `http.Server` handles this for you, but set [`ReadTimeout` and `WriteTimeout`](https://blog.cloudflare.com/the-complete-guide-to-golang-net-http-timeouts/) to avoid slow-client attacks
- **JSON encoding** — `json.NewEncoder` writes directly to the response, avoiding a buffer allocation. Prefer it over `json.Marshal` + `w.Write`
- **Mutex granularity** — our [`sync.RWMutex`](https://pkg.go.dev/sync#RWMutex) works for simple cases, but switch to a real database before you need sharding

### Benchmarking

Here's a quick benchmark for the list endpoint:

```go
func BenchmarkListPosts(b *testing.B) {
	h := New()
	// Seed with 1000 posts
	for i := range 1000 {
		h.posts[i] = model.Post{
			ID:    i,
			Title: fmt.Sprintf("Post %d", i),
			Body:  "Lorem ipsum dolor sit amet.",
		}
	}
	h.nextID = 1000

	req := httptest.NewRequest("GET", "/posts", nil)

	b.ResetTimer()
	for range b.N {
		w := httptest.NewRecorder()
		h.listPosts(w, req)
	}
}
```

## Summary

We've built a complete REST API with:

- [x] CRUD endpoints with proper HTTP semantics
- [x] Input validation with clear error messages
- [x] Request logging middleware
- [x] Thread-safe in-memory storage
- [x] Integration tests
- [x] Benchmarks

The full source is ~200 lines of Go[^1]. No frameworks, no code generation, no magic — just the standard library and clear patterns.

[^1]: Excluding tests, which add another ~100 lines.

---

*Next up: we'll add database persistence with PostgreSQL and `pgx`, graceful shutdown, and structured error responses.*
