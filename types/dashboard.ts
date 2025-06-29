// types/dashboard.ts

export interface UnifiedTrainer {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive' | 'pending';
  activeClients: number;
  rating: number;
  specializations: string[];
  phone: string;
  createdAt: Date;
  updatedAt: Date;
  avatar?: string;
  bio?: string;
  experience?: number;
  certifications?: string[];
}

export interface UnifiedClient {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive' | 'trial' | 'suspended';
  trainerName?: string;
  trainerId?: string;
  totalSessions: number;
  lastVisit: Date;
  membershipType: 'Basic' | 'Premium' | 'VIP' | 'Trial';
  createdAt: Date;
  updatedAt: Date;
  avatar?: string;
  dateOfBirth?: Date;
  emergencyContact?: string;
  medicalNotes?: string;
  goals?: string[];
}

// types/dashboard.ts (продолжение)

export interface UnifiedEvent {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
  type: 'personal' | 'group' | 'consultation' | 'assessment';
  trainerName: string;
  trainerId: string;
  clientName?: string;
  clientId?: string;
  price?: number;
  createdAt: Date;
  updatedAt: Date;
  description?: string;
  location?: string;
  maxParticipants?: number;
  currentParticipants?: number;
  equipment?: string[];
  notes?: string;
}

export interface DashboardStats {
  trainers: {
    total: number;
    active: number;
    inactive: number;
  };
  clients: {
    total: number;
    active: number;
    trial: number;
    inactive: number;
  };
  workouts: {
    today: number;
    total: number;
    thisWeek: number;
    thisMonth: number;
  };
  revenue: {
    thisMonth: number;
    lastMonth: number;
    growth: number;
    total: number;
  };
}

export interface Analytics {
  revenue: {
    total: number;
    thisMonth: number;
    lastMonth: number;
    growth: number;
    averageCheck: number;
    monthlyData: Array<{
      month: string;
      amount: number;
    }>;
  };
  workouts: {
    total: number;
    completed: number;
    cancelled: number;
    noShows: number;
    weeklyDistribution: Array<{
      day: string;
      count: number;
    }>;
  };
  topTrainers: Array<{
    id: string;
    name: string;
    clients: number;
    revenue: number;
    rating: number;
  }>;
  clientRetention: {
    rate: number;
    newClients: number;
    lostClients: number;
  };
}

export interface SyncStatus {
  isOnline: boolean;
  lastSync: Date | null;
  retryCount: number;
  error: string | null;
}

export interface UseDashboardDataReturn {
  trainers: UnifiedTrainer[];
  clients: UnifiedClient[];
  events: UnifiedEvent[];
  stats: DashboardStats;
  analytics: Analytics | null;
  loading: boolean;
  error: string | null;
  syncAllData: () => Promise<void>;
  refreshStats: () => Promise<void>;
}

// Типы для фильтрации и поиска
export interface FilterOptions {
  status?: string[];
  role?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  trainerIds?: string[];
  clientIds?: string[];
}

export interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
}

export interface PaginationOptions {
  page: number;
  limit: number;
}

// Типы для экспорта данных
export interface ExportOptions {
  format: 'csv' | 'json' | 'xlsx';
  columns?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  filters?: FilterOptions;
}

// Типы для уведомлений
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  actionText?: string;
}

// Типы для разрешений
export interface Permission {
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete';
  conditions?: Record<string, any>;
}

export interface UserPermissions {
  currentRole: 'admin' | 'manager' | 'trainer' | 'client';
  currentUserId: string;
  permissions: Permission[];
  isAdmin: () => boolean;
  canAccess: (resource: string, action: string, resourceId?: string) => boolean;
}

// Типы для API ответов
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

// Типы для форм
export interface TrainerFormData {
  name: string;
  email: string;
  phone: string;
  role: string;
  specializations: string[];
  bio?: string;
  experience?: number;
  certifications?: string[];
}

export interface ClientFormData {
  name: string;
  email: string;
  phone: string;
  membershipType: string;
  trainerId?: string;
  dateOfBirth?: Date;
  emergencyContact?: string;
  medicalNotes?: string;
  goals?: string[];
}

export interface EventFormData {
  title: string;
  startTime: Date;
  endTime: Date;
  type: string;
  trainerId: string;
  clientId?: string;
  price?: number;
  description?: string;
  location?: string;
  maxParticipants?: number;
  equipment?: string[];
}

// Типы для настроек
export interface SystemSettings {
  general: {
    siteName: string;
    timezone: string;
    language: string;
    currency: string;
  };
  business: {
    workingHours: {
      start: string;
      end: string;
    };
    workingDays: string[];
    sessionDuration: number;
    cancellationPolicy: number; // часы до тренировки
  };
  notifications: {
    emailEnabled: boolean;
    smsEnabled: boolean;
    reminderTime: number; // часы до тренировки
    confirmationRequired: boolean;
  };
  payments: {
    currency: string;
    taxRate: number;
    acceptedMethods: string[];
  };
}

// Типы для отчетов
export interface ReportData {
  id: string;
  title: string;
  type: 'revenue' | 'attendance' | 'trainer-performance' | 'client-retention';
  dateRange: {
    start: Date;
    end: Date;
  };
  data: any[];
  generatedAt: Date;
  generatedBy: string;
}

export interface RevenueReport {
  totalRevenue: number;
  averageSessionPrice: number;
  topServices: Array<{
    service: string;
    revenue: number;
    sessions: number;
  }>;
  monthlyBreakdown: Array<{
    month: string;
    revenue: number;
    sessions: number;
  }>;
  trainerBreakdown: Array<{
    trainerId: string;
    trainerName: string;
    revenue: number;
    sessions: number;
  }>;
}

export interface AttendanceReport {
  totalSessions: number;
  completedSessions: number;
  cancelledSessions: number;
  noShowSessions: number;
  attendanceRate: number;
  peakHours: Array<{
    hour: number;
    sessions: number;
  }>;
  weeklyDistribution: Array<{
    day: string;
    sessions: number;
  }>;
}

// Типы для интеграций
export interface Integration {
  id: string;
  name: string;
  type: 'payment' | 'calendar' | 'email' | 'sms' | 'analytics';
  status: 'active' | 'inactive' | 'error';
  config: Record<string, any>;
  lastSync?: Date;
  error?: string;
}

// Типы для аудита
export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  resourceId: string;
  details: Record<string, any>;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
}

// Типы для бэкапа
export interface BackupInfo {
  id: string;
  type: 'manual' | 'automatic';
  status: 'in-progress' | 'completed' | 'failed';
  size: number;
  createdAt: Date;
  completedAt?: Date;
  error?: string;
  downloadUrl?: string;
}

// Типы для мониторинга системы
export interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  uptime: number;
  cpu: {
    usage: number;
    cores: number;
  };
  memory: {
    used: number;
    total: number;
    usage: number;
  };
  disk: {
    used: number;
    total: number;
    usage: number;
  };
  database: {
    status: 'connected' | 'disconnected';
    responseTime: number;
    connections: number;
  };
  services: Array<{
    name: string;
    status: 'running' | 'stopped' | 'error';
    uptime: number;
  }>;
  lastCheck: Date;
}

// Типы для конфигурации
export interface AppConfig {
  version: string;
  environment: 'development' | 'staging' | 'production';
  features: {
    realTimeUpdates: boolean;
    advancedAnalytics: boolean;
    multiLanguage: boolean;
    mobileApp: boolean;
    integrations: boolean;
  };
  limits: {
    maxTrainers: number;
    maxClients: number;
    maxSessionsPerDay: number;
    storageLimit: number; // в MB
  };
  security: {
    sessionTimeout: number; // в минутах
    passwordPolicy: {
      minLength: number;
      requireUppercase: boolean;
      requireNumbers: boolean;
      requireSpecialChars: boolean;
    };
    twoFactorAuth: boolean;
    ipWhitelist: string[];
  };
}

