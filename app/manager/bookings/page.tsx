// app/manager/bookings/page.tsx (финальная версия с Suspense)
"use client";

import { Suspense } from 'react';
import ManagerHeader from '@/components/manager/ManagerHeader';
import { ManagerProvider } from '@/contexts/ManagerContext';
import { ManagerErrorBoundary } from '@/components/manager/components/ManagerErrorBoundary';
import { BookingsManagementContent } from '@/components/manager/bookings/BookingsContent';

// Компонент-скелетон для загрузки
function BookingsSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
      {/* Заголовок */}
      <div className="mb-8">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>

      {/* Фильтры и кнопки */}
      <div className="mb-6 flex justify-between items-center">
        <div className="flex gap-4">
          <div className="h-10 bg-gray-200 rounded w-32"></div>
          <div className="h-10 bg-gray-200 rounded w-32"></div>
          <div className="h-10 bg-gray-200 rounded w-32"></div>
        </div>
        <div className="h-10 bg-gray-200 rounded w-40"></div>
      </div>

      {/* Таблица */}
      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
        </div>
        <div className="divide-y">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="p-4">
              <div className="grid grid-cols-6 gap-4">
                <div className="h-5 bg-gray-200 rounded"></div>
                <div className="h-5 bg-gray-200 rounded"></div>
                <div className="h-5 bg-gray-200 rounded"></div>
                <div className="h-5 bg-gray-200 rounded"></div>
                <div className="h-5 bg-gray-200 rounded"></div>
                <div className="h-5 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Компонент с содержимым страницы
function BookingsPageContent() {
  return (
    <ManagerProvider>
      <ManagerErrorBoundary>
        <div className="min-h-[100svh] bg-gray-50">
          <ManagerHeader />
          <BookingsManagementContent />
        </div>
      </ManagerErrorBoundary>
    </ManagerProvider>
  );
}

export default function ManagerBookings() {
  return (
    <Suspense fallback={
      <div className="min-h-[100svh] bg-gray-50">
        <BookingsSkeleton />
      </div>
    }>
      <BookingsPageContent />
    </Suspense>
  );
}