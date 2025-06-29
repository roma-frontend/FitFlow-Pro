// components/admin/settings/components/AdaptiveSettingsContainer.tsx (финальная версия)
"use client";

import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { useAdaptiveSettings } from '@/hooks/useAdaptiveSettings';
import { ProgressiveSettingsLoader } from './ProgressiveSettingsLoader';

interface AdaptiveSettingsContainerProps {
  children: React.ReactNode;
  className?: string;
  loading?: boolean;
  loadingSteps?: string[];
  currentStep?: number;
}

export const AdaptiveSettingsContainer = ({
  children,
  className,
  loading = false,
  loadingSteps = [],
  currentStep = 0
}: AdaptiveSettingsContainerProps) => {
  const { isMobile, isTablet, shouldUseProgressiveLoading } = useAdaptiveSettings();
  const [isVisible, setIsVisible] = useState(!loading);

  useEffect(() => {
    if (!loading) {
      // Небольшая задержка для плавного появления контента
      const timer = setTimeout(() => setIsVisible(true), 100);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [loading]);

  if (loading && shouldUseProgressiveLoading()) {
    return (
      <ProgressiveSettingsLoader
        isLoading={loading}
        loadingSteps={loadingSteps}
        currentStep={currentStep}
        isMobile={isMobile}
      >
        {children}
      </ProgressiveSettingsLoader>
    );
  }

  return (
    <div className={cn(
      'w-full transition-all duration-500',
      // Адаптивные отступы и размеры
      isMobile && 'px-2 py-3',
      isTablet && 'px-4 py-4',
      !isMobile && !isTablet && 'px-6 py-6',
      // Анимация появления
      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4',
      // Оптимизация производительности
      'gpu-accelerated',
      className
    )}>
      {children}
    </div>
  );
};
