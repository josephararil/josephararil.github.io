# Aperture — Design System

The visual language behind **josepharari.com** — an Apple-flavored, light-primary
system for a growing family of small, personal single-page apps. It exists so any
future app (or its landing card) can be built fast and look like it belongs to the
same considered, premium family.

> **Scope:** this is a *visual style reference*. The example product is Joseph
> Harari's personal index of self-built apps (Compass, Storybook, Sophie's Roadmap,
> Tennis CRM, About). Treat the apps only as design context.

## Context

Joseph Harari builds personal single-page React/PWA apps with Claude Code and ships
them under `josepharari.com/<repo>` via GitHub Pages. The landing page at the root is
a **live dashboard** of those apps: it fetches repos from the GitHub REST API and
merges them with a hand-curated metadata layer (rich tagline, description, highlights,
category, gradient artwork) so visitors instantly understand what each app does.

The design brief was explicit: *"like it was designed by Apple's head of UI/UX."* So
the system leans on the things Apple actually does — the native SF font, generous
whitespace, soft layered depth, large rounded cards, restrained color, gentle motion —
and avoids developer-console tropes (monospace chrome, graph-paper grids, hard
hairlines, neon status dots).

### Sources
- Landing page deliverable: `index.html`, `styles.css`, `app.js`, `screens/` (this project root).
- Live data: `https://api.github.com/users/josephararil/repos`.
- This system is self-authored (no external Figma/codebase import).

---

## Content fundamentals

**Voice:** first person, warm, understated, quietly confident. Joseph speaks as
himself ("Things I build", "the people around me"). Never hype, never salesy.

**Casing:** sentence case everywhere except tiny eyebrow labels (`FEATURED`,
`KIDS & LEARNING`), which are uppercase with wide tracking. Headlines are sentence
case, often split into a confident clause + a softer grey tail.

**Examples (use these as the bar):**
- Hero: *"Things I build, all in one place."* (second clause greyed via `.soft`)
- Hero sub: *"I build small, sharp apps — for planning, for learning, for the people around me. This is a live index of them."*
- App tagline (one line, no period-stacking): *"Chart your path to financial independence."*
- Highlight bullets are noun-led and concrete: *"Monte Carlo simulations across thousands of market paths."*

**Punctuation & numbers:** em dashes for asides; no exclamation marks; spell out
unless a real figure matters. Relative time is humanized ("Updated 5 days ago").

**Emoji:** none. Ever. Identity comes from custom glyphs + gradients, not emoji.

**Length:** ruthless. A card is a title + one-line tagline + a meta row. Depth lives
in the detail modal, not on the surface. One thousand no's for every yes.

---

## Visual foundations

**Type.** The native system stack (`-apple-system, BlinkMacSystemFont, "SF Pro Display"…`)
— real SF Pro on Apple hardware, graceful fallback elsewhere, zero font load. Weights:
600 for all display/headings, 400 for body, 500 for chips/buttons/meta. Tracking tightens
as size grows (−0.035em hero → −0.02em headings → −0.01em body). `text-wrap: balance` on
headings, `pretty` on paragraphs. See the type scale in `colors_and_type.css`.

**Color.** Light-primary. Page `#f5f5f7`, cards pure white, sunk surfaces `#f2f2f4`.
Text is a near-black `#1d1d1f` (never pure black) over three tiers (`#1d1d1f / #515154 /
#86868b`). Hairlines are translucent black at 8%. A single **accent** (Apple blue
`#0071e3` by default; indigo/green/orange/pink/graphite alternates) carries eyebrows,
links, primary buttons and focus rings — used sparingly. A full **dark theme** mirrors
every token (true-black `#000` page, `#1c1c1e` cards, off-white `#f5f5f7` text).

**Gradients — the signature move.** Each app gets a 2–3 stop **diagonal (140°)
gradient** "artwork" tile with a soft white radial highlight in the top-left and a
centered white glyph. Gradients are bold and saturated *but only ever appear as app
artwork* — never as page or section backgrounds (that's the AI-slop tell we avoid).
Examples: Compass teal→blue `#16b6a4 → #0a84d8 → #1148b8`; Storybook sunset
`#ff9d54 → #ff5fa2 → #a855f7`.

**Depth & elevation.** Soft, layered, multi-shadow — never a single hard drop shadow.
Three steps: `--shadow-rest` (cards at rest), `--shadow-hover` (lifted), `--shadow-modal`
(deep, for the sheet). Cards sit on a slightly darker page so white reads as elevated.

**Radii.** Generous and consistent: tiles 18px, glyph badges 22px, standard cards 24px,
featured/modal 28px, chips & buttons fully pill (980px). Small controls 8–12px.

**Motion.** Subtle delight. Default ease `cubic-bezier(.22,.61,.36,1)`; a gentle spring
`cubic-bezier(.34,1.4,.5,1)` for the modal and glyph. Cards lift `translateY(-5px)` with
shadow growth on hover; glyphs scale 1.07 + rotate −2°; the detail modal scales in from
0.94 with a backdrop blur; buttons lift −2px. Durations 180–500ms. All wrapped in
`prefers-reduced-motion`.

**Hover / press.** Hover = lift + shadow + (for chips) −1px nudge and stronger text.
Press/active = settle back toward 0 / slight scale-down (0.995). Links shift their arrow
+2–3px. No color inversions on hover except the active chip (fills with `--text`).

**Transparency & blur.** Frosted glass in three places only: the sticky top bar
(`blur(20px) saturate(180%)`), the modal scrim (`blur(4px)`), and tags laid over
imagery (`blur(8px)`, black 28%). Everything else is opaque.

**Borders.** One hairline weight (translucent, 8%) on cards/inputs/chips; a stronger
14% variant only on hover. No heavy or colored borders. No left-accent-bar cards.

**Layout.** Centered shell, `max-width: 1180px`, comfortable side padding. Sticky top bar
(54px) and a sticky controls row beneath it. Responsive auto-fill grid
(`minmax(320px, 1fr)`, compact 250px). Featured spotlight is a 2-column split that stacks
under 760px. `gap`-based fl/grid spacing throughout — never margin-stacked siblings.

---

## Iconography

- **App glyphs:** custom **inline SVG**, drawn on a 48×48 grid, mostly rounded-line
  (`stroke-width: 2.4`, round caps/joins) with a few solid fills, rendered white on the
  gradient tiles. They are identity marks, not utility icons — one per app
  (compass, open book, sparkle, tennis ball, person). Defined in `app.js` (`GLYPHS`).
- **UI icons:** lightweight stroke icons in the same Lucide-ish rounded-line style
  (search, gear/cog, arrows, check-circle, clock, alert) — inline SVG, `stroke-width`
  ~1.8–2.2. For new work, **Lucide** (CDN) is the closest match and the recommended set.
- **GitHub mark:** the official solid GitHub glyph (inline SVG) for profile/source links.
- **No emoji, no icon font, no unicode-as-icon.** Color comes from the gradient behind
  a glyph, not from the glyph itself.

> ⚠️ The current SVGs are hand-authored inline (in `app.js`). If you adopt Lucide for
> UI chrome, keep the bespoke app glyphs — they're part of the brand.

---

## Index / manifest

| File | What it is |
|------|------------|
| `README.md` | This document. |
| `colors_and_type.css` | All design tokens (light + dark), the type scale, and semantic component classes (`.btn`, `.chip`, `.card`, `.tile`, `.t-*`). Start here. |
| `index.html`, `styles.css`, `app.js` | The live landing-page deliverable — the canonical reference implementation. |
| `screens/` | Drop-in app screenshots (see `screens/README.md`). |
| `preview/` | Design System tab cards: color, type, spacing, and component specimens. |
| `ui_kits/app-index/` | The app-index UI kit: a recreation + component reference. |
| `SKILL.md` | Agent-Skills-compatible entry point for reuse in Claude Code. |

---

## How to reuse for a new app

1. Link `colors_and_type.css` (or copy the `:root` block).
2. Use the system font, the token radii/shadows, and the `.btn`/`.chip`/`.card`/`.tile`
   classes. Pick one accent.
3. Give the new app a 2–3 stop diagonal gradient + a single white glyph for its identity.
4. Keep copy first-person, sentence-case, ruthless. No emoji.
5. Add the app to the landing index by pushing the repo (auto-appears) and, optionally,
   adding a curated entry to `APPS` in `app.js`.
