"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

// Утилиты для оптимизации магазина

export const createImagePreloader = () => {
  const preloadedImages = new Set<string>();
  
  const preloader = {
    preload: (src: string): Promise<void> => {
      if (preloadedImages.has(src)) {
        return Promise.resolve();
      }

      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          preloadedImages.add(src);
          resolve();
        };
        img.onerror = reject;
        img.src = src;
      });
    },
    
    preloadBatch: async (sources: string[]): Promise<void> => {
      const promises = sources
        .filter(src => !preloadedImages.has(src))
        .map(src => preloader.preload(src));
      
      await Promise.allSettled(promises);
    },
    
    isPreloaded: (src: string): boolean => preloadedImages.has(src),
    
    clear: (): void => {
      preloadedImages.clear();
    }
  };

  return preloader;
};

export const createVirtualScrolling = (
  items: any[],
  itemHeight: number,
  containerHeight: number
) => {
  const [scrollTop, setScrollTop] = useState(0);
  
  const visibleItemsCount = Math.ceil(containerHeight / itemHeight);
  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(startIndex + visibleItemsCount + 1, items.length);
  
  const visibleItems = items.slice(startIndex, endIndex);
  const offsetY = startIndex * itemHeight;
  
  return {
    visibleItems,
    offsetY,
    totalHeight: items.length * itemHeight,
    setScrollTop
  };
};

export const createInfiniteScroll = (
  loadMore: () => Promise<void>,
  hasMore: boolean,
  threshold = 200
) => {
  const [loading, setLoading] = useState(false);
  
  const handleScroll = useCallback(async (e: Event) => {
    const target = e.target as HTMLElement;
    if (!target) return;
    
    const { scrollTop, scrollHeight, clientHeight } = target;
    
    if (
      scrollHeight - scrollTop <= clientHeight + threshold &&
      hasMore &&
      !loading
    ) {
      setLoading(true);
      try {
        await loadMore();
      } finally {
        setLoading(false);
      }
    }
  }, [loadMore, hasMore, loading, threshold]);
  
  return {
    handleScroll,
    loading
  };
};

// Кеширование API запросов
export const createApiCache = <T>(ttl: number = 5 * 60 * 1000) => {
  const cache = new Map<string, { data: T; timestamp: number }>();
  
  return {
    get: (key: string): T | null => {
      const cached = cache.get(key);
      if (!cached) return null;
      
      if (Date.now() - cached.timestamp > ttl) {
        cache.delete(key);
        return null;
      }
      
      return cached.data;
    },
    
    set: (key: string, data: T): void => {
      cache.set(key, { data, timestamp: Date.now() });
    },
    
    clear: (): void => {
      cache.clear();
    },
    
    delete: (key: string): void => {
      cache.delete(key);
    }
  };
};

// Debounce функция для поиска
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Throttle функция для скролла
export const useThrottle = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T => {
  const [isThrottled, setIsThrottled] = useState(false);

  const throttledCallback = useCallback(
    (...args: Parameters<T>) => {
      if (!isThrottled) {
        callback(...args);
        setIsThrottled(true);
        setTimeout(() => setIsThrottled(false), delay);
      }
    },
    [callback, delay, isThrottled]
  ) as T;

  return throttledCallback;
};

// Intersection Observer для lazy loading
export const useIntersectionObserver = (
  callback: () => void,
  options: IntersectionObserverInit = {}
) => {
  const [elementRef, setElementRef] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!elementRef || typeof window === 'undefined') return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          callback();
          observer.unobserve(elementRef);
        }
      },
      {
        rootMargin: '50px',
        threshold: 0.1,
        ...options
      }
    );

    observer.observe(elementRef);

    return () => {
      if (elementRef) {
        observer.unobserve(elementRef);
      }
    };
  }, [elementRef, callback, options]);

  return setElementRef;
};

// Мемоизация для дорогих вычислений
export const useMemoizedCalculation = <T>(
  calculation: () => T,
  dependencies: React.DependencyList
): T => {
  return useMemo(calculation, dependencies);
};

// Кеш для компонентов
export const createComponentCache = () => {
  const cache = new Map<string, React.ReactElement>();
  
  return {
    get: (key: string): React.ReactElement | undefined => cache.get(key),
    set: (key: string, component: React.ReactElement): void => {
      cache.set(key, component);
    },
    has: (key: string): boolean => cache.has(key),
    clear: (): void => cache.clear(),
    size: (): number => cache.size
  };
};

// Оптимизация изображений
export const optimizeImageUrl = (
  src: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'jpeg' | 'png';
  } = {}
): string => {
  if (!src) return '';
  
  try {
    const url = new URL(src);
    const params = new URLSearchParams(url.search);
    
    if (options.width) params.set('w', options.width.toString());
    if (options.height) params.set('h', options.height.toString());
    if (options.quality) params.set('q', options.quality.toString());
    if (options.format) params.set('f', options.format);
    
    url.search = params.toString();
    return url.toString();
  } catch {
    // Если URL невалидный, возвращаем оригинал
    return src;
  }
};

// Батчинг запросов
export const createRequestBatcher = <T, R>(
  batchProcessor: (requests: T[]) => Promise<R[]>,
  batchSize: number = 10,
  delay: number = 100
) => {
  let batch: T[] = [];
  let resolvers: Array<(value: R) => void> = [];
  let rejecters: Array<(reason: any) => void> = [];
  let timeoutId: NodeJS.Timeout | null = null;

  const processBatch = async () => {
    if (batch.length === 0) return;

    const currentBatch = [...batch];
    const currentResolvers = [...resolvers];
    const currentRejecters = [...rejecters];

    batch = [];
    resolvers = [];
    rejecters = [];

    try {
      const results = await batchProcessor(currentBatch);
      results.forEach((result, index) => {
        currentResolvers[index]?.(result);
      });
    } catch (error) {
      currentRejecters.forEach(reject => reject(error));
    }
  };

  const scheduleProcessing = () => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(processBatch, delay);
  };

  return {
    add: (request: T): Promise<R> => {
      return new Promise<R>((resolve, reject) => {
        batch.push(request);
        resolvers.push(resolve);
        rejecters.push(reject);

        if (batch.length >= batchSize) {
          processBatch();
        } else {
          scheduleProcessing();
        }
      });
    },
    
    flush: () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      return processBatch();
    }
  };
};

// Предзагрузка маршрутов
export const preloadRoute = (route: string): void => {
  if (typeof window === 'undefined') return;
  
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = route;
  document.head.appendChild(link);
};

// Мониторинг производительности
export const createPerformanceMonitor = () => {
  const metrics: Array<{
    name: string;
    value: number;
    timestamp: number;
  }> = [];

  return {
    measure: (name: string, fn: () => void): number => {
      const start = performance.now();
      fn();
      const end = performance.now();
      const duration = end - start;
      
      metrics.push({
        name,
        value: duration,
        timestamp: Date.now()
      });
      
      return duration;
    },
    
    measureAsync: async (name: string, fn: () => Promise<void>): Promise<number> => {
      const start = performance.now();
      await fn();
      const end = performance.now();
      const duration = end - start;
      
      metrics.push({
        name,
        value: duration,
        timestamp: Date.now()
      });
      
      return duration;
    },
    
    getMetrics: () => [...metrics],
    
    getAverageTime: (name: string): number => {
      const nameMetrics = metrics.filter(m => m.name === name);
      if (nameMetrics.length === 0) return 0;
      
      const total = nameMetrics.reduce((sum, m) => sum + m.value, 0);
      return total / nameMetrics.length;
    },
    
    clear: () => {
      metrics.length = 0;
    }
  };
};

// Экспорт типов для использования в других файлах
export type ImagePreloader = ReturnType<typeof createImagePreloader>;
export type ApiCache<T> = ReturnType<typeof createApiCache<T>>;
export type ComponentCache = ReturnType<typeof createComponentCache>;
export type RequestBatcher<T, R> = ReturnType<typeof createRequestBatcher<T, R>>;
export type PerformanceMonitor = ReturnType<typeof createPerformanceMonitor>;
