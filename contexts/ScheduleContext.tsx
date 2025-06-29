"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  ScheduleEvent,
  TrainerSchedule,
  CreateEventData,
} from "@/components/admin/schedule/types";
import { ensureDebugSystem } from "@/utils/cleanTypes";

interface ScheduleContextType {
  events: ScheduleEvent[];
  trainers: TrainerSchedule[];
  loading: boolean;
  error: string | null;

  createEvent: (data: CreateEventData) => Promise<void>;
  updateEvent: (eventId: string, data: Partial<ScheduleEvent>) => Promise<void>;
  deleteEvent: (eventId: string) => Promise<void>;
  updateEventStatus: (
    eventId: string,
    status: ScheduleEvent["status"]
  ) => Promise<void>;

  getEventsByTrainer: (trainerId: string) => ScheduleEvent[];
  getEventsInDateRange: (start: Date, end: Date) => ScheduleEvent[];
  searchEvents: (query: string) => ScheduleEvent[];

  refreshData: () => Promise<void>;
  subscribeToUpdates: (
    callback: (events: ScheduleEvent[]) => void
  ) => () => void;
}

const ScheduleContext = createContext<ScheduleContextType | undefined>(
  undefined
);

export function ScheduleProvider({ children }: { children: React.ReactNode }) {
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [trainers, setTrainers] = useState<TrainerSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscribers, setSubscribers] = useState<
    ((events: ScheduleEvent[]) => void)[]
  >([]);

  const notifySubscribers = (updatedEvents: ScheduleEvent[]) => {
    subscribers.forEach((callback) => callback(updatedEvents));
  };

  const updateTrainerEvents = (updatedEvents: ScheduleEvent[]) => {
    const updatedTrainers = trainers.map((trainer) => ({
      ...trainer,
      events: updatedEvents.filter(
        (event) => event.trainerId === trainer.trainerId
      ),
    }));
    setTrainers(updatedTrainers);
  };

  const createEvent = async (data: CreateEventData): Promise<void> => {
    try {
      const response = await fetch("/api/schedule/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const newEvent = await response.json();
      const updatedEvents = [...events, newEvent];
      setEvents(updatedEvents);
      updateTrainerEvents(updatedEvents);
      notifySubscribers(updatedEvents);
    } catch (err) {
      console.error("Error creating event:", err);
      throw err;
    }
  };

  const updateEvent = async (
    eventId: string,
    data: Partial<ScheduleEvent>
  ): Promise<void> => {
    try {
      const response = await fetch(`/api/schedule/events/${eventId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const updatedEvent = await response.json();
      const updatedEvents = events.map((event) =>
        event._id === eventId ? { ...event, ...updatedEvent } : event
      );

      setEvents(updatedEvents);
      updateTrainerEvents(updatedEvents);
      notifySubscribers(updatedEvents);
    } catch (err) {
      console.error("Error updating event:", err);
      throw err;
    }
  };

  const deleteEvent = async (eventId: string): Promise<void> => {
    try {
      const response = await fetch(`/api/schedule/events/${eventId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const updatedEvents = events.filter((event) => event._id !== eventId);
      setEvents(updatedEvents);
      updateTrainerEvents(updatedEvents);
      notifySubscribers(updatedEvents);
    } catch (err) {
      console.error("Error deleting event:", err);
      throw err;
    }
  };

  const updateEventStatus = async (
    eventId: string,
    status: ScheduleEvent["status"]
  ): Promise<void> => {
    await updateEvent(eventId, { status });
  };

  const getEventsByTrainer = (trainerId: string): ScheduleEvent[] => {
    return events.filter((event) => event.trainerId === trainerId);
  };

  const getEventsInDateRange = (start: Date, end: Date): ScheduleEvent[] => {
    return events.filter((event) => {
      const eventStart = new Date(event.startTime);
      return eventStart >= start && eventStart <= end;
    });
  };

  const searchEvents = (query: string): ScheduleEvent[] => {
    const lowercaseQuery = query.toLowerCase();
    return events.filter(
      (event) =>
        event.title.toLowerCase().includes(lowercaseQuery) ||
        event.trainerName?.toLowerCase().includes(lowercaseQuery) ||
        event.clientName?.toLowerCase().includes(lowercaseQuery) ||
        event.description?.toLowerCase().includes(lowercaseQuery)
    );
  };

  const refreshData = async (): Promise<void> => {
    await loadData();
  };

  const subscribeToUpdates = (
    callback: (events: ScheduleEvent[]) => void
  ): (() => void) => {
    setSubscribers((prev) => [...prev, callback]);
    return () =>
      setSubscribers((prev) => prev.filter((sub) => sub !== callback));
  };

  const loadData = async () => {
  setLoading(true);
  setError(null);
  
  try {
    console.log('🔄 Загрузка данных расписания...');
    
    const [eventsResponse, trainersResponse] = await Promise.all([
      fetch('/api/schedule/events'),
      fetch('/api/schedule/trainers')
    ]);

    // Проверка HTTP статусов
    if (!eventsResponse.ok) throw new Error(`HTTP ${eventsResponse.status} для событий`);
    if (!trainersResponse.ok) throw new Error(`HTTP ${trainersResponse.status} для тренеров`);

    // Парсинг JSON
    const eventsData = await eventsResponse.json();
    const trainersData = await trainersResponse.json();

    console.log('📊 Полученные данные:', { eventsData, trainersData });

    // Валидация и нормализация данных
    const validatedEvents = validateEventsData(eventsData);
    const validatedTrainers = validateTrainers(trainersData);

    // Связываем события с тренерами
    const trainersWithEvents = validatedTrainers.map(trainer => ({
      ...trainer,
      events: validatedEvents.filter(event => event.trainerId === trainer.trainerId)
    }));

    setEvents(validatedEvents);
    setTrainers(trainersWithEvents);
    notifySubscribers(validatedEvents);
    
    console.log('✅ Данные успешно загружены');
  } catch (err) {
    console.error('❌ Ошибка загрузки данных:', err);
    setError(`Ошибка загрузки: ${err instanceof Error ? err.message : 'Неизвестная ошибка'}`);
    
    // Fallback на пустые данные
    setEvents([]);
    setTrainers([]);
  } finally {
    setLoading(false);
  }
};

// Улучшенная валидация тренеров
function validateTrainers(data: any): TrainerSchedule[] {
  try {
    // Проверяем различные форматы ответа
    const rawData = data.data || data.items || data.trainers || [];
    
    if (!Array.isArray(rawData)) {
      throw new Error('Данные тренеров должны быть массивом');
    }

    return rawData.map((item: any) => {
      // Поддерживаем разные форматы идентификатора
      const trainerId = String(
        item.trainerId || 
        item.id || 
        item._id || 
        `temp_${Math.random().toString(36).substr(2, 9)}`
      );

      // Нормализация имени и роли
      const trainerName = String(
        item.trainerName || 
        item.name || 
        item.fullName || 
        'Неизвестный тренер'
      );

      const trainerRole = String(
        item.trainerRole || 
        item.role || 
        item.position || 
        'Тренер'
      );

      // Нормализация рабочего времени
      const workingHours = item.workingHours || item.schedule || {};
      const days = Array.isArray(workingHours.days) 
        ? workingHours.days.map(Number).filter((d: number) => d >= 0 && d <= 6)
        : [1, 2, 3, 4, 5]; // По умолчанию пн-пт

      return {
        trainerId,
        trainerName,
        trainerRole,
        events: [], // События будут добавлены позже
        workingHours: {
          start: String(workingHours.start || '09:00'),
          end: String(workingHours.end || '18:00'),
          days
        }
      };
    });
  } catch (error) {
    console.error('Ошибка валидации тренеров:', error);
    throw new Error('Неверный формат данных тренеров');
  }
}

  // Валидация данных событий
  function validateEventsData(data: any): ScheduleEvent[] {
    if (!data?.success || !Array.isArray(data.data)) {
      throw new Error("Неверный формат данных событий");
    }

    return data.data.map((event: any) => ({
      _id: String(event._id || event.id || `event_${Date.now()}`),
      title: String(event.title || "Без названия"),
      description: event.description ? String(event.description) : undefined,
      type: ["training", "consultation", "group", "maintenance"].includes(
        event.type
      )
        ? (event.type as ScheduleEvent["type"])
        : "training",
      startTime: new Date(event.startTime).toISOString(),
      endTime: new Date(event.endTime).toISOString(),
      trainerId: String(event.trainerId),
      trainerName: String(event.trainerName || "Неизвестный тренер"),
      clientId: event.clientId ? String(event.clientId) : undefined,
      clientName: event.clientName ? String(event.clientName) : undefined,
      status: ["scheduled", "confirmed", "completed", "cancelled"].includes(
        event.status
      )
        ? (event.status as ScheduleEvent["status"])
        : "scheduled",
      location: event.location ? String(event.location) : undefined,
      notes: event.notes ? String(event.notes) : undefined,
      recurring: event.recurring
        ? {
            type: ["daily", "weekly", "monthly"].includes(event.recurring.type)
              ? event.recurring.type
              : "weekly",
            interval: Number(event.recurring.interval) || 1,
            endDate: event.recurring.endDate
              ? new Date(event.recurring.endDate).toISOString()
              : undefined,
          }
        : undefined,
      createdAt: new Date(event.createdAt || Date.now()).toISOString(),
      updatedAt: event.updatedAt
        ? new Date(event.updatedAt).toISOString()
        : undefined,
      createdBy: String(event.createdBy || "system"),
    }));
  }

  // Валидация данных тренеров
  function validateTrainersData(data: any): TrainerSchedule[] {
    if (!data?.success || !Array.isArray(data.data)) {
      throw new Error("Неверный формат данных тренеров");
    }

    return data.data.map((trainer: any) => ({
      trainerId: String(
        trainer.trainerId ||
          trainer.id ||
          trainer._id ||
          `trainer_${Date.now()}`
      ),
      trainerName: String(
        trainer.trainerName || trainer.name || "Неизвестный тренер"
      ),
      trainerRole: String(trainer.trainerRole || trainer.role || "Тренер"),
      events: [], // События будут добавлены позже
      workingHours: {
        start: String(trainer.workingHours?.start || "09:00"),
        end: String(trainer.workingHours?.end || "18:00"),
        days: Array.isArray(trainer.workingHours?.days)
          ? trainer.workingHours.days
              .map(Number)
              .filter((d: number) => d >= 0 && d <= 6)
          : [1, 2, 3, 4, 5], // По умолчанию пн-пт
      },
    }));
  }

  useEffect(() => {
    if (typeof window !== "undefined") {
      ensureDebugSystem();
      window.fitAccessDebug.schedule = {
        events,
        trainers,
        loading,
        error,
        createEvent,
        updateEvent,
        deleteEvent,
        updateEventStatus,
        getEventsByTrainer,
        getEventsInDateRange,
        searchEvents,
        refreshData,
        subscribeToUpdates,
        getStats: () => ({
          totalEvents: events.length,
          activeEvents: events.filter((e) => e.status !== "cancelled").length,
          trainersCount: trainers.length,
        }),
        clearAllEvents: () => {
          setEvents([]);
          setTrainers((prev) => prev.map((t) => ({ ...t, events: [] })));
          notifySubscribers([]);
        },
      };
    }
  }, [events, trainers, loading, error]);

  useEffect(() => {
    loadData();
  }, []);

  const value: ScheduleContextType = {
    events,
    trainers,
    loading,
    error,
    createEvent,
    updateEvent,
    deleteEvent,
    updateEventStatus,
    getEventsByTrainer,
    getEventsInDateRange,
    searchEvents,
    refreshData,
    subscribeToUpdates,
  };

  return (
    <ScheduleContext.Provider value={value}>
      {children}
    </ScheduleContext.Provider>
  );
}

export function useSchedule() {
  const context = useContext(ScheduleContext);
  if (context === undefined) {
    throw new Error("useSchedule must be used within a ScheduleProvider");
  }
  return context;
}

export function useScheduleStats() {
  const { events } = useSchedule();

  return React.useMemo(() => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay() + 1);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

    return {
      total: events.length,
      today: events.filter((e) => {
        const eventDate = new Date(e.startTime);
        return (
          eventDate >= startOfToday &&
          eventDate < new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000)
        );
      }).length,
      thisWeek: events.filter((e) => new Date(e.startTime) >= startOfWeek)
        .length,
      thisMonth: events.filter((e) => new Date(e.startTime) >= startOfMonth)
        .length,
      upcoming: events.filter(
        (e) => new Date(e.startTime) > now && e.status !== "cancelled"
      ).length,
      completed: events.filter((e) => e.status === "completed").length,
      cancelled: events.filter((e) => e.status === "cancelled").length,
      confirmed: events.filter((e) => e.status === "confirmed").length,
      scheduled: events.filter((e) => e.status === "scheduled").length,
    };
  }, [events]);
}

export function useTrainerSchedule(trainerId: string) {
  const { events, trainers, getEventsByTrainer } = useSchedule();

  const trainer = trainers.find((t) => t.trainerId === trainerId);
  const trainerEvents = getEventsByTrainer(trainerId);

  const upcomingEvents = trainerEvents
    .filter(
      (event) =>
        new Date(event.startTime) > new Date() && event.status !== "cancelled"
    )
    .sort(
      (a, b) =>
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );

  const todayEvents = trainerEvents.filter((event) => {
    const today = new Date();
    const eventDate = new Date(event.startTime);
    return eventDate.toDateString() === today.toDateString();
  });

  return {
    trainer,
    events: trainerEvents,
    upcomingEvents,
    todayEvents,
    isLoading: !trainer,
  };
}

export function useEventConflicts() {
  const { events } = useSchedule();

  const checkConflicts = React.useCallback(
    (newEvent: {
      trainerId: string;
      startTime: string;
      endTime: string;
      excludeEventId?: string;
    }) => {
      const newStart = new Date(newEvent.startTime);
      const newEnd = new Date(newEvent.endTime);

      return events.filter((event) => {
        if (newEvent.excludeEventId && event._id === newEvent.excludeEventId) {
          return false;
        }

        if (event.trainerId !== newEvent.trainerId) {
          return false;
        }

        if (event.status === "cancelled") {
          return false;
        }

        const eventStart = new Date(event.startTime);
        const eventEnd = new Date(event.endTime);

        return newStart < eventEnd && newEnd > eventStart;
      });
    },
    [events]
  );

  const isAvailable = React.useCallback(
    (
      trainerId: string,
      startTime: string,
      endTime: string,
      excludeEventId?: string
    ) => {
      const conflicts = checkConflicts({
        trainerId,
        startTime,
        endTime,
        excludeEventId,
      });
      return conflicts.length === 0;
    },
    [checkConflicts]
  );

  return {
    checkConflicts,
    isAvailable,
  };
}

export function useTrainerAvailability() {
  const { trainers, events } = useSchedule();

  const getAvailableTrainers = React.useCallback(
    (startTime: string, endTime: string, excludeEventId?: string) => {
      return trainers.filter((trainer) => {
        const conflicts = events.filter((event) => {
          if (excludeEventId && event._id === excludeEventId) {
            return false;
          }

          if (event.trainerId !== trainer.trainerId) {
            return false;
          }

          if (event.status === "cancelled") {
            return false;
          }

          const eventStart = new Date(event.startTime);
          const eventEnd = new Date(event.endTime);
          const newStart = new Date(startTime);
          const newEnd = new Date(endTime);

          return newStart < eventEnd && newEnd > eventStart;
        });

        return conflicts.length === 0;
      });
    },
    [trainers, events]
  );

  const getNextAvailableSlot = React.useCallback(
    (trainerId: string, duration: number = 60) => {
      const trainer = trainers.find((t) => t.trainerId === trainerId);
      if (!trainer) return null;

      const now = new Date();
      const searchStart = new Date(now);
      searchStart.setMinutes(0, 0, 0);
      searchStart.setHours(searchStart.getHours() + 1);

      // Ищем в течение следующих 7 дней
      for (let day = 0; day < 7; day++) {
        const currentDay = new Date(searchStart);
        currentDay.setDate(searchStart.getDate() + day);

        const dayOfWeek = currentDay.getDay();
        if (!trainer.workingHours.days.includes(dayOfWeek)) {
          continue;
        }

        const [startHour, startMinute] = trainer.workingHours.start
          .split(":")
          .map(Number);
        const [endHour, endMinute] = trainer.workingHours.end
          .split(":")
          .map(Number);

        const workStart = new Date(currentDay);
        workStart.setHours(startHour, startMinute, 0, 0);

        const workEnd = new Date(currentDay);
        workEnd.setHours(endHour, endMinute, 0, 0);

        for (
          let hour = workStart.getHours();
          hour < workEnd.getHours();
          hour++
        ) {
          const slotStart = new Date(currentDay);
          slotStart.setHours(hour, 0, 0, 0);

          const slotEnd = new Date(slotStart);
          slotEnd.setMinutes(slotEnd.getMinutes() + duration);

          if (slotEnd > workEnd) break;

          const conflicts = events.filter((event) => {
            if (event.trainerId !== trainerId || event.status === "cancelled") {
              return false;
            }

            const eventStart = new Date(event.startTime);
            const eventEnd = new Date(event.endTime);

            return slotStart < eventEnd && slotEnd > eventStart;
          });

          if (conflicts.length === 0) {
            return {
              startTime: slotStart.toISOString(),
              endTime: slotEnd.toISOString(),
            };
          }
        }
      }

      return null;
    },
    [trainers, events]
  );

  return {
    getAvailableTrainers,
    getNextAvailableSlot,
  };
}

export function useScheduleAnalytics() {
  const { events, trainers } = useSchedule();

  return React.useMemo(() => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay() + 1);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Статистика по тренерам
    const trainerStats = trainers.map((trainer) => {
      const trainerEvents = events.filter(
        (e) => e.trainerId === trainer.trainerId
      );
      const thisWeekEvents = trainerEvents.filter(
        (e) => new Date(e.startTime) >= startOfWeek
      );
      const thisMonthEvents = trainerEvents.filter(
        (e) => new Date(e.startTime) >= startOfMonth
      );
      const completedEvents = trainerEvents.filter(
        (e) => e.status === "completed"
      );
      const cancelledEvents = trainerEvents.filter(
        (e) => e.status === "cancelled"
      );

      return {
        trainerId: trainer.trainerId,
        trainerName: trainer.trainerName,
        totalEvents: trainerEvents.length,
        thisWeekEvents: thisWeekEvents.length,
        thisMonthEvents: thisMonthEvents.length,
        completedEvents: completedEvents.length,
        cancelledEvents: cancelledEvents.length,
        cancellationRate:
          trainerEvents.length > 0
            ? (cancelledEvents.length / trainerEvents.length) * 100
            : 0,
        utilizationRate: (thisWeekEvents.length / 40) * 100, // Предполагаем 40 часов в неделю
      };
    });

    // Статистика по времени
    const timeStats = {
      busyHours: {} as Record<number, number>,
      busyDays: {} as Record<number, number>,
    };

    events.forEach((event) => {
      if (event.status !== "cancelled") {
        const eventDate = new Date(event.startTime);
        const hour = eventDate.getHours();
        const day = eventDate.getDay();

        timeStats.busyHours[hour] = (timeStats.busyHours[hour] || 0) + 1;
        timeStats.busyDays[day] = (timeStats.busyDays[day] || 0) + 1;
      }
    });

    // Статистика по типам событий
    const eventTypeStats = events.reduce(
      (acc, event) => {
        if (event.status !== "cancelled") {
          acc[event.type] = (acc[event.type] || 0) + 1;
        }
        return acc;
      },
      {} as Record<string, number>
    );

    // Статистика загруженности по дням недели
    const weeklyUtilization = Array.from({ length: 7 }, (_, day) => {
      const dayEvents = events.filter((event) => {
        const eventDate = new Date(event.startTime);
        return eventDate.getDay() === day && event.status !== "cancelled";
      });

      return {
        day,
        dayName: ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"][day],
        events: dayEvents.length,
        hours: dayEvents.reduce((total, event) => {
          const start = new Date(event.startTime);
          const end = new Date(event.endTime);
          return total + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        }, 0),
      };
    });

    // Статистика по месяцам
    const monthlyStats = Array.from({ length: 12 }, (_, month) => {
      const monthEvents = events.filter((event) => {
        const eventDate = new Date(event.startTime);
        return eventDate.getMonth() === month && event.status !== "cancelled";
      });

      return {
        month,
        monthName: [
          "Янв",
          "Фев",
          "Мар",
          "Апр",
          "Май",
          "Июн",
          "Июл",
          "Авг",
          "Сен",
          "Окт",
          "Ноя",
          "Дек",
        ][month],
        events: monthEvents.length,
        revenue: monthEvents.length * 1500, // Примерная стоимость тренировки
      };
    });

    return {
      trainerStats,
      timeStats,
      eventTypeStats,
      weeklyUtilization,
      monthlyStats,
      summary: {
        totalEvents: events.length,
        activeEvents: events.filter((e) => e.status !== "cancelled").length,
        completionRate:
          events.length > 0
            ? (events.filter((e) => e.status === "completed").length /
                events.length) *
              100
            : 0,
        averageEventsPerTrainer:
          trainers.length > 0 ? events.length / trainers.length : 0,
        peakHour:
          Object.entries(timeStats.busyHours).sort(
            ([, a], [, b]) => b - a
          )[0]?.[0] || "10",
        peakDay:
          Object.entries(timeStats.busyDays).sort(
            ([, a], [, b]) => b - a
          )[0]?.[0] || "1",
      },
    };
  }, [events, trainers]);
}
