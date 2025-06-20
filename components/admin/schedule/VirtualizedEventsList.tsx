// components/admin/schedule/VirtualizedEventsList.tsx
import React, { memo, useMemo } from "react";
import { FixedSizeList as List } from "react-window";
import { ScheduleEvent } from "./types";

interface VirtualizedEventsListProps {
  events: ScheduleEvent[];
  onEdit: (event: ScheduleEvent) => void;
  onDelete: (eventId: string) => void;
  onStatusChange: (eventId: string, status: ScheduleEvent["status"]) => void;
  height?: number;
  width?: number; // width должно быть числом
  itemHeight?: number;
}

const EventItem = memo(function EventItem({
  index,
  style,
  data,
}: {
  index: number;
  style: React.CSSProperties;
  data: {
    events: ScheduleEvent[];
    onEdit: (event: ScheduleEvent) => void;
    onDelete: (eventId: string) => void;
    onStatusChange: (eventId: string, status: ScheduleEvent["status"]) => void;
  };
}) {
  const event = data.events[index];
  
  if (!event) return null;

  const statusColors = {
    scheduled: "bg-blue-50 text-blue-700 border-blue-200",
    confirmed: "bg-green-50 text-green-700 border-green-200",
    completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
    cancelled: "bg-red-50 text-red-700 border-red-200",
    "no-show": "bg-gray-50 text-gray-700 border-gray-200",
  };

  const typeNames = {
    training: "Тренировка",
    consultation: "Консультация",
    group: "Групповое занятие",
    meeting: "Встреча",
    break: "Перерыв",
    other: "Другое",
  };

  const statusLabels = {
    scheduled: "Запланировано",
    confirmed: "Подтверждено",
    completed: "Завершено",
    cancelled: "Отменено",
    "no-show": "Не явился",
  };

  return (
    <div style={style} className="px-4">
      <div className="bg-white rounded-lg border p-4 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h3 className="font-semibold text-gray-900">{event.title}</h3>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium border ${
                  statusColors[event.status]
                }`}
              >
                {statusLabels[event.status]}
              </span>
              <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                {typeNames[event.type]}
              </span>
            </div>
            
            <div className="text-sm text-gray-600 space-y-1">
              <div className="flex items-center space-x-4">
                <span>
                  📅 {new Date(event.startTime).toLocaleDateString("ru")}
                </span>
                <span>
                  🕐 {new Date(event.startTime).toLocaleTimeString("ru", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })} - {new Date(event.endTime).toLocaleTimeString("ru", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              
              <div className="flex items-center space-x-4">
                <span>👨‍💼 {event.trainerName}</span>
                {event.clientName && <span>👤 {event.clientName}</span>}
                {event.location && <span>📍 {event.location}</span>}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 ml-4">
            <button
              onClick={() => data.onEdit(event)}
              className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
            >
              Редактировать
            </button>
            <button
              onClick={() => data.onDelete(event._id)}
              className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
            >
              Удалить
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

export const VirtualizedEventsList = memo(function VirtualizedEventsList({
  events,
  onEdit,
  onDelete,
  onStatusChange,
  height = 600,
  width = 800, // Изменяем на число (пиксели)
  itemHeight = 120,
}: VirtualizedEventsListProps) {
  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => 
      new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );
  }, [events]);

  const itemData = useMemo(() => ({
    events: sortedEvents,
    onEdit,
    onDelete,
    onStatusChange,
  }), [sortedEvents, onEdit, onDelete, onStatusChange]);

  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg">Событий не найдено</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 rounded-lg">
      <List
        height={height}
        width={width} // Теперь это число
        itemCount={sortedEvents.length}
        itemSize={itemHeight}
        itemData={itemData}
      >
        {EventItem}
      </List>
    </div>
  );
});
