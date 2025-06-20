// components/member/header/components/VirtualizedNotifications.tsx
import React from 'react';
import { FixedSizeList as List, ListChildComponentProps } from 'react-window';

// Определяем интерфейс для уведомления
interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  type?: 'info' | 'warning' | 'success' | 'error';
}

// Пропсы для VirtualizedNotifications
interface VirtualizedNotificationsProps {
  notifications: Notification[];
}

// Компонент для отображения одного уведомления
const NotificationItem: React.FC<{ notification: Notification }> = ({ notification }) => {
  const getTypeColor = (type?: string) => {
    switch (type) {
      case 'success':
        return 'text-green-600 dark:text-green-400';
      case 'warning':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'error':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-blue-600 dark:text-blue-400';
    }
  };

  return (
    <div className="flex items-start p-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
      <div className={`w-2 h-2 rounded-full mt-2 mr-3 flex-shrink-0 ${
        notification.isRead ? 'bg-gray-300' : getTypeColor(notification.type)
      }`} />
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${
          notification.isRead ? 'text-gray-600 dark:text-gray-400' : 'text-gray-900 dark:text-gray-100'
        }`}>
          {notification.title}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
          {notification.message}
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
          {notification.timestamp}
        </p>
      </div>
    </div>
  );
};

// Компонент строки для react-window с правильной типизацией 【30-0】
const Row: React.FC<ListChildComponentProps<Notification[]>> = ({ 
  index, 
  style, 
  data 
}) => (
  <div style={style}>
    <NotificationItem notification={data[index]} />
  </div>
);

// Основной компонент виртуализированных уведомлений
const VirtualizedNotifications: React.FC<VirtualizedNotificationsProps> = ({ 
  notifications 
}) => {
  return (
    <List
      height={300}
      itemCount={notifications.length}
      itemSize={80}
      width="100%"
      itemData={notifications}
    >
      {Row}
    </List>
  );
};

export default VirtualizedNotifications;
