// app/manager/analytics/page.tsx (финальная версия)
"use client";

import ManagerHeader from '@/components/manager/ManagerHeader';
import { ManagerProvider } from '@/contexts/ManagerContext';
import { ManagerErrorBoundary } from '@/components/manager/components/ManagerErrorBoundary';
import { TrainersManagementContent } from '@/components/manager/trainers/TrainersContent';

export default function ManagerTrainers() {
  return (
      <ManagerProvider>
          <ManagerErrorBoundary>
            <div className="min-h-[100lvh] bg-gray-50">
              <ManagerHeader />
              <TrainersManagementContent />
            </div>
          </ManagerErrorBoundary>
      </ManagerProvider>
  );
}
