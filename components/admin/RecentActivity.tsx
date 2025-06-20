// components/admin/RecentActivity.tsx
"use client";

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/hooks/useAuth';
import { useUnifiedData } from '@/contexts/UnifiedDataContext';
import { useRoleTexts } from '@/lib/roleTexts';
import {
  Activity,
  Calendar,
  Users,
  CheckCircle,
  Clock,
  AlertTriangle,
  Star,
  TrendingUp,
  UserPlus,
  Settings,
  DollarSign,
  Award,
  Target,
  ArrowRight,
  Eye,
  Shield
} from "lucide-react";

interface ActivityItem {
  id: string;
  type: 'session' | 'client' | 'system' | 'achievement' | 'payment' | 'review' | 'goal';
  title: string;
  description: string;
  timestamp: Date;
  status: 'completed' | 'pending' | 'cancelled' | 'success' | 'warning' | 'info';
  icon: React.ComponentType<any>;
  user?: {
    name: string;
    role?: string;
  };
  metadata?: {
    amount?: number;
    rating?: number;
    progress?: number;
  };
}

export function RecentActivity() {
  const { user } = useAuth();
  const userRole = user?.role;
  const { clients, trainers, events } = useUnifiedData();
  const roleTexts = useRoleTexts(userRole);

  // Генерируем персонализированную активность
  const activities = useMemo((): ActivityItem[] => {
    if (!userRole) return [];

    const now = new Date();
    const activities: ActivityItem[] = [];

    switch (userRole) {
      case 'super-admin':
        activities.push(
          {
            id: 'system-backup',
            type: 'system',
            title: 'Автоматическое резервное копирование',
            description: 'Создана резервная копия базы данных',
            timestamp: new Date(now.getTime() - 15 * 60 * 1000), // 15 минут назад
            status: 'completed',
            icon: Settings,
            metadata: { progress: 100 }
          },
          {
            id: 'user-registration',
            type: 'client',
            title: 'Новая регистрация пользователя',
            description: 'Зарегистрирован новый администратор',
            timestamp: new Date(now.getTime() - 45 * 60 * 1000), // 45 минут назад
            status: 'success',
            icon: UserPlus,
            user: { name: 'Система', role: 'system' }
          },
          {
            id: 'system-update',
            type: 'system',
            title: 'Обновление системы',
            description: 'Установлены обновления безопасности',
            timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 часа назад
            status: 'completed',
            icon: Shield,
            metadata: { progress: 100 }
          },
          {
            id: 'performance-alert',
            type: 'system',
            title: 'Мониторинг производительности',
            description: 'Обнаружена повышенная нагрузка на сервер',
            timestamp: new Date(now.getTime() - 3 * 60 * 60 * 1000), // 3 часа назад
            status: 'warning',
            icon: AlertTriangle
          }
        );
        break;

      case 'admin':
        activities.push(
          {
            id: 'payment-received',
            type: 'payment',
            title: 'Получен платеж',
            description: 'Оплата абонемента от Анны Петровой',
            timestamp: new Date(now.getTime() - 20 * 60 * 1000), // 20 минут назад
            status: 'success',
            icon: DollarSign,
            user: { name: 'Анна Петрова', role: 'client' },
            metadata: { amount: 5000 }
          },
          {
            id: 'trainer-added',
            type: 'client',
            title: 'Добавлен новый тренер',
            description: 'Михаил Иванов присоединился к команде',
            timestamp: new Date(now.getTime() - 1 * 60 * 60 * 1000), // 1 час назад
            status: 'success',
            icon: UserPlus,
            user: { name: 'Михаил Иванов', role: 'trainer' }
          },
          {
            id: 'monthly-report',
            type: 'system',
            title: 'Месячный отчет готов',
            description: 'Сформирован финансовый отчет за октябрь',
            timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 часа назад
            status: 'completed',
            icon: TrendingUp,
            metadata: { amount: 847230 }
          },
          {
            id: 'membership-expiring',
            type: 'system',
            title: 'Истекающие абонементы',
            description: '5 абонементов истекают в ближайшие 3 дня',
            timestamp: new Date(now.getTime() - 4 * 60 * 60 * 1000), // 4 часа назад
            status: 'warning',
            icon: AlertTriangle
          }
        );
        break;

      case 'manager':
        activities.push(
          {
            id: 'schedule-updated',
            type: 'session',
            title: 'Обновлено расписание',
            description: 'Добавлены новые групповые занятия на следующую неделю',
            timestamp: new Date(now.getTime() - 30 * 60 * 1000), // 30 минут назад
            status: 'completed',
            icon: Calendar
          },
          {
            id: 'trainer-meeting',
            type: 'session',
            title: 'Собрание с тренерами',
            description: 'Проведена еженедельная планерка команды',
            timestamp: new Date(now.getTime() - 1 * 60 * 60 * 1000), // 1 час назад
            status: 'completed',
            icon: Users,
            user: { name: 'Команда тренеров' }
          },
          {
            id: 'equipment-check',
            type: 'system',
            title: 'Проверка оборудования',
            description: 'Завершена инвентаризация спортивного оборудования',
            timestamp: new Date(now.getTime() - 3 * 60 * 60 * 1000), // 3 часа назад
            status: 'completed',
            icon: Settings,
            metadata: { progress: 100 }
          },
          {
            id: 'room-booking',
            type: 'session',
            title: 'Конфликт в расписании',
            description: 'Обнаружено пересечение в бронировании зала №2',
            timestamp: new Date(now.getTime() - 5 * 60 * 60 * 1000), // 5 часов назад
            status: 'warning',
            icon: AlertTriangle
          }
        );
        break;

      case 'trainer':
        const myClients = clients.filter(c => c.trainerId === user?.id);
        activities.push(
          {
            id: 'session-completed',
            type: 'session',
            title: 'Тренировка завершена',
            description: 'Персональная тренировка с Еленой Сидоровой',
            timestamp: new Date(now.getTime() - 10 * 60 * 1000), // 10 минут назад
            status: 'completed',
            icon: CheckCircle,
            user: { name: 'Елена Сидорова', role: 'client' }
          },
          {
            id: 'client-review',
            type: 'review',
            title: 'Новый отзыв',
            description: 'Получен отзыв от клиента',
            timestamp: new Date(now.getTime() - 45 * 60 * 1000), // 45 минут назад
            status: 'success',
            icon: Star,
            user: { name: 'Анна Петрова', role: 'client' },
            metadata: { rating: 5 }
          },
          {
            id: 'program-created',
            type: 'session',
            title: 'Создана программа тренировок',
            description: 'Разработана индивидуальная программа для нового клиента',
            timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 часа назад
            status: 'completed',
            icon: Target,
            user: { name: 'Дмитрий Козлов', role: 'client' }
          },
          {
            id: 'next-session',
            type: 'session',
            title: 'Предстоящая тренировка',
            description: 'Через 30 минут тренировка с Михаилом Ивановым',
            timestamp: new Date(now.getTime() + 30 * 60 * 1000), // через 30 минут
            status: 'pending',
            icon: Clock,
            user: { name: 'Михаил Иванов', role: 'client' }
          }
        );
        break;

      case 'member':
        activities.push(
          {
            id: 'class-booked',
            type: 'session',
            title: 'Запись на занятие',
            description: 'Вы записались на йогу для начинающих',
            timestamp: new Date(now.getTime() - 25 * 60 * 1000), // 25 минут назад
            status: 'success',
            icon: Calendar
          },
          {
            id: 'achievement-unlocked',
            type: 'achievement',
            title: 'Новое достижение!',
            description: 'Разблокировано: "7 дней подряд"',
            timestamp: new Date(now.getTime() - 1 * 60 * 60 * 1000), // 1 час назад
            status: 'success',
            icon: Award
          },
          {
            id: 'class-completed',
            type: 'session',
            title: 'Занятие завершено',
            description: 'Функциональная тренировка - 45 минут',
            timestamp: new Date(now.getTime() - 3 * 60 * 60 * 1000), // 3 часа назад
            status: 'completed',
            icon: CheckCircle,
            metadata: { progress: 75 }
          },
          {
            id: 'reminder',
            type: 'session',
            title: 'Напоминание',
            description: 'Завтра в 18:00 - Пилатес для всех уровней',
            timestamp: new Date(now.getTime() + 18 * 60 * 60 * 1000), // завтра
            status: 'info',
            icon: Clock
          }
        );
        break;

      case 'client':
        activities.push(
          {
            id: 'personal-session',
            type: 'session',
            title: 'Персональная тренировка',
            description: 'Завершена тренировка с тренером Еленой',
            timestamp: new Date(now.getTime() - 15 * 60 * 1000), // 15 минут назад
            status: 'completed',
            icon: CheckCircle,
            user: { name: 'Елена Петрова', role: 'trainer' }
          },
          {
            id: 'goal-progress',
            type: 'goal',
            title: 'Прогресс к цели',
            description: 'Достигнуто 75% от цели по снижению веса',
            timestamp: new Date(now.getTime() - 1 * 60 * 60 * 1000), // 1 час назад
            status: 'success',
            icon: Target,
            metadata: { progress: 75 }
          },
          {
            id: 'program-updated',
            type: 'session',
            title: 'Обновлена программа',
            description: 'Тренер скорректировал вашу программу тренировок',
            timestamp: new Date(now.getTime() - 4 * 60 * 60 * 1000), // 4 часа назад
            status: 'info',
            icon: Settings,
            user: { name: 'Елена Петрова', role: 'trainer' }
          },
          {
            id: 'next-appointment',
            type: 'session',
            title: 'Следующая тренировка',
            description: 'Завтра в 10:00 - персональная тренировка',
            timestamp: new Date(now.getTime() + 20 * 60 * 60 * 1000), // завтра
            status: 'pending',
            icon: Clock
          }
        );
        break;
    }

    // Сортируем по времени (новые сначала)
    return activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [userRole, user, clients, trainers, events]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'success':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'pending':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'cancelled':
      case 'warning':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'info':
        return 'text-purple-600 bg-purple-50 border-purple-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Завершено';
      case 'success':
        return 'Успешно';
      case 'pending':
        return 'Ожидается';
      case 'cancelled':
        return 'Отменено';
      case 'warning':
        return 'Внимание';
      case 'info':
        return 'Информация';
      default:
               return 'Неизвестно';
    }
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    
    if (diff < 0) {
      // Будущее время
      const futureDiff = Math.abs(diff);
      if (futureDiff < 60 * 60 * 1000) {
        const minutes = Math.floor(futureDiff / (60 * 1000));
        return `через ${minutes} мин`;
      } else if (futureDiff < 24 * 60 * 60 * 1000) {
        const hours = Math.floor(futureDiff / (60 * 60 * 1000));
        return `через ${hours} ч`;
      } else {
        return 'завтра';
      }
    }
    
    // Прошедшее время
    if (diff < 60 * 1000) {
      return 'только что';
    } else if (diff < 60 * 60 * 1000) {
      const minutes = Math.floor(diff / (60 * 1000));
      return `${minutes} мин назад`;
    } else if (diff < 24 * 60 * 60 * 1000) {
      const hours = Math.floor(diff / (60 * 60 * 1000));
      return `${hours} ч назад`;
    } else {
      const days = Math.floor(diff / (24 * 60 * 60 * 1000));
      return `${days} дн назад`;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-blue-600" />
          Последняя активность
        </CardTitle>
        <p className="text-sm text-gray-600">
          {userRole === 'super-admin' ? 'Системные события и активность пользователей' :
           userRole === 'admin' ? 'Важные события и транзакции' :
           userRole === 'manager' ? 'Управленческие задачи и события' :
           userRole === 'trainer' ? 'Ваши тренировки и взаимодействие с клиентами' :
           'Ваши занятия и достижения'}
        </p>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">Нет активности</h3>
            <p className="text-sm">
              Активность появится после начала работы в системе
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.slice(0, 8).map((activity) => {
              const Icon = activity.icon;
              
              return (
                <div key={activity.id} className="flex flex-col md:flex-row items-start gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    activity.status === 'completed' || activity.status === 'success' ? 'bg-green-100' :
                    activity.status === 'pending' ? 'bg-blue-100' :
                    activity.status === 'warning' ? 'bg-orange-100' :
                    activity.status === 'info' ? 'bg-purple-100' :
                    'bg-gray-100'
                  }`}>
                    <Icon className={`h-5 w-5 ${
                      activity.status === 'completed' || activity.status === 'success' ? 'text-green-600' :
                      activity.status === 'pending' ? 'text-blue-600' :
                      activity.status === 'warning' ? 'text-orange-600' :
                      activity.status === 'info' ? 'text-purple-600' :
                      'text-gray-600'
                    }`} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col md:flex-row items-start justify-between gap-2 mb-1">
                      <h4 className="font-medium text-gray-900 text-sm">
                        {activity.title}
                      </h4>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Badge variant="outline" className={`text-xs ${getStatusColor(activity.status)}`}>
                          {getStatusText(activity.status)}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {formatTimeAgo(activity.timestamp)}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">
                      {activity.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        {activity.user && (
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            <span>{activity.user.name}</span>
                            {activity.user.role && (
                              <Badge variant="secondary" className="text-xs px-1 py-0">
                                {activity.user.role === 'trainer' ? 'Тренер' :
                                 activity.user.role === 'client' ? 'Клиент' :
                                 activity.user.role === 'admin' ? 'Админ' :
                                 activity.user.role === 'system' ? 'Система' :
                                 activity.user.role}
                              </Badge>
                            )}
                          </div>
                        )}
                        
                        {activity.metadata?.amount && (
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            <span>₽{activity.metadata.amount.toLocaleString()}</span>
                          </div>
                        )}
                        
                        {activity.metadata?.rating && (
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-yellow-500" />
                            <span>{activity.metadata.rating}/5</span>
                          </div>
                        )}
                        
                        {activity.metadata?.progress && (
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" />
                            <span>{activity.metadata.progress}%</span>
                          </div>
                        )}
                      </div>
                      
                      {activity.type === 'session' && activity.status === 'pending' && (
                        <Button variant="ghost" size="sm" className="h-6 text-xs">
                          <Eye className="h-3 w-3 mr-1" />
                          Подробнее
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            
            {activities.length > 8 && (
              <div className="pt-4 border-t">
                <Button variant="outline" className="w-full group">
                  Показать всю активность
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            )}
          </div>
        )}
        
        {/* Быстрые фильтры для активности */}
        <div className="mt-6 pt-4 border-t">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-900">Фильтры</h4>
            <Button variant="ghost" size="sm" className="text-xs h-6">
              Сбросить
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {userRole === 'super-admin' && (
              <>
                <Badge variant="outline" className="cursor-pointer hover:bg-blue-50 text-black">
                  <Settings className="h-3 w-3 mr-1" />
                  Система
                </Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-green-50 text-black">
                  <Users className="h-3 w-3 mr-1" />
                  Пользователи
                </Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-red-50 text-black">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Ошибки
                </Badge>
              </>
            )}
            
            {userRole === 'admin' && (
              <>
                <Badge variant="outline" className="cursor-pointer hover:bg-green-50">
                  <DollarSign className="h-3 w-3 mr-1" />
                  Платежи
                </Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-blue-50">
                  <UserPlus className="h-3 w-3 mr-1" />
                  Новые клиенты
                </Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-purple-50">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Отчеты
                </Badge>
              </>
            )}
            
            {userRole === 'manager' && (
              <>
                <Badge variant="outline" className="cursor-pointer hover:bg-blue-50">
                  <Calendar className="h-3 w-3 mr-1" />
                  Расписание
                </Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-green-50">
                  <Users className="h-3 w-3 mr-1" />
                  Команда
                </Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-orange-50">
                  <Settings className="h-3 w-3 mr-1" />
                  Оборудование
                </Badge>
              </>
            )}
            
            {userRole === 'trainer' && (
              <>
                <Badge variant="outline" className="cursor-pointer hover:bg-green-50">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Тренировки
                </Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-yellow-50">
                  <Star className="h-3 w-3 mr-1" />
                  Отзывы
                </Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-blue-50">
                  <Users className="h-3 w-3 mr-1" />
                  Клиенты
                </Badge>
              </>
            )}
            
            {(userRole === 'member' || userRole === 'client') && (
              <>
                <Badge variant="outline" className="cursor-pointer hover:bg-green-50">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Занятия
                </Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-purple-50">
                  <Award className="h-3 w-3 mr-1" />
                  Достижения
                </Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-blue-50">
                  <Target className="h-3 w-3 mr-1" />
                  Цели
                </Badge>
              </>
            )}
          </div>
        </div>
        
        {/* Статистика активности */}
        <div className="mt-6 pt-4 border-t bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Сводка за сегодня</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-blue-600">
                {activities.filter(a => a.status === 'completed').length}
              </div>
              <div className="text-xs text-gray-600">Завершено</div>
            </div>
            <div>
              <div className="text-lg font-bold text-green-600">
                {activities.filter(a => a.status === 'success').length}
              </div>
              <div className="text-xs text-gray-600">Успешно</div>
            </div>
            <div>
              <div className="text-lg font-bold text-orange-600">
                {activities.filter(a => a.status === 'pending').length}
              </div>
              <div className="text-xs text-gray-600">В ожидании</div>
            </div>
            <div>
              <div className="text-lg font-bold text-purple-600">
                {activities.length}
              </div>
              <div className="text-xs text-gray-600">Всего событий</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

