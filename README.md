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
4. If the repo has no live GitHub Pages deployment (a GitHub Actions pipeline, a CLI, a data-only
   repo, a design prototype not yet deployed), set `headless: true` and a short `runtimeNote:`
   (e.g. `"Runs daily on GitHub Actions — no UI, just email"`). The card's "Launch app" button is
   hidden and the note is shown in its place in the detail modal.

## Excluding a repo

Repos that are empty, superseded, or otherwise not ready for public display can be added to
`EXCLUDED_REPOS` in `app.js` rather than deleted from GitHub.
