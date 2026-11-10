// Part of the koi pond. Moved verbatim from the original single script; see README.
// Rule: never call an imported function or read an imported mutable binding at top level, only inside functions.

var cv = document.getElementById('pond');
var ctx = cv.getContext('2d');
var TAU = Math.PI * 2;
var mq = window.matchMedia('(prefers-reduced-motion: reduce)');
var calm = mq.matches;
var covered = document.documentElement.dataset.pondCovered === '1';

var W = 0, H = 0, DPR = 1, S = 1, M = 0, T = 0;

/* ---------- small helpers ---------- */
function rngf(seed) {
  var a = seed >>> 0;
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    var t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
var rnd = rngf(20240612);
function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
function lerp(a, b, t) { return a + (b - a) * t; }
function hex(h) { return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]; }
function mix(a, b, t, al) {
  var A = hex(a), B = hex(b);
  var s = Math.round(lerp(A[0], B[0], t)) + ',' + Math.round(lerp(A[1], B[1], t)) + ',' + Math.round(lerp(A[2], B[2], t));
  return al === undefined ? 'rgb(' + s + ')' : 'rgba(' + s + ',' + al + ')';
}
function angd(a, b) {
  var d = (a - b) % TAU;
  if (d > Math.PI) d -= TAU;
  if (d < -Math.PI) d += TAU;
  return d;
}
/* closed smooth curve through a flat [x,y,x,y...] list */
function smooth(c, p, n) {
  var lx = p[n * 2 - 2], ly = p[n * 2 - 1];
  c.moveTo((lx + p[0]) / 2, (ly + p[1]) / 2);
  for (var i = 0; i < n; i++) {
    var x = p[i * 2], y = p[i * 2 + 1];
    var j = (i + 1) % n;
    c.quadraticCurveTo(x, y, (x + p[j * 2]) / 2, (y + p[j * 2 + 1]) / 2);
  }
  c.closePath();
}

var C = {
  teal: '#2C7A7B', deep: '#14323A', jade: '#BFE3D0', orange: '#F26B21', white: '#FFFFFF',
  black: '#1B1B1B', yolk: '#F2B33D', padA: '#3E8E5A', padB: '#6DB37C', lotus: '#F7C6D0'
};

/* the only writers of the shared view, clock and mode bindings */
function setView(w, h, dpr) {
  W = w; H = h; DPR = dpr;
  M = Math.min(W, H);
  S = clamp(M / 820, 0.6, 1.3);
}
function advanceTime(dt) { T += dt; }
function setCalm(b) { calm = b; }
function setCovered(b) { covered = b; }
export { TAU, rngf, rnd, clamp, lerp, hex, mix, angd, smooth, C, cv, ctx, mq, W, H, DPR, S, M, T, calm, covered, setView, advanceTime, setCalm, setCovered };
