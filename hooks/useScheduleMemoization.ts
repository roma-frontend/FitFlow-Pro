// hooks/useScheduleMemoization.ts
import { useMemo } from "react";
import { ScheduleEvent, TrainerSchedule } from "@/components/admin/schedule/types";

export function useScheduleMemoization(events: ScheduleEvent[], trainers: any[]) {
  // Мемоизируем преобразование тренеров
  const memoizedTrainers = useMemo((): TrainerSchedule[] => {
    return trainers.map((trainer) => ({
      trainerId: trainer.id || trainer.trainerId,
      trainerName: trainer.name || trainer.trainerName,
      trainerRole: trainer.role || trainer.trainerRole || "Тренер",
      events: events.filter((e) => e.trainerId === (trainer.id || trainer.trainerId)),
      workingHours: trainer.workingHours || {
        start: "09:00",
        end: "18:00",
        days: [1, 2, 3, 4, 5],
      },
    }));
  }, [events, trainers]);

  // Мемоизируем сортированные события
  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => 
      new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );
  }, [events]);

  // Мемоизируем события по дням
  const eventsByDay = useMemo(() => {
    const grouped: Record<string, ScheduleEvent[]> = {};
    
    events.forEach(event => {
      const dateKey = new Date(event.startTime).toDateString();
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(event);
    });

    // Сортируем события в каждом дне
    Object.keys(grouped).forEach(dateKey => {
      grouped[dateKey].sort((a, b) => 
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      );
    });

    return grouped;
  }, [events]);

  // Мемоизируем события по статусам
  const eventsByStatus = useMemo(() => {
    return {
      scheduled: events.filter(e => e.status === 'scheduled'),
      confirmed: events.filter(e => e.status === 'confirmed'),
      completed: events.filter(e => e.status === 'completed'),
      cancelled: events.filter(e => e.status === 'cancelled'),
      'no-show': events.filter(e => e.status === 'no-show'),
    };
  }, [events]);

  // Мемоизируем события по типам
  const eventsByType = useMemo(() => {
    return {
      training: events.filter(e => e.type === 'training'),
      consultation: events.filter(e => e.type === 'consultation'),
      group: events.filter(e => e.type === 'group'),
      meeting: events.filter(e => e.type === 'meeting'),
      break: events.filter(e => e.type === 'break'),
      other: events.filter(e => e.type === 'other'),
    };
  }, [events]);

  // Мемоизируем сегодняшние события
  const todayEvents = useMemo(() => {
    const today = new Date();
    const todayStr = today.toDateString();
    return events.filter(event => {
      const eventDate = new Date(event.startTime);
      return eventDate.toDateString() === todayStr;
    });
  }, [events]);

  // Мемоизируем предстоящие события
  const upcomingEvents = useMemo(() => {
    const now = new Date();
    return events
      .filter(event => {
        const eventDate = new Date(event.startTime);
        return eventDate > now && event.status !== 'cancelled';
      })
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
      .slice(0, 10); // Берем только ближайшие 10
  }, [events]);

  return {
    memoizedTrainers,
    sortedEvents,
    eventsByDay,
    eventsByStatus,
    eventsByType,
    todayEvents,
    upcomingEvents,
  };
}
