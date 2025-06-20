// components/trainer/components/TrainerNotifications.tsx
"use client";

import { useState, memo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Bell,
  MessageSquare,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Users,
  X,
} from "lucide-react";
import type { MessageStats, WorkoutStats, SystemStats } from "@/types/trainer";
import { useRouter } from "next/navigation";

// ✅ Расширенные типы для уведомлений
type NotificationType = "message" | "workout" | "client" | "error" | "system";
type NotificationPriority = "low" | "normal" | "high" | "urgent";

interface Notification {
  id: number;
  type: NotificationType;
  title: string;
  description: string;
  count: number;
  icon: any;
  color: string;
  bgColor: string;
  hoverBgColor: string; // ✅ Добавляем hover цвет
  priority: NotificationPriority;
  time: string;
}

interface TrainerNotificationsProps {
  messageStats: MessageStats;
  workoutStats: WorkoutStats;
  stats: SystemStats;
  isLoading: boolean;
  loadingStep: string;
  error: string | null;
}

const TrainerNotifications = memo(({
  messageStats,
  workoutStats,
  stats,
  isLoading,
  loadingStep,
  error,
}: TrainerNotificationsProps) => {
  const [isOpen, setIsOpen] = useState(false);

  // ✅ Подсчет уведомлений с современными цветами
  const notifications: Notification[] = [
    {
      id: 1,
      type: "message",
      title: "Новые сообщения",
      description: `${messageStats?.unreadMessages || 0} непрочитанных сообщений`,
      count: messageStats?.unreadMessages || 0,
      icon: MessageSquare,
      color: "text-blue-500",
      bgColor: "bg-gradient-to-br from-blue-50 to-blue-100",
      hoverBgColor: "hover:bg-gradient-to-br hover:from-blue-100 hover:to-blue-200",
      priority: "normal",
      time: "2 мин назад",
    },
    {
      id: 2,
      type: "workout",
      title: "Тренировки сегодня",
      description: `${workoutStats?.todayWorkouts || 0} запланированных тренировок`,
      count: workoutStats?.todayWorkouts || 0,
      icon: Calendar,
      color: "text-emerald-500",
      bgColor: "bg-gradient-to-br from-emerald-50 to-emerald-100",
      hoverBgColor: "hover:bg-gradient-to-br hover:from-emerald-100 hover:to-emerald-200",
      priority: "high",
      time: "Сегодня",
    },
    {
      id: 3,
      type: "client",
      title: "Активные клиенты",
      description: `${stats?.activeClients || 0} активных клиентов`,
      count: stats?.activeClients || 0,
      icon: Users,
      color: "text-purple-500",
      bgColor: "bg-gradient-to-br from-purple-50 to-purple-100",
      hoverBgColor: "hover:bg-gradient-to-br hover:from-purple-100 hover:to-purple-200",
      priority: "normal",
      time: "Сейчас",
    },
  ];

  // Фильтруем только уведомления с count > 0
  let activeNotifications = notifications.filter(n => n.count > 0);
  
  // ✅ Если есть ошибка, добавляем уведомление об ошибке
  if (error) {
    const errorNotification: Notification = {
      id: 0,
      type: "error",
      title: "Ошибка загрузки",
      description: "Не удалось загрузить данные",
      count: 1,
      icon: AlertTriangle,
      color: "text-red-500",
      bgColor: "bg-gradient-to-br from-red-50 to-red-100",
      hoverBgColor: "hover:bg-gradient-to-br hover:from-red-100 hover:to-red-200",
      priority: "urgent",
      time: "Сейчас",
    };
    activeNotifications.unshift(errorNotification);
  }

  const totalNotifications = activeNotifications.reduce((sum, n) => sum + n.count, 0);

  const handleNotificationClick = (notification: Notification) => {
    const router = useRouter()
    console.log('Clicked notification:', notification);
    
    switch (notification.type) {
      case "message":
        router.push("/trainer/messages");
        break;
      case "workout":
        router.push("/trainer/workouts");
        break;
      case "client":
        router.push("/trainer/clients");
        break;
      case "error":
        console.error("Error details:", error);
        break;
      default:
        break;
    }
    
    setIsOpen(false);
  };

  const handleMarkAllAsRead = () => {
    console.log('Mark all as read');
    setIsOpen(false);
  };

  const getPriorityBadgeVariant = (priority: NotificationPriority) => {
    switch (priority) {
      case "urgent":
        return "destructive";
      case "high":
        return "default";
      case "normal":
        return "secondary";
      case "low":
        return "outline";
      default:
        return "outline";
    }
  };

  const getPriorityText = (priority: NotificationPriority) => {
    switch (priority) {
      case "urgent":
        return "Срочно";
      case "high":
        return "Важно";
      case "normal":
        return "Обычное";
      case "low":
        return "Низкий";
      default:
        return "";
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          disabled={isLoading}
          className="relative text-white hover:bg-white/20 hover:backdrop-blur-sm hover:scale-105 transition-all duration-300 ease-out p-2 h-8 w-8 sm:h-9 sm:w-9 rounded-xl"
        >
          <Bell className="h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-300 hover:rotate-12" />
          
          {/* ✅ Современный индикатор уведомлений */}
          {totalNotifications > 0 && (
            <div className="absolute -top-1 -right-1 h-5 w-5 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
              <span className="text-xs font-bold text-white">
                {totalNotifications > 99 ? '99+' : totalNotifications}
              </span>
            </div>
          )}
          
          {/* ✅ Современный индикатор загрузки */}
          {isLoading && (
            <div className="absolute -top-1 -right-1 h-3 w-3 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full animate-pulse shadow-lg" />
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent 
        align="end" 
        className="w-80 sm:w-96 max-h-96 overflow-y-auto border-0 shadow-2xl bg-white/95 backdrop-blur-xl rounded-2xl"
        sideOffset={8}
      >
        <DropdownMenuLabel className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-2xl">
          <span className="font-semibold text-gray-800">Уведомления</span>
          {totalNotifications > 0 && (
            <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0 shadow-md">
              {totalNotifications}
            </Badge>
          )}
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="border-gray-200" />

        {/* Состояние загрузки */}
        {isLoading && (
          <DropdownMenuItem disabled className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 mx-2 my-2 rounded-xl">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent" />
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-800">Загрузка уведомлений...</div>
              <div className="text-xs text-gray-600">{loadingStep}</div>
            </div>
          </DropdownMenuItem>
        )}

        {/* ✅ Список уведомлений с современным дизайном */}
        {!isLoading && activeNotifications.length > 0 && (
          <>
            <div className="p-2 space-y-2">
              {activeNotifications.map((notification) => {
                const IconComponent = notification.icon;
                
                return (
                  <DropdownMenuItem
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`flex items-start gap-3 p-3 cursor-pointer rounded-xl border border-gray-100 ${notification.bgColor} ${notification.hoverBgColor} hover:shadow-md hover:scale-[1.02] transition-all duration-300 ease-out`}
                  >
                    <div className="p-2 rounded-lg bg-white/70 backdrop-blur-sm shadow-sm flex-shrink-0">
                      <IconComponent className={`h-4 w-4 ${notification.color}`} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="text-sm font-semibold text-gray-800 truncate">
                          {notification.title}
                        </div>
                        <div className="text-xs text-gray-500 ml-2 font-medium">
                          {notification.time}
                        </div>
                      </div>
                      
                      <div className="text-xs text-gray-600 leading-relaxed">
                        {notification.description}
                      </div>
                      
                      {(notification.priority === 'urgent' || notification.priority === 'high') && (
                        <Badge 
                          variant={getPriorityBadgeVariant(notification.priority)} 
                          className="text-xs mt-2 shadow-sm"
                        >
                          {getPriorityText(notification.priority)}
                        </Badge>
                      )}
                    </div>
                    
                    {notification.count > 1 && (
                      <Badge className="bg-gradient-to-r from-gray-500 to-gray-600 text-white border-0 shadow-sm">
                        {notification.count}
                      </Badge>
                    )}
                  </DropdownMenuItem>
                );
              })}
            </div>

            <DropdownMenuSeparator className="border-gray-200 mx-2" />

            {/* ✅ Современные действия */}
            <div className="p-2 space-y-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="w-full justify-start h-10 text-sm bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 text-green-700 hover:text-green-800 border border-green-200 hover:border-green-300 rounded-xl transition-all duration-300"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Отметить все как прочитанные
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="w-full justify-start h-10 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all duration-300"
              >
                <X className="h-4 w-4 mr-2" />
                Закрыть
              </Button>
            </div>
          </>
        )}

        {/* ✅ Современное пустое состояние */}
        {!isLoading && activeNotifications.length === 0 && (
          <DropdownMenuItem disabled className="flex flex-col items-center gap-3 p-8 bg-gradient-to-br from-green-50 to-emerald-50 mx-2 my-2 rounded-xl">
            <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full shadow-lg">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
            <div className="text-center">
              <div className="text-sm font-semibold text-gray-800 mb-1">
                Все уведомления прочитаны
              </div>
              <div className="text-xs text-gray-600 leading-relaxed">
                Новые уведомления появятся здесь
              </div>
            </div>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
});

TrainerNotifications.displayName = 'TrainerNotifications';

export default TrainerNotifications;
