// public/js/sw-bridge.js
class ServiceWorkerBridge {
  constructor() {
    this.sw = null;
    this.isOnline = navigator.onLine;
    this.init();
  }

  async init() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('[SW Bridge] Service Worker registered:', registration);
        
        this.sw = registration;
        this.setupEventListeners();
        
        // Проверяем обновления SW
        this.checkForUpdates();
      } catch (error) {
        console.error('[SW Bridge] Service Worker registration failed:', error);
      }
    }
  }

  setupEventListeners() {
    // Слушаем изменения сетевого статуса
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.notifyNetworkChange(true);
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.notifyNetworkChange(false);
    });

    // Слушаем сообщения от SW
    navigator.serviceWorker.addEventListener('message', (event) => {
      this.handleServiceWorkerMessage(event);
    });
  }

  // Отправка сообщения в Service Worker
  sendMessage(message) {
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage(message);
    }
  }

  // Обработка сообщений от Service Worker
  handleServiceWorkerMessage(event) {
    const { type, data } = event.data;
    
    switch (type) {
      case 'CACHE_SIZE':
        console.log('[SW Bridge] Cache size:', data.size);
        break;
      case 'SYNC_COMPLETE':
        console.log('[SW Bridge] Sync completed');
        break;
      default:
        console.log('[SW Bridge] Unknown message:', event.data);
    }
  }

  // Уведомление об изменении сети
  notifyNetworkChange(isOnline) {
    console.log('[SW Bridge] Network status:', isOnline ? 'online' : 'offline');
    
    // Отправляем событие в приложение
    window.dispatchEvent(new CustomEvent('networkchange', {
      detail: { isOnline }
    }));
  }

  // Проверка обновлений SW
  async checkForUpdates() {
    if (this.sw) {
      try {
        await this.sw.update();
        console.log('[SW Bridge] Checked for updates');
      } catch (error) {
        console.error('[SW Bridge] Update check failed:', error);
      }
    }
  }

  // Кеширование URL'ов
  cacheUrls(urls) {
    this.sendMessage({
      type: 'CACHE_URLS',
      urls: urls
    });
  }

  // Очистка кеша
  clearCache(cacheName = null) {
    this.sendMessage({
      type: 'CLEAR_CACHE',
      cacheName: cacheName
    });
  }

  // Получение размера кеша
  async getCacheSize() {
    return new Promise((resolve) => {
      const channel = new MessageChannel();
      
      channel.port1.onmessage = (event) => {
        if (event.data.type === 'CACHE_SIZE') {
          resolve(event.data.size);
        }
      };

      this.sendMessage({
        type: 'GET_CACHE_SIZE'
      }, [channel.port2]);
    });
  }
}

// Инициализация
const swBridge = new ServiceWorkerBridge();

// Экспорт для использования в приложении
window.swBridge = swBridge;

console.log('[SW Bridge] Loaded successfully');
