// contexts/TrainerContext.tsx (обновленная версия)
"use client";

import React, { createContext, useContext, ReactNode } from 'react';
import { useTrainerDataQuery } from '@/hooks/useTrainerDataQuery';
import type { Trainer, Member, Client, Workout, Message } from '@/types/trainer';

// Export the Client type
export type { Client } from '@/types/trainer';

export interface TrainerContextType {
  // Данные
  trainers: Trainer[];
  members: Member[];
  clients: Client[];
  workouts: Workout[];
  messages: Message[];
  
  // Статистика
  stats: any;
  messageStats: any;
  workoutStats: any;
  
  // Состояние
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
  
  // Методы для работы с тренировками
  addWorkout: (workout: Partial<Workout>) => Promise<boolean>;
  updateWorkout: (id: string, workout: Partial<Workout>) => Promise<boolean>;
  deleteWorkout: (id: string) => Promise<boolean>;
  completeWorkout: (id: string) => Promise<boolean>;
  cancelWorkout: (id: string) => Promise<boolean>;
  
  // Методы для работы с клиентами
  addClient: (client: Omit<Client, 'id'>) => Promise<boolean>;
  updateClient: (id: string, client: Partial<Client>) => Promise<boolean>;
  deleteClient: (id: string) => Promise<boolean>;
}

const TrainerContext = createContext<TrainerContextType | null>(null);

export function TrainerProvider({ children }: { children: ReactNode }) {
  const {
    trainers,
    members,
    clients,
    workouts,
    messages,
    stats,
    messageStats,
    workoutStats,
    isLoading,
    error,
    refetch
  } = useTrainerDataQuery();

  // Методы для работы с тренировками (заглушки, пока нет API)
  const addWorkout = async (workout: Partial<Workout>): Promise<boolean> => {
    try {
      // TODO: Реализовать API вызов
      console.log('Добавление тренировки:', workout);
      return true;
    } catch (error) {
      console.error('Ошибка добавления тренировки:', error);
      return false;
    }
  };

  const updateWorkout = async (id: string, workout: Partial<Workout>): Promise<boolean> => {
    try {
      // TODO: Реализовать API вызов
      console.log('Обновление тренировки:', id, workout);
      return true;
    } catch (error) {
      console.error('Ошибка обновления тренировки:', error);
      return false;
    }
  };

  const deleteWorkout = async (id: string): Promise<boolean> => {
    try {
      // TODO: Реализовать API вызов
      console.log('Удаление тренировки:', id);
      return true;
    } catch (error) {
      console.error('Ошибка удаления тренировки:', error);
      return false;
    }
  };

  const completeWorkout = async (id: string): Promise<boolean> => {
    try {
      return await updateWorkout(id, { status: 'completed' });
    } catch (error) {
      console.error('Ошибка завершения тренировки:', error);
      return false;
    }
  };

  const cancelWorkout = async (id: string): Promise<boolean> => {
    try {
      return await updateWorkout(id, { status: 'cancelled' });
    } catch (error) {
      console.error('Ошибка отмены тренировки:', error);
      return false;
    }
  };

  // Методы для работы с клиентами
  const addClient = async (client: Omit<Client, 'id'>): Promise<boolean> => {
    try {
      // TODO: Реализовать API вызов
      console.log('Добавление клиента:', client);
      return true;
    } catch (error) {
      console.error('Ошибка добавления клиента:', error);
      return false;
    }
  };

  const updateClient = async (id: string, client: Partial<Client>): Promise<boolean> => {
    try {
      // TODO: Реализовать API вызов
      console.log('Обновление клиента:', id, client);
      return true;
    } catch (error) {
      console.error('Ошибка обновления клиента:', error);
      return false;
    }
  };

  const deleteClient = async (id: string): Promise<boolean> => {
    try {
      // TODO: Реализовать API вызов
      console.log('Удаление клиента:', id);
      return true;
    } catch (error) {
      console.error('Ошибка удаления клиента:', error);
      return false;
    }
  };

  const value: TrainerContextType = {
    // Данные
    trainers,
    members,
    clients,
    workouts,
    messages,
    
    // Статистика
    stats,
    messageStats,
    workoutStats,
    
    // Состояние
    isLoading,
    error,
    refetch,
    
    // Методы для тренировок
    addWorkout,
    updateWorkout,
    deleteWorkout,
    completeWorkout,
    cancelWorkout,
    
    // Методы для клиентов
    addClient,
    updateClient,
    deleteClient
  };

  return (
    <TrainerContext.Provider value={value}>
      {children}
    </TrainerContext.Provider>
  );
}

export function useTrainer(): TrainerContextType {
  const context = useContext(TrainerContext);
  if (!context) {
    throw new Error('useTrainer должен использоваться внутри TrainerProvider');
  }
  return context;
}
