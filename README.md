# josepharari.com — homepage

The live personal app index at [josepharari.com](https://josepharari.com).

## What it is

A single-page app that fetches Joseph Harari's public GitHub repos and renders them as a
browsable, searchable card grid. Curated metadata (tagline, description, highlights,
gradient artwork, glyph) lives in `app.js`.

## Files

| File | What |
|------|------|
| `index.html` | Page shell |
| `styles.css` | Self-contained stylesheet — design tokens + all page-specific styles |
| `app.js` | Data layer, rendering, and interactions |
| `screens/` | App screenshots (referenced by `app.js`) |

## Design system

The visual language is **Aperture** — see [github.com/josephararil/aperture](https://github.com/josephararil/aperture).
This repo keeps a self-contained copy of the design tokens inside `styles.css`
(no runtime dependency on the Aperture repo).

## Adding a new app

1. Push a public repo to [github.com/josephararil](https://github.com/josephararil) — it appears automatically.
2. Add a curated entry to `APPS` in `app.js` for a polished tagline, description, gradient, and glyph.
3. Drop a screenshot at `screens/<repo-name>.png` and set `shot:` in the `APPS` entry.
