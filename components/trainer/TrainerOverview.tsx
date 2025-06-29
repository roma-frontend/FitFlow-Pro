// components/trainer/TrainerOverview.tsx (полная версия)
"use client";

import { useTrainerDataQuery } from '@/hooks/useTrainerDataQuery';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Calendar, MessageSquare, TrendingUp, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export default function TrainerOverview() {
  const { 
    stats, 
    workoutStats, 
    messageStats, 
    trainers,
    workouts,
    members,
    clients
  } = useTrainerDataQuery();

  const cards = [
    {
      title: "Активные клиенты",
      value: stats.activeClients,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      change: "+12%"
    },
    {
      title: "Тренировок сегодня",
      value: workoutStats.todayWorkouts,
      icon: Calendar,
      color: "text-green-600",
      bgColor: "bg-green-50",
      change: "+5%"
    },
    {
      title: "Непрочитанные",
      value: messageStats.unreadMessages,
      icon: MessageSquare,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      change: messageStats.unreadMessages > 0 ? "!" : "0"
    },
    {
      title: "Средний рейтинг",
      value: stats.avgRating,
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      change: "4.8/5"
    }
  ];

  const recentWorkouts = workouts
    .sort((a, b) => {
      const dateA = new Date(a._creationTime || a.createdAt || 0).getTime();
      const dateB = new Date(b._creationTime || b.createdAt || 0).getTime();
      return dateB - dateA;
    })
    .slice(0, 5);

  const getWorkoutStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'cancelled': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'scheduled': return <Clock className="h-4 w-4 text-blue-500" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Основные метрики */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {card.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${card.bgColor}`}>
                  <Icon className={`h-4 w-4 ${card.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {typeof card.value === 'number' ? 
                    (card.title.includes('рейтинг') ? card.value.toFixed(1) : card.value) 
                    : card.value
                  }
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {card.change}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Статистика тренировок */}
        <Card>
          <CardHeader>
            <CardTitle>Статистика тренировок</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Всего тренировок</span>
              <Badge variant="secondary">{workoutStats.totalWorkouts}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Завершено</span>
              <Badge variant="default">{workoutStats.completedWorkouts}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Запланировано</span>
              <Badge variant="outline" className='text-gray-600'>{workoutStats.scheduledWorkouts}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Отменено</span>
              <Badge variant="destructive">{workoutStats.cancelledWorkouts}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Средняя длительность</span>
              <span className="font-medium">{workoutStats.averageDuration} мин</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">На этой неделе</span>
              <span className="font-medium">{workoutStats.thisWeekWorkouts}</span>
            </div>
          </CardContent>
        </Card>

        {/* Последние тренировки */}
        <Card>
          <CardHeader>
            <CardTitle>Последние тренировки</CardTitle>
          </CardHeader>
          <CardContent>
            {recentWorkouts.length > 0 ? (
              <div className="space-y-3">
                {recentWorkouts.map((workout, index) => (
                  <div key={workout.id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      {getWorkoutStatusIcon(workout.status || '')}
                      <div>
                        <p className="font-medium text-sm">
                          {workout.clientName || workout.userName || 'Клиент не указан'}
                        </p>
                        <p className="text-xs text-gray-600">
                          {workout.type || 'Тип не указан'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">
                        {workout.date || new Date(workout._creationTime || workout.createdAt || 0).toLocaleDateString('ru-RU')}
                      </p>
                      <p className="text-xs text-gray-500">
                        {workout.time || workout.scheduledTime || 'Время не указано'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">Нет недавних тренировок</p>
              </div>
            )}
            <Button className="w-full mt-4" variant="outline">
              Посмотреть все тренировки
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Дополнительная статистика */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Статистика клиентов */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Клиенты</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Участники</span>
                <span className="font-medium">{members.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Клиенты</span>
                <span className="font-medium">{clients.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Активные</span>
                <span className="font-medium text-green-600">{stats.activeClients}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Всего</span>
                <span className="font-medium">{stats.totalClients}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Статистика сообщений */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Сообщения</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Всего</span>
                <span className="font-medium">{messageStats.totalMessages}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Непрочитанные</span>
                <span className="font-medium text-red-600">{messageStats.unreadMessages}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Сегодня</span>
                <span className="font-medium text-blue-600">{messageStats.todayMessages}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Срочные</span>
                <span className="font-medium text-orange-600">{messageStats.messagesByPriority.urgent}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Типы тренировок */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Типы тренировок</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(workoutStats.workoutsByType).length > 0 ? (
                Object.entries(workoutStats.workoutsByType).map(([type, count]) => (
                  <div key={type} className="flex justify-between">
                    <span className="text-sm text-gray-600 capitalize">
                      {type === 'personal' ? 'Персональные' :
                       type === 'group' ? 'Групповые' :
                       type === 'cardio' ? 'Кардио' :
                       type === 'strength' ? 'Силовые' :
                       type === 'yoga' ? 'Йога' :
                       type === 'pilates' ? 'Пилатес' :
                       type === 'crossfit' ? 'Кроссфит' :
                       type}
                    </span>
                    <span className="font-medium">{count}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  Нет данных о типах тренировок
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Быстрые действия */}
      <Card>
        <CardHeader>
          <CardTitle>Быстрые действия</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 h-20 flex flex-col gap-2">
              <Calendar className="h-5 w-5" />
              <span>Добавить тренировку</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Users className="h-5 w-5" />
              <span>Добавить клиента</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <MessageSquare className="h-5 w-5" />
              <span>Написать сообщение</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* График активности (заглушка) */}
      <Card>
        <CardHeader>
          <CardTitle>Активность за неделю</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <TrendingUp className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">График активности</p>
              <p className="text-sm text-gray-500">Будет добавлен в следующих версиях</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
