"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";

interface NotificationsWidgetProps {
  userRole: string;
}

export function NotificationsWidget({ userRole }: NotificationsWidgetProps) {
  const getNotifications = () => {
    switch (userRole) {
      case 'super-admin':
        return [
          {
            type: 'Критическое',
            message: 'Высокая нагрузка на сервер',
            bgColor: 'bg-red-50',
            borderColor: 'border-red-200',
            textColor: 'text-red-800',
            titleColor: 'text-red-800'
          },
          {
            type: 'Предупреждение',
            message: 'Резервная копия устарела',
            bgColor: 'bg-yellow-50',
            borderColor: 'border-yellow-200',
            textColor: 'text-yellow-700',
            titleColor: 'text-yellow-800'
          }
        ];
      case 'admin':
        return [
          {
            type: 'Успех',
            message: 'Цель по выручке достигнута',
            bgColor: 'bg-green-50',
            borderColor: 'border-green-200',
            textColor: 'text-green-700',
            titleColor: 'text-green-800'
          },
          {
            type: 'Информация',
            message: 'Новая заявка от тренера',
            bgColor: 'bg-blue-50',
            borderColor: 'border-blue-200',
            textColor: 'text-blue-700',
            titleColor: 'text-blue-800'
          }
        ];
      case 'manager':
        return [
          {
            type: 'Внимание',
            message: 'Конфликт в расписании',
            bgColor: 'bg-orange-50',
            borderColor: 'border-orange-200',
            textColor: 'text-orange-700',
            titleColor: 'text-orange-800'
          },
          {
            type: 'Напоминание',
            message: 'Собрание команды завтра',
            bgColor: 'bg-purple-50',
            borderColor: 'border-purple-200',
            textColor: 'text-purple-700',
            titleColor: 'text-purple-800'
          }
        ];
      case 'trainer':
        return [
          {
            type: 'Отзыв',
            message: 'Новый отзыв от клиента',
            bgColor: 'bg-green-50',
            borderColor: 'border-green-200',
            textColor: 'text-green-700',
            titleColor: 'text-green-800'
          },
          {
            type: 'Напоминание',
            message: 'Тренировка через 30 минут',
            bgColor: 'bg-blue-50',
            borderColor: 'border-blue-200',
            textColor: 'text-blue-700',
            titleColor: 'text-blue-800'
          }
        ];
      default:
        return [
          {
            type: 'Достижение',
            message: 'Новое достижение разблокировано!',
            bgColor: 'bg-green-50',
            borderColor: 'border-green-200',
            textColor: 'text-green-700',
            titleColor: 'text-green-800'
          },
          {
            type: 'Напоминание',
            message: 'Тренировка завтра в 10:00',
            bgColor: 'bg-blue-50',
            borderColor: 'border-blue-200',
            textColor: 'text-blue-700',
            titleColor: 'text-blue-800'
          }
        ];
    }
  };

  const notifications = getNotifications();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-blue-500" />
          Уведомления
          <Badge variant="destructive" className="ml-auto">
            {notifications.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {notifications.map((notification, index) => (
            <div
              key={index}
              className={`p-2 rounded-lg border ${notification.bgColor} ${notification.borderColor}`}
            >
              <div className={`text-xs font-medium ${notification.titleColor}`}>
                {notification.type}
              </div>
              <div className={`text-sm ${notification.textColor}`}>
                {notification.message}
              </div>
            </div>
          ))}
          <Button variant="outline" size="sm" className="w-full">
            Все уведомления
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
