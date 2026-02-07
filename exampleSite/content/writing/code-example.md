---
title: "Code Highlighting Example"
date: 2024-01-15
draft: false
tags:
  - go
  - javascript
  - css
---

This post demonstrates syntax highlighting with Shiki, using the Catppuccin theme pair.

## Go

```go
package main

import (
	"fmt"
	"net/http"
)

func main() {
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintf(w, "Hello, %s!", r.URL.Path[1:])
	})

	fmt.Println("Listening on :8080")
	http.ListenAndServe(":8080", nil)
}
```

## JavaScript

```javascript
async function fetchPosts(page = 1) {
  const res = await fetch(`/api/posts?page=${page}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch posts: ${res.status}`);
  }

  const { data, total } = await res.json();
  return { posts: data, hasMore: data.length * page < total };
}

// Usage
const { posts, hasMore } = await fetchPosts();
console.log(`Loaded ${posts.length} posts, more: ${hasMore}`);
```

## CSS

```css
:root {
  --color-bg: #ffffff;
  --color-text: #1a1a1a;
}

.card {
  background: var(--color-bg);
  color: var(--color-text);
  border-radius: 0.5rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgb(0 0 0 / 0.1);
  transition: box-shadow 0.2s ease;
}

.card:hover {
  box-shadow: 0 4px 12px rgb(0 0 0 / 0.15);
}
```
