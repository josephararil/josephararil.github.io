# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **personal project dashboard** — a single-page application deployed as a static GitHub Pages site that displays an index of the repository owner's projects. The site fetches repository metadata from the GitHub REST API and renders them as interactive project cards with filtering, search, and theme capabilities.

**Key characteristics:**
- Zero dependencies (vanilla HTML/CSS/JavaScript)
- Single file (`index.html`) containing all markup, styles, and logic
- Live at: `https://josephararil.github.io`
- No build process required — edit and deploy directly

## Architecture

The application follows a **monolithic single-file SPA pattern** optimized for simplicity and GitHub Pages hosting.

### Data Flow

1. **User Avatar Loading** → Fetches via GitHub User API (`loadUser()`)
2. **Repository Fetching** → GitHub REST API returns all non-fork repos sorted by update time (`fetchRepos()`)
3. **Filtering & Rendering** → Client-side filtering by language, recency, or search query (`renderFilters()`, `render()`)
4. **Card Rendering** → Generates HTML for each repo with metadata (`cardHTML()`)

### Core Sections

**DOM & State Management** (lines 632–649)
- Uses simple `$()` selector helper
- Global state: `allRepos`, `currentFilter`, `currentQuery`
- No framework — all updates are direct DOM manipulation

**Theme System** (lines 651–666)
- Toggles `data-theme="dark"` or `data-theme="light"` on `<html>`
- CSS custom properties (variables) switch all colors based on theme attribute
- Persists to localStorage under key `"theme"`

**Filtering & Search** (lines 722–810)
- Language filters: dynamically generated from top 6 languages in repos
- "Recent" filter: 30-day window defined by `isRecent()` helper
- Search: case-insensitive substring match on repo name and description
- All filtering happens on the `allRepos` array before rendering

**Keyboard Shortcuts** (lines 887–900)
- `⌘K` or `Ctrl+K`: Focus/select search input
- `Escape`: Clear search and blur input

### Styling & Design Tokens

**CSS Custom Properties** (lines 14–67)
- Organized into two theme contexts: `html[data-theme="dark"]` and `html[data-theme="light"]`
- Color palette: `--bg`, `--surface`, `--text`, `--text-muted`, `--text-faint`, `--accent`, `--border`, etc.
- Sizing tokens: `--radius-sm`, `--radius`, `--radius-lg`
- Easing: `--ease` (cubic-bezier curve for animations)

**Responsive Grid** (lines 330–337)
- Auto-fill grid with `minmax(320px, 1fr)` — cards scale responsively
- List view (`grid.list`) overrides to single column with full-width cards
- Breakpoints: 720px (hero layout), 768px (shell padding), 1600px (max-width increase)

**Visual Effects**
- Radial gradient spotlight on card hover (line 358)
- Mouse-tracked spotlight position via CSS variables `--mx`, `--my` (lines 824–830)
- Skeleton loading animation (shimmer effect, lines 462–474)

## Common Commands

Since this is a static HTML file with no build tooling, development is minimal:

**View locally:** Open `index.html` directly in a browser or use a local server
```bash
# Python 3
python -m http.server 8000

# Node.js
npx http-server
```

**Deploy:** Push to GitHub — Pages automatically serves `index.html`

**Edit:** Modify `index.html` directly. Changes take effect immediately on save (no compilation).

## Key Considerations for Modifications

### Adding Features

- **New filters:** Add entries to `renderFilters()` logic and update the filter click handler
- **Additional API calls:** Add to the main `fetchRepos()` or create a new async function in the boot section
- **New UI elements:** Insert into the main template area (lines 533–610), ensure unique IDs for jQuery-style selection

### Color/Theme Changes

- Modify CSS custom property values in `html[data-theme="dark"]` or `html[data-theme="light"]` blocks
- All components automatically inherit — no need to update individual selectors
- Test both themes by clicking the theme toggle button in the top-right

### Performance Notes

- GitHub API limit: 60 requests/hour for unauthenticated requests from a single IP
- Error handling detects rate limiting (line 851) and displays user-friendly message
- Skeleton loading shown during fetch to improve perceived performance
- All DOM queries use the `$()` helper to avoid repetitive `document.querySelector()` calls

### Accessibility

- ARIA labels on all interactive elements (`aria-label`, `aria-pressed`, `role`)
- Semantic HTML (`<header>`, `<section>`, `<footer>`, `<article>`, `<time>`)
- Keyboard navigation fully supported (search focus, filter tabs)
- Respects `prefers-reduced-motion` media query (line 524)

## Testing

Open the site and verify:
1. Repositories load and display correctly
2. Search filters repos by name/description
3. Language chips filter by language
4. "Recent" filter shows only projects updated in the last 30 days
5. Theme toggle switches between dark and light modes
6. Grid/List view toggle works
7. Clicking a card launches the project
8. Keyboard shortcut (⌘K / Ctrl+K) focuses search
