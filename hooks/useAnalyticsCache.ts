// hooks/useAnalyticsCache.ts
import { useState, useEffect, useCallback } from 'react';

interface CacheEntry<T> {
  data: T | null;
  timestamp: number;
  period: string;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 минут
const cache = new Map<string, CacheEntry<any>>();

export function useAnalyticsCache<T>(
  key: string,
  fetchFunction: (period: string) => Promise<T>,
  period: string
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cacheKey = `${key}-${period}`;

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Проверяем кэш
      const cachedEntry = cache.get(cacheKey);
      const now = Date.now();

      if (
        cachedEntry &&
        cachedEntry.period === period &&
        now - cachedEntry.timestamp < CACHE_DURATION
      ) {
        console.log(`✅ Используем кэшированные данные для ${key}`);
        setData(cachedEntry.data);
        setLoading(false);
        return;
      }

      console.log(`🔄 Загружаем новые данные для ${key}`);
      const result = await fetchFunction(period);
      
      // Сохраняем в кэш
      cache.set(cacheKey, {
        data: result,
        timestamp: now,
        period
      });

      setData(result);
    } catch (err) {
      console.error(`❌ Ошибка загрузки данных для ${key}:`, err);
      setError(err instanceof Error ? err.message : 'Ошибка загрузки данных');
      
      // Пытаемся использовать устаревшие данные из кэша
      const cachedEntry = cache.get(cacheKey);
      if (cachedEntry) {
        console.log(`⚠️ Используем устаревшие кэшированные данные для ${key}`);
        setData(cachedEntry.data);
      }
    } finally {
      setLoading(false);
    }
  }, [key, fetchFunction, period, cacheKey]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const refresh = useCallback(() => {
    // Очищаем кэш для этого ключа
    cache.delete(cacheKey);
    // Перезагружаем данные
    loadData();
  }, [cacheKey, loadData]);

  const clearCache = useCallback(() => {
    cache.clear();
    console.log('🧹 Весь кэш аналитики очищен');
  }, []);

  return {
    data,
    loading,
    error,
    refresh,
    clearCache
  };
}

// Утилита для предварительной загрузки данных
export function preloadAnalyticsData(
  keys: string[],
  fetchFunctions: Record<string, (period: string) => Promise<any>>,
  period: string
) {
  keys.forEach(key => {
    const cacheKey = `${key}-${period}`;
    const cachedEntry = cache.get(cacheKey);
    
    if (!cachedEntry || Date.now() - cachedEntry.timestamp >= CACHE_DURATION) {
      const fetchFunction = fetchFunctions[key];
      if (fetchFunction) {
        fetchFunction(period)
          .then(data => {
            cache.set(cacheKey, {
              data,
              timestamp: Date.now(),
              period
            });
            console.log(`✅ Предзагружены данные для ${key}`);
          })
          .catch(error => {
            console.error(`❌ Ошибка предзагрузки данных для ${key}:`, error);
          });
      }
    }
  });
}

// Хук для управления всем кэшем
export function useAnalyticsCacheManager() {
  const clearAllCache = useCallback(() => {
    cache.clear();
    console.log('🧹 Весь кэш аналитики очищен');
  }, []);

  const getCacheSize = useCallback(() => {
    return cache.size;
  }, []);

  const getCacheInfo = useCallback(() => {
    const info: Array<{
      key: string;
      age: number;
      period: string;
    }> = [];

    cache.forEach((entry, key) => {
      info.push({
        key,
        age: Date.now() - entry.timestamp,
        period: entry.period
      });
    });

    return info;
  }, []);

  return {
    clearAllCache,
    getCacheSize,
    getCacheInfo
  };
}