// components/PlansFilters.tsx
import React, { memo } from 'react';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Search, Filter } from "lucide-react";
import type { FilterType, SortBy } from '@/types/common';

interface PlansFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filterType: FilterType;
  onFilterTypeChange: (value: FilterType) => void;
  sortBy: SortBy;
  onSortByChange: (value: SortBy) => void;
  showActiveOnly: boolean;
  onShowActiveOnlyChange: (value: boolean) => void;
  resultsCount: number;
  totalCount: number;
}

export const PlansFilters = memo<PlansFiltersProps>(({
  searchTerm,
  onSearchChange,
  filterType,
  onFilterTypeChange,
  sortBy,
  onSortByChange,
  showActiveOnly,
  onShowActiveOnlyChange,
  resultsCount,
  totalCount
}) => {
  return (
    <div className="bg-white rounded-lg border p-4 mb-6 space-y-4">
      <div className="flex items-center gap-2 mb-3">
        <Filter className="h-4 w-4 text-gray-500" />
        <span className="font-medium text-gray-700">Фильтры и поиск</span>
        <span className="text-sm text-gray-500 ml-auto">
          {resultsCount} из {totalCount} планов
        </span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Поиск */}
        <div className="space-y-2">
          <Label htmlFor="search">Поиск</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="search"
              placeholder="Поиск по названию или описанию..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Тип плана */}
        <div className="space-y-2">
          <Label>Тип плана</Label>
          <Select value={filterType} onValueChange={onFilterTypeChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все типы</SelectItem>
              <SelectItem value="basic">Базовый</SelectItem>
              <SelectItem value="premium">Премиум</SelectItem>
              <SelectItem value="vip">VIP</SelectItem>
              <SelectItem value="unlimited">Безлимит</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Сортировка */}
        <div className="space-y-2">
          <Label>Сортировка</Label>
          <Select value={sortBy} onValueChange={onSortByChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">По названию</SelectItem>
              <SelectItem value="price">По цене</SelectItem>
              <SelectItem value="duration">По длительности</SelectItem>
              <SelectItem value="createdAt">По дате создания</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Только активные */}
        <div className="space-y-2">
          <Label>Статус</Label>
          <div className="flex items-center space-x-2 pt-2">
            <Switch
              id="active-only"
              checked={showActiveOnly}
              onCheckedChange={onShowActiveOnlyChange}
            />
            <Label htmlFor="active-only" className="text-sm font-normal">
              Только активные
            </Label>
          </div>
        </div>
      </div>
    </div>
  );
});

PlansFilters.displayName = 'PlansFilters';