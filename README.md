# Paper

A clean, minimal Hugo theme.

## Requirements

- Hugo >= 0.145.0 (extended edition recommended)
- [Bun](https://bun.sh/) (for Tailwind CSS build and Shiki syntax highlighting)

## Installation

### As a Hugo Module (recommended)

Add the theme to your site's `hugo.toml`:

```toml
[module]
  [[module.imports]]
    path = "github.com/raphi011/hugo-dev"
```

Then run:

```bash
hugo mod get -u
```

### As a Git Submodule

```bash
git submodule add https://github.com/raphi011/hugo-dev themes/hugo-dev
```

Set the theme in your site's `hugo.toml`:

```toml
theme = "paper"
```

## Development

Install dependencies:

```bash
bun install
```

Watch CSS during development:

```bash
bun run dev:css
```

Run the example site:

```bash
hugo server --source exampleSite
```

> Code blocks will render with fallback styling in dev mode. Run a full build to see Shiki highlighting.

## Production Build

The full build pipeline: Tailwind CSS → Hugo → Shiki syntax highlighting.

```bash
bun run build
```

This runs three steps:
1. `build:css` — compiles and minifies Tailwind CSS
2. `hugo` — builds the example site into `exampleSite/public/`
3. `build:highlight` — post-processes HTML with Shiki for syntax highlighting

### Syntax Highlighting

Code blocks are highlighted by [Shiki](https://shiki.style/) using a post-processing approach. Hugo outputs raw `<pre><code>` blocks (`codeFences = false`), then `rehype-cli` with `@shikijs/rehype` adds Shiki highlighting to all HTML files in `public/`.

**Important:** Your site's `hugo.toml` must disable Hugo's built-in highlighter:

```toml
[markup]
  [markup.highlight]
    codeFences = false
```

Dark/light theme switching uses CSS variables and works with the theme's `.dark` class on `<html>`.

To change the syntax theme pair, edit `.rehyperc`:

```json
{
  "plugins": [
    ["@shikijs/rehype", {
      "themes": {
        "light": "catppuccin-latte",
        "dark": "catppuccin-mocha"
      },
      "defaultColor": "light"
    }]
  ]
}
```

See [Shiki themes](https://shiki.style/themes) for available options.

## Configuration

See `exampleSite/hugo.toml` for a complete configuration example.

## License

[MIT](LICENSE)
