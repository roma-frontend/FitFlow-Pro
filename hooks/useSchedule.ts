// hooks/useSchedule.ts (исправленная версия)

import { useEffect, useState, useMemo, useCallback } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

// ============================================================================
// ТИПЫ
// ============================================================================

export interface ScheduleEvent {
  _id: string;
  title: string;
  description?: string;
  type: 'training' | 'consultation' | 'group' | 'break' | 'other' | 'meeting';
  startTime: string;
  endTime: string;
  trainerId: string;
  trainerName: string;
  clientId?: string;
  clientName?: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
  location?: string;
  notes?: string;
  recurring?: {
    pattern: 'daily' | 'weekly' | 'monthly';
    interval: number;
    endDate?: string;
    daysOfWeek?: number[];
  };
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
  price?: number;
  duration?: number;
  goals?: string[];
  clientRating?: number;
  clientReview?: string;
  trainerNotes?: string;
}

export interface EventFilters {
  trainerId?: string;
  clientId?: string;
  status?: string;
  type?: string;
  startDate?: string;
  endDate?: string;
  dateRange?: {
    start: string;
    end: string;
  };
}
export interface ScheduleStats {
  totalEvents: number;
  todayEvents: number;
  upcomingEvents: number;
  completedEvents: number;
  cancelledEvents: number;
  pendingConfirmation: number;
  overdueEvents: number;
  
  // Добавляем недостающие поля для совместимости
  completionRate: number;
  cancellationRate: number;
  noShowRate: number;
  averageSessionDuration: number; // вместо averageDuration
  totalRevenue: number;
  utilizationRate: number;
  
  // Переименовываем для совместимости
  eventsByStatus: {
    scheduled: number;
    confirmed: number;
    completed: number;
    cancelled: number;
    "no-show": number;
  };
  eventsByTrainer: Record<string, number>;
  
  // Оставляем старые поля для обратной совместимости
  byTrainer: Array<{
    trainerId: string;
    trainerName: string;
    eventCount: number;
  }>;
  byType: {
    training: number;
    consultation: number;
    group: number;
    meeting: number;
    break: number;
    other: number;
  };
  byStatus: {
    scheduled: number;
    confirmed: number;
    completed: number;
    cancelled: number;
    'no-show': number;
  };
  averageDuration: number;
  busyHours: Array<{
    hour: number;
    eventCount: number;
  }>;
}

export interface Trainer {
  id: string;
  name: string;
  role: string;
  email: string;
  photoUri?: string;
}

export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
}

export interface TrainerSchedule {
  trainerId: string;
  trainerName: string;
  trainerRole: string;
  events: ScheduleEvent[];
  workingHours: {
    start: string;
    end: string;
    days: number[];
  };
}

export interface SearchFilters {
  trainerId?: string;
  status?: string;
  type?: string;
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface TopTrainer {
  name: string;
  eventCount: number;
  completionRate: number;
}

export interface PopularEventType {
  type: string;
  count: number;
  percentage: number;
}

export interface ScheduleAnalyticsData {
  overview: {
    totalEvents: number;
    activeTrainers: number;
    utilizationRate: number;
    completionRate: number;
  };
  trends: {
    eventsThisWeek: number;
    eventsLastWeek: number;
    growthRate: number;
  };
  performance: {
    topTrainers: TopTrainer[];
    busyHours: Array<{
      hour: number;
      eventCount: number;
    }>;
    popularEventTypes: PopularEventType[];
  };
}

export interface CreateEventData {
  title: string;
  description?: string;
  type: 'training' | 'consultation' | 'group' | 'break' | 'other' | 'meeting';
  startTime: string;
  endTime: string;
  trainerId: string;
  clientId?: string;
  location?: string;
  notes?: string;
  recurring?: {
    pattern: 'daily' | 'weekly' | 'monthly';
    interval: number;
    endDate?: string;
    daysOfWeek?: number[];
  };
  price?: number;
  duration?: number;
  goals?: string[];
}

// ============================================================================
// ХУКИ ДЛЯ ПОЛУЧЕНИЯ ТРЕНЕРОВ И КЛИЕНТОВ
// ============================================================================

// Загрузка тренеров через API пользователей
async function loadTrainersFromAPI(): Promise<Trainer[]> {
  try {
    console.log('🔄 Загрузка тренеров через API...');
    
    const response = await fetch('/api/admin/users?role=trainers');
    const data = await response.json();
    
    console.log('📥 Ответ API тренеров:', data);
    
    if (data.success && data.users) {
      const trainers = data.users
        .filter((user: any) => user.role === 'trainer') // Только роль 'trainer'
        .map((user: any) => ({
          id: user.id,
          name: user.name,
          role: user.role,
          email: user.email || '',
          photoUri: user.photoUrl,
        }));
      
      console.log('✅ Загружено тренеров через API:', trainers.length);
      return trainers;
    } else {
      console.error('❌ API вернул ошибку:', data.error);
      return [];
    }
  } catch (error) {
    console.error('💥 Ошибка загрузки тренеров через API:', error);
    return [];
  }
}

// Загрузка клиентов через API пользователей
async function loadClientsFromAPI(): Promise<Client[]> {
  try {
    console.log('🔄 Загрузка клиентов через API...');
    
    const response = await fetch('/api/admin/users?role=clients');
    const data = await response.json();
    
    console.log('📥 Ответ API клиентов:', data);
    
    if (data.success && data.users) {
      const clients = data.users
        .filter((user: any) => user.role === 'member')
        .map((user: any) => ({
          id: user.id,
          name: user.name,
          email: user.email || '',
          phone: user.phone || '',
        }));
      
      console.log('✅ Загружено клиентов через API:', clients.length);
      return clients;
    } else {
      console.error('❌ API вернул ошибку:', data.error);
      return [];
    }
  } catch (error) {
    console.error('💥 Ошибка загрузки клиентов через API:', error);
    return [];
  }
}

// Хук для получения тренеров
export function useTrainers(): Trainer[] {
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTrainers = async () => {
      try {
        const loadedTrainers = await loadTrainersFromAPI();
        setTrainers(loadedTrainers);
      } catch (error) {
        console.error('Ошибка загрузки тренеров:', error);
        setTrainers([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrainers();
  }, []);

  return trainers;
}

// Хук для получения клиентов
export function useClients(): Client[] {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const loadedClients = await loadClientsFromAPI();
        setClients(loadedClients);
      } catch (error) {
        console.error('Ошибка загрузки клиентов:', error);
        setClients([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClients();
  }, []);

  return clients;
}

// ============================================================================
// ОСНОВНЫЕ ХУКИ С CONVEX
// ============================================================================

// Хук для получения всех событий
export function useScheduleEvents(filters?: EventFilters): ScheduleEvent[] {
  let result: any[] | undefined;
  
  try {
    if (filters?.startDate && filters?.endDate) {
      result = useQuery(api.events.getByDateRange, {
        startDate: filters.startDate,
        endDate: filters.endDate,
      });
    } else if (filters?.trainerId) {
      result = useQuery(api.events.getByTrainer, {
        trainerId: filters.trainerId as string,
      });
    } else if (filters?.status) {
      result = useQuery(api.events.getByStatus, {
        status: filters.status,
      });
    } else {
      result = useQuery(api.events.getAll, {});
    }
  } catch (error) {
    console.warn('Events API недоступен:', error);
    result = undefined;
  }

  // 🔧 ДОБАВЛЕНА РАСШИРЕННАЯ ОТЛАДКА
  console.log('=== useScheduleEvents ОТЛАДКА ===');
  console.log('Raw result from Convex:', result);
  console.log('Filters:', filters);
  console.log('Result length:', result?.length || 0);

  return useMemo(() => {
    if (!result) {
      console.log('No result from Convex, returning empty array');
      return [];
    }
    
    console.log('Mapping Convex events...');
    const mapped = result.map((event: any) => {
      const mappedEvent = {
        _id: event._id,
        title: event.title,
        description: event.description,
        type: event.type,
        startTime: event.startTime,
        endTime: event.endTime,
        trainerId: event.trainerId,
        trainerName: event.trainerName,
        clientId: event.clientId,
        clientName: event.clientName,
        status: event.status,
        location: event.location,
        notes: event.notes,
        createdAt: event._creationTime ? new Date(event._creationTime).toISOString() : new Date().toISOString(),
        createdBy: event.createdBy,
        price: event.price,
        duration: event.duration,
        goals: event.goals,
        clientRating: event.clientRating,
        clientReview: event.clientReview,
        trainerNotes: event.trainerNotes,
      };
      
      console.log(`Mapped event "${mappedEvent.title}":`, {
        startTime: mappedEvent.startTime,
        startTimeDate: new Date(mappedEvent.startTime),
        localTime: new Date(mappedEvent.startTime).toLocaleString('ru')
      });
      
      return mappedEvent;
    });

    console.log('Final mapped events:', mapped.length);
    return mapped;
  }, [result]);
}

// Хук для получения статистики
export function useScheduleStats(period?: string, startDate?: string, endDate?: string): ScheduleStats {
  const allEvents = useScheduleEvents();
  const trainers = useTrainersWithFallback();

  return useMemo(() => {
    if (!allEvents.length) {
      return {
        totalEvents: 0,
        todayEvents: 0,
        upcomingEvents: 0,
        completedEvents: 0,
        cancelledEvents: 0,
        pendingConfirmation: 0,
        overdueEvents: 0,
        
        // Новые поля
        completionRate: 0,
        cancellationRate: 0,
        noShowRate: 0,
        averageSessionDuration: 60,
        totalRevenue: 0,
        utilizationRate: 0,
        eventsByStatus: {
          scheduled: 0,
          confirmed: 0,
          completed: 0,
          cancelled: 0,
          "no-show": 0,
        },
        eventsByTrainer: {},
        
        // Старые поля
        byTrainer: [],
        byType: {
          training: 0,
          consultation: 0,
          group: 0,
          meeting: 0,
          break: 0,
          other: 0,
        },
        byStatus: {
          scheduled: 0,
          confirmed: 0,
          completed: 0,
          cancelled: 0,
          'no-show': 0,
        },
        averageDuration: 60,
        busyHours: [],
      };
    }

    // Ваши существующие вычисления...
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Фильтруем события по периоду если указан
    let filteredEvents = allEvents;
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      filteredEvents = allEvents.filter(event => {
        const eventDate = new Date(event.startTime);
        return eventDate >= start && eventDate <= end;
      });
    }

    const todayEvents = allEvents.filter(event => {
      const eventDate = new Date(event.startTime);
      return eventDate >= today && eventDate < tomorrow;
    }).length;

    const upcomingEvents = allEvents.filter(event => {
      const eventDate = new Date(event.startTime);
      return eventDate > now && event.status !== 'cancelled';
    }).length;

    const overdueEvents = allEvents.filter(event => {
      const eventEnd = new Date(event.endTime);
      return eventEnd < now && (event.status === 'scheduled' || event.status === 'confirmed');
    }).length;

    // Статистика по статусам
    const byStatus = {
      scheduled: filteredEvents.filter(e => e.status === 'scheduled').length,
      confirmed: filteredEvents.filter(e => e.status === 'confirmed').length,
      completed: filteredEvents.filter(e => e.status === 'completed').length,
      cancelled: filteredEvents.filter(e => e.status === 'cancelled').length,
      'no-show': filteredEvents.filter(e => e.status === 'no-show').length,
    };

    // Статистика по тренерам
    const byTrainer = trainers.map((trainer: Trainer) => ({
      trainerId: trainer.id,
      trainerName: trainer.name,
      eventCount: filteredEvents.filter(e => e.trainerId === trainer.id).length,
    }));

    // Статистика по типам
    const byType = {
      training: filteredEvents.filter(e => e.type === 'training').length,
      consultation: filteredEvents.filter(e => e.type === 'consultation').length,
      group: filteredEvents.filter(e => e.type === 'group').length,
      meeting: filteredEvents.filter(e => e.type === 'meeting').length,
      break: filteredEvents.filter(e => e.type === 'break').length,
      other: filteredEvents.filter(e => e.type === 'other').length,
    };

    // Загруженные часы
    const busyHours = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      eventCount: filteredEvents.filter(event => {
        const eventHour = new Date(event.startTime).getHours();
        return eventHour === hour;
      }).length,
    }));

    // Средняя продолжительность
    const eventsWithDuration = filteredEvents.filter(e => e.duration);
    const averageDuration = eventsWithDuration.length > 0
      ? eventsWithDuration.reduce((sum, e) => sum + (e.duration || 60), 0) / eventsWithDuration.length
      : 60;

    // Утилизация
    const totalPossibleSlots = trainers.length * 12 * 7;
    const utilizationRate = totalPossibleSlots > 0 
      ? Math.min((filteredEvents.length / totalPossibleSlots) * 100, 100)
      : 0;

    // НОВЫЕ ВЫЧИСЛЕНИЯ для совместимости
    const completionRate = filteredEvents.length > 0 
      ? (byStatus.completed / filteredEvents.length) * 100 
      : 0;
    
    const cancellationRate = filteredEvents.length > 0 
      ? (byStatus.cancelled / filteredEvents.length) * 100 
      : 0;
    
    const noShowRate = filteredEvents.length > 0 
      ? (byStatus['no-show'] / filteredEvents.length) * 100 
      : 0;

    const totalRevenue = filteredEvents
      .filter(e => e.status === 'completed')
      .reduce((sum, e) => sum + (e.price || 0), 0);

    const eventsByTrainer = trainers.reduce((acc: Record<string, number>, trainer: Trainer) => {
      acc[trainer.name] = filteredEvents.filter(e => e.trainerId === trainer.id).length;
      return acc;
    }, {});

    return {
      totalEvents: filteredEvents.length,
      todayEvents,
      upcomingEvents,
      completedEvents: byStatus.completed,
      cancelledEvents: byStatus.cancelled,
      pendingConfirmation: byStatus.scheduled,
      overdueEvents,
      
      // Новые поля
      completionRate: Math.round(completionRate),
      cancellationRate: Math.round(cancellationRate),
      noShowRate: Math.round(noShowRate),
      averageSessionDuration: Math.round(averageDuration),
      totalRevenue,
      utilizationRate: Math.round(utilizationRate),
      eventsByStatus: {
        scheduled: byStatus.scheduled,
        confirmed: byStatus.confirmed,
        completed: byStatus.completed,
        cancelled: byStatus.cancelled,
        "no-show": byStatus['no-show'],
      },
      eventsByTrainer,
      
      // Старые поля для обратной совместимости
      byTrainer,
      byType,
      byStatus,
      averageDuration: Math.round(averageDuration),
      busyHours,
    };
  }, [allEvents, trainers, period, startDate, endDate]);
}

// ============================================================================
// МУТАЦИИ С CONVEX
// ============================================================================


export function useScheduleMutations() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Convex мутации
  const createEventMutation = useMutation(api.events.create);
  const updateEventMutation = useMutation(api.events.update);
  const deleteEventMutation = useMutation(api.events.delete_);
  const updateStatusMutation = useMutation(api.events.updateStatus);

  // Получаем списки тренеров и клиентов
  const trainers = useTrainers();
  const clients = useClients();

  const createEvent = async (eventData: Partial<ScheduleEvent>): Promise<{ success: boolean; id?: string }> => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('=== СОЗДАНИЕ СОБЫТИЯ ЧЕРЕЗ CONVEX ===');
      console.log('1. Входные данные:', JSON.stringify(eventData, null, 2));
      
      if (!eventData.trainerId) {
        throw new Error('Тренер обязателен');
      }

      // Находим тренера
      const trainer = trainers.find((t: Trainer) => t.id === eventData.trainerId);
      if (!trainer) {
        throw new Error(`Тренер с ID "${eventData.trainerId}" не найден`);
      }

      // Находим клиента если указан
      let clientName: string | undefined = undefined;
      if (eventData.clientId && eventData.clientId !== "no-client") {
        const client = clients.find((c: Client) => c.id === eventData.clientId);
        if (client) {
          clientName = client.name;
        }
      }

      // Подготавливаем данные для Convex
      const convexData = {
        title: eventData.title || '',
        description: eventData.description,
        type: eventData.type || 'training',
        startTime: eventData.startTime || new Date().toISOString(),
        endTime: eventData.endTime || new Date().toISOString(),
        trainerId: trainer.id,
        trainerName: trainer.name,
        clientId: eventData.clientId && eventData.clientId !== "no-client" ? eventData.clientId : undefined,
        clientName,
        status: eventData.status || 'scheduled',
        location: eventData.location,
        createdBy: 'admin', // TODO: получать из контекста пользователя
        notes: eventData.notes,
        price: eventData.price,
        duration: eventData.duration || 60,
        goals: eventData.goals,
      };

      console.log('2. Данные для Convex:', JSON.stringify(convexData, null, 2));

      const eventId = await createEventMutation(convexData);
      
      console.log('3. Событие создано с ID:', eventId);
      
      return { success: true, id: eventId };
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка создания события';
      console.error('=== ОШИБКА СОЗДАНИЯ СОБЫТИЯ ===', err);
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  

  const updateEvent = async (eventId: string, updates: Partial<ScheduleEvent>): Promise<{ success: boolean; id: string }> => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('=== ОБНОВЛЕНИЕ СОБЫТИЯ ЧЕРЕЗ CONVEX ===');
      console.log('1. ID события:', eventId);
      console.log('2. Обновления:', JSON.stringify(updates, null, 2));

      // Подготавливаем данные для обновления
      const convexUpdates: any = {};
      
      if (updates.title !== undefined) convexUpdates.title = updates.title;
      if (updates.description !== undefined) convexUpdates.description = updates.description;
      if (updates.type !== undefined) convexUpdates.type = updates.type;
      if (updates.startTime !== undefined) convexUpdates.startTime = updates.startTime;
      if (updates.endTime !== undefined) convexUpdates.endTime = updates.endTime;
      if (updates.status !== undefined) convexUpdates.status = updates.status;
      if (updates.location !== undefined) convexUpdates.location = updates.location;
      if (updates.notes !== undefined) convexUpdates.notes = updates.notes;
      if (updates.price !== undefined) convexUpdates.price = updates.price;
      if (updates.duration !== undefined) convexUpdates.duration = updates.duration;
      if (updates.goals !== undefined) convexUpdates.goals = updates.goals;

      // Обрабатываем тренера
      if (updates.trainerId !== undefined) {
        const trainer = trainers.find((t: Trainer) => t.id === updates.trainerId);
        if (trainer) {
          convexUpdates.trainerId = trainer.id;
          convexUpdates.trainerName = trainer.name;
        }
      }

      // Обрабатываем клиента
      if (updates.clientId !== undefined) {
        if (updates.clientId && updates.clientId !== "no-client") {
          const client = clients.find((c: Client) => c.id === updates.clientId);
          if (client) {
            convexUpdates.clientId = client.id;
            convexUpdates.clientName = client.name;
          }
        } else {
          convexUpdates.clientId = undefined;
          convexUpdates.clientName = undefined;
        }
      }

      console.log('3. Данные для Convex:', JSON.stringify(convexUpdates, null, 2));

      const result = await updateEventMutation({
        id: eventId as Id<"events">,
        ...convexUpdates,
      });
      
      console.log('4. Событие обновлено:', result);
      
      return { success: true, id: eventId };
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка обновления события';
      console.error('=== ОШИБКА ОБНОВЛЕНИЯ СОБЫТИЯ ===', err);
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteEvent = async (eventId: string): Promise<{ success: boolean }> => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('=== УДАЛЕНИЕ СОБЫТИЯ ЧЕРЕЗ CONVEX ===');
      console.log('ID события:', eventId);

      await deleteEventMutation({
        id: eventId as Id<"events">,
      });
      
      console.log('Событие удалено успешно');
      
      return { success: true };
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка удаления события';
      console.error('=== ОШИБКА УДАЛЕНИЯ СОБЫТИЯ ===', err);
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateEventStatus = async (eventId: string, status: ScheduleEvent['status']): Promise<{ success: boolean }> => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('=== ОБНОВЛЕНИЕ СТАТУСА ЧЕРЕЗ CONVEX ===');
      console.log('ID события:', eventId);
      console.log('Новый статус:', status);

      await updateStatusMutation({
        id: eventId as Id<"events">,
        status: status,
      });
      
      console.log('Статус обновлен успешно');
      
      return { success: true };
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка обновления статуса';
      console.error('=== ОШИБКА ОБНОВЛЕНИЯ СТАТУСА ===', err);
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = useCallback(() => setError(null), []);

  return {
    createEvent,
    updateEvent,
    deleteEvent,
    updateEventStatus,
    isLoading,
    error,
    clearError,
  };
}

// ============================================================================
// ОБНОВЛЕННЫЕ ОСНОВНЫЕ ХУКИ
// ============================================================================

// Проверка доступности Convex API
function isConvexApiAvailable(): boolean {
  try {
    return api && api.events && typeof api.events === 'object';
  } catch (error) {
    return false;
  }
}

export function useScheduleApiAvailability() {
  const [isAvailable, setIsAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAvailability = () => {
      try {
        const convexAvailable = isConvexApiAvailable();
        console.log('🔍 Convex API доступен:', convexAvailable);
        setIsAvailable(convexAvailable);
      } catch (error) {
        console.error('💥 Ошибка проверки Convex API:', error);
        setIsAvailable(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAvailability();
  }, []);

  return { isAvailable, isLoading };
}

// Хук с fallback на API пользователей для тренеров
export function useTrainersWithFallback(): Trainer[] {
  const realTrainers = useTrainers();
  const { isAvailable } = useScheduleApiAvailability();
  
  console.log('🔄 useTrainersWithFallback:', {
    realTrainersCount: realTrainers.length,
    isConvexAvailable: isAvailable,
    usingFallback: realTrainers.length === 0
  });

  return realTrainers;
}

export function useClientsWithFallback(): Client[] {
  const realClients = useClients();
  return realClients;
}

export function useScheduleWithFallback(filters?: EventFilters): ScheduleEvent[] {
  const realEvents = useScheduleEvents(filters);
  const { isAvailable } = useScheduleApiAvailability();

  console.log('🔄 useScheduleWithFallback:', {
    eventsCount: realEvents.length,
    isConvexAvailable: isAvailable,
    filters
  });

  return realEvents;
}

export function useScheduleStatsWithFallback(period?: string, startDate?: string, endDate?: string): ScheduleStats {
  const realStats = useScheduleStats(period, startDate, endDate);
  return realStats;
}

// ============================================================================
// СПЕЦИАЛИЗИРОВАННЫЕ ХУКИ ДЛЯ CONVEX
// ============================================================================

// Хук для получения событий на сегодня
export function useTodayEvents(): ScheduleEvent[] {
  let result: any[] | undefined;
  
  try {
    result = useQuery(api.events.getTodayEvents, {});
  } catch (error) {
    console.warn('Today events API недоступен:', error);
    result = undefined;
  }

  return useMemo(() => {
    if (!result) return [];
    
    return result.map((event: any) => ({
      _id: event._id,
      title: event.title,
      description: event.description,
      type: event.type,
      startTime: event.startTime,
      endTime: event.endTime,
      trainerId: event.trainerId,
      trainerName: event.trainerName,
      clientId: event.clientId,
      clientName: event.clientName,
      status: event.status,
      location: event.location,
      notes: event.notes,
      createdAt: event._creationTime ? new Date(event._creationTime).toISOString() : new Date().toISOString(),
      createdBy: event.createdBy,
      price: event.price,
      duration: event.duration,
      goals: event.goals,
      clientRating: event.clientRating,
      clientReview: event.clientReview,
      trainerNotes: event.trainerNotes,
    }));
  }, [result]);
}

// Хук для получения предстоящих событий
export function useUpcomingEvents(days: number = 7): ScheduleEvent[] {
  let result: any[] | undefined;
  
  try {
    result = useQuery(api.events.getUpcoming, {});
  } catch (error) {
    console.warn('Upcoming events API недоступен:', error);
    result = undefined;
  }

  return useMemo(() => {
    if (!result) return [];
    
    const now = new Date();
    const future = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    
    const filtered = result.filter((event: any) => {
      const eventDate = new Date(event.startTime);
      return eventDate <= future;
    });
    
    return filtered.map((event: any) => ({
      _id: event._id,
      title: event.title,
      description: event.description,
      type: event.type,
      startTime: event.startTime,
      endTime: event.endTime,
      trainerId: event.trainerId,
      trainerName: event.trainerName,
      clientId: event.clientId,
      clientName: event.clientName,
      status: event.status,
      location: event.location,
      notes: event.notes,
      createdAt: event._creationTime ? new Date(event._creationTime).toISOString() : new Date().toISOString(),
      createdBy: event.createdBy,
      price: event.price,
      duration: event.duration,
      goals: event.goals,
      clientRating: event.clientRating,
      clientReview: event.clientReview,
      trainerNotes: event.trainerNotes,
    }));
  }, [result, days]);
}

// Хук для получения событий тренера
export function useTrainerEvents(trainerId: string): ScheduleEvent[] {
  let result: any[] | undefined;
  
  try {
    result = useQuery(api.events.getByTrainer, { trainerId });
  } catch (error) {
    console.warn('Trainer events API недоступен:', error);
    result = undefined;
  }
  return useMemo(() => {
    if (!result) return [];
    
    return result.map((event: any) => ({
      _id: event._id,
      title: event.title,
      description: event.description,
      type: event.type,
      startTime: event.startTime,
      endTime: event.endTime,
      trainerId: event.trainerId,
      trainerName: event.trainerName,
      clientId: event.clientId,
      clientName: event.clientName,
      status: event.status,
      location: event.location,
      notes: event.notes,
      createdAt: event._creationTime ? new Date(event._creationTime).toISOString() : new Date().toISOString(),
      createdBy: event.createdBy,
      price: event.price,
      duration: event.duration,
      goals: event.goals,
      clientRating: event.clientRating,
      clientReview: event.clientReview,
      trainerNotes: event.trainerNotes,
    }));
  }, [result]);
}

// Хук для получения статистики тренера
export function useTrainerStats(trainerId: string): {
  totalEvents: number;
  completedEvents: number;
  cancelledEvents: number;
  completionRate: number;
  upcomingEvents: number;
  todayEvents: number;
  averageRating: number;
  totalRevenue: number;
} {
  let result: any | undefined;
  
  try {
    result = useQuery(api.events.getTrainerStats, { trainerId });
  } catch (error) {
    console.warn('Trainer stats API недоступен:', error);
    result = undefined;
  }

  return useMemo(() => {
    if (!result) {
      return {
        totalEvents: 0,
        completedEvents: 0,
        cancelledEvents: 0,
        completionRate: 0,
        upcomingEvents: 0,
        todayEvents: 0,
        averageRating: 0,
        totalRevenue: 0,
      };
    }

    // Получаем дополнительные данные для upcomingEvents и todayEvents
    const allTrainerEvents = useTrainerEvents(trainerId);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const upcomingEvents = allTrainerEvents.filter(e => 
      new Date(e.startTime) > now && e.status !== 'cancelled'
    ).length;

    const todayEvents = allTrainerEvents.filter(e => {
      const eventDate = new Date(e.startTime);
      return eventDate >= today && eventDate < tomorrow;
    }).length;

    return {
      totalEvents: result.total || 0,
      completedEvents: result.completed || 0,
      cancelledEvents: result.cancelled || 0,
      completionRate: result.completionRate || 0,
      upcomingEvents,
      todayEvents,
      averageRating: result.averageRating || 0,
      totalRevenue: result.totalRevenue || 0,
    };
  }, [result, trainerId]);
}

// Хук для получения событий тренера на определенную дату
export function useTrainerDayEvents(trainerId: string, date: Date): ScheduleEvent[] {
  const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD
  
  let result: any[] | undefined;
  
  try {
    result = useQuery(api.events.getTrainerEventsByDate, { 
      trainerId, 
      date: dateString 
    });
  } catch (error) {
    console.warn('Trainer day events API недоступен:', error);
    result = undefined;
  }

  return useMemo(() => {
    if (!result) return [];
    
    return result.map((event: any) => ({
      _id: event._id,
      title: event.title,
      description: event.description,
      type: event.type,
      startTime: event.startTime,
      endTime: event.endTime,
      trainerId: event.trainerId,
      trainerName: event.trainerName,
      clientId: event.clientId,
      clientName: event.clientName,
      status: event.status,
      location: event.location,
      notes: event.notes,
      createdAt: event._creationTime ? new Date(event._creationTime).toISOString() : new Date().toISOString(),
      createdBy: event.createdBy,
      price: event.price,
      duration: event.duration,
      goals: event.goals,
      clientRating: event.clientRating,
      clientReview: event.clientReview,
      trainerNotes: event.trainerNotes,
    }));
  }, [result]);
}

// ============================================================================
// ДОПОЛНИТЕЛЬНЫЕ ХУКИ
// ============================================================================

// Хук для получения событий по статусу
export function useEventsByStatus(status: string): ScheduleEvent[] {
  let result: any[] | undefined;
  
  try {
    result = useQuery(api.events.getByStatus, { status });
  } catch (error) {
    console.warn('Events by status API недоступен:', error);
    result = undefined;
  }

  return useMemo(() => {
    if (!result) return [];
    
    return result.map((event: any) => ({
      _id: event._id,
      title: event.title,
      description: event.description,
      type: event.type,
      startTime: event.startTime,
      endTime: event.endTime,
      trainerId: event.trainerId,
      trainerName: event.trainerName,
      clientId: event.clientId,
      clientName: event.clientName,
      status: event.status,
      location: event.location,
      notes: event.notes,
      createdAt: event._creationTime ? new Date(event._creationTime).toISOString() : new Date().toISOString(),
      createdBy: event.createdBy,
      price: event.price,
      duration: event.duration,
      goals: event.goals,
      clientRating: event.clientRating,
      clientReview: event.clientReview,
      trainerNotes: event.trainerNotes,
    }));
  }, [result]);
}

// Хук для получения просроченных событий
export function useOverdueEvents(): ScheduleEvent[] {
  const allEvents = useScheduleWithFallback();
  
  return useMemo(() => {
    const now = new Date();
    return allEvents.filter((event: ScheduleEvent) => {
      const eventEnd = new Date(event.endTime);
      return eventEnd < now && (event.status === 'scheduled' || event.status === 'confirmed');
    });
  }, [allEvents]);
}

// Хук для получения событий клиента
export function useClientEvents(clientId: string): ScheduleEvent[] {
  let result: any[] | undefined;
  
  try {
    result = useQuery(api.events.getByClient, { clientId });
  } catch (error) {
    console.warn('Client events API недоступен:', error);
    result = undefined;
  }

  return useMemo(() => {
    if (!result) return [];
    
    return result.map((event: any) => ({
      _id: event._id,
      title: event.title,
      description: event.description,
      type: event.type,
      startTime: event.startTime,
      endTime: event.endTime,
      trainerId: event.trainerId,
      trainerName: event.trainerName,
      clientId: event.clientId,
      clientName: event.clientName,
      status: event.status,
      location: event.location,
      notes: event.notes,
      createdAt: event._creationTime ? new Date(event._creationTime).toISOString() : new Date().toISOString(),
      createdBy: event.createdBy,
      price: event.price,
      duration: event.duration,
      goals: event.goals,
      clientRating: event.clientRating,
      clientReview: event.clientReview,
      trainerNotes: event.trainerNotes,
    }));
  }, [result]);
}

// Хук для получения событий по типу
export function useEventsByType(type: ScheduleEvent['type']): ScheduleEvent[] {
  const allEvents = useScheduleWithFallback();
  
  return useMemo(() => {
    return allEvents.filter((event: ScheduleEvent) => event.type === type);
  }, [allEvents, type]);
}

// Хук для получения событий в диапазоне дат
export function useEventsInDateRange(startDate: Date, endDate: Date): ScheduleEvent[] {
  const startDateString = startDate.toISOString();
  const endDateString = endDate.toISOString();
  
  return useScheduleEvents({
    startDate: startDateString,
    endDate: endDateString,
  });
}

// Хук для получения конфликтующих событий
export function useConflictingEvents(
  trainerId: string, 
  startTime: string, 
  endTime: string, 
  excludeEventId?: string
): ScheduleEvent[] {
  const trainerEvents = useTrainerEvents(trainerId);

  return useMemo(() => {
    return trainerEvents.filter((event: ScheduleEvent) => {
      // Исключаем само событие при редактировании
      if (excludeEventId && event._id === excludeEventId) {
        return false;
      }

      // Исключаем отмененные события
      if (event.status === 'cancelled') {
        return false;
      }

      // Проверяем пересечение времени
      const eventStart = new Date(event.startTime);
      const eventEnd = new Date(event.endTime);
      const newStart = new Date(startTime);
      const newEnd = new Date(endTime);

      return (
        (newStart < eventEnd && newEnd > eventStart) ||
        (eventStart < newEnd && eventEnd > newStart)
      );
    });
  }, [trainerEvents, trainerId, startTime, endTime, excludeEventId]);
}

// Хук для получения доступных временных слотов тренера
export function useAvailableTimeSlots(
  trainerId: string, 
  date: Date, 
  duration: number = 60 // в минутах
): Array<{ start: string; end: string }> {
  const dayEvents = useTrainerDayEvents(trainerId, date);

  return useMemo(() => {
    const slots: Array<{ start: string; end: string }> = [];
    
    // Рабочие часы (можно сделать настраиваемыми)
    const workStart = 8; // 8:00
    const workEnd = 20;  // 20:00
    
    const currentDate = new Date(date);
    
    for (let hour = workStart; hour < workEnd; hour++) {
      for (let minute = 0; minute < 60; minute += 30) { // слоты по 30 минут
        const slotStart = new Date(currentDate);
        slotStart.setHours(hour, minute, 0, 0);
        
        const slotEnd = new Date(slotStart);
        slotEnd.setMinutes(slotEnd.getMinutes() + duration);
        
        // Проверяем, что слот не пересекается с существующими событиями
        const hasConflict = dayEvents.some((event: ScheduleEvent) => {
          const eventStart = new Date(event.startTime);
          const eventEnd = new Date(event.endTime);
          
          return (
            (slotStart < eventEnd && slotEnd > eventStart) ||
            (eventStart < slotEnd && eventEnd > slotStart)
          );
        });
        
        if (!hasConflict && slotEnd.getHours() <= workEnd) {
          slots.push({
            start: slotStart.toISOString(),
            end: slotEnd.toISOString(),
          });
        }
      }
    }
    
    return slots;
  }, [dayEvents, date, duration, trainerId]);
}

// Хук для проверки доступности тренера в определенное время
export function useTrainerAvailability(
  trainerId: string,
  startTime: string,
  endTime: string,
  excludeEventId?: string
): { isAvailable: boolean; conflictingEvents: ScheduleEvent[] } {
  const conflictingEvents = useConflictingEvents(trainerId, startTime, endTime, excludeEventId);
  
  return useMemo(() => ({
    isAvailable: conflictingEvents.length === 0,
    conflictingEvents,
  }), [conflictingEvents]);
}

// Хук для получения следующего события тренера
export function useNextTrainerEvent(trainerId: string): ScheduleEvent | null {
  const trainerEvents = useTrainerEvents(trainerId);
  
  return useMemo(() => {
    const now = new Date();
    const upcomingEvents = trainerEvents
      .filter((event: ScheduleEvent) => {
        const eventDate = new Date(event.startTime);
        return eventDate > now && event.status !== 'cancelled';
      })
      .sort((a: ScheduleEvent, b: ScheduleEvent) => 
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      );
    
    return upcomingEvents.length > 0 ? upcomingEvents[0] : null;
  }, [trainerEvents]);
}

// Хук для получения текущего события тренера
export function useCurrentTrainerEvent(trainerId: string): ScheduleEvent | null {
  const trainerEvents = useTrainerEvents(trainerId);
  
  return useMemo(() => {
    const now = new Date();
    return trainerEvents.find((event: ScheduleEvent) => {
      const eventStart = new Date(event.startTime);
      const eventEnd = new Date(event.endTime);
      return eventStart <= now && eventEnd >= now && event.status !== 'cancelled';
    }) || null;
  }, [trainerEvents]);
}

// Хук для получения загрузки тренера по дням недели
export function useTrainerWeeklyLoad(trainerId: string): Array<{
  day: string;
  dayNumber: number;
  eventCount: number;
  hours: number;
}> {
  const trainerEvents = useTrainerEvents(trainerId);

  return useMemo(() => {
    const weekDays = [
      'Понедельник', 'Вторник', 'Среда', 'Четверг', 
      'Пятница', 'Суббота', 'Воскресенье'
    ];

    return weekDays.map((day, index) => {
      const dayEvents = trainerEvents.filter((event: ScheduleEvent) => {
        const eventDate = new Date(event.startTime);
        return eventDate.getDay() === (index + 1) % 7; // Понедельник = 1
      });

      const totalHours = dayEvents.reduce((sum: number, event: ScheduleEvent) => {
        const start = new Date(event.startTime);
        const end = new Date(event.endTime);
        const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60); // в часах
        return sum + duration;
      }, 0);

      return {
        day,
        dayNumber: index,
        eventCount: dayEvents.length,
        hours: Math.round(totalHours * 10) / 10, // округляем до 1 знака
      };
    });
  }, [trainerEvents]);
}

// Хук для получения статистики по дням недели
export function useWeeklyStats(): Array<{
  day: string;
  dayNumber: number;
  eventCount: number;
  completedCount: number;
  cancelledCount: number;
}> {
  const allEvents = useScheduleWithFallback();
  
  return useMemo(() => {
    const weekDays = [
      'Понедельник', 'Вторник', 'Среда', 'Четверг', 
      'Пятница', 'Суббота', 'Воскресенье'
    ];

    return weekDays.map((day, index) => {
      const dayEvents = allEvents.filter((event: ScheduleEvent) => {
        const eventDate = new Date(event.startTime);
        return eventDate.getDay() === (index + 1) % 7; // Понедельник = 1
      });

      return {
        day,
        dayNumber: index,
        eventCount: dayEvents.length,
        completedCount: dayEvents.filter(e => e.status === 'completed').length,
        cancelledCount: dayEvents.filter(e => e.status === 'cancelled').length,
      };
    });
  }, [allEvents]);
}

// Хук для получения статистики по часам дня
export function useHourlyStats(): Array<{
  hour: number;
  eventCount: number;
  utilizationRate: number;
}> {
  const allEvents = useScheduleWithFallback();
  const trainers = useTrainersWithFallback();
  
  return useMemo(() => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const totalTrainers = trainers.length || 1; // Избегаем деления на ноль
    
    return hours.map(hour => {
      const hourEvents = allEvents.filter((event: ScheduleEvent) => {
        const eventHour = new Date(event.startTime).getHours();
        return eventHour === hour;
      });
      
      // Утилизация = (количество событий в час) / (общее количество тренеров) * 100
      const utilizationRate = (hourEvents.length / totalTrainers) * 100;
      
      return {
        hour,
        eventCount: hourEvents.length,
        utilizationRate: Math.min(utilizationRate, 100), // Максимум 100%
      };
    });
  }, [allEvents, trainers]);
}

// Хук для получения топ тренеров по различным метрикам
export function useTopTrainers(metric: 'events' | 'completion' | 'hours' = 'events', limit: number = 5): Array<{
  trainer: Trainer;
  value: number;
  rank: number;
}> {
  const trainers = useTrainersWithFallback();
  const allEvents = useScheduleWithFallback();
  
  return useMemo(() => {
    const trainerStats = trainers.map(trainer => {
      const trainerEvents = allEvents.filter(e => e.trainerId === trainer.id);
      
      let value = 0;
      
      switch (metric) {
        case 'events':
          value = trainerEvents.length;
          break;
        case 'completion':
          const completed = trainerEvents.filter(e => e.status === 'completed').length;
          value = trainerEvents.length > 0 ? (completed / trainerEvents.length) * 100 : 0;
          break;
        case 'hours':
          value = trainerEvents.reduce((sum, event) => {
            const start = new Date(event.startTime);
            const end = new Date(event.endTime);
            const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
            return sum + duration;
          }, 0);
          break;
      }
      
      return { trainer, value };
    });
    
    const sorted = trainerStats
      .sort((a, b) => b.value - a.value)
      .slice(0, limit)
      .map((item, index) => ({
        ...item,
        rank: index + 1,
      }));
    
    return sorted;
  }, [trainers, allEvents, metric, limit]);
}

// Хук для получения рекомендаций по расписанию
export function useScheduleRecommendations(): Array<{
  type: 'warning' | 'info' | 'success';
  title: string;
  message: string;
  action?: string;
}> {
  const allEvents = useScheduleWithFallback();
  const trainers = useTrainersWithFallback();
  const overdueEvents = useOverdueEvents();
  const todayEvents = useTodayEvents();
  
  return useMemo(() => {
    const recommendations: Array<{
      type: 'warning' | 'info' | 'success';
      title: string;
      message: string;
      action?: string;
    }> = [];
    
    // Проверка просроченных событий
    if (overdueEvents.length > 0) {
      recommendations.push({
        type: 'warning',
        title: 'Просроченные события',
        message: `У вас есть ${overdueEvents.length} просроченных событий, требующих внимания.`,
        action: 'Обновить статусы',
      });
    }
    
    // Проверка событий на сегодня
    if (todayEvents.length === 0) {
      recommendations.push({
        type: 'info',
        title: 'Свободный день',
        message: 'На сегодня нет запланированных событий.',
      });
    } else if (todayEvents.length > 8) {
      recommendations.push({
        type: 'warning',
        title: 'Загруженный день',
        message: `На сегодня запланировано ${todayEvents.length} событий. Убедитесь, что расписание реалистично.`,
      });
    }
    
    // Проверка тренеров без событий
    const trainersWithoutEvents = trainers.filter(trainer => 
      !allEvents.some(event => event.trainerId === trainer.id)
    );
    
    if (trainersWithoutEvents.length > 0) {
      recommendations.push({
        type: 'info',
        title: 'Неактивные тренеры',
        message: `${trainersWithoutEvents.length} тренеров не имеют запланированных событий.`,
        action: 'Назначить события',
      });
    }
    
    // Проверка на успешную работу
    if (allEvents.length > 0) {
      const completionRate = (allEvents.filter(e => e.status === 'completed').length / allEvents.length) * 100;
      if (completionRate > 90) {
        recommendations.push({
          type: 'success',
          title: 'Отличная работа!',
          message: `Процент завершенных событий составляет ${Math.round(completionRate)}%.`,
        });
      }
    }
    
    return recommendations;
  }, [allEvents, trainers, overdueEvents, todayEvents]);
}

// Хук для поиска и фильтрации событий
export function useScheduleSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({});

  const allEvents = useScheduleWithFallback();

  const filteredEvents = useMemo(() => {
    let filtered = [...allEvents];

    // Поиск по названию
    if (searchTerm) {
      filtered = filtered.filter((event: ScheduleEvent) =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.trainerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (event.clientName && event.clientName.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Фильтр по тренеру
    if (filters.trainerId) {
      filtered = filtered.filter((event: ScheduleEvent) => event.trainerId === filters.trainerId);
    }

    // Фильтр по статусу
    if (filters.status) {
      filtered = filtered.filter((event: ScheduleEvent) => event.status === filters.status);
    }

    // Фильтр по типу
    if (filters.type) {
      filtered = filtered.filter((event: ScheduleEvent) => event.type === filters.type);
    }

    // Фильтр по дате
    if (filters.dateRange) {
      filtered = filtered.filter((event: ScheduleEvent) => {
        const eventDate = new Date(event.startTime);
        const startDate = new Date(filters.dateRange!.start);
        const endDate = new Date(filters.dateRange!.end);
        return eventDate >= startDate && eventDate <= endDate;
      });
    }

    return filtered;
  }, [allEvents, searchTerm, filters]);

  return {
    searchTerm,
    setSearchTerm,
    filters,
    setFilters,
    filteredEvents,
    totalCount: allEvents.length,
    filteredCount: filteredEvents.length,
  };
}

// Хук для валидации данных события
export function useEventValidation() {
  const trainers = useTrainersWithFallback();
  const clients = useClientsWithFallback();

  const validateEvent = useCallback((eventData: Partial<ScheduleEvent>): {
    isValid: boolean;
    errors: string[];
  } => {
    const errors: string[] = [];

    // Проверка обязательных полей
    if (!eventData.title?.trim()) {
      errors.push('Название события обязательно');
    }

    if (!eventData.startTime) {
      errors.push('Время начала обязательно');
    }

    if (!eventData.endTime) {
      errors.push('Время окончания обязательно');
    }

    if (!eventData.trainerId) {
      errors.push('Тренер обязателен');
    }

    // Проверка времени
    if (eventData.startTime && eventData.endTime) {
      const start = new Date(eventData.startTime);
      const end = new Date(eventData.endTime);

      if (end <= start) {
        errors.push('Время окончания должно быть позже времени начала');
      }

      // Проверка, что событие не в прошлом (только для новых событий)
      if (!eventData._id && start < new Date()) {
        errors.push('Нельзя создавать события в прошлом');
      }

      // Проверка максимальной продолжительности (например, 8 часов)
      const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      if (duration > 8) {
        errors.push('Максимальная продолжительность события - 8 часов');
      }
    }

    // Проверка существования тренера
    if (eventData.trainerId && !trainers.find(t => t.id === eventData.trainerId)) {
      errors.push('Выбранный тренер не найден');
    }

    // Проверка существования клиента (если указан)
    if (eventData.clientId && eventData.clientId !== "no-client" && !clients.find(c => c.id === eventData.clientId)) {
      errors.push('Выбранный клиент не найден');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }, [trainers, clients]);

  return { validateEvent };
}

// Хук для автосохранения черновика события
export function useEventDraft(eventId?: string) {
  const [draft, setDraft] = useState<Partial<ScheduleEvent> | null>(null);
  const [isDraftSaved, setIsDraftSaved] = useState(false);

  const draftKey = `event-draft-${eventId || 'new'}`;

  // Загружаем черновик при монтировании
  useEffect(() => {
    const savedDraft = localStorage.getItem(draftKey);
    if (savedDraft) {
      try {
        setDraft(JSON.parse(savedDraft));
        setIsDraftSaved(true);
      } catch (error) {
        console.warn('Ошибка загрузки черновика:', error);
      }
    }
  }, [draftKey]);

  // Сохраняем черновик
  const saveDraft = useCallback((eventData: Partial<ScheduleEvent>) => {
    try {
      localStorage.setItem(draftKey, JSON.stringify(eventData));
      setDraft(eventData);
      setIsDraftSaved(true);
    } catch (error) {
      console.warn('Ошибка сохранения черновика:', error);
    }
  }, [draftKey]);

  // Очищаем черновик
  const clearDraft = useCallback(() => {
    localStorage.removeItem(draftKey);
    setDraft(null);
    setIsDraftSaved(false);
  }, [draftKey]);

  return {
    draft,
    isDraftSaved,
    saveDraft,
    clearDraft,
  };
}

// Хук для аналитики расписания
export function useScheduleAnalytics(period: string = "month"): ScheduleAnalyticsData | null {
  const events = useScheduleWithFallback();
  const stats = useScheduleStatsWithFallback(period);
  const trainers = useTrainersWithFallback();

  // Мемоизируем вычисления аналитики
  const analytics = useMemo(() => {
    if (!events || !stats || !trainers) return null;

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const eventsThisWeek = events.filter((e: ScheduleEvent) => new Date(e.startTime) >= weekAgo).length;
    const eventsLastWeek = events.filter((e: ScheduleEvent) => {
      const eventDate = new Date(e.startTime);
      return eventDate >= twoWeeksAgo && eventDate < weekAgo;
    }).length;

    const growthRate = eventsLastWeek > 0 
      ? ((eventsThisWeek - eventsLastWeek) / eventsLastWeek) * 100 
      : 0;

    const completionRate = stats.totalEvents > 0 
      ? (stats.completedEvents / stats.totalEvents) * 100 
      : 0;

    const topTrainers: TopTrainer[] = stats.byTrainer
      .map((trainer: { trainerId: string; trainerName: string; eventCount: number }) => {
        const trainerEvents = events.filter((e: ScheduleEvent) => e.trainerId === trainer.trainerId);
        const completed = trainerEvents.filter((e: ScheduleEvent) => e.status === 'completed').length;
        const trainerCompletionRate = trainerEvents.length > 0 
                    ? (completed / trainerEvents.length) * 100 
          : 0;

        return {
          name: trainer.trainerName,
          eventCount: trainer.eventCount,
          completionRate: Math.round(trainerCompletionRate),
        };
      })
      .sort((a: TopTrainer, b: TopTrainer) => b.eventCount - a.eventCount)
      .slice(0, 5);

    const totalEvents = Object.values(stats.byType).reduce((a: number, b: number) => a + b, 0);
    const popularEventTypes: PopularEventType[] = Object.entries(stats.byType)
      .map(([type, count]: [string, number]) => ({
        type: type === 'training' ? 'Тренировки' :
              type === 'consultation' ? 'Консультации' :
              type === 'group' ? 'Групповые' :
              type === 'meeting' ? 'Встречи' :
              type === 'break' ? 'Перерывы' : 'Другое',
        count,
        percentage: totalEvents > 0 ? Math.round((count / totalEvents) * 100) : 0,
      }))
      .sort((a: PopularEventType, b: PopularEventType) => b.count - a.count);

    return {
      overview: {
        totalEvents: stats.totalEvents,
        activeTrainers: trainers.length,
        utilizationRate: stats.utilizationRate,
        completionRate: Math.round(completionRate),
      },
      trends: {
        eventsThisWeek,
        eventsLastWeek,
        growthRate: Math.round(growthRate * 10) / 10,
      },
      performance: {
        topTrainers,
        busyHours: stats.busyHours,
        popularEventTypes,
      },
    };
  }, [events, stats, trainers]);

  return analytics;
}

// ============================================================================
// ФИНАЛЬНЫЙ ЭКСПОРТ
// ============================================================================

export {
  useScheduleWithFallback as useScheduleEventsData,
  useScheduleStatsWithFallback as useScheduleStatsData,
  useTrainersWithFallback as useTrainersData,
  useClientsWithFallback as useClientsData,
};



