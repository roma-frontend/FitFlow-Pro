// app/manifest.ts - Полная версия с улучшениями
import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "FitFlow Pro - Умная система управления фитнес-центром",
    short_name: "FitFlow Pro",
    description: "Современная PWA система управления фитнес-центром с биометрическим доступом и офлайн возможностями",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#3b82f6",
    orientation: "portrait-primary",
    scope: "/",
    lang: "ru",
    categories: [
      "fitness",
      "health", 
      "lifestyle",
      "productivity",
      "business"
    ],
    
    // ✅ Расширенные настройки PWA
    prefer_related_applications: false,
    related_applications: [],
    dir: "ltr",
    
    icons: [
      // Основные иконки
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any"
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512", 
        type: "image/png",
        purpose: "any"
      },
      // Maskable иконки (для адаптивного дизайна)
      {
        src: "/icons/manifest-icon-192.maskable.png",
        sizes: "192x192",
        type: "image/png", 
        purpose: "maskable"
      },
      {
        src: "/icons/manifest-icon-512.maskable.png",
        sizes: "512x512",
        type: "image/png", 
        purpose: "maskable"
      },
      // Полный набор размеров
      {
        src: "/icons/icon-16x16.png",
        sizes: "16x16",
        type: "image/png",
        purpose: "any"
      },
      {
        src: "/icons/icon-32x32.png", 
        sizes: "32x32",
        type: "image/png",
        purpose: "any"
      },
      {
        src: "/icons/icon-72x72.png",
        sizes: "72x72", 
        type: "image/png",
        purpose: "any"
      },
      {
        src: "/icons/icon-96x96.png",
        sizes: "96x96",
        type: "image/png",
        purpose: "any"
      },
      {
        src: "/icons/icon-128x128.png",
        sizes: "128x128",
        type: "image/png", 
        purpose: "any"
      },
      {
        src: "/icons/icon-144x144.png",
        sizes: "144x144",
        type: "image/png",
        purpose: "any"
      },
      {
        src: "/icons/icon-152x152.png", 
        sizes: "152x152",
        type: "image/png",
        purpose: "any"
      },
      {
        src: "/icons/icon-384x384.png",
        sizes: "384x384",
        type: "image/png",
        purpose: "any"
      },
      // Apple Touch Icons
      {
        src: "/icons/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
        purpose: "any"
      }
    ],
    
    // ✅ Скриншоты для лучшего отображения в магазинах приложений
    screenshots: [
      {
        src: "/screenshots/desktop-dashboard.png",
        sizes: "1280x720",
        type: "image/png",
        form_factor: "wide",
        label: "Главная панель управления - Рабочий стол"
      },
      {
        src: "/screenshots/desktop-schedule.png",
        sizes: "1280x720", 
        type: "image/png",
        form_factor: "wide",
        label: "Расписание тренировок - Рабочий стол"
      },
      {
        src: "/screenshots/desktop-members.png",
        sizes: "1280x720",
        type: "image/png", 
        form_factor: "wide",
        label: "Управление участниками - Рабочий стол"
      },
      {
        src: "/screenshots/mobile-dashboard.png",
        sizes: "390x844",
        type: "image/png",
        form_factor: "narrow", 
        label: "Главная панель - Мобильная версия"
      },
      {
        src: "/screenshots/mobile-schedule.png",
        sizes: "390x844",
        type: "image/png",
        form_factor: "narrow",
        label: "Расписание - Мобильная версия"
      },
      {
        src: "/screenshots/mobile-profile.png",
        sizes: "390x844", 
        type: "image/png",
        form_factor: "narrow",
        label: "Профиль пользователя - Мобильная версия"
      }
    ],
    
    shortcuts: [
      {
        name: "Расписание",
        short_name: "Расписание", 
        description: "Просмотр расписания тренировок",
        url: "/schedule",
        icons: [
          {
            src: "/icons/shortcut-schedule.png",
            sizes: "96x96",
            type: "image/png"
          }
        ]
      },
      {
        name: "Участники",
        short_name: "Участники",
        description: "Управление участниками", 
        url: "/members",
        icons: [
          {
            src: "/icons/shortcut-members.png",
            sizes: "96x96",
            type: "image/png"
          }
        ]
      },
      {
        name: "Тренеры",
        short_name: "Тренеры",
        description: "Управление тренерами",
        url: "/trainers", 
        icons: [
          {
            src: "/icons/shortcut-trainers.png",
            sizes: "96x96",
            type: "image/png"
          }
        ]
      },
      {
        name: "Аналитика",
        short_name: "Аналитика",
        description: "Статистика и отчеты",
        url: "/analytics",
        icons: [
          {
            src: "/icons/shortcut-analytics.png", 
            sizes: "96x96",
            type: "image/png"
          }
        ]
      }
    ]
  }
}
