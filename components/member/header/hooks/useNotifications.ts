// components/member/header/hooks/useNotifications.ts
"use client";

import { useState, useCallback } from 'react';
import type { Notification } from '../types';

// Mock notifications data
const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'Новая тренировка',
    message: 'Ваша тренировка "Кардио" запланирована на завтра в 10:00',
    time: '5 мин назад',
    read: false,
    type: 'info',
    href: '/schedule'
  },
  {
    id: '2',
    title: 'Достижение разблокировано',
    message: 'Поздравляем! Вы выполнили 10 тренировок подряд',
    time: '1 час назад',
    read: false,
    type: 'success',
    href: '/achievements'
  },
  {
    id: '3',
    title: 'Напоминание о платеже',
    message: 'Ваш абонемент истекает через 3 дня',
    time: '2 часа назад',
    read: true,
    type: 'warning',
    href: '/billing'
  }
];

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead
  };
}
