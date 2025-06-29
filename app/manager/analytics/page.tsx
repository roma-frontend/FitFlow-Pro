// app/manager/analytics/page.tsx (финальная версия)
"use client";

import ManagerHeader from '@/components/manager/ManagerHeader';
import { ManagerProvider } from '@/contexts/ManagerContext';
import { AnalyticsProvider } from '@/contexts/AnalyticsProvider';
import AnalyticsContent from '@/components/manager/analytics/AnalyticsContent';
import { ManagerErrorBoundary } from '@/components/manager/components/ManagerErrorBoundary';

export default function ManagerAnalytics() {
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
