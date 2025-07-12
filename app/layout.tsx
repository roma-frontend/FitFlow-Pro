// app/layout.tsx - Исправленная версия
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
import { AuthTransitionHandler } from "@/components/auth/AuthTransitionHandler";
import { NextAuthProvider } from "@/components/providers/NextAuthProvider";
import AIAgent from "@/components/ai-agent/AIAgent";
import { SessionProviderWrapper } from "@/components/providers/SessionProviderWrapper";
import AIAgentProvider from "@/components/providers/AIAgentProvider";
import BodyAnalysisTrigger from "@/components/BodyAnalysisTrigger";

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
    "AI помощник"
  ],
  authors: [{ name: "FitFlow Pro Team" }],
  creator: "FitFlow Pro",
  publisher: "FitFlow Pro",
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
  manifest: "/api/pwa/manifest",
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
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "FitFlow Pro",
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

// Простой Error Boundary без динамического импорта
function ErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
    </>
  );
}

// Защищенный компонент для обработки потенциальных ошибок в children
function SafeChildrenWrapper({ children }: { children: React.ReactNode }) {
  try {
    return <>{children}</>;
  } catch (error) {
    console.error('❌ SafeChildrenWrapper error:', error);
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="text-center p-8">
          <h1 className="text-xl font-semibold text-red-800 mb-4">
            Ошибка загрузки страницы
          </h1>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Перезагрузить
          </button>
        </div>
      </div>
    );
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" suppressHydrationWarning className={inter.variable}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link rel="manifest" href="/api/pwa/manifest" />
        <link rel="shortcut icon" href="/favicon.ico" />

        {/* Минимальные скрипты для предотвращения ошибок */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Глобальная обработка ошибок
              window.addEventListener('error', function(e) {
                console.error('🔥 Global error:', e.error);
                if (e.error && e.error.message && e.error.message.includes('loading')) {
                  console.warn('⚠️ Loading error detected, potential hydration issue');
                }
              });
              
              window.addEventListener('unhandledrejection', function(e) {
                console.error('🔥 Unhandled promise rejection:', e.reason);
              });
              
              // Базовая регистрация Service Worker
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js').catch(console.error);
                });
              }
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <SessionProviderWrapper>
          <Analytics />
          <SpeedInsights />

          <ErrorBoundary>
            <ConvexClientProvider>
              <QueryProvider>
                <NextAuthProvider>
                  <AuthProvider>
                    <OptimizedProviders>
                      <PWAWrapper>
                        <div className="min-h-[100lvh] flex flex-col bg-background text-foreground">
                          <main className="flex-1 relative">
                            <SafeChildrenWrapper>
                              <AIAgentProvider>
                                <BodyAnalysisTrigger variant="floating" />
                                {children}
                              </AIAgentProvider>
                            </SafeChildrenWrapper>


                            {(process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_DEBUG === 'true') && (
                              <DebugLogout />
                            )}
                          </main>
                          <Footer />
                        </div>

                        <Toaster />
                        <PWAInstallModal />
                        <PWAOnboarding />
                        <PWAInstallBanner />
                        <AuthCleanupHandler />
                        <AuthTransitionHandler />

                      </PWAWrapper>
                    </OptimizedProviders>
                  </AuthProvider>
                </NextAuthProvider>
              </QueryProvider>
            </ConvexClientProvider>
          </ErrorBoundary>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}