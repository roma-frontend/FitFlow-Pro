// contexts/AdminContext.tsx (исправленная версия)
"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

interface AdminStats {
  totalUsers: number;
  totalManagers: number;
  systemLoad: number;
  systemAlerts: number;
  activeUsers: number;
  monthlyRevenue: number;
  newRegistrations: number;
  systemStatus: "healthy" | "warning" | "critical";
}

interface AdminContextType {
  stats: AdminStats;
  loading: boolean;
  error: string | null;
  refreshStats: () => Promise<void>;
  refreshData: () => Promise<void>;
}

const defaultStats: AdminStats = {
  totalUsers: 0,
  totalManagers: 0,
  systemLoad: 0,
  systemAlerts: 0,
  activeUsers: 0,
  monthlyRevenue: 0,
  newRegistrations: 0,
  systemStatus: "healthy",
};

const AdminContext = createContext<AdminContextType | undefined>(undefined);

interface AdminProviderProps {
  children: ReactNode;
}

export function AdminProvider({ children }: AdminProviderProps) {
  const [stats, setStats] = useState<AdminStats>(defaultStats);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ✅ ИСПОЛЬЗУЕМ useCallback ДЛЯ ПРЕДОТВРАЩЕНИЯ ПЕРЕСОЗДАНИЯ ФУНКЦИИ
  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Загрузка статистики администратора...');

      // Имитация API запроса
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Мок данные для демонстрации
      const mockStats: AdminStats = {
        totalUsers: 1247 + Math.floor(Math.random() * 10),
        totalManagers: 8,
        systemLoad: Math.random() * 0.9 + 0.1,
        systemAlerts: Math.floor(Math.random() * 5),
        activeUsers: 156 + Math.floor(Math.random() * 20),
        monthlyRevenue: 2850000 + Math.floor(Math.random() * 100000),
        newRegistrations: 23 + Math.floor(Math.random() * 5),
        systemStatus: Math.random() > 0.8 ? "warning" : "healthy",
      };

      setStats(mockStats);
      console.log('✅ Статистика администратора загружена');
    } catch (err) {
      console.error("❌ Ошибка загрузки статистики:", err);
      setError("Не удалось загрузить статистику");
    } finally {
      setLoading(false);
    }
  }, []); // ✅ ПУСТОЙ МАССИВ ЗАВИСИМОСТЕЙ

  // ✅ ТАКЖЕ ИСПОЛЬЗУЕМ useCallback ДЛЯ refreshStats
  const refreshStats = useCallback(async () => {
    console.log('🔄 Обновление статистики администратора...');
    await fetchStats();
  }, [fetchStats]);

  // ✅ ТАКЖЕ ИСПОЛЬЗУЕМ useCallback ДЛЯ refreshData
  const refreshData = useCallback(async () => {
    await refreshStats();
  }, [refreshStats]);

  // ✅ ТЕПЕРЬ useEffect НЕ БУДЕТ ВЫЗЫВАТЬ БЕСКОНЕЧНЫЙ ЦИКЛ
  useEffect(() => {
    fetchStats();

    // Обновляем статистику каждые 30 секунд
    const interval = setInterval(fetchStats, 30000);

    return () => clearInterval(interval);
  }, [fetchStats]); // ✅ fetchStats теперь стабильная функция

  // ✅ МЕМОИЗИРУЕМ VALUE ОБЪЕКТ
  const value: AdminContextType = React.useMemo(() => ({
    stats,
    loading,
    error,
    refreshStats,
    refreshData
  }), [stats, loading, error, refreshStats, refreshData]);

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
}
