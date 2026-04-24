// ============================================================
// LexRise Service Worker
// Strategy: Cache-first for app shell, network-first for fresh data
//
// BASE_PATH is injected at build time by Vite's define config.
// On GitHub Pages: /lexrise/   On custom domain: /
// ============================================================

// __BASE_PATH__ is replaced by Vite's define plugin at build time.
// Falls back to '/' for local dev (where define isn't set).
const BASE = (typeof __BASE_PATH__ !== 'undefined') ? __BASE_PATH__ : '/';

const CACHE_NAME = 'lexrise-v2';

// App shell — cache these on install so the app loads offline
const PRECACHE_URLS = [
  BASE,
  BASE + 'manifest.json',
  BASE + 'favicon.svg',
  BASE + 'icon-192.svg',
  BASE + 'icon-512.svg',
  BASE + 'apple-touch-icon.svg',
];

// ── Install: pre-cache the app shell ──────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// ── Activate: clean up old caches ─────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// ── Fetch: cache-first for assets, network for everything else
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  if (!event.request.url.startsWith('http')) return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;

      return fetch(event.request)
        .then(response => {
          if (
            response.ok &&
            (event.request.url.includes('/assets/') ||
             event.request.url.endsWith('.svg') ||
             event.request.url.endsWith('.js') ||
             event.request.url.endsWith('.css'))
          ) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => {
          if (event.request.mode === 'navigate') {
            return caches.match(BASE);
          }
        });
    })
  );
});

// ── Message: handle skip-waiting ──────────────────────────
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});
