// app/layout.tsx - Финальная версия с полной PWA интеграцией

import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import { ConvexClientProvider } from "@/components/providers/convex-provider";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { AuthProvider } from "@/hooks/useAuth";
import { OptimizedProviders } from "@/components/providers/OptimizedProviders";
import Footer from "@/components/Footer";
import { PWAWrapper } from "@/components/PWAWrapper";
import { PWAInstallModal } from "@/components/PWAInstallModal";
import { PWAOnboarding } from "@/components/PWAOnboarding";
import type { Metadata, Viewport } from "next";
import "./globals.css";
import PWAInstallBanner from "@/components/PWAInstallBanner";
import "@/styles/badge-animations.css";
import React from "react";
import { DebugLogout } from "@/components/DebugLogout";
import { AuthCleanupHandler } from "@/components/AuthCleanupHandler";
import {GlobalLoader} from "@/components/GlobalLoader"
import { NextAuthProvider } from "@/components/providers/NextAuthProvider";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  display: "swap",
  preload: true,
  fallback: ["system-ui", "Arial", "sans-serif"],
  adjustFontFallback: true,
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "FitFlow Pro - Умная система управления фитнес-центром",
    template: "%s | FitFlow Pro",
  },
  description:
    "Современная PWA система управления фитнес-центром с биометрическим доступом, AI-аналитикой и офлайн возможностями.",
  keywords: [
    "фитнес",
    "PWA",
    "управление",
    "система",
    "тренеры",
    "участники",
    "администрация",
    "спортзал",
    "тренировки",
    "расписание",
    "офлайн",
    "приложение",
    "биометрия",
    "face-id",
  ],
  authors: [{ name: "FitFlow Pro Team" }],
  creator: "FitFlow Pro",
  publisher: "FitFlow Pro",
  // app/layout.tsx - продолжение
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(
    process.env.NODE_ENV === "production"
      ? "https://fitflow.pro"
      : "http://localhost:3000"
  ),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "ru_RU",
    url: "/",
    title: "FitFlow Pro - Умная PWA система управления фитнес-центром",
    description:
      "Современная Progressive Web App для управления фитнес-центром с офлайн возможностями и биометрическим доступом.",
    siteName: "FitFlow Pro",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "FitFlow Pro PWA",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FitFlow Pro PWA",
    description: "Умная система управления фитнес-центром",
    images: ["/twitter-image.png"],
    creator: "@fitflowpro",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  // ✅ PWA манифест
  manifest: "/api/pwa/manifest",
  // ✅ PWA иконки
  icons: {
    icon: [
      { url: "/icons/icon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icons/icon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      {
        url: "/icons/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
      {
        url: "/icons/apple-touch-icon-152x152.png",
        sizes: "152x152",
        type: "image/png",
      },
      {
        url: "/icons/apple-touch-icon-120x120.png",
        sizes: "120x120",
        type: "image/png",
      },
    ],
    other: [
      {
        rel: "mask-icon",
        url: "/icons/safari-pinned-tab.svg",
        color: "#3b82f6",
      },
    ],
  },
  // ✅ Apple-специфичные мета теги для PWA
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "FitFlow Pro",
    startupImage: [
      {
        url: "/startup/apple-splash-2048-2732.jpg",
        media:
          "(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
      },
      {
        url: "/startup/apple-splash-1668-2224.jpg",
        media:
          "(device-width: 834px) and (device-height: 1112px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
      },
      {
        url: "/startup/apple-splash-1536-2048.jpg",
        media:
          "(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
      },
      {
        url: "/startup/apple-splash-1125-2436.jpg",
        media:
          "(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
      },
      {
        url: "/startup/apple-splash-1242-2208.jpg",
        media:
          "(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
      },
      {
        url: "/startup/apple-splash-750-1334.jpg",
        media:
          "(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
      },
      {
        url: "/startup/apple-splash-640-1136.jpg",
        media:
          "(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
      },
    ],
  },
  // ✅ Дополнительные PWA мета теги
  other: {
    "mobile-web-app-capable": "yes",
    "application-name": "FitFlow Pro",
    "msapplication-TileColor": "#3b82f6",
    "msapplication-config": "/browserconfig.xml",
    "theme-color": "#3b82f6",
    "color-scheme": "light dark",
    "supported-color-schemes": "light dark",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#3b82f6" },
    { media: "(prefers-color-scheme: dark)", color: "#1e40af" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <html lang="ru" suppressHydrationWarning className={inter.variable}>
      <head>
        {/* ✅ Дополнительные PWA теги в head */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />

        {/* PWA предзагрузка критических ресурсов */}
        <link
          rel="preload"
          href="/icons/icon-192x192.png"
          as="image"
          type="image/png"
        />

        {/* Microsoft специфичные теги */}
        <meta
          name="msapplication-TileImage"
          content="/icons/ms-icon-144x144.png"
        />
        <meta name="msapplication-TileColor" content="#3b82f6" />
        <meta name="msapplication-navbutton-color" content="#3b82f6" />
        <meta name="msapplication-starturl" content="/" />

        {/* Samsung браузер */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-status-bar-style" content="default" />

        {/* UC браузер */}
        <meta name="full-screen" content="yes" />
        <meta name="browsermode" content="application" />

        {/* QQ браузер */}
        <meta name="x5-orientation" content="portrait" />
        <meta name="x5-fullscreen" content="true" />
        <meta name="x5-page-mode" content="app" />

        {/* ✅ PWA манифест и иконки */}
        <link rel="manifest" href="/api/pwa/manifest" />
        <link rel="shortcut icon" href="/favicon.ico" />

        {/* Service Worker регистрация */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js', { scope: '/' })
                    .then((registration) => {
                      console.log('SW registered: ', registration);
                      
                      // Проверяем обновления
                      registration.addEventListener('updatefound', () => {
                        const newWorker = registration.installing;
                        if (newWorker) {
                          newWorker.addEventListener('statechange', () => {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                              // Показываем уведомление об обновлении
                              window.dispatchEvent(new CustomEvent('sw-update-available'));
                            }
                          });
                        }
                      });
                    })
                    .catch((registrationError) => {
                      console.log('SW registration failed: ', registrationError);
                    });
                });
              }
              
              // Отслеживаем состояние сети
              window.addEventListener('online', () => {
                window.dispatchEvent(new CustomEvent('network-online'));
              });
              
              window.addEventListener('offline', () => {
                window.dispatchEvent(new CustomEvent('network-offline'));
              });
              
              // Отслеживаем установку PWA
              window.addEventListener('beforeinstallprompt', (e) => {
                e.preventDefault();
                window.deferredPrompt = e;
                window.dispatchEvent(new CustomEvent('pwa-installable'));
              });
              
              window.addEventListener('appinstalled', () => {
                window.deferredPrompt = null;
                window.dispatchEvent(new CustomEvent('pwa-installed'));
              });
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <Analytics />
        <SpeedInsights />
        <ConvexClientProvider>
          <QueryProvider>
            <NextAuthProvider>
            <AuthProvider>
              <OptimizedProviders>
                <PWAWrapper>
                  <div className="min-h-[100svh] flex flex-col bg-background text-foreground">
                    <main className="flex-1 relative"><GlobalLoader />{children}
                      {(process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_DEBUG === 'true') && (
                        <DebugLogout />
                      )}
                    </main>
                    <Footer />
                  </div>

                  {/* ✅ PWA компоненты */}
                  <Toaster />
                  <PWAInstallModal />
                  <PWAOnboarding />
                  <PWAInstallBanner />

                  {/* ✅ PWA обработчики событий */}
                  <PWAEventHandlers />

                  {/* ✅ Auth cleanup handler */}
                  <AuthCleanupHandler />

                </PWAWrapper>
              </OptimizedProviders>
            </AuthProvider>
            </NextAuthProvider>
          </QueryProvider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}

// ✅ Компонент для обработки PWA событий
function PWAEventHandlers() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          // Обработчики PWA событий
          window.addEventListener('sw-update-available', () => {
            if (window.showPWAUpdateToast) {
              window.showPWAUpdateToast();
            }
          });
          
          window.addEventListener('network-online', () => {
            if (window.showOnlineToast) {
              window.showOnlineToast();
            }
          });
          
          window.addEventListener('network-offline', () => {
            if (window.showOfflineToast) {
              window.showOfflineToast();
            }
          });
          
          window.addEventListener('pwa-installable', () => {
            // Уведомляем React компоненты о возможности установки
            document.dispatchEvent(new CustomEvent('pwa-install-available'));
          });
          
          window.addEventListener('pwa-installed', () => {
            // Уведомляем об успешной установке
            document.dispatchEvent(new CustomEvent('pwa-install-success'));
            if (window.showPWAInstalledToast) {
              window.showPWAInstalledToast();
            }
          });
          
          // Обработка жестов для PWA
          let touchStartY = 0;
          let touchEndY = 0;
          
          document.addEventListener('touchstart', e => {
            touchStartY = e.changedTouches[0].screenY;
          }, { passive: true });
          
          document.addEventListener('touchend', e => {
            touchEndY = e.changedTouches[0].screenY;
            handleSwipeGesture();
          }, { passive: true });
          
          function handleSwipeGesture() {
            const swipeThreshold = 50;
            const diff = touchStartY - touchEndY;
            
            if (Math.abs(diff) > swipeThreshold) {
              if (diff > 0) {
                // Свайп вверх - можно показать меню или другие действия
                document.dispatchEvent(new CustomEvent('pwa-swipe-up'));
              } else {
                // Свайп вниз - обновление контента
                if (window.scrollY === 0) {
                  document.dispatchEvent(new CustomEvent('pwa-pull-refresh'));
                }
              }
            }
          }
        `,
      }}
    />
  );
}
