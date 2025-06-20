// contexts/AnalyticsProvider.tsx (продолжение)
"use client";

import { createContext, useContext, useState, ReactNode } from 'react';
import { useAnalyticsData } from '@/hooks/useAnalyticsData';

interface AnalyticsContextType {
  timeRange: string;
  setTimeRange: (range: string) => void;
  refreshing: boolean;
  refresh: () => Promise<void>;
  data: any;
  loading: boolean;
  error: string | null;
  exportData: (format: 'csv' | 'pdf' | 'excel') => Promise<void>;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

export function useAnalyticsContext() {
  const context = useContext(AnalyticsContext);
  if (context === undefined) {
    throw new Error('useAnalyticsContext must be used within an AnalyticsProvider');
  }
  return context;
}

interface AnalyticsProviderProps {
  children: ReactNode;
}

export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  const [timeRange, setTimeRange] = useState('month');
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { data, loading, refreshAll } = useAnalyticsData(timeRange);

  const refresh = async () => {
    try {
      setRefreshing(true);
      setError(null);
      await refreshAll?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка обновления данных');
    } finally {
      setRefreshing(false);
    }
  };

  const exportData = async (format: 'csv' | 'pdf' | 'excel') => {
    try {
      const response = await fetch('/api/analytics/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          format,
          timeRange,
          data
        }),
      });

      if (!response.ok) {
        throw new Error('Ошибка экспорта данных');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `analytics-${timeRange}-${Date.now()}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка экспорта');
    }
  };

  const value: AnalyticsContextType = {
    timeRange,
    setTimeRange,
    refreshing,
    refresh,
    data,
    loading,
    error,
    exportData
  };

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
}
