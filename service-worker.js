/* ═══════════════════════════════════════════════════
   SERVICE WORKER — Famille Photos PWA
   Stratégie : Cache-first pour assets, Network-first pour API
═══════════════════════════════════════════════════ */

const CACHE_NAME    = 'famille-v1';
const CACHE_ASSETS  = 'famille-assets-v1';
const CACHE_IMAGES  = 'famille-images-v1';

/* Fichiers à pré-cacher au premier chargement */
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/manifest.json',
  '/photo.png',
];

/* ─── INSTALLATION ─────────────────────────────── */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_ASSETS)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

/* ─── ACTIVATION ───────────────────────────────── */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== CACHE_ASSETS && k !== CACHE_IMAGES)
          .map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

/* ─── INTERCEPTION DES REQUÊTES ────────────────── */
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  /* API calls → Network-first (pas de cache) */
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request).catch(() =>
        new Response(JSON.stringify({ error: 'Offline' }), {
          headers: { 'Content-Type': 'application/json' }
        })
      )
    );
    return;
  }

  /* Images Cloudinary → Cache-first avec fallback réseau */
  if (url.hostname.includes('cloudinary.com') || url.hostname.includes('res.cloudinary.com')) {
    event.respondWith(
      caches.open(CACHE_IMAGES).then(cache =>
        cache.match(event.request).then(cached => {
          if (cached) return cached;
          return fetch(event.request).then(response => {
            if (response.ok) cache.put(event.request, response.clone());
            return response;
          });
        })
      )
    );
    return;
  }

  /* Assets statiques → Cache-first */
  if (['style.css', 'script.js', 'manifest.json', 'photo.png'].some(f => url.pathname.includes(f))
      || url.pathname === '/'
      || url.pathname === '/index.html') {
    event.respondWith(
      caches.open(CACHE_ASSETS).then(cache =>
        cache.match(event.request).then(cached => {
          if (cached) return cached;
          return fetch(event.request).then(response => {
            if (response.ok) cache.put(event.request, response.clone());
            return response;
          });
        })
      )
    );
    return;
  }

  /* Google Fonts → Cache-first */
  if (url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com')) {
    event.respondWith(
      caches.open(CACHE_ASSETS).then(cache =>
        cache.match(event.request).then(cached => {
          if (cached) return cached;
          return fetch(event.request).then(response => {
            cache.put(event.request, response.clone());
            return response;
          });
        })
      )
    );
    return;
  }

  /* Tout le reste → Network */
  event.respondWith(fetch(event.request));
});
