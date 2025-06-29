// components/admin/settings/components/SettingsPageWrapper.tsx (исправленная версия)
"use client";

import React, { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { SettingsPageSkeleton } from './SettingsPageSkeleton';
import { SettingsErrorState } from './SettingsErrorState';
import { useAdaptiveSettings } from '@/hooks/useAdaptiveSettings';

interface SettingsPageWrapperProps {
  children: React.ReactNode;
}

const SettingsErrorFallback = ({ error, resetErrorBoundary }: {
  error: Error;
  resetErrorBoundary: () => void;
}) => {
  const { isMobile } = useAdaptiveSettings();
  
  return (
    <SettingsErrorState
      error={error}
      onRetry={resetErrorBoundary}
      onBack={() => window.history.back()}
      isMobile={isMobile}
      title="Ошибка в настройках"
      description="Произошла непредвиденная ошибка при работе с настройками."
    />
  );
};

export const SettingsPageWrapper = ({ children }: SettingsPageWrapperProps) => {
  const { isMobile } = useAdaptiveSettings();

  return (
    <ErrorBoundary
      FallbackComponent={SettingsErrorFallback}
      onReset={() => {
        // Очищаем localStorage при критической ошибке
        localStorage.removeItem('settings-cache');
        window.location.reload();
      }}
      onError={(error, errorInfo) => {
        // Логирование ошибок в production
        if (process.env.NODE_ENV === 'production') {
          console.error('Settings Error:', error, errorInfo);
          // Здесь можно отправить ошибку в сервис мониторинга
        }
      }}
    >
      <Suspense fallback={
        <SettingsPageSkeleton 
          isMobile={isMobile}
          useProgressiveLoading={isMobile}
        />
      }>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
};
