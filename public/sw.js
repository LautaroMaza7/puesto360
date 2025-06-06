// Nombre del caché
const CACHE_NAME = 'shop-app-cache-v1';

// Archivos a cachear
const urlsToCache = [
  '/',
  '/offline.html',
  '/icons/menu.svg',
  '/icons/cart.svg',
  '/icons/user.svg',
  '/icons/search.svg',
  '/icons/search-black.svg',
  '/icons/orders.svg',
  '/icons/times.svg',
  '/icons/envelope.svg',
  '/icons/big-star.svg',
  '/icons/small-star.svg',
  '/placeholder.jpg',
  '/mercadopago.svg',
];

// Instalación del Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Activación del Service Worker
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Interceptación de peticiones
self.addEventListener('fetch', (event) => {
  // Solo interceptar peticiones GET
  if (event.request.method !== 'GET') return;

  // Estrategia: Cache First, then Network
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Clonar la petición
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(
          (response) => {
            // Verificar si la respuesta es válida
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clonar la respuesta
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        ).catch(() => {
          // Si falla la red y es una petición de documento, mostrar página offline
          if (event.request.mode === 'navigate') {
            return caches.match('/offline.html');
          }
        });
      })
  );
}); 