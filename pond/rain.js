// Part of the koi pond. Rain: a random shower about 10% of the time, and the rain button.
// Rule: never call an imported function or read an imported mutable binding at top level, only inside functions.

import { CONFIG, W, H, S, calm } from './core.js';
import { onStone } from './floor.js';
import { pads, addRipple } from './surface.js';
import { plip, isSoundOn, setRainLevel } from './sound.js';

/* Math.random, never the seeded rnd: rnd would start the rain at the same moment on every visit */
var raining = false, manual = false, timer = 0, level = 0, acc = 0;
var btn = null, lbl = null;

function draw(a, b) { return a + Math.random() * (b - a); }

function sync() {
  btn.setAttribute('aria-pressed', raining ? 'true' : 'false');
  lbl.textContent = raining ? 'rain, on' : 'rain, off';
}

function initRain() {
  var R = CONFIG.rain;
  raining = Math.random() < R.startChance;
  /* a visitor lands part-way through a dry spell, or at the start of a shower already falling */
  timer = raining ? draw(R.wetMin, R.wetMax) : draw(R.dryMin, R.dryMax) * Math.random();
  if (raining) level = 1;
  btn = document.getElementById('rain');
  lbl = document.getElementById('rainLbl');
  /* manual on rains until pressed again; manual off restarts the schedule with a fresh dry spell */
  btn.addEventListener('click', function () {
    if (raining) { raining = false; manual = false; timer = draw(R.dryMin, R.dryMax); }
    else { raining = true; manual = true; }
    sync();
  });
  sync();
}

function updateRain(dt) {
  var R = CONFIG.rain;
  if (!manual) {
    timer -= dt;
    if (timer <= 0) {
      raining = !raining;
      timer = raining ? draw(R.wetMin, R.wetMax) : draw(R.dryMin, R.dryMax);
      sync();
    }
  }
  if (raining) level = Math.min(1, level + dt / R.rampUp);
  else level = Math.max(0, level - dt / R.rampDown);
  acc += R.dropsPerSec * level * Math.min(1.6, W * H / (1536 * 864)) * (calm ? 0.5 : 1) * dt;
  while (acc >= 1) {
    acc -= 1;
    var x = Math.random() * W, y = Math.random() * H, dry = onStone(x, y);
    for (var i = 0; !dry && i < pads.length; i++) if (Math.hypot(x - pads[i].x, y - pads[i].y) < pads[i].r) dry = true;
    if (dry) continue;
    addRipple(x, y, 0.32 + Math.random() * 0.25, (12 + Math.random() * 16) * S, true);
    if (isSoundOn() && Math.random() < 0.3) plip(0.008 + Math.random() * 0.014, 1800 + Math.random() * 1600);
  }
  setRainLevel(level);
}

function rainLevel() { return level; }

export { initRain, updateRain, rainLevel };
