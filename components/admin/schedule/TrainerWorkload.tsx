// components/admin/schedule/TrainerWorkload.tsx
import React, { memo, useMemo } from "react";
import { ScheduleEvent } from "./types";

interface TrainerWorkloadProps {
  trainers: any[];
  events: ScheduleEvent[];
  onEventClick: (event: ScheduleEvent) => void;
}

const TrainerWorkload = memo(function TrainerWorkload({
  trainers,
  events,
  onEventClick,
}: TrainerWorkloadProps) {
  const trainerStats = useMemo(() => {
    return trainers.map(trainer => {
      const trainerEvents = events.filter(event => 
        event.trainerId === trainer.id || event.trainerId === trainer.trainerId
      );
      
      const todayEvents = trainerEvents.filter(event => {
        const eventDate = new Date(event.startTime);
        const today = new Date();
        return eventDate.toDateString() === today.toDateString();
      });

      const weekEvents = trainerEvents.filter(event => {
        const eventDate = new Date(event.startTime);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return eventDate >= weekAgo;
      });

      return {
        ...trainer,
        totalEvents: trainerEvents.length,
        todayEvents: todayEvents.length,
        weekEvents: weekEvents.length,
        upcomingEvents: trainerEvents.filter(event => 
          new Date(event.startTime) > new Date() && event.status !== 'cancelled'
        ),
      };
    });
  }, [trainers, events]);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">
        Загрузка тренеров
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {trainerStats.map(trainer => (
          <div key={trainer.id || trainer.trainerId} className="bg-white rounded-lg border p-6 shadow-sm">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold">
                  {(trainer.name || trainer.trainerName).charAt(0)}
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {trainer.name || trainer.trainerName}
                </h3>
                <p className="text-sm text-gray-500">
                  {trainer.role || trainer.trainerRole || "Тренер"}
                </p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Сегодня:</span>
                <span className="font-semibold">{trainer.todayEvents}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">За неделю:</span>
                <span className="font-semibold">{trainer.weekEvents}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Предстоящих:</span>
                <span className="font-semibold">{trainer.upcomingEvents.length}</span>
              </div>
            </div>
            
            {trainer.upcomingEvents.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Ближайшие события:
                </h4>
                <div className="space-y-1">
                  {trainer.upcomingEvents.slice(0, 3).map((event: ScheduleEvent) => (
                    <button
                      key={event._id}
                      onClick={() => onEventClick(event)}
                      className="w-full text-left text-xs text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      {event.title} - {new Date(event.startTime).toLocaleDateString("ru")}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
});

export default TrainerWorkload;
