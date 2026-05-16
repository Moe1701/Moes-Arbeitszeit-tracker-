const CACHE_NAME = 'arbeitszeit-v5';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  'https://cdn.tailwindcss.com',
  'https://unpkg.com/@phosphor-icons/web'
];

// Installiert den Service Worker und speichert die wichtigsten Dateien lokal
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Fängt Netzwerkanfragen ab
self.addEventListener('fetch', event => {
  // Ignoriere Anfragen an Google Drive, da diese immer live sein müssen
  if (event.request.url.includes('googleapis.com') || event.request.url.includes('accounts.google.com')) {
    return;
  }

  // Für die App-Dateien (HTML, CSS) nutze den Cache, falls offline
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
