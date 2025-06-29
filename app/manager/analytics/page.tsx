// app/manager/analytics/page.tsx (финальная версия с Suspense)
"use client";

import { Suspense } from 'react';
import ManagerHeader from '@/components/manager/ManagerHeader';
import { ManagerProvider } from '@/contexts/ManagerContext';
import { AnalyticsProvider } from '@/contexts/AnalyticsProvider';
import AnalyticsContent from '@/components/manager/analytics/AnalyticsContent';
import { ManagerErrorBoundary } from '@/components/manager/components/ManagerErrorBoundary';

// Компонент загрузки для аналитики
function AnalyticsSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
      {/* Заголовок */}
      <div className="mb-8">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>

      {/* Фильтры */}
      <div className="mb-6 flex gap-4">
        <div className="h-10 bg-gray-200 rounded w-32"></div>
        <div className="h-10 bg-gray-200 rounded w-32"></div>
        <div className="h-10 bg-gray-200 rounded w-32"></div>
      </div>

      {/* Графики */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg border">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
        <div className="bg-white p-6 rounded-lg border">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white p-6 rounded-lg border">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Компонент с содержимым страницы
function AnalyticsPageContent() {
  return (
    <ManagerProvider>
      <AnalyticsProvider>
        <ManagerErrorBoundary>
          <div className="min-h-[100svh] bg-gray-50">
            <ManagerHeader />
            <AnalyticsContent />
          </div>
        </ManagerErrorBoundary>
      </AnalyticsProvider>
    </ManagerProvider>
  );
}

export default function ManagerAnalytics() {
  return (
    <Suspense fallback={
      <div className="min-h-[100svh] bg-gray-50">
        <AnalyticsSkeleton />
      </div>
    }>
      <AnalyticsPageContent />
    </Suspense>
  );
}