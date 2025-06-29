// hooks/useDataMonitor.ts (исправленная версия)
"use client";

import { useEffect, useRef } from 'react';
import { useDashboard } from '@/contexts/DashboardContext';
import { useSchedule } from '@/contexts/ScheduleContext';
import { useSuperAdmin } from '@/contexts/SuperAdminContext';

interface DataSnapshot {
  timestamp: Date;
  dashboard: {
    trainers: number;
    clients: number;
    events: number;
    loading: boolean;
    error: string | null;
  };
  schedule: {
    events: number;
    loading: boolean;
    error: string | null;
  };
  superAdmin: {
    trainers: number;
    clients: number;
    loading: boolean;
    error: string | null; // ← Теперь это свойство доступно
  };
}

export const useDataMonitor = () => {
  const dashboard = useDashboard();
  const schedule = useSchedule();
  const superAdmin = useSuperAdmin();
  const snapshotsRef = useRef<DataSnapshot[]>([]);
  const lastLogRef = useRef<Date>(new Date());

  const createSnapshot = (): DataSnapshot => ({
    timestamp: new Date(),
    dashboard: {
      trainers: dashboard.trainers?.length || 0,
      clients: dashboard.clients?.length || 0,
      events: dashboard.events?.length || 0,
      loading: dashboard.loading,
      error: dashboard.error
    },
    schedule: {
      events: schedule.events?.length || 0,
      loading: schedule.loading,
      error: schedule.error
    },
    superAdmin: {
      trainers: superAdmin.trainers?.length || 0,
      clients: superAdmin.clients?.length || 0,
      loading: superAdmin.loading,
      error: superAdmin.error // ← Теперь это работает
    }
  });

  const detectChanges = (prev: DataSnapshot, current: DataSnapshot) => {
    const changes: string[] = [];

    // Проверяем изменения в dashboard
    if (prev.dashboard.trainers !== current.dashboard.trainers) {
      changes.push(`Dashboard тренеры: ${prev.dashboard.trainers} → ${current.dashboard.trainers}`);
    }
    if (prev.dashboard.clients !== current.dashboard.clients) {
      changes.push(`Dashboard клиенты: ${prev.dashboard.clients} → ${current.dashboard.clients}`);
    }
    if (prev.dashboard.events !== current.dashboard.events) {
      changes.push(`Dashboard события: ${prev.dashboard.events} → ${current.dashboard.events}`);
    }

    // Проверяем изменения в schedule
    if (prev.schedule.events !== current.schedule.events) {
      changes.push(`Schedule события: ${prev.schedule.events} → ${current.schedule.events}`);
    }

    // Проверяем изменения в superAdmin
    if (prev.superAdmin.trainers !== current.superAdmin.trainers) {
      changes.push(`SuperAdmin тренеры: ${prev.superAdmin.trainers} → ${current.superAdmin.trainers}`);
    }
    if (prev.superAdmin.clients !== current.superAdmin.clients) {
      changes.push(`SuperAdmin клиенты: ${prev.superAdmin.clients} → ${current.superAdmin.clients}`);
    }

    // Проверяем изменения ошибок
    if (prev.dashboard.error !== current.dashboard.error) {
      changes.push(`Dashboard ошибка: ${prev.dashboard.error} → ${current.dashboard.error}`);
    }
    if (prev.schedule.error !== current.schedule.error) {
      changes.push(`Schedule ошибка: ${prev.schedule.error} → ${current.schedule.error}`);
    }
    if (prev.superAdmin.error !== current.superAdmin.error) {
      changes.push(`SuperAdmin ошибка: ${prev.superAdmin.error} → ${current.superAdmin.error}`);
    }

    // Проверяем изменения состояния загрузки
    if (prev.dashboard.loading !== current.dashboard.loading) {
      changes.push(`Dashboard загрузка: ${prev.dashboard.loading} → ${current.dashboard.loading}`);
    }
    if (prev.schedule.loading !== current.schedule.loading) {
      changes.push(`Schedule загрузка: ${prev.schedule.loading} → ${current.schedule.loading}`);
    }
    if (prev.superAdmin.loading !== current.superAdmin.loading) {
      changes.push(`SuperAdmin загрузка: ${prev.superAdmin.loading} → ${current.superAdmin.loading}`);
    }

    return changes;
  };

  const checkSyncStatus = (snapshot: DataSnapshot) => {
    const issues: string[] = [];

    // Проверяем синхронизацию событий между dashboard и schedule
    if (snapshot.dashboard.events !== snapshot.schedule.events) {
      issues.push(`⚠️ Рассинхронизация событий: Dashboard(${snapshot.dashboard.events}) ≠ Schedule(${snapshot.schedule.events})`);
    }

    // Проверяем синхронизацию тренеров между dashboard и superAdmin
    if (snapshot.dashboard.trainers !== snapshot.superAdmin.trainers) {
      issues.push(`⚠️ Рассинхронизация тренеров: Dashboard(${snapshot.dashboard.trainers}) ≠ SuperAdmin(${snapshot.superAdmin.trainers})`);
    }

    // Проверяем синхронизацию клиентов между dashboard и superAdmin
    if (snapshot.dashboard.clients !== snapshot.superAdmin.clients) {
      issues.push(`⚠️ Рассинхронизация клиентов: Dashboard(${snapshot.dashboard.clients}) ≠ SuperAdmin(${snapshot.superAdmin.clients})`);
    }

    // Проверяем наличие ошибок
    if (snapshot.dashboard.error) {
      issues.push(`🚨 Ошибка Dashboard: ${snapshot.dashboard.error}`);
    }
    if (snapshot.schedule.error) {
      issues.push(`🚨 Ошибка Schedule: ${snapshot.schedule.error}`);
    }
    if (snapshot.superAdmin.error) {
      issues.push(`🚨 Ошибка SuperAdmin: ${snapshot.superAdmin.error}`);
    }

    // Проверяем состояние загрузки
    const loadingContexts = [];
    if (snapshot.dashboard.loading) loadingContexts.push('Dashboard');
    if (snapshot.schedule.loading) loadingContexts.push('Schedule');
    if (snapshot.superAdmin.loading) loadingContexts.push('SuperAdmin');

    if (loadingContexts.length > 0) {
      issues.push(`⏳ Загружаются контексты: ${loadingContexts.join(', ')}`);
    }

    return issues;
  };

  const getHealthStatus = (snapshot: DataSnapshot) => {
    const hasErrors = snapshot.dashboard.error || snapshot.schedule.error || snapshot.superAdmin.error;
    const isLoading = snapshot.dashboard.loading || snapshot.schedule.loading || snapshot.superAdmin.loading;
    const hasSyncIssues = checkSyncStatus(snapshot).filter(issue => issue.includes('Рассинхронизация')).length > 0;

    if (hasErrors) return 'critical';
    if (hasSyncIssues) return 'warning';
    if (isLoading) return 'loading';
    return 'healthy';
  };

  useEffect(() => {
    const currentSnapshot = createSnapshot();
    const previousSnapshot = snapshotsRef.current[snapshotsRef.current.length - 1];

    // Добавляем новый снимок
    snapshotsRef.current.push(currentSnapshot);

    // Ограничиваем количество снимков (последние 50)
    if (snapshotsRef.current.length > 50) {
      snapshotsRef.current = snapshotsRef.current.slice(-50);
    }

    // Проверяем изменения
    if (previousSnapshot) {
      const changes = detectChanges(previousSnapshot, currentSnapshot);
      if (changes.length > 0) {
        console.group(`🔄 Изменения данных [${currentSnapshot.timestamp.toLocaleTimeString()}]`);
        changes.forEach(change => {
          if (change.includes('ошибка')) {
            console.error(change);
          } else if (change.includes('загрузка')) {
            console.info(change);
          } else {
            console.log(change);
          }
        });
        console.groupEnd();
      }
    }

    // Проверяем синхронизацию каждые 5 секунд
    const now = new Date();
    if (now.getTime() - lastLogRef.current.getTime() > 5000) {
      const syncIssues = checkSyncStatus(currentSnapshot);
      const healthStatus = getHealthStatus(currentSnapshot);
      
      if (syncIssues.length > 0) {
        console.group(`🚨 Статус системы: ${healthStatus} [${now.toLocaleTimeString()}]`);
        syncIssues.forEach(issue => {
          if (issue.includes('🚨')) {
            console.error(issue);
          } else if (issue.includes('⚠️')) {
            console.warn(issue);
          } else if (issue.includes('⏳')) {
            console.info(issue);
          } else {
            console.log(issue);
          }
        });
        console.groupEnd();
      } else {
        console.log(`✅ Система здорова: все данные синхронизированы [${now.toLocaleTimeString()}]`);
      }
      lastLogRef.current = now;
    }

  }, [
    dashboard.trainers?.length,
    dashboard.clients?.length,
    dashboard.events?.length,
    dashboard.loading,
    dashboard.error,
    schedule.events?.length,
    schedule.loading,
    schedule.error,
    superAdmin.trainers?.length,
    superAdmin.clients?.length,
    superAdmin.loading,
    superAdmin.error // ← Теперь это работает
  ]);

  return {
    snapshots: snapshotsRef.current,
    currentSnapshot: snapshotsRef.current[snapshotsRef.current.length - 1],
    createSnapshot,
    checkSyncStatus: () => checkSyncStatus(snapshotsRef.current[snapshotsRef.current.length - 1] || createSnapshot()),
    getHealthStatus: () => getHealthStatus(snapshotsRef.current[snapshotsRef.current.length - 1] || createSnapshot()),
    // Дополнительные утилиты
    getErrorSummary: () => {
      const current = snapshotsRef.current[snapshotsRef.current.length - 1] || createSnapshot();
      const errors = [];
      if (current.dashboard.error) errors.push({ context: 'Dashboard', error: current.dashboard.error });
      if (current.schedule.error) errors.push({ context: 'Schedule', error: current.schedule.error });
      if (current.superAdmin.error) errors.push({ context: 'SuperAdmin', error: current.superAdmin.error });
      return errors;
    },
    getLoadingSummary: () => {
      const current = snapshotsRef.current[snapshotsRef.current.length - 1] || createSnapshot();
      return {
        dashboard: current.dashboard.loading,
        schedule: current.schedule.loading,
        superAdmin: current.superAdmin.loading,
        anyLoading: current.dashboard.loading || current.schedule.loading || current.superAdmin.loading
      };
    },
    getSyncSummary: () => {
      const current = snapshotsRef.current[snapshotsRef.current.length - 1] || createSnapshot();
      return {
        eventsSync: current.dashboard.events === current.schedule.events,
        trainersSync: current.dashboard.trainers === current.superAdmin.trainers,
        clientsSync: current.dashboard.clients === current.superAdmin.clients,
        allInSync: (
          current.dashboard.events === current.schedule.events &&
          current.dashboard.trainers === current.superAdmin.trainers &&
          current.dashboard.clients === current.superAdmin.clients
        )
      };
    }
  };
};
