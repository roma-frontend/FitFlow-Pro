// components/admin/PersonalizedNotifications.tsx
"use client";

import { useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from '@/hooks/useAuth';
import { useUnifiedData } from '@/contexts/UnifiedDataContext';
import { useRoleTexts } from '@/lib/roleTexts';
import {
  Bell,
  AlertTriangle,
  Info,
  CheckCircle,
  X
} from "lucide-react";

interface Notification {
  id: string;
  type: 'info' | 'warning' | 'success' | 'urgent';
  title: string;
  message: string;
  timestamp: Date;
  actionLabel?: string;
  actionUrl?: string;
  roleSpecific: boolean;
  priority: 'high' | 'medium' | 'low';
}

export function PersonalizedNotifications() {
  const { user } = useAuth(); // Используем user вместо userRole
  const userRole = user?.role; // Получаем роль из user
  const { events, clients, trainers } = useUnifiedData();
  const roleTexts = useRoleTexts(userRole);
  const [showAll, setShowAll] = useState(false);

  // Генерируем персонализированные уведомления
  const notifications = useMemo((): Notification[] => {
    if (!userRole) return [];

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    const baseNotifications: Notification[] = [];

    switch (userRole) {
      case 'super-admin':
        baseNotifications.push(
          {
            id: 'system-update',
            type: 'info',
            title: 'Доступно обновление системы',
            message: 'Версия 2.1.1 содержит улучшения безопасности',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
            actionLabel: 'Обновить',
            actionUrl: '/admin/system/updates',
            roleSpecific: true,
            priority: 'medium'
          },
          {
            id: 'backup-reminder',
            type: 'warning',
            title: 'Напоминание о резервном копировании',
            message: 'Последняя резервная копия создана 3 дня назад',
            timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
            actionLabel: 'Создать копию',
            actionUrl: '/admin/system/backup',
            roleSpecific: true,
            priority: 'high'
          }
        );
        break;

      case 'admin':
        const monthlyRevenue = 847230;
        const lastMonthRevenue = 720000;
        const growth = ((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(1);
        
        baseNotifications.push(
          {
            id: 'monthly-report',
            type: 'success',
            title: 'Месячный отчет готов',
            message: `Выручка выросла на ${growth}% по сравнению с прошлым месяцем`,
            timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
            actionLabel: 'Посмотреть отчет',
            actionUrl: '/admin/reports/monthly',
            roleSpecific: true,
            priority: 'medium'
          },
          {
            id: 'new-trainer-request',
            type: 'info',
            title: 'Новая заявка от тренера',
            message: 'Анна Петрова подала заявку на трудоустройство',
            timestamp: new Date(Date.now() - 30 * 60 * 1000),
            actionLabel: 'Рассмотреть',
            actionUrl: '/admin/trainers/applications',
            roleSpecific: true,
            priority: 'medium'
          }
        );
        break;

      case 'manager':
        const todayEvents = events.filter(event => {
          const eventDate = new Date(event.startTime);
          return eventDate.toDateString() === today.toDateString();
        });

        baseNotifications.push(
          {
            id: 'schedule-conflict',
            type: 'warning',
            title: 'Конфликт в расписании',
            message: 'Зал №1 забронирован на одно время двумя тренерами',
            timestamp: new Date(Date.now() - 45 * 60 * 1000),
            actionLabel: 'Решить конфликт',
            actionUrl: '/admin/schedule',
            roleSpecific: true,
            priority: 'high'
          },
          {
            id: 'team-meeting',
            type: 'info',
            title: 'Еженедельное собрание команды',
            message: 'Завтра в 10:00 состоится планерка с тренерами',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
            actionLabel: 'Подготовиться',
            actionUrl: '/admin/meetings',
            roleSpecific: true,
            priority: 'medium'
          }
        );
        break;

      case 'trainer':
        const myClients = clients.filter(c => c.trainerId === user?.id);
        const myTodayEvents = events.filter(e => 
          e.trainerId === user?.id && 
          new Date(e.startTime).toDateString() === today.toDateString()
        );

        baseNotifications.push(
          {
            id: 'client-feedback',
            type: 'success',
            title: 'Новый отзыв от клиента',
            message: 'Михаил Иванов оставил отзыв: "Отличная тренировка!"',
            timestamp: new Date(Date.now() - 20 * 60 * 1000),
            actionLabel: 'Посмотреть',
            actionUrl: '/admin/clients/feedback',
            roleSpecific: true,
            priority: 'low'
          },
          {
            id: 'session-reminder',
            type: 'info',
            title: 'Напоминание о тренировке',
            message: `У вас ${myTodayEvents.length} тренировок сегодня`,
            timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
            actionLabel: 'Посмотреть расписание',
            actionUrl: '/admin/schedule',
            roleSpecific: true,
            priority: 'medium'
          }
        );
        break;

      case 'member':
        baseNotifications.push(
          {
            id: 'new-class',
            type: 'info',
            title: 'Новое групповое занятие',
            message: 'Добавлена йога для начинающих по вторникам',
            timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
            actionLabel: 'Записаться',
            actionUrl: '/admin/schedule',
            roleSpecific: true,
            priority: 'medium'
          },
          {
            id: 'achievement',
            type: 'success',
            title: 'Достижение разблокировано!',
            message: 'Вы посетили 10 занятий подряд',
            timestamp: new Date(Date.now() - 10 * 60 * 1000),
            roleSpecific: true,
            priority: 'low'
          }
        );
        break;

      case 'client':
        const myEvents = events.filter(e => e.clientId === user?.id);
        
        baseNotifications.push(
          {
            id: 'trainer-message',
            type: 'info',
            title: 'Сообщение от тренера',
            message: 'Елена отправила вам новую программу тренировок',
            timestamp: new Date(Date.now() - 15 * 60 * 1000),
            actionLabel: 'Прочитать',
            actionUrl: '/admin/messages',
            roleSpecific: true,
            priority: 'medium'
          },
          {
            id: 'session-tomorrow',
            type: 'info',
            title: 'Тренировка завтра',
            message: 'Не забудьте о тренировке завтра в 10:00',
            timestamp: new Date(Date.now() - 30 * 60 * 1000),
            actionLabel: 'Подтвердить',
            actionUrl: '/admin/schedule',
            roleSpecific: true,
            priority: 'medium'
          }
        );
        break;
    }

    return baseNotifications.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [userRole, user, events, clients]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'urgent':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'warning':
        return 'border-orange-200 bg-orange-50';
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'urgent':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-blue-200 bg-blue-50';
    }
  };

  const unreadCount = notifications.filter(n => n.priority === 'high').length;
  const displayNotifications = showAll ? notifications : notifications.slice(0, 3);

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        className="relative hover:bg-white/10"
        onClick={() => setShowAll(!showAll)}
      >
        <Bell className="h-5 w-5 text-white" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
          >
            {unreadCount}
          </Badge>
        )}
      </Button>

      {showAll && (
        <Card className="absolute top-12 -right-5 w-96 z-50 shadow-lg border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Уведомления
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAll(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 max-h-96 overflow-y-auto">
            {displayNotifications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm">Нет новых уведомлений</p>
              </div>
            ) : (
              displayNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg border ${getTypeColor(notification.type)} hover:shadow-sm transition-shadow`}
                >
                  <div className="flex items-start gap-3">
                    {getIcon(notification.type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-gray-900 text-sm">
                          {notification.title}
                        </h4>
                        {notification.priority === 'high' && (
                          <Badge variant="destructive" className="text-xs">
                            Важно
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {notification.timestamp.toLocaleTimeString()}
                        </span>
                        {notification.actionLabel && (
                          <Button variant="outline" size="sm" className="text-xs h-6">
                            {notification.actionLabel}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
