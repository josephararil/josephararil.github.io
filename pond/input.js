// Part of the koi pond. Moved verbatim from the original single script; see README.
// Rule: never call an imported function or read an imported mutable binding at top level, only inside functions.

import { TAU, rnd, clamp, cv, ctx, W, H, S } from './core.js';
import { onStone } from './floor.js';
import { fish, school, VARIETY, WORDS } from './koi.js';
import { pellets, tapWater, feed } from './surface.js';

/* ---------- pointer ---------- */
var ptr = { x: -999, y: -999, inside: false, mouse: false, down: false, dx: 0, dy: 0, dt: 0, held: false, spd: 0, slowT: 0, lx: 0, ly: 0, moved: 0, id: -1 };
var lastTap = { t: -9, x: 0, y: 0 }, HOLD = 0.46;
var hintTap = document.getElementById('hintTap'), hintHold = document.getElementById('hintHold'), hintDot = document.getElementById('hintDot');
var readout = document.getElementById('readout'), readFish = null, readHold = 0;
function usedTap() { hintTap.classList.add('used'); hintDot.classList.add('used'); }
function usedHold() { hintHold.classList.add('used'); hintDot.classList.add('used'); }
function doFeed(x, y) { if (feed(x, y)) usedHold(); }
function doTap(x, y) { if (tapWater(x, y)) usedTap(); }

/* the listeners that used to attach at load; main.js calls this once */
function initInput() {
  cv.addEventListener('pointerdown', function (e) {
    if (e.button && e.button !== 0) return;
    ptr.x = e.clientX; ptr.y = e.clientY; ptr.inside = true; ptr.mouse = e.pointerType === 'mouse';
    ptr.down = true; ptr.dx = ptr.x; ptr.dy = ptr.y; ptr.dt = 0; ptr.held = false; ptr.id = e.pointerId;
    try { cv.setPointerCapture(e.pointerId); } catch (err) { /* not capturable */ }
  });
  cv.addEventListener('pointermove', function (e) {
    ptr.x = e.clientX; ptr.y = e.clientY; ptr.inside = true; ptr.mouse = e.pointerType === 'mouse';
    ptr.moved += Math.hypot(ptr.x - ptr.lx, ptr.y - ptr.ly); ptr.lx = ptr.x; ptr.ly = ptr.y;
  });
  cv.addEventListener('pointerup', function (e) { release(e, false); });
  cv.addEventListener('pointercancel', function (e) { release(e, true); });
  cv.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') ptr.inside = false; });
  cv.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  window.addEventListener('blur', function () { ptr.down = false; });
  cv.addEventListener('keydown', function (e) {
    var x = W * (0.3 + rnd() * 0.4), y = H * (0.3 + rnd() * 0.4);
    if (e.key === 'Enter') { doTap(x, y); e.preventDefault(); }
    else if (e.key === ' ' || e.key === 'f' || e.key === 'F') { doFeed(x, y); e.preventDefault(); }
  });
}
function release(e, cancelled) {
  if (!ptr.down) return;
  ptr.down = false;
  if (!ptr.mouse) { readHold = 4; }
  if (cancelled || ptr.held) return;
  if (Math.hypot(e.clientX - ptr.dx, e.clientY - ptr.dy) > 16 * Math.max(1, S)) return;
  var now = performance.now() / 1000;
  if (now - lastTap.t < 0.34 && Math.hypot(e.clientX - lastTap.x, e.clientY - lastTap.y) < 44) {
    doFeed(e.clientX, e.clientY); lastTap.t = -9;
  } else {
    doTap(e.clientX, e.clientY);
    lastTap.t = now; lastTap.x = e.clientX; lastTap.y = e.clientY;
  }
}

function updatePointer(dt) {
  var inst = ptr.moved / Math.max(dt, 0.001); ptr.moved = 0;
  ptr.spd += (inst - ptr.spd) * Math.min(1, dt * 6);
  if (ptr.down && !ptr.held) {
    if (Math.hypot(ptr.x - ptr.dx, ptr.y - ptr.dy) > 12 * Math.max(1, S)) ptr.dt = -99;
    else ptr.dt += dt;
    if (ptr.dt >= HOLD) { ptr.held = true; doFeed(ptr.dx, ptr.dy); }
  }
  /* a slow pointer draws the nearest curious fish */
  var active = ptr.inside && (ptr.mouse || ptr.down) && !pellets.length && !onStone(ptr.x, ptr.y);
  if (active && ptr.spd > 4 && ptr.spd < 190) ptr.slowT += dt;
  else if (ptr.spd >= 190 || !active) ptr.slowT = 0;
  if (school.follower) {
    school.followT -= dt;
    if (school.followT <= 0 || ptr.spd > 620 || !active || school.follower.fleeT > 0) school.follower = null;
  } else if (ptr.slowT > 0.55) {
    var best = null, bd = 330 * S;
    for (var i = 0; i < fish.length; i++) {
      var f = fish[i], d = Math.hypot(f.x - ptr.x, f.y - ptr.y);
      if (d < bd && f.fleeT <= 0 && f.enter <= 0) { bd = d; best = f; }
    }
    if (best) { school.follower = best; school.followT = 9 + rnd() * 5; }
    ptr.slowT = 0;
  }
  /* readout: the fish nearest the cursor */
  var near = null;
  if (readHold > 0) readHold -= dt;
  if (ptr.inside && (ptr.mouse || ptr.down || readHold > 0)) {
    var nd = 150 * S + 40;
    for (var k = 0; k < fish.length; k++) {
      var g = fish[k], gd = Math.hypot(g.nodes[8] - ptr.x, g.nodes[9] - ptr.y);
      if (gd < nd) { nd = gd; near = g; }
    }
  }
  if (near !== readFish) {
    readFish = near;
    if (near) {
      readout.textContent = VARIETY[near.variety] + ', about ' + WORDS[clamp(near.age, 1, 34)] + (near.age === 1 ? ' year old' : ' years old');
      readout.classList.add('on');
    } else readout.classList.remove('on');
  }
}
function drawPointer() {
  if (!ptr.inside || !ptr.mouse && !ptr.down) return;
  var c = ctx, x = ptr.x, y = ptr.y, r = 7;
  if (ptr.mouse) {
    c.lineWidth = 1.1;
    c.strokeStyle = 'rgba(20,50,58,.3)';
    c.beginPath(); c.arc(x + 0.7, y + 1, r + 0.8, 0, TAU); c.stroke();
    c.strokeStyle = 'rgba(255,255,255,.9)';
    c.beginPath(); c.arc(x, y, r, 0, TAU); c.stroke();
    c.fillStyle = 'rgba(20,50,58,.75)';
    c.beginPath(); c.arc(x, y, 1.3, 0, TAU); c.fill();
  }
  if (ptr.down && !ptr.held && ptr.dt > 0.12) {
    var k = clamp((ptr.dt - 0.12) / (HOLD - 0.12), 0, 1), e = 1 - Math.pow(1 - k, 2), R = 18 + (ptr.mouse ? 0 : 14);
    c.lineCap = 'round'; c.lineWidth = 1.6;
    c.strokeStyle = 'rgba(20,50,58,.22)';
    c.beginPath(); c.arc(ptr.dx, ptr.dy, R, 0, TAU); c.stroke();
    c.strokeStyle = 'rgba(255,255,255,.95)';
    c.beginPath(); c.arc(ptr.dx, ptr.dy, R, -Math.PI / 2, -Math.PI / 2 + TAU * e); c.stroke();
    c.lineCap = 'butt';
  }
}

export { ptr, initInput, updatePointer, drawPointer };
