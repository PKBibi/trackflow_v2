const CACHE_NAME = 'trackflow-v1';
const STATIC_CACHE = 'trackflow-static-v1';
const DYNAMIC_CACHE = 'trackflow-dynamic-v1';

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/offline',
  '/manifest.json',
  '/favicon.ico'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('[Service Worker] Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== STATIC_CACHE && key !== DYNAMIC_CACHE)
          .map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch event - network first, cache fallback strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip chrome-extension and non-http(s) requests
  if (url.protocol === 'chrome-extension:' || !url.protocol.startsWith('http')) {
    return;
  }

  // API calls - network only
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request).catch(() => {
        return new Response(
          JSON.stringify({ error: 'Offline', message: 'You are currently offline' }),
          {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      })
    );
    return;
  }

  // Static assets - cache first
  if (request.destination === 'image' || 
      request.destination === 'font' ||
      url.pathname.includes('.css') ||
      url.pathname.includes('.js')) {
    event.respondWith(
      caches.match(request).then((response) => {
        return response || fetch(request).then((fetchResponse) => {
          return caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(request, fetchResponse.clone());
            return fetchResponse;
          });
        });
      })
    );
    return;
  }

  // HTML pages - network first, cache fallback
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Clone the response before caching
        const responseToCache = response.clone();
        caches.open(DYNAMIC_CACHE).then((cache) => {
          cache.put(request, responseToCache);
        });
        return response;
      })
      .catch(() => {
        return caches.match(request).then((response) => {
          if (response) {
            return response;
          }
          // Return offline page for navigation requests
          if (request.mode === 'navigate') {
            return caches.match('/offline');
          }
          return new Response('Offline', { status: 503 });
        });
      })
  );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Background sync', event.tag);
  
  if (event.tag === 'sync-time-entries') {
    event.waitUntil(syncTimeEntries());
  } else if (event.tag === 'sync-projects') {
    event.waitUntil(syncProjects());
  }
});

// Push notifications
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push received');
  
  let notification = {
    title: 'TrackFlow',
    body: 'You have a new notification',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [200, 100, 200],
    data: {}
  };

  if (event.data) {
    try {
      const data = event.data.json();
      notification = { ...notification, ...data };
    } catch (e) {
      notification.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(notification.title, notification)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification clicked');
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Check if app is already open
      for (let client of windowClients) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // Open new window if not found
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Helper functions for background sync
async function syncTimeEntries() {
  try {
    const cache = await caches.open('trackflow-offline-queue');
    const requests = await cache.keys();
    
    for (const request of requests) {
      if (request.url.includes('/api/time-entries')) {
        try {
          const response = await fetch(request.clone());
          if (response.ok) {
            await cache.delete(request);
          }
        } catch (error) {
          console.error('[Service Worker] Sync failed for:', request.url);
        }
      }
    }
  } catch (error) {
    console.error('[Service Worker] Sync error:', error);
  }
}

async function syncProjects() {
  try {
    const cache = await caches.open('trackflow-offline-queue');
    const requests = await cache.keys();
    
    for (const request of requests) {
      if (request.url.includes('/api/projects')) {
        try {
          const response = await fetch(request.clone());
          if (response.ok) {
            await cache.delete(request);
          }
        } catch (error) {
          console.error('[Service Worker] Sync failed for:', request.url);
        }
      }
    }
  } catch (error) {
    console.error('[Service Worker] Sync error:', error);
  }
}

