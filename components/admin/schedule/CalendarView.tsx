// components/admin/schedule/CalendarView.tsx
import React, { memo, useState, useMemo, useCallback } from "react";
import { ChevronLeft, ChevronRight, Plus, Edit, Trash2, Eye, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScheduleEvent } from "./types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CalendarViewProps {
  events: ScheduleEvent[];
  onEventClick: (event: ScheduleEvent) => void;
  onCreateEvent: (date: Date, hour: number) => void;
  onEditEvent: (event: ScheduleEvent) => void;
  onDeleteEvent: (eventId: string) => void;
  onViewEventDetails: (event: ScheduleEvent) => void;
  userRole: string;
}

const CalendarEvent = memo(function CalendarEvent({
  event,
  onEventClick,
  onEditEvent,
  onDeleteEvent,
  isMobile = false,
}: {
  event: ScheduleEvent;
  onEventClick: (event: ScheduleEvent) => void;
  onEditEvent: (event: ScheduleEvent) => void;
  onDeleteEvent: (eventId: string) => void;
  isMobile?: boolean;
}) {
  const [showActions, setShowActions] = useState(false);

  const statusConfig = {
    scheduled: {
      bg: "bg-gradient-to-r from-blue-50 to-blue-100",
      border: "border-l-blue-500",
      text: "text-blue-900",
      dot: "bg-blue-500",
      shadow: "hover:shadow-blue-200/50"
    },
    confirmed: {
      bg: "bg-gradient-to-r from-emerald-50 to-emerald-100",
      border: "border-l-emerald-500",
      text: "text-emerald-900",
      dot: "bg-emerald-500",
      shadow: "hover:shadow-emerald-200/50"
    },
    completed: {
      bg: "bg-gradient-to-r from-green-50 to-green-100",
      border: "border-l-green-500",
      text: "text-green-900",
      dot: "bg-green-500",
      shadow: "hover:shadow-green-200/50"
    },
    cancelled: {
      bg: "bg-gradient-to-r from-red-50 to-red-100",
      border: "border-l-red-500",
      text: "text-red-900",
      dot: "bg-red-500",
      shadow: "hover:shadow-red-200/50"
    },
    "no-show": {
      bg: "bg-gradient-to-r from-gray-50 to-gray-100",
      border: "border-l-gray-500",
      text: "text-gray-900",
      dot: "bg-gray-500",
      shadow: "hover:shadow-gray-200/50"
    },
  };

  const config = statusConfig[event.status];

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onEventClick(event);
  }, [event, onEventClick]);

  const handleEdit = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onEditEvent(event);
  }, [event, onEditEvent]);

  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Удалить это событие?")) {
      onDeleteEvent(event._id);
    }
  }, [event._id, onDeleteEvent]);

  // Мобильная версия события
  if (isMobile) {
    return (
      <div
        className={`
          relative p-3 rounded-xl border-l-4 cursor-pointer 
          transition-all duration-300 ease-out mb-2
          ${config.bg} ${config.border} ${config.text} ${config.shadow}
          hover:shadow-lg active:scale-95
          backdrop-blur-sm border border-white/20
        `}
        onClick={handleClick}
      >
        {/* Мобильный контент */}
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <div className={`w-2 h-2 rounded-full ${config.dot}`} />
              <span className="text-xs font-medium opacity-75 uppercase tracking-wide truncate">
                {event.status}
              </span>
            </div>
            
            <h4 className="font-semibold text-sm leading-tight mb-1 truncate">
              {event.title}
            </h4>
            
            <div className="space-y-1">
              <p className="text-xs opacity-80 truncate">
                👨‍💼 {event.trainerName}
              </p>
              {event.clientName && (
                <p className="text-xs opacity-80 truncate">
                  👤 {event.clientName}
                </p>
              )}
              <div className="flex items-center gap-1 text-xs opacity-75">
                <span>🕐</span>
                <span>
                  {new Date(event.startTime).toLocaleTimeString("ru", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Мобильное меню действий */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 opacity-60 hover:opacity-100"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={handleEdit}>
                <Edit className="mr-2 h-4 w-4" />
                Редактировать
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                Удалить
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    );
  }

  // Десктопная версия события (оригинальная)
  return (
    <div
      className={`
        group relative p-3 rounded-xl border-l-4 cursor-pointer 
        transition-all duration-300 ease-out
        ${config.bg} ${config.border} ${config.text} ${config.shadow}
        hover:shadow-lg hover:scale-[1.02] hover:-translate-y-0.5
        backdrop-blur-sm border border-white/20
      `}
      onClick={handleClick}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Десктопный контент остается прежним */}
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-2 h-2 rounded-full ${config.dot} animate-pulse`} />
        <span className="text-xs font-medium opacity-75 uppercase tracking-wide truncate">
          {event.status}
        </span>
      </div>

      <div className="space-y-1">
        <h4 className="font-semibold text-sm leading-tight line-clamp-2">
          {event.title}
        </h4>
        <p className="text-xs opacity-80 line-clamp-1">
          👨‍💼 {event.trainerName}
        </p>
        {event.clientName && (
          <p className="text-xs opacity-80 line-clamp-1">
            👤 {event.clientName}
          </p>
        )}
        <div className="flex items-center gap-1 text-xs opacity-75">
          <span>🕐</span>
          <span>
            {new Date(event.startTime).toLocaleTimeString("ru", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      </div>
      
      {/* Десктопные кнопки действий */}
      <div className={`
        absolute top-2 right-2 flex gap-1 transition-all duration-200
        ${showActions ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1'}
      `}>
        <button
          onClick={handleEdit}
          className="p-1.5 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white 
                   shadow-sm hover:shadow-md transition-all duration-200 
                   hover:scale-110 group/btn"
          title="Редактировать"
        >
          <Edit className="w-3 h-3 text-gray-600 group-hover/btn:text-blue-600" />
        </button>
        <button
          onClick={handleDelete}
          className="p-1.5 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white 
                   shadow-sm hover:shadow-md transition-all duration-200 
                   hover:scale-110 group/btn"
          title="Удалить"
        >
          <Trash2 className="w-3 h-3 text-gray-600 group-hover/btn:text-red-600" />
        </button>
      </div>
    </div>
  );
});

const CalendarDay = memo(function CalendarDay({
  date,
  events,
  onEventClick,
  onCreateEvent,
  onEditEvent,
  onDeleteEvent,
  isToday,
  isCurrentMonth,
  isMobile = false,
}: {
  date: Date;
  events: ScheduleEvent[];
  onEventClick: (event: ScheduleEvent) => void;
  onCreateEvent: (date: Date, hour: number) => void;
  onEditEvent: (event: ScheduleEvent) => void;
  onDeleteEvent: (eventId: string) => void;
  isToday: boolean;
  isCurrentMonth: boolean;
  isMobile?: boolean;
}) {
  const [isHovered, setIsHovered] = useState(false);

  const handleCreateEvent = useCallback(() => {
    onCreateEvent(date, 10);
  }, [date, onCreateEvent]);

  const dayEvents = useMemo(() => {
    return events.filter(event => {
      const eventDate = new Date(event.startTime);
      return eventDate.toDateString() === date.toDateString();
    }).sort((a, b) => 
      new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );
  }, [events, date]);

  const isWeekend = date.getDay() === 0 || date.getDay() === 6;

  // Мобильная версия дня
  if (isMobile) {
    return (
      <div
        className={`
          min-h-[100px] border border-gray-200/60 p-2 transition-all duration-300 rounded-lg mb-2
          ${isToday 
            ? "bg-gradient-to-br from-blue-50 via-blue-25 to-white border-blue-300 shadow-lg shadow-blue-100/50" 
            : isWeekend 
              ? "bg-gradient-to-br from-gray-25 to-white" 
              : "bg-white"
          }
          ${!isCurrentMonth ? "opacity-40" : ""}
        `}
      >
        {/* Мобильный заголовок дня */}
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <span
              className={`
                text-lg font-bold transition-colors
                ${isToday 
                  ? "text-blue-600 bg-blue-100 w-8 h-8 rounded-full flex items-center justify-center text-sm" 
                  : isWeekend
                    ? "text-gray-500"
                    : "text-gray-700"
                }
              `}
            >
              {date.getDate()}
            </span>
            {isToday && (
              <div className="text-xs text-blue-600 font-medium">
                Сегодня
              </div>
            )}
          </div>
          
          <button
            onClick={handleCreateEvent}
            className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 
                     transition-all duration-200 active:scale-95"
            title="Создать событие"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        
        {/* Мобильные события */}
        <div className="space-y-2">
          {dayEvents.map(event => (
            <CalendarEvent
              key={event._id}
              event={event}
              onEventClick={onEventClick}
              onEditEvent={onEditEvent}
              onDeleteEvent={onDeleteEvent}
              isMobile={true}
            />
          ))}
          
          {dayEvents.length === 0 && (
            <div className="text-xs text-gray-400 text-center py-4 
                           border-2 border-dashed border-gray-200 rounded-lg">
              Нет событий
            </div>
          )}
        </div>
      </div>
    );
  }

  // Десктопная версия дня (оригинальная)
  return (
    <div
      className={`
        min-h-[140px] sm:min-h-[120px] lg:min-h-[140px] 
        border border-gray-200/60 p-2 sm:p-3 transition-all duration-300
        ${isToday 
          ? "bg-gradient-to-br from-blue-50 via-blue-25 to-white border-blue-300 shadow-lg shadow-blue-100/50" 
          : isWeekend 
            ? "bg-gradient-to-br from-gray-25 to-white" 
            : "bg-white hover:bg-gray-25"
        }
        ${!isCurrentMonth ? "opacity-40" : ""}
        ${isHovered ? "shadow-lg shadow-gray-200/50 scale-[1.01]" : ""}
        hover:border-gray-300 rounded-lg
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Десктопный заголовок дня */}
      <div className="flex justify-between items-center mb-2 sm:mb-3">
        <div className="flex items-center gap-2">
          <span
            className={`
              text-sm sm:text-base font-semibold transition-colors
              ${isToday 
                ? "text-blue-600 bg-blue-100 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center" 
                : isWeekend
                  ? "text-gray-500"
                  : "text-gray-700"
              }
            `}
          >
            {date.getDate()}
          </span>
          {isToday && (
            <div className="hidden sm:block text-xs text-blue-600 font-medium">
              Сегодня
            </div>
          )}
        </div>
        
        <button
          onClick={handleCreateEvent}
          className={`
            p-1.5 rounded-lg transition-all duration-200
            ${isHovered 
              ? "bg-blue-100 text-blue-600 shadow-sm scale-110" 
              : "text-gray-400 hover:text-blue-600 hover:bg-blue-50"
            }
          `}
          title="Создать событие"
        >
          <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
        </button>
      </div>
      
      {/* Десктопные события */}
      <div className="space-y-1.5 sm:space-y-2">
        {dayEvents.slice(0, 3).map(event => (
          <CalendarEvent
            key={event._id}
            event={event}
            onEventClick={onEventClick}
            onEditEvent={onEditEvent}
            onDeleteEvent={onDeleteEvent}
            isMobile={false}
          />
        ))}
        
        {dayEvents.length > 3 && (
          <div className="text-xs text-gray-500 text-center py-1 px-2 
                         bg-gray-100 rounded-lg hover:bg-gray-200 
                         transition-colors cursor-pointer">
            +{dayEvents.length - 3} событий
          </div>
        )}
        
        {dayEvents.length === 0 && isHovered && (
          <div className="text-xs text-gray-400 text-center py-4 
                         border-2 border-dashed border-gray-200 rounded-lg">
            Нет событий
          </div>
        )}
      </div>
    </div>
  );
});

const CalendarView = memo(function CalendarView({
  events,
  onEventClick,
  onCreateEvent,
  onEditEvent,
  onDeleteEvent,
  onViewEventDetails,
  userRole,
}: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isMobile, setIsMobile] = useState(false);

  // Проверка мобильного устройства
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()));
    
    const days = [];
    const currentDay = new Date(startDate);
    
    while (currentDay <= endDate) {
      days.push(new Date(currentDay));
      currentDay.setDate(currentDay.getDate() + 1);
    }
    
    return {
      days,
      monthName: firstDay.toLocaleDateString("ru", { 
        month: "long", 
        year: "numeric" 
      }),
      currentMonth: month,
      currentYear: year,
    };
  }, [currentDate]);

  const today = useMemo(() => new Date(), []);

  const handlePrevMonth = useCallback(() => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  }, []);

  const handleNextMonth = useCallback(() => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  }, []);

  const handleToday = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

  const weekDays = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];

  // Мобильная версия календаря
  if (isMobile) {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200/60 overflow-hidden">
        {/* Мобильный заголовок */}
        <div className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-200/60 p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 capitalize">
              {calendarData.monthName}
            </h2>
            
            <div className="flex items-center gap-2">
              <Button
                onClick={handleToday}
                variant="outline"
                size="sm"
                className="bg-white hover:bg-blue-50 hover:border-blue-300 
                         transition-all duration-200 shadow-sm text-xs px-3"
              >
                Сегодня
              </Button>
              
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <Button
                  onClick={handlePrevMonth}
                  variant="ghost"
                  size="sm"
                  className="hover:bg-white hover:shadow-sm transition-all duration-200 h-8 w-8 p-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  onClick={handleNextMonth}
                  variant="ghost"
                  size="sm"
                  className="hover:bg-white hover:shadow-sm transition-all duration-200 h-8 w-8 p-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Мобильная статистика */}
          <div className="text-sm text-gray-600">
            {events.length} событий в этом месяце
          </div>
        </div>

        {/* Мобильный список дней */}
        <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
          {calendarData.days
            .filter(date => date.getMonth() === calendarData.currentMonth)
            .map((date, index) => (
              <CalendarDay
                key={`${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`}
                date={date}
                events={events}
                onEventClick={onViewEventDetails}
                onCreateEvent={onCreateEvent}
                onEditEvent={onEditEvent}
                onDeleteEvent={onDeleteEvent}
                isToday={date.toDateString() === today.toDateString()}
                isCurrentMonth={date.getMonth() === calendarData.currentMonth}
                isMobile={true}
              />
            ))}
        </div>
      </div>
    );
  }

  // Десктопная версия календаря (оригинальная)
  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200/60 overflow-hidden">
      {/* Десктопный заголовок */}
      <div className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-200/60 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 capitalize">
              {calendarData.monthName}
            </h2>
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              <span className="text-sm text-gray-600">
                {events.length} событий
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              onClick={handleToday}
              variant="outline"
              size="sm"
              className="bg-white hover:bg-blue-50 hover:border-blue-300 
                       transition-all duration-200 shadow-sm"
            >
              Сегодня
            </Button>
            
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <Button
                onClick={handlePrevMonth}
                variant="ghost"
                size="sm"
                className="hover:bg-white hover:shadow-sm transition-all duration-200"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                onClick={handleNextMonth}
                variant="ghost"
                size="sm"
                className="hover:bg-white hover:shadow-sm transition-all duration-200"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Десктопная сетка дней недели */}
      <div className="grid grid-cols-7 border-b border-gray-200/60 bg-gray-50/50">
        {weekDays.map((day, index) => (
          <div 
            key={day} 
            className={`
              p-3 sm:p-4 text-center text-xs sm:text-sm font-semibold 
              text-gray-600 border-r border-gray-200/40 last:border-r-0
              ${index === 0 || index === 6 ? 'bg-gray-100/50' : ''}
            `}
          >
            <span className="hidden sm:inline">{day}</span>
            <span className="sm:hidden">{day[0]}</span>
          </div>
        ))}
      </div>

      {/* Десктопная сетка календаря */}
      <div className="grid grid-cols-7 gap-0 bg-gray-50/30">
        {calendarData.days.map((date, index) => (
          <CalendarDay
            key={`${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`}
            date={date}
            events={events}
            onEventClick={onViewEventDetails}
            onCreateEvent={onCreateEvent}
            onEditEvent={onEditEvent}
            onDeleteEvent={onDeleteEvent}
            isToday={date.toDateString() === today.toDateString()}
            isCurrentMonth={date.getMonth() === calendarData.currentMonth}
            isMobile={false}
          />
        ))}
      </div>
    </div>
  );
});

export default CalendarView;
