// components/admin/schedule/OptimizedQuickActions.tsx
import React, { memo, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScheduleEvent } from "./types";

interface OptimizedQuickActionsProps {
  events: ScheduleEvent[];
  stats: any;
  onBulkAction: (action: string, eventIds: string[]) => void;
}

const QuickActionCard = memo(function QuickActionCard({
  title,
  description,
  count,
  action,
  color,
  onAction,
}: {
  title: string;
  description: string;
  count: number;
  action: string;
  color: string;
  onAction: (action: string) => void;
}) {
  const handleClick = useCallback(() => {
    onAction(action);
  }, [action, onAction]);

  const colorClasses = {
    blue: "bg-blue-50 border-blue-200 text-blue-800",
    green: "bg-green-50 border-green-200 text-green-800",
    yellow: "bg-yellow-50 border-yellow-200 text-yellow-800",
    red: "bg-red-50 border-red-200 text-red-800",
  };

  return (
    <div className={`p-4 rounded-lg border ${colorClasses[color as keyof typeof colorClasses]}`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">{title}</h3>
          <p className="text-sm opacity-75">{description}</p>
          <div className="text-2xl font-bold mt-2">{count}</div>
        </div>
        <Button
          onClick={handleClick}
          size="sm"
          variant="outline"
          className="ml-4"
        >
          Действие
        </Button>
      </div>
    </div>
  );
});

const BulkActionsPanel = memo(function BulkActionsPanel({
  events,
  onBulkAction,
}: {
  events: ScheduleEvent[];
  onBulkAction: (action: string, eventIds: string[]) => void;
}) {
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);

  const handleSelectAll = useCallback(() => {
    if (selectedEvents.length === events.length) {
      setSelectedEvents([]);
    } else {
      setSelectedEvents(events.map(e => e._id));
    }
  }, [events, selectedEvents.length]);

  const handleSelectEvent = useCallback((eventId: string) => {
    setSelectedEvents(prev => 
      prev.includes(eventId) 
        ? prev.filter(id => id !== eventId)
        : [...prev, eventId]
    );
  }, []);

  const handleBulkAction = useCallback((action: string) => {
    if (selectedEvents.length > 0) {
      onBulkAction(action, selectedEvents);
      setSelectedEvents([]);
    }
  }, [selectedEvents, onBulkAction]);

  return (
    <div className="bg-white p-6 rounded-lg border">
      <h3 className="text-lg font-semibold mb-4">Массовые действия</h3>
      
      <div className="mb-4">
        <Checkbox
          checked={selectedEvents.length === events.length && events.length > 0}
          onCheckedChange={handleSelectAll}
          className="mr-2"
        />
        <span className="text-sm">
          Выбрать все ({selectedEvents.length} из {events.length})
        </span>
      </div>

      <div className="max-h-60 overflow-y-auto mb-4">
        {events.slice(0, 50).map(event => ( // Показываем только первые 50 для производительности
          <div key={event._id} className="flex items-center space-x-2 py-1">
            <Checkbox
              checked={selectedEvents.includes(event._id)}
              onCheckedChange={() => handleSelectEvent(event._id)}
            />
            <span className="text-sm truncate flex-1">
              {event.title} - {event.trainerName}
            </span>
            <span className="text-xs text-gray-500">
              {new Date(event.startTime).toLocaleDateString("ru")}
            </span>
          </div>
        ))}
        {events.length > 50 && (
          <div className="text-sm text-gray-500 text-center py-2">
            ... и еще {events.length - 50} событий
          </div>
        )}
      </div>

      <div className="flex space-x-2">
        <Button
          onClick={() => handleBulkAction("confirm")}
          disabled={selectedEvents.length === 0}
          size="sm"
          variant="outline"
        >
          Подтвердить ({selectedEvents.length})
        </Button>
        <Button
          onClick={() => handleBulkAction("complete")}
          disabled={selectedEvents.length === 0}
          size="sm"
          variant="outline"
        >
          Завершить ({selectedEvents.length})
        </Button>
        <Button
          onClick={() => handleBulkAction("export")}
          disabled={selectedEvents.length === 0}
          size="sm"
          variant="outline"
        >
          Экспорт ({selectedEvents.length})
        </Button>
      </div>
    </div>
  );
});

export const OptimizedQuickActions = memo(function OptimizedQuickActions({
  events,
  stats,
  onBulkAction,
}: OptimizedQuickActionsProps) {
  const handleQuickAction = useCallback((action: string) => {
    let eventIds: string[] = [];
    
    switch (action) {
      case "confirm-pending":
        eventIds = events
          .filter(e => e.status === "scheduled")
          .map(e => e._id);
        onBulkAction("confirm", eventIds);
        break;
      case "complete-confirmed":
        eventIds = events
          .filter(e => e.status === "confirmed" && new Date(e.endTime) < new Date())
          .map(e => e._id);
        onBulkAction("complete", eventIds);
        break;
      case "export-all":
        onBulkAction("export", events.map(e => e._id));
        break;
    }
  }, [events, onBulkAction]);

  const quickActionData = [
    {
      title: "Ожидают подтверждения",
      description: "События со статусом 'запланировано'",
      count: stats?.pendingConfirmation || 0,
      action: "confirm-pending",
      color: "yellow",
    },
    {
      title: "Готовы к завершению",
      description: "Подтвержденные события, которые уже прошли",
      count: events.filter(e => 
        e.status === "confirmed" && new Date(e.endTime) < new Date()
      ).length,
      action: "complete-confirmed",
      color: "green",
    },
    {
      title: "Просроченные",
      description: "События, требующие внимания",
      count: stats?.overdueEvents || 0,
      action: "handle-overdue",
      color: "red",
    },
    {
      title: "Всего событий",
      description: "Экспорт всех событий",
      count: events.length,
      action: "export-all",
      color: "blue",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActionData.map((item) => (
          <QuickActionCard
            key={item.action}
            title={item.title}
            description={item.description}
            count={item.count}
            action={item.action}
            color={item.color}
            onAction={handleQuickAction}
          />
        ))}
      </div>

      {/* Bulk Actions Panel */}
      <BulkActionsPanel
        events={events}
        onBulkAction={onBulkAction}
      />

      {/* Statistics Summary */}
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">Сводка</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {stats?.totalEvents || 0}
            </div>
            <div className="text-sm text-gray-600">Всего событий</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {stats?.completedEvents || 0}
            </div>
            <div className="text-sm text-gray-600">Завершено</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {stats?.pendingEvents || 0}
            </div>
            <div className="text-sm text-gray-600">В ожидании</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {stats?.cancelledEvents || 0}
            </div>
            <div className="text-sm text-gray-600">Отменено</div>
          </div>
        </div>
      </div>
    </div>
  );
});

