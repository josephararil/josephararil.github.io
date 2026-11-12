# CLAUDE.md — homepage

Personal homepage for josepharari.com, served by GitHub Pages from `main` (repo
`josephararil/josephararil.github.io`). Merging to `main` deploys.

- The site is `index.html` (markup, CSS, the personal-layer script) plus the koi pond as native ES
  modules in `pond/` (entry `pond/main.js`, loaded with `<script type="module">`). No build step,
  no dependencies, no external requests. README has the module table.
- The pond is Claude Fable 5.2's "Koi Pond, Noon", moved verbatim into the modules.
  Changes to the pond are deliberate and listed in README → Changes from the original. Keep the look
  and feel unless a task says otherwise. Keep the original style (`var`, its formatting).
- Caustics render on the GPU (a WebGL fragment shader, `renderCausticsGL` in `pond/floor.js`) every
  frame. The CPU `paintCaustics` is the reference and the fallback when WebGL is missing or the
  context is lost; keep the two in step if you change the maths.
- Module rules (they look fine when broken, then fail only on some paths):
  - **MODULE-EVAL:** never call an imported function or read an imported mutable binding at a
    module's top level, only inside functions. The imports form cycles (koi ↔ surface ↔ input), so a
    top-level read can see `undefined` or throw. Exceptions: `core.js` constants (`C`, `hex`,
    `TAU`), and `main.js`'s startup (it is the entry point; nothing imports it).
  - **SINGLE-WRITER:** a shared binding is assigned only in its own module. `W H DPR S M T calm
    covered` change only through `setView`, `advanceTime`, `setCalm`, `setCovered` in `core.js`.
    Assigning an imported binding throws, but only when that line runs.
- Rain timing uses `Math.random()`, never the seeded `rnd()`: `rnd` is seeded, so rain would start
  at the same moment on every visit.
- The intro card shows once per browser: `localStorage` key `pond.introSeen.v1` (bump the suffix to
  show a changed card again). All storage access is wrapped in try/catch.
- The photo is `me.png` in the repo root (the owner's GitHub avatar, saved locally so there is no
  external request). The JH disc falls back to the text "JH" if it fails to load.
- Tunable numbers live in `CONFIG` (`pond/core.js`). `?debug` loads `pond/debug.js`: a live panel,
  `D` logs a JSON state dump, and `window.__pond` exposes the arrays.
- The personal layer (caption, JH button, veil, bio) lives in: the CSS after the
  `the personal layer` comment, the markup for `#me`, `#veil`, `#bio`, `.depth`, and the inline
  `<script>` block. It tells the pond when the bio covers it (`data-pond-covered`, `pond:cover`).
- Desktop reveals the bio by scrolling (`html.scrolly`). Touch devices (`html.touch`) never scroll,
  because scrolling would fight tap and hold gestures on the pond. Test both:
  in the browser pane use the mobile preset, which emulates a coarse pointer.
- Visual language: Georgia italic, ink `#14323A` at 70%, the pond palette in `:root`. Light only,
  by design. Do not add a credit line (owner's call).
- **Offline PWA.** `sw.js` pre-caches a fixed file list and serves it cache-first. On any change
  to a deployed file, bump `CACHE` in `sw.js` in the same PR, and add new files to `FILES`;
  otherwise visitors never see the change. The installed app (`display: fullscreen`) must behave
  exactly like the site. The worker skips `localhost` unless the URL has `?sw`; unregister it
  after testing.
- Preview: `python -m http.server 8766` from the repo root. It needs http: ES modules do not load
  from `file://`.
