// lib/notifications-data.ts

// Интерфейс для уведомления
export interface Notification {
  id: string;
  userId: string | 'all';
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  read: boolean;
  readAt?: string;
  createdAt: string;
  priority: 'low' | 'medium' | 'high';
  category?: string;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

// Mock данные для уведомлений
let mockNotifications: Notification[] = [
  {
    id: 'notif_1',
    userId: 'all',
    type: 'info',
    title: 'Системное обновление',
    message: 'Система будет обновлена сегодня в 23:00',
    read: false,
    createdAt: '2024-01-20T10:00:00Z',
    priority: 'medium',
    category: 'system'
  },
  {
    id: 'notif_2',
    userId: 'trainer_1',
    type: 'success',
    title: 'Новый клиент',
    message: 'К вам записался новый клиент - Анна Иванова',
    read: false,
    createdAt: '2024-01-20T11:30:00Z',
    priority: 'high',
    category: 'client',
    actionUrl: '/clients/client_1'
  },
  {
    id: 'notif_3',
    userId: 'trainer_1',
    type: 'warning',
    title: 'Отмена тренировки',
    message: 'Клиент Петр Сидоров отменил тренировку на завтра',
    read: true,
    readAt: '2024-01-20T12:00:00Z',
    createdAt: '2024-01-20T09:15:00Z',
    priority: 'medium',
    category: 'session'
  },
  {
    id: 'notif_4',
    userId: 'client_1',
    type: 'info',
    title: 'Напоминание о тренировке',
    message: 'Ваша тренировка начнется через час',
    read: false,
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    priority: 'high',
    category: 'reminder'
  },
  {
    id: 'notif_5',
    userId: 'admin_1',
    type: 'error',
    title: 'Ошибка системы',
    message: 'Обнаружена ошибка в модуле платежей',
    read: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    priority: 'high',
    category: 'system'
  }
];

// Функции для работы с уведомлениями
export function getMockNotifications(): Notification[] {
  return mockNotifications;
}

export function setMockNotifications(notifications: Notification[]): void {
  mockNotifications = notifications;
}

export function addNotification(notification: Notification): void {
  mockNotifications.push(notification);
}

export function updateNotification(id: string, updates: Partial<Notification>): Notification | null {
  const index = mockNotifications.findIndex(n => n.id === id);
  if (index !== -1) {
    mockNotifications[index] = { ...mockNotifications[index], ...updates };
    return mockNotifications[index];
  }
  return null;
}

export function deleteNotification(id: string): Notification | null {
  const index = mockNotifications.findIndex(n => n.id === id);
  if (index !== -1) {
    return mockNotifications.splice(index, 1)[0];
  }
  return null;
}

export function findNotification(id: string): Notification | undefined {
  return mockNotifications.find(n => n.id === id);
}
