"use client";

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUnifiedData } from '@/contexts/UnifiedDataContext';

export function useDashboard() {
  const { user } = useAuth();
  const { events, loading, error, isOnline } = useUnifiedData();
  const [refreshKey, setRefreshKey] = useState(0);

  // Вычисляем статистику
  const stats = useMemo(() => {
    const today = new Date();
    const todayEvents = events.filter(event => {
      try {
        const eventDate = new Date(event.startTime);
        return eventDate.toDateString() === today.toDateString();
      } catch {
        return false;
      }
    });

    const completedEvents = events.filter(e => e.status === 'completed');
    const completionRate = events.length > 0 
      ? Math.round((completedEvents.length / events.length) * 100)
      : 0;

    return {
      totalEvents: events.length,
      todayEvents: todayEvents.length,
      completedEvents: completedEvents.length,
      completionRate
    };
  }, [events]);

  // Функция обновления данных
  const refreshData = () => {
    setRefreshKey(prev => prev + 1);
  };

  // Проверка прав доступа
  const hasPermission = (resource: string, action: string = 'read') => {
    if (!user?.role) return false;
    
    const rolePermissions = {
      'super-admin': ['*'],
      'admin': ['users', 'analytics', 'products', 'schedule', 'messages', 'settings'],
      'manager': ['users', 'schedule', 'messages', 'analytics'],
      'trainer': ['schedule', 'messages'],
      'member': ['schedule', 'messages'],
      'client': ['schedule', 'messages']
    };

    const permissions = rolePermissions[user.role as keyof typeof rolePermissions] || [];
    return permissions.includes('*') || permissions.includes(resource);
  };

  return {
    user,
    stats,
    loading,
    error,
    isOnline,
    refreshKey,
    refreshData,
    hasPermission
  };
}
