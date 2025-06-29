// app/manager/analytics/page.tsx (финальная версия)
"use client";

import { Suspense } from 'react';
import ManagerHeader from '@/components/manager/ManagerHeader';
import { ManagerProvider } from '@/contexts/ManagerContext';
import { ManagerErrorBoundary } from '@/components/manager/components/ManagerErrorBoundary';
import { TrainersManagementContent } from '@/components/manager/trainers/TrainersContent';

function ManagerTrainersContent() {
  return (
    <ManagerProvider>
      <ManagerErrorBoundary>
        <div className="min-h-[100svh] bg-gray-50">
          <ManagerHeader />
          <TrainersManagementContent />
        </div>
      </ManagerErrorBoundary>
    </ManagerProvider>
  );
}

export default function ManagerTrainers() {
  return (
    <Suspense fallback={<div className="min-h-[100svh] bg-gray-50 animate-pulse" />}>
      <ManagerTrainersContent />
    </Suspense>
  );
}
