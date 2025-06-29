// components/admin/schedule/EventsList.tsx
import React, { memo, useState, useMemo } from "react";
import { 
  Calendar, 
  Clock, 
  User, 
  MapPin, 
  Edit, 
  Trash2, 
  MoreVertical,
  Filter,
  Search,
  SortAsc,
  Eye,
  Users
} from "lucide-react";
import { ScheduleEvent } from "./types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface EventsListProps {
  events: ScheduleEvent[];
  onEdit: (event: ScheduleEvent) => void;
  onDelete: (eventId: string) => void;
  onStatusChange: (eventId: string, status: ScheduleEvent["status"]) => void;
}

const EventCard = memo(function EventCard({
  event,
  onEdit,
  onDelete,
  onStatusChange,
}: {
  event: ScheduleEvent;
  onEdit: (event: ScheduleEvent) => void;
  onDelete: (eventId: string) => void;
  onStatusChange: (eventId: string, status: ScheduleEvent["status"]) => void;
}) {
  const statusConfig = {
    scheduled: {
      gradient: "from-blue-500 to-blue-600",
      bg: "bg-blue-50",
      text: "text-blue-700",
      border: "border-blue-200",
      dot: "bg-blue-500",
      label: "Запланировано"
    },
    confirmed: {
      gradient: "from-emerald-500 to-emerald-600",
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      border: "border-emerald-200",
      dot: "bg-emerald-500",
      label: "Подтверждено"
    },
    completed: {
      gradient: "from-green-500 to-green-600",
      bg: "bg-green-50",
      text: "text-green-700",
      border: "border-green-200",
      dot: "bg-green-500",
      label: "Завершено"
    },
    cancelled: {
      gradient: "from-red-500 to-red-600",
      bg: "bg-red-50",
      text: "text-red-700",
      border: "border-red-200",
      dot: "bg-red-500",
      label: "Отменено"
    },
    "no-show": {
      gradient: "from-gray-500 to-gray-600",
      bg: "bg-gray-50",
      text: "text-gray-700",
      border: "border-gray-200",
      dot: "bg-gray-500",
      label: "Не явился"
    },
  };

  const typeConfig = {
    training: { label: "Тренировка", icon: "🏋️", color: "bg-blue-100 text-blue-700" },
    consultation: { label: "Консультация", icon: "💬", color: "bg-purple-100 text-purple-700" },
    group: { label: "Групповое", icon: "👥", color: "bg-green-100 text-green-700" },
    meeting: { label: "Встреча", icon: "🤝", color: "bg-orange-100 text-orange-700" },
    break: { label: "Перерыв", icon: "☕", color: "bg-gray-100 text-gray-700" },
    other: { label: "Другое", icon: "📋", color: "bg-indigo-100 text-indigo-700" },
  };

  const config = statusConfig[event.status];
  const typeInfo = typeConfig[event.type];

  const handleDelete = () => {
    if (confirm("Удалить это событие?")) {
      onDelete(event._id);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("ru", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString("ru", {
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="group relative bg-white rounded-2xl border border-gray-200/60 p-6 
                   shadow-sm hover:shadow-xl hover:shadow-gray-200/40 
                   transition-all duration-300 hover:scale-[1.01] hover:-translate-y-1
                   backdrop-blur-sm">
      
      {/* Градиентная полоска статуса */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${config.gradient} rounded-t-2xl`} />
      
      {/* Заголовок карточки */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-bold text-lg text-gray-900 truncate">
              {event.title}
            </h3>
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${typeInfo.color}`}>
              <span>{typeInfo.icon}</span>
              <span>{typeInfo.label}</span>
            </div>
          </div>
          
          {/* Статус */}
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${config.bg} ${config.text} ${config.border} border`}>
            <div className={`w-2 h-2 rounded-full ${config.dot} animate-pulse`} />
            {config.label}
          </div>
        </div>

        {/* Меню действий */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 
                       h-8 w-8 p-0 hover:bg-gray-100"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => onEdit(event)}>
              <Edit className="mr-2 h-4 w-4" />
              Редактировать
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Eye className="mr-2 h-4 w-4" />
              Подробности
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleDelete} className="text-red-600">
              <Trash2 className="mr-2 h-4 w-4" />
              Удалить
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Основная информация */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        {/* Дата и время */}
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-gray-600">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900">
                {formatDate(event.startTime)}
              </div>
              <div className="text-xs text-gray-500">
                Дата события
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 text-gray-600">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Clock className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900">
                {formatTime(event.startTime)} - {formatTime(event.endTime)}
              </div>
              <div className="text-xs text-gray-500">
                Время проведения
              </div>
            </div>
          </div>
        </div>

        {/* Участники и место */}
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-gray-600">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <User className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium text-gray-900 truncate">
                {event.trainerName}
              </div>
              <div className="text-xs text-gray-500">
                Тренер
              </div>
            </div>
          </div>

          {event.clientName && (
            <div className="flex items-center gap-3 text-gray-600">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Users className="h-4 w-4 text-orange-600" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-gray-900 truncate">
                  {event.clientName}
                </div>
                <div className="text-xs text-gray-500">
                  Клиент
                </div>
              </div>
            </div>
          )}

          {event.location && (
            <div className="flex items-center gap-3 text-gray-600">
              <div className="p-2 bg-red-100 rounded-lg">
                <MapPin className="h-4 w-4 text-red-600" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-gray-900 truncate">
                  {event.location}
                </div>
                <div className="text-xs text-gray-500">
                  Место проведения
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Описание */}
      {event.description && (
        <div className="pt-4 border-t border-gray-100">
          <p className="text-sm text-gray-600 line-clamp-2">
            {event.description}
          </p>
        </div>
      )}

      {/* Быстрые действия */}
      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100 
                     opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <Button
          onClick={() => onEdit(event)}
          variant="outline"
          size="sm"
          className="flex-1 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700"
        >
          <Edit className="mr-2 h-4 w-4" />
          Редактировать
        </Button>
        
        <Select onValueChange={(value) => onStatusChange(event._id, value as ScheduleEvent["status"])}>
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Изменить статус" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="scheduled">Запланировано</SelectItem>
            <SelectItem value="confirmed">Подтверждено</SelectItem>
            <SelectItem value="completed">Завершено</SelectItem>
            <SelectItem value="cancelled">Отменено</SelectItem>
            <SelectItem value="no-show">Не явился</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
});

const EventsList = memo(function EventsList({
  events,
  onEdit,
  onDelete,
  onStatusChange,
}: EventsListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("startTime");

  // Фильтрация и сортировка событий
  const filteredAndSortedEvents = useMemo(() => {
    let filtered = events.filter(event => {
      const matchesSearch = 
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.trainerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (event.clientName && event.clientName.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = statusFilter === "all" || event.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });

    // Сортировка
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "startTime":
          return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
        case "title":
          return a.title.localeCompare(b.title);
        case "status":
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

    return filtered;
  }, [events, searchTerm, statusFilter, sortBy]);

  const statusCounts = useMemo(() => {
    return events.reduce((acc, event) => {
      acc[event.status] = (acc[event.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [events]);

  return (
    <div className="space-y-6">
      {/* Заголовок с статистикой */}
      <div className="bg-gradient-to-r from-white via-blue-50/30 to-white rounded-2xl p-6 border border-gray-200/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Список событий
            </h2>
            <p className="text-gray-600">
              Всего событий: <span className="font-semibold">{events.length}</span>
            </p>
          </div>
          
          {/* Быстрая статистика */}
          <div className="flex flex-wrap gap-3">
            {Object.entries(statusCounts).map(([status, count]) => {
              const config = {
                scheduled: { label: "Запланировано", color: "bg-blue-100 text-blue-700" },
                confirmed: { label: "Подтверждено", color: "bg-emerald-100 text-emerald-700" },
                completed: { label: "Завершено", color: "bg-green-100 text-green-700" },
                cancelled: { label: "Отменено", color: "bg-red-100 text-red-700" },
                "no-show": { label: "Не явился", color: "bg-gray-100 text-gray-700" },
              }[status];
              
              return config ? (
                <div key={status} className={`px-3 py-1.5 rounded-full text-sm font-medium ${config.color}`}>
                  {config.label}: {count}
                </div>
              ) : null;
            })}
          </div>
        </div>

        {/* Фильтры и поиск */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Поиск событий..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white border-gray-200 focus:border-blue-300 focus:ring-blue-200"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="bg-white border-gray-200">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Фильтр по статусу" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все статусы</SelectItem>
              <SelectItem value="scheduled">Запланировано</SelectItem>
              <SelectItem value="confirmed">Подтверждено</SelectItem>
              <SelectItem value="completed">Завершено</SelectItem>
              <SelectItem value="cancelled">Отменено</SelectItem>
              <SelectItem value="no-show">Не явился</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="bg-white border-gray-200">
              <SortAsc className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Сортировка" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="startTime">По времени</SelectItem>
              <SelectItem value="title">По названию</SelectItem>
              <SelectItem value="status">По статусу</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Список событий */}
      {filteredAndSortedEvents.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-200/60">
          <div className="text-gray-400 text-6xl mb-4">📅</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {searchTerm || statusFilter !== "all" ? "Событий не найдено" : "Нет событий"}
          </h3>
          <p className="text-gray-500">
            {searchTerm || statusFilter !== "all" 
              ? "Попробуйте изменить критерии поиска или фильтры"
              : "Создайте первое событие для начала работы"
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredAndSortedEvents.map((event) => (
            <EventCard
              key={event._id}
              event={event}
              onEdit={onEdit}
              onDelete={onDelete}
              onStatusChange={onStatusChange}
            />
          ))}
        </div>
      )}
    </div>
  );
});

export default EventsList;
