const CACHE_NAME = 'foodwise-cache-v3';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './assets/css/styles.css',
  './assets/js/app.js',
  './assets/js/db.js',
  './assets/js/modules/auth.js',
  './assets/js/modules/family.js',
  './assets/js/modules/inventory.js',
  './assets/js/modules/recipes.js',
  './assets/js/modules/shopping.js',
  './pages/login.html',
  './pages/register.html',
  './pages/setup-family.html',
  './pages/dashboard.html',
  './pages/inventory.html',
  './pages/recipes.html',
  './pages/shopping-list.html',
  './pages/family-management.html',
  './pages/meal-plan.html',
  './pages/alerts.html',
  './pages/offline.html'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const requestUrl = new URL(event.request.url);

  if (requestUrl.origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request)
        .then((networkResponse) => {
          if (
            event.request.mode === 'navigate' ||
            requestUrl.pathname.startsWith('/assets/') ||
            requestUrl.pathname.endsWith('.html')
          ) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
          }

          return networkResponse;
        })
        .catch(() => {
          if (event.request.mode === 'navigate') {
            return caches.match('./pages/offline.html') || caches.match('./index.html');
          }

          return caches.match('./pages/offline.html');
        });
    })
  );
});