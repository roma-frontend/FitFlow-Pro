// components/manager/trainers/TrainerFilters.tsx (обновленная версия с типизацией)
"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter } from "lucide-react";

interface TrainerFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  specializationFilter: string;
  setSpecializationFilter: (value: string) => void;
  specializations: string[];
  onReset: () => void;
}

export default function TrainerFilters({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  specializationFilter,
  setSpecializationFilter,
  specializations,
  onReset,
}: TrainerFiltersProps) {
  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Поиск */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Поиск по имени или email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Фильтр по статусу */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Статус" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все статусы</SelectItem>
              <SelectItem value="active">Активные</SelectItem>
              <SelectItem value="busy">Занятые</SelectItem>
              <SelectItem value="inactive">Неактивные</SelectItem>
              <SelectItem value="vacation">В отпуске</SelectItem>
            </SelectContent>
          </Select>

          {/* Фильтр по специализации */}
          <Select
            value={specializationFilter}
            onValueChange={setSpecializationFilter}
          >
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Специализация" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все специализации</SelectItem>
              {specializations.map((spec: string) => (
                <SelectItem key={spec} value={spec}>
                  {spec}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Кнопка сброса фильтров */}
          <Button
            variant="outline"
            onClick={onReset}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Сбросить
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
