# CLAUDE.md — homepage

Personal homepage for josepharari.com, served by GitHub Pages from `main` (repo
`josephararil/josephararil.github.io`). Merging to `main` deploys.

- The whole site is `index.html`. No build step, no dependencies, no external requests.
- The first `<script>` block is the koi pond simulation from Claude Fable 5.2's "Koi Pond, Noon".
  Keep it byte-for-byte as it is unless the task is to change the pond itself.
- The personal layer (caption, JH button, veil, bio) lives in: the CSS after the
  `the personal layer` comment, the markup for `#me`, `#veil`, `#bio`, `.depth`, and the second
  `<script>` block.
- Desktop reveals the bio by scrolling (`html.scrolly`). Touch devices (`html.touch`) never scroll,
  because scrolling would fight tap and hold gestures on the pond. Test both:
  in the browser pane use the mobile preset, which emulates a coarse pointer.
- Visual language: Georgia italic, ink `#14323A` at 70%, the pond palette in `:root`. Light only,
  by design. Do not add a credit line (owner's call).
- Preview: `python -m http.server 8766` from the repo root.
