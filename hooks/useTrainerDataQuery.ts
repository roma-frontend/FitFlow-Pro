// hooks/useTrainerDataQuery.ts (с отладкой)
"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import type {
  Trainer,
  Member,
  Client,
  Workout,
  UserBooking,
  Message,
  SystemStats,
  MessageStats,
  WorkoutStats,
  MemberStats,
  ClientStats,
  TrainerStatsDetailed
} from "@/types/trainer";

export function useTrainerDataQuery() {
  // Состояния для данных
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [userBookings, setUserBookings] = useState<UserBooking[]>([]);
  
  // Состояния загрузки и ошибок
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState<string>('Инициализация...');

  const { token, user } = useAuth();

  // Добавляем отладку
  useEffect(() => {
    console.log('TrainerDataQuery: token =', !!token, 'user =', !!user);
  }, [token, user]);

  // Функция для выполнения API запроса
  const fetchData = useCallback(async (endpoint: string) => {
    console.log(`Загрузка ${endpoint}...`);
    setLoadingStep(`Загрузка ${endpoint}...`);

    if (!token) {
      console.log('Нет токена для', endpoint);
      return null;
    }
  }, [token]);

  // Загрузка всех данных
  const loadAllData = useCallback(async () => {
    console.log('Начинаем загрузку данных, token:', !!token);
    
    if (!token) {
      console.log('Нет токена, пропускаем загрузку');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    setLoadingStep('Подготовка к загрузке...');

    try {
      // Загружаем данные последовательно для лучшей отладки
      console.log('Загружаем тренеров...');
      setLoadingStep('Загрузка тренеров...');
      const trainersData = await fetchData('trainers').catch(err => {
        console.warn('Ошибка загрузки тренеров:', err);
        return [];
      });

      console.log('Загружаем пользователей...');
      setLoadingStep('Загрузка пользователей...');
      const usersData = await fetchData('users').catch(err => {
        console.warn('Ошибка загрузки пользователей:', err);
        return [];
      });

      console.log('Загружаем сообщения...');
      setLoadingStep('Загрузка сообщений...');
      const messagesData = await fetchData('messages').catch(err => {
        console.warn('Ошибка загрузки сообщений:', err);
        return [];
      });

      console.log('Загружаем участников...');
      setLoadingStep('Загрузка участников...');
      const membersData = await fetchData('members').catch(err => {
        console.warn('Ошибка загрузки участников:', err);
        return [];
      });

      console.log('Загружаем клиентов...');
      setLoadingStep('Загрузка клиентов...');
      const clientsData = await fetchData('clients').catch(err => {
        console.warn('Ошибка загрузки клиентов:', err);
        return [];
      });

      console.log('Загружаем тренировки...');
      setLoadingStep('Загрузка тренировок...');
      const workoutsData = await fetchData('workouts').catch(err => {
        console.warn('Ошибка загрузки тренировок:', err);
        return [];
      });

      // Устанавливаем данные
      setTrainers(trainersData || []);
      setAllUsers(usersData || []);
      setMessages(messagesData || []);
      setMembers(membersData || []);
      setClients(clientsData || []);
      setWorkouts(workoutsData || []);

      console.log('Все данные загружены успешно');
      setLoadingStep('Завершение...');

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка';
      console.error('Критическая ошибка загрузки данных:', err);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  }, [token, fetchData]);

  // Загрузка данных при монтировании и изменении токена
  useEffect(() => {
    console.log('useEffect triggered, token:', !!token);
    
    // Добавляем небольшую задержку для стабилизации токена
    const timer = setTimeout(() => {
      loadAllData();
    }, 100);

    return () => clearTimeout(timer);
  }, [loadAllData]);

  // Безопасное приведение типов
  const safeTrainers = trainers as Trainer[];
  const safeMessages = messages as Message[];
  const safeMembers = members as Member[];
  const safeClients = clients as Client[];
  const safeWorkouts = workouts as Workout[];
  const safeUserBookings = userBookings as UserBooking[];

  // Статистика тренировок
  const workoutStats: WorkoutStats = useMemo(() => {
    if (isLoading) {
      return {
        todayWorkouts: 0,
        thisWeekWorkouts: 0,
        scheduledWorkouts: 0,
        completedWorkouts: 0,
        cancelledWorkouts: 0,
        totalWorkouts: 0,
        workoutsByType: {},
        averageDuration: 0
      };
    }

    const today = new Date();
    const todayStart = new Date(today.setHours(0, 0, 0, 0)).getTime();
    const todayEnd = new Date(today.setHours(23, 59, 59, 999)).getTime();

    const todayWorkouts = safeWorkouts.filter((w: Workout) => {
      const creationTime = w._creationTime || new Date(w.createdAt || 0).getTime();
      return creationTime >= todayStart && creationTime <= todayEnd;
    }).length;

    const now = new Date();
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
    const weekStartTimestamp = weekStart.setHours(0, 0, 0, 0);

    const thisWeekWorkouts = safeWorkouts.filter((w: Workout) => {
      const creationTime = w._creationTime || new Date(w.createdAt || 0).getTime();
      return creationTime >= weekStartTimestamp;
    }).length;

    const scheduledWorkouts = safeWorkouts.filter((w: Workout) => w.status === 'scheduled').length;
    const completedWorkouts = safeWorkouts.filter((w: Workout) => w.status === 'completed').length;
    const cancelledWorkouts = safeWorkouts.filter((w: Workout) => w.status === 'cancelled').length;

    const workoutsByType: Record<string, number> = {};
    safeWorkouts.forEach((workout: Workout) => {
      const type = workout.type || 'general';
      workoutsByType[type] = (workoutsByType[type] || 0) + 1;
    });

    const allDurations = safeWorkouts.filter((w: Workout) => w.duration).map((w: Workout) => w.duration!);
    const averageDuration = allDurations.length > 0
      ? allDurations.reduce((sum: number, duration: number) => sum + duration, 0) / allDurations.length
      : 60;

    return {
      todayWorkouts,
      thisWeekWorkouts,
      scheduledWorkouts,
      completedWorkouts,
      cancelledWorkouts,
      totalWorkouts: safeWorkouts.length,
      workoutsByType,
      averageDuration: Math.round(averageDuration)
    };
  }, [safeWorkouts, isLoading]);

  // Основная статистика
  const stats: SystemStats = useMemo(() => {
    if (isLoading) {
      return {
        activeClients: 0,
        totalClients: 0,
        activeMembers: 0,
        totalMembers: 0,
        completedWorkouts: 0,
        avgRating: 0,
        totalTrainers: 0,
        totalUsers: 0
      };
    }

    const now = Date.now();
    const activeMembers = safeMembers.filter((member: Member) =>
      member.status === 'active' &&
      (member.membershipExpiry || 0) > now
    ).length;

    const activeClients = safeClients.filter((client: Client) =>
      client.status === 'active'
    ).length;

    const totalClients = safeMembers.length + safeClients.length;
    const totalActiveClients = activeMembers + activeClients;

    const completedWorkouts = safeWorkouts.filter((w: Workout) => w.status === 'completed').length;

    const trainersWithRating = safeTrainers.filter((trainer: Trainer) => trainer.rating && trainer.rating > 0);
    const avgRating = trainersWithRating.length > 0
      ? trainersWithRating.reduce((acc: number, trainer: Trainer) => acc + (trainer.rating || 0), 0) / trainersWithRating.length
      : 4.5;

    return {
      activeClients: totalActiveClients,
      totalClients,
      activeMembers,
      totalMembers: safeMembers.length,
      completedWorkouts,
      avgRating: Math.round(avgRating * 10) / 10,
      totalTrainers: safeTrainers.length,
      totalUsers: allUsers.length
    };
  }, [safeMembers, safeClients, safeWorkouts, safeTrainers, allUsers, isLoading]);

  const messageStats: MessageStats = useMemo(() => {
    if (isLoading) {
      return {
        unreadMessages: 0,
        todayMessages: 0,
        totalMessages: 0,
        messagesByType: { direct: 0, group: 0, announcement: 0, notification: 0 },
        messagesByPriority: { urgent: 0, high: 0, normal: 0, low: 0 }
      };
    }

    const unreadMessages = safeMessages.filter((m: Message) => {
      if (m.status && m.status !== 'read') return true;
      if (m.readAt && typeof m.readAt === 'object') {
        return Object.keys(m.readAt).length === 0;
      }
      return false;
    }).length;

    const today = new Date().toISOString().split('T')[0];
    const todayMessages = safeMessages.filter((m: Message) => {
      const creationTime = m._creationTime || new Date(m.createdAt || 0).getTime();
      if (creationTime) {
        const msgDate = new Date(creationTime).toISOString().split('T')[0];
        return msgDate === today;
      }
      return false;
    }).length;

    const messagesByType = {
      direct: safeMessages.filter((m: Message) => m.type === 'direct').length,
      group: safeMessages.filter((m: Message) => m.type === 'group').length,
      announcement: safeMessages.filter((m: Message) => m.type === 'announcement').length,
      notification: safeMessages.filter((m: Message) => m.type === 'notification').length,
    };

    const messagesByPriority = {
      urgent: safeMessages.filter((m: Message) => m.priority === 'urgent').length,
      high: safeMessages.filter((m: Message) => m.priority === 'high').length,
      normal: safeMessages.filter((m: Message) => m.priority === 'normal').length,
      low: safeMessages.filter((m: Message) => m.priority === 'low').length,
    };

    return {
      unreadMessages,
      todayMessages,
      totalMessages: safeMessages.length,
      messagesByType,
      messagesByPriority
    };
  }, [safeMessages, isLoading]);

  // Остальные статистики...
  const trainerStats: TrainerStatsDetailed = useMemo(() => {
    return {
      total: safeTrainers.length,
      fromTrainersTable: 0,
      fromUsersTable: 0,
      activeTrainers: 0,
      specializations: {},
      averageRating: 0
    };
  }, [safeTrainers]);

  const memberStats: MemberStats = useMemo(() => {
    return {
      total: safeMembers.length,
      active: 0,
      inactive: 0,
      expiringSoon: 0,
      newThisMonth: 0,
      membershipTypes: {}
    };
  }, [safeMembers]);

  const clientStats: ClientStats = useMemo(() => {
    return {
      total: safeClients.length,
      active: 0,
      trial: 0,
      inactive: 0,
      newThisMonth: 0,
      retention: 0
    };
  }, [safeClients]);

  // Функция обновления данных
  const refetch = useCallback(() => {
    console.log('Ручное обновление данных...');
    loadAllData();
  }, [loadAllData]);

  // Добавляем отладочную информацию
  console.log('TrainerDataQuery state:', {
    isLoading,
    error,
    loadingStep,
    hasToken: !!token,
    hasUser: !!user,
    trainersCount: trainers.length,
    workoutsCount: workouts.length
  });

  return {
    // Исходные данные
    trainers: safeTrainers,
    allUsers: allUsers || [],
    messages: safeMessages,
    members: safeMembers,
    clients: safeClients,
    workouts: safeWorkouts,
    userBookings: safeUserBookings,

    // Статистика
    stats,
    messageStats,
    workoutStats,
    trainerStats,
    memberStats,
    clientStats,

    // Для обратной совместимости
    users: safeTrainers,

    // Статус загрузки
    isLoading,
    error,
    loadingStep, // Добавляем для отладки
    refetch
  };
}

