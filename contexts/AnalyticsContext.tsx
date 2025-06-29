// contexts/AnalyticsContext.tsx
"use client";

import { createContext, useContext, ReactNode } from 'react';
import { useAnalyticsData as useAnalyticsDataHook } from '@/hooks/useAnalyticsData'; // Переименовываем импорт

interface AnalyticsContextType {
  data: any;
  loading: boolean;
  timeRange: string;
  setTimeRange: (range: string) => void;
  refreshData: () => Promise<void>;
  error: string | null;
  exportData?: (format: 'csv' | 'pdf' | 'excel') => Promise<void>;
  // Добавляем отдельные данные
  users: any;
  products: any;
  revenue: any;
  activity: any;
  trainers: any;
  bookings: any;
  satisfaction: any;
  peakHours: any;
  performance: any;
  isAvailable: boolean;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

export function useAnalytics() {
  const context = useContext(AnalyticsContext);
  if (context === undefined) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
}

interface AnalyticsProviderProps {
  children: ReactNode;
  timeRange?: string;
}

export function AnalyticsProvider({ children, timeRange: initialTimeRange = 'month' }: AnalyticsProviderProps) {
  // Используем ваш существующий хук с переименованным импортом
  const {
    data,
    loading,
    users,
    products,
    revenue,
    activity,
    trainers,
    bookings,
    satisfaction,
    peakHours,
    performance,
    isAvailable
  } = useAnalyticsDataHook(initialTimeRange); // Используем переименованный хук

  const refreshData = async () => {
    // Логика обновления данных
    window.location.reload(); // Временное решение
  };

  const exportData = async (format: 'csv' | 'pdf' | 'excel') => {
    try {
      console.log(`Экспорт данных в формате ${format} для периода ${initialTimeRange}`);
      
      // Здесь будет реальная логика экспорта
      const response = await fetch('/api/analytics/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          format,
          timeRange: initialTimeRange,
          data
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `analytics-${initialTimeRange}-${Date.now()}.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Export error:', err);
    }
  };

  const setTimeRange = (range: string) => {
    // Для изменения периода нужно будет перезагрузить компонент с новым периодом
    // Или реализовать state management на уровне выше
    console.log('Changing time range to:', range);
  };

  const value: AnalyticsContextType = {
    data,
    loading,
    timeRange: initialTimeRange,
    setTimeRange,
    refreshData,
    error: null, // Добавьте обработку ошибок в ваш хук useAnalyticsData
    exportData,
    users,
    products,
    revenue,
    activity,
    trainers,
    bookings,
    satisfaction,
    peakHours,
    performance,
    isAvailable
  };

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
}

// Упрощенные хуки для доступа к данным (переименовываем чтобы избежать конфликта)
export function useAnalyticsContextData() {
  const { data } = useAnalytics();
  return data;
}

export function useAnalyticsLoading() {
  const { loading } = useAnalytics();
  return loading;
}

export function useAnalyticsError() {
  const { error } = useAnalytics();
  return error;
}

export function useAnalyticsActions() {
  const { refreshData, exportData, setTimeRange } = useAnalytics();
  return { refreshData, exportData, setTimeRange };
}

// Селекторы для конкретных данных
export function useRevenueData() {
  const { revenue } = useAnalytics();
  return revenue;
}

export function useBookingsData() {
  const { bookings } = useAnalytics();
  return bookings;
}

export function useTrainersData() {
  const { trainers } = useAnalytics();
  return trainers;
}

export function usePerformanceData() {
  const { performance } = useAnalytics();
  return performance;
}

export function useSatisfactionData() {
  const { satisfaction } = useAnalytics();
  return satisfaction;
}

export function usePeakHoursData() {
  const { peakHours } = useAnalytics();
  return peakHours;
}

// Хук для получения метрик в удобном формате для дашборда
export function useMetricsForDashboard() {
  const { data, revenue, bookings, users, satisfaction } = useAnalytics();
  
  if (!data) return null;
  
  return {
    revenue: {
      current: revenue?.total || 0,
      previous: revenue?.previous || 0,
      growth: revenue?.growth || 0
    },
    bookings: {
      current: bookings?.current || 0,
      previous: bookings?.previous || 0,
      growth: bookings?.growth || 0
    },
    newClients: {
      current: users?.newInPeriod || 0,
      previous: users?.previousPeriodNew || 0,
      growth: users?.newClientsGrowth || 0
    },
    satisfaction: {
      current: satisfaction?.current || 0,
      previous: satisfaction?.previous || 0,
      growth: satisfaction?.growth || 0
    },
    additionalStats: {
      averageCheck: revenue?.averageOrderValue || 0,
      cancellationRate: bookings?.cancellationRate || 0,
      responseTime: '1.2ч', // Из performance данных
      repeatBookings: bookings?.repeatBookings || 0
    }
  };
}

// Хук для получения данных графиков
export function useChartData() {
  const { bookings, revenue, users, peakHours } = useAnalytics();
  
  return {
    monthlyData: bookings?.monthlyData || [],
    dailyRevenue: revenue?.dailyTrend || [],
    registrationTrend: users?.registrationTrend || [],
    peakHours: peakHours?.timeSlots || []
  };
}
