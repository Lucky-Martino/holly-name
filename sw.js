const STATIC_CACHE = 'holly-name-static-v1';
const DYNAMIC_CACHE = 'holly-name-dynamic-v1';
const NAMES_CACHE = 'holly-name-data-v1';
const BACKGROUND_SYNC_TAG = 'holly-name-sync';

// Offline fallback pages
const OFFLINE_URL = '/offline.html';
const OFFLINE_IMG = '/icons/offline.png';

// Assets to cache
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/styles.css',
  '/script.js',
  '/js/db.js',
  '/name-generator.html',
  '/name-generator.css',
  '/name-generator.js',
  '/name-meaning.html',
  '/name-meaning.css',
  '/name-meaning.js',
  '/name-quiz.html',
  '/name-quiz.css',
  '/name-quiz.js',
  '/name-database.js',
  '/name-meanings.js',
  '/manifest.json',
  '/1.jpg',
  '/2.png',
  '/3.png',
  '/4.jpg',
  '/7.png',
  '/icons/offline.png'
];

// External resources to cache
const EXTERNAL_ASSETS = [
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Lato:wght@400;700&display=swap'
];

// Install service worker
self.addEventListener('install', event => {
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then(cache => {
        console.log('Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      }),
      caches.open(DYNAMIC_CACHE).then(cache => {
        console.log('Caching external assets');
        return cache.addAll(EXTERNAL_ASSETS);
      })
    ])
  );
});

// Fetch event handler with improved offline support
self.addEventListener('fetch', event => {
  const { request } = event;

  // Handle API requests
  if (request.url.includes('/api/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // Handle static assets
  event.respondWith(
    caches.match(request)
      .then(response => {
        if (response) {
          return response;
        }

        return fetch(request)
          .then(response => {
            // Cache dynamic content
            if (response.ok && request.method === 'GET') {
              const responseToCache = response.clone();
              caches.open(DYNAMIC_CACHE)
                .then(cache => cache.put(request, responseToCache));
            }
            return response;
          })
          .catch(() => {
            // Return offline page for navigation requests
            if (request.mode === 'navigate') {
              return caches.match(OFFLINE_URL);
            }
            // Return offline image for image requests
            if (request.destination === 'image') {
              return caches.match(OFFLINE_IMG);
            }
          });
      })
  );
});

// Handle API requests with offline support
async function handleApiRequest(request) {
  try {
    const response = await fetch(request);
    if (response.ok && request.method === 'GET') {
      const cache = await caches.open(NAMES_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // If it's a POST request, store for background sync
    if (request.method === 'POST') {
      await saveForBackgroundSync(request);
      return new Response(JSON.stringify({ 
        status: 'offline',
        message: 'Your request will be processed when you are back online'
      }));
    }
  }
}

// Background Sync
self.addEventListener('sync', event => {
  if (event.tag === BACKGROUND_SYNC_TAG) {
    event.waitUntil(syncData());
  }
});

async function saveForBackgroundSync(request) {
  const db = await import('./js/db.js');
  await db.default.addPendingOperation({
    url: request.url,
    method: request.method,
    body: await request.clone().text()
  });
}

async function syncData() {
  const db = await import('./js/db.js');
  const operations = await db.default.getPendingOperations();

  for (const operation of operations) {
    try {
      const response = await fetch(operation.url, {
        method: operation.method,
        body: operation.body,
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        await db.default.clearPendingOperation(operation.id);
      }
    } catch (error) {
      console.error('Sync failed:', error);
    }
  }
}

// Update service worker
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
