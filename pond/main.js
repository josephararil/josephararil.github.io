// Part of the koi pond. Moved verbatim from the original single script; see README.
// Rule: never call an imported function or read an imported mutable binding at top level, only inside functions.
// main.js is the entry point and nothing imports it, so its startup at the bottom runs after every
// other module has finished loading.

import { TAU, clamp, C, cv, ctx, mq, W, H, DPR, S, T, calm, covered, setView, advanceTime, setCalm, setCovered } from './core.js';
import { depthAt, buildFloor, stepCaustics, refreshCausticsStill, drawFloor, drawCaustics, drawStones } from './floor.js';
import { NSEG, fish, makeFish, updateFish, poseFish, drawFish, drawFishShadow } from './koi.js';
import { pads, leaves, striders, fly, pellets, ripples, buildPads, updatePads, padPath, drawPad, buildLeaves, leafPath, drawLeaf, updateLeaves, buildStriders, updateStriders, striderFoot, drawStrider, updateFly, flyShape, updateSurface, drawRipples, drawPellets } from './surface.js';
import { initInput, updatePointer, drawPointer } from './input.js';
import { initSound, updateSound } from './sound.js';

var last = 0, raf = 0, frameN = 0, coverSkip = 0;
var shCv = document.createElement('canvas');
var shx = shCv.getContext('2d');
var SHK = 0.25;

/* ---------- frame ---------- */
function update(dt) {
  var fdt = dt * (calm ? 0.333 : 1), i;
  updatePointer(dt);
  for (i = 0; i < fish.length; i++) updateFish(fish[i], fdt);
  for (i = 0; i < fish.length; i++) poseFish(fish[i]);
  updatePads(dt); updateLeaves(dt); updateStriders(dt); updateFly(dt); updateSurface(dt);
  updateSound(dt);
}

function render() {
  var c = ctx, i, f;
  c.setTransform(DPR, 0, 0, DPR, 0, 0);
  c.globalAlpha = 1; c.globalCompositeOperation = 'source-over';
  drawFloor(c);

  /* shadows on the pond floor: low-res layer, so they come out soft */
  shx.setTransform(1, 0, 0, 1, 0, 0);
  shx.clearRect(0, 0, shCv.width, shCv.height);
  shx.fillStyle = C.deep;
  for (i = 0; i < fish.length; i++) {
    f = fish[i];
    var dep = 0.45 + 0.55 * depthAt(clamp(f.x, 0, W), clamp(f.y, 0, H));
    var ox = (7 + f.B * 0.09) * dep + 3 * S, oy = (11 + f.B * 0.15) * dep + 4 * S;
    shx.setTransform(SHK, 0, 0, SHK, ox * SHK, oy * SHK);
    shx.globalAlpha = 0.95 - dep * 0.3;
    drawFishShadow(shx, f);
  }
  shx.globalAlpha = 0.8;
  for (i = 0; i < pads.length; i++) {
    var p = pads[i], po = 1 + p.bob * 0.1;
    shx.setTransform(SHK, 0, 0, SHK, 15 * S * po * SHK, 23 * S * po * SHK);
    padPath(shx, p, p.r); shx.fill();
  }
  for (i = 0; i < leaves.length; i++) {
    shx.setTransform(SHK, 0, 0, SHK, 13 * S * SHK, 20 * S * SHK);
    leafPath(shx, leaves[i]); shx.fill();
  }
  shx.globalAlpha = 0.6;
  var ssc = 7.5 * Math.max(0.8, S);
  for (i = 0; i < striders.length; i++) {
    shx.setTransform(SHK, 0, 0, SHK, 12 * S * SHK, 19 * S * SHK);
    for (var k = 0; k < 4; k++) { var ft = striderFoot(striders[i], k, ssc); shx.beginPath(); shx.arc(ft[0], ft[1], ssc * 0.42, 0, TAU); shx.fill(); }
  }
  c.globalAlpha = 0.36;
  c.drawImage(shCv, 0, 0, W, H);
  c.globalAlpha = 1;

  for (i = 0; i < fish.length; i++) drawFish(fish[i]);

  /* caustic light plays over floor and backs alike */
  drawCaustics(c, 0.58);

  /* a broad sheet of noon light on the surface */
  var sg = c.createLinearGradient(0, 0, W * 0.75, H);
  sg.addColorStop(0, 'rgba(255,255,255,.2)'); sg.addColorStop(0.45, 'rgba(255,255,255,.03)'); sg.addColorStop(1, 'rgba(255,255,255,0)');
  c.fillStyle = sg; c.fillRect(0, 0, W, H);

  drawRipples();
  for (i = 0; i < leaves.length; i++) drawLeaf(leaves[i]);
  for (i = 0; i < pads.length; i++) drawPad(pads[i]);
  for (i = 0; i < striders.length; i++) drawStrider(striders[i]);
  drawPellets();
  drawStones(c);

  if (fly) {
    var fs = 1.7 * Math.max(0.72, S);
    c.globalAlpha = 0.5;
    flyShape(c, fly.x + 58 * S, fly.y + 88 * S, fly.a, fs * 1.08, true);
    c.globalAlpha = 1;
    flyShape(c, fly.x, fly.y, fly.a, fs, false);
  }
  drawPointer();

  /* white glare, eyes adjusting to the sun */
  var gl = calm ? 1.2 : 3.6;
  if (T < gl) {
    var g = Math.pow(1 - T / gl, 2.3);
    c.fillStyle = 'rgba(255,255,255,' + g + ')';
    c.fillRect(0, 0, W, H);
    c.globalCompositeOperation = 'lighter';
    c.fillStyle = 'rgba(255,250,232,' + (g * 0.55) + ')';
    c.fillRect(0, 0, W, H);
    c.globalCompositeOperation = 'source-over';
  }
}

function frame(now) {
  raf = requestAnimationFrame(frame);
  if (covered && (++coverSkip & 1)) return;
  var dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  if (dt <= 0) return;
  advanceTime(dt); frameN++;
  update(dt);
  stepCaustics(frameN);
  render();
}

function resize() {
  var first = W === 0, ow = W, oh = H;
  setView(Math.max(280, window.innerWidth), Math.max(280, window.innerHeight), Math.min(2, window.devicePixelRatio || 1));
  cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
  shCv.width = Math.ceil(W * SHK); shCv.height = Math.ceil(H * SHK);
  buildFloor();
  buildPads(); buildLeaves(); buildStriders();
  if (first) {
    var n = clamp(Math.round(W * H / 100000), 9, 13);
    for (var i = 0; i < n; i++) fish.push(makeFish(i, n));
    for (i = 0; i < fish.length; i++) poseFish(fish[i]);
  } else {
    for (var k = 0; k < fish.length; k++) {
      var f = fish[k], nx = f.x / ow * W, ny = f.y / oh * H, dx = nx - f.x, dy = ny - f.y;
      f.x = nx; f.y = ny;
      for (var j = 0; j < NSEG; j++) { f.nodes[j * 2] += dx; f.nodes[j * 2 + 1] += dy; }
    }
    pellets.length = 0; ripples.length = 0;
  }
}

var rz = 0;
window.addEventListener('resize', function () {
  clearTimeout(rz);
  rz = setTimeout(function () { resize(); if (!raf) { update(0.001); render(); } }, 90);
});
document.addEventListener('visibilitychange', function () {
  if (document.hidden) { cancelAnimationFrame(raf); raf = 0; }
  else if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); }
});
document.addEventListener('pond:cover', function (e) { setCovered(!!e.detail.covered); });
function motionChanged() { setCalm(mq.matches); if (calm) refreshCausticsStill(); }
if (mq.addEventListener) mq.addEventListener('change', motionChanged);
else if (mq.addListener) mq.addListener(motionChanged);

initInput(); initSound(); resize();
last = performance.now();
raf = requestAnimationFrame(frame);
