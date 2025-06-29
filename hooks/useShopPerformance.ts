import { useCallback, useRef } from 'react';

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  userId?: string;
}

export const useShopPerformance = () => {
  const metricsRef = useRef<PerformanceMetric[]>([]);

  const measurePerformance = useCallback((name: string, value: number) => {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
    };

    metricsRef.current.push(metric);

    // Отправляем метрики на сервер каждые 10 записей
    if (metricsRef.current.length >= 10) {
      sendMetricsToServer();
    }
  }, []);

  const sendMetricsToServer = useCallback(async () => {
    if (metricsRef.current.length === 0) return;

    try {
      await fetch('/api/analytics/performance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          metrics: metricsRef.current,
        }),
      });

      metricsRef.current = [];
    } catch (error) {
      console.error('Ошибка отправки метрик производительности:', error);
    }
  }, []);

  const measureComponentRender = useCallback((componentName: string) => {
    return {
      start: () => {
        const startTime = performance.now();
        return () => {
          const endTime = performance.now();
          measurePerformance(`${componentName}_render`, endTime - startTime);
        };
      }
    };
  }, [measurePerformance]);

  const measureApiCall = useCallback((apiName: string) => {
    return {
      start: () => {
        const startTime = performance.now();
        return () => {
          const endTime = performance.now();
          measurePerformance(`api_${apiName}`, endTime - startTime);
        };
      }
    };
  }, [measurePerformance]);

  return {
    measurePerformance,
    measureComponentRender,
    measureApiCall,
    sendMetricsToServer,
  };
};
