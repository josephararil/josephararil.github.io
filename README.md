# josepharari.com — homepage

The personal homepage at [josepharari.com](https://josepharari.com): a koi pond seen from above at
noon, with a short bio just beneath the surface.

## What it is

A single self-contained `index.html` (no build, no dependencies). The pond is the "Koi Pond, Noon"
study written by Claude Fable 5.2 (from the MiaAI-Lab collection of Fable 5.2 HTML pages), used
with its simulation untouched. On top of it sits a thin personal layer:

- **Signature caption.** The vertical caption in the bottom-right corner reads
  "Joseph Harari · koi pond, noon." Clicking it opens the bio.
- **JH button**, top-left, mirroring the sound button top-right, with "a little about me" beside it.
- **The bio.** It surfaces through a white glare, the same effect the page opens with.
  - Desktop: the page scrolls one screen. The pond stays fixed and scroll position drives the reveal.
  - Touch devices (`(hover: none) and (pointer: coarse)`): no scrolling, because a vertical swipe
    would fight tap-for-ripple and hold-to-feed. The JH button plays the same reveal as a tween.
  - Close it with "back to the pond", a click on the veil, Escape, or by scrolling back up.

## Files

| File | What |
|------|------|
| `index.html` | The whole site |
| `CNAME` | GitHub Pages custom domain |

## Editing the bio

The bio is plain HTML in the `<section class="bio">` block near the bottom of `index.html`.
The personal-layer CSS is under the `the personal layer` comment, and its JS is the second
`<script>` block. Leave the first `<script>` (the pond simulation) alone unless you mean to
change the pond.

## Running locally

```bash
python -m http.server 8766
```

Then open http://localhost:8766.

## History

Until November 2026 this repo held a GitHub-repo card index (`app.js`, `styles.css`, `screens/`).
It is in the git history if it's ever wanted at `/apps`.
