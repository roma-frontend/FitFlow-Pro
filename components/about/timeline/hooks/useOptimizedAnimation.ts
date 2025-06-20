// components/about/timeline/hooks/useOptimizedAnimation.ts
import { useCallback, useEffect, useState } from 'react';

export const useOptimizedAnimation = () => {
  const [isHighPerformance, setIsHighPerformance] = useState(true);
  const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

  useEffect(() => {
    const checkPerformance = () => {
      try {
        const connection = (navigator as any).connection;
        const memory = (performance as any).memory;
        
        const isSlowConnection = connection && (
          connection.effectiveType === 'slow-2g' || 
          connection.effectiveType === '2g' ||
          connection.saveData
        );
        
        const isLowMemory = memory && memory.usedJSHeapSize > memory.jsHeapSizeLimit * 0.8;
        
        const isMobile = window.innerWidth < 768;
        const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;
        
        setDeviceType(isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop');
        setIsHighPerformance(!isSlowConnection && !isLowMemory);
      } catch (error) {
        console.warn('Performance check failed:', error);
        // Fallback to safe defaults
        setIsHighPerformance(true);
        setDeviceType(window.innerWidth < 768 ? 'mobile' : 'desktop');
      }
    };

    checkPerformance();
    window.addEventListener('resize', checkPerformance);
    
    return () => window.removeEventListener('resize', checkPerformance);
  }, []);

  const getOptimizedDuration = useCallback((baseDuration: number): number => {
    if (!isHighPerformance) return baseDuration * 0.5;
    if (deviceType === 'mobile') return baseDuration * 0.8;
    if (deviceType === 'tablet') return baseDuration * 0.9;
    return baseDuration;
  }, [isHighPerformance, deviceType]);

  const getOptimizedEasing = useCallback(() => {
    if (!isHighPerformance) return "easeInOut" as const;
    return [0.25, 0.46, 0.45, 0.94] as const;
  }, [isHighPerformance]);

  return {
    isHighPerformance,
    deviceType,
    getOptimizedDuration,
    getOptimizedEasing
  };
};
