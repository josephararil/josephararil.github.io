// Part of the koi pond. Loaded only with ?debug in the URL; see README.
// Rule: never call an imported function or read an imported mutable binding at top level, only inside functions.

import { W, H, T } from './core.js';
import { onStone } from './floor.js';
import { fish, school } from './koi.js';
import { pellets, ripples } from './surface.js';
import { ptr } from './input.js';

function r2(v) { return Math.round(v * 100) / 100; }

function modes() {
  var m = { entering: 0, fleeing: 0, returning: 0, noticing: 0, feeding: 0, idle: 0 };
  for (var i = 0; i < fish.length; i++) {
    var f = fish[i];
    if (f.enter > 0) m.entering++;
    else if (f.fleeT > 0) m.fleeing++;
    else if (f.retT > 0) m.returning++;
    else if (pellets.length > 0 && f.notice > 0) m.noticing++;
    else if (pellets.length > 0) m.feeding++;
    else m.idle++;
  }
  return m;
}

function dump() {
  return {
    T: r2(T), W: W, H: H,
    ptr: { x: r2(ptr.x), y: r2(ptr.y), inside: ptr.inside, mouse: ptr.mouse, down: ptr.down, spd: r2(ptr.spd) },
    follower: school.follower ? fish.indexOf(school.follower) : null,
    followT: r2(school.followT),
    pellets: pellets.map(function (p) { return { x: r2(p.x), y: r2(p.y), t: r2(p.t), age: r2(p.age) }; }),
    fish: fish.map(function (f, i) {
      return { i: i, x: r2(f.x), y: r2(f.y), h: r2(f.h), speed: r2(f.speed), enter: r2(f.enter), fleeT: r2(f.fleeT),
        retT: r2(f.retT), retX: r2(f.retX), retY: r2(f.retY), notice: r2(f.notice), chew: r2(f.chew) };
    })
  };
}

/* pond frames per second: count animation frames on which the pond clock moved */
var frames = [], lastT = -1;
function tick(now) {
  if (T !== lastT) { frames.push(now); lastT = T; }
  while (frames.length && frames[0] < now - 1000) frames.shift();
  requestAnimationFrame(tick);
}

function start() {
  var el = document.createElement('pre');
  el.style.cssText = 'position:fixed;top:8px;left:50%;transform:translateX(-50%);margin:0;padding:6px 10px;' +
    'font:11px/1.45 monospace;font-style:normal;color:#14323A;background:rgba(255,255,255,.85);z-index:99;pointer-events:none;white-space:pre';
  document.body.appendChild(el);
  requestAnimationFrame(tick);
  setInterval(function () {
    var off = 0, st = 0, m = modes();
    for (var i = 0; i < pellets.length; i++) {
      var p = pellets[i];
      if (p.x < 0 || p.x > W || p.y < 0 || p.y > H) off++;
      if (onStone(p.x, p.y)) st++;
    }
    var fi = school.follower ? fish.indexOf(school.follower) : -1;
    el.textContent =
      'fps ' + frames.length + '   T ' + T.toFixed(1) + '   ripples ' + ripples.length + '\n' +
      'pellets: ' + pellets.length + ' (offscreen ' + off + ', onStone ' + st + ')\n' +
      'follower ' + (fi < 0 ? 'none' : fi) + '   followT ' + school.followT.toFixed(1) + '\n' +
      'entering ' + m.entering + '  fleeing ' + m.fleeing + '  returning ' + m.returning +
      '  noticing ' + m.noticing + '  feeding ' + m.feeding + '  idle ' + m.idle + '\n' +
      'ptr ' + (ptr.inside ? 'inside' : 'outside') + '/' + (ptr.mouse ? 'mouse' : 'touch') + '/' + (ptr.down ? 'down' : 'up') +
      ' ' + Math.round(ptr.x) + ',' + Math.round(ptr.y) + '   (press D to log state)';
  }, 250);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'd' || e.key === 'D') console.log(JSON.stringify(dump()));
  });
  window.__pond = { fish: fish, pellets: pellets, ripples: ripples, school: school, ptr: ptr };
}

export { start };
