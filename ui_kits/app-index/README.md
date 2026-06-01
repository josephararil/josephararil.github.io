# UI Kit — App Index

The canonical, high-fidelity implementation of the Aperture system: the live
landing page that indexes Joseph Harari's apps.

## Files
- `index.html` — the page shell (top bar, hero, controls, grid, modal, footer).
- `styles.css` — full component CSS (the production stylesheet).
- `app.js` — data layer + rendering + interactions, including the **curated
  metadata** object (`APPS`) and the **glyph** set (`GLYPHS`).

## What it demonstrates (interactive)
- **Live GitHub fetch** → repos merged with curated metadata; skeleton + error/retry states.
- **Featured spotlight** (2-column split) + **category sections**.
- **App cards** with gradient artwork tiles, frosted category tag, language dot, relative time.
- **Detail modal sheet** — compact art band, highlights checklist, meta, Launch / View source.
- **Search** (debounced) + **category filter chips** (flattens to a results grid when active).
- **Settings popover** — Light / Dark / Auto, six accents, density — persisted to `localStorage`.

## Components worth lifting
| Pattern | Where |
|---|---|
| Pill buttons (`.btn`, `.btn-primary`, `.btn-secondary`) | `styles.css` / `colors_and_type.css` |
| Filter chips (`.chip`) | `styles.css` |
| Gradient artwork tile + glyph (`.tile`) | `styles.css`, `artHTML()` in `app.js` |
| Card (`.card`) | `styles.css`, `cardHTML()` |
| Featured spotlight (`.featured`) | `styles.css`, `featuredHTML()` |
| Modal sheet (`.modal`) | `styles.css`, `openModal()` |
| Frosted top bar + settings popover | `styles.css`, `initSettings()` |

## Reuse notes
This kit links its own copies of `styles.css`/`app.js`. For a *new* app, prefer
linking the root `../../colors_and_type.css` for tokens + base components, and
borrow only the patterns you need. Keep copy first-person and sentence-case; give
each app a 2–3 stop diagonal gradient + one white glyph.
