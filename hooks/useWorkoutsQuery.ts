// hooks/useWorkoutsQuery.ts (полностью исправленная версия)
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useMemo } from "react";
import type { Workout } from "@/types/trainer";
import type { Id } from "@/convex/_generated/dataModel";

interface WorkoutsQueryParams {
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

// Хук для получения списка тренировок
export function useWorkoutsQuery(params?: WorkoutsQueryParams) {
  // Используем только useQuery из Convex
  const allWorkouts = useQuery(api.workouts.getAll, { 
    limit: params?.limit || 100 
  });

  // Фильтруем данные на клиенте
  const filteredWorkouts = useMemo(() => {
    if (!allWorkouts) return [];

    let filtered = [...allWorkouts];

    if (!params) return filtered;

    // Фильтрация по тренеру
    if (params.trainerId) {
      filtered = filtered.filter(w => w.trainerId === params.trainerId);
    }

    // Фильтрация по пользователю
    if (params.userId) {
      filtered = filtered.filter(w => w.userId === params.userId);
    }

    // Фильтрация по статусу
    if (params.status) {
      filtered = filtered.filter(w => w.status === params.status);
    }

    // Фильтрация по типу
    if (params.type) {
      filtered = filtered.filter(w => w.type === params.type);
    }

    // Поиск
    if (params.search) {
      const searchLower = params.search.toLowerCase();
      filtered = filtered.filter(w => 
        w.type?.toLowerCase().includes(searchLower)
      );
    }

    // Фильтрация по датам
    if (params.startDate) {
      const startTimestamp = new Date(params.startDate).getTime();
      filtered = filtered.filter(w => w._creationTime >= startTimestamp);
    }

    if (params.endDate) {
      const endTimestamp = new Date(params.endDate + "T23:59:59.999Z").getTime();
      filtered = filtered.filter(w => w._creationTime <= endTimestamp);
    }

    return filtered;
  }, [allWorkouts, params]);

  return {
    workouts: filteredWorkouts as Workout[],
    isLoading: allWorkouts === undefined,
    error: null,
    refetch: () => {
      // Convex автоматически обновляет данные
    }
  };
}

// Хук для получения тренировок тренера
export function useTrainerWorkoutsQuery(trainerId: string, limit?: number) {
  const workouts = useQuery(api.workouts.getByTrainer, { 
    trainerId: trainerId as Id<"trainers">, 
    limit: limit || 100
  });
  
  return {
    workouts: (workouts || []) as Workout[],
    isLoading: workouts === undefined,
    error: null
  };
}

// Хук для получения тренировок пользователя
export function useUserWorkoutsQuery(userId: string, limit?: number) {
  const workouts = useQuery(api.workouts.getByUser, { 
    userId: userId as Id<"users">, 
    limit: limit || 100
  });
  
  return {
    workouts: (workouts || []) as Workout[],
    isLoading: workouts === undefined,
    error: null
  };
}

// Хук для получения одной тренировки
export function useWorkoutQuery(workoutId: string) {
  const workout = useQuery(api.workouts.getById, { 
    workoutId: workoutId as Id<"workouts"> 
  });
  
  return {
    workout: workout as Workout | null,
    isLoading: workout === undefined,
    error: null
  };
}

// Хук для получения сегодняшних тренировок
export function useTodayWorkoutsQuery(trainerId?: string) {
  const workouts = useQuery(api.workouts.getTodayWorkouts, 
    trainerId ? { trainerId: trainerId as Id<"trainers"> } : {}
  );
  
  const stats = useMemo(() => {
    const typedWorkouts = (workouts || []) as Workout[];
    return {
      total: typedWorkouts.length,
      completed: typedWorkouts.filter(w => w.status === 'completed').length,
      scheduled: typedWorkouts.filter(w => w.status === 'scheduled').length,
      inProgress: typedWorkouts.filter(w => w.status === 'in-progress').length,
      cancelled: typedWorkouts.filter(w => w.status === 'cancelled').length
    };
  }, [workouts]);
  
  return {
    workouts: (workouts || []) as Workout[],
    isLoading: workouts === undefined,
    error: null,
    ...stats
  };
}

// Хуки для мутаций
export function useWorkoutMutations() {
  const createWorkout = useMutation(api.workouts.create);
  const updateWorkout = useMutation(api.workouts.update);
  const markCompleted = useMutation(api.workouts.markCompleted);
  const cancelWorkout = useMutation(api.workouts.cancel);
  const startWorkout = useMutation(api.workouts.startWorkout);
  const removeWorkout = useMutation(api.workouts.remove);

  return {
    createWorkout: async (data: {
      trainerId: string;
      userId: string;
      type: string;
      duration?: number;
      price?: number;
      status?: string;
    }) => {
      try {
        const result = await createWorkout({
          trainerId: data.trainerId as Id<"trainers">,
          userId: data.userId as Id<"users">,
          type: data.type,
          duration: data.duration,
          price: data.price,
          status: data.status
        });
        return result;
      } catch (error) {
        console.error('Ошибка создания тренировки:', error);
        throw error;
      }
    },

    updateWorkout: async (workoutId: string, updates: Partial<Workout>) => {
      try {
        const allowedFields = ['type', 'duration', 'price', 'status'];
        const cleanUpdates: any = {};
        
        Object.entries(updates).forEach(([key, value]) => {
          if (allowedFields.includes(key) && value !== undefined) {
            cleanUpdates[key] = value;
          }
        });

        const result = await updateWorkout({
          workoutId: workoutId as Id<"workouts">,
          ...cleanUpdates
        });
        return result;
      } catch (error) {
        console.error('Ошибка обновления тренировки:', error);
        throw error;
      }
    },

    markCompleted: async (workoutId: string, actualDuration?: number) => {
      try {
        const result = await markCompleted({
          workoutId: workoutId as Id<"workouts">,
          actualDuration
        });
        return result;
      } catch (error) {
        console.error('Ошибка завершения тренировки:', error);
        throw error;
      }
    },

    cancelWorkout: async (workoutId: string, reason?: string) => {
      try {
        const result = await cancelWorkout({
          workoutId: workoutId as Id<"workouts">,
          reason
        });
        return result;
      } catch (error) {
        console.error('Ошибка отмены тренировки:', error);
        throw error;
      }
    },

    startWorkout: async (workoutId: string) => {
      try {
        const result = await startWorkout({
          workoutId: workoutId as Id<"workouts">
        });
        return result;
      } catch (error) {
        console.error('Ошибка начала тренировки:', error);
        throw error;
      }
    },

    removeWorkout: async (workoutId: string) => {
      try {
        const result = await removeWorkout({
          workoutId: workoutId as Id<"workouts">
        });
        return result;
      } catch (error) {
        console.error('Ошибка удаления тренировки:', error);
        throw error;
      }
    }
  };
}
