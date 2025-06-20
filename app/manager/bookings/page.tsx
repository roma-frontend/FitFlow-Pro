// app/manager/analytics/page.tsx (финальная версия)
"use client";

import ManagerHeader from '@/components/manager/ManagerHeader';
import { ManagerProvider } from '@/contexts/ManagerContext';
import { ManagerErrorBoundary } from '@/components/manager/components/ManagerErrorBoundary';
import { BookingsManagementContent } from '@/components/manager/bookings/BookingsContent';

export default function ManagerBookings() {
  return (
      <ManagerProvider>
          <ManagerErrorBoundary>
            <div className="min-h-screen bg-gray-50">
              <ManagerHeader />
              <BookingsManagementContent />
            </div>
          </ManagerErrorBoundary>
      </ManagerProvider>
  );
}
