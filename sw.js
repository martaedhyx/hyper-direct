/* Hyper Direct service worker (ES5, minimal).
   - index.html / navigasi: NETWORK-FIRST (versi baru selalu diambil; cache hanya cadangan saat offline)
   - version.json: tidak pernah disentuh (cek versi & reload otomatis tetap jalan)
   - ikon & manifest: cache-first
   - lintas domain (PeerJS, sinyal 0.peerjs.com, CDN, Google Fonts): tidak pernah disentuh / dicache */
var SW_VERSION = '2026.10.08-r20';
var CACHE = 'hd-shell-' + SW_VERSION;
var STATIC = ['icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-maskable-512.png', 'icons/favicon-32.png', 'apple-touch-icon.png', 'manifest.webmanifest'];
var SCOPE = self.registration ? self.registration.scope : self.location.href.replace(/sw\.js.*$/, '');

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(STATIC); })['catch'](function () {}).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k.indexOf('hd-shell-') === 0 && k !== CACHE; }).map(function (k) { return caches['delete'](k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.origin !== self.location.origin || req.url.indexOf(SCOPE) !== 0) return;   // lintas domain: biarkan browser
  var path = url.pathname.slice(new URL(SCOPE).pathname.length);
  if (path === 'version.json' || path === 'sw.js') return;                            // selalu langsung ke jaringan
  var isPage = req.mode === 'navigate' || path === '' || path === 'index.html';
  if (isPage) {
    e.respondWith(fetch(new Request(req.url, { cache: 'no-store', credentials: 'same-origin' })).then(function (res) {
      if (res && res.redirected) return fetch(req);        // jangan kirim respons hasil redirect ke navigasi
      if (res && res.ok) { var copy = res.clone(); caches.open(CACHE).then(function (c) { c.put(SCOPE, copy); }); }
      return res;
    })['catch'](function () {
      return caches.match(SCOPE).then(function (r) {
        return r || new Response('<meta charset="utf-8"><body style="background:#0a1324;color:#e6edf7;font-family:sans-serif;padding:24px">Offline. Hyper Direct butuh internet untuk menyambung ke HP teman.</body>', { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
      });
    }));
    return;
  }
  if (STATIC.indexOf(path) >= 0 || path === 'icons/icon.svg' || path === 'favicon.ico') {
    e.respondWith(caches.match(req).then(function (r) {
      return r || fetch(req).then(function (res) { if (res && res.ok) { var copy = res.clone(); caches.open(CACHE).then(function (c) { c.put(req, copy); }); } return res; });
    }));
  }
});
