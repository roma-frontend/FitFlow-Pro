// components/admin/PersonalizedProgress.tsx
"use client";

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useAuth } from '@/hooks/useAuth';
import { useUnifiedData } from '@/contexts/UnifiedDataContext';
import { useRoleTexts } from '@/lib/roleTexts';
import {
  Target,
  TrendingUp,
  Award,
  Calendar,
  Users,
  Activity,
  Star,
  Clock,
  CheckCircle,
  AlertCircle
} from "lucide-react";

interface ProgressItem {
  id: string;
  title: string;
  description: string;
  current: number;
  target: number;
  unit: string;
  color: string;
  icon: React.ComponentType<any>;
  status: 'on-track' | 'behind' | 'ahead' | 'completed';
  trend?: {
    value: number;
    direction: 'up' | 'down';
    period: string;
  };
}

export function PersonalizedProgress() {
  const { user } = useAuth(); // Используем user вместо userRole
  const userRole = user?.role; // Получаем роль из user
  const { trainers, clients, events } = useUnifiedData();
  const roleTexts = useRoleTexts(userRole);

  // Генерируем персонализированные метрики прогресса
  const progressItems = useMemo((): ProgressItem[] => {
    if (!userRole) return [];

    const today = new Date();
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    switch (userRole) {
      case 'super-admin':
        const totalUsers = trainers.length + clients.length;
        const systemUptime = 99.8;
        const activeUsers = clients.filter(c => c.status === 'active').length;

        return [
          {
            id: 'system-uptime',
            title: 'Время работы системы',
            description: 'Стабильность и надежность платформы',
            current: systemUptime,
            target: 99.9,
            unit: '%',
            color: 'bg-green-500',
            icon: Activity,
            status: systemUptime >= 99.5 ? 'on-track' : 'behind',
            trend: { value: 0.2, direction: 'up', period: 'за месяц' }
          },
          {
            id: 'user-growth',
            title: 'Рост пользователей',
            description: 'Увеличение пользовательской базы',
            current: totalUsers,
            target: 1000,
            unit: 'польз.',
            color: 'bg-blue-500',
            icon: Users,
            status: totalUsers >= 800 ? 'on-track' : 'behind',
            trend: { value: 15, direction: 'up', period: 'за месяц' }
          },
          {
            id: 'platform-performance',
            title: 'Производительность',
            description: 'Скорость обработки запросов',
            current: 98.5,
            target: 95,
            unit: '%',
            color: 'bg-purple-500',
            icon: TrendingUp,
            status: 'ahead',
            trend: { value: 2.1, direction: 'up', period: 'за неделю' }
          }
        ];

      case 'admin':
        const monthlyRevenue = 847230;
        const revenueTarget = 800000;
        const clientRetention = 89;
        const newClientsThisMonth = clients.filter(c => {
          const joinDate = new Date(c.joinDate || '');
          return joinDate >= thisMonth;
        }).length;

        return [
          {
            id: 'monthly-revenue',
            title: 'Выручка за месяц',
            description: 'Финансовые показатели центра',
            current: monthlyRevenue,
            target: revenueTarget,
            unit: '₽',
            color: 'bg-green-500',
            icon: TrendingUp,
            status: monthlyRevenue >= revenueTarget ? 'ahead' : 'on-track',
            trend: { value: 18, direction: 'up', period: 'к прошлому месяцу' }
          },
          {
            id: 'client-retention',
            title: 'Удержание клиентов',
            description: 'Процент клиентов, продливших абонемент',
            current: clientRetention,
            target: 85,
            unit: '%',
            color: 'bg-blue-500',
            icon: Users,
            status: clientRetention >= 85 ? 'ahead' : 'on-track',
            trend: { value: 3, direction: 'up', period: 'за месяц' }
          },
          {
            id: 'new-clients',
            title: 'Новые клиенты',
            description: 'Привлечение новых клиентов',
            current: newClientsThisMonth,
            target: 50,
            unit: 'чел.',
            color: 'bg-purple-500',
            icon: Star,
            status: newClientsThisMonth >= 40 ? 'on-track' : 'behind',
            trend: { value: 12, direction: 'up', period: 'за месяц' }
          }
        ];

      case 'manager':
        const teamEfficiency = 94;
        const scheduleOptimization = 87;
        const customerSatisfaction = 4.8;

        return [
          {
            id: 'team-efficiency',
            title: 'Эффективность команды',
            description: 'KPI команды тренеров',
            current: teamEfficiency,
            target: 90,
            unit: '%',
            color: 'bg-green-500',
            icon: Users,
            status: 'ahead',
            trend: { value: 3, direction: 'up', period: 'за неделю' }
          },
          {
            id: 'schedule-optimization',
            title: 'Оптимизация расписания',
            description: 'Эффективность использования залов',
            current: scheduleOptimization,
            target: 85,
            unit: '%',
            color: 'bg-blue-500',
            icon: Calendar,
            status: 'on-track',
            trend: { value: 5, direction: 'up', period: 'за месяц' }
          },
          {
            id: 'customer-satisfaction',
            title: 'Удовлетворенность клиентов',
            description: 'Средний рейтинг от клиентов',
            current: customerSatisfaction * 20,
            target: 90,
            unit: '%',
            color: 'bg-yellow-500',
            icon: Star,
            status: 'ahead',
            trend: { value: 0.2, direction: 'up', period: 'за месяц' }
          }
        ];

      case 'trainer':
        const myClients = clients.filter(c => c.trainerId === user?.id);
        const myEvents = events.filter(e => e.trainerId === user?.id);
        const completedSessions = myEvents.filter(e => e.status === 'completed').length;
        const monthlyTarget = 80;
        const clientSatisfaction = 4.9;

        return [
          {
            id: 'monthly-sessions',
            title: 'Тренировки за месяц',
            description: 'Проведенные тренировки',
            current: completedSessions,
            target: monthlyTarget,
            unit: 'сессий',
            color: 'bg-green-500',
            icon: Activity,
            status: completedSessions >= monthlyTarget * 0.8 ? 'on-track' : 'behind',
            trend: { value: 12, direction: 'up', period: 'за месяц' }
          },
          {
            id: 'client-base',
            title: 'База клиентов',
            description: 'Активные клиенты под руководством',
            current: myClients.length,
            target: 25,
            unit: 'клиентов',
            color: 'bg-blue-500',
            icon: Users,
            status: myClients.length >= 20 ? 'on-track' : 'behind',
            trend: { value: 3, direction: 'up', period: 'за месяц' }
          },
          {
            id: 'client-satisfaction',
            title: 'Рейтинг тренера',
            description: 'Средняя оценка от клиентов',
            current: clientSatisfaction * 20,
            target: 90,
            unit: '%',
            color: 'bg-yellow-500',
            icon: Star,
            status: 'ahead',
            trend: { value: 0.1, direction: 'up', period: 'за месяц' }
          }
        ];

      case 'member':
        const myMemberEvents = events.filter(e => e.clientId === user?.id);
        const attendedClasses = myMemberEvents.filter(e => e.status === 'completed').length;
        const monthlyGoal = 12;
        const streakDays = 7; // Примерное значение

        return [
          {
            id: 'monthly-attendance',
            title: 'Посещения за месяц',
            description: 'Групповые занятия',
            current: attendedClasses,
            target: monthlyGoal,
            unit: 'занятий',
            color: 'bg-green-500',
            icon: Calendar,
            status: attendedClasses >= monthlyGoal * 0.7 ? 'on-track' : 'behind',
            trend: { value: 8, direction: 'up', period: 'за месяц' }
          },
          {
            id: 'activity-streak',
            title: 'Серия активности',
            description: 'Дни подряд с тренировками',
            current: streakDays,
            target: 14,
            unit: 'дней',
            color: 'bg-orange-500',
            icon: Award,
            status: streakDays >= 7 ? 'on-track' : 'behind',
            trend: { value: 2, direction: 'up', period: 'за неделю' }
          },
          {
            id: 'fitness-level',
            title: 'Уровень подготовки',
            description: 'Общий прогресс в фитнесе',
            current: 65,
            target: 80,
            unit: '%',
            color: 'bg-purple-500',
            icon: TrendingUp,
            status: 'on-track',
            trend: { value: 15, direction: 'up', period: 'за месяц' }
          }
        ];

      case 'client':
        const myClientEvents = events.filter(e => e.clientId === user?.id);
        const personalSessions = myClientEvents.filter(e => e.status === 'completed').length;
        const personalGoal = 16;
        const weightLossProgress = 75; // Примерное значение

        return [
          {
            id: 'personal-sessions',
            title: 'Персональные тренировки',
            description: 'Тренировки с персональным тренером',
            current: personalSessions,
            target: personalGoal,
            unit: 'сессий',
            color: 'bg-green-500',
            icon: Activity,
            status: personalSessions >= personalGoal * 0.7 ? 'on-track' : 'behind',
            trend: { value: 5, direction: 'up', period: 'за месяц' }
          },
          {
            id: 'goal-progress',
            title: 'Прогресс к цели',
            description: 'Достижение персональных целей',
            current: weightLossProgress,
            target: 100,
            unit: '%',
            color: 'bg-blue-500',
            icon: Target,
            status: weightLossProgress >= 70 ? 'on-track' : 'behind',
            trend: { value: 20, direction: 'up', period: 'к цели' }
          },
          {
            id: 'consistency',
            title: 'Постоянство тренировок',
            description: 'Регулярность посещений',
            current: 85,
            target: 90,
            unit: '%',
            color: 'bg-purple-500',
            icon: Clock,
            status: 'on-track',
            trend: { value: 10, direction: 'up', period: 'за месяц' }
          }
        ];

      default:
        return [];
    }
  }, [userRole, user, trainers, clients, events]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case 'ahead':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'on-track':
        return <Target className="h-4 w-4 text-blue-600" />;
      case 'behind':
        return <AlertCircle className="h-4 w-4 text-orange-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'ahead':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'on-track':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'behind':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Выполнено';
      case 'ahead':
        return 'Опережение';
      case 'on-track':
        return 'По плану';
      case 'behind':
        return 'Отставание';
      default:
        return 'В процессе';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-blue-600" />
          {roleTexts.progressTitle || 'Прогресс и цели'}
        </CardTitle>
        <p className="text-sm text-gray-600">
          Отслеживание ключевых показателей эффективности
        </p>
      </CardHeader>
      <CardContent className="grid grid-cols-1 xl:grid-cols-2 p-6 pt-0 gap-6">
        {progressItems.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">Нет данных о прогрессе</h3>
            <p className="text-sm">
              Данные о прогрессе появятся после начала активности
            </p>
          </div>
        ) : (
          progressItems.map((item) => {
            const Icon = item.icon;
            const progressPercentage = Math.min(100, (item.current / item.target) * 100);

            return (
              <div key={item.id} className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex flex-col md:flex-row items:left md:items-start gap-3">
                    <div className={`w-10 h-10 rounded-lg ${item.color} flex items-center justify-center`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-gray-900">{item.title}</h3>
                        <Badge variant="outline" className={`text-xs ${getStatusColor(item.status)}`}>
                          {getStatusIcon(item.status)}
                          <span className="ml-1">{getStatusText(item.status)}</span>
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{item.description}</p>

                      {/* Прогресс бар */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">
                            {item.current.toLocaleString()} / {item.target.toLocaleString()} {item.unit}
                          </span>
                          <span className="font-medium text-gray-900">
                            {progressPercentage.toFixed(1)}%
                          </span>
                        </div>
                        <Progress
                          value={progressPercentage}
                          className="h-2"
                        />
                      </div>

                      {/* Тренд */}
                      {item.trend && (
                        <div className="flex items-center gap-1 mt-2 text-xs">
                          <TrendingUp className={`h-3 w-3 ${item.trend.direction === 'up' ? 'text-green-600' : 'text-red-600'
                            }`} />
                          <span className={item.trend.direction === 'up' ? 'text-green-600' : 'text-red-600'}>
                            {item.trend.direction === 'up' ? '+' : '-'}{item.trend.value}%
                          </span>
                          <span className="text-gray-500">{item.trend.period}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}


