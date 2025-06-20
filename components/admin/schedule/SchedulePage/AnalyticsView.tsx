// components/admin/schedule/SchedulePage/AnalyticsView.tsx
import React, { memo, useMemo } from "react";
import { ScheduleEvent } from "../types";

interface AnalyticsViewProps {
  events: ScheduleEvent[];
  trainers: any[];
  stats: any;
}

const AnalyticsView = memo(function AnalyticsView({
  events,
  trainers,
  stats,
}: AnalyticsViewProps) {
  const analyticsData = useMemo(() => {
    const eventsByType = events.reduce((acc, event) => {
      acc[event.type] = (acc[event.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const eventsByStatus = events.reduce((acc, event) => {
      acc[event.status] = (acc[event.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const eventsByTrainer = events.reduce((acc, event) => {
      acc[event.trainerName] = (acc[event.trainerName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      eventsByType,
      eventsByStatus,
      eventsByTrainer,
      totalEvents: events.length,
      completionRate: events.length > 0
        ? Math.round((eventsByStatus.completed || 0) / events.length * 100)
        : 0,
    };
  }, [events]);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">
        Аналитика и отчеты
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Events by Type */}
        <div className="bg-white rounded-lg border p-6">
          <h3 className="font-semibold text-gray-900 mb-4">По типам событий</h3>
          <div className="space-y-2">
            {Object.entries(analyticsData.eventsByType).map(([type, count]) => (
              <div key={type} className="flex justify-between">
                <span className="text-sm text-gray-600 capitalize">{type}</span>
                <span className="font-semibold">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Events by Status */}
        <div className="bg-white rounded-lg border p-6">
          <h3 className="font-semibold text-gray-900 mb-4">По статусам</h3>
          <div className="space-y-2">
            {Object.entries(analyticsData.eventsByStatus).map(([status, count]) => (
              <div key={status} className="flex justify-between">
                <span className="text-sm text-gray-600 capitalize">{status}</span>
                <span className="font-semibold">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Completion Rate */}
        <div className="bg-white rounded-lg border p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Показатели</h3>
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {analyticsData.completionRate}%
              </div>
              <div className="text-sm text-gray-600">Завершено</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {analyticsData.totalEvents}
              </div>
              <div className="text-sm text-gray-600">Всего событий</div>
            </div>
          </div>
        </div>
      </div>

      {/* Events by Trainer */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Активность тренеров</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(analyticsData.eventsByTrainer)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 6)
            .map(([trainer, count]) => (
              <div key={trainer} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span className="text-sm font-medium text-gray-700">{trainer}</span>
                <span className="text-lg font-bold text-blue-600">{count}</span>
              </div>
            ))}
        </div>
      </div>

      {/* Monthly Trend */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Тренд по месяцам</h3>
        <div className="text-center text-gray-500">
          График в разработке...
        </div>
      </div>
    </div>
  );
});

export default AnalyticsView;
