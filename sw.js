const CACHE_NAME = 'paytrack-v1';
const urlsToCache = [
  './',
  './index.html',
  './statistics.html',
  './history.html',
  './limits.html',
  './settings.html',
  './app.js'
];

// Встановлення та кешування файлів
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// Віддача файлів з кешу, якщо немає інтернету
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
