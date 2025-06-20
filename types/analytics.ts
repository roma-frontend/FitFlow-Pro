// types/analytics.ts (обновленная версия)

import { AnalyticsData } from "@/hooks/useAnalytics";

export interface ExtendedAnalyticsData extends AnalyticsData {
  bookings: BookingStats;
  satisfaction: SatisfactionStats;
  trainers: {
    topTrainers: TrainerStats[];
    totalTrainers: number;
    averageRating: number;
    totalEarnings: number;
  };
  performance: PerformanceMetrics;
  peakHours: PeakHoursStats;
  additionalStats: {
    averageCheck: number;
    cancellationRate: number;
    responseTime: string;
    repeatBookings: number;
  };
}

// Ваши существующие интерфейсы
export interface UserStats {
  total: number;
  active: number;
  activityRate: number;
  newInPeriod: number;
  byRole: Record<string, { count: number; active: number }>;
  registrationTrend: Array<{ date: string; count: number }>;
  // Добавляем для фитнес-центра
  previousPeriodNew?: number;
  newClientsGrowth?: number;
  membershipTypes?: Record<string, { count: number; revenue: number }>;
  clientRetentionRate?: number;
}

export interface MonthlyData {
  month: string;
  revenue: number;
  bookings: number;
  clients: number;
}

export interface ProductStats {
  total: number;
  inStock: number;
  lowStock: number;
  outOfStock: number;
  totalValue: number;
  byCategory: Record<string, {
    count: number;
    inStock: number;
    totalValue: number;
    averagePrice: number;
  }>;
  lowStockProducts: Array<{
    id: string;
    name: string;
    currentStock: number;
    minStock: number;
    category: string;
  }>;
  // Добавляем для фитнес-центра
  equipmentStats?: {
    total: number;
    inUse: number;
    maintenance: number;
    broken: number;
  };
  supplementStats?: {
    total: number;
    bestSellers: Array<{ name: string; sales: number }>;
  };
}

export interface RevenueStats {
  total: number;
  growth: number;
  ordersCount: number;
  averageOrderValue: number;
  dailyTrend: Array<{ date: string; amount: number }>;
  topProducts: Array<{ name: string; revenue: number }>;
  // Добавляем для фитнес-центра
  previous?: number;
  membershipRevenue?: number;
  personalTrainingRevenue?: number;
  supplementRevenue?: number;
  monthlyData?: Array<{ month: string; revenue: number; bookings: number; clients: number }>;
}

export interface ActivityStats {
  totalSessions: number;
  averageSessionTime: number;
  pageViews: number;
  bounceRate: number;
  topPages: Array<{ page: string; views: number }>;
  // Добавляем для фитнес-центра
  gymSessions?: number;
  averageWorkoutDuration?: number;
  peakHours?: Array<{ hour: string; sessions: number }>;
}

// Новые интерфейсы для фитнес-центра
export interface TrainerStats {
  id: string;
  name: string;
  monthlyEarnings: number;
  rating: number;
  specialization?: string;
  experience?: number;
  clientsCount?: number;
  sessionsCount?: number;
  availability?: number; // процент доступности
}

export interface BookingStats {
  current: number;
  previous: number;
  growth: number;
  cancellationRate: number;
  repeatBookings: number;
  monthlyData: Array<{ 
    month: string; 
    revenue: number; 
    bookings: number; 
    clients: number;
  }>;
  byService?: Record<string, { count: number; revenue: number }>;
  averageAdvanceBooking?: number; // дни заранее
}

export interface SatisfactionStats {
  current: number;
  previous: number;
  growth: number;
  averageRating: number;
  totalReviews: number;
  distribution: Record<number, number>; // рейтинг -> количество
  npsScore?: number; // Net Promoter Score
  commonComplaints?: Array<{ issue: string; count: number }>;
}

export interface PerformanceMetrics {
  averageLoad: number;
  planCompletion: number;
  clientRetention: number;
  responseTime: string;
  equipmentUtilization: number;
  trainerEfficiency: number;
  energyConsumption?: number;
  maintenanceCosts?: number;
}

export interface PeakHoursStats {
  timeSlots: Array<{
    time: string;
    load: number;
    label: string;
    capacity?: number;
    bookings?: number;
  }>;
  busiestHour: string;
  averageLoad: number;
  weeklyPattern?: Record<string, number>; // день недели -> загрузка
  seasonalTrends?: Array<{ month: string; averageLoad: number }>;
}

export interface ClassStats {
  id: string;
  name: string;
  instructor: string;
  averageAttendance: number;
  capacity: number;
  utilizationRate: number;
  rating: number;
  revenue: number;
  waitingList?: number;
}

export interface MembershipStats {
  type: string;
  count: number;
  revenue: number;
  averageDuration: number; // месяцы
  churnRate: number; // процент оттока
  upgradeRate?: number; // процент апгрейдов
}

// Расширенный интерфейс аналитики
export interface FitnessAnalyticsData extends AnalyticsData {
  trainers: {
    topTrainers: TrainerStats[];
    totalTrainers: number;
    averageRating: number;
    totalEarnings: number;
    averageExperience?: number;
  };
  bookings: BookingStats;
  satisfaction: SatisfactionStats;
  performance: PerformanceMetrics;
  peakHours: PeakHoursStats;
  classes?: {
    total: number;
    mostPopular: ClassStats[];
    averageUtilization: number;
    totalRevenue: number;
  };
  memberships?: {
    total: number;
    byType: MembershipStats[];
    averageValue: number;
    renewalRate: number;
  };
  facilities?: {
    totalArea: number; // кв.м
    utilizationRate: number;
    maintenanceScheduled: number;
    energyEfficiency: number;
  };
}

// Обновленные типы периодов
export type AnalyticsPeriod = 'day' | 'week' | 'month' | 'quarter' | 'year';
export type AnalyticsTab = 'overview' | 'users' | 'products' | 'activity' | 'trainers' | 'bookings' | 'performance';

// Метрики для дашборда
export interface DashboardMetric {
  title: string;
  value: string | number;
  change: number;
  changeLabel: string;
  icon: string;
  color: 'green' | 'blue' | 'purple' | 'orange' | 'red' | 'yellow';
  trend?: 'up' | 'down' | 'stable';
  target?: number; // целевое значение
}

// Интерфейсы для компонентов (обновленные)
export interface BaseComponentProps {
  loading?: boolean;
  error?: string | null;
  className?: string;
}

export interface MetricsOverviewProps extends BaseComponentProps {
  userStats: UserStats | undefined;
  productStats: ProductStats | undefined;
  revenueStats: RevenueStats | undefined;
  // Добавляем фитнес-метрики
  bookingStats?: BookingStats | undefined;
  satisfactionStats?: SatisfactionStats | undefined;
}

export interface ActivityTabProps extends BaseComponentProps {
  analytics: FitnessAnalyticsData | undefined;
  userStats: UserStats | undefined;
  peakHoursStats?: PeakHoursStats | undefined;
}

export interface ProductsTabProps extends BaseComponentProps {
  productStats: ProductStats | undefined;
  equipmentStats?: ProductStats['equipmentStats'];
}

export interface UsersTabProps extends BaseComponentProps {
  userStats: UserStats | undefined;
  membershipStats?: MembershipStats[] | undefined;
}

export interface OverviewTabProps extends BaseComponentProps {
  revenueStats: RevenueStats | undefined;
  analytics: FitnessAnalyticsData | undefined;
  dashboardMetrics?: DashboardMetric[];
}

// Новые компоненты для фитнес-центра
export interface TrainersTabProps extends BaseComponentProps {
  trainerStats: TrainerStats[] | undefined;
  performanceMetrics: PerformanceMetrics | undefined;
}

export interface BookingsTabProps extends BaseComponentProps {
  bookingStats: BookingStats | undefined;
  classStats?: ClassStats[] | undefined;
}

export interface PerformanceTabProps extends BaseComponentProps {
  performanceMetrics: PerformanceMetrics | undefined;
  peakHoursStats: PeakHoursStats | undefined;
  facilitiesStats?: FitnessAnalyticsData['facilities'];
}

// Типы для фильтров и настроек
export interface AnalyticsFilters {
  period: AnalyticsPeriod;
  dateRange?: {
    start: Date;
    end: Date;
  };
  trainerId?: string;
  serviceType?: string;
  membershipType?: string;
  location?: string;
}

export interface ExportOptions {
  format: 'csv' | 'pdf' | 'excel';
  includeCharts: boolean;
  sections: string[];
  dateRange: {
    start: Date;
    end: Date;
  };
}

// Типы для уведомлений и алертов
export interface AnalyticsAlert {
  id: string;
  type: 'warning' | 'error' | 'info' | 'success';
  title: string;
  message: string;
  metric: string;
  threshold: number;
  currentValue: number;
  timestamp: Date;
  acknowledged: boolean;
}

// Типы для целей и KPI
export interface KPITarget {
  metric: string;
  target: number;
  current: number;
  period: AnalyticsPeriod;
  unit: string;
  status: 'on-track' | 'behind' | 'exceeded';
}

// Типы для сравнения периодов
export interface PeriodComparison {
  current: {
    period: string;
    value: number;
  };
  previous: {
    period: string;
    value: number;
  };
  change: {
    absolute: number;
    percentage: number;
    trend: 'up' | 'down' | 'stable';
  };
}

// Типы для прогнозирования
export interface ForecastData {
  metric: string;
  historical: Array<{ date: string; value: number }>;
  forecast: Array<{ date: string; value: number; confidence: number }>;
  accuracy: number;
}

// Типы для сегментации клиентов
export interface ClientSegment {
  name: string;
  count: number;
  percentage: number;
  averageRevenue: number;
  characteristics: string[];
  trend: 'growing' | 'stable' | 'declining';
}

// Расширенные типы для отчетов
export interface ReportConfig {
  id: string;
  name: string;
  description: string;
  sections: string[];
  filters: AnalyticsFilters;
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    recipients: string[];
    format: 'pdf' | 'excel';
  };
  createdAt: Date;
  updatedAt: Date;
}
