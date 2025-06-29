// next.config.ts - ОКОНЧАТЕЛЬНО ИСПРАВЛЕННАЯ ВЕРСИЯ для Next.js 15
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // 🚀 ЭКСПЕРИМЕНТАЛЬНЫЕ ФУНКЦИИ Next.js 15 (все исправлены)
  experimental: {
    // ✅ Оптимизация импортов пакетов
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-icons',
      'framer-motion',
      'react-hook-form',
      'clsx',
      'class-variance-authority'
    ],
  },

  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },

  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 365,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",

    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.cloudinary.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        port: '',
        pathname: '/**',
      }
    ],
  },

  async headers() {
    return [
      {
        source: '/api/pwa/manifest',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/manifest+json',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },

      {
        source: '/sw.js',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/javascript',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
          {
            key: 'Service-Worker-Allowed',
            value: '/',
          },
        ],
      },

      {
        source: '/icons/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },

      {
        source: '/:all*(jpg|jpeg|png|gif|svg|webp|avif|ico)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          {
            key: 'Vary',
            value: 'Accept',
          },
        ],
      },

      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(self), microphone=(self), geolocation=(), payment=(), usb=()',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://challenges.cloudflare.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: https: blob: https://*.stripe.com https://res.cloudinary.com https://*.cloudinary.com https://images.unsplash.com https://avatars.githubusercontent.com https://ui-avatars.com",
              "connect-src 'self' https://api.stripe.com https://q.stripe.com https://*.stripe.com https://js.stripe.com https://challenges.cloudflare.com wss://*.convex.cloud https://*.convex.cloud https://res.cloudinary.com https://*.cloudinary.com https://ui-avatars.com",
              "frame-src 'self' https://js.stripe.com https://hooks.stripe.com https://challenges.cloudflare.com",
              "worker-src 'self' blob:",
              "child-src 'self' blob:",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "manifest-src 'self'",
              "media-src 'self' blob: data: https://res.cloudinary.com https://*.cloudinary.com",
            ].join('; '),
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
        ],
      },

      // 🔧 СПЕЦИАЛЬНЫЕ ЗАГОЛОВКИ ДЛЯ SERVICE WORKER
      {
        source: '/api/pwa/sw',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/javascript; charset=utf-8',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
          {
            key: 'Service-Worker-Allowed',
            value: '/',
          },
          // Разрешаем Service Worker доступ к внешним ресурсам
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "connect-src 'self' https: wss: blob: data:",
              "img-src 'self' data: https: blob:",
              "style-src 'self' 'unsafe-inline'",
              "font-src 'self' data:",
              "worker-src 'self' blob:",
              "child-src 'self' blob:",
            ].join('; '),
          },
        ],
      },

      // 🔧 ЗАГОЛОВКИ ДЛЯ OFFLINE СТРАНИЦЫ
      {
        source: '/offline',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob:",
              "font-src 'self'",
            ].join('; '),
          },
        ],
      },

      // 🔧 ЗАГОЛОВКИ ДЛЯ API МАРШРУТОВ
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: process.env.NODE_ENV === 'production'
              ? 'https://yourdomain.com'
              : '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization, X-Requested-With',
          },
          {
            key: 'Access-Control-Max-Age',
            value: '86400',
          },
        ],
      },
    ];
  },

  // 🚀 WEBPACK ОПТИМИЗАЦИЯ
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    if (!dev && !isServer) {
      if (config.optimization?.splitChunks &&
        typeof config.optimization.splitChunks === 'object') {

        config.optimization.splitChunks = {
          ...config.optimization.splitChunks,
          chunks: 'all',
          cacheGroups: {
            ...(config.optimization.splitChunks.cacheGroups || {}),

            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
              priority: 20,
              maxSize: 244000,
              minSize: 20000,
            },

            ui: {
              test: /[\\/]components[\\/]ui[\\/]/,
              name: 'ui',
              chunks: 'all',
              priority: 15,
              minChunks: 2,
            },

            common: {
              name: 'common',
              chunks: 'all',
              minChunks: 2,
              priority: 10,
              reuseExistingChunk: true,
              enforce: true,
            },

            icons: {
              test: /[\\/]node_modules[\\/](lucide-react|@radix-ui)[\\/]/,
              name: 'icons',
              chunks: 'all',
              priority: 25,
            },
          },
        };
      }

      config.optimization.usedExports = true;
      config.optimization.sideEffects = false;
      config.optimization.minimize = true;
    }

    config.resolve.alias = {
      ...config.resolve.alias,
      '@': require('path').resolve(__dirname),
    };

    if (!dev) {
      config.devtool = false;
    }

    return config;
  },

  async rewrites() {
    return [
      {
        source: '/sw.js',
        destination: '/api/pwa/sw',
      },
      {
        source: '/manifest.json',
        destination: '/api/pwa/manifest',
      },
      {
        source: '/api/health',
        destination: '/api/system/health',
      },
    ];
  },

  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
      {
        source: '/about-us',
        destination: '/about',
        permanent: true,
      },
    ];
  },

  // 🚀 КОНФИГУРАЦИЯ СБОРКИ
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn', 'info']
    } : false,

    reactRemoveProperties: process.env.NODE_ENV === 'production',
    styledComponents: true,
  },

  // ✅ ПРОВЕРКИ
  typescript: {
    ignoreBuildErrors: false,
  },

  eslint: {
    ignoreDuringBuilds: false,
  },

  // ✅ РЕЖИМ STANDALONE
  output: 'standalone',

  // ✅ НАСТРОЙКИ
  compress: true,
  poweredByHeader: false,
  trailingSlash: false,
};

export default nextConfig;
