const CACHE_NAME = 'elikia-tools-v1';
const urlsToCache = [
  './',
  './index.html',
  './index.tsx',
  './App.tsx',
  './types.ts',
  './metadata.json',
  './constants/styles.ts',
  './components/Header.tsx',
  './components/StyleButton.tsx',
  './components/TextAreaInput.tsx',
  './components/Instructions.tsx',
  './components/Sidebar.tsx',
  './components/ActionButton.tsx',
  './components/Slider.tsx',
  './components/Toggle.tsx',
  './components/FullscreenButton.tsx',
  './pages/FormatterPage.tsx',
  './pages/PrompterPage.tsx',
  './pages/BudgetPage.tsx',
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.23/jspdf.plugin.autotable.min.js',
  'https://raw.githubusercontent.com/Elikia-D/ELIKIA-Tools/main/public/icons/icon-192x192.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.error('Failed to cache all resources during install:', error);
      })
  );
});

self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) {
        return;
    }

    event.respondWith(
        caches.open(CACHE_NAME).then(cache => {
            return cache.match(event.request).then(response => {
                if (response) {
                    return response;
                }

                return fetch(event.request).then(networkResponse => {
                    if (networkResponse && networkResponse.status === 200) {
                        cache.put(event.request, networkResponse.clone());
                    }
                    return networkResponse;
                });
            });
        })
    );
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
