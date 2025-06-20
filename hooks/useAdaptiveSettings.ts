// hooks/useAdaptiveSettings.ts (полная версия)
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useResponsiveBreakpoint } from './useResponsiveBreakpoint';

interface AdaptiveSettingsConfig {
  autoSaveInterval: number;
  loadingDelay: number;
  animationDuration: number;
  maxRetries: number;
}

export const useAdaptiveSettings = () => {
  const { isMobile, isTablet, isDesktop, currentBreakpoint } = useResponsiveBreakpoint();
  const [config, setConfig] = useState<AdaptiveSettingsConfig>({
    autoSaveInterval: 30000,
    loadingDelay: 300,
    animationDuration: 200,
    maxRetries: 3
  });

  // Адаптивная конфигурация в зависимости от устройства
  useEffect(() => {
    if (isMobile) {
      setConfig({
        autoSaveInterval: 20000,
        loadingDelay: 200,
        animationDuration: 150,
        maxRetries: 2
      });
    } else if (isTablet) {
      setConfig({
        autoSaveInterval: 25000,
        loadingDelay: 250,
        animationDuration: 175,
        maxRetries: 3
      });
    } else {
      setConfig({
        autoSaveInterval: 30000,
        loadingDelay: 300,
        animationDuration: 200,
        maxRetries: 3
      });
    }
  }, [isMobile, isTablet, isDesktop]);

  // Адаптивные утилиты
  const getOptimalChunkSize = useCallback(() => {
    if (isMobile) return 10;
    if (isTablet) return 20;
    return 50;
  }, [isMobile, isTablet]);

  const getOptimalDelay = useCallback((operation: 'save' | 'load' | 'export' | 'import') => {
    const baseDelays = {
      save: isMobile ? 400 : 600,
      load: isMobile ? 200 : 300,
      export: isMobile ? 600 : 800,
      import: isMobile ? 800 : 1000
    };
    return baseDelays[operation];
  }, [isMobile]);

  const shouldUseProgressiveLoading = useCallback(() => {
    return isMobile || isTablet;
  }, [isMobile, isTablet]);

  return {
    config,
    getOptimalChunkSize,
    getOptimalDelay,
    shouldUseProgressiveLoading,
    isMobile,
    isTablet,
    isDesktop,
    currentBreakpoint
  };
};
