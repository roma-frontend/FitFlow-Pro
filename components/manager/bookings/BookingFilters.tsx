// components/manager/bookings/BookingFilters.tsx
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter } from "lucide-react";

interface BookingFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  trainerFilter: string;
  setTrainerFilter: (value: string) => void;
  dateFilter: string;
  setDateFilter: (value: string) => void;
  trainers: Array<{ id: string; name: string }>;
  onReset: () => void;
}

export default function BookingFilters({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  trainerFilter,
  setTrainerFilter,
  dateFilter,
  setDateFilter,
  trainers,
  onReset,
}: BookingFiltersProps) {
  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Поиск */}
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Поиск по клиенту, тренеру или услуге..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Фильтр по дате */}
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Дата" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все даты</SelectItem>
              <SelectItem value="yesterday">Вчера</SelectItem>
              <SelectItem value="today">Сегодня</SelectItem>
              <SelectItem value="tomorrow">Завтра</SelectItem>
              <SelectItem value="week">Эта неделя</SelectItem>
            </SelectContent>
          </Select>

          {/* Фильтр по статусу */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Статус" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все статусы</SelectItem>
              <SelectItem value="scheduled">Запланированные</SelectItem>
              <SelectItem value="completed">Завершенные</SelectItem>
              <SelectItem value="cancelled">Отмененные</SelectItem>
              <SelectItem value="no-show">Не явился</SelectItem>
            </SelectContent>
          </Select>

          {/* Фильтр по тренеру */}
          <Select value={trainerFilter} onValueChange={setTrainerFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Тренер" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все тренеры</SelectItem>
              {trainers.map((trainer) => (
                <SelectItem key={trainer.id} value={trainer.id}>
                  {trainer.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Быстрые фильтры */}
        <div className="flex flex-wrap gap-2 mt-4">
          <Button
            variant={dateFilter === "today" ? "default" : "outline"}
            size="sm"
            onClick={() => setDateFilter("today")}
          >
            Сегодня
          </Button>
          <Button
            variant={dateFilter === "tomorrow" ? "default" : "outline"}
            size="sm"
            onClick={() => setDateFilter("tomorrow")}
          >
            Завтра
          </Button>
          <Button
            variant={statusFilter === "scheduled" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("scheduled")}
          >
            Запланированные
          </Button>
          <Button
            variant={statusFilter === "completed" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("completed")}
          >
            Завершенные
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onReset}
            className="text-gray-600"
          >
            <Filter className="h-4 w-4 mr-2" />
            Сбросить
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
