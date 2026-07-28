/**
 * HAFROSE — Production Service Worker (Phase 5.10)
 *
 * Strategy: Stale-While-Revalidate for static assets + Network-First for API calls
 * Provides: Offline fallback, asset precaching, background sync
 */

const CACHE_VERSION = 'hafrose-v1.0';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const API_CACHE = `${CACHE_VERSION}-api`;

// Static assets to precache on install
const PRECACHE_ASSETS = [
  '/',
  '/offline.html',
  '/manifest.json',
];

// ── Install Event: Precache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// ── Activate Event: Clean up old cache versions
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== STATIC_CACHE && key !== API_CACHE)
          .map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// ── Fetch Event: Route-based caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests and browser-extension requests
  if (request.method !== 'GET' || !url.protocol.startsWith('http')) return;

  // API calls — Network First (fresh data, fallback cache on failure)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(API_CACHE).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Static/document requests — Stale While Revalidate
  event.respondWith(
    caches.match(request).then((cached) => {
      const networkFetch = fetch(request).then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(STATIC_CACHE).then((cache) => cache.put(request, clone));
        }
        return response;
      });

      // Return cached version immediately, update cache in background
      return cached || networkFetch.catch(() => {
        // Offline fallback for navigation requests
        if (request.destination === 'document') {
          return caches.match('/offline.html');
        }
      });
    })
  );
});

// ── Push notifications (ready to implement)
self.addEventListener('push', (event) => {
  if (!event.data) return;
  const data = event.data.json();
  const options = {
    body: data.body || 'Nouvelle notification de Maison Hafrose',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    tag: data.tag || 'hafrose-notification',
    renotify: true,
    data: { url: data.url || '/' },
  };
  event.waitUntil(
    self.registration.showNotification(data.title || 'Maison Hafrose', options)
  );
});

// ── Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
