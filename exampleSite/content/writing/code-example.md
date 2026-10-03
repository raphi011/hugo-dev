---
title: "Code Highlighting Example"
date: 2024-01-15
draft: false
toc: true
tags:
  - go
  - javascript
  - css
---

This post demonstrates Hugo's built-in syntax highlighting. Colours come from the theme's CSS variables, so code follows light and dark mode like the rest of the page. Inline code looks like `transform.Highlight`.

## Go

```go
package main

import (
	"fmt"
	"net/http"
)

// greet writes a greeting for the request path.
func greet(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "Hello, %s!\n", r.URL.Path[1:])
}

func main() {
	http.HandleFunc("/", greet)

	const addr = ":8080"
	fmt.Println("Listening on", addr)
	if err := http.ListenAndServe(addr, nil); err != nil {
		panic(err)
	}
}
```

## Title and highlighted lines

```kotlin {title="LedgerService.kt" hl_lines=[3, "6-7"]}
@JvmInline
value class MinorUnits(val value: Long) {
    operator fun plus(other: MinorUnits) = MinorUnits(Math.addExact(value, other.value))
}

fun post(tx: LedgerTransaction) = db.transaction {
    tx.postings.forEach { postings.insert(it) }
    log.info("posted {}", tx.id)
}
```

## Line numbers

Inline:

```javascript {lineNos=inline hl_lines=[4]}
async function fetchPosts(page = 1) {
  const res = await fetch(`/api/posts?page=${page}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch posts: ${res.status}`);
  }

  const { data, total } = await res.json();
  return { posts: data, hasMore: data.length * page < total };
}
```

Table, starting at 40:

```sql {lineNos=table lineNoStart=40 hl_lines=[3] title="V12__postings.sql"}
create table posting (
  id             bigint generated always as identity primary key,
  transaction_id uuid    not null,
  account_id     uuid    not null references account(id),
  amount_minor   bigint  not null check (amount_minor <> 0),
  currency       char(3) not null -- ISO 4217
);
```

## Long lines

```go {hl_lines=[2]}
func short() {}
func handleWithAVeryLongSignature(ctx context.Context, w http.ResponseWriter, r *http.Request, logger *slog.Logger, store Store, opts ...Option) (result *Response, err error) {
	return nil, nil
}
```

## Shell session

```console
$ hugo new content writing/my-post.md
Content "writing/my-post.md" created
$ hugo server --source exampleSite
```

```bash
#!/usr/bin/env bash
set -euo pipefail

for f in content/**/*.md; do
  echo "checking ${f}"
done
```

## Diff

```diff
--- a/hugo.toml
+++ b/hugo.toml
@@ -1,4 +1,4 @@
 [markup]
   [markup.highlight]
-    codeFences = false
+    noClasses = false
```

## CSS and HTML

```css
:root {
  --color-bg: #ffffff;
  --color-text: #1a1a1a;
}

.card:hover {
  background: var(--color-bg);
  box-shadow: 0 4px 12px rgb(0 0 0 / 0.15);
  transition: box-shadow 0.2s ease;
}
```

```html
<!doctype html>
<button class="copy" type="button" aria-label="Copy code" hidden>
  <span>copy</span> &amp; paste
</button>
```

## Data formats

```json
{ "name": "ledger", "tags": ["blog", "minimal"], "minVersion": 0.146, "private": true, "license": null }
```

```yaml
params:
  brand: ledger # header wordmark
  homePostCount: 12
  showLastmod: false
```

```toml
[markup.highlight]
  noClasses = false
```

## No language

```
api-server/
├── main.go
└── handler/
    ├── handler.go
    └── handler_test.go
```

## Alerts

> [!NOTE]
> Alerts use Hugo's blockquote render hook.

> [!WARNING]
> Keep `markup.highlight.noClasses = false` in your site config.
