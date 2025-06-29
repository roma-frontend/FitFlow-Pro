// hooks/useTrainerManagement.ts (исправленная версия)
"use client";

import React from 'react';
import { useWorkoutManagement } from './useWorkouts';
import type { Workout, Trainer, Member } from '@/types/trainer';
import { useTrainerDataQuery } from './useTrainerDataQuery';

export function useTrainerManagement() {
  const workoutManagement = useWorkoutManagement();
  const { refetch } = useTrainerDataQuery();

  return {
    // Операции с тренировками
    ...workoutManagement,

    // Дополнительные операции управления
    refreshData: () => {
      refetch();
    },

    // Массовые операции
    bulkOperations: {
      updateMultipleWorkouts: async (
        workoutIds: string[], 
        updates: Partial<Workout>
      ): Promise<boolean> => {
        try {
          const results = await Promise.all(
            workoutIds.map((id: string) => workoutManagement.updateWorkout(id, updates))
          );
          return results.every((result: any) => result === true);
        } catch (error) {
          console.error('Bulk update error:', error);
          return false;
        }
      },

      cancelMultipleWorkouts: async (
        workoutIds: string[], 
        reason?: string
      ): Promise<boolean> => {
        try {
          const results = await Promise.all(
            workoutIds.map((id: string) => workoutManagement.cancelWorkout(id, reason))
          );
          return results.every((result: any) => result === true);
        } catch (error) {
          console.error('Bulk cancel error:', error);
          return false;
        }
      },

      completeMultipleWorkouts: async (workoutIds: string[]): Promise<boolean> => {
        try {
          const results = await Promise.all(
            workoutIds.map((id: string) => workoutManagement.completeWorkout(id))
          );
          return results.every((result: any) => result === true);
        } catch (error) {
          console.error('Bulk complete error:', error);
          return false;
        }
      }
    },

    // Утилиты
    utils: {
      validateWorkoutData: (data: any): boolean => {
        return !!(data.trainerId && data.userId && data.type);
      },

      formatWorkoutTime: (timestamp: number): string => {
        return new Date(timestamp).toLocaleString('ru-RU', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      },

      calculateDuration: (startTime: number, endTime: number): number => {
        return Math.round((endTime - startTime) / (1000 * 60)); // в минутах
      },

      getWorkoutStatus: (workout: Workout): string => {
        const now = Date.now();
        const workoutTime = workout._creationTime || new Date(workout.createdAt || 0).getTime();

        if (workout.status === 'completed') return 'Завершена';
        if (workout.status === 'cancelled') return 'Отменена';
        if (workout.status === 'in-progress') return 'В процессе';
        if (workout.status === 'missed') return 'Пропущена';
        if (workoutTime && workoutTime < now) return 'Просрочена';
        return 'Запланирована';
      },

      // Дополнительные утилиты
      getWorkoutTypeLabel: (type: string): string => {
        const typeLabels: Record<string, string> = {
          'personal': 'Персональная',
          'group': 'Групповая',
          'cardio': 'Кардио',
          'strength': 'Силовая',
          'yoga': 'Йога',
          'pilates': 'Пилатес',
          'crossfit': 'Кроссфит'
        };
        return typeLabels[type] || type;
      },

      getStatusColor: (status: string): string => {
        const statusColors: Record<string, string> = {
          'scheduled': 'blue',
          'in-progress': 'yellow',
          'completed': 'green',
          'cancelled': 'red',
          'missed': 'gray'
        };
        return statusColors[status] || 'gray';
      },

      formatPrice: (price: number): string => {
        return new Intl.NumberFormat('ru-RU', {
          style: 'currency',
          currency: 'RUB',
          minimumFractionDigits: 0
        }).format(price);
      },

      isWorkoutEditable: (workout: Workout): boolean => {
        return workout.status === 'scheduled' || workout.status === 'in-progress';
      },

      canCancelWorkout: (workout: Workout): boolean => {
        return workout.status === 'scheduled';
      },

      canCompleteWorkout: (workout: Workout): boolean => {
        return workout.status === 'scheduled' || workout.status === 'in-progress';
      }
    },

    // Статистика и аналитика
    analytics: {
      getWorkoutStats: (workouts: Workout[]) => {
        const total = workouts.length;
        const completed = workouts.filter((w: Workout) => w.status === 'completed').length;
        const cancelled = workouts.filter((w: Workout) => w.status === 'cancelled').length;
        const scheduled = workouts.filter((w: Workout) => w.status === 'scheduled').length;
        const inProgress = workouts.filter((w: Workout) => w.status === 'in-progress').length;

        return {
          total,
          completed,
          cancelled,
          scheduled,
          inProgress,
          completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
          cancellationRate: total > 0 ? Math.round((cancelled / total) * 100) : 0
        };
      },

      getRevenueStats: (workouts: Workout[]) => {
        const completedWorkouts = workouts.filter((w: Workout) => w.status === 'completed');
        const totalRevenue = completedWorkouts.reduce((sum: number, w: Workout) => sum + (w.price || 0), 0);
        const averagePrice = completedWorkouts.length > 0 
          ? totalRevenue / completedWorkouts.length 
          : 0;

        return {
          totalRevenue,
          averagePrice,
          completedSessions: completedWorkouts.length
        };
      },

      getPopularWorkoutTypes: (workouts: Workout[]) => {
        const typeCounts: Record<string, number> = {};
        workouts.forEach((w: Workout) => {
          const type = w.type || 'unknown';
          typeCounts[type] = (typeCounts[type] || 0) + 1;
        });

        return Object.entries(typeCounts)
          .sort(([, a], [, b]) => b - a)
          .map(([type, count]) => ({ type, count }));
      }
    }
  };
}
