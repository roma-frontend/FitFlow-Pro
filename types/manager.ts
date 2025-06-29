// types/manager.ts

// ✅ Основные статистики менеджера
export interface ManagerStats {
  // ✅ Основные метрики тренеров
  totalTrainers: number;
  activeTrainers: number;
  newTrainers: number;
  pendingTrainers: number;
  
  // ✅ Метрики клиентов
  totalClients: number;
  activeClients: number;
  newClients: number;
  
  // ✅ Метрики записей
  totalBookings: number;
  todayBookings: number;
  weekBookings: number;
  monthBookings: number;
  
  // ✅ Финансовые метрики
  todayRevenue: number;
  weekRevenue: number;
  monthlyRevenue: number;
  totalRevenue: number;
  
  // ✅ Дополнительные метрики
  averageRating: number;
  completedSessions: number;
  cancelledSessions: number;
  
  // ✅ Метрики роста
  clientGrowthRate: number;
  revenueGrowthRate: number;
  trainerGrowthRate: number;
}

export interface ManagerNavigationItem {
  href: string;
  label: string;
  icon: any;
  badge?: string;
  category: string;
  description?: string;
}

// ✅ Статистика тренеров для менеджера
export interface TrainerManagementStats {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  clientsCount: number;
  workoutsThisWeek: number;
  revenue: number;
  rating: number;
  joinedAt: string;
  lastActive: string;
}

// ✅ Финансовая статистика
export interface RevenueStats {
  period: 'day' | 'week' | 'month' | 'year';
  amount: number;
  currency: string;
  growth: number;
  transactions: number;
  avgTransactionValue: number;
}

// ✅ Системная статистика
export interface SystemStats {
  activeUsers: number;
  totalUsers: number;
  serverLoad: number;
  uptime: number;
  errorRate: number;
  responseTime: number;
  storageUsed: number;
  storageTotal: number;
}

// ✅ Аналитика клиентов
export interface ClientAnalytics {
  totalClients: number;
  activeClients: number;
  newThisMonth: number;
  churnRate: number;
  avgSessionDuration: number;
  mostActiveHours: number[];
  retentionRate: number;
}

// ✅ Аналитика тренировок
export interface WorkoutAnalytics {
  totalWorkouts: number;
  completedWorkouts: number;
  cancelledWorkouts: number;
  avgDuration: number;
  popularWorkoutTypes: string[];
  peakHours: number[];
  completionRate: number;
}

// ✅ Уведомления менеджера
export interface ManagerNotification {
  id: string;
  type: 'trainer_application' | 'system_alert' | 'revenue_milestone' | 'client_feedback' | 'error';
  title: string;
  message: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  isRead: boolean;
  createdAt: string;
  actionRequired: boolean;
  relatedId?: string;
}

// ✅ Настройки менеджера
export interface ManagerSettings {
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    trainerApplications: boolean;
    systemAlerts: boolean;
    revenueUpdates: boolean;
  };
  dashboard: {
    defaultView: 'overview' | 'trainers' | 'clients' | 'revenue';
    refreshInterval: number;
    showAdvancedMetrics: boolean;
  };
  permissions: {
    canManageTrainers: boolean;
    canViewFinancials: boolean;
    canModifySettings: boolean;
    canAccessAnalytics: boolean;
  };
}

// ✅ Профиль менеджера
export interface ManagerProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'manager' | 'admin' | 'super_admin';
  department?: string;
  permissions: string[];
  settings: ManagerSettings;
  createdAt: string;
  lastLogin: string;
  isActive: boolean;
}

// ✅ Данные дашборда менеджера
export interface ManagerDashboardData {
  stats: ManagerStats;
  recentTrainers: TrainerManagementStats[];
  revenueStats: RevenueStats[];
  systemHealth: SystemStats;
  notifications: ManagerNotification[];
  clientAnalytics: ClientAnalytics;
  workoutAnalytics: WorkoutAnalytics;
}

// ✅ Фильтры для отчетов
export interface ReportFilters {
  dateRange: {
    start: string;
    end: string;
  };
  trainers?: string[];
  clients?: string[];
  workoutTypes?: string[];
  status?: string[];
}

// ✅ Экспорт данных
export interface ExportData {
  type: 'trainers' | 'clients' | 'revenue' | 'workouts' | 'full_report';
  format: 'csv' | 'xlsx' | 'pdf';
  filters: ReportFilters;
  includeCharts: boolean;
}

// ✅ Ответы API
export interface ManagerApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
  timestamp: string;
}

// ✅ Состояние загрузки для менеджера
export interface ManagerLoadingState {
  isLoading: boolean;
  loadingStep: string;
  progress: number;
  error: string | null;
}

// ✅ Действия менеджера
export interface ManagerAction {
  type: 'approve_trainer' | 'suspend_trainer' | 'send_notification' | 'generate_report' | 'update_settings';
  targetId: string;
  payload?: any;
  reason?: string;
}

// ✅ Метрики производительности
export interface PerformanceMetrics {
  trainerEfficiency: number;
  clientSatisfaction: number;
  revenueGrowth: number;
  systemReliability: number;
  userEngagement: number;
}
