// hooks/usePersonalizedActions.ts
"use client";

import { useAuth } from './useAuth';
import { useUnifiedData } from '@/contexts/UnifiedDataContext';
import { usePermissions } from './usePermissions';
import { useCallback, useMemo } from 'react';

export interface PersonalizedAction {
  id: string;
  label: string;
  description: string;
  icon: string;
  priority: 'high' | 'medium' | 'low';
  category: 'create' | 'manage' | 'analyze' | 'communicate';
  action: () => void;
  enabled: boolean;
  roleSpecific: boolean;
}

export function usePersonalizedActions() {
  const { user } = useAuth(); // Используем user вместо userRole
  const userRole = user?.role; // Получаем роль из user
  const { trainers, clients, events } = useUnifiedData();
  const permissions = usePermissions();

  // Генерируем персонализированные действия в зависимости от роли
  const actions = useMemo((): PersonalizedAction[] => {
    if (!userRole) return [];

    const baseActions: PersonalizedAction[] = [];

    switch (userRole) {
      case 'super-admin':
        baseActions.push(
          {
            id: 'system-backup',
            label: 'Создать резервную копию',
            description: 'Создание полной резервной копии системы',
            icon: 'Shield',
            priority: 'high',
            category: 'manage',
            action: () => console.log('Create system backup'),
            enabled: true,
            roleSpecific: true
          },
          {
            id: 'user-management',
            label: 'Управление пользователями',
            description: 'Добавление, редактирование и удаление пользователей',
            icon: 'Users',
            priority: 'high',
            category: 'manage',
            action: () => console.log('Manage users'),
            enabled: true,
            roleSpecific: true
          },
          {
            id: 'system-analytics',
            label: 'Системная аналитика',
            description: 'Просмотр детальной аналитики системы',
            icon: 'BarChart3',
            priority: 'medium',
            category: 'analyze',
            action: () => console.log('View system analytics'),
            enabled: true,
            roleSpecific: true
          },
          {
            id: 'security-audit',
            label: 'Аудит безопасности',
            description: 'Проверка безопасности системы',
            icon: 'AlertTriangle',
            priority: 'medium',
            category: 'analyze',
            action: () => console.log('Security audit'),
            enabled: true,
            roleSpecific: true
          }
        );
        break;

      case 'admin':
        const totalClients = clients.length;
        const totalTrainers = trainers.length;
        
        baseActions.push(
          {
            id: 'add-trainer',
            label: 'Добавить тренера',
            description: 'Регистрация нового тренера в системе',
            icon: 'UserPlus',
            priority: 'high',
            category: 'create',
            action: () => console.log('Add trainer'),
            enabled: true,
            roleSpecific: true
          },
          {
            id: 'financial-report',
            label: 'Финансовый отчет',
            description: 'Просмотр детального финансового отчета',
            icon: 'DollarSign',
            priority: 'high',
            category: 'analyze',
            action: () => console.log('View financial report'),
            enabled: true,
            roleSpecific: true
          },
          {
            id: 'membership-management',
            label: 'Управление абонементами',
            description: 'Создание и редактирование типов абонементов',
            icon: 'CreditCard',
            priority: 'medium',
            category: 'manage',
            action: () => console.log('Manage memberships'),
            enabled: true,
            roleSpecific: true
          },
          {
            id: 'marketing-campaign',
            label: 'Маркетинговая кампания',
            description: 'Запуск новой маркетинговой кампании',
            icon: 'TrendingUp',
            priority: 'medium',
            category: 'create',
            action: () => console.log('Create marketing campaign'),
            enabled: totalClients > 0,
            roleSpecific: true
          }
        );
        break;

      case 'manager':
        baseActions.push(
          {
            id: 'schedule-optimization',
            label: 'Оптимизация расписания',
            description: 'Анализ и улучшение расписания занятий',
            icon: 'Calendar',
            priority: 'high',
            category: 'manage',
            action: () => console.log('Optimize schedule'),
            enabled: true,
            roleSpecific: true
          },
          {
            id: 'team-meeting',
            label: 'Собрание команды',
            description: 'Планирование встречи с тренерами',
            icon: 'Users',
            priority: 'high',
            category: 'communicate',
            action: () => console.log('Schedule team meeting'),
            enabled: trainers.length > 0,
            roleSpecific: true
          },
          {
            id: 'performance-review',
            label: 'Оценка эффективности',
            description: 'Анализ работы команды тренеров',
            icon: 'BarChart3',
            priority: 'medium',
            category: 'analyze',
            action: () => console.log('Performance review'),
            enabled: trainers.length > 0,
            roleSpecific: true
          },
          {
            id: 'equipment-check',
            label: 'Проверка оборудования',
            description: 'Контроль состояния спортивного оборудования',
            icon: 'Settings',
            priority: 'medium',
            category: 'manage',
            action: () => console.log('Check equipment'),
            enabled: true,
            roleSpecific: true
          }
        );
        break;

      case 'trainer':
        const myClients = clients.filter(c => c.trainerId === user?.id);
        
        baseActions.push(
          {
            id: 'add-client',
            label: 'Добавить клиента',
            description: 'Регистрация нового клиента',
            icon: 'UserPlus',
            priority: 'high',
            category: 'create',
            action: () => console.log('Add client'),
            enabled: true,
            roleSpecific: true
          },
          {
            id: 'create-workout',
            label: 'Создать программу тренировок',
            description: 'Разработка индивидуальной программы',
            icon: 'CalendarPlus',
            priority: 'high',
            category: 'create',
            action: () => console.log('Create workout program'),
            enabled: myClients.length > 0,
            roleSpecific: true
          },
          {
            id: 'client-progress',
            label: 'Прогресс клиентов',
            description: 'Просмотр и анализ прогресса ваших клиентов',
            icon: 'TrendingUp',
            priority: 'high',
            category: 'analyze',
            action: () => console.log('View client progress'),
            enabled: myClients.length > 0,
            roleSpecific: true
          },
          {
            id: 'workout-templates',
            label: 'Шаблоны тренировок',
            description: 'Создание и управление шаблонами тренировок',
            icon: 'FileText',
            priority: 'medium',
            category: 'create',
            action: () => console.log('Manage workout templates'),
            enabled: true,
            roleSpecific: true
          },
          {
            id: 'client-communication',
            label: 'Связь с клиентами',
            description: 'Отправка сообщений и уведомлений клиентам',
            icon: 'MessageSquare',
            priority: 'medium',
            category: 'communicate',
            action: () => console.log('Client communication'),
            enabled: myClients.length > 0,
            roleSpecific: true
          },
          {
            id: 'my-schedule',
            label: 'Мое расписание',
            description: 'Просмотр и управление личным расписанием',
            icon: 'Calendar',
            priority: 'medium',
            category: 'manage',
            action: () => console.log('View my schedule'),
            enabled: true,
            roleSpecific: true
          }
        );
        break;

      case 'member':
        const myMemberEvents = events.filter(e => e.clientId === user?.id);
        
        baseActions.push(
          {
            id: 'book-group-class',
            label: 'Записаться на групповое занятие',
            description: 'Выбор и запись на групповые тренировки',
            icon: 'Users',
            priority: 'high',
            category: 'create',
            action: () => console.log('Book group class'),
            enabled: true,
            roleSpecific: true
          },
          {
            id: 'view-schedule',
            label: 'Расписание занятий',
            description: 'Просмотр расписания групповых занятий',
            icon: 'Calendar',
            priority: 'high',
            category: 'analyze',
            action: () => console.log('View class schedule'),
            enabled: true,
            roleSpecific: true
          },
          {
            id: 'my-progress',
            label: 'Мой прогресс',
            description: 'Отслеживание личного прогресса и достижений',
            icon: 'TrendingUp',
            priority: 'medium',
            category: 'analyze',
            action: () => console.log('View my progress'),
            enabled: myMemberEvents.length > 0,
            roleSpecific: true
          },
          {
            id: 'community',
            label: 'Сообщество',
            description: 'Общение с другими участниками',
            icon: 'MessageSquare',
            priority: 'medium',
            category: 'communicate',
            action: () => console.log('Join community'),
            enabled: true,
            roleSpecific: true
          },
          {
            id: 'membership-info',
            label: 'Мой абонемент',
            description: 'Информация о текущем абонементе',
            icon: 'CreditCard',
            priority: 'low',
            category: 'manage',
            action: () => console.log('View membership'),
            enabled: true,
            roleSpecific: true
          }
        );
        break;

      case 'client':
        const myClientEvents = events.filter(e => e.clientId === user?.id);
        
        baseActions.push(
          {
            id: 'book-personal-session',
            label: 'Записаться к тренеру',
            description: 'Запись на персональную тренировку',
            icon: 'UserPlus',
            priority: 'high',
            category: 'create',
            action: () => console.log('Book personal session'),
            enabled: true,
            roleSpecific: true
          },
          {
            id: 'my-workouts',
            label: 'Мои тренировки',
            description: 'История и планируемые тренировки',
            icon: 'Activity',
            priority: 'high',
            category: 'analyze',
            action: () => console.log('View my workouts'),
            enabled: true,
            roleSpecific: true
          },
          {
            id: 'progress-tracking',
            label: 'Отслеживание прогресса',
            description: 'Ведение дневника тренировок и результатов',
            icon: 'BarChart3',
            priority: 'medium',
            category: 'analyze',
            action: () => console.log('Track progress'),
            enabled: myClientEvents.length > 0,
            roleSpecific: true
          },
          {
            id: 'trainer-feedback',
            label: 'Обратная связь с тренером',
            description: 'Общение с персональным тренером',
            icon: 'MessageSquare',
            priority: 'medium',
            category: 'communicate',
            action: () => console.log('Trainer feedback'),
            enabled: true,
            roleSpecific: true
          },
          {
            id: 'goal-setting',
            label: 'Постановка целей',
            description: 'Определение и отслеживание фитнес-целей',
            icon: 'Target',
            priority: 'medium',
            category: 'manage',
            action: () => console.log('Set goals'),
            enabled: true,
            roleSpecific: true
          }
        );
        break;
    }

    // Сортируем действия по приоритету
    return baseActions
      .filter(action => action.enabled)
      .sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });
  }, [userRole, user, clients, events, trainers]);

  // Группируем действия по категориям
  const actionsByCategory = useMemo(() => {
    return actions.reduce((acc, action) => {
      if (!acc[action.category]) {
        acc[action.category] = [];
      }
      acc[action.category].push(action);
      return acc;
    }, {} as Record<string, PersonalizedAction[]>);
  }, [actions]);

  // Получаем рекомендуемые действия (высокий приоритет)
  const recommendedActions = useMemo(() => {
    return actions.filter(action => action.priority === 'high').slice(0, 3);
  }, [actions]);

  // Выполнение действия с логированием
  const executeAction = useCallback((actionId: string) => {
    const action = actions.find(a => a.id === actionId);
    if (action && action.enabled) {
      console.log(`Executing action: ${action.label} for role: ${userRole}`);
      action.action();
      
      // Здесь можно добавить аналитику
      // analytics.track('action_executed', {
      //   actionId,
      //   userRole,
      //   timestamp: new Date()
      // });
    }
  }, [actions, userRole]);

  return {
    actions,
    actionsByCategory,
    recommendedActions,
    executeAction
  };
}
