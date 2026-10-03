# Ledger (hugo-dev)

Hugo theme for developer blogs. Plain CSS and vanilla JS, built by Hugo alone: no Node, no CSS framework. Consumed as a Hugo module; `README.md` is the user-facing documentation.

Preview with `just dev` (serves `exampleSite`, which resolves the theme from this checkout).

## Conventions

- **Layouts** use Hugo's current template structure: `layouts/_partials`, `layouts/_markup`, `layouts/_shortcodes`, page templates at the `layouts/` root.
- **Params**: every default lives in `hugo.toml` under `[params]`; templates read `site.Params.x` directly. A new param gets a default there, a row in the README table and an entry in `exampleSite/hugo.toml`. A template fallback is reserved for defaults that depend on other site values (e.g. `brand` falling back to `site.Title`).
- **Colours** come from tokens: light values in `assets/css/tokens.css`, dark values in `assets/css/tokens-dark.css`. The import order at the top of `assets/css/main.css` (light tokens, `hugo:vars`, dark tokens, `hugo:vars/dark`) is what keeps a site's light-only override out of dark mode.
- **Links** are built from `.RelPermalink` / `site.Home.RelPermalink`, so the theme works under a `baseURL` subpath.
- **JavaScript** is progressive enhancement: every page works with JS off. An element that needs JS ships with `hidden` and `assets/js/main.js` reveals it.
- **Feeds**: RSS embeds rendered content. A render hook that adds UI chrome (anchors, buttons) has a plain `*.rss.xml` twin in `layouts/_markup`.
- **UI strings** go through `i18n/en.yaml`.
- **Fonts** are self-hosted in `static/fonts` under SIL OFL.

## Verifying a change

1. `hugo --source exampleSite` builds with no warnings.
2. The same build passes with `--baseURL https://example.org/blog/`; internal links start with `/blog/`.
3. For a param or token change, build once with the param at a non-default value (including `0` / `false`) and once with it unset.
4. Check light and dark, and a 320px-wide viewport.

## Releasing

Raise `min_version` in `theme.toml` when using a newer Hugo feature. Sites pin a commit of this repo; after merging to `main`, `raphi011.dev` picks the change up with `hugo mod get github.com/raphi011/hugo-dev@main`.
