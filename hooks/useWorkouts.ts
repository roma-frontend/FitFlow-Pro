// hooks/useWorkouts.ts (обновленная версия для API)
"use client";

import { useWorkoutsQuery, useTodayWorkoutsQuery, useWorkoutQuery, useWorkoutMutations } from './useWorkoutsAPI';
import type { Workout } from '@/types/trainer';

export function useWorkouts(params?: {
  page?: number;
  limit?: number;
  trainerId?: string;
  userId?: string;
  status?: string;
  type?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
}) {
  const { workouts, isLoading, error, refetch } = useWorkoutsQuery(params);
  const mutations = useWorkoutMutations();

  return {
    workouts,
    isLoading,
    error,
    refetch,
    ...mutations
  };
}

export function useWorkoutManagement() {
  const mutations = useWorkoutMutations();

  return {
    createWorkout: async (data: {
      trainerId: string;
      userId: string;
      type: "personal" | "group" | "cardio" | "strength" | "yoga" | "pilates" | "crossfit";
      duration?: number;
      price?: number;
      status?: "scheduled" | "in-progress" | "completed" | "cancelled" | "missed";
    }): Promise<boolean> => {
      try {
        await mutations.createWorkout(data);
        return true;
      } catch (error) {
        console.error('Create workout error:', error);
        return false;
      }
    },

    updateWorkout: async (id: string, data: Partial<Workout>): Promise<boolean> => {
      try {
        await mutations.updateWorkout(id, data);
        return true;
      } catch (error) {
        console.error('Update workout error:', error);
        return false;
      }
    },

    completeWorkout: async (id: string, actualDuration?: number): Promise<boolean> => {
      try {
        await mutations.markCompleted(id, actualDuration);
        return true;
      } catch (error) {
        console.error('Complete workout error:', error);
        return false;
      }
    },

    cancelWorkout: async (id: string, reason?: string): Promise<boolean> => {
      try {
        await mutations.cancelWorkout(id, reason);
        return true;
      } catch (error) {
        console.error('Cancel workout error:', error);
        return false;
      }
    },

    deleteWorkout: async (id: string): Promise<boolean> => {
      try {
        await mutations.removeWorkout(id);
        return true;
      } catch (error) {
        console.error('Delete workout error:', error);
        return false;
      }
    }
  };
}

// Специализированные хуки
export function useTrainerWorkouts(trainerId: string, limit?: number) {
  return useWorkoutsQuery({ trainerId, limit });
}

export function useUserWorkouts(userId: string, limit?: number) {
  return useWorkoutsQuery({ userId, limit });
}

export function useTodayWorkouts(trainerId?: string) {
  return useTodayWorkoutsQuery(trainerId);
}

export function useWorkoutById(workoutId: string) {
  return useWorkoutQuery(workoutId);
}
