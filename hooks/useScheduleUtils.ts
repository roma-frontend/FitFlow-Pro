// hooks/useScheduleUtils.ts
import { useMemo } from "react";
import { ScheduleEvent } from "@/components/admin/schedule/types";

// Хук для фильтрации и сортировки событий
export function useScheduleFilters(events: ScheduleEvent[]) {
  const filterByStatus = (status: ScheduleEvent["status"]) => {
    return events.filter(event => event.status === status);
  };

  const filterByType = (type: ScheduleEvent["type"]) => {
    return events.filter(event => event.type === type);
  };

  const filterByTrainer = (trainerId: string) => {
    return events.filter(event => event.trainerId === trainerId);
  };

  const filterByDateRange = (startDate: Date, endDate: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.startTime);
      return eventDate >= startDate && eventDate <= endDate;
    });
  };

  const sortByDate = (ascending: boolean = true) => {
    return [...events].sort((a, b) => {
      const dateA = new Date(a.startTime).getTime();
      const dateB = new Date(b.startTime).getTime();
      return ascending ? dateA - dateB : dateB - dateA;
    });
  };

  const getUpcoming = (limit?: number) => {
    const now = new Date();
    const upcoming = events
      .filter(event => {
        const eventDate = new Date(event.startTime);
        return eventDate > now && event.status !== 'cancelled';
      })
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    
    return limit ? upcoming.slice(0, limit) : upcoming;
  };

  const getToday = () => {
    const today = new Date();
    const todayStr = today.toDateString();
    return events.filter(event => {
      const eventDate = new Date(event.startTime);
      return eventDate.toDateString() === todayStr;
    });
  };

  const getOverdue = () => {
    const now = new Date();
    return events.filter(event => {
      const eventEnd = new Date(event.endTime);
      return eventEnd < now && event.status === 'confirmed';
    });
  };

  return {
    filterByStatus,
    filterByType,
    filterByTrainer,
    filterByDateRange,
    sortByDate,
    getUpcoming,
    getToday,
    getOverdue,
  };
}

// Хук для валидации событий
export function useScheduleValidation() {
  const validateEventTime = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    
    if (end <= start) {
      return "Время окончания должно быть позже времени начала";
    }
    
    if (start < new Date()) {
      return "Нельзя создавать события в прошлом";
    }
    
    return null;
  };

  const validateEventConflict = (
    events: ScheduleEvent[],
    trainerId: string,
    startTime: string,
    endTime: string,
    excludeEventId?: string
  ) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    
    const conflicts = events.filter(event => {
      if (excludeEventId && event._id === excludeEventId) return false;
      if (event.trainerId !== trainerId) return false;
      if (event.status === 'cancelled') return false;
      
      const eventStart = new Date(event.startTime);
      const eventEnd = new Date(event.endTime);
      
      return (
        (start >= eventStart && start < eventEnd) ||
        (end > eventStart && end <= eventEnd) ||
        (start <= eventStart && end >= eventEnd)
      );
    });
    
    return conflicts.length > 0 ? conflicts : null;
  };

  return {
    validateEventTime,
    validateEventConflict,
  };
}

// Хук для статистики событий
export function useScheduleAnalytics(events: ScheduleEvent[]) {
  const analytics = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Базовые метрики
    const total = events.length;
    const todayEvents = events.filter(event => {
      const eventDate = new Date(event.startTime);
      return eventDate.toDateString() === today.toDateString();
    }).length;
    
    const upcoming = events.filter(event => {
      const eventDate = new Date(event.startTime);
      return eventDate > now && event.status !== 'cancelled';
    }).length;
    
    const completed = events.filter(event => event.status === 'completed').length;
    const cancelled = events.filter(event => event.status === 'cancelled').length;
    
    // Статистика по типам
    const byType = events.reduce((acc, event) => {
      acc[event.type] = (acc[event.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Статистика по статусам
    const byStatus = events.reduce((acc, event) => {
      acc[event.status] = (acc[event.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Статистика по тренерам
    const byTrainer = events.reduce((acc, event) => {
      const trainer = acc.find(t => t.trainerId === event.trainerId);
      if (trainer) {
        trainer.eventCount++;
      } else {
        acc.push({
          trainerId: event.trainerId,
          trainerName: event.trainerName,
          eventCount: 1,
        });
      }
      return acc;
    }, [] as Array<{ trainerId: string; trainerName: string; eventCount: number }>);
    
    // Загруженность по часам
    const busyHours = Array.from({ length: 12 }, (_, i) => {
      const hour = i + 8; // 8:00 - 19:00
      const eventCount = events.filter(event => {
        const eventHour = new Date(event.startTime).getHours();
        return eventHour === hour;
      }).length;
      
      return { hour, eventCount };
    });
    
    // Средняя продолжительность
    const durations = events.map(event => {
      const start = new Date(event.startTime);
      const end = new Date(event.endTime);
      return (end.getTime() - start.getTime()) / (1000 * 60); // в минутах
    });
    
    const averageDuration = durations.length > 0
      ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
      : 0;
    
    return {
      total,
      todayEvents,
      upcoming,
      completed,
      cancelled,
      byType,
      byStatus,
      byTrainer,
      busyHours,
      averageDuration,
    };
  }, [events]);
  
  return analytics;
}
