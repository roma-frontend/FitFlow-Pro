import { NextResponse } from 'next/server';

export async function GET() {
  const swContent = `
    // Service Worker для FitFlow Pro PWA
    const CACHE_NAME = 'fitflow-pro-v1';
    
    self.addEventListener('install', (event) => {
      console.log('[SW] Installing...');
      self.skipWaiting();
    });
    
    self.addEventListener('activate', (event) => {
      console.log('[SW] Activating...');
      event.waitUntil(self.clients.claim());
    });
    
    self.addEventListener('fetch', (event) => {
      event.respondWith(
        caches.match(event.request)
          .then(response => response || fetch(event.request))
      );
    });
  `;

  return new NextResponse(swContent, {
    headers: {
      'Content-Type': 'application/javascript',
      'Cache-Control': 'public, max-age=0, must-revalidate',
    },
  });
}
