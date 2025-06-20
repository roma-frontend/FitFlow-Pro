// hooks/useTrainerSchedule.ts
"use client";

import { useSchedule } from '@/contexts/ScheduleContext';
import { useMemo } from 'react';

export function useTrainerSchedule(trainerId?: string) {
  const { 
    events, 
    getEventsByTrainer, 
    createEvent, 
    updateEvent, 
    deleteEvent, 
    updateEventStatus,
    loading,
    error
  } = useSchedule();

  // Если передан trainerId, фильтруем события для конкретного тренера
  const trainerEvents = useMemo(() => {
    if (!trainerId) return events;
    return getEventsByTrainer(trainerId);
  }, [events, trainerId, getEventsByTrainer]);

  // Статистика для тренера
  const trainerStats = useMemo(() => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay() + 1);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const todayEvents = trainerEvents.filter(e => {
      const eventDate = new Date(e.startTime);
      return eventDate >= startOfToday && eventDate < new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000);
    });

    const weekEvents = trainerEvents.filter(e => new Date(e.startTime) >= startOfWeek);
    const monthEvents = trainerEvents.filter(e => new Date(e.startTime) >= startOfMonth);
    
    const completedEvents = trainerEvents.filter(e => e.status === 'completed');
    const cancelledEvents = trainerEvents.filter(e => e.status === 'cancelled');

    return {
      total: trainerEvents.length,
      today: todayEvents.length,
      thisWeek: weekEvents.length,
      thisMonth: monthEvents.length,
      completed: completedEvents.length,
      cancelled: cancelledEvents.length,
      completionRate: trainerEvents.length > 0 ? (completedEvents.length / trainerEvents.length) * 100 : 0,
      cancellationRate: trainerEvents.length > 0 ? (cancelledEvents.length / trainerEvents.length) * 100 : 0
    };
  }, [trainerEvents]);

  return {
    events: trainerEvents,
    stats: trainerStats,
    createEvent,
    updateEvent,
    deleteEvent,
    updateEventStatus,
    loading,
    error
  };
}
