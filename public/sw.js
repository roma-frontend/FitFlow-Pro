// public/sw.js - Исправленная версия
const CACHE_NAME = 'fitflow-v2.1.3';
const DYNAMIC_CACHE = 'fitflow-dynamic-v2.1.3';

// Ресурсы для кеширования
const STATIC_ASSETS = [
  '/',
  '/offline',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

// Домены, которые НЕ нужно кешировать, но разрешить
const EXTERNAL_SERVICES = [
  'stripe.com',
  'js.stripe.com',
  'google-analytics.com',
  'googletagmanager.com'
];

// Домены для кеширования изображений
const CACHEABLE_IMAGE_DOMAINS = [
  'res.cloudinary.com',
  'ui-avatars.com',
  'images.unsplash.com',
  'avatars.githubusercontent.com'
];

const AUTH_KEYS = ['auth_user', 'auth_token', 'user', 'token', 'session_id', 'user_role'];

// Пути, которые НЕ должны кэшироваться
const NO_CACHE_PATHS = [
  '/api/auth/',
  '/api/user/',
  '/login',
  '/logout',
  '/member-login',
  '/staff-login'
];

// Функция проверки внешних сервисов
function isExternalService(url) {
  return EXTERNAL_SERVICES.some(domain => url.hostname.includes(domain));
}

// Функция проверки кешируемых изображений
function isCacheableImage(url) {
  return CACHEABLE_IMAGE_DOMAINS.some(domain => url.hostname.includes(domain));
}

// Установка Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Pre-caching static assets');
        
        return Promise.allSettled(
          STATIC_ASSETS.map(async (url) => {
            try {
              const response = await fetch(url, {
                cache: 'no-cache'
              });
              if (response.ok) {
                return cache.put(url, response);
              }
            } catch (error) {
              console.warn('[SW] Error caching:', url, error);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] Skip waiting');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Install failed:', error);
      })
  );
});

// Активация Service Worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== DYNAMIC_CACHE) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Обработка fetch запросов
self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  // Проверяем протокол
  if (!request.url.startsWith('http')) {
    return;
  }
  
  const url = new URL(request.url);
  
  // 🔥 НОВОЕ: НЕ кэшируем auth-related запросы
  if (NO_CACHE_PATHS.some(path => url.pathname.includes(path))) {
    event.respondWith(fetch(request));
    return;
  }
  
  // Игнорируем внешние сервисы (Stripe, Analytics)
  if (isExternalService(url)) {
    return;
  }
  
  // Игнорируем Chrome extensions
  if (url.protocol === 'chrome-extension:') {
    return;
  }
  
  // Только GET запросы для кеширования
  if (request.method !== 'GET') {
    return;
  }
  
  // ✅ СПЕЦИАЛЬНАЯ ОБРАБОТКА для внешних изображений
  if (isCacheableImage(url)) {
    event.respondWith(imageFirstStrategy(request));
    return;
  }
  
  // API запросы (только внутренние)
  if (url.pathname.startsWith('/api/') && url.origin === self.location.origin) {
    event.respondWith(networkFirstStrategy(request));
    return;
  }
  
  // Статические ресурсы
  if (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|webp|svg|ico|woff|woff2)$/)
  ) {
    event.respondWith(cacheFirstStrategy(request));
    return;
  }
  
  // Навигационные запросы
  if (request.mode === 'navigate') {
    event.respondWith(staleWhileRevalidateStrategy(request));
    return;
  }
  
  // Остальные GET запросы (только для того же домена)
  if (url.origin === self.location.origin) {
    event.respondWith(networkFirstStrategy(request));
  }
});

// ✅ НОВАЯ СТРАТЕГИЯ для внешних изображений
async function imageFirstStrategy(request) {
  try {
    // Сначала пробуем сеть
    const networkResponse = await fetch(request, {
      mode: 'cors',
      credentials: 'omit'
    });
    
    if (networkResponse.ok && networkResponse.status < 400) {
      // Кешируем успешные ответы
      const responseToCache = networkResponse.clone();
      
      caches.open(DYNAMIC_CACHE)
        .then(cache => cache.put(request, responseToCache))
        .catch(error => console.warn('[SW] Failed to cache image:', error));
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed for image, trying cache:', request.url);
    
    // Если сеть недоступна, пробуем кеш
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Возвращаем fallback изображение
    return createFallbackImageResponse();
  }
}

// ✅ ФУНКЦИЯ создания fallback изображения
function createFallbackImageResponse() {
  // Простое SVG изображение как fallback
  const svg = `
    <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" fill="#f3f4f6"/>
      <text x="50" y="50" text-anchor="middle" dy=".3em" fill="#6b7280" font-family="Arial, sans-serif" font-size="12">
        No Image
      </text>
    </svg>
  `;
  
  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=300'
    }
  });
}

// Network First стратегия (без изменений)
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request, {
      credentials: 'same-origin'
    });
    
    if (networkResponse.ok && networkResponse.status < 400) {
      const responseToCache = networkResponse.clone();
      
      caches.open(DYNAMIC_CACHE)
        .then(cache => cache.put(request, responseToCache))
        .catch(error => console.warn('[SW] Cache put failed:', error));
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', request.url);
    
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    if (request.mode === 'navigate') {
      const offlineResponse = await caches.match('/offline');
      if (offlineResponse) {
        return offlineResponse;
      }
    }
    
    throw error;
  }
}

// Cache First стратегия (без изменений)
async function cacheFirstStrategy(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    if (request.url.includes('/_next/static/')) {
      fetch(request)
        .then(response => {
          if (response.ok) {
            return caches.open(CACHE_NAME)
              .then(cache => cache.put(request, response));
          }
        })
        .catch(() => {});
    }
    
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request, {
      credentials: 'same-origin'
    });
    
    if (networkResponse.ok && networkResponse.status < 400) {
      const responseToCache = networkResponse.clone();
      
      caches.open(CACHE_NAME)
        .then(cache => cache.put(request, responseToCache))
        .catch(error => console.warn('[SW] Cache put failed:', error));
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed for static resource:', request.url);
    throw error;
  }
}

// Stale While Revalidate стратегия (без изменений)
async function staleWhileRevalidateStrategy(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const cachedResponse = await cache.match(request);
  
  const fetchPromise = fetch(request, {
    credentials: 'same-origin'
  })
    .then((networkResponse) => {
      if (networkResponse.ok && networkResponse.status < 400) {
        const responseToCache = networkResponse.clone();
        cache.put(request, responseToCache)
          .catch(error => console.warn('[SW] Cache put failed:', error));
      }
      return networkResponse;
    })
    .catch(async (error) => {
      console.log('[SW] Network failed for navigation:', request.url);
      
      if (request.mode === 'navigate') {
        const offlineResponse = await caches.match('/offline');
        if (offlineResponse) {
          return offlineResponse;
        }
      }
      throw error;
    });
  
  return cachedResponse || await fetchPromise;
}


// ✅ ИСПРАВЛЕННАЯ функция кеширования URL'ов
async function cacheUrls(urls) {
  const cache = await caches.open(DYNAMIC_CACHE);
  
  return Promise.all(
    urls.map(async (url) => {
      try {
        const response = await fetch(url, { method: 'GET' }); // Явно указываем GET
        if (response.ok && response.status < 400) {
          return cache.put(url, response);
        }
      } catch (error) {
        console.log('[SW] Failed to cache:', url, error);
      }
    })
  );
}

// Остальные функции остаются без изменений...
// (push уведомления, sync, etc.)

// Обработка push уведомлений
self.addEventListener('push', (event) => {
  console.log('[SW] Push received');
  
  let notificationData = {};
  
  if (event.data) {
    try {
      notificationData = event.data.json();
    } catch (error) {
      notificationData = {
        title: 'FitFlow Pro',
        body: event.data.text() || 'У вас новое уведомление'
      };
    }
  }
  
  const options = {
    icon: '/icons/notification-icon.png',
    badge: '/icons/notification-badge.png',
    vibrate: [300, 100, 400],
    requireInteraction: true,
    actions: [
      {
        action: 'open',
        title: 'Открыть',
        icon: '/icons/action-open.png'
      },
      {
        action: 'dismiss',
        title: 'Закрыть',
        icon: '/icons/action-close.png'
      }
    ],
    data: {
      url: notificationData.url || '/',
      timestamp: Date.now()
    },
    ...notificationData
  };
  
  event.waitUntil(
    self.registration.showNotification(
      notificationData.title || 'FitFlow Pro',
      options
    )
  );
});

// Обработка кликов по уведомлениям
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.action);
  
  event.notification.close();
  
  if (event.action === 'dismiss') {
    return;
  }
  
  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Ищем уже открытую вкладку с приложением
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            return client.focus().then(() => {
              return client.navigate(urlToOpen);
            });
          }
        }
        
        // Открываем новую вкладку
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
  
  // Отправляем аналитику клика
  if (event.notification.data) {
    fetch('/api/analytics/notification-click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: event.action,
        timestamp: Date.now(),
        notificationData: event.notification.data
      })
    }).catch(() => {
      // Игнорируем ошибки аналитики
    });
  }
});

// Background Sync для офлайн действий
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
  
  if (event.tag === 'offline-form-sync') {
    event.waitUntil(syncOfflineForms());
  }
  
  if (event.tag === 'offline-analytics-sync') {
    event.waitUntil(syncOfflineAnalytics());
  }
});

// Синхронизация офлайн форм
async function syncOfflineForms() {
  try {
    const cache = await caches.open('offline-forms');
    const requests = await cache.keys();
    
    for (const request of requests) {
      const response = await cache.match(request);
      const formData = await response.json();
      
      try {
        await fetch(request.url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        
        // Удаляем из кеша после успешной отправки
        await cache.delete(request);
        
        // Уведомляем пользователя
        await self.registration.showNotification('Данные синхронизированы', {
          body: 'Офлайн формы успешно отправлены',
          icon: '/icons/sync-success.png',
          tag: 'sync-success'
        });
      } catch (error) {
        console.log('[SW] Failed to sync form:', error);
      }
    }
  } catch (error) {
    console.log('[SW] Sync forms failed:', error);
  }
}

// Синхронизация офлайн аналитики
async function syncOfflineAnalytics() {
  try {
    const analyticsData = await getOfflineAnalytics();
    
    if (analyticsData.length > 0) {
      await fetch('/api/analytics/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(analyticsData)
      });
      
      await clearOfflineAnalytics();
    }
  } catch (error) {
    console.log('[SW] Analytics sync failed:', error);
  }
}

// Вспомогательные функции для аналитики
async function getOfflineAnalytics() {
  // Реализация получения офлайн аналитики из IndexedDB
  return [];
}

async function clearOfflineAnalytics() {
  // Реализация очистки офлайн аналитики
}

// Обработка сообщений от главного потока
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);
  
  if (event.data && event.data.type) {
    switch (event.data.type) {
      // 🔥 НОВОЕ: Обработка LOGOUT
      case 'LOGOUT':
        console.log('[SW] Processing LOGOUT');
        event.waitUntil(handleLogout());
        break;
        
      case 'CACHE_URLS':
        event.waitUntil(
          cacheUrls(event.data.urls)
        );
        break;
        
      case 'CLEAR_CACHE':
        event.waitUntil(
          clearCache(event.data.cacheName)
        );
        break;
        
      case 'GET_CACHE_SIZE':
        event.waitUntil(
          getCacheSize().then(size => {
            event.ports[0]?.postMessage({ type: 'CACHE_SIZE', size });
          })
        );
        break;
        
      // 🔥 НОВОЕ: Skip waiting для обновления SW
      case 'SKIP_WAITING':
        self.skipWaiting();
        break;
    }
  }
});

async function handleLogout() {
  try {
    console.log('[SW] Starting logout cleanup...');
    
    // 1. Очищаем ВСЕ кэши
    const cacheNames = await caches.keys();
    console.log('[SW] Deleting caches:', cacheNames);
    
    await Promise.all(
      cacheNames.map(cacheName => {
        console.log('[SW] Deleting cache:', cacheName);
        return caches.delete(cacheName);
      })
    );
    
    // 2. Отправляем сообщение всем клиентам для очистки localStorage
    const clients = await self.clients.matchAll({ type: 'window' });
    console.log('[SW] Notifying clients:', clients.length);
    
    clients.forEach(client => {
      client.postMessage({
        type: 'CLEAR_AUTH_DATA',
        keys: AUTH_KEYS
      });
    });
    
    // 3. Очищаем любые другие данные
    if ('storage' in self && 'estimate' in self.storage) {
      // Проверяем, сколько места используется
      const estimate = await self.storage.estimate();
      console.log('[SW] Storage used:', estimate.usage, 'of', estimate.quota);
    }
    
    console.log('[SW] Logout cleanup completed');
    
  } catch (error) {
    console.error('[SW] Logout cleanup failed:', error);
  }
}

// Кеширование URL'ов по запросу
async function cacheUrls(urls) {
  const cache = await caches.open(DYNAMIC_CACHE);
  return Promise.all(
    urls.map(url => 
      fetch(url)
        .then(response => {
          if (response.ok) {
            return cache.put(url, response);
          }
        })
        .catch(error => {
          console.log('[SW] Failed to cache:', url, error);
        })
    )
  );
}

// Очистка конкретного кеша
async function clearCache(cacheName) {
  if (cacheName) {
    return caches.delete(cacheName);
  } else {
    const cacheNames = await caches.keys();
    return Promise.all(
      cacheNames.map(name => caches.delete(name))
    );
  }
}

// Получение размера кеша
// public/sw.js - продолжение функции getCacheSize
async function getCacheSize() {
  const cacheNames = await caches.keys();
  let totalSize = 0;
  
  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const requests = await cache.keys();
    
    for (const request of requests) {
      const response = await cache.match(request);
      if (response) {
        const blob = await response.blob();
        totalSize += blob.size;
      }
    }
  }
  
  return totalSize;
}

// Периодическая синхронизация (если поддерживается)
if ('periodicSync' in self.registration) {
  self.addEventListener('periodicsync', (event) => {
    console.log('[SW] Periodic sync:', event.tag);
    
    if (event.tag === 'daily-data-sync') {
      event.waitUntil(performDailySync());
    }
  });
}

// Ежедневная синхронизация данных
async function performDailySync() {
  try {
    // Предзагружаем важные данные
    const importantUrls = [
      '/api/user/profile',
      '/api/schedule/today',
      '/api/notifications/unread'
    ];
    
    await cacheUrls(importantUrls);
    
    // Очищаем старые кешированные данные (старше 7 дней)
    await cleanOldCache();
    
    console.log('[SW] Daily sync completed');
  } catch (error) {
    console.log('[SW] Daily sync failed:', error);
  }
}

// Очистка старого кеша
async function cleanOldCache() {
  const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
  const cache = await caches.open(DYNAMIC_CACHE);
  const requests = await cache.keys();
  
  for (const request of requests) {
    const response = await cache.match(request);
    if (response) {
      const dateHeader = response.headers.get('date');
      if (dateHeader && new Date(dateHeader).getTime() < oneWeekAgo) {
        await cache.delete(request);
      }
    }
  }
}

console.log('[SW] Service Worker loaded successfully');

