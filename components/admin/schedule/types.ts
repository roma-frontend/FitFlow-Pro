// components/admin/schedule/types.ts (обновленная версия)

export interface CreateEventData {
  title: string;
  description?: string;
  type: 'training' | 'consultation' | 'group' | 'break' | 'other' | 'meeting'; // ✅ Унифицируем
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

export interface ScheduleEvent {
  _id: string;
  title: string;
  description?: string;
  type: 'training' | 'consultation' | 'group' | 'break' | 'other' | 'meeting'; // ✅ Унифицируем
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

export interface ScheduleStats {
  totalEvents: number;
  completedEvents: number;
  cancelledEvents: number;
  todayEvents: number;
  upcomingEvents: number;
  pendingConfirmation: number;
  overdueEvents: number;
  completionRate: number;
  cancellationRate: number;
  noShowRate: number;
  averageSessionDuration: number;
  totalRevenue: number;
  utilizationRate: number;
  eventsByStatus: {
    scheduled: number;
    confirmed: number;
    completed: number;
    cancelled: number;
    "no-show": number;
  };
  eventsByTrainer: Record<string, number>;
}


export interface CreateEventData {
  title: string;
  type: "training" | "consultation" | "group" | "meeting" | "break" | "other";
  trainerId: string;
  clientId?: string;
  startTime: string;
  endTime: string;
  location?: string;
  description?: string;
  status: "scheduled" | "confirmed" | "completed" | "cancelled" | "no-show";
  price?: number; // Добавляем поле price если его нет
}

export interface EventFilter {
  trainerId?: string;
  clientId?: string;
  status?: ScheduleEvent['status'];
  type?: ScheduleEvent['type'];
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface TimeSlot {
  start: string;
  end: string;
  available: boolean;
  trainerId?: string;
  eventId?: string;
}

export interface WorkingHours {
  start: string;
  end: string;
  days: number[];
}

// Дополнительные типы для расширенной функциональности
export interface EventTemplate {
  id: string;
  name: string;
  description: string;
  template: Omit<CreateEventData, 'startTime' | 'endTime' | 'trainerId'>;
  category: string;
}

export interface ScheduleNotification {
  id: string;
  eventId: string;
  type: 'upcoming' | 'overdue' | 'reminder';
  message: string;
  timestamp: Date;
  read: boolean;
}

export interface TrainerAvailability {
  trainerId: string;
  date: Date;
  slots: TimeSlot[];
  workingHours: WorkingHours;
}

export interface ScheduleConflict {
  event1: ScheduleEvent;
  event2: ScheduleEvent;
  type: 'overlap' | 'back-to-back';
  severity: 'low' | 'medium' | 'high';
}

export interface BulkActionResult {
  eventId: string;
  success: boolean;
  error?: any;
}

export interface ScheduleExportData {
  events: ScheduleEvent[];
  trainers: TrainerSchedule[];
  exportDate: string;
  format: 'csv' | 'json' | 'ics';
}

export interface AutoScheduleOptions {
  duration: number;
  trainerId?: string;
  preferredDate?: Date;
  timePreferences?: {
    earliestHour: number;
    latestHour: number;
  };
}

export interface OptimalSlot {
  trainerId: string;
  trainerName: string;
  startTime: Date;
  endTime: Date;
  confidence: number;
}

export interface ScheduleAnalytics {
  period: 'day' | 'week' | 'month' | 'year';
  totalEvents: number;
  statusAnalytics: Record<ScheduleEvent['status'], number>;
  typeAnalytics: Record<ScheduleEvent['type'], number>;
  trainerAnalytics: Array<{
    trainerId: string;
    trainerName: string;
    totalEvents: number;
    completedEvents: number;
    cancelledEvents: number;
    completionRate: number;
    cancellationRate: number;
  }>;
  hourlyAnalytics: Array<{
    hour: number;
    eventCount: number;
    types: Record<string, number>;
  }>;
  dailyAnalytics: Array<{
    date: string;
    eventCount: number;
    completedCount: number;
    cancelledCount: number;
  }>;
  averageEventsPerDay: number;
  peakHour: { hour: number; eventCount: number };
}

// Типы для интеграции с календарями
export interface CalendarIntegration {
  provider: 'google' | 'outlook' | 'ics';
  url: string;
  event: ScheduleEvent;
}

// Типы для уведомлений
export interface NotificationSettings {
  enabled: boolean;
  reminderMinutes: number;
  types: Array<'upcoming' | 'overdue' | 'status_change'>;
  channels: Array<'browser' | 'email' | 'sms'>;
}
