// app/manager/bookings/page.tsx (исправленная версия)
"use client";

import { useState } from "react";
import { ManagerProvider, useManager } from "@/contexts/ManagerContext";
import { useBookingFilters } from "@/hooks/useBookingFilters";
import { calculateBookingStats } from "@/utils/bookingHelpers";

// Компоненты
import BookingPageHeader from "@/components/manager/bookings/BookingPageHeader";
import BookingStats from "@/components/manager/bookings/BookingStats";
import BookingFilters from "@/components/manager/bookings/BookingFilters";
import BookingTable from "@/components/manager/bookings/BookingTable";
import BookingMobileList from "@/components/manager/bookings/BookingMobileList";
import BookingEmptyState from "@/components/manager/bookings/BookingEmptyState";
import BookingStatusDialog from "@/components/manager/bookings/BookingStatusDialog";
import AnalyticsLoading from "@/components/manager/analytics/AnalyticsLoading";

export function BookingsManagementContent() {
  const { bookings, trainers, loading, updateBooking, refreshBookings } = useManager();
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Используем хук для фильтрации
  const {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    trainerFilter,
    setTrainerFilter,
    dateFilter,
    setDateFilter,
    filteredBookings,
    resetFilters,
  } = useBookingFilters(bookings || []);

  // Вычисляем статистику
  const bookingStats = calculateBookingStats(bookings || []);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshBookings();
    } catch (error) {
      console.error("Ошибка при обновлении записей:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleStatusChange = async (
    bookingId: string,
    newStatus: 'scheduled' | 'completed' | 'cancelled' | 'no-show'
  ) => {
    try {
      await updateBooking(bookingId, { status: newStatus });
      setShowStatusDialog(false);
      setSelectedBooking(null);
    } catch (error) {
      console.error("Ошибка при изменении статуса:", error);
    }
  };

  const handleOpenStatusDialog = (booking: any) => {
    setSelectedBooking(booking);
    setShowStatusDialog(true);
  };

  if (loading) {
    return <AnalyticsLoading />;
  }

  // Правильная проверка активных фильтров
  const hasActiveFilters = Boolean(
    searchTerm ||
    (statusFilter && statusFilter !== "all") ||
    (trainerFilter && trainerFilter !== "all") ||
    (dateFilter && dateFilter !== "today")
  );

  return (
    <div className="min-h-[100lvh] bg-gray-50">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BookingPageHeader
          onRefresh={handleRefresh}
          refreshing={refreshing}
        />

        <BookingStats stats={bookingStats} />

        <BookingFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          trainerFilter={trainerFilter}
          setTrainerFilter={setTrainerFilter}
          dateFilter={dateFilter}
          setDateFilter={setDateFilter}
          trainers={trainers || []}
          onReset={resetFilters}
        />

        {filteredBookings.length > 0 ? (
          <>
            <BookingTable
              bookings={filteredBookings}
              onStatusChange={handleOpenStatusDialog}
            />
            <BookingMobileList
              bookings={filteredBookings}
              onStatusChange={handleOpenStatusDialog}
            />
          </>
        ) : (
          <BookingEmptyState
            hasFilters={hasActiveFilters}
            searchTerm={searchTerm}
            statusFilter={statusFilter}
            trainerFilter={trainerFilter}
            dateFilter={dateFilter}
          />
        )}
      </div>

      <BookingStatusDialog
        open={showStatusDialog}
        onOpenChange={setShowStatusDialog}
        booking={selectedBooking}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}

export default function BookingsManagement() {
  return (
      <ManagerProvider>
        <BookingsManagementContent />
      </ManagerProvider>
  );
}
