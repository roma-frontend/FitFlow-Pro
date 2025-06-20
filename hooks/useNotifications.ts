// hooks/useNotifications.ts
import { useState, useEffect, useCallback } from "react";
import { Message } from "@/types/messages";

export const useNotifications = (currentUserId: string) => {
  const [notifications, setNotifications] = useState<Message[]>([]);
  const [permission, setPermission] = useState<NotificationPermission>("default");

  useEffect(() => {
    // Запрос разрешения на уведомления
    if ("Notification" in window) {
      setPermission(Notification.permission);
      
      if (Notification.permission === "default") {
        Notification.requestPermission().then(setPermission);
      }
    }
  }, []);

  const showBrowserNotification = useCallback((message: Message) => {
    if (permission === "granted") {
      const notification = new Notification(
        message.subject || "Новое сообщение",
        {
          body: message.content.substring(0, 100) + "...",
          icon: "/favicon.ico",
          tag: message._id,
          requireInteraction: message.priority === "urgent",
        }
      );

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      // Автоматически закрываем через 5 секунд
      setTimeout(() => notification.close(), 5000);
    }
  }, [permission]);

  const addNotification = useCallback((message: Message) => {
    setNotifications(prev => [message, ...prev.slice(0, 9)]); // Максимум 10 уведомлений
    showBrowserNotification(message);
  }, [showBrowserNotification]);

  const removeNotification = useCallback((messageId: string) => {
    setNotifications(prev => prev.filter(n => n._id !== messageId));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    notifications,
    permission,
    addNotification,
    removeNotification,
    clearAllNotifications
  };
};
