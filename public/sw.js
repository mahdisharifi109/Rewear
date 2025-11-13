// Service Worker básico para PWA
// Cache de recursos estáticos para melhor performance offline

const CACHE_NAME = 'rewear-v1';
const urlsToCache = [
  '/',
  '/catalog',
  '/about',
  '/faq',
  '/contact',
  '/manifest.json',
];

// Instalação do Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache aberto');
        return cache.addAll(urlsToCache);
      })
  );
});

// Ativação do Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Cache antigo removido:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Estratégia: Network First, fallback para Cache
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone da resposta para guardar no cache
        const responseToCache = response.clone();
        
        caches.open(CACHE_NAME)
          .then((cache) => {
            cache.put(event.request, responseToCache);
          });
        
        return response;
      })
      .catch(() => {
        // Se network falhar, tenta cache
        return caches.match(event.request)
          .then((response) => {
            if (response) {
              return response;
            }
            
            // Fallback para página offline (pode criar uma)
            if (event.request.destination === 'document') {
              return caches.match('/');
            }
          });
      })
  );
});
