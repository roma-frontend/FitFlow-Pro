"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Star, 
  Shield, 
  BarChart3, 
  Users, 
  DollarSign, 
  TrendingUp,
  Calendar,
  Target,
  Activity,
  MessageSquare,
  Award
} from "lucide-react";

interface QuickLinksWidgetProps {
  userRole: string;
}

export function QuickLinksWidget({ userRole }: QuickLinksWidgetProps) {
  const getQuickLinks = () => {
    switch (userRole) {
      case 'super-admin':
        return [
          { icon: Shield, label: 'Настройки безопасности' },
          { icon: BarChart3, label: 'Системная аналитика' },
          { icon: Users, label: 'Управление пользователями' }
        ];
      case 'admin':
        return [
          { icon: DollarSign, label: 'Финансовые отчеты' },
          { icon: Users, label: 'Управление тренерами' },
          { icon: TrendingUp, label: 'Маркетинг и продажи' }
        ];
      case 'manager':
        return [
          { icon: Calendar, label: 'Управление расписанием' },
          { icon: Users, label: 'Команда тренеров' },
          { icon: BarChart3, label: 'Отчеты по залам' }
        ];
      case 'trainer':
        return [
          { icon: Users, label: 'Мои клиенты' },
          { icon: Calendar, label: 'Расписание тренировок' },
          { icon: Target, label: 'Программы тренировок' }
        ];
      case 'member':
        return [
          { icon: Calendar, label: 'Записаться на занятие' },
          { icon: Activity, label: 'Мой прогресс' },
          { icon: MessageSquare, label: 'Сообщество' }
        ];
      case 'client':
        return [
          { icon: Calendar, label: 'Записаться к тренеру' },
          { icon: Target, label: 'Мои цели' },
          { icon: Award, label: 'Достижения' }
        ];
      default:
        return [];
    }
  };

  const quickLinks = getQuickLinks();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-500" />
          Быстрые ссылки
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {quickLinks.map((link, index) => {
            const Icon = link.icon;
            return (
              <Button
                key={index}
                variant="ghost"
                className="w-full justify-start"
                size="sm"
              >
                <Icon className="h-4 w-4 mr-2" />
                {link.label}
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
