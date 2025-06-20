// lib/pwa-config.ts - Централизованная конфигурация PWA
export const PWA_CONFIG = {
  // Основные настройки
  name: "FitFlow Pro",
  shortName: "FitFlow",
  description: "Умная система управления фитнес-центром",
  version: "2.1.0",
  
  // Цвета и темы
  colors: {
    primary: "#3b82f6",
    secondary: "#10b981", 
    background: "#ffffff",
    surface: "#f8fafc",
    accent: "#8b5cf6"
  },
  
  // Настройки установки
  install: {
    showAfterVisits: 3,
    showAfterTime: 30000, // 30 секунд
    reShowAfterDismiss: 86400000, // 24 часа
    maxDismissals: 3
  },
  
  // Настройки кеша
  cache: {
    version: "v2.1.0",
    staticCacheName: "fitflow-static-v2.1.0",
    dynamicCacheName: "fitflow-dynamic-v2.1.0",
    offlinePages: ["/", "/offline", "/auth/face-auth"],
    maxDynamicCacheSize: 50,
    cacheTimeout: 86400000 // 24 часа
  },
  
  // Настройки уведомлений
  notifications: {
    icon: "/icons/notification-icon.png",
    badge: "/icons/notification-badge.png",
    defaultTitle: "FitFlow Pro",
    defaultOptions: {
      icon: "/icons/notification-icon.png",
      badge: "/icons/notification-badge.png",
      vibrate: [300, 100, 400],
      requireInteraction: true,
      actions: [
        {
          action: "open",
          title: "Открыть",
          icon: "/icons/action-open.png"
        },
        {
          action: "dismiss", 
          title: "Закрыть",
          icon: "/icons/action-close.png"
        }
      ]
    }
  },
  
  // Настройки офлайн режима
  offline: {
    fallbackPage: "/offline",
    cachableRoutes: [
      "/",
      "/admin",
      "/profile", 
      "/trainers",
      "/programs",
      "/auth/face-auth"
    ],
    networkFirstRoutes: [
      "/api/",
      "/auth/"
    ],
    cacheFirstRoutes: [
      "/icons/",
      "/images/",
      "/_next/static/"
    ]
  },
  
  // Настройки UI
  ui: {
    showInstallBanner: true,
    showOfflineIndicator: true,
    showUpdatePrompt: true,
    animationDuration: 300,
    toastDuration: 5000
  },
  
  // Аналитика и метрики
  analytics: {
    trackInstalls: true,
    trackOfflineUsage: true,
    trackCacheHits: true,
    trackNotificationClicks: true
  },
  
  // Функции по умолчанию
  features: {
    backgroundSync: true,
    periodicSync: true,
    pushNotifications: true,
    offlineFormsSync: true,
    autoUpdate: true
  }
} as const;

// Типы для TypeScript
export type PWAConfig = typeof PWA_CONFIG;
export type PWAColors = typeof PWA_CONFIG.colors;
export type PWAInstallConfig = typeof PWA_CONFIG.install;
export type PWACacheConfig = typeof PWA_CONFIG.cache;
export type PWANotificationConfig = typeof PWA_CONFIG.notifications;
export type PWAOfflineConfig = typeof PWA_CONFIG.offline;
export type PWAUIConfig = typeof PWA_CONFIG.ui;
export type PWAAnalyticsConfig = typeof PWA_CONFIG.analytics;
export type PWAFeaturesConfig = typeof PWA_CONFIG.features;
