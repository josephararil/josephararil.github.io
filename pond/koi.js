// Part of the koi pond. Moved verbatim from the original single script; see README.
// Rule: never call an imported function or read an imported mutable binding at top level, only inside functions.

import { TAU, rngf, rnd, clamp, lerp, angd, smooth, C, ctx, W, H, S } from './core.js';
import { stones } from './floor.js';
import { pellets, pads, addRipple } from './surface.js';
import { plip } from './sound.js';
import { ptr } from './input.js';

/* ---------- koi ---------- */
var NSEG = 14;
var PROF_S = [0, 0.012, 0.035, 0.07, 0.13, 0.22, 0.32, 0.45, 0.6, 0.75, 0.88, 1];
var PROF_W = [0, 0.036, 0.06, 0.08, 0.098, 0.113, 0.119, 0.11, 0.088, 0.06, 0.037, 0.023];
function wprof(s) {
  if (s <= 0) return 0;
  if (s >= 1) return PROF_W[11];
  for (var i = 1; i < 12; i++) {
    if (s <= PROF_S[i]) return lerp(PROF_W[i - 1], PROF_W[i], (s - PROF_S[i - 1]) / (PROF_S[i] - PROF_S[i - 1]));
  }
  return PROF_W[11];
}
var VARIETY = {
  kohaku: 'Kohaku', showa: 'Showa', ogon: 'Ogon', tancho: 'Tancho'
};
var ORDER = ['kohaku', 'showa', 'ogon', 'tancho', 'kohaku', 'showa', 'kohaku', 'ogon', 'tancho', 'kohaku', 'showa', 'kohaku', 'ogon', 'kohaku'];
var WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty', 'twenty-one', 'twenty-two', 'twenty-three', 'twenty-four', 'twenty-five', 'twenty-six', 'twenty-seven', 'twenty-eight', 'twenty-nine', 'thirty', 'thirty-one', 'thirty-two', 'thirty-three', 'thirty-four'];

var fish = [];
function blob(r, s, u, rs, ru, col, wob) {
  var v = [];
  for (var i = 0; i < 12; i++) v.push(1 - wob / 2 + r() * wob);
  return { s: s, u: u, rs: rs, ru: ru, col: col, v: v };
}
function makePattern(f, r) {
  var b = [], i, n;
  f.base = '#FFFDF8'; f.fin = 'rgba(255,255,255,.66)'; f.finTint = 'rgba(242,107,33,.0)';
  if (f.variety === 'kohaku') {
    n = 3 + Math.floor(r() * 3);
    for (i = 0; i < n; i++) {
      b.push(blob(r, 0.07 + (i + r() * 0.7) / n * 0.86, (r() - 0.5) * 0.9, 0.07 + r() * 0.085, 0.75 + r() * 0.75, C.orange, 0.5));
    }
    if (r() > 0.4) b.push(blob(r, 0.2 + r() * 0.6, (r() > 0.5 ? 1 : -1) * 0.9, 0.035, 0.4, C.orange, 0.5));
  } else if (f.variety === 'showa') {
    n = 3;
    for (i = 0; i < n; i++) b.push(blob(r, 0.08 + (i + r() * 0.6) / n * 0.8, (r() - 0.5) * 0.8, 0.08 + r() * 0.07, 0.8 + r() * 0.6, C.orange, 0.5));
    n = 4 + Math.floor(r() * 2);
    for (i = 0; i < n; i++) b.push(blob(r, 0.04 + (i + r()) / n * 0.92, (r() - 0.5) * 1.7, 0.045 + r() * 0.07, 0.5 + r() * 0.8, C.black, 0.7));
    f.finDark = true;
  } else if (f.variety === 'tancho') {
    b.push(blob(r, 0.1, 0, 0.052, 0.66, C.orange, 0.14));
  } else {
    f.base = C.yolk; f.fin = 'rgba(246,200,110,.72)';
  }
  f.blobs = b;
}
function makeFish(i, total) {
  var r = rngf(7001 + i * 131);
  var f = { variety: ORDER[i % ORDER.length] };
  var size = 0.25 + r() * 0.75;
  if (i === 0) size = 1; if (i === 3) size = 0.9; if (i === 5) size = 0.3;
  f.size = size;
  f.B = (58 + size * 80) * S;
  f.age = Math.round(2 + size * 22 + r() * 6);
  f.cruise = f.B * (0.5 + r() * 0.2);
  f.swirl = r() > 0.2 ? 1 : -1;
  f.tailK = 0.9 + r() * 0.3;
  makePattern(f, r);
  /* enter from an edge, away from the stone corners */
  var side = i % 4, u = 0.3 + r() * 0.4, out = f.B * (1.1 + r() * 0.9);
  if (side === 0) { f.x = -out; f.y = H * u; }
  else if (side === 1) { f.x = W * u; f.y = -out; }
  else if (side === 2) { f.x = W + out; f.y = H * u; }
  else { f.x = W * u; f.y = H + out; }
  f.h = Math.atan2(H * (0.3 + r() * 0.4) - f.y, W * (0.3 + r() * 0.4) - f.x);
  f.speed = f.cruise * 2.6; f.thrust = 1; f.phase = r() * TAU; f.paddle = r() * TAU;
  f.wander = 0; f.fleeT = 0; f.fleeA = 0; f.retT = 0; f.retD = 0; f.retX = 0; f.retY = 0;
  f.notice = 0; f.chew = 0; f.mouth = 0; f.enter = 1; f.gulp = 6 + r() * 30;
  f.nodes = new Float32Array(NSEG * 2);
  f.px = new Float32Array(NSEG); f.py = new Float32Array(NSEG);
  f.nx = new Float32Array(NSEG); f.ny = new Float32Array(NSEG);
  f.out = new Float32Array(46);
  var seg = f.B / (NSEG - 1);
  for (var k = 0; k < NSEG; k++) {
    f.nodes[k * 2] = f.x - Math.cos(f.h) * seg * k;
    f.nodes[k * 2 + 1] = f.y - Math.sin(f.h) * seg * k;
  }
  return f;
}

var school = { follower: null, followT: 0 };

function updateFish(f, dt) {
  var fx = 0, fy = 0, vt = f.cruise, fast = false, turn = 1.7, i, dx, dy, d, lim, k;
  f.wander += (rnd() - 0.5) * dt * 5; f.wander *= 1 - dt * 0.3;
  f.wander = clamp(f.wander, -1.1, 1.1);
  fx += Math.cos(f.h + f.wander); fy += Math.sin(f.h + f.wander);

  var m = f.B * 0.45 + 56 * S;
  if (f.x < m) fx += (m - f.x) / m * 3.2;
  if (f.x > W - m) fx -= (f.x - (W - m)) / m * 3.2;
  if (f.y < m) fy += (m - f.y) / m * 3.2;
  if (f.y > H - m) fy -= (f.y - (H - m)) / m * 3.2;
  var outside = f.x < -f.B * 0.2 || f.x > W + f.B * 0.2 || f.y < -f.B * 0.2 || f.y > H + f.B * 0.2;
  if (f.enter > 0) { if (!outside) f.enter -= dt * 0.8; vt = f.cruise * (1.2 + 1.6 * f.enter); fast = true; }

  for (i = 0; i < stones.length; i++) {
    var s = stones[i];
    dx = f.x - s.x; dy = f.y - s.y; d = Math.hypot(dx, dy) || 1; lim = s.r + m * 0.75;
    if (d < lim) { k = (lim - d) / lim * 5; fx += dx / d * k; fy += dy / d * k; }
  }
  var feeding = pellets.length > 0 && f.fleeT <= 0;
  if (pellets.length && f.notice > 0) f.notice -= dt;
  if (!feeding) {
    for (i = 0; i < pads.length; i++) {
      var p = pads[i];
      dx = f.x - p.x; dy = f.y - p.y; d = Math.hypot(dx, dy) || 1; lim = p.r + f.B * 0.2;
      if (d < lim) { k = (lim - d) / lim * 0.8; fx += dx / d * k; fy += dy / d * k; }
    }
  }
  for (i = 0; i < fish.length; i++) {
    var o = fish[i];
    if (o === f) continue;
    dx = f.x - o.x; dy = f.y - o.y; d = Math.hypot(dx, dy) || 1;
    lim = (f.B + o.B) * (feeding ? 0.25 : 0.42);
    if (d < lim) { k = (lim - d) / lim * (feeding ? 2.6 : 1.5); fx += dx / d * k; fy += dy / d * k; }
    /* also keep the nose off the neighbour's midbody */
    dx = f.x - o.nodes[12]; dy = f.y - o.nodes[13]; d = Math.hypot(dx, dy) || 1;
    lim = (f.B + o.B) * 0.16;
    if (d < lim) { k = (lim - d) / lim * 1.6; fx += dx / d * k; fy += dy / d * k; }
  }

  if (f.chew > 0) f.chew -= dt;
  if (f.mouth > 0) f.mouth = Math.max(0, f.mouth - dt * 1.7);

  if (f.fleeT > 0) {
    f.fleeT -= dt;
    fx += Math.cos(f.fleeA) * 6; fy += Math.sin(f.fleeA) * 6;
    vt = f.cruise * 4.4; fast = true; turn = 7;
  } else if (feeding && f.notice <= 0) {
    if (f.chew > 0) {
      vt = f.cruise * 0.55;
    } else {
      var best = null, bd = 1e9;
      for (i = 0; i < pellets.length; i++) {
        var pl = pellets[i];
        if (pl.t < 0) continue;
        d = Math.hypot(pl.x - f.x, pl.y - f.y);
        if (d < bd) { bd = d; best = pl; }
      }
      if (best) {
        dx = (best.x - f.x) / (bd || 1); dy = (best.y - f.y) / (bd || 1);
        fx += dx * 3.6; fy += dy * 3.6;
        var near = 150 * S;
        if (bd < near && bd > 26 * S) { k = f.swirl * 1.5 * (bd / near); fx += -dy * k; fy += dx * k; }
        vt = f.cruise * clamp(bd / (46 * S), 0.75, 3.1);
        fast = true; turn = 4.6;
        if (bd < 9 * S + f.B * 0.06) {
          best.dead = true;
          f.mouth = 1; f.chew = 0.4 + rnd() * 0.45;
          addRipple(best.x, best.y, 0.5, 24 * S + f.B * 0.1, true);
          plip(0.09, 520 + rnd() * 500);
        }
      }
    }
  } else if (f === school.follower) {
    dx = ptr.x - f.x; dy = ptr.y - f.y; d = Math.hypot(dx, dy) || 1;
    if (d > f.B * 0.42) { fx += dx / d * 2.8; fy += dy / d * 2.8; }
    else { fx += -dy / d * 1.2 * f.swirl; fy += dx / d * 1.2 * f.swirl; }
    vt = f.cruise * clamp(d / (110 * S), 0.45, 2);
    turn = 2.8; fast = d > 170 * S;
  } else if (f.retT > 0) {
    if (f.retD > 0) f.retD -= dt;
    else {
      f.retT -= dt;
      dx = f.retX - f.x; dy = f.retY - f.y; d = Math.hypot(dx, dy) || 1;
      fx += dx / d * 1.1; fy += dy / d * 1.1;
      if (d < 50 * S) f.retT = 0;
    }
  }

  if (fast) {
    f.speed += (vt - f.speed) * Math.min(1, dt * 3.4);
    f.thrust += (clamp(vt / f.cruise * 0.4, 0.4, 1) - f.thrust) * Math.min(1, dt * 5);
  } else {
    f.thrust *= Math.exp(-dt * 2.6);
    if (f.speed < vt * 0.62 && f.thrust < 0.22) f.thrust = 1;
    f.speed += (f.thrust * vt * 2.6 - f.speed * 0.6) * dt;
  }
  var dh = angd(Math.atan2(fy, fx), f.h);
  f.h += clamp(dh * 3, -turn, turn) * dt;
  f.x += Math.cos(f.h) * f.speed * dt;
  f.y += Math.sin(f.h) * f.speed * dt;
  f.phase += dt * (2.0 + 7.5 * f.thrust + f.speed / f.B * 3);
  f.paddle += dt * (2.6 + f.thrust);

  /* an idle gulp at the surface, now and then */
  f.gulp -= dt;
  if (f.gulp <= 0) {
    f.gulp = 22 + rnd() * 40;
    if (!feeding && !outside && f.fleeT <= 0) { f.mouth = 1; addRipple(f.x, f.y, 0.42, 22 * S + f.B * 0.1, true); plip(0.05, 600 + rnd() * 300); }
  }

  /* the spine follows the head like a towed chain */
  var n = f.nodes, seg = f.B / (NSEG - 1);
  n[0] = f.x; n[1] = f.y;
  for (i = 1; i < NSEG; i++) {
    dx = n[i * 2] - n[i * 2 - 2]; dy = n[i * 2 + 1] - n[i * 2 - 1];
    d = Math.hypot(dx, dy) || 1;
    n[i * 2] = n[i * 2 - 2] + dx / d * seg;
    n[i * 2 + 1] = n[i * 2 - 1] + dy / d * seg;
  }
}

function poseFish(f) {
  var n = f.nodes, i, tx, ty, d;
  var A = f.B * 0.062 * (0.3 + 0.7 * f.thrust);
  for (i = 0; i < NSEG; i++) {
    var a = Math.max(0, i - 1), b = Math.min(NSEG - 1, i + 1);
    tx = n[b * 2] - n[a * 2]; ty = n[b * 2 + 1] - n[a * 2 + 1];
    d = Math.hypot(tx, ty) || 1; tx /= d; ty /= d;
    var s = i / (NSEG - 1);
    var off = A * (0.1 + s * s * 1.15) * Math.sin(f.phase - s * 5.2);
    f.px[i] = n[i * 2] - ty * off; f.py[i] = n[i * 2 + 1] + tx * off;
  }
  for (i = 0; i < NSEG; i++) {
    var a2 = Math.max(0, i - 1), b2 = Math.min(NSEG - 1, i + 1);
    tx = f.px[b2] - f.px[a2]; ty = f.py[b2] - f.py[a2];
    d = Math.hypot(tx, ty) || 1;
    f.nx[i] = -ty / d; f.ny[i] = tx / d;
  }
  /* outline */
  var o = f.out, k = 0, sp = SP;
  for (i = 0; i < 12; i++) {
    spineAt(f, PROF_S[i]);
    var w = PROF_W[i] * f.B;
    if (i === 0) { o[0] = sp.x; o[1] = sp.y; continue; }
    o[i * 2] = sp.x + sp.nx * w; o[i * 2 + 1] = sp.y + sp.ny * w;
    k = 23 - i;
    o[k * 2] = sp.x - sp.nx * w; o[k * 2 + 1] = sp.y - sp.ny * w;
  }
}
var SP = { x: 0, y: 0, nx: 0, ny: 0 };
function spineAt(f, s) {
  var t = s * (NSEG - 1), i = clamp(Math.floor(t), 0, NSEG - 2), fr = t - i;
  SP.x = f.px[i] + (f.px[i + 1] - f.px[i]) * fr;
  SP.y = f.py[i] + (f.py[i + 1] - f.py[i]) * fr;
  var g = clamp(fr, 0, 1);
  SP.nx = f.nx[i] + (f.nx[i + 1] - f.nx[i]) * g;
  SP.ny = f.ny[i] + (f.ny[i + 1] - f.ny[i]) * g;
  return SP;
}
function bodyPath(c, f) { c.beginPath(); smooth(c, f.out, 23); }
function tailPath(c, f) {
  var e = NSEG - 1, bx = f.px[e], by = f.py[e];
  var nx = f.nx[e], ny = f.ny[e], tx = ny, ty = -nx; /* tailward */
  var sw = 0.62 * (0.35 + 0.65 * f.thrust) * Math.sin(f.phase - 6.1);
  var cs = Math.cos(sw), sn = Math.sin(sw);
  var dx = tx * cs - ty * sn, dy = tx * sn + ty * cs;
  var TL = f.B * 0.36 * f.tailK, spd = 0.5 + 0.13 * Math.sin(f.phase * 2 + 1) - 0.12 * f.thrust;
  var w = PROF_W[11] * f.B;
  function pt(ang, len) { var c2 = Math.cos(ang), s2 = Math.sin(ang); return [bx + (dx * c2 - dy * s2) * len, by + (dx * s2 + dy * c2) * len]; }
  var tl = pt(spd, TL), tr = pt(-spd, TL * 0.94), no = pt(sw * 0.3, TL * 0.56);
  var c1 = pt(spd * 1.7, TL * 0.5), c2 = pt(spd * 0.55, TL * 0.9), c3 = pt(-spd * 0.55, TL * 0.86), c4 = pt(-spd * 1.7, TL * 0.5);
  c.beginPath();
  c.moveTo(bx + nx * w, by + ny * w);
  c.quadraticCurveTo(c1[0], c1[1], tl[0], tl[1]);
  c.quadraticCurveTo(c2[0], c2[1], no[0], no[1]);
  c.quadraticCurveTo(c3[0], c3[1], tr[0], tr[1]);
  c.quadraticCurveTo(c4[0], c4[1], bx - nx * w, by - ny * w);
  c.closePath();
  return [bx, by, tl, tr, no];
}
function finPath(c, f, s, side, ang, len, fat) {
  spineAt(f, s);
  var nx = SP.nx, ny = SP.ny, tx = ny, ty = -nx, w = wprof(s) * f.B * 0.82;
  var ax = SP.x + nx * side * w, ay = SP.y + ny * side * w;
  var cs = Math.cos(ang), sn = Math.sin(ang);
  var dx = tx * cs + nx * side * sn, dy = ty * cs + ny * side * sn;
  var qx = -tx * sn + nx * side * cs, qy = -ty * sn + ny * side * cs;
  var tipx = ax + dx * len, tipy = ay + dy * len;
  c.beginPath();
  c.moveTo(ax - tx * len * 0.1, ay - ty * len * 0.1);
  c.quadraticCurveTo(ax + dx * len * 0.5 + qx * len * fat, ay + dy * len * 0.5 + qy * len * fat, tipx, tipy);
  c.quadraticCurveTo(ax + dx * len * 0.72 - qx * len * fat * 0.75, ay + dy * len * 0.72 - qy * len * fat * 0.75, ax + tx * len * 0.16, ay + ty * len * 0.16);
  c.closePath();
  return [ax, ay, tipx, tipy, qx, qy];
}
function pecAngle(f, side) {
  return 1.0 + 0.36 * Math.sin(f.paddle + (side > 0 ? 0 : 2.1)) - 0.62 * f.thrust;
}

function drawFishShadow(c, f) {
  c.beginPath(); smooth(c, f.out, 23); c.fill();
  tailPath(c, f); c.fill();
  finPath(c, f, 0.2, 1, pecAngle(f, 1), f.B * 0.24, 0.3); c.fill();
  finPath(c, f, 0.2, -1, pecAngle(f, -1), f.B * 0.24, 0.3); c.fill();
}

function drawFish(f) {
  var c = ctx, i, B = f.B, side, r;
  /* fins first: translucent, with rays */
  for (side = -1; side <= 1; side += 2) {
    r = finPath(c, f, 0.2, side, pecAngle(f, side), B * 0.24, 0.3);
    c.fillStyle = f.fin; c.fill();
    if (f.finDark) { c.fillStyle = 'rgba(27,27,27,.3)'; c.fill(); }
    c.strokeStyle = 'rgba(20,50,58,.13)'; c.lineWidth = 0.7;
    for (i = -1; i <= 1; i++) {
      c.beginPath(); c.moveTo(r[0], r[1]);
      c.lineTo(lerp(r[0], r[2], 0.86) + r[4] * i * B * 0.035, lerp(r[1], r[3], 0.86) + r[5] * i * B * 0.035);
      c.stroke();
    }
    finPath(c, f, 0.56, side, 0.62 + 0.15 * Math.sin(f.paddle * 0.7 + side), B * 0.11, 0.32);
    c.fillStyle = f.fin; c.fill();
  }
  var tp = tailPath(c, f);
  c.fillStyle = f.fin; c.fill();
  if (f.variety === 'kohaku' || f.variety === 'showa') {
    var tg = c.createRadialGradient(tp[0], tp[1], 0, tp[0], tp[1], B * 0.3);
    tg.addColorStop(0, f.variety === 'showa' ? 'rgba(27,27,27,.5)' : 'rgba(242,107,33,.5)');
    tg.addColorStop(1, 'rgba(242,107,33,0)');
    c.fillStyle = tg; c.fill();
  }
  c.strokeStyle = 'rgba(20,50,58,.12)'; c.lineWidth = 0.7;
  for (i = 0; i <= 4; i++) {
    var u = i / 4, ex, ey;
    if (u < 0.5) { ex = lerp(tp[2][0], tp[4][0], u * 2); ey = lerp(tp[2][1], tp[4][1], u * 2); }
    else { ex = lerp(tp[4][0], tp[3][0], u * 2 - 1); ey = lerp(tp[4][1], tp[3][1], u * 2 - 1); }
    c.beginPath(); c.moveTo(tp[0], tp[1]); c.lineTo(lerp(tp[0], ex, 0.92), lerp(tp[1], ey, 0.92)); c.stroke();
  }

  /* body */
  bodyPath(c, f);
  c.fillStyle = f.base; c.fill();
  c.save();
  c.clip();
  var pts = [];
  for (i = 0; i < f.blobs.length; i++) {
    var b = f.blobs[i];
    pts.length = 0;
    for (var k = 0; k < 12; k++) {
      var a = k / 12 * TAU, s = b.s + Math.cos(a) * b.rs * b.v[k], uu = b.u + Math.sin(a) * b.ru * b.v[k];
      spineAt(f, s);
      var w = wprof(clamp(s, 0.07, 0.94)) * B * uu;
      pts.push(SP.x + SP.nx * w, SP.y + SP.ny * w);
    }
    c.fillStyle = b.col;
    c.beginPath(); smooth(c, pts, 12); c.fill();
  }
  /* edge shade: the body rounds away from the light */
  c.lineJoin = 'round';
  c.strokeStyle = f.variety === 'ogon' ? 'rgba(150,84,10,.34)' : 'rgba(20,50,58,.2)';
  c.lineWidth = B * 0.085;
  bodyPath(c, f); c.stroke();
  c.strokeStyle = f.variety === 'ogon' ? 'rgba(150,84,10,.2)' : 'rgba(20,50,58,.1)';
  c.lineWidth = B * 0.03;
  c.stroke();
  /* wet sheen along the back */
  c.lineCap = 'round';
  c.beginPath();
  for (i = 0; i <= 10; i++) {
    spineAt(f, 0.06 + i * 0.07);
    var hx = SP.x - B * 0.012, hy = SP.y - B * 0.02;
    if (i) c.lineTo(hx, hy); else c.moveTo(hx, hy);
  }
  c.strokeStyle = f.variety === 'ogon' ? 'rgba(255,244,204,.6)' : 'rgba(255,255,255,.3)';
  c.lineWidth = B * 0.05; c.stroke();
  c.restore();

  /* dorsal fin */
  c.beginPath();
  for (i = 0; i <= 6; i++) {
    spineAt(f, 0.3 + i * 0.055);
    if (i) c.lineTo(SP.x, SP.y); else c.moveTo(SP.x, SP.y);
  }
  c.strokeStyle = f.variety === 'ogon' ? 'rgba(150,84,10,.45)' : 'rgba(20,50,58,.22)';
  c.lineWidth = B * 0.016; c.stroke();
  c.lineCap = 'butt';

  /* eyes */
  spineAt(f, 0.085);
  var ew = wprof(0.085) * B * 0.8, er = Math.max(1, B * 0.017);
  c.fillStyle = C.black;
  c.beginPath(); c.arc(SP.x + SP.nx * ew, SP.y + SP.ny * ew, er, 0, TAU); c.fill();
  c.beginPath(); c.arc(SP.x - SP.nx * ew, SP.y - SP.ny * ew, er, 0, TAU); c.fill();

  /* mouth opening at the surface */
  if (f.mouth > 0.02) {
    var mo = Math.sin(Math.min(1, f.mouth) * Math.PI);
    spineAt(f, 0.004);
    var mr = B * 0.04 * mo + 0.4;
    c.fillStyle = 'rgba(247,198,208,' + (0.95 * mo) + ')';
    c.beginPath(); c.arc(SP.x, SP.y, mr * 1.5, 0, TAU); c.fill();
    c.fillStyle = 'rgba(20,50,58,' + (0.8 * mo) + ')';
    c.beginPath(); c.arc(SP.x, SP.y, mr * 0.85, 0, TAU); c.fill();
  }
}

export { NSEG, fish, school, VARIETY, WORDS, makeFish, updateFish, poseFish, drawFish, drawFishShadow };
