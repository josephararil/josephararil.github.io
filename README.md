# josepharari.com — homepage

The personal homepage at [josepharari.com](https://josepharari.com): a koi pond seen from above at
noon, with a short bio just beneath the surface.

## What it is

A static site: `index.html` plus the pond as native ES modules in `pond/` (no build, no
dependencies). The pond is the "Koi Pond, Noon"
study written by Claude Fable 5.2 (from the MiaAI-Lab collection of Fable 5.2 HTML pages), used
with its look and feel unchanged (see [Changes from the original](#changes-from-the-original)).
On top of it sits a thin personal layer:

- **Signature caption.** The vertical caption in the bottom-right corner reads
  "Joseph Harari · koi pond, noon." Clicking it opens the bio.
- **JH button**, top-left, mirroring the sound button top-right, with "a little about me" beside it.
- **The bio.** It surfaces through a white glare, the same effect the page opens with.
  - Desktop: the page scrolls one screen. The pond stays fixed and scroll position drives the reveal.
  - Touch devices (`(hover: none) and (pointer: coarse)`): no scrolling, because a vertical swipe
    would fight tap-for-ripple and hold-to-feed. The JH button plays the same reveal as a tween.
  - Close it with "back to the pond", a click on the veil, Escape, or by scrolling back up.
- **Photo.** `me.png` (the GitHub avatar, saved in the repo so there is no external request) fills
  the JH disc and sits at 56 px above the name in the bio. If it fails to load, the disc shows "JH".

## Features added to the pond

- **Intro card.** On a first visit, a small card explains ripples, food, wakes and rain. It appears
  after 3.8 s (1.2 s with reduced motion), waits if the bio is open, and goes away on its button,
  Escape, a tap on the pond (the tap still ripples) or opening the bio. Seen once per browser
  (`localStorage` key `pond.introSeen.v1`).
- **Rain.** Now and then it rains: dry spells of 2–4 minutes, showers of 14–26 seconds, so about
  10% of the time. Rain brings many small drop rings, dims the caustics and the light sheet, and
  (with sound on) adds a soft hiss and the odd drip. The button under the sound button turns rain
  on (until pressed again) or off (which restarts the schedule with a fresh dry spell).
- **Drag wakes.** Dragging across the water leaves a trail of medium ripples. Wakes nudge pads and
  leaves but do not startle the fish; a slow drag can still draw a curious koi to follow.

## Changes from the original

- **GPU caustics.** The caustic light is drawn by a WebGL fragment shader every frame, with the same
  maths at the same resolution. The original CPU version (every third frame) stays as the fallback
  when WebGL is unavailable or the context is lost.
- **Stones drawn only in the corners.** The stone layer is copied as four corner rectangles instead
  of a full-screen image. No visual change.
- **Half rate behind the bio.** While the bio covers the pond, the pond runs every other frame and
  the caustics freeze. The personal layer signals this with `data-pond-covered` on `<html>` and a
  `pond:cover` event.
- **Split into ES modules.** The single pond script now lives in `pond/`, moved verbatim. The only
  code changes were the renames needed to share state (`follower` → `school.follower`) and small
  entry points such as `buildFloor()` and `drawStones(c)`.
- **`CONFIG`** in `pond/core.js` holds the tunable numbers:

  | Key | What |
  |-----|------|
  | `fishMin`, `fishMax` | Fish count range (count = screen area / 100,000, clamped) |
  | `causticAlpha` | Strength of the caustic light |
  | `maxRipples` | Ripples kept alive before the oldest is dropped (90; was 46 before rain) |
  | `rain.dryMin/dryMax`, `rain.wetMin/wetMax` | Dry spell and shower lengths, seconds |
  | `rain.startChance` | Chance a visit starts in rain |
  | `rain.rampUp/rampDown` | Seconds to fade rain in and out |
  | `rain.dropsPerSec` | Drops per second at a 1536×864 screen (scaled by area, up to 1.6×) |
  | `rain.dimCaustics`, `rain.dimLight` | How much full rain dims the caustics and the light sheet |
  | `wake.spacing`, `wake.maxPerFrame` | Pixels between wake rings; cap per frame |
  | `wake.str/maxR/speed/rings/gap` | Look of each wake ring (pixel values are scaled by screen size) |
- **More ripples.** The ripple cap rose from 46 to 90 so rain does not evict tap ripples.
- **Food stays inside the bank.** Fish nudging pellets could push them past the edge, out of reach,
  and every koi then knotted at the edge until the food expired (up to 30 s). Pellets are now kept
  8 px inside the edges, the same margin they are scattered with.
- **`?debug`** (see below).

## Files

| File | What |
|------|------|
| `index.html` | Markup, CSS, and the personal-layer script (caption, JH button, bio) |
| `pond/` | The koi pond, as native ES modules (table below) |
| `me.png` | The photo in the JH disc and the bio |
| `CNAME` | GitHub Pages custom domain |

### `pond/`

| Module | What it owns |
|--------|--------------|
| `core.js` | Helpers (`clamp`, `mix`, `rngf`…), palette `C`, `CONFIG`, the canvas, and the shared view state `W H DPR S M T calm covered` with their setters |
| `floor.js` | Stones, pond floor, caustics (GPU shader and CPU fallback); `buildFloor`, `stepCaustics`, `drawFloor/Caustics/Stones` |
| `koi.js` | The fish: patterns, steering (`updateFish`), pose, drawing; `school` (the follower) |
| `surface.js` | Lily pads and lotus, maple leaves, water striders, dragonfly, ripples, pellets; `tapWater`, `feed` |
| `input.js` | Pointer and keyboard: tap, double-tap, hold to feed, drag wakes, the follow-the-pointer fish, the readout |
| `sound.js` | Web Audio: the water bed, plips, the rain hiss, the sound button |
| `main.js` | Entry point: `update`, `render`, `frame`, `resize`, shadows, page listeners, the `?debug` loader |
| `rain.js` | The rain schedule, drops, the rain button; `rainLevel()` for dimming |
| `intro.js` | The first-visit intro card |
| `debug.js` | The `?debug` readout (loaded only when asked for) |

Each module starts with a two-line rule: never call an imported function or read an imported
mutable binding at the top level, only inside functions (the modules import each other in cycles).

### Adding a new animal

1. Create `pond/<animal>.js` with the standard header, exporting `build<Animal>()`,
   `update<Animal>(dt)` and `draw<Animal>()` (draw with `ctx` from `core.js`).
2. In `pond/main.js`, import them and call `build…` in `resize()` next to `buildStriders()`,
   `update…` in `update()`, and `draw…` in `render()` at the right depth (under the surface pass
   for things below the water, after `drawPellets()` for things on it).
3. If it needs to react to taps or food, read `ripples` / `pellets` from `surface.js`.

### `?debug`

Open the site with `?debug` (e.g. `josepharari.com/?debug`). A panel at the top shows fps, pellet
counts (and how many are off screen or on a stone), the follower, what each fish is doing, and the
pointer. Press **D** to log a JSON snapshot of the whole state to the console.
`window.__pond` exposes `fish`, `pellets`, `ripples`, `school` and `ptr`.

## Editing the bio

The bio is plain HTML in the `<section class="bio">` block near the bottom of `index.html`.
The personal-layer CSS is under the `the personal layer` comment, and its JS is the inline
`<script>` block.

## Running locally

```bash
python -m http.server 8766
```

Then open http://localhost:8766. Opening `index.html` as a file does not work: browsers do not load
ES modules from `file://`.

## History

Until November 2026 this repo held a GitHub-repo card index (`app.js`, `styles.css`, `screens/`).
Its last, curated version (with `headless`/`runtimeNote` entries, the Automations category and
`EXCLUDED_REPOS`) is commit `f30a9a0`, if it's ever wanted back at `/apps`.
