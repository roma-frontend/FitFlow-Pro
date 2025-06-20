// components/member/MemberNotifications.tsx
"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  Calendar,
  CreditCard,
  CheckCircle,
  X,
  Clock,
  AlertTriangle
} from "lucide-react";
import { useRouter } from 'next/navigation';

interface Notification {
  id: string;
  type: 'reminder' | 'booking' | 'payment' | 'system';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  priority: 'low' | 'medium' | 'high';
}

interface MemberNotificationsProps {
  notifications?: Notification[];
  onMarkAsRead?: (id: string) => void;
  onMarkAllAsRead?: () => void;
  onDelete?: (id: string) => void;
}

export default function MemberNotifications({
  notifications = [],
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete
}: MemberNotificationsProps) {
  const router = useRouter()
  const [localNotifications, setLocalNotifications] = useState<Notification[]>(
    notifications.length > 0 ? notifications : [
      {
        id: '1',
        type: 'reminder',
        title: 'Напоминание о тренировке',
        message: 'Завтра в 14:00 - тренировка с Адамом Петровым',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        read: false,
        actionUrl: '/member-dashboard/my-bookings',
        priority: 'high'
      },
      {
        id: '2',
        type: 'booking',
        title: 'Запись подтверждена',
        message: 'Ваша запись на йогу 25 мая в 18:00 подтверждена',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        read: true,
        actionUrl: '/member-dashboard/my-bookings',
        priority: 'medium'
      },
      {
        id: '3',
        type: 'payment',
        title: 'Абонемент истекает',
        message: 'Ваш абонемент истекает через 7 дней. Продлите его сейчас.',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        read: false,
        actionUrl: '/shop',
        priority: 'high'
      }
    ]
  );

  const unreadCount = localNotifications.filter(n => !n.read).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'reminder':
        return <Clock className="h-5 w-5 text-blue-600" />;
      case 'booking':
        return <Calendar className="h-5 w-5 text-green-600" />;
      case 'payment':
        return <CreditCard className="h-5 w-5 text-orange-600" />;
      case 'system':
        return <Bell className="h-5 w-5 text-purple-600" />;
      default:
        return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500 bg-red-50';
      case 'medium':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'low':
        return 'border-l-blue-500 bg-blue-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  const handleMarkAsRead = (id: string) => {
    setLocalNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
    onMarkAsRead?.(id);
  };

  const handleMarkAllAsRead = () => {
    setLocalNotifications(prev =>
      prev.map(n => ({ ...n, read: true }))
    );
    onMarkAllAsRead?.();
  };

  const handleDelete = (id: string) => {
    setLocalNotifications(prev => prev.filter(n => n.id !== id));
    onDelete?.(id);
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return `${diffInMinutes} мин назад`;
    } else if (diffInHours < 24) {
      return `${diffInHours} ч назад`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} дн назад`;
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-blue-600" />
          Уведомления
          {unreadCount > 0 && (
            <Badge className="bg-red-500 text-white">
              {unreadCount}
            </Badge>
          )}
        </CardTitle>
        
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllAsRead}
            className="text-xs"
          >
            <CheckCircle className="h-3 w-3 mr-1" />
            Прочитать все
          </Button>
        )}
      </CardHeader>

      <CardContent>
        {localNotifications.length === 0 ? (
          <div className="text-center py-8">
            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Нет уведомлений
            </h3>
            <p className="text-gray-600">
              Все уведомления появятся здесь
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {localNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`relative p-4 border-l-4 rounded-lg transition-all duration-300 hover:shadow-md ${
                  getPriorityColor(notification.priority)
                } ${
                  notification.read ? 'opacity-75' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="flex-shrink-0 mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className={`text-sm font-medium ${
                          notification.read ? 'text-gray-700' : 'text-gray-900'
                        }`}>
                          {notification.title}
                        </h4>
                        
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                        
                        {notification.priority === 'high' && (
                          <AlertTriangle className="h-3 w-3 text-red-500" />
                        )}
                      </div>
                      
                      <p className={`text-sm ${
                        notification.read ? 'text-gray-600' : 'text-gray-700'
                      }`}>
                        {notification.message}
                      </p>
                      
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500">
                          {formatTimestamp(notification.timestamp)}
                        </span>
                        
                        <div className="flex items-center gap-2">
                          {notification.actionUrl && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs h-6 px-2"
                              onClick={() => router.push(notification.actionUrl!)}
                            >
                              Перейти
                            </Button>
                          )}
                          
                          {!notification.read && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-xs h-6 px-2"
                              onClick={() => handleMarkAsRead(notification.id)}
                            >
                              <CheckCircle className="h-3 w-3" />
                            </Button>
                          )}
                          
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-xs h-6 px-2 text-red-600 hover:text-red-700"
                            onClick={() => handleDelete(notification.id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
