// hooks/usePerformanceOptimization.ts
"use client";

import { useEffect, useCallback, useRef } from 'react';

export const usePerformanceOptimization = () => {
  const rafId = useRef<number | null>(null);
  const lastFrameTime = useRef<number>(0);

  // Throttled animation frame
  const throttledRaf = useCallback((callback: () => void, fps: number = 30) => {
    const targetInterval = 1000 / fps;
    
    const animate = (currentTime: number) => {
      if (currentTime - lastFrameTime.current >= targetInterval) {
        callback();
        lastFrameTime.current = currentTime;
      }
      rafId.current = requestAnimationFrame(animate);
    };
    
    rafId.current = requestAnimationFrame(animate);
    
    return () => {
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, []);

  // Debounced function
  const useDebounce = useCallback((func: Function, delay: number) => {
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    
    return useCallback((...args: any[]) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        func(...args);
      }, delay);
    }, [func, delay]);
  }, []);

  // Memory cleanup
  useEffect(() => {
    return () => {
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, []);

  return {
    throttledRaf,
    useDebounce
  };
};
