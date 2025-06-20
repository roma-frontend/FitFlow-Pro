"use client";

import { Button } from "@/components/ui/button";
import { 
  Users, 
  Shield, 
  BarChart3, 
  Calendar, 
  Target, 
  Activity, 
  MessageSquare, 
  Award 
} from "lucide-react";

interface QuickActionsProps {
  userRole: string;
}

export function QuickActions({ userRole }: QuickActionsProps) {
  const getQuickActions = () => {
    switch (userRole) {
      case 'super-admin':
        return [
          { icon: Users, label: 'Управление пользователями' },
          { icon: Shield, label: 'Настройки безопасности' }
        ];
      case 'admin':
        return [
          { icon: BarChart3, label: 'Финансовые отчеты' },
          { icon: Users, label: 'Добавить тренера' }
        ];
      case 'manager':
        return [
          { icon: Calendar, label: 'Управление расписанием' },
          { icon: Users, label: 'Команда тренеров' }
        ];
      case 'trainer':
        return [
          { icon: Users, label: 'Мои клиенты' },
          { icon: Calendar, label: 'Создать тренировку' }
        ];
      default:
        return [
          { icon: Calendar, label: 'Записаться на занятие' },
          { icon: BarChart3, label: 'Мой прогресс' }
        ];
    }
  };

  const quickActions = getQuickActions();

  return (
    <div className="mt-4 mx-4 p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
      <h4 className="text-sm font-medium text-green-800 mb-3 flex items-center gap-1">
        <Shield className="h-3 w-3" />
        Быстрые действия
      </h4>
      <div className="space-y-2">
        {quickActions.map((action, index) => {
          const Icon = action.icon;
          return (
            <Button 
              key={index}
              variant="ghost" 
              size="sm" 
              className="w-full justify-start text-xs h-7"
            >
              <Icon className="h-3 w-3 mr-2" />
              {action.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
