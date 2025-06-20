// components/admin/PersonalizedStats.tsx
"use client";

import { useMemo } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from '@/hooks/useAuth';
import { useUnifiedData } from '@/contexts/UnifiedDataContext';
import { useRoleTexts } from '@/lib/roleTexts';
import {
  Users,
  Calendar,
  TrendingUp,
  Activity,
  DollarSign,
  Clock,
  Target,
  Award,
  BarChart3,
  Shield
} from "lucide-react";

interface StatItem {
  id: string;
  label: string;
  value: string | number;
  unit?: string;
  color: string;
  icon: React.ComponentType<any>;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
    period: string;
  };
  description?: string;
}

export function PersonalizedStats() {
  const { user } = useAuth(); // Используем user вместо userRole
  const userRole = user?.role; // Получаем роль из user
  const { trainers, clients, events } = useUnifiedData();
  const roleTexts = useRoleTexts(userRole);

  // Генерируем персонализированную статистику
  const stats = useMemo((): StatItem[] => {
    if (!userRole) return [];

    const today = new Date();
        const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    switch (userRole) {
      case 'super-admin':
        const totalUsers = trainers.length + clients.length;
        const activeUsers = clients.filter(c => c.status === 'active').length;
        const systemUptime = 99.8;
        const securityScore = 95;

        return [
          {
            id: 'total-users',
            label: 'Всего пользователей',
            value: totalUsers,
            color: 'text-blue-600',
            icon: Users,
            change: { value: 15, type: 'increase', period: 'за месяц' },
            description: 'Общее количество пользователей в системе'
          },
          {
            id: 'system-uptime',
            label: 'Время работы',
            value: systemUptime,
            unit: '%',
            color: 'text-green-600',
            icon: Activity,
            change: { value: 0.2, type: 'increase', period: 'за неделю' },
            description: 'Стабильность работы системы'
          },
          {
            id: 'security-score',
            label: 'Безопасность',
            value: securityScore,
            unit: '%',
            color: 'text-purple-600',
            icon: Shield,
            change: { value: 2, type: 'increase', period: 'за месяц' },
            description: 'Общий уровень безопасности'
          },
          {
            id: 'active-sessions',
            label: 'Активные сессии',
            value: 89,
            color: 'text-orange-600',
            icon: Clock,
            description: 'Пользователи онлайн сейчас'
          }
        ];

      case 'admin':
        const monthlyRevenue = 847230;
        const newClientsThisMonth = clients.filter(c => {
          const joinDate = new Date(c.joinDate || '');
          return joinDate >= thisMonth;
        }).length;
        const clientRetention = 89;
        const avgSessionPrice = 2500;

        return [
          {
            id: 'monthly-revenue',
            label: 'Выручка за месяц',
            value: monthlyRevenue.toLocaleString(),
            unit: '₽',
            color: 'text-green-600',
            icon: DollarSign,
            change: { value: 18, type: 'increase', period: 'к прошлому месяцу' },
            description: 'Общая выручка фитнес-центра'
          },
          {
            id: 'new-clients',
            label: 'Новые клиенты',
            value: newClientsThisMonth,
            color: 'text-blue-600',
            icon: Users,
            change: { value: 12, type: 'increase', period: 'за месяц' },
            description: 'Привлечено новых клиентов'
          },
          {
            id: 'retention-rate',
            label: 'Удержание клиентов',
            value: clientRetention,
            unit: '%',
            color: 'text-purple-600',
            icon: TrendingUp,
            change: { value: 3, type: 'increase', period: 'за месяц' },
            description: 'Процент продливших абонемент'
          },
          {
            id: 'avg-session-price',
            label: 'Средний чек',
            value: avgSessionPrice.toLocaleString(),
            unit: '₽',
            color: 'text-orange-600',
            icon: BarChart3,
            change: { value: 5, type: 'increase', period: 'за месяц' },
            description: 'Средняя стоимость тренировки'
          }
        ];

      case 'manager':
        const totalTrainers = trainers.length;
        const todayEvents = events.filter(event => {
          const eventDate = new Date(event.startTime);
          return eventDate.toDateString() === today.toDateString();
        }).length;
        const teamEfficiency = 94;
        const scheduleOptimization = 87;

        return [
          {
            id: 'team-size',
            label: 'Команда тренеров',
            value: totalTrainers,
            color: 'text-blue-600',
            icon: Users,
            change: { value: 2, type: 'increase', period: 'за месяц' },
            description: 'Активных тренеров в команде'
          },
          {
            id: 'today-sessions',
            label: 'Тренировки сегодня',
            value: todayEvents,
            color: 'text-green-600',
            icon: Calendar,
            description: 'Запланированных тренировок на сегодня'
          },
          {
            id: 'team-efficiency',
            label: 'Эффективность команды',
            value: teamEfficiency,
            unit: '%',
            color: 'text-purple-600',
            icon: TrendingUp,
            change: { value: 3, type: 'increase', period: 'за неделю' },
            description: 'KPI команды тренеров'
          },
          {
            id: 'schedule-optimization',
            label: 'Оптимизация расписания',
            value: scheduleOptimization,
            unit: '%',
            color: 'text-orange-600',
            icon: Target,
            change: { value: 5, type: 'increase', period: 'за месяц' },
            description: 'Эффективность использования залов'
          }
        ];

      case 'trainer':
        const myClients = clients.filter(c => c.trainerId === user?.id);
        const myEvents = events.filter(e => e.trainerId === user?.id);
        const completedSessions = myEvents.filter(e => e.status === 'completed').length;
        const clientSatisfaction = 4.9;

        return [
          {
            id: 'my-clients',
            label: 'Мои клиенты',
            value: myClients.length,
            color: 'text-blue-600',
            icon: Users,
            change: { value: 3, type: 'increase', period: 'за месяц' },
            description: 'Активных клиентов под руководством'
          },
          {
            id: 'completed-sessions',
            label: 'Проведено тренировок',
            value: completedSessions,
            color: 'text-green-600',
            icon: Activity,
            change: { value: 12, type: 'increase', period: 'за месяц' },
            description: 'Завершенных тренировок'
          },
          {
            id: 'client-rating',
            label: 'Рейтинг тренера',
            value: clientSatisfaction,
            unit: '/5',
            color: 'text-yellow-600',
            icon: Award,
            change: { value: 0.1, type: 'increase', period: 'за месяц' },
            description: 'Средняя оценка от клиентов'
          },
          {
            id: 'monthly-earnings',
            label: 'Доход за месяц',
            value: (completedSessions * 1500).toLocaleString(),
            unit: '₽',
            color: 'text-purple-600',
            icon: DollarSign,
            change: { value: 20, type: 'increase', period: 'за месяц' },
            description: 'Заработок от тренировок'
          }
        ];

      case 'member':
        const myMemberEvents = events.filter(e => e.clientId === user?.id);
        const attendedClasses = myMemberEvents.filter(e => e.status === 'completed').length;
        const streakDays = 7;
        const fitnessLevel = 65;

        return [
          {
            id: 'attended-classes',
            label: 'Посещено занятий',
            value: attendedClasses,
            color: 'text-green-600',
            icon: Calendar,
            change: { value: 8, type: 'increase', period: 'за месяц' },
            description: 'Групповых занятий посещено'
          },
          {
            id: 'activity-streak',
            label: 'Серия активности',
            value: streakDays,
            unit: 'дней',
            color: 'text-orange-600',
            icon: Award,
            change: { value: 2, type: 'increase', period: 'за неделю' },
            description: 'Дней подряд с тренировками'
          },
          {
            id: 'fitness-level',
            label: 'Уровень подготовки',
            value: fitnessLevel,
            unit: '%',
            color: 'text-purple-600',
            icon: TrendingUp,
            change: { value: 15, type: 'increase', period: 'за месяц' },
            description: 'Общий прогресс в фитнесе'
          },
          {
            id: 'calories-burned',
            label: 'Калорий сожжено',
            value: (attendedClasses * 350).toLocaleString(),
            color: 'text-red-600',
            icon: Activity,
            description: 'За все время тренировок'
          }
        ];

      case 'client':
        const myClientEvents = events.filter(e => e.clientId === user?.id);
        const personalSessions = myClientEvents.filter(e => e.status === 'completed').length;
        const goalProgress = 75;
        const consistency = 85;

        return [
          {
            id: 'personal-sessions',
            label: 'Персональные тренировки',
            value: personalSessions,
            color: 'text-blue-600',
            icon: Activity,
            change: { value: 5, type: 'increase', period: 'за месяц' },
            description: 'Тренировок с персональным тренером'
          },
          {
            id: 'goal-progress',
            label: 'Прогресс к цели',
            value: goalProgress,
            unit: '%',
            color: 'text-green-600',
            icon: Target,
            change: { value: 20, type: 'increase', period: 'к цели' },
            description: 'Достижение персональных целей'
          },
          {
            id: 'consistency',
            label: 'Постоянство',
            value: consistency,
            unit: '%',
            color: 'text-purple-600',
            icon: Clock,
            change: { value: 10, type: 'increase', period: 'за месяц' },
            description: 'Регулярность посещений'
          },
          {
            id: 'achievements',
            label: 'Достижения',
            value: 12,
            color: 'text-yellow-600',
            icon: Award,
            change: { value: 3, type: 'increase', period: 'за месяц' },
            description: 'Разблокированных достижений'
          }
        ];

      default:
        return [];
    }
  }, [userRole, user, trainers, clients, events]);

  if (!userRole || stats.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                {stat.change && (
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${
                      stat.change.type === 'increase' 
                        ? 'text-green-700 bg-green-50 border-green-200' 
                        : 'text-red-700 bg-red-50 border-red-200'
                    }`}
                  >
                    {stat.change.type === 'increase' ? '+' : '-'}{stat.change.value}%
                  </Badge>
                )}
              </div>
              
              <div className="space-y-2">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </span>
                  {stat.unit && (
                    <span className="text-sm text-gray-500">{stat.unit}</span>
                  )}
                </div>
                
                <h3 className="text-sm font-medium text-gray-700">
                  {stat.label}
                </h3>
                
                {stat.description && (
                  <p className="text-xs text-gray-500 line-clamp-2">
                    {stat.description}
                  </p>
                )}
                
                {stat.change && (
                  <p className="text-xs text-gray-500">
                    {stat.change.period}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

