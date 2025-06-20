// app/admin/schedule/page.tsx
"use client";

import React, { memo, Suspense } from "react";
import { useUnifiedScheduleData } from "@/hooks/useUnifiedScheduleData";
import { useSchedulePageState } from "@/hooks/useSchedulePageState";
import { useScheduleEventHandlers } from "@/hooks/useScheduleEventHandlers";
import dynamic from "next/dynamic";

// Импортируем типы из hooks/useSchedule.ts
import { ScheduleEvent, ScheduleStats } from "@/hooks/useSchedule";

// Статические импорты для критических компонентов
import { SchedulePageHeader } from "@/components/admin/schedule/SchedulePage/SchedulePageHeader";
import { ScheduleNotifications } from "@/components/admin/schedule/SchedulePage/ScheduleNotifications";
import { ScheduleStats as ScheduleStatsComponent } from "@/components/admin/schedule/ScheduleStats";
import { SchedulePageSkeleton } from "@/components/admin/schedule/SchedulePageSkeleton";

// ТОЛЬКО те динамические импорты, которые реально используются
const ScheduleTabsContainer = dynamic(
  () => import("@/components/admin/schedule/SchedulePage/ScheduleTabsContainer"),
  {
    loading: () => (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    ),
    ssr: false,
  }
);

const LazyModals = dynamic(
  () => import("@/components/admin/schedule/SchedulePage/LazyModals"),
  {
    loading: () => null,
    ssr: false,
  }
);

const LoadingOverlay = dynamic(
  () => import("@/components/admin/schedule/SchedulePage/LoadingOverlay"),
  {
    loading: () => null,
    ssr: false,
  }
);

const SchedulePage = memo(function SchedulePage() {
  // Получаем унифицированные данные
  const data = useUnifiedScheduleData();
  const pageState = useSchedulePageState();

  const {
    events,
    trainers,
    clients,
    stats,
    isApiAvailable,
    createEvent,
    updateEvent,
    deleteEvent,
    updateEventStatus,
    isLoading: isMutationLoading,
    error: mutationError,
    clearError,
  } = data;

  // Получаем оптимизированные обработчики
  const eventHandlers = useScheduleEventHandlers({
    createEvent,
    updateEvent,
    deleteEvent,
    updateEventStatus,
    editingEvent: pageState.editingEvent,
    onCloseEventForm: pageState.closeEventForm,
    onOpenEventDetails: pageState.openEventDetails,
    onOpenQuickMessage: pageState.openQuickMessage,
  });

  // Обработчики для заголовка
  const handleRefresh = () => window.location.reload();
  
  const handleExport = () => {
    const csvData = events.map((event: ScheduleEvent) => ({
      title: event.title,
      type: event.type,
      trainer: event.trainerName,
      client: event.clientName || "",
      startTime: new Date(event.startTime).toLocaleString("ru"),
      endTime: new Date(event.endTime).toLocaleString("ru"),
      status: event.status,
      location: event.location || "",
    }));

    const csv = [
      ["Название", "Тип", "Тренер", "Клиент", "Начало", "Конец", "Статус", "Место"],
      ...csvData.map((row) => Object.values(row)),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `schedule-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCreateEvent = () => {
    pageState.openEventForm();
  };

  // Показываем загрузку только при первоначальной загрузке
  if (!events && !trainers) {
    return <SchedulePageSkeleton />;
  }

  // Создаем полный объект статистики с гарантированными полями
  const fullStats: ScheduleStats | null = stats ? {
    totalEvents: stats.totalEvents || 0,
    completedEvents: stats.completedEvents || 0,
    cancelledEvents: stats.cancelledEvents || 0,
    todayEvents: stats.todayEvents || 0,
    upcomingEvents: stats.upcomingEvents || 0,
    pendingConfirmation: stats.pendingConfirmation || 0,
    overdueEvents: stats.overdueEvents || 0,
    completionRate: stats.completionRate || 0,
    cancellationRate: stats.cancellationRate || 0,
    noShowRate: stats.noShowRate || 0,
    averageSessionDuration: stats.averageSessionDuration || 0,
    totalRevenue: stats.totalRevenue || 0,
    utilizationRate: stats.utilizationRate || 0,
    eventsByStatus: stats.eventsByStatus || {
      scheduled: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0,
      "no-show": 0,
    },
    eventsByTrainer: stats.eventsByTrainer || {},
    // Добавляем поля для обратной совместимости
    byTrainer: stats.byTrainer || [],
    byType: stats.byType || {
      training: 0,
      consultation: 0,
      group: 0,
      meeting: 0,
      break: 0,
      other: 0,
    },
    byStatus: stats.byStatus || {
      scheduled: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0,
      'no-show': 0,
    },
    averageDuration: stats.averageDuration || 60,
    busyHours: stats.busyHours || [],
  } : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header - критический компонент, загружается сразу */}
      <SchedulePageHeader
        isApiAvailable={isApiAvailable}
        isMutationLoading={isMutationLoading}
        onRefresh={handleRefresh}
        onExport={handleExport}
        onCreateEvent={handleCreateEvent}
      />

      {/* Notifications - критический компонент */}
      <ScheduleNotifications
        isApiAvailable={isApiAvailable}
        mutationError={mutationError}
        onClearError={clearError}
        isDevelopment={process.env.NODE_ENV === "development"}
        debugInfo={{
          eventsCount: events.length,
          trainersCount: trainers.length,
          clientsCount: clients.length,
          isMutationLoading,
          lastEvent: events[events.length - 1],
        }}
      />

      {/* Stats - критический компонент */}
      {fullStats && (
        <div className="mb-8">
          <ScheduleStatsComponent stats={fullStats} />
        </div>
      )}

      {/* Main Content - ленивая загрузка */}
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        }
      >
        <ScheduleTabsContainer
          events={events}
          trainers={trainers}
          stats={stats}
          pageState={pageState}
          onDeleteEvent={eventHandlers.handleDeleteEvent}
          onStatusChange={eventHandlers.handleStatusChange}
        />
      </Suspense>

      {/* Modals - ленивая загрузка только при необходимости */}
      {(pageState.showEventForm || pageState.showEventDetails || pageState.showQuickMessage) && (
        <Suspense fallback={null}>
          <LazyModals
            // EventForm props
            showEventForm={pageState.showEventForm}
            editingEvent={pageState.editingEvent}
            formInitialDate={pageState.formInitialDate}
            formInitialHour={pageState.formInitialHour}
            trainers={trainers}
            clients={clients}
            isApiAvailable={isApiAvailable}
            onCloseEventForm={pageState.closeEventForm}
            onSubmitEvent={pageState.editingEvent ? eventHandlers.handleUpdateEvent : eventHandlers.handleCreateEvent}
            // EventDetailsModal props
            showEventDetails={pageState.showEventDetails}
            selectedEvent={pageState.selectedEvent}
            onCloseEventDetails={pageState.closeEventDetails}
            onEditEvent={pageState.openEventForm}
            onDeleteEvent={eventHandlers.handleDeleteEvent}
            onStatusChange={eventHandlers.handleStatusChange}
            onSendMessage={eventHandlers.handleSendQuickMessage}
            userRole="super-admin"
            // QuickMessageModal props
            showQuickMessage={pageState.showQuickMessage}
            messageRecipients={pageState.messageRecipients}
            messageRelatedTo={pageState.messageRelatedTo}
            onCloseQuickMessage={pageState.closeQuickMessage}
          />
        </Suspense>
      )}

      {/* Loading Overlay - только при мутациях */}
      {isMutationLoading && (
        <Suspense fallback={null}>
          <LoadingOverlay />
        </Suspense>
      )}
    </div>
  );
});

export default SchedulePage;
