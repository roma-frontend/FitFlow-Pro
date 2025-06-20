// hooks/usePWANotifications.ts - Упрощенная версия
'use client';

import { useState, useEffect, useCallback } from 'react';

export interface CustomNotificationOptions {
  body?: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: any;
  requireInteraction?: boolean;
  silent?: boolean;
  vibrate?: number[];
}

export function usePWANotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    if ('Notification' in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!isSupported) return false;

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }, [isSupported]);

  const showNotification = useCallback(async (
    title: string,
    options: CustomNotificationOptions = {}
  ) => {
    if (!isSupported || permission !== 'granted') {
      console.warn('Notifications not supported or not permitted');
      return null;
    }

    try {
      const notificationOptions = {
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        vibrate: [300, 100, 400],
        ...options,
      };

      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        return navigator.serviceWorker.ready.then(registration => {
          return registration.showNotification(title, notificationOptions);
        });
      } else {
        return new Notification(title, notificationOptions);
      }
    } catch (error) {
      console.error('Error showing notification:', error);
      return null;
    }
  }, [isSupported, permission]);

  return {
    permission,
    isSupported,
    requestPermission,
    showNotification,
  };
}

export function useAppNotifications() {
  const { showNotification, permission } = usePWANotifications();

  const showWelcome = useCallback((userName: string) => {
    return showNotification(`Добро пожаловать, ${userName}!`, {
      body: 'Спасибо за использование FitFlow Pro',
      tag: 'welcome',
      requireInteraction: false,
    });
  }, [showNotification]);

  const showWorkoutReminder = useCallback((workoutName: string, time: string) => {
    return showNotification('Напоминание о тренировке', {
      body: `${workoutName} начинается в ${time}`,
      tag: 'workout-reminder',
      requireInteraction: true,
    });
  }, [showNotification]);

  const showUpdateAvailable = useCallback(() => {
    return showNotification('Доступно обновление', {
      body: 'Новая версия приложения готова к установке',
      tag: 'app-update',
      requireInteraction: true,
    });
  }, [showNotification]);

  return {
    permission,
    showWelcome,
    showWorkoutReminder,
    showUpdateAvailable,
  };
}
