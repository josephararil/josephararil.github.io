// Part of the koi pond. Moved verbatim from the original single script; see README.
// Rule: never call an imported function or read an imported mutable binding at top level, only inside functions.

import { TAU, rngf, rnd, lerp, angd, mix, C, CONFIG, ctx, W, H, S, T, calm } from './core.js';
import { stones, onStone } from './floor.js';
import { fish, school } from './koi.js';
import { plip } from './sound.js';

/* ---------- lily pads, lotus ---------- */
var pads = [];
function buildPads() {
  var r = rngf(313);
  pads = [];
  var clusters = W < 620
    ? [[0.25, 0.34, 4, 1], [0.74, 0.66, 4, 0], [0.22, 0.82, 2, 0]]
    : [[0.19, 0.66, 5, 1], [0.69, 0.25, 4, 0], [0.8, 0.6, 3, 2]];
  clusters.forEach(function (cl) {
    var ax = cl[0] * W, ay = cl[1] * H, base = (44 + r() * 12) * S, start = r() * TAU;
    for (var i = 0; i < cl[2]; i++) {
      var rad = i === 0 ? base : base * (0.48 + r() * 0.42);
      var a = start + i * 1.75 + r() * 0.5, d = i === 0 ? 0 : base + rad * (0.72 + r() * 0.3);
      var p = {
        ax: ax + Math.cos(a) * d, ay: ay + Math.sin(a) * d, r: rad, x: 0, y: 0,
        notch: r() * TAU, rot: 0, ph1: r() * TAU, ph2: r() * TAU, kind: r() > 0.5 ? 0 : 1,
        bob: 0, bobV: 0, ox: 0, oy: 0, vx: 0, vy: 0, lastRip: -1, flower: 0, seed: Math.floor(r() * 1e5),
        veins: 9 + Math.floor(r() * 5)
      };
      if (cl[3] === 1 && i === 1) p.flower = 1;
      if (cl[3] === 2 && i === 0) p.flower = 0.78;
      p.x = p.ax; p.y = p.ay;
      pads.push(p);
    }
  });
}
function updatePads(dt) {
  for (var i = 0; i < pads.length; i++) {
    var p = pads[i], mt = calm ? 0.35 : 1;
    p.vx += (-p.ox * 1.4 - p.vx * 1.1) * dt; p.vy += (-p.oy * 1.4 - p.vy * 1.1) * dt;
    p.ox += p.vx * dt; p.oy += p.vy * dt;
    p.bobV += (-p.bob * 38 - p.bobV * 3.2) * dt; p.bob += p.bobV * dt;
    p.x = p.ax + Math.sin(T * 0.11 * mt + p.ph1) * 9 * S + p.ox;
    p.y = p.ay + Math.cos(T * 0.09 * mt + p.ph2) * 7 * S + p.oy;
    p.rot = Math.sin(T * 0.07 * mt + p.ph2) * 0.22 + p.ox * 0.01;
  }
}
function padPath(c, p, rad) {
  var n0 = p.notch + p.rot;
  c.beginPath();
  c.moveTo(p.x, p.y);
  c.arc(p.x, p.y, rad, n0 + 0.16, n0 + TAU - 0.16);
  c.closePath();
}
function drawPad(p) {
  var c = ctx, rad = p.r * (1 + p.bob * 0.05), n0 = p.notch + p.rot, i;
  /* ring pushed out by the bobbing pad */
  var ab = Math.min(1, Math.abs(p.bob) * 1.4 + Math.abs(p.bobV) * 0.12);
  if (ab > 0.02) {
    c.strokeStyle = 'rgba(255,255,255,' + (0.42 * ab) + ')'; c.lineWidth = 1.2;
    c.beginPath(); c.arc(p.x - 0.8, p.y - 1, rad + 4 + ab * 5, 0, TAU); c.stroke();
    c.strokeStyle = 'rgba(20,50,58,' + (0.16 * ab) + ')';
    c.beginPath(); c.arc(p.x + 1, p.y + 1.4, rad + 6 + ab * 5, 0, TAU); c.stroke();
  }
  padPath(c, p, rad);
  var g = c.createRadialGradient(p.x - rad * 0.25, p.y - rad * 0.3, rad * 0.05, p.x, p.y, rad);
  if (p.kind) { g.addColorStop(0, C.padB); g.addColorStop(0.7, mix(C.padB, C.padA, 0.55)); g.addColorStop(1, C.padA); }
  else { g.addColorStop(0, mix(C.padB, C.padA, 0.4)); g.addColorStop(0.75, C.padA); g.addColorStop(1, mix(C.padA, C.deep, 0.22)); }
  c.fillStyle = g; c.fill();
  c.save(); c.clip();
  c.strokeStyle = 'rgba(191,227,208,.34)'; c.lineWidth = Math.max(0.6, rad * 0.018);
  for (i = 0; i < p.veins; i++) {
    var a = n0 + 0.3 + i / (p.veins - 1) * (TAU - 0.6);
    c.beginPath(); c.moveTo(p.x, p.y);
    c.quadraticCurveTo(p.x + Math.cos(a + 0.08) * rad * 0.5, p.y + Math.sin(a + 0.08) * rad * 0.5, p.x + Math.cos(a) * rad * 0.94, p.y + Math.sin(a) * rad * 0.94);
    c.stroke();
  }
  c.lineWidth = rad * 0.1; c.strokeStyle = 'rgba(20,50,58,.14)';
  c.beginPath(); c.arc(p.x - 1, p.y - 1.5, rad, 0, TAU); c.stroke();
  c.lineWidth = rad * 0.05; c.strokeStyle = 'rgba(255,255,255,.3)';
  c.beginPath(); c.arc(p.x + 1, p.y + 1.5, rad, n0 + Math.PI * 0.9 - p.rot - p.notch, n0 + Math.PI * 1.9 - p.rot - p.notch); c.stroke();
  c.restore();
  /* a bead of water */
  var r = rngf(p.seed);
  for (i = 0; i < 2; i++) {
    var da = n0 + 1 + r() * 4, dd = rad * (0.25 + r() * 0.45), dr = Math.max(1.2, rad * (0.03 + r() * 0.035));
    var bx = p.x + Math.cos(da) * dd, by = p.y + Math.sin(da) * dd;
    c.fillStyle = 'rgba(20,50,58,.2)'; c.beginPath(); c.arc(bx + 0.6, by + 0.9, dr, 0, TAU); c.fill();
    c.fillStyle = 'rgba(214,240,226,.8)'; c.beginPath(); c.arc(bx, by, dr, 0, TAU); c.fill();
    c.fillStyle = '#fff'; c.beginPath(); c.arc(bx - dr * 0.3, by - dr * 0.35, dr * 0.4, 0, TAU); c.fill();
  }
  if (p.flower) drawLotus(p, rad);
}
function petal(c, x, y, a, len, wid) {
  var dx = Math.cos(a), dy = Math.sin(a), nx = -dy, ny = dx;
  c.beginPath();
  c.moveTo(x, y);
  c.quadraticCurveTo(x + dx * len * 0.5 + nx * wid, y + dy * len * 0.5 + ny * wid, x + dx * len, y + dy * len);
  c.quadraticCurveTo(x + dx * len * 0.5 - nx * wid, y + dy * len * 0.5 - ny * wid, x, y);
  c.closePath();
}
function drawLotus(p, rad) {
  var c = ctx, R = rad * 0.6 * p.flower, x = p.x + Math.cos(p.notch + p.rot + 2.6) * rad * 0.2, y = p.y + Math.sin(p.notch + p.rot + 2.6) * rad * 0.2;
  var breathe = 1 + Math.sin(T * 0.5 + p.ph1) * 0.02 + p.bob * 0.04, i, a;
  c.fillStyle = 'rgba(20,50,58,.2)';
  c.beginPath(); c.arc(x + R * 0.12, y + R * 0.2, R * 0.8, 0, TAU); c.fill();
  var layers = [[9, 1, 0.3, 0, 0], [8, 0.8, 0.27, 0.35, 0.3], [6, 0.58, 0.22, 0.2, 0.62], [5, 0.36, 0.16, 0.5, 0.82]];
  for (var l = 0; l < layers.length; l++) {
    var L = layers[l];
    for (i = 0; i < L[0]; i++) {
      a = p.rot + L[3] + i / L[0] * TAU;
      var len = R * L[1] * breathe, tipx = x + Math.cos(a) * len, tipy = y + Math.sin(a) * len;
      var g = c.createLinearGradient(x, y, tipx, tipy);
      g.addColorStop(0, mix(C.lotus, C.white, 0.75 + L[4] * 0.2));
      g.addColorStop(0.55, mix(C.lotus, C.white, 0.35 + L[4] * 0.4));
      g.addColorStop(1, mix(C.lotus, C.orange, 0.1 - L[4] * 0.1));
      petal(c, x, y, a, len, R * L[2]);
      c.fillStyle = g; c.fill();
      c.strokeStyle = 'rgba(190,110,130,.26)'; c.lineWidth = 0.6; c.stroke();
    }
  }
  c.fillStyle = C.yolk; c.beginPath(); c.arc(x, y, R * 0.15, 0, TAU); c.fill();
  c.fillStyle = mix(C.yolk, C.orange, 0.55);
  for (i = 0; i < 7; i++) { a = i / 7 * TAU + p.rot; c.beginPath(); c.arc(x + Math.cos(a) * R * 0.09, y + Math.sin(a) * R * 0.09, Math.max(0.6, R * 0.022), 0, TAU); c.fill(); }
}

/* ---------- fallen maple leaves ---------- */
var leaves = [];
var LEAF = (function () {
  var lobes = [[-2.15, 0.5], [-1.12, 0.84], [0, 1], [1.12, 0.84], [2.15, 0.5]], p = [];
  for (var i = 0; i < 5; i++) {
    var a = lobes[i][0], l = lobes[i][1];
    if (i === 0) p.push([a - 0.75, 0.2]);
    p.push([a - 0.46, l * 0.5], [a - 0.3, l * 0.56], [a - 0.3, l * 0.74], [a - 0.14, l * 0.76], [a, l], [a + 0.14, l * 0.76], [a + 0.3, l * 0.74], [a + 0.3, l * 0.56], [a + 0.46, l * 0.5]);
    if (i < 4) p.push([(a + lobes[i + 1][0]) / 2, 0.3]); else p.push([a + 0.75, 0.2]);
  }
  return { pts: p, lobes: lobes };
})();
function buildLeaves() {
  var r = rngf(58);
  leaves = [];
  var spots = W < 620 ? [[0.7, 0.3], [0.42, 0.6], [0.8, 0.88]] : [[0.43, 0.2], [0.5, 0.78], [0.9, 0.42], [0.33, 0.44]];
  var cols = [C.orange, mix(C.orange, C.yolk, 0.7), mix(C.orange, C.black, 0.22), mix(C.yolk, C.orange, 0.35)];
  spots.forEach(function (s, i) {
    leaves.push({ x: s[0] * W, y: s[1] * H, a: r() * TAU, va: (r() > 0.5 ? 1 : -1) * (0.05 + r() * 0.07), vx: (r() - 0.5) * 3, vy: (r() - 0.5) * 3, r: (21 + r() * 10) * S, col: cols[i % 4], lastRip: -1, bob: 0 });
  });
}
function leafPath(c, lf) {
  c.beginPath();
  for (var i = 0; i < LEAF.pts.length; i++) {
    var a = LEAF.pts[i][0] + lf.a, d = LEAF.pts[i][1] * lf.r;
    var x = lf.x + Math.cos(a) * d, y = lf.y + Math.sin(a) * d;
    if (i) c.lineTo(x, y); else c.moveTo(x, y);
  }
  c.closePath();
}
function drawLeaf(lf) {
  var c = ctx, i;
  leafPath(c, lf);
  c.fillStyle = lf.col; c.fill();
  c.strokeStyle = 'rgba(20,50,58,.18)'; c.lineWidth = 0.7; c.stroke();
  c.strokeStyle = 'rgba(255,240,214,.5)'; c.lineWidth = 0.7;
  for (i = 0; i < 5; i++) {
    var a = LEAF.lobes[i][0] + lf.a, d = LEAF.lobes[i][1] * lf.r * 0.86;
    c.beginPath(); c.moveTo(lf.x, lf.y); c.lineTo(lf.x + Math.cos(a) * d, lf.y + Math.sin(a) * d); c.stroke();
  }
  c.strokeStyle = mix(C.orange, C.black, 0.45); c.lineWidth = 1;
  c.beginPath(); c.moveTo(lf.x, lf.y);
  c.quadraticCurveTo(lf.x + Math.cos(lf.a + Math.PI + 0.3) * lf.r * 0.3, lf.y + Math.sin(lf.a + Math.PI + 0.3) * lf.r * 0.3, lf.x + Math.cos(lf.a + Math.PI) * lf.r * 0.62, lf.y + Math.sin(lf.a + Math.PI) * lf.r * 0.62);
  c.stroke();
}
function updateLeaves(dt) {
  var mt = calm ? 0.35 : 1;
  for (var i = 0; i < leaves.length; i++) {
    var lf = leaves[i];
    lf.a += lf.va * dt * mt;
    lf.x += lf.vx * dt * mt; lf.y += lf.vy * dt * mt;
    lf.vx += (Math.sin(T * 0.05 + i * 2) * 2.2 - lf.vx) * dt * 0.3;
    lf.vy += (Math.cos(T * 0.04 + i * 3) * 2.2 - lf.vy) * dt * 0.3;
    var m = 70 * S;
    if (lf.x < m) lf.vx += 4 * dt; if (lf.x > W - m) lf.vx -= 4 * dt;
    if (lf.y < m) lf.vy += 4 * dt; if (lf.y > H - m) lf.vy -= 4 * dt;
    for (var k = 0; k < stones.length; k++) {
      var s = stones[k], dx = lf.x - s.x, dy = lf.y - s.y, d = Math.hypot(dx, dy) || 1;
      if (d < s.r + lf.r + 14) { lf.vx += dx / d * 14 * dt; lf.vy += dy / d * 14 * dt; }
    }
  }
}

/* ---------- water striders ---------- */
var striders = [];
function buildStriders() {
  striders = [];
  var r = rngf(72), n = W < 620 ? 2 : 3;
  for (var i = 0; i < n; i++) {
    striders.push({ x: W * (0.25 + r() * 0.5), y: H * (0.2 + r() * 0.6), a: r() * TAU, rest: 1 + r() * 3, dart: 0, fx: 0, fy: 0, tx: 0, ty: 0, k: 0 });
  }
}
function updateStriders(dt) {
  for (var i = 0; i < striders.length; i++) {
    var s = striders[i];
    if (s.dart > 0) {
      s.k = Math.min(1, s.k + dt / s.dart);
      var e = 1 - Math.pow(1 - s.k, 3);
      s.x = lerp(s.fx, s.tx, e); s.y = lerp(s.fy, s.ty, e);
      if (s.k >= 1) { s.dart = 0; s.rest = (calm ? 2.5 : 0.5) + rnd() * 2.6; if (rnd() > 0.6) s.rest *= 0.25; }
    } else {
      s.rest -= dt;
      if (s.rest <= 0) {
        for (var tries = 0; tries < 8; tries++) {
          var a = s.a + (rnd() - 0.5) * 2.2, d = (26 + rnd() * 54) * S;
          var tx = s.x + Math.cos(a) * d, ty = s.y + Math.sin(a) * d, ok = tx > 50 * S && tx < W - 50 * S && ty > 50 * S && ty < H - 50 * S && !onStone(tx, ty);
          for (var p = 0; ok && p < pads.length; p++) if (Math.hypot(tx - pads[p].x, ty - pads[p].y) < pads[p].r + 8) ok = false;
          if (ok) {
            s.a = a; s.fx = s.x; s.fy = s.y; s.tx = tx; s.ty = ty; s.k = 0; s.dart = calm ? 0.7 : 0.26;
            addRipple(s.x, s.y, 0.3, 11 * S, true);
            break;
          }
          s.a += 1.3;
        }
        if (s.dart === 0) s.rest = 0.5;
      }
    }
  }
}
var FEET = [[0.75, 1.05], [0.75, -1.05], [-0.95, 0.85], [-0.95, -0.85]];
function striderFoot(s, i, sc) {
  var ca = Math.cos(s.a), sa = Math.sin(s.a), f = FEET[i];
  return [s.x + (ca * f[0] - sa * f[1]) * sc, s.y + (sa * f[0] + ca * f[1]) * sc];
}
function drawStrider(s) {
  var c = ctx, sc = 7.5 * Math.max(0.8, S), i, ca = Math.cos(s.a), sa = Math.sin(s.a);
  for (i = 0; i < 4; i++) {
    var ft = striderFoot(s, i, sc);
    c.strokeStyle = 'rgba(255,255,255,.6)'; c.lineWidth = 0.9;
    c.beginPath(); c.arc(ft[0] - 0.5, ft[1] - 0.7, sc * 0.26, 0, TAU); c.stroke();
    c.strokeStyle = 'rgba(20,50,58,.3)';
    c.beginPath(); c.arc(ft[0] + 0.5, ft[1] + 0.7, sc * 0.3, 0, TAU); c.stroke();
    c.strokeStyle = 'rgba(27,27,27,.75)'; c.lineWidth = 0.75;
    c.beginPath(); c.moveTo(s.x + ca * (i < 2 ? 0.18 : -0.1) * sc, s.y + sa * (i < 2 ? 0.18 : -0.1) * sc);
    c.lineTo(ft[0], ft[1]); c.stroke();
  }
  c.strokeStyle = C.black; c.lineWidth = Math.max(1.4, sc * 0.2); c.lineCap = 'round';
  c.beginPath(); c.moveTo(s.x - ca * sc * 0.5, s.y - sa * sc * 0.5); c.lineTo(s.x + ca * sc * 0.42, s.y + sa * sc * 0.42); c.stroke();
  c.lineCap = 'butt';
}

/* ---------- dragonfly ---------- */
var fly = null, flyNext = 7;
function launchFly() {
  var side = rnd() > 0.5, y0 = H * (0.15 + rnd() * 0.6), y1 = H * (0.2 + rnd() * 0.6);
  fly = {
    x0: side ? -80 : W + 80, y0: y0, x1: side ? W + 80 : -80, y1: y1,
    cx: W * (0.3 + rnd() * 0.4), cy: H * (rnd() > 0.5 ? 0.05 : 0.95), t: 0, dur: (calm ? 15 : 7) + rnd() * 2, x: 0, y: 0, a: 0
  };
}
function updateFly(dt) {
  if (!fly) { flyNext -= dt; if (flyNext <= 0) launchFly(); return; }
  fly.t += dt / fly.dur;
  if (fly.t >= 1) { fly = null; flyNext = 16 + rnd() * 16; return; }
  var t = fly.t, u = t + 0.125 * Math.sin(TAU * t), v = 1 - u;
  var x = v * v * fly.x0 + 2 * v * u * fly.cx + u * u * fly.x1, y = v * v * fly.y0 + 2 * v * u * fly.cy + u * u * fly.y1;
  var hov = Math.exp(-Math.pow((t - 0.5) / 0.09, 2));
  x += Math.sin(T * 9) * 2.2 * hov; y += Math.cos(T * 7.3) * 2.2 * hov;
  if (fly.x || fly.y) { var ta = Math.atan2(y - fly.y, x - fly.x); if (Math.hypot(y - fly.y, x - fly.x) > 0.25) fly.a += angd(ta, fly.a) * Math.min(1, dt * 8); }
  else fly.a = Math.atan2(fly.cy - fly.y0, fly.cx - fly.x0);
  fly.x = x; fly.y = y;
}
function flyShape(c, x, y, a, sc, shadow) {
  var i;
  c.save(); c.translate(x, y); c.rotate(a); c.scale(sc, sc);
  var flick = shadow || calm ? 0 : Math.sin(T * 95) * 0.16;
  for (i = 0; i < 4; i++) {
    var side = i < 2 ? 1 : -1, back = i % 2;
    c.save();
    c.translate(back ? -3 : 1.5, 0);
    c.rotate(side * (Math.PI / 2 + (back ? 0.2 : -0.12) + flick * (back ? -1 : 1)));
    c.beginPath(); c.ellipse(back ? 10 : 11.5, 0, back ? 10 : 11.5, back ? 2.9 : 2.6, 0, 0, TAU);
    if (shadow) { c.fillStyle = 'rgba(20,50,58,.3)'; c.fill(); }
    else {
      c.fillStyle = 'rgba(255,255,255,.5)'; c.fill();
      c.strokeStyle = 'rgba(20,50,58,.4)'; c.lineWidth = 0.35; c.stroke();
      c.beginPath(); c.moveTo(0, 0); c.lineTo(21, -0.6); c.stroke();
    }
    c.restore();
  }
  c.lineCap = 'round';
  c.strokeStyle = shadow ? C.deep : C.teal; c.lineWidth = 1.7;
  c.beginPath(); c.moveTo(-4, 0); c.lineTo(-25, 0); c.stroke();
  if (!shadow) {
    c.strokeStyle = C.deep; c.lineWidth = 1.7; c.setLineDash([1, 3.4]);
    c.beginPath(); c.moveTo(-6, 0); c.lineTo(-25, 0); c.stroke(); c.setLineDash([]);
  }
  c.fillStyle = shadow ? C.deep : C.teal;
  c.beginPath(); c.ellipse(0, 0, 5, 2.5, 0, 0, TAU); c.fill();
  c.fillStyle = C.deep;
  c.beginPath(); c.arc(5.8, 0, 2.3, 0, TAU); c.fill();
  if (!shadow) {
    c.fillStyle = 'rgba(191,227,208,.9)';
    c.beginPath(); c.arc(6.4, -1.2, 0.8, 0, TAU); c.arc(6.4, 1.2, 0.8, 0, TAU); c.fill();
    c.fillStyle = 'rgba(255,255,255,.45)';
    c.beginPath(); c.ellipse(-0.5, -0.7, 2.6, 0.7, 0, 0, TAU); c.fill();
  }
  c.lineCap = 'butt';
  c.restore();
}

/* ---------- ripples, pellets ---------- */
var pellets = [], ripples = [], ripId = 0;
function addRipple(x, y, str, maxR, small, delay) {
  if (ripples.length > CONFIG.maxRipples) ripples.shift();
  ripples.push({ id: ++ripId, x: x, y: y, t: -(delay || 0), str: str, maxR: maxR, sp: (small ? 34 : 92) * S * (calm ? 0.5 : 1), rings: small ? 2 : 4, gap: (small ? 6 : 17) * S, small: !!small });
}
function tapWater(x, y) {
  if (onStone(x, y)) return false;
  addRipple(x, y, calm ? 0.7 : 1, 240 * S, false);
  plip(0.2, 380 + rnd() * 160);
  var R = 185 * S;
  for (var i = 0; i < fish.length; i++) {
    var f = fish[i], d = Math.hypot(f.x - x, f.y - y);
    if (d < R + f.B * 0.3 && f.enter <= 0) {
      f.fleeA = Math.atan2(f.y - y, f.x - x) + (rnd() - 0.5) * 0.9;
      f.fleeT = 0.55 + rnd() * 0.45 + (1 - d / (R + f.B * 0.3)) * 0.4;
      f.thrust = 1;
      f.retX = x; f.retY = y; f.retT = 7; f.retD = 1.2 + rnd() * 1.6;
      if (f === school.follower) school.follower = null;
    }
  }
  return true;
}
function feed(x, y) {
  if (onStone(x, y)) return false;
  var n = 15 + Math.floor(rnd() * 5), i;
  if (pellets.length > 44) return true;
  for (i = 0; i < n; i++) {
    var a = rnd() * TAU, d = Math.sqrt(rnd()) * 92 * S + 4, px = x + Math.cos(a) * d, py = y + Math.sin(a) * d;
    if (onStone(px, py) || px < 8 || py < 8 || px > W - 8 || py > H - 8) continue;
    pellets.push({ x: px, y: py, t: -(0.05 + rnd() * 0.5), r: (1.7 + rnd() * 1.2) * Math.max(0.8, S), vx: Math.cos(a) * 3, vy: Math.sin(a) * 3, age: 0, dead: false, landed: false, ph: rnd() * TAU });
  }
  for (i = 0; i < fish.length; i++) {
    var f = fish[i];
    f.notice = Math.hypot(f.x - x, f.y - y) / (900 * S) + rnd() * 0.7;
    f.retT = 0;
  }
  school.follower = null;
  return true;
}
function updateSurface(dt) {
  var i, k, r, d;
  for (i = ripples.length - 1; i >= 0; i--) {
    r = ripples[i]; r.t += dt;
    if (r.t * r.sp - (r.rings - 1) * r.gap > r.maxR) { ripples.splice(i, 1); continue; }
    if (r.small || r.t < 0) continue;
    var rad = r.t * r.sp, fade = 1 - rad / r.maxR;
    if (fade <= 0) continue;
    for (k = 0; k < pads.length; k++) {
      var p = pads[k];
      if (p.lastRip === r.id) continue;
      d = Math.hypot(p.x - r.x, p.y - r.y);
      if (rad > d - p.r * 0.5) {
        p.lastRip = r.id;
        p.bobV += 5.5 * fade * r.str;
        p.vx += (p.x - r.x) / (d || 1) * 13 * fade * S; p.vy += (p.y - r.y) / (d || 1) * 13 * fade * S;
      }
    }
    for (k = 0; k < leaves.length; k++) {
      var lf = leaves[k];
      if (lf.lastRip === r.id) continue;
      d = Math.hypot(lf.x - r.x, lf.y - r.y);
      if (rad > d) {
        lf.lastRip = r.id;
        lf.vx += (lf.x - r.x) / (d || 1) * 16 * fade; lf.vy += (lf.y - r.y) / (d || 1) * 16 * fade;
        lf.va += (rnd() - 0.5) * 0.5 * fade;
      }
    }
  }
  for (i = pellets.length - 1; i >= 0; i--) {
    var pl = pellets[i];
    pl.t += dt;
    if (pl.t >= 0 && !pl.landed) { pl.landed = true; addRipple(pl.x, pl.y, 0.34, 10 * S, true); if (rnd() > 0.5) plip(0.035, 1300 + rnd() * 900); }
    if (pl.t > 0) {
      pl.age += dt;
      pl.x += pl.vx * dt; pl.y += pl.vy * dt; pl.vx *= 1 - dt * 0.8; pl.vy *= 1 - dt * 0.8;
      /* fish jostling pushes the pellets about */
      for (k = 0; k < fish.length; k++) {
        var f = fish[k]; d = Math.hypot(pl.x - f.x, pl.y - f.y);
        if (d < f.B * 0.3 && d > 0.01) { pl.vx += Math.cos(f.h) * f.speed * dt * 0.5; pl.vy += Math.sin(f.h) * f.speed * dt * 0.5; }
      }
    }
    if (pl.dead || pl.age > 30) pellets.splice(i, 1);
  }
}
function drawRipples() {
  var c = ctx;
  for (var i = 0; i < ripples.length; i++) {
    var r = ripples[i];
    if (r.t < 0) continue;
    var lead = r.t * r.sp;
    for (var j = 0; j < r.rings; j++) {
      var rad = lead - j * r.gap;
      if (rad <= 0.5 || rad > r.maxR) continue;
      var k = rad / r.maxR, a = Math.pow(1 - k, 1.5) * r.str * (1 - j * 0.22) * Math.min(1, rad / (6 * S));
      var lw = r.small ? 0.9 : (1.5 + rad * 0.017) * (1 - j * 0.12);
      c.lineWidth = lw * 1.9;
      c.strokeStyle = 'rgba(20,50,58,' + (a * 0.3) + ')';
      c.beginPath(); c.arc(r.x + lw * 0.7, r.y + lw * 1.1, rad + lw * 1.2, 0, TAU); c.stroke();
      c.lineWidth = lw;
      c.strokeStyle = 'rgba(255,255,255,' + (a * 0.82) + ')';
      c.beginPath(); c.arc(r.x - lw * 0.5, r.y - lw * 0.8, rad, 0, TAU); c.stroke();
      if (!r.small) {
        /* the sunward arc catches more light */
        c.lineWidth = lw * 1.5;
        c.strokeStyle = 'rgba(255,255,255,' + (a * 0.5) + ')';
        c.beginPath(); c.arc(r.x - lw * 0.5, r.y - lw * 0.8, rad, Math.PI * 1.05, Math.PI * 1.6); c.stroke();
      }
    }
  }
}
function drawPellets() {
  var c = ctx;
  for (var i = 0; i < pellets.length; i++) {
    var p = pellets[i];
    if (p.t < -0.22) continue;
    var fall = p.t < 0 ? -p.t / 0.22 : 0, rr = p.r * (1 + fall * 1.6), al = 1 - fall * 0.7;
    var bx = p.x + Math.sin(T * 1.3 + p.ph) * 0.6, by = p.y + Math.cos(T * 1.1 + p.ph) * 0.6 - fall * 14 * S;
    if (p.t >= 0) {
      c.strokeStyle = 'rgba(255,255,255,.55)'; c.lineWidth = 0.8;
      c.beginPath(); c.arc(bx - 0.4, by - 0.5, rr + 1.6, 0, TAU); c.stroke();
      c.strokeStyle = 'rgba(20,50,58,.25)';
      c.beginPath(); c.arc(bx + 0.5, by + 0.7, rr + 1.9, 0, TAU); c.stroke();
    }
    c.fillStyle = mix(C.yolk, C.black, 0.42, al);
    c.beginPath(); c.arc(bx, by, rr, 0, TAU); c.fill();
    c.fillStyle = mix(C.yolk, C.white, 0.2, al * 0.9);
    c.beginPath(); c.arc(bx - rr * 0.3, by - rr * 0.3, rr * 0.45, 0, TAU); c.fill();
  }
}

export { pads, leaves, striders, fly, pellets, ripples, buildPads, updatePads, padPath, drawPad, drawLotus, buildLeaves, leafPath, drawLeaf, updateLeaves, buildStriders, updateStriders, striderFoot, drawStrider, updateFly, flyShape, addRipple, tapWater, feed, updateSurface, drawRipples, drawPellets };
