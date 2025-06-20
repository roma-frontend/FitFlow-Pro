// types/notifications.d.ts
export interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

// Расширяем глобальные типы браузера
declare global {
  interface NotificationOptions {
    actions?: NotificationAction[];
  }
}

export {};
