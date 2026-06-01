---
name: aperture-design
description: Use this skill to generate well-branded interfaces and assets in the "Aperture" design language — the Apple-flavored, light-primary system behind josepharari.com. Contains design guidelines, color + type tokens, the system font, custom app glyphs, and a UI kit for building or prototyping new single-page apps and their landing cards.
user-invocable: true
---

# Aperture

An Apple-flavored, light-primary design system for a growing family of small,
personal single-page apps. Premium, calm, content-first: native SF type, generous
whitespace, soft layered depth, large rounded cards, restrained accent color, and
gentle motion. Each app earns identity from a bold 2–3 stop gradient + a single
white glyph — never from emoji or page-wide gradients.

## Start here
1. Read `README.md` — full context, content fundamentals, visual foundations, and iconography.
2. Link or copy `colors_and_type.css` — all tokens (light + dark), the type scale,
   and ready-made `.btn` / `.chip` / `.card` / `.tile` / `.t-*` classes.
3. Browse `preview/` for specimens and `ui_kits/app-index/` for the reference
   implementation (`index.html` + `styles.css` + `app.js`, including the curated
   `APPS` metadata and `GLYPHS` set).

## When building
- **Artifacts (slides, mocks, throwaway prototypes):** copy assets out and produce
  static HTML the user can view. Use the system font, token radii/shadows, one accent.
- **Production code:** copy `colors_and_type.css`, adopt the patterns, and follow the
  rules in `README.md` to design like a native part of the family.
- Give every new app a 2–3 stop **diagonal (140°) gradient** + one **white rounded-line
  glyph**. Keep copy **first-person, sentence-case, ruthless**. **No emoji.**
- UI chrome icons: use **Lucide** (closest match to the bespoke rounded-line style);
  keep the custom app glyphs for identity.

If invoked without guidance, ask what the user wants to build, ask a few sharp
questions, then act as an expert designer who outputs HTML artifacts or production
code as needed.
