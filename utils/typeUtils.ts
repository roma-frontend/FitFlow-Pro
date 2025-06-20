// utils/typeUtils.ts
import { GlobalDebugCommands } from '@/types/debug';

// ✅ БЕЗОПАСНЫЙ ДОСТУП К КОНТЕКСТАМ
export const getContext = <T = any>(contextName: string): T | null => {
  if (typeof window === 'undefined' || !window.fitAccessDebug) {
    return null;
  }
  
  return (window.fitAccessDebug as any)[contextName] || null;
};

// ✅ ПРОВЕРКА ДОСТУПНОСТИ КОНТЕКСТА
export const isContextAvailable = (contextName: string): boolean => {
  const context = getContext(contextName);
  return context !== null && typeof context === 'object';
};

// ✅ БЕЗОПАСНОЕ ВЫПОЛНЕНИЕ КОМАНД DEBUG СИСТЕМЫ
export const safeDebugCall = <T = any>(
  command: string, 
  ...args: any[]
): T | null => {
  try {
    if (typeof window === 'undefined' || !window.fitAccessDebug) {
      console.warn('Debug система недоступна');
      return null;
    }
    
    const debugSystem = window.fitAccessDebug as any;
    const commandPath = command.split('.');
    
    let target = debugSystem;
    for (const part of commandPath) {
      if (target && typeof target === 'object' && part in target) {
        target = target[part];
      } else {
        console.warn(`Команда ${command} не найдена`);
        return null;
      }
    }
    
    if (typeof target === 'function') {
      return target(...args);
    } else {
      return target;
    }
  } catch (error) {
    console.error(`Ошибка выполнения команды ${command}:`, error);
    return null;
  }
};

// ✅ ПОЛУЧЕНИЕ СТАТИСТИКИ ВСЕХ КОНТЕКСТОВ
export const getAllContextStats = () => {
  const schedule = getContext('schedule');
  const dashboard = getContext('dashboard');
  const superAdmin = getContext('superAdmin');
  
  return {
    schedule: {
      available: !!schedule,
      events: schedule?.events?.length || 0,
      trainers: schedule?.trainers?.length || 0,
      loading: schedule?.loading || false,
      error: schedule?.error || null
    },
    dashboard: {
      available: !!dashboard,
      events: dashboard?.events?.length || 0,
      trainers: dashboard?.trainers?.length || 0,
      clients: dashboard?.clients?.length || 0,
      loading: dashboard?.loading || false,
      error: dashboard?.error || null
    },
    superAdmin: {
      available: !!superAdmin,
      trainers: superAdmin?.trainers?.length || 0,
      clients: superAdmin?.clients?.length || 0,
      loading: superAdmin?.loading || false,
      error: superAdmin?.error || null
    }
  };
};
