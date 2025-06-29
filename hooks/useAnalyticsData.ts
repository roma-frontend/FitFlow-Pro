// hooks/useAnalyticsData.ts (исправленная версия)
"use client";

import { useMemo } from "react";
import { 
  useUserStats, 
  useProductStats, 
  useRevenueStats,
  useActivityStats,
  useAnalyticsAvailability
} from "@/hooks/useAnalytics";
import { useAnalyticsCache } from "@/hooks/useAnalyticsCache";
import { 
  fetchTrainerStats,
  fetchBookingStats,
  fetchSatisfactionStats,
  fetchPeakHoursStats,
  fetchPerformanceMetrics
} from "@/services/analyticsService";

export function useAnalyticsData(period: string) {
  // Используем правильные хуки
  const { data: userStatsData, loading: userStatsLoading } = useUserStats(period);
  const { data: productStatsData, loading: productStatsLoading } = useProductStats();
  const { data: revenueStatsData, loading: revenueStatsLoading } = useRevenueStats(period);
  const { data: activityStatsData, loading: activityStatsLoading } = useActivityStats(period);
  const { isAvailable } = useAnalyticsAvailability();

  // Кэшированные фитнес-данные
  const { data: trainerStats, loading: trainersLoading } = useAnalyticsCache(
    'trainers', fetchTrainerStats, period
  );
  const { data: bookingStats, loading: bookingsLoading } = useAnalyticsCache(
    'bookings', fetchBookingStats, period
  );
  const { data: satisfactionStats, loading: satisfactionLoading } = useAnalyticsCache(
    'satisfaction', fetchSatisfactionStats, period
  );
  const { data: peakHoursStats, loading: peakHoursLoading } = useAnalyticsCache(
    'peakHours', fetchPeakHoursStats, period
  );
  const { data: performanceMetrics, loading: performanceLoading } = useAnalyticsCache(
    'performance', fetchPerformanceMetrics, period
  );

  // Проверяем загрузку всех данных
  const isLoading = userStatsLoading || productStatsLoading || 
                   revenueStatsLoading || activityStatsLoading ||
                   trainersLoading || bookingsLoading || satisfactionLoading ||
                   peakHoursLoading || performanceLoading;

  // Обрабатываем данные с мемоизацией
  const processedData = useMemo(() => {
    if (isLoading || !userStatsData || !productStatsData || !revenueStatsData || !activityStatsData) {
      return null;
    }

    return {
      // Данные пользователей
      users: {
        total: userStatsData.total || 0,
        active: userStatsData.active || 0,
        activityRate: userStatsData.activityRate || 0,
        newInPeriod: userStatsData.newInPeriod || 0,
        byRole: userStatsData.byRole || {},
        registrationTrend: [] // Добавим позже из API если нужно
      },
      
      // Данные продуктов
      products: {
        total: productStatsData.total || 0,
        inStock: productStatsData.inStock || 0,
        lowStock: productStatsData.lowStock || 0,
        outOfStock: productStatsData.outOfStock || 0,
        totalValue: productStatsData.totalValue || 0,
        byCategory: productStatsData.byCategory || {},
        lowStockProducts: productStatsData.lowStockProducts || []
      },
      
      // Данные доходов
      revenue: {
        total: revenueStatsData.total || 0,
        growth: revenueStatsData.growth || 0,
        ordersCount: revenueStatsData.ordersCount || 0,
        averageOrderValue: revenueStatsData.averageOrderValue || 0,
        dailyTrend: revenueStatsData.dailyTrend || [],
        topProducts: revenueStatsData.topProducts || [],
        current: revenueStatsData.total || 0,
        previous: revenueStatsData.previousPeriod?.revenue || 0
      },
      
      // Данные активности
      activity: {
        totalSessions: activityStatsData.totalSessions || 0,
        averageSessionTime: activityStatsData.averageSessionTime || 0,
        pageViews: activityStatsData.pageViews || 0,
        bounceRate: activityStatsData.bounceRate || 0,
        topPages: activityStatsData.topPages || []
      },
      
      // Фитнес-данные
      bookings: {
        current: bookingStats?.current || 0,
        previous: bookingStats?.previous || 0,
        growth: bookingStats?.growth || 0,
        cancellationRate: bookingStats?.cancellationRate || 0,
        repeatBookings: bookingStats?.repeatBookings || 0,
        monthlyData: bookingStats?.monthlyData || []
      },
      
      // Новые клиенты
      newClients: {
        current: userStatsData.newInPeriod || 0,
        previous: 0, // Можно добавить расчет из предыдущего периода
        growth: 0 // Можно добавить расчет роста
      },
      
      // Удовлетворенность
      satisfaction: {
        current: satisfactionStats?.current || 0,
        previous: satisfactionStats?.previous || 0,
        growth: satisfactionStats?.growth || 0,
        averageRating: satisfactionStats?.averageRating || 0,
        totalReviews: satisfactionStats?.totalReviews || 0,
        distribution: satisfactionStats?.distribution || {}
      },
      
      // Тренеры
      trainers: {
        topTrainers: trainerStats?.topTrainers || [],
        totalTrainers: trainerStats?.total || 0,
        averageRating: trainerStats?.averageRating || 0,
        totalEarnings: trainerStats?.totalEarnings || 0
      },
      
      // Производительность
      performance: {
        averageLoad: performanceMetrics?.averageLoad || 0,
        planCompletion: performanceMetrics?.planCompletion || 0,
        clientRetention: performanceMetrics?.clientRetention || 0,
        responseTime: performanceMetrics?.responseTime || '0ч',
        equipmentUtilization: performanceMetrics?.equipmentUtilization || 0,
        trainerEfficiency: performanceMetrics?.trainerEfficiency || 0,
        energyConsumption: performanceMetrics?.energyConsumption || 0,
        maintenanceCosts: performanceMetrics?.maintenanceCosts || 0
      },
      
      // Пиковые часы
      peakHours: {
        timeSlots: peakHoursStats?.timeSlots || [],
        busiestHour: peakHoursStats?.busiestHour || '',
        averageLoad: peakHoursStats?.averageLoad || 0
      },
      
      // Дополнительная статистика
      additionalStats: {
        averageCheck: revenueStatsData.averageOrderValue || 0,
        cancellationRate: bookingStats?.cancellationRate || 0,
        responseTime: performanceMetrics?.responseTime || '0ч',
        repeatBookings: bookingStats?.repeatBookings || 0
      }
    };
  }, [
    userStatsData, productStatsData, revenueStatsData, activityStatsData, 
    trainerStats, bookingStats, satisfactionStats, 
    peakHoursStats, performanceMetrics, isLoading
  ]);

  return {
    data: processedData,
    loading: isLoading,
    users: userStatsData,
    products: productStatsData,
    revenue: revenueStatsData,
    activity: activityStatsData,
    trainers: trainerStats,
    bookings: bookingStats,
    satisfaction: satisfactionStats,
    peakHours: peakHoursStats,
    performance: performanceMetrics,
    isAvailable,
    // Методы для управления кэшем
    refreshAll: () => {
      // Здесь можно добавить логику обновления всех данных
      console.log('Refreshing all analytics data...');
    }
  };
}

// Типы для лучшей типизации (опционально)
export interface AnalyticsData {
  users: {
    total: number;
    active: number;
    activityRate: number;
    newInPeriod: number;
    byRole: Record<string, { count: number; active: number }>;
    registrationTrend: Array<{ date: string; count: number }>;
  };
  products: {
    total: number;
    inStock: number;
    lowStock: number;
    outOfStock: number;
    totalValue: number;
    byCategory: Record<string, any>;
    lowStockProducts: Array<any>;
  };
  revenue: {
    total: number;
    growth: number;
    ordersCount: number;
    averageOrderValue: number;
    dailyTrend: Array<{ date: string; amount: number; orders: number }>;
    topProducts: Array<{ name: string; revenue: number }>;
    current: number;
    previous: number;
  };
  activity: {
    totalSessions: number;
    averageSessionTime: number;
    pageViews: number;
    bounceRate: number;
    topPages: Array<{ page: string; views: number }>;
  };
  bookings: {
    current: number;
    previous: number;
    growth: number;
    cancellationRate: number;
    repeatBookings: number;
    monthlyData: Array<any>;
  };
  newClients: {
    current: number;
    previous: number;
    growth: number;
  };
  satisfaction: {
    current: number;
    previous: number;
    growth: number;
    averageRating: number;
    totalReviews?: number;
    distribution?: Record<string, number>;
  };
  trainers: {
    topTrainers: Array<any>;
    totalTrainers: number;
    averageRating: number;
    totalEarnings: number;
  };
  performance: {
    averageLoad: number;
    planCompletion: number;
    clientRetention: number;
    responseTime: string;
    equipmentUtilization?: number;
    trainerEfficiency?: number;
    energyConsumption?: number;
    maintenanceCosts?: number;
  };
  peakHours: {
    timeSlots: Array<any>;
    busiestHour: string;
    averageLoad: number;
  };
  additionalStats: {
    averageCheck: number;
    cancellationRate: number;
    responseTime: string;
    repeatBookings: number;
  };
}