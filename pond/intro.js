// Part of the koi pond. The first-visit card that explains ripples, food, wakes and rain.
// Rule: never call an imported function or read an imported mutable binding at top level, only inside functions.

import { calm, covered } from './core.js';

var KEY = 'pond.introSeen.v1';
var el = null, ok = null, cv = null, state = 'idle';   /* idle → waiting (timer fired under the bio) → shown → done */

function seen() {
  try { return localStorage.getItem(KEY) === '1'; } catch (e) { return false; }
}
function remember() {
  try { localStorage.setItem(KEY, '1'); } catch (e) { /* storage blocked: the card shows again next visit */ }
}

function show() {
  state = 'shown';
  el.hidden = false;
  void el.offsetWidth;   /* start the transition from the hidden state */
  el.classList.add('on');
  ok.focus({ preventScroll: true });
  ok.addEventListener('click', onOk);
  document.addEventListener('keydown', onKey);
  cv.addEventListener('pointerdown', onTap);
}

/* refocus: false when the bio is opening, so the card does not take focus from it */
function dismiss(refocus) {
  if (state !== 'shown') return;
  state = 'done';
  remember();
  ok.removeEventListener('click', onOk);
  document.removeEventListener('keydown', onKey);
  cv.removeEventListener('pointerdown', onTap);
  el.classList.remove('on');
  setTimeout(function () { el.hidden = true; }, 700);
  if (refocus) cv.focus({ preventScroll: true });
}
function onOk() { dismiss(true); }
function onKey(e) { if (e.key === 'Escape') dismiss(true); }
function onTap() { dismiss(true); }   /* the tap still makes its ripple: the pond has its own listener */

function initIntro() {
  if (seen()) return;
  el = document.getElementById('intro');
  ok = document.getElementById('introOk');
  cv = document.getElementById('pond');
  setTimeout(function () {
    if (state !== 'idle') return;
    if (covered) state = 'waiting'; else show();
  }, calm ? 1200 : 3800);
  document.addEventListener('pond:cover', function (e) {
    if (e.detail.covered) dismiss(false);
    else if (state === 'waiting') show();
  });
}

export { initIntro };
