export interface Trainer {
  id: string;
  _id?: string;
  name: string;
  email: string;
  phone: string;
  specialization: string[];
  experience?: number;
  hourlyRate?: number;
  certifications?: string[];
  bio?: string;
  avatar?: string;
  rating?: number;
  isActive?: boolean;
  status?: "active" | "busy" | "inactive" | "vacation";
  activeClients?: number;
  totalSessions?: number;
  createdAt?: number;
  _creationTime?: number;
  totalClients?: number;
  monthlyEarnings?: number;
  workingHours?: {
    start: string;
    end: string;
    days: string[];
  };
  nextSession?: {
    time: string;
    client: string;
  };
}

export interface WorkingHours {
  start: string;
  end: string;
  days: string[];
}

export interface NextSession {
  time: string;
  client: string;
}

// Интерфейс для фильтров тренеров (базовый)
export interface TrainerFiltersBasic {
  searchTerm: string;
  statusFilter: string;
  specializationFilter: string;
}

// Интерфейс для расширенных фильтров
export interface TrainerFiltersAdvanced {
  search?: string;
  status?: string;
  specialization?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
  experienceRange?: [number, number];
  ratingRange?: [number, number];
  hourlyRateRange?: [number, number];
}

// Статистика для страницы управления тренерами
export interface TrainerPageStats {
  totalTrainers: number;
  activeTrainers: number;
  busyTrainers: number;
  averageRating: number;
}

// Детальная статистика тренеров
export interface TrainerStatsDetailed {
  total: number;
  fromTrainersTable: number;
  fromUsersTable: number;
  activeTrainers: number;
  specializations: Record<string, number>;
  averageRating: number;
}

// Системная статистика (для дашборда)
export interface SystemStats {
  activeClients: number;
  totalClients: number;
  activeMembers: number;
  totalMembers: number;
  completedWorkouts: number;
  avgRating: number;
  totalTrainers: number;
  totalUsers: number;
}

export interface Member {
  id: string;
  _id?: string;
  name: string;
  email?: string;
  phone: string;
  status: string;
  membershipExpiry?: number;
  membershipType?: string;
  joinDate?: number;
  createdAt?: number;
  lastVisit?: number;
  trainerId?: string;
}

export interface Client {
  id: string;
  _id?: string;
  name: string;
  email: string;
  phone: string;
  status: "active" | "trial" | "inactive";
  joinDate: string;
  trainerId?: string;
  trainerName?: string;
  totalWorkouts?: number;
  progress?: number;
  lastWorkout?: string;
  goals?: string[];
  createdAt?: number;
  _creationTime?: number;
}

export interface Workout {
  id?: string;
  _id?: string;
  trainerId: string;
  userId: string;
  clientName?: string;
  userName?: string;
  type?: "personal" | "group" | "cardio" | "strength" | "yoga" | "pilates" | "crossfit";
  status: "scheduled" | "in-progress" | "completed" | "cancelled" | "missed";
  date?: string;
  time?: string;
  scheduledDate?: string;
  scheduledTime?: string;
  duration?: number;
  location?: string;
  notes?: string;
  price?: number;
  cancellationReason?: string;
  completedAt?: string;
  createdAt?: string;
  _creationTime?: number;
}

export interface UserBooking {
  id?: string;
  _id?: string;
  userId: string;
  trainerId: string;
  userName?: string;
  trainerName?: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  status: "scheduled" | "in-progress" | "completed" | "cancelled" | "missed";
  type?: string;
  location?: string;
  notes?: string;
  price?: number;
  createdAt?: string;
  _creationTime?: number;
}

export interface MessageStats {
  unreadMessages: number;
  todayMessages: number;
  totalMessages: number;
  messagesByType: {
    direct: number;
    group: number;
    announcement: number;
    notification: number;
  };
  messagesByPriority: {
    urgent: number;
    high: number;
    normal: number;
    low: number;
  };
}

export interface WorkoutStats {
  todayWorkouts: number;
  thisWeekWorkouts: number;
  scheduledWorkouts: number;
  completedWorkouts: number;
  cancelledWorkouts: number;
  totalWorkouts: number;
  workoutsByType: Record<string, number>;
  averageDuration: number;
}

export interface MemberStats {
  total: number;
  active: number;
  inactive: number;
  expiringSoon: number;
  newThisMonth: number;
  membershipTypes: Record<string, number>;
  retention?: number;
}

export interface ClientStats {
  total: number;
  active: number;
  trial: number;
  inactive: number;
  newThisMonth: number;
  retention: number;
}

export interface Message {
  id: string;
  _id?: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: number;
  senderName: string;
  attachments: string | [];
  status?: 'sent' | 'delivered' | 'read';
  type?: 'direct' | 'group' | 'announcement' | 'notification';
  priority?: 'normal' | 'urgent' | 'high' | 'low';
  readAt?: Record<string, number>;
  createdAt?: string;
  _creationTime?: number;
}

export interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  pages: number;
  hasMore: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface TrainersApiResponse {
  success: boolean;
  data: Trainer[];
  pagination: PaginationInfo;
  stats: {
    active: number;
    inactive: number;
    suspended: number;
    specializations: string[];
  };
}

export interface CreateTrainerData {
  name: string;
  email: string;
  phone: string;
  specialization: string[];
  experience: number;
  hourlyRate: number;
  certifications: string[];
  bio: string;
  avatar: string;
}

export interface UpdateWorkoutData {
  clientName?: string;
  type?: string;
  status?: "scheduled" | "in-progress" | "completed" | "cancelled" | "missed";
  date?: string;
  time?: string;
  duration?: number;
  location?: string;
  notes?: string;
  price?: number;
  cancellationReason?: string;
}

export interface Notification {
  id: string;
  type: 'warning' | 'info' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: number;
  urgent: boolean;
  read?: boolean;
}

export interface RevenueStats {
  total: number;
  average: number;
  growth: number;
  currentPeriodSessions: number;
  previousPeriodSessions: number;
  isLoading: boolean;
}

export interface TopTrainerStats extends Trainer {
  totalWorkouts: number;
  completedWorkouts: number;
  revenue: number;
  averageRating: number;
  completionRate: number;
}

export interface TopTrainersData {
  topByRevenue: TopTrainerStats[];
  topByRating: TopTrainerStats[];
  topByWorkouts: TopTrainerStats[];
  isLoading: boolean;
}

export interface ScheduleSession {
  id: string;
  type: 'workout' | 'booking';
  time: number;
  clientName: string;
  timeFormatted: string;
  status: string;
  duration?: number;
  location?: string;
  notes?: string;
  price?: number;
}

export interface TodaySchedule {
  sessions: ScheduleSession[];
  total: number;
  completed: number;
  scheduled: number;
  cancelled: number;
  inProgress: number;
}

export interface MonthlyStatsData {
  month: number;
  monthName: string;
  workouts: number;
  bookings: number;
  totalSessions: number;
  newMembers: number;
  newClients: number;
  completedSessions: number;
  revenue: number;
}

export interface SearchResult {
  results: any[];
  total: number;
  isLoading: boolean;
}

export interface WorkoutTypeStats {
  byType: Record<string, number>;
  byStatus: Record<string, number>;
  totalRevenue: number;
  averagePrice: number;
  isLoading: boolean;
}

// НОВЫЕ ТИПЫ ДЛЯ РАСШИРЕННОЙ ФУНКЦИОНАЛЬНОСТИ

// Типы для продвинутой аналитики
export interface TrainerPerformanceMetrics {
  trainer: Trainer;
  current: {
    revenue: number;
    sessions: number;
    completionRate: number;
    cancellationRate: number;
    averageSessionValue: number;
    clientSatisfaction: number;
  };
  previous: {
    revenue: number;
    sessions: number;
    completionRate: number;
  };
  trends: {
    revenueGrowth: number;
    sessionGrowth: number;
    completionRateChange: number;
  };
}

// Типы для расширенных фильтров
export interface AdvancedFilterConfig {
  trainers?: {
    status?: string[];
    specialization?: string[];
    experienceRange?: [number, number];
    ratingRange?: [number, number];
    hourlyRateRange?: [number, number];
    certifications?: string[];
    availability?: 'available' | 'busy' | 'any';
  };
  members?: {
    status?: string[];
    membershipType?: string[];
    expiryRange?: [number, number];
    trainerIds?: string[];
    lastVisitRange?: [number, number];
  };
  clients?: {
    status?: string[];
    trainerIds?: string[];
    joinDateRange?: [number, number];
    progressRange?: [number, number];
    goals?: string[];
  };
  workouts?: {
    status?: string[];
    type?: string[];
    trainerIds?: string[];
    dateRange?: [number, number];
    priceRange?: [number, number];
    duration?: [number, number];
    location?: string[];
  };
}

// Типы для сортировки
export interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
  type: 'trainers' | 'members' | 'clients' | 'workouts';
}

// Типы для экспорта данных
export interface ExportConfig {
  format: 'csv' | 'xlsx' | 'pdf';
  fields: string[];
  filters?: AdvancedFilterConfig;
  dateRange?: [number, number];
}

// Типы для прогнозирования
export interface PredictionData {
  revenue: {
    nextMonth: number;
    nextQuarter: number;
    confidence: number;
  };
  sessions: {
    nextMonth: number;
    nextQuarter: number;
    confidence: number;
  };
  clientGrowth: {
    nextMonth: number;
    nextQuarter: number;
    confidence: number;
  };
}

// Типы для сравнения тренеров
export interface TrainerComparison {
  trainers: Trainer[];
  metrics: {
    revenue: number[];
    sessions: number[];
    ratings: number[];
    completionRates: number[];
    clientCounts: number[];
  };
  period: 'week' | 'month' | 'quarter' | 'year';
}

// Типы для уведомлений и алертов
export interface Alert {
  id: string;
  type: 'membership_expiry' | 'low_rating' | 'missed_sessions' | 'revenue_drop' | 'system';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  data?: any;
  timestamp: number;
  acknowledged?: boolean;
  actionRequired?: boolean;
}

// Типы для настроек дашборда
export interface DashboardConfig {
  layout: {
    widgets: Array<{
      id: string;
      type: string;
      position: { x: number; y: number; w: number; h: number };
      config?: any;
    }>;
  };
  preferences: {
    theme: 'light' | 'dark';
    autoRefresh: boolean;
    refreshInterval: number;
    notifications: boolean;
  };
}

// Типы для отчетов
export interface ReportConfig {
  id: string;
  name: string;
  type: 'trainer_performance' | 'revenue' | 'client_activity' | 'workout_analysis';
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    time: string;
    recipients: string[];
  };
  filters: AdvancedFilterConfig;
  format: 'pdf' | 'excel' | 'email';
}

// Типы для интеграций
export interface Integration {
  id: string;
  name: string;
  type: 'payment' | 'calendar' | 'email' | 'sms' | 'analytics';
  status: 'active' | 'inactive' | 'error';
  config: Record<string, any>;
  lastSync?: number;
}

// Типы для аудита
export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  resourceId: string;
  changes?: Record<string, { old: any; new: any }>;
  timestamp: number;
  ip?: string;
  userAgent?: string;
}

// Типы для кэширования
export interface CacheConfig {
  ttl: number;
  key: string;
  tags: string[];
}

// Типы для валидации
export interface ValidationRule {
  field: string;
  type: 'required' | 'email' | 'phone' | 'number' | 'date' | 'custom';
  message: string;
  validator?: (value: any) => boolean;
}

// Типы для состояния загрузки
export interface LoadingState {
  isLoading: boolean;
  progress?: number;
  message?: string;
  error?: string;
}

// Типы для пагинации с курсором
export interface CursorPagination {
  cursor?: string;
  limit: number;
  hasMore: boolean;
  total?: number;
}

// Типы для метрик производительности
export interface PerformanceMetrics {
  responseTime: number;
  throughput: number;
  errorRate: number;
  uptime: number;
  memoryUsage: number;
  cpuUsage: number;
}

// Типы для геолокации
export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  country?: string;
  timezone?: string;
}

// Типы для расписания тренера
export interface TrainerSchedule {
  trainerId: string;
  date: string;
  slots: Array<{
    startTime: string;
    endTime: string;
    isAvailable: boolean;
    isBooked: boolean;
    bookingId?: string;
    clientName?: string;
    workoutType?: string;
    price?: number;
  }>;
  breaks: Array<{
    startTime: string;
    endTime: string;
    reason?: string;
  }>;
}

// Типы для уведомлений в реальном времени
export interface RealtimeNotification {
  id: string;
  type: 'booking' | 'cancellation' | 'message' | 'payment' | 'system';
  title: string;
  body: string;
  data?: Record<string, any>;
  timestamp: number;
  read: boolean;
  userId: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
}

// Типы для платежей
export interface Payment {
  id: string;
  userId: string;
  trainerId?: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  method: 'card' | 'cash' | 'transfer' | 'subscription';
  description: string;
  createdAt: number;
  processedAt?: number;
  refundedAt?: number;
  metadata?: Record<string, any>;
}

// Типы для подписок
export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  status: 'active' | 'cancelled' | 'expired' | 'paused';
  startDate: number;
  endDate: number;
  autoRenew: boolean;
  price: number;
  currency: string;
  features: string[];
  metadata?: Record<string, any>;
}

// Типы для планов подписки
export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: 'monthly' | 'yearly';
  features: string[];
  limits: {
    trainers?: number;
    clients?: number;
    workouts?: number;
    storage?: number;
  };
  isActive: boolean;
}

// Типы для настроек системы
export interface SystemSettings {
  general: {
    siteName: string;
    siteUrl: string;
    timezone: string;
    language: string;
    currency: string;
  };
  email: {
    provider: string;
    apiKey: string;
    fromEmail: string;
    fromName: string;
  };
  sms: {
    provider: string;
    apiKey: string;
    fromNumber: string;
  };
  payment: {
    providers: Array<{
      name: string;
      apiKey: string;
      isActive: boolean;
    }>;
  };
  security: {
    sessionTimeout: number;
    passwordMinLength: number;
    requireTwoFactor: boolean;
    allowedDomains: string[];
  };
}

// Типы для резервного копирования
export interface BackupConfig {
  id: string;
  name: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  time: string;
  retentionDays: number;
  includeFiles: boolean;
  compression: boolean;
  encryption: boolean;
  destination: 'local' | 's3' | 'google_drive' | 'dropbox';
  isActive: boolean;
}

// Типы для миграций данных
export interface Migration {
  id: string;
  version: string;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startedAt?: number;
  completedAt?: number;
  error?: string;
  rollbackAvailable: boolean;
}

// Типы для API ключей
export interface ApiKey {
  id: string;
  name: string;
  key: string;
  permissions: string[];
  isActive: boolean;
  createdAt: number;
  lastUsedAt?: number;
  expiresAt?: number;
  rateLimit?: {
    requests: number;
    window: number;
  };
}

// Типы для веб-хуков
export interface Webhook {
  id: string;
  url: string;
  events: string[];
  isActive: boolean;
  secret?: string;
  headers?: Record<string, string>;
  retryPolicy: {
    maxRetries: number;
    backoffMultiplier: number;
  };
  createdAt: number;
  lastTriggeredAt?: number;
}

// Типы для логирования
export interface LogEntry {
  id: string;
  level: 'debug' | 'info' | 'warn' | 'error' | 'fatal';
  message: string;
  timestamp: number;
  userId?: string;
  sessionId?: string;
  requestId?: string;
  metadata?: Record<string, any>;
  stack?: string;
}

// Типы для мониторинга
export interface HealthCheck {
  service: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime: number;
  lastChecked: number;
  details?: Record<string, any>;
}

// Типы для A/B тестирования
export interface Experiment {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'running' | 'completed' | 'paused';
  variants: Array<{
    id: string;
    name: string;
    weight: number;
    config: Record<string, any>;
  }>;
  metrics: string[];
  startDate: number;
  endDate?: number;
  results?: Record<string, any>;
}

// Типы для пользовательских ролей и разрешений
export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  isSystem: boolean;
  createdAt: number;
}

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  conditions?: Record<string, any>;
}

// Типы для пользовательских настроек
export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
    inApp: boolean;
  };
  dashboard: {
    layout: string;
    widgets: string[];
  };
  privacy: {
    showProfile: boolean;
    showActivity: boolean;
    allowMessages: boolean;
  };
}

// Типы для файлов и медиа
export interface MediaFile {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  uploadedBy: string;
  uploadedAt: number;
  tags?: string[];
  metadata?: Record<string, any>;
}

// Типы для шаблонов
export interface Template {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'workout' | 'report';
  content: string;
  variables: Array<{
    name: string;
    type: string;
    required: boolean;
    defaultValue?: any;
  }>;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

// Типы для задач в очереди
export interface QueueJob {
  id: string;
  type: string;
  data: Record<string, any>;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'delayed';
  priority: number;
  attempts: number;
  maxAttempts: number;
  createdAt: number;
  processedAt?: number;
  completedAt?: number;
  failedAt?: number;
  error?: string;
  delay?: number;
}

// Типы для конфигурации компонентов
export interface ComponentConfig {
  id: string;
  component: string;
  props: Record<string, any>;
  conditions?: Array<{
    field: string;
    operator: string;
    value: any;
  }>;
  isActive: boolean;
}

// Типы для пользовательских полей
export interface CustomField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'boolean' | 'select' | 'multiselect';
  entity: 'trainer' | 'client' | 'member' | 'workout';
  required: boolean;
  options?: string[];
  validation?: ValidationRule[];
  defaultValue?: any;
  isActive: boolean;
}

// Типы для импорта/экспорта
export interface ImportJob {
  id: string;
  filename: string;
  type: 'trainers' | 'clients' | 'members' | 'workouts';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  totalRows: number;
  processedRows: number;
  successRows: number;
  errorRows: number;
  errors?: Array<{
    row: number;
    field: string;
    message: string;
  }>;
  createdAt: number;
  completedAt?: number;
}

// Типы для календаря
export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startTime: number;
  endTime: number;
  allDay: boolean;
  recurring?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
    endDate?: number;
    exceptions?: number[];
  };
  attendees?: Array<{
    id: string;
    name: string;
    email: string;
    status: 'pending' | 'accepted' | 'declined';
  }>;
  location?: string;
  color?: string;
  metadata?: Record<string, any>;
}

// Типы для чата и сообщений
export interface ChatRoom {
  id: string;
  name?: string;
  type: 'direct' | 'group' | 'support';
  participants: string[];
  lastMessage?: Message;
  unreadCount: Record<string, number>;
  createdAt: number;
  updatedAt: number;
  metadata?: Record<string, any>;
}

// Типы для тегов
export interface Tag {
  id: string;
  name: string;
  color: string;
  category?: string;
  usageCount: number;
  createdAt: number;
}

// Типы для комментариев и отзывов
export interface Review {
  id: string;
  trainerId: string;
  clientId: string;
  rating: number;
  comment?: string;
  workoutId?: string;
  isPublic: boolean;
  createdAt: number;
  updatedAt?: number;
  response?: {
    comment: string;
    createdAt: number;
  };
}

// Типы для целей и достижений
export interface Goal {
  id: string;
  userId: string;
  title: string;
  description?: string;
  type: 'weight_loss' | 'muscle_gain' | 'endurance' | 'strength' | 'custom';
  targetValue: number;
  currentValue: number;
  unit: string;
  deadline?: number;
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  createdAt: number;
  completedAt?: number;
}

// Типы для прогресса
export interface Progress {
  id: string;
  userId: string;
  goalId?: string;
  metric: string;
  value: number;
  unit: string;
  notes?: string;
  recordedAt: number;
  createdAt: number;
}

// Типы для упражнений
export interface Exercise {
  id: string;
  name: string;
  description?: string;
  category: string;
  muscleGroups: string[];
  equipment: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  instructions: string[];
  tips?: string[];
  videoUrl?: string;
  imageUrls?: string[];
  isActive: boolean;
}

// Типы для программ тренировок
export interface WorkoutProgram {
  id: string;
  name: string;
  description?: string;
  trainerId: string;
  duration: number; // в неделях
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  goals: string[];
  workouts: Array<{
    week: number;
    day: number;
    exercises: Array<{
      exerciseId: string;
      sets: number;
      reps: number;
      weight?: number;
      duration?: number;
      restTime?: number;
      notes?: string;
    }>;
  }>;
  isPublic: boolean;
  price?: number;
  rating?: number;
  enrolledCount: number;
  createdAt: number;
  updatedAt: number;
}
