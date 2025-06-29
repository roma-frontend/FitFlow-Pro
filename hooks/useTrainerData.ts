// hooks/useTrainerData.ts (исправленная версия)
"use client";

import React, { useMemo } from "react";
import type { 
  Trainer, 
  Member, 
  Client, 
  Workout, 
  UserBooking,
  SystemStats,
  MessageStats,
  WorkoutStats,
  MemberStats,
  ClientStats
} from '@/types/trainer';
import { useTrainerDataQuery } from "./useTrainerDataQuery";

export function useRealtimeStats() {
  const { stats, messageStats, workoutStats, memberStats, clientStats, isLoading } = useTrainerDataQuery();
  
  return useMemo(() => {
    if (isLoading) {
      return {
        keyMetrics: {
          totalMembers: 0,
          activeMembers: 0,
          totalClients: 0,
          activeClients: 0,
          todayWorkouts: 0,
          unreadMessages: 0,
          avgRating: 0
        },
        alerts: {
          expiringSoon: 0,
          unreadMessages: 0,
          todayWorkouts: 0,
          trialClients: 0
        },
        quickStats: {
          totalTrainers: 0,
          completedWorkouts: 0,
          scheduledWorkouts: 0,
          newMembersThisMonth: 0,
          newClientsThisMonth: 0,
          clientRetention: 0
        }
      };
    }

    return {
      keyMetrics: {
        totalMembers: memberStats.total,
        activeMembers: memberStats.active,
        totalClients: clientStats.total,
        activeClients: clientStats.active,
        todayWorkouts: workoutStats.todayWorkouts,
        unreadMessages: messageStats.unreadMessages,
        avgRating: stats.avgRating
      },
      
      alerts: {
        expiringSoon: memberStats.expiringSoon,
        unreadMessages: messageStats.unreadMessages,
        todayWorkouts: workoutStats.todayWorkouts,
        trialClients: clientStats.trial
      },
      
      quickStats: {
        totalTrainers: stats.totalTrainers,
        completedWorkouts: workoutStats.completedWorkouts,
        scheduledWorkouts: workoutStats.scheduledWorkouts,
        newMembersThisMonth: memberStats.newThisMonth,
        newClientsThisMonth: clientStats.newThisMonth,
        clientRetention: clientStats.retention
      }
    };
  }, [stats, messageStats, workoutStats, memberStats, clientStats, isLoading]);
}

// Хук для получения данных конкретного тренера
export function useTrainerById(trainerId: string) {
  const { trainers, isLoading } = useTrainerDataQuery();
  
  const trainer = useMemo(() => {
    return trainers.find((t: Trainer) => (t._id || t.id) === trainerId) || null;
  }, [trainers, trainerId]);
  
  return {
    trainer,
    isLoading,
    totalClients: trainer?.activeClients || 0,
    activeClients: trainer?.activeClients || 0
  };
}

// Хук для получения данных конкретного участника
export function useMemberById(memberId: string) {
  const { members, isLoading } = useTrainerDataQuery();
  
  const member = useMemo(() => {
    return members.find((m: Member) => (m._id || m.id) === memberId) || null;
  }, [members, memberId]);
  
  return {
    member,
    isLoading,
    isActive: member?.status === 'active' && (member?.membershipExpiry || 0) > Date.now(),
    daysUntilExpiry: member?.membershipExpiry 
      ? Math.ceil((member.membershipExpiry - Date.now()) / (1000 * 60 * 60 * 24))
      : 0
  };
}

// Хук для получения статистики пользователя
export function useUserById(userId: string) {
  const { workouts, userBookings, isLoading } = useTrainerDataQuery();
  
  const userStats = useMemo(() => {
    const userWorkouts = workouts.filter((w: Workout) => w.userId === userId);
    const userBookingsFiltered = userBookings.filter((b: UserBooking) => b.userId === userId);
    
    return {
      workouts: userWorkouts,
      bookings: userBookingsFiltered,
      totalWorkouts: userWorkouts.length,
      totalBookings: userBookingsFiltered.length,
      completedWorkouts: userWorkouts.filter((w: Workout) => w.status === 'completed').length,
      completedBookings: userBookingsFiltered.filter((b: UserBooking) => b.status === 'completed').length,
      upcomingWorkouts: userWorkouts.filter((w: Workout) => {
        const workoutTime = w._creationTime || new Date(w.createdAt || 0).getTime();
        return w.status === 'scheduled' && workoutTime > Date.now();
      }).length,
      upcomingBookings: userBookingsFiltered.filter((b: UserBooking) => 
        b.status === 'scheduled' && b.startTime > Date.now()
      ).length
    };
  }, [workouts, userBookings, userId]);
  
  return {
    ...userStats,
    isLoading
  };
}

// Хук для поиска
export function useSearch(query: string, type: 'all' | 'trainers' | 'members' | 'clients' | 'workouts' = 'all') {
  const { trainers, members, clients, workouts, isLoading } = useTrainerDataQuery();
  
  return useMemo(() => {
    if (isLoading || !query.trim()) {
      return { results: [], total: 0, isLoading };
    }

    const searchQuery = query.toLowerCase();
    const results: any[] = [];

    if (type === 'all' || type === 'trainers') {
      const foundTrainers = trainers.filter((t: Trainer) =>
        t.name?.toLowerCase().includes(searchQuery) ||
        t.email?.toLowerCase().includes(searchQuery)
      ).map((t: Trainer) => ({ ...t, resultType: 'trainer' }));
      results.push(...foundTrainers);
    }

    if (type === 'all' || type === 'members') {
      const foundMembers = members.filter((m: Member) =>
        m.name?.toLowerCase().includes(searchQuery) ||
        m.email?.toLowerCase().includes(searchQuery) ||
        m.phone?.toLowerCase().includes(searchQuery)
      ).map((m: Member) => ({ ...m, resultType: 'member' }));
      results.push(...foundMembers);
    }

    if (type === 'all' || type === 'clients') {
      const foundClients = clients.filter((c: Client) =>
        c.name?.toLowerCase().includes(searchQuery) ||
        c.email?.toLowerCase().includes(searchQuery) ||
        c.phone?.toLowerCase().includes(searchQuery)
      ).map((c: Client) => ({ ...c, resultType: 'client' }));
      results.push(...foundClients);
    }

    if (type === 'all' || type === 'workouts') {
      const foundWorkouts = workouts.filter((w: Workout) =>
        w.type?.toLowerCase().includes(searchQuery) ||
        w.clientName?.toLowerCase().includes(searchQuery) ||
        w.userName?.toLowerCase().includes(searchQuery)
      ).map((w: Workout) => ({ ...w, resultType: 'workout' }));
      results.push(...foundWorkouts);
    }

    return {
      results: results.slice(0, 50),
      total: results.length,
      isLoading: false
    };
  }, [query, type, trainers, members, clients, workouts, isLoading]);
}

// Хук для сегодняшнего расписания
export function useTodaySchedule(trainerId?: string) {
  const { workouts, userBookings, isLoading } = useTrainerDataQuery();
  
  return useMemo(() => {
    if (isLoading) {
      return {
        sessions: [],
        total: 0,
        completed: 0,
        scheduled: 0,
        cancelled: 0,
        inProgress: 0
      };
    }

    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0).getTime();
    const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999).getTime();
    
    let todayWorkouts = workouts.filter((w: Workout) => {
      const workoutTime = w._creationTime || new Date(w.createdAt || 0).getTime();
      return workoutTime >= todayStart && workoutTime <= todayEnd;
    });

    let todayBookings = userBookings.filter((b: UserBooking) => {
      return b.startTime >= todayStart && b.startTime <= todayEnd;
    });

    if (trainerId) {
      todayWorkouts = todayWorkouts.filter((w: Workout) => w.trainerId === trainerId);
      todayBookings = todayBookings.filter((b: UserBooking) => b.trainerId === trainerId);
    }

    const allSessions = [
      ...todayWorkouts.map((w: Workout) => {
        const workoutTime = w._creationTime || new Date(w.createdAt || 0).getTime();
        return {
          ...w,
          type: 'workout' as const,
          time: workoutTime,
          clientName: w.userName || w.clientName || 'Неизвестно',
          timeFormatted: new Date(workoutTime).toLocaleTimeString('ru-RU', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })
        };
      }),
      ...todayBookings.map((b: UserBooking) => ({
        ...b,
        type: 'booking' as const,
        time: b.startTime,
        clientName: b.userName || 'Неизвестно',
        timeFormatted: new Date(b.startTime).toLocaleTimeString('ru-RU', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })
      }))
    ].sort((a, b) => {
      const timeA = typeof a.time === 'number' ? a.time : new Date(a.time).getTime();
      const timeB = typeof b.time === 'number' ? b.time : new Date(b.time).getTime();
      return timeA - timeB;
    });

    return {
      sessions: allSessions,
      total: allSessions.length,
      completed: allSessions.filter((s: any) => s.status === 'completed').length,
      scheduled: allSessions.filter((s: any) => s.status === 'scheduled').length,
      cancelled: allSessions.filter((s: any) => s.status === 'cancelled').length,
      inProgress: allSessions.filter((s: any) => s.status === 'in-progress').length
    };
  }, [workouts, userBookings, trainerId, isLoading]);
}

// Хук для месячной статистики
export function useMonthlyStats(year: number) {
  const { workouts, userBookings, members, clients, isLoading } = useTrainerDataQuery();
  
  return useMemo(() => {
    if (isLoading) {
      return Array.from({ length: 12 }, (_, index) => ({
        month: index + 1,
        monthName: new Date(year, index).toLocaleString('ru-RU', { month: 'long' }),
        workouts: 0,
        bookings: 0,
        totalSessions: 0,
        newMembers: 0,
        newClients: 0,
        completedSessions: 0,
        revenue: 0
      }));
    }

    const monthlyData = Array.from({ length: 12 }, (_, index) => {
      const month = index;
      const monthStart = new Date(year, month, 1).getTime();
      const monthEnd = new Date(year, month + 1, 0, 23, 59, 59, 999).getTime();
      
      const monthWorkouts = workouts.filter((w: Workout) => {
        const workoutTime = w._creationTime || new Date(w.createdAt || 0).getTime();
        return workoutTime >= monthStart && workoutTime <= monthEnd;
      });

      const monthBookings = userBookings.filter((b: UserBooking) => {
        return b.startTime >= monthStart && b.startTime <= monthEnd;
      });

      const newMembers = members.filter((m: Member) => {
        const joinTime = m.joinDate || m.createdAt || 0;
        return joinTime >= monthStart && joinTime <= monthEnd;
      });

      const newClients = clients.filter((c: Client) => {
        const joinTime = new Date(c.joinDate).getTime();
        return joinTime >= monthStart && joinTime <= monthEnd;
      });

      return {
        month: month + 1,
        monthName: new Date(year, month).toLocaleString('ru-RU', { month: 'long' }),
        workouts: monthWorkouts.length,
        bookings: monthBookings.length,
        totalSessions: monthWorkouts.length + monthBookings.length,
        newMembers: newMembers.length,
        newClients: newClients.length,
        completedSessions: monthWorkouts.filter((w: Workout) => w.status === 'completed').length + 
                          monthBookings.filter((b: UserBooking) => b.status === 'completed').length,
        revenue: monthWorkouts
          .filter((w: Workout) => w.status === 'completed')
          .reduce((sum: number, w: Workout) => sum + (w.price || 0), 0)
      };
    });

    return monthlyData;
  }, [workouts, userBookings, members, clients, year, isLoading]);
}

// Дополнительные хуки для удобства
export function useWorkoutsByTrainer(trainerId: string) {
  const { workouts, isLoading } = useTrainerDataQuery();
  
  return useMemo(() => {
    const trainerWorkouts = workouts.filter((w: Workout) => w.trainerId === trainerId);
    
    return {
      workouts: trainerWorkouts,
      total: trainerWorkouts.length,
      completed: trainerWorkouts.filter((w: Workout) => w.status === 'completed').length,
      scheduled: trainerWorkouts.filter((w: Workout) => w.status === 'scheduled').length,
      cancelled: trainerWorkouts.filter((w: Workout) => w.status === 'cancelled').length,
      isLoading
    };
  }, [workouts, trainerId, isLoading]);
}

export function useClientsByTrainer(trainerId: string) {
  const { clients, members, isLoading } = useTrainerDataQuery();
  
  return useMemo(() => {
    const trainerClients = clients.filter((c: Client) => c.trainerId === trainerId);
    const trainerMembers = members.filter((m: Member) => m.trainerId === trainerId);
    
    return {
            clients: trainerClients,
      members: trainerMembers,
      totalClients: trainerClients.length,
      totalMembers: trainerMembers.length,
      activeClients: trainerClients.filter((c: Client) => c.status === 'active').length,
      activeMembers: trainerMembers.filter((m: Member) => m.status === 'active').length,
      trialClients: trainerClients.filter((c: Client) => c.status === 'trial').length,
      isLoading
    };
  }, [clients, members, trainerId, isLoading]);
}

// Хук для получения статистики по типам тренировок
export function useWorkoutTypeStats() {
  const { workouts, isLoading } = useTrainerDataQuery();
  
  return useMemo(() => {
    if (isLoading) {
      return {
        byType: {},
        byStatus: {},
        totalRevenue: 0,
        averagePrice: 0
      };
    }

    const byType: Record<string, number> = {};
    const byStatus: Record<string, number> = {};
    let totalRevenue = 0;
    let completedWorkouts = 0;

    workouts.forEach((w: Workout) => {
      // Подсчет по типам
      const type = w.type || 'unknown';
      byType[type] = (byType[type] || 0) + 1;

      // Подсчет по статусам
      const status = w.status || 'unknown';
      byStatus[status] = (byStatus[status] || 0) + 1;

      // Подсчет доходов
      if (w.status === 'completed' && w.price) {
        totalRevenue += w.price;
        completedWorkouts++;
      }
    });

    return {
      byType,
      byStatus,
      totalRevenue,
      averagePrice: completedWorkouts > 0 ? totalRevenue / completedWorkouts : 0,
      isLoading: false
    };
  }, [workouts, isLoading]);
}

// Хук для получения уведомлений и алертов
export function useNotifications() {
  const { members, clients, workouts, messages, isLoading } = useTrainerDataQuery();
  
  return useMemo(() => {
    if (isLoading) {
      return {
        notifications: [],
        count: 0,
        urgent: 0,
        isLoading: true
      };
    }

    const notifications: Array<{
      id: string;
      type: 'warning' | 'info' | 'error' | 'success';
      title: string;
      message: string;
      timestamp: number;
      urgent: boolean;
    }> = [];

    // Проверка истекающих абонементов
    const now = Date.now();
    const oneWeekFromNow = now + (7 * 24 * 60 * 60 * 1000);

    members.forEach((member: Member) => {
      if (member.membershipExpiry && member.membershipExpiry <= oneWeekFromNow && member.membershipExpiry > now) {
        const daysLeft = Math.ceil((member.membershipExpiry - now) / (1000 * 60 * 60 * 24));
        notifications.push({
          id: `member-expiry-${member._id || member.id}`,
          type: 'warning',
          title: 'Истекающий абонемент',
          message: `У ${member.name} абонемент истекает через ${daysLeft} дн.`,
          timestamp: now,
          urgent: daysLeft <= 3
        });
      }
    });

    // Проверка непрочитанных сообщений
    const unreadMessages = messages.filter((m: any) => {
      if (m.status && m.status !== 'read') return true;
      if (m.readAt && typeof m.readAt === 'object') {
        return Object.keys(m.readAt).length === 0;
      }
      return false;
    });

    if (unreadMessages.length > 0) {
      notifications.push({
        id: 'unread-messages',
        type: 'info',
        title: 'Непрочитанные сообщения',
        message: `У вас ${unreadMessages.length} непрочитанных сообщений`,
        timestamp: now,
        urgent: unreadMessages.some((m: any) => m.priority === 'urgent')
      });
    }

    // Проверка сегодняшних тренировок
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0).getTime();
    const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999).getTime();

    const todayWorkouts = workouts.filter((w: Workout) => {
      const workoutTime = w._creationTime || new Date(w.createdAt || 0).getTime();
      return workoutTime >= todayStart && workoutTime <= todayEnd && w.status === 'scheduled';
    });

    if (todayWorkouts.length > 0) {
      notifications.push({
        id: 'today-workouts',
        type: 'info',
        title: 'Тренировки на сегодня',
        message: `Запланировано ${todayWorkouts.length} тренировок`,
        timestamp: now,
        urgent: false
      });
    }

    // Проверка клиентов на пробном периоде
    const trialClients = clients.filter((c: Client) => c.status === 'trial');
    if (trialClients.length > 0) {
      notifications.push({
        id: 'trial-clients',
        type: 'info',
        title: 'Клиенты на пробном периоде',
        message: `${trialClients.length} клиентов на пробном периоде`,
        timestamp: now,
        urgent: false
      });
    }

    // Сортировка по важности и времени
    notifications.sort((a, b) => {
      if (a.urgent && !b.urgent) return -1;
      if (!a.urgent && b.urgent) return 1;
      return b.timestamp - a.timestamp;
    });

    return {
      notifications: notifications.slice(0, 10), // Показываем только последние 10
      count: notifications.length,
      urgent: notifications.filter(n => n.urgent).length,
      isLoading: false
    };
  }, [members, clients, workouts, messages, isLoading]);
}

// Хук для получения статистики доходов
export function useRevenueStats(period: 'week' | 'month' | 'year' = 'month') {
  const { workouts, isLoading } = useTrainerDataQuery();
  
  return useMemo(() => {
    if (isLoading) {
      return {
        total: 0,
        average: 0,
        growth: 0,
        byPeriod: [],
        isLoading: true
      };
    }

    const now = new Date();
    const completedWorkouts = workouts.filter((w: Workout) => w.status === 'completed' && w.price);

    // Текущий период
    let currentPeriodStart: number;
    let previousPeriodStart: number;
    let previousPeriodEnd: number;

    switch (period) {
      case 'week':
        currentPeriodStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay()).getTime();
        previousPeriodStart = currentPeriodStart - (7 * 24 * 60 * 60 * 1000);
        previousPeriodEnd = currentPeriodStart - 1;
        break;
      case 'month':
        currentPeriodStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
        previousPeriodStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).getTime();
        previousPeriodEnd = currentPeriodStart - 1;
        break;
      case 'year':
        currentPeriodStart = new Date(now.getFullYear(), 0, 1).getTime();
        previousPeriodStart = new Date(now.getFullYear() - 1, 0, 1).getTime();
        previousPeriodEnd = currentPeriodStart - 1;
        break;
    }

    const currentPeriodWorkouts = completedWorkouts.filter((w: Workout) => {
      const workoutTime = w._creationTime || new Date(w.createdAt || 0).getTime();
      return workoutTime >= currentPeriodStart;
    });

    const previousPeriodWorkouts = completedWorkouts.filter((w: Workout) => {
      const workoutTime = w._creationTime || new Date(w.createdAt || 0).getTime();
      return workoutTime >= previousPeriodStart && workoutTime <= previousPeriodEnd;
    });

    const currentRevenue = currentPeriodWorkouts.reduce((sum: number, w: Workout) => sum + (w.price || 0), 0);
    const previousRevenue = previousPeriodWorkouts.reduce((sum: number, w: Workout) => sum + (w.price || 0), 0);

    const growth = previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0;
    const average = currentPeriodWorkouts.length > 0 ? currentRevenue / currentPeriodWorkouts.length : 0;

    return {
      total: currentRevenue,
      average,
      growth,
      currentPeriodSessions: currentPeriodWorkouts.length,
      previousPeriodSessions: previousPeriodWorkouts.length,
      isLoading: false
    };
  }, [workouts, period, isLoading]);
}

// Хук для получения топ тренеров
export function useTopTrainers(limit: number = 5) {
  const { trainers, workouts, isLoading } = useTrainerDataQuery();
  
  return useMemo(() => {
    if (isLoading) {
      return {
        topTrainers: [],
        isLoading: true
      };
    }

    const trainerStats = trainers.map((trainer: Trainer) => {
      const trainerWorkouts = workouts.filter((w: Workout) => w.trainerId === (trainer._id || trainer.id));
      const completedWorkouts = trainerWorkouts.filter((w: Workout) => w.status === 'completed');
      const revenue = completedWorkouts.reduce((sum: number, w: Workout) => sum + (w.price || 0), 0);

      return {
        ...trainer,
        totalWorkouts: trainerWorkouts.length,
        completedWorkouts: completedWorkouts.length,
        revenue,
        averageRating: trainer.rating || 0,
        completionRate: trainerWorkouts.length > 0 ? (completedWorkouts.length / trainerWorkouts.length) * 100 : 0
      };
    });

    // Сортировка по доходам
    const topByRevenue = [...trainerStats]
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, limit);

    // Сортировка по рейтингу
    const topByRating = [...trainerStats]
      .sort((a, b) => b.averageRating - a.averageRating)
      .slice(0, limit);

    // Сортировка по количеству тренировок
    const topByWorkouts = [...trainerStats]
      .sort((a, b) => b.completedWorkouts - a.completedWorkouts)
      .slice(0, limit);

    return {
      topByRevenue,
      topByRating,
      topByWorkouts,
      isLoading: false
    };
  }, [trainers, workouts, limit, isLoading]);
}

// Экспорт основного хука для обратной совместимости
export function useTrainerData() {
  return useTrainerDataQuery();
}

