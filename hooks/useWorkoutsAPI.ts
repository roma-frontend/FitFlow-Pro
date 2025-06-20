// hooks/useWorkoutsAPI.ts (исправленная версия)
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import type { Workout } from '@/types/trainer';

export interface WorkoutsQueryParams {
  page?: number;
  limit?: number;
  trainerId?: string;
  userId?: string;
  status?: string;
  type?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
}

export function useWorkoutsQuery(params: WorkoutsQueryParams = {}) {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { token } = useAuth();

  const fetchWorkouts = useCallback(async () => {
    if (!token) return;

    setIsLoading(true);
    setError(null);

    try {
      const searchParams = new URLSearchParams();
      
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, value.toString());
        }
      });

      const response = await fetch(`/api/workouts?${searchParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        setWorkouts(result.data || []);
      } else {
        throw new Error(result.error || 'Ошибка загрузки тренировок');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка';
      setError(errorMessage);
      console.error('Ошибка загрузки тренировок:', err);
    } finally {
      setIsLoading(false);
    }
  }, [token, JSON.stringify(params)]); // Используем JSON.stringify для зависимости

  useEffect(() => {
    fetchWorkouts();
  }, [fetchWorkouts]);

  return {
    workouts,
    isLoading,
    error,
    refetch: fetchWorkouts
  };
}

// Хук для сегодняшних тренировок
export function useTodayWorkoutsQuery(trainerId?: string) {
  const today = new Date().toISOString().split('T')[0];
  
  const { workouts, isLoading, error, refetch } = useWorkoutsQuery({
    startDate: today,
    endDate: today,
    trainerId,
    limit: 100
  });

  const stats = React.useMemo(() => {
    const total = workouts.length;
    const completed = workouts.filter(w => w.status === 'completed').length;
    const scheduled = workouts.filter(w => w.status === 'scheduled').length;
    const cancelled = workouts.filter(w => w.status === 'cancelled').length;
    const inProgress = workouts.filter(w => w.status === 'in-progress').length;

    return {
      total,
      completed,
      scheduled,
      cancelled,
      inProgress
    };
  }, [workouts]);

  return {
    workouts,
    total: workouts.length,
    stats,
    isLoading,
    error,
    refetch
  };
}

// Хук для одной тренировки
export function useWorkoutQuery(workoutId: string) {
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { token } = useAuth();

  const fetchWorkout = useCallback(async () => {
    if (!token || !workoutId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/workouts/${workoutId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        setWorkout(result.data);
      } else {
        throw new Error(result.error || 'Ошибка загрузки тренировки');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка';
      setError(errorMessage);
      console.error('Ошибка загрузки тренировки:', err);
    } finally {
      setIsLoading(false);
    }
  }, [token, workoutId]);

  useEffect(() => {
    fetchWorkout();
  }, [fetchWorkout]);

  return {
    workout,
    isLoading,
    error,
    refetch: fetchWorkout
  };
}

// Интерфейс для создания тренировки
export interface CreateWorkoutData {
  trainerId: string;
  userId: string;
  type: "personal" | "group" | "cardio" | "strength" | "yoga" | "pilates" | "crossfit";
  duration?: number;
  price?: number;
  status?: "scheduled" | "in-progress" | "completed" | "cancelled" | "missed";
  date?: string;
  time?: string;
  location?: string;
  notes?: string;
  clientName?: string;
}

// Хук для мутаций тренировок
export function useWorkoutMutations() {
  const { token } = useAuth();

  const createWorkout = useCallback(async (data: CreateWorkoutData) => {
    if (!token) throw new Error('Не авторизован');

    const response = await fetch('/api/workouts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || `HTTP error! status: ${response.status}`);
    }

    if (!result.success) {
      throw new Error(result.error || 'Ошибка создания тренировки');
    }

    return result.data;
  }, [token]);

  const updateWorkout = useCallback(async (workoutId: string, data: Partial<Workout>) => {
    if (!token) throw new Error('Не авторизован');

    const response = await fetch(`/api/workouts/${workoutId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || `HTTP error! status: ${response.status}`);
    }

    if (!result.success) {
      throw new Error(result.error || 'Ошибка обновления тренировки');
    }

    return result.data;
  }, [token]);

  const deleteWorkout = useCallback(async (workoutId: string) => {
    if (!token) throw new Error('Не авторизован');

    const response = await fetch(`/api/workouts/${workoutId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || `HTTP error! status: ${response.status}`);
    }

    if (!result.success) {
      throw new Error(result.error || 'Ошибка удаления тренировки');
    }

    return result.data;
  }, [token]);

  const markCompleted = useCallback(async (workoutId: string, actualDuration?: number) => {
    return updateWorkout(workoutId, {
      status: 'completed',
      ...(actualDuration && { duration: actualDuration })
    });
  }, [updateWorkout]);

  const cancelWorkout = useCallback(async (workoutId: string, reason?: string) => {
    return updateWorkout(workoutId, {
      status: 'cancelled',
      ...(reason && { cancellationReason: reason })
    });
  }, [updateWorkout]);

  return {
    createWorkout,
    updateWorkout,
    deleteWorkout,
    markCompleted,
    cancelWorkout,
    removeWorkout: deleteWorkout // Алиас для совместимости
  };
}

// Хук для статистики тренировок
export function useWorkoutStats(trainerId?: string) {
  const { workouts, isLoading, error } = useWorkoutsQuery({ trainerId });

  const stats = React.useMemo(() => {
    if (isLoading || !workouts.length) {
      return {
        total: 0,
        completed: 0,
        scheduled: 0,
        cancelled: 0,
        inProgress: 0,
        today: 0,
        thisWeek: 0,
        thisMonth: 0,
        byType: {},
        byStatus: {},
        averageDuration: 0
      };
    }

    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const total = workouts.length;
    const completed = workouts.filter(w => w.status === 'completed').length;
    const scheduled = workouts.filter(w => w.status === 'scheduled').length;
    const cancelled = workouts.filter(w => w.status === 'cancelled').length;
    const inProgress = workouts.filter(w => w.status === 'in-progress').length;

    const todayWorkouts = workouts.filter(w => {
      const workoutDate = w.date || (w._creationTime ? new Date(w._creationTime).toISOString().split('T')[0] : '');
      return workoutDate === today;
    }).length;

    const thisWeekWorkouts = workouts.filter(w => {
      const workoutDate = new Date(w.date || w._creationTime || 0);
      return workoutDate >= weekStart;
    }).length;

    const thisMonthWorkouts = workouts.filter(w => {
      const workoutDate = new Date(w.date || w._creationTime || 0);
      return workoutDate >= monthStart;
    }).length;

    // Группировка по типам
    const byType = workouts.reduce((acc, workout) => {
      const type = workout.type || 'unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Группировка по статусам
    const byStatus = workouts.reduce((acc, workout) => {
      const status = workout.status || 'unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Средняя длительность
    const durationsSum = workouts
      .filter(w => w.duration && w.duration > 0)
      .reduce((sum, w) => sum + (w.duration || 0), 0);
    const durationsCount = workouts.filter(w => w.duration && w.duration > 0).length;
    const averageDuration = durationsCount > 0 ? Math.round(durationsSum / durationsCount) : 60;

    return {
      total,
      completed,
      scheduled,
      cancelled,
      inProgress,
      today: todayWorkouts,
      thisWeek: thisWeekWorkouts,
      thisMonth: thisMonthWorkouts,
      byType,
      byStatus,
      averageDuration
    };
  }, [workouts, isLoading]);

  return {
    stats,
    isLoading,
    error
  };
}

// Хук для календаря тренировок
export function useWorkoutCalendar(trainerId?: string, month?: Date) {
  const currentMonth = month || new Date();
  const startDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const endDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

  const { workouts, isLoading, error } = useWorkoutsQuery({
    trainerId,
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0]
  });

  const workoutsByDate = React.useMemo(() => {
    return workouts.reduce((acc, workout) => {
      const date = workout.date || (workout._creationTime ? new Date(workout._creationTime).toISOString().split('T')[0] : '');
      if (date) {
        if (!acc[date]) acc[date] = [];
        acc[date].push(workout);
      }
      return acc;
    }, {} as Record<string, Workout[]>);
  }, [workouts]);

  return {
    workouts,
    workoutsByDate,
    isLoading,
    error
  };
}
