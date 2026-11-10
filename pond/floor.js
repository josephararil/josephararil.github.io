// Part of the koi pond. Moved verbatim from the original single script; see README.
// Rule: never call an imported function or read an imported mutable binding at top level, only inside functions.

import { TAU, rngf, clamp, lerp, hex, mix, smooth, C, W, H, DPR, S, M, T, calm, covered } from './core.js';

/* ---------- offscreen layers ---------- */
var floorCv = document.createElement('canvas');
var stoneCv = document.createElement('canvas');
var causCv = document.createElement('canvas');
var causCtx = causCv.getContext('2d');
var causImg = null, causScale = 1, causMask = null;
var glCv = document.createElement('canvas'), gl = null, gpuCaus = false, glTex = null, glU = null;

/* ---------- stones ---------- */
var stones = [], stoneRects = [];
function buildStones() {
  var r = rngf(977);
  stones = [];
  var mm = clamp(M, 340, 900);
  var corners = [[0, 0, 0.31], [W, H, 0.24], [W, 0, 0.15], [0, H, 0.13]];
  corners.forEach(function (c) {
    var cx = c[0], cy = c[1], R = c[2] * mm;
    var sx = cx ? -1 : 1, sy = cy ? -1 : 1;
    function mk(x, y, rad) {
      var v = [];
      for (var i = 0; i < 10; i++) v.push(0.84 + r() * 0.3);
      stones.push({ x: x, y: y, r: rad, v: v, rot: r() * TAU, tone: 0.13 + r() * 0.24, moss: r(), seed: Math.floor(r() * 1e6) });
    }
    mk(cx + sx * R * 0.14, cy + sy * R * 0.12, R * 0.66);
    var n = 3 + Math.floor(r() * 2) + (c[2] > 0.2 ? 2 : 0);
    for (var i = 0; i < n; i++) {
      var a = (i + 0.5) / n * Math.PI / 2 + (r() - 0.5) * 0.22;
      var d = R * (0.8 + r() * 0.26);
      mk(cx + sx * Math.cos(a) * d, cy + sy * Math.sin(a) * d, R * (0.21 + r() * 0.2));
    }
    for (var k = 0; k < 4; k++) {
      var a2 = r() * Math.PI / 2, d2 = R * (1.12 + r() * 0.3);
      mk(cx + sx * Math.cos(a2) * d2, cy + sy * Math.sin(a2) * d2, R * (0.045 + r() * 0.06));
    }
  });
}
function stonePath(c, s) {
  var p = [], n = s.v.length;
  for (var i = 0; i < n; i++) {
    var a = s.rot + i / n * TAU;
    p.push(s.x + Math.cos(a) * s.r * s.v[i], s.y + Math.sin(a) * s.r * s.v[i]);
  }
  c.beginPath();
  smooth(c, p, n);
}
function paintStones() {
  stoneCv.width = Math.round(W * DPR); stoneCv.height = Math.round(H * DPR);
  var c = stoneCv.getContext('2d');
  c.setTransform(DPR, 0, 0, DPR, 0, 0);
  c.clearRect(0, 0, W, H);
  var order = stones.slice().sort(function (a, b) { return b.r - a.r; });
  order.forEach(function (s) {
    var r = rngf(s.seed);
    /* wet margin + cast shadow into the water */
    c.save();
    c.shadowColor = 'rgba(20,50,58,.42)';
    c.shadowBlur = 16 * S + s.r * 0.08;
    c.shadowOffsetX = (5 + s.r * 0.04) * DPR; c.shadowOffsetY = (8 + s.r * 0.06) * DPR;
    stonePath(c, s);
    var g = c.createLinearGradient(s.x - s.r, s.y - s.r, s.x + s.r, s.y + s.r);
    g.addColorStop(0, mix(C.white, C.deep, Math.max(0.03, s.tone - 0.1)));
    g.addColorStop(0.5, mix(C.white, C.deep, s.tone + 0.06));
    g.addColorStop(1, mix(C.white, C.deep, s.tone + 0.34));
    c.fillStyle = g;
    c.fill();
    c.restore();

    c.save();
    stonePath(c, s);
    c.clip();
    /* warm cast so the stone is not cold grey */
    c.fillStyle = 'rgba(242,179,61,.09)';
    c.fillRect(s.x - s.r * 1.3, s.y - s.r * 1.3, s.r * 2.6, s.r * 2.6);
    var hg = c.createRadialGradient(s.x - s.r * 0.3, s.y - s.r * 0.35, 0, s.x - s.r * 0.3, s.y - s.r * 0.35, s.r * 0.9);
    hg.addColorStop(0, 'rgba(255,255,255,.5)'); hg.addColorStop(1, 'rgba(255,255,255,0)');
    c.fillStyle = hg;
    c.fillRect(s.x - s.r * 1.3, s.y - s.r * 1.3, s.r * 2.6, s.r * 2.6);
    /* speckle */
    var sp = Math.round(s.r * s.r / 26);
    for (var i = 0; i < sp; i++) {
      var a = r() * TAU, d = Math.sqrt(r()) * s.r * 1.1;
      c.fillStyle = r() > 0.5 ? 'rgba(20,50,58,' + (0.04 + r() * 0.09) + ')' : 'rgba(255,255,255,' + (0.08 + r() * 0.16) + ')';
      c.beginPath();
      c.arc(s.x + Math.cos(a) * d, s.y + Math.sin(a) * d, 0.4 + r() * 1.5 * S, 0, TAU);
      c.fill();
    }
    /* a vein or two */
    if (s.r > 26) {
      c.strokeStyle = 'rgba(20,50,58,.13)'; c.lineWidth = 0.8;
      for (var q = 0; q < 2; q++) {
        var a0 = r() * TAU, x0 = s.x + Math.cos(a0) * s.r, y0 = s.y + Math.sin(a0) * s.r;
        c.beginPath(); c.moveTo(x0, y0);
        var a1 = a0 + Math.PI + (r() - 0.5) * 1.2;
        c.quadraticCurveTo(s.x + (r() - 0.5) * s.r, s.y + (r() - 0.5) * s.r, s.x + Math.cos(a1) * s.r * 0.4, s.y + Math.sin(a1) * s.r * 0.4);
        c.stroke();
      }
    }
    /* rim light and rim shade */
    c.lineWidth = Math.max(2, s.r * 0.09);
    c.strokeStyle = 'rgba(20,50,58,.26)';
    c.translate(-1.5, -2.5); stonePath(c, s); c.stroke();
    c.translate(3, 5); c.strokeStyle = 'rgba(255,255,255,.4)'; stonePath(c, s); c.stroke();
    c.translate(-1.5, -2.5);
    /* moss */
    if (s.r > 12 && s.moss > 0.18) {
      var patches = 2 + Math.floor(s.moss * 3);
      for (var m = 0; m < patches; m++) {
        var ma = r() * TAU, mr = s.r * (0.55 + r() * 0.4), ms = s.r * (0.22 + r() * 0.3);
        var mx = s.x + Math.cos(ma) * mr, my = s.y + Math.sin(ma) * mr;
        var dots = Math.round(30 + ms * 2.2);
        for (var k = 0; k < dots; k++) {
          var da = r() * TAU, dd = Math.pow(r(), 0.7) * ms, dr = (1.2 + r() * 3.4) * S * (1 - dd / ms * 0.55);
          var px = mx + Math.cos(da) * dd, py = my + Math.sin(da) * dd;
          c.fillStyle = 'rgba(20,50,58,.2)';
          c.beginPath(); c.arc(px + 0.8, py + 1.2, dr, 0, TAU); c.fill();
          c.fillStyle = mix(C.padA, C.padB, r() * 0.6, 0.92);
          c.beginPath(); c.arc(px, py, dr, 0, TAU); c.fill();
          if (r() > 0.45) {
            c.fillStyle = mix(C.padB, C.jade, r() * 0.5, 0.85);
            c.beginPath(); c.arc(px - dr * 0.3, py - dr * 0.35, dr * 0.45, 0, TAU); c.fill();
          }
        }
      }
    }
    c.restore();
  });
  /* the stones sit in the corners: remember one rectangle per corner, so render() copies only those */
  var q = [null, null, null, null];
  stones.forEach(function (s) {
    var k = (s.x < W / 2 ? 0 : 1) + (s.y < H / 2 ? 0 : 2), pad = s.r * 1.3 + 34, b = q[k];
    if (!b) q[k] = [s.x - pad, s.y - pad, s.x + pad, s.y + pad];
    else { b[0] = Math.min(b[0], s.x - pad); b[1] = Math.min(b[1], s.y - pad); b[2] = Math.max(b[2], s.x + pad); b[3] = Math.max(b[3], s.y + pad); }
  });
  q = q.filter(Boolean).map(function (b) {
    return [Math.floor(clamp(b[0], 0, W) * DPR) / DPR, Math.floor(clamp(b[1], 0, H) * DPR) / DPR,
      Math.ceil(clamp(b[2], 0, W) * DPR) / DPR, Math.ceil(clamp(b[3], 0, H) * DPR) / DPR];
  });
  /* overlapping rectangles would draw the shared pixels twice, so merge them */
  for (var i = 0; i < q.length; i++) for (var j = i + 1; j < q.length; j++) {
    var A = q[i], B = q[j];
    if (A[0] < B[2] && B[0] < A[2] && A[1] < B[3] && B[1] < A[3]) {
      q[i] = [Math.min(A[0], B[0]), Math.min(A[1], B[1]), Math.max(A[2], B[2]), Math.max(A[3], B[3])];
      q.splice(j, 1); i = -1; break;
    }
  }
  stoneRects = q.map(function (b) { return { x: b[0], y: b[1], w: b[2] - b[0], h: b[3] - b[1] }; })
    .filter(function (r) { return r.w > 0 && r.h > 0; });
}
function onStone(x, y) {
  for (var i = 0; i < stones.length; i++) {
    var s = stones[i];
    if (Math.hypot(x - s.x, y - s.y) < s.r * 0.93) return true;
  }
  return false;
}

/* ---------- pond floor ---------- */
function depthAt(x, y) {
  var ax = clamp(Math.abs(2 * x / W - 1), 0, 1), ay = clamp(Math.abs(2 * y / H - 1), 0, 1);
  var e = 1 - Math.cbrt(ax * ax * ax + ay * ay * ay);
  e += 0.07 * Math.sin(x * 0.0052 / S + 1.3) * Math.sin(y * 0.0066 / S + 0.4) + 0.04 * Math.sin((x + y) * 0.011 / S + 2.2) * Math.cos((x - y) * 0.009 / S);
  for (var i = 0; i < stones.length; i++) {
    var s = stones[i];
    var d = (Math.hypot(x - s.x, y - s.y) - s.r) / (M * 0.4);
    if (d < e) e = d;
  }
  return clamp(e, 0, 1);
}
var RAMP = [[0, hex(C.jade)], [0.19, [116, 186, 170]], [0.52, hex(C.teal)], [1, [22, 60, 70]]];
function ramp(e, out) {
  e = Math.pow(e, 1.12);
  for (var i = 1; i < RAMP.length; i++) {
    if (e <= RAMP[i][0]) {
      var a = RAMP[i - 1], b = RAMP[i], t = (e - a[0]) / (b[0] - a[0]);
      t = t * t * (3 - 2 * t);
      out[0] = lerp(a[1][0], b[1][0], t); out[1] = lerp(a[1][1], b[1][1], t); out[2] = lerp(a[1][2], b[1][2], t);
      return;
    }
  }
  out[0] = RAMP[3][1][0]; out[1] = RAMP[3][1][1]; out[2] = RAMP[3][1][2];
}
function paintFloor() {
  floorCv.width = Math.round(W); floorCv.height = Math.round(H);
  var c = floorCv.getContext('2d');
  var q = 5, gw = Math.ceil(W / q) + 1, gh = Math.ceil(H / q) + 1;
  var t = document.createElement('canvas'); t.width = gw; t.height = gh;
  var tc = t.getContext('2d'), img = tc.createImageData(gw, gh), d = img.data, col = [0, 0, 0];
  var r = rngf(4411);
  for (var y = 0; y < gh; y++) {
    for (var x = 0; x < gw; x++) {
      ramp(depthAt(x * q, y * q), col);
      var k = (y * gw + x) * 4, n = (r() - 0.5) * 5;
      d[k] = col[0] + n; d[k + 1] = col[1] + n; d[k + 2] = col[2] + n; d[k + 3] = 255;
    }
  }
  tc.putImageData(img, 0, 0);
  c.imageSmoothingEnabled = true; c.imageSmoothingQuality = 'high';
  c.drawImage(t, 0, 0, gw * q, gh * q);
  /* pebbles on the floor: crisp in the shallows, lost in the deep */
  var count = Math.round(W * H / 1250);
  for (var i = 0; i < count; i++) {
    var px = r() * W, py = r() * H, e = depthAt(px, py);
    var vis = Math.pow(1 - e, 1.6) + 0.12;
    var rad = (1.6 + r() * r() * 7.5) * S, rot = r() * Math.PI, sq = 0.6 + r() * 0.4;
    var light = r() > 0.45;
    c.fillStyle = 'rgba(20,50,58,' + (0.10 * vis) + ')';
    c.beginPath(); c.ellipse(px + rad * 0.25, py + rad * 0.4, rad, rad * sq, rot, 0, TAU); c.fill();
    c.fillStyle = light ? 'rgba(255,255,255,' + ((0.10 + r() * 0.16) * vis) + ')' : 'rgba(20,50,58,' + ((0.07 + r() * 0.12) * vis) + ')';
    c.beginPath(); c.ellipse(px, py, rad, rad * sq, rot, 0, TAU); c.fill();
    if (light && rad > 3 * S) {
      c.fillStyle = 'rgba(255,255,255,' + (0.16 * vis) + ')';
      c.beginPath(); c.ellipse(px - rad * 0.25, py - rad * 0.25, rad * 0.45, rad * sq * 0.4, rot, 0, TAU); c.fill();
    }
  }
}

/* ---------- caustics (low-res, scaled up) ---------- */
function setupCaustics() {
  var cell = Math.max(W, H) / 224;
  causCv.width = Math.max(8, Math.round(W / cell)); causCv.height = Math.max(8, Math.round(H / cell));
  causImg = causCtx.createImageData(causCv.width, causCv.height);
  causScale = TAU * (Math.max(W, H) / (S * 250)) / Math.max(causCv.width, causCv.height);
  causMask = new Float32Array(causCv.width * causCv.height);
  for (var my = 0; my < causCv.height; my++) for (var mx = 0; mx < causCv.width; mx++) {
    var me = depthAt((mx + 0.5) * W / causCv.width, (my + 0.5) * H / causCv.height);
    causMask[my * causCv.width + mx] = 255 * (1 - 0.62 * me * me) * (0.7 + 0.3 * Math.min(1, me * 4));
  }
  var d = causImg.data;
  for (var i = 0; i < d.length; i += 4) { d[i] = 255; d[i + 1] = 255; d[i + 2] = 236; }
  if (gpuCaus) {
    var w = causCv.width, h = causCv.height, mb = new Uint8Array(w * h);
    for (var j = 0; j < mb.length; j++) mb[j] = Math.round(Math.min(255, Math.max(0, causMask[j])));
    glCv.width = w; glCv.height = h;
    gl.viewport(0, 0, w, h);
    gl.bindTexture(gl.TEXTURE_2D, glTex);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.ALPHA, w, h, 0, gl.ALPHA, gl.UNSIGNED_BYTE, mb);
    gl.uniform1f(glU.scale, causScale);
    gl.uniform2f(glU.size, w, h);
  }
  if (gpuCaus) renderCausticsGL(3.1); else paintCaustics(3.1);
}
function paintCaustics(time) {
  var cw = causCv.width, ch = causCv.height, d = causImg.data, sc = causScale, inten = 0.005, k = 3, mk = causMask, q = 0;
  for (var y = 0; y < ch; y++) {
    var py = y * sc - 250;
    for (var x = 0; x < cw; x++) {
      var px = x * sc - 250, ix = px, iy = py, c = 1;
      for (var n = 0; n < 3; n++) {
        var t = time * (1 - 3.5 / (n + 1));
        var nx = px + Math.cos(t - ix) + Math.sin(t + iy);
        var ny = py + Math.sin(t - iy) + Math.cos(t + ix);
        ix = nx; iy = ny;
        var a = px / (Math.sin(ix + t) / inten), b = py / (Math.cos(iy + t) / inten);
        c += 1 / Math.sqrt(a * a + b * b);
      }
      c /= 3;
      c = 1.17 - Math.pow(c, 1.4);
      var v = c * c; v = v * v; v = v * v;
      d[k] = (v > 1 ? 1 : v) * mk[q++];
      k += 4;
    }
  }
  causCtx.putImageData(causImg, 0, 0);
}
/* the same caustics on the GPU, every frame; paintCaustics above stays as the fallback */
(function () {
  gl = glCv.getContext('webgl', { alpha: true, premultipliedAlpha: false, preserveDrawingBuffer: true, antialias: false, depth: false, stencil: false });
  if (!gl) return;
  function sh(type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src); gl.compileShader(s);
    return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
  }
  var vs = sh(gl.VERTEX_SHADER, 'attribute vec2 aPos; void main() { gl_Position = vec4(aPos, 0.0, 1.0); }');
  var fs = sh(gl.FRAGMENT_SHADER, [
    'precision highp float;',
    'uniform float uTime; uniform float uScale; uniform vec2 uSize; uniform sampler2D uMask;',
    'void main() {',
    '  float x = floor(gl_FragCoord.x);',
    '  float y = uSize.y - 1.0 - floor(gl_FragCoord.y);',
    '  float px = x * uScale - 250.0, py = y * uScale - 250.0;',
    '  float ix = px, iy = py, c = 1.0;',
    '  for (int n = 0; n < 3; n++) {',
    '    float t = uTime * (1.0 - 3.5 / float(n + 1));',
    '    float nx = px + cos(t - ix) + sin(t + iy);',
    '    float ny = py + sin(t - iy) + cos(t + ix);',
    '    ix = nx; iy = ny;',
    '    float a = px / (sin(ix + t) / 0.005);',
    '    float b = py / (cos(iy + t) / 0.005);',
    '    c += 1.0 / sqrt(a * a + b * b);',
    '  }',
    '  c /= 3.0;',
    '  c = 1.17 - pow(c, 1.4);',
    '  float v = c * c; v = v * v; v = v * v;',
    '  float m = texture2D(uMask, vec2((x + 0.5) / uSize.x, (y + 0.5) / uSize.y)).a;',
    '  gl_FragColor = vec4(1.0, 1.0, 236.0 / 255.0, min(v, 1.0) * m);',
    '}'
  ].join('\n'));
  if (!vs || !fs) return;
  var pr = gl.createProgram();
  gl.attachShader(pr, vs); gl.attachShader(pr, fs); gl.linkProgram(pr);
  if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return;
  gl.useProgram(pr);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  var ap = gl.getAttribLocation(pr, 'aPos');
  gl.enableVertexAttribArray(ap);
  gl.vertexAttribPointer(ap, 2, gl.FLOAT, false, 0, 0);
  glTex = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, glTex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  glU = { time: gl.getUniformLocation(pr, 'uTime'), scale: gl.getUniformLocation(pr, 'uScale'), size: gl.getUniformLocation(pr, 'uSize') };
  gl.uniform1i(gl.getUniformLocation(pr, 'uMask'), 0);
  gpuCaus = true;
})();
function renderCausticsGL(time) {
  gl.uniform1f(glU.time, time);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
}
glCv.addEventListener('webglcontextlost', function (e) { e.preventDefault(); gpuCaus = false; paintCaustics(T * 0.42 + 3.1); });

/* ---------- entry points for main.js ---------- */
function buildFloor() { buildStones(); paintStones(); paintFloor(); setupCaustics(); }
function stepCaustics(frameN) {
  if (gpuCaus) { if (!calm && !covered) renderCausticsGL(T * 0.42 + 3.1); }
  else if (!calm && !covered && frameN % 3 === 0) paintCaustics(T * 0.42 + 3.1);
}
function refreshCausticsStill() { if (gpuCaus) renderCausticsGL(3.1); else paintCaustics(3.1); }
function drawFloor(c) { c.drawImage(floorCv, 0, 0, W, H); }
function drawCaustics(c, alpha) {
  c.globalCompositeOperation = 'lighter';
  c.globalAlpha = alpha;
  c.drawImage(gpuCaus ? glCv : causCv, 0, 0, W, H);
  c.globalCompositeOperation = 'source-over';
  c.globalAlpha = 1;
}
function drawStones(c) {
  for (var i = 0; i < stoneRects.length; i++) {
    var sr = stoneRects[i];
    c.drawImage(stoneCv, sr.x * DPR, sr.y * DPR, sr.w * DPR, sr.h * DPR, sr.x, sr.y, sr.w, sr.h);
  }
}

export { stones, onStone, depthAt, buildFloor, stepCaustics, refreshCausticsStill, drawFloor, drawCaustics, drawStones };
