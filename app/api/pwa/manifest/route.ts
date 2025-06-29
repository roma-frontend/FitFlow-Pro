// app/api/pwa/manifest/route.ts - Полный манифест с расширенными свойствами
import { NextResponse } from 'next/server';

// Расширенный тип манифеста
interface ExtendedManifest {
  name: string;
  short_name: string;
  description: string;
  start_url: string;
  display: string;
  background_color: string;
  theme_color: string;
  orientation: string;
  scope: string;
  lang: string;
  categories: string[];
  dir: string;
  prefer_related_applications: boolean;
  icons: Array<{
    src: string;
    sizes: string;
    type: string;
    purpose: string;
  }>;
  shortcuts: Array<{
    name: string;
    short_name: string;
    description: string;
    url: string;
    icons: Array<{
      src: string;
      sizes: string;
      type?: string;
    }>;
  }>;
  screenshots: Array<{
    src: string;
    sizes: string;
    type: string;
    form_factor: string;
    label: string;
  }>;
  display_override: string[];
  protocol_handlers: Array<{
    protocol: string;
    url: string;
  }>;
  edge_side_panel: {
    preferred_width: number;
  };
  launch_handler: {
    client_mode: string;
  };
  file_handlers: Array<{
    action: string;
    accept: Record<string, string[]>;
  }>;
}

export async function GET() {
  const manifest: ExtendedManifest = {
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
    categories: ["fitness", "health", "lifestyle", "productivity", "business"],
    dir: "ltr",
    prefer_related_applications: false,
    
    icons: [
      {
        src: "/icons/manifest-icon-192.maskable.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any"
      },
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
        purpose: "any"
      },
      {
        src: "/icons/manifest-icon-512.maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable"
      }
    ],
    
    shortcuts: [
      {
        name: "Расписание",
        short_name: "Расписание",
        description: "Просмотр расписания тренировок",
        url: "/schedule",
        icons: [{ src: "/icons/icon-96x96.png", sizes: "96x96", type: "image/png" }]
      },
      {
        name: "Участники", 
        short_name: "Участники",
        description: "Управление участниками",
        url: "/members",
        icons: [{ src: "/icons/icon-96x96.png", sizes: "96x96", type: "image/png" }]
      },
      {
        name: "Тренеры",
        short_name: "Тренеры", 
        description: "Управление тренерами",
        url: "/trainers",
        icons: [{ src: "/icons/icon-96x96.png", sizes: "96x96", type: "image/png" }]
      },
      {
        name: "Аналитика",
        short_name: "Аналитика",
        description: "Статистика и отчеты",
        url: "/analytics",
        icons: [{ src: "/icons/icon-96x96.png", sizes: "96x96", type: "image/png" }]
      }
    ],
    
    screenshots: [
      {
        src: "/screenshots/desktop-1.png",
        sizes: "1280x720",
        type: "image/png",
        form_factor: "wide",
        label: "Главная страница на десктопе"
      },
      {
        src: "/screenshots/mobile-1.png",
        sizes: "390x844",
        type: "image/png", 
        form_factor: "narrow",
        label: "Мобильная версия"
      }
    ],
    
    display_override: ["window-controls-overlay", "standalone", "browser"],
    
    protocol_handlers: [
      {
        protocol: "mailto",
        url: "/contact?email=%s"
      }
    ],
    
    edge_side_panel: {
      preferred_width: 480
    },
    
    launch_handler: {
      client_mode: "navigate-existing"
    },
    
    file_handlers: [
      {
        action: "/import",
        accept: {
          "text/csv": [".csv"],
          "application/json": [".json"]
        }
      }
    ]
  };

  return NextResponse.json(manifest, {
    headers: {
      'Content-Type': 'application/manifest+json',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
