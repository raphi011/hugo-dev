# Ledger

A quiet Hugo theme for developer blogs. Ledger follows the reader's OS light/dark setting, works at any width, ships its own fonts, and needs no CSS framework or build tooling beyond Hugo.

## Features

- Light and dark themes driven entirely by `prefers-color-scheme` (no JS, no flash)
- Fully responsive, from 320px phones to wide desktops
- Subtle motion: staggered fade-in, a caret in the logo that blinks on hover, sliding underlines, a reading-progress bar and cross-page view transitions where the browser supports them. All of it switches off under `prefers-reduced-motion`
- Code blocks highlighted by Hugo's built-in highlighter, with a filename/language header, a copy button, line highlighting, line numbers, and syntax colours that follow the theme
- GitHub-style alerts (`> [!NOTE]`)
- Posts grouped by year, a featured "latest" post, optional tags, an optional table of contents, prev/next links, RSS, Open Graph and Twitter cards, JSON-LD article data
- Self-hosted fonts: Bricolage Grotesque (headings), Newsreader (body), JetBrains Mono (meta & code). All are SIL OFL
- UI strings are translatable via `i18n/`

## Requirements

- Hugo >= 0.161.0 (standard edition is fine)

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
git submodule add https://github.com/raphi011/hugo-dev themes/ledger
```

Set the theme in your site's `hugo.toml`:

```toml
theme = "ledger"
```

## Development

Run the example site:

```bash
hugo server --source exampleSite
```

## Configuration

See `exampleSite/hugo.toml` for a complete configuration example. The defaults below are set in the theme's `hugo.toml`.

| Param | Default | |
| --- | --- | --- |
| `params.brand` / `params.brandSuffix` | site title / — | Header wordmark. The suffix is rendered in the accent colour |
| `params.intro.kicker`, `.title`, `.text` | — | Home page intro (`title` and `text` accept Markdown) |
| `params.homePostCount` | `12` | How many posts appear under the featured one on the home page |
| `params.dateFormat` / `params.listDateFormat` | `Jan 2, 2006` / `Jan 2` | Date formats |
| `params.showLastmod` | `false` | Shows "updated …" on posts |
| `params.social` | — | List of `{name, url}` for the footer. `github`, `linkedin` and `email` get an icon |
| `params.showRssInNav`, `params.showPoweredBy` | `true` | |
| `params.tagIndex` | `true` | The tags page lists every tag with its posts, under the tag pills |
| `params.tagDateFormat` | `Jan 2006` | Date format in the tag index |
| `params.favicon` | `favicon.svg` | Favicon URL |

Which sections count as posts is decided by Hugo's [`mainSections`](https://gohugo.io/methods/site/mainsections/): by default the section with the most pages.

Front matter on posts: `title`, `date`, `tags`, `description` (used for the featured post summary and meta tags), `toc: true`, `hideMeta: true`.

Front matter on plain pages (e.g. `content/about.md`): `heading` (H1, if different from the title), `kicker`, `facts` (a list of `{label, value}` shown as a "now" table), and `links` (a list of `{name, url}`), or `showSocial: true` to reuse `params.social` + RSS. See `exampleSite/content/about.md`.

### Syntax highlighting

Code is highlighted at build time by Hugo's built-in highlighter (Chroma). The theme colours it from CSS variables so it switches with light/dark, which requires class-based output. Set this in your site's `hugo.toml` (theme `markup` settings are not inherited):

```toml
[markup]
  [markup.highlight]
    noClasses = false
```

Fenced code blocks always use classes regardless; the setting matters for the `highlight` shortcode.

Fences accept a title, highlighted lines and line numbers:

````markdown
```kotlin {title="LedgerService.kt" hl_lines=[4] lineNos=inline}
````

See `exampleSite/content/writing/code-example.md` for all variants.

### Tags

Tags are optional. To switch them off, set `disableKinds = ["taxonomy", "term"]` and remove the `tags` menu entry: no tag pills, no tags page. Posts can still carry `tags:` in front matter.

## Customising

- **Colours and other tokens:** set them under `params.style` in your site's `hugo.toml`; keys under `params.style.dark` apply in dark mode. Each key overrides the CSS variable of the same name:

  ```toml
  [params.style]
    accent = "#0F766E"
    [params.style.dark]
      accent = "#5EEAD4"
  ```

  The tokens and their defaults are in `assets/css/tokens.css` (dark values in `assets/css/tokens-dark.css`). Syntax colours are `--c-kw`, `--c-fn`, `--c-str`, `--c-num`, `--c-com`, `--c-punct`, `--c-del` and `--c-hl`.

- **Other CSS:** create `assets/css/custom.css` in your site. It's appended to the theme CSS automatically.

- **Head tags** (analytics etc.): add `layouts/_partials/custom-head.html` to your site.

## License

[MIT](LICENSE) for the theme. The fonts in `static/fonts` are under the SIL Open Font License 1.1.
