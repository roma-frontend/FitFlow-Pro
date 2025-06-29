// components/PWAWrapper.tsx - Главный PWA обертка
'use client';

import { memo, useEffect, useState, type ReactNode } from 'react';
import { PWAInstallPrompt } from './PWAInstallPrompt';
import { OfflineIndicator } from './OfflineIndicator';
import { PWAUpdatePrompt } from './PWAUpdatePrompt';

interface PWAWrapperProps {
  children: ReactNode;
}

export const PWAWrapper = memo(function PWAWrapper({ children }: PWAWrapperProps) {
  const [isReady, setIsReady] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const initPWA = async () => {
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/',
            updateViaCache: 'none'
          });

          if (!isMounted) return;

          // Обработка обновлений
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  setUpdateAvailable(true);
                }
              });
            }
          });

          setIsReady(true);
        } catch (error) {
          console.error('SW registration failed:', error);
          setIsReady(true);
        }
      } else {
        setIsReady(true);
      }
    };

    initPWA();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <>
      {children}
      <PWAInstallPrompt />
      <PWAUpdatePrompt show={updateAvailable} onUpdate={() => setUpdateAvailable(false)} />
      <OfflineIndicator />
    </>
  );
});
