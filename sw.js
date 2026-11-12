/* Offline support. Every file the site uses is cached on install and served cache-first,
   so once installed (or visited once) the pond runs with no network.

   BUMP CACHE ON EVERY DEPLOY THAT CHANGES A FILE BELOW. Visitors keep the old files until
   this file changes. A new version downloads on the next visit and shows on the visit after. */
var CACHE = 'pond-v1';

var FILES = [
  './',
  'index.html',
  'me.png',
  'manifest.webmanifest',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/icon-maskable-512.png',
  'icons/apple-touch-icon.png',
  'pond/main.js',
  'pond/core.js',
  'pond/floor.js',
  'pond/surface.js',
  'pond/koi.js',
  'pond/input.js',
  'pond/sound.js',
  'pond/rain.js',
  'pond/intro.js',
  'pond/debug.js'
];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) {
    /* cache: 'reload' skips the HTTP cache, so a bump never stores a stale copy */
    return c.addAll(FILES.map(function (f) { return new Request(f, { cache: 'reload' }); }));
  }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  var nav = req.mode === 'navigate';
  e.respondWith(caches.open(CACHE).then(function (c) {
    /* pages ignore the query (?debug), and any page falls back to the pond */
    return c.match(req, { ignoreSearch: nav }).then(function (hit) {
      return hit || (nav ? c.match('./') : null);
    });
  }).then(function (hit) { return hit || fetch(req); }));
});
