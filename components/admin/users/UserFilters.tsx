// components/admin/users/UserFilters.tsx (обновленная версия)
"use client";

import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, X, Users, Sparkles, SlidersHorizontal } from "lucide-react";
import { UserRole } from "@/types/user";

interface UserFiltersProps {
  searchTerm: string;
  onSearchChange: (search: string) => void;
  roleFilter: UserRole | 'all';
  onRoleFilterChange: (role: UserRole | 'all') => void;
  statusFilter: 'all' | 'active' | 'inactive';
  onStatusFilterChange: (status: 'all' | 'active' | 'inactive') => void;
  totalUsers: number;
  filteredUsers: number;
}

export function UserFilters({
  searchTerm,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
  statusFilter,
  onStatusFilterChange,
  totalUsers,
  filteredUsers
}: UserFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);

  const clearFilters = () => {
    onSearchChange('');
    onRoleFilterChange('all');
    onStatusFilterChange('all');
  };

  const hasActiveFilters = searchTerm || roleFilter !== 'all' || statusFilter !== 'all';
  const activeFiltersCount = [searchTerm, roleFilter !== 'all', statusFilter !== 'all'].filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* Search and Filter Toggle */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex-1 max-w-md">
            <div className="relative group">
              <Search className="absolute left-4 top-4 transform -translate-y-1/2 text-gray-400 h-5 w-5 group-focus-within:text-blue-500 transition-colors" />
              <Input
                placeholder="Поиск по имени или email..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-12 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200 bg-white/70 backdrop-blur-sm"
              />
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onSearchChange('')}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100 rounded-full"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 h-12 px-6 border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 ${
                showFilters ? 'bg-blue-50 border-blue-300 text-blue-700' : ''
              }`}
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span className="font-medium">Фильтры</span>
              {hasActiveFilters && (
                <Badge className="bg-blue-500 text-white px-2 py-0 text-xs ml-1">
                  {activeFiltersCount}
                  </Badge>
              )}
            </Button>

            {hasActiveFilters && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearFilters}
                className="h-12 px-4 hover:bg-red-50 hover:text-red-600 transition-all duration-200 group"
              >
                <X className="h-4 w-4 group-hover:rotate-90 transition-transform duration-200" />
                <span className="ml-2 font-medium">Очистить</span>
              </Button>
            )}
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Filter className="h-4 w-4 text-blue-500" />
                  Роль пользователя
                </label>
                <Select value={roleFilter} onValueChange={onRoleFilterChange}>
                  <SelectTrigger className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200 bg-white/70">
                    <SelectValue placeholder="Все роли" />
                  </SelectTrigger>
                  <SelectContent className="bg-white/95 backdrop-blur-xl border border-white/20">
                    <SelectItem value="all" className="py-3">
                      <div className="flex items-center gap-3">
                        <Users className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">Все роли</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="super-admin" className="py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"></div>
                        <span className="font-medium">Супер Администратор</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="admin" className="py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-gradient-to-r from-red-500 to-orange-500"></div>
                        <span className="font-medium">Администратор</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="manager" className="py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500"></div>
                        <span className="font-medium">Менеджер</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="trainer" className="py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-500"></div>
                        <span className="font-medium">Тренер</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="member" className="py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-gradient-to-r from-gray-500 to-slate-500"></div>
                        <span className="font-medium">Участник</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-blue-500" />
                  Статус активности
                </label>
                <Select value={statusFilter} onValueChange={onStatusFilterChange}>
                  <SelectTrigger className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200 bg-white/70">
                    <SelectValue placeholder="Все статусы" />
                  </SelectTrigger>
                  <SelectContent className="bg-white/95 backdrop-blur-xl border border-white/20">
                    <SelectItem value="all" className="py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                        <span className="font-medium">Все статусы</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="active" className="py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                        <span className="font-medium">Активные</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="inactive" className="py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                        <span className="font-medium">Неактивные</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200/50 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg">
              <Users className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">
                Показано {filteredUsers} из {totalUsers} пользователей
              </p>
              <p className="text-sm text-gray-600">
                {hasActiveFilters ? 'Применены фильтры' : 'Все пользователи'}
              </p>
            </div>
          </div>
          
          {hasActiveFilters && (
            <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 shadow-lg">
              <Filter className="h-3 w-3 mr-1" />
              Фильтры активны
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}
