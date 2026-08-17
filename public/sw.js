// Minimal offline-capable service worker. Chrome requires a fetch handler that
// can serve the app shell offline before it will offer the install prompt.
const CACHE = 'spr-v2';
const SHELL = ['/Smart-Photo-Resizer/', '/Smart-Photo-Resizer/index.html'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;

  // Navigations: network first, falling back to the cached shell when offline.
  // `cache: 'no-cache'` forces revalidation with the server — a plain fetch()
  // can be answered from the browser's HTTP cache, and GitHub Pages serves
  // index.html with max-age=600, so a fresh deploy would be invisible for ten
  // minutes while the stale shell kept pointing at the previous asset hashes.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request, { cache: 'no-cache' })
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put('/Smart-Photo-Resizer/index.html', copy));
          return res;
        })
        .catch(() => caches.match('/Smart-Photo-Resizer/index.html'))
    );
    return;
  }

  // Hashed build assets: cache first, they never change under a given name.
  event.respondWith(
    caches.match(request).then(
      (hit) =>
        hit ||
        fetch(request).then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(request, copy));
          }
          return res;
        })
    )
  );
});
