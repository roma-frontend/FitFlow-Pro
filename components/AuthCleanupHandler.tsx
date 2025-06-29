"use client";

import React from 'react';
import { useRouter } from 'next/navigation';

export function AuthCleanupHandler() {
  const router = useRouter();
  
  React.useEffect(() => {
    // Слушаем событие logout
    const handleLogout = () => {
      console.log('🧹 AuthCleanupHandler: Получено событие logout');

      // Агрессивная очистка localStorage
      const clearAuth = () => {
        const authKeys: string[] = [
          'auth_user',
          'auth_token',
          'user',
          'token',
          'authToken',
          'userToken',
          'session_id',
          'user_role'
        ];

        // Метод 1: Прямое удаление
        authKeys.forEach((key: string) => {
          try {
            localStorage.removeItem(key);
            sessionStorage.removeItem(key);
          } catch (e) {
            console.error(`Failed to remove ${key}:`, e);
          }
        });

        // Метод 2: Перезапись и удаление
        authKeys.forEach((key: string) => {
          try {
            if (localStorage.getItem(key) !== null) {
              localStorage.setItem(key, '');
              localStorage.removeItem(key);
            }
          } catch (e) {
            console.error(`Failed to overwrite ${key}:`, e);
          }
        });

        // Метод 3: Очистка через Object.keys
        try {
          Object.keys(localStorage).forEach((key: string) => {
            if (authKeys.includes(key) ||
              key.includes('auth') ||
              key.includes('user') ||
              key.includes('token')) {
              localStorage.removeItem(key);
            }
          });
        } catch (e) {
          console.error('Failed to clear via Object.keys:', e);
        }
      };

      // Немедленная очистка
      clearAuth();

      // 🔥 ВАЖНО: Отправляем событие для обновления React состояния
      window.dispatchEvent(new CustomEvent('force-auth-update', { 
        detail: { authenticated: false } 
      }));

      // 🔥 Принудительное обновление через router
      setTimeout(() => {
        router.refresh();
      }, 100);

      // Повторная очистка через микротаск
      Promise.resolve().then(clearAuth);

      // Повторная очистка через макротаск
      setTimeout(clearAuth, 0);

      // Повторная очистка через requestIdleCallback
      if ('requestIdleCallback' in window) {
        window.requestIdleCallback(clearAuth);
      }

      // Очистка через MutationObserver
      const observer = new MutationObserver(() => {
        clearAuth();
        observer.disconnect();
      });

      observer.observe(document.body, { childList: true, subtree: true });

      // Триггерим изменение DOM
      const tempDiv = document.createElement('div');
      tempDiv.style.display = 'none';
      document.body.appendChild(tempDiv);
      document.body.removeChild(tempDiv);
    };

    // Слушаем различные события logout
    window.addEventListener('auth-logout', handleLogout);
    document.addEventListener('auth-logout', handleLogout);

    // 🔥 ОБНОВЛЕННЫЙ обработчик сообщений от Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event: MessageEvent) => {
        console.log('📨 SW Message received:', event.data);

        if (event.data?.type === 'CLEAR_AUTH_DATA') {
          console.log('🧹 Получено CLEAR_AUTH_DATA от SW');

          const keys: string[] = event.data.keys || ['auth_user', 'auth_token', 'user', 'token', 'session_id', 'user_role'];

          // Агрессивная очистка
          keys.forEach((key: string) => {
            try {
              localStorage.removeItem(key);
              sessionStorage.removeItem(key);
              // Двойная очистка
              localStorage.setItem(key, '');
              localStorage.removeItem(key);
            } catch (e) {
              console.error(`Failed to remove ${key}:`, e);
            }
          });

          // Проверка после очистки
          setTimeout(() => {
            if (localStorage.getItem('auth_user') || localStorage.getItem('auth_token')) {
              console.warn('⚠️ Auth data still exists after SW clear, forcing full clear');
              handleLogout();
            }
          }, 100);
        }

        if (event.data?.type === 'LOGOUT') {
          handleLogout();
        }
      });

      // 🔥 НОВОЕ: Проверяем, готов ли SW
      navigator.serviceWorker.ready.then((registration: ServiceWorkerRegistration) => {
        console.log('✅ Service Worker ready:', registration.scope);
      });
    }

    // Слушаем postMessage
    window.addEventListener('message', (event: MessageEvent) => {
      if (event.origin === window.location.origin &&
        (event.data?.type === 'CLEAR_AUTH_STORAGE' ||
          event.data?.type === 'LOGOUT')) {
        handleLogout();
      }
    });

    // 🔥 НОВОЕ: BroadcastChannel для синхронизации между вкладками
    let channel: BroadcastChannel | undefined;

    if ('BroadcastChannel' in window) {
      channel = new BroadcastChannel('auth_channel');

      channel.addEventListener('message', (event: MessageEvent) => {
        if (event.data?.type === 'logout') {
          console.log('📡 Получен logout через BroadcastChannel');
          handleLogout();
        }
      });
    }

    // Интервальная проверка для Vercel (временное решение)
    let checkInterval: NodeJS.Timeout | undefined;

    if (process.env.VERCEL || process.env.NEXT_PUBLIC_VERCEL) {
      checkInterval = setInterval(() => {
        // Проверяем, есть ли флаг logout
        const logoutFlag = sessionStorage.getItem('logout_in_progress');
        if (logoutFlag === 'true') {
          handleLogout();
          sessionStorage.removeItem('logout_in_progress');
        }
      }, 100);
    }

    // Cleanup function
    return () => {
      window.removeEventListener('auth-logout', handleLogout);
      document.removeEventListener('auth-logout', handleLogout);

      if (channel) {
        channel.close();
      }

      if (checkInterval) {
        clearInterval(checkInterval);
      }
    };
  }, [router]);

  return null;
}