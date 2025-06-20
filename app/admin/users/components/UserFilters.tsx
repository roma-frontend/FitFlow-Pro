// app/admin/users/components/UserFilters.tsx
"use client";

import React from 'react';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, X } from "lucide-react";
import { useUsersPage } from '../providers/UsersPageProvider';
import { UserRole } from "@/types/user";

export const UserFilters = React.memo(() => {
  const { state, filteredUsers, actions } = useUsersPage();

  const hasActiveFilters = state.searchTerm || state.roleFilter !== 'all' || state.statusFilter !== 'all';

  const clearAllFilters = () => {
    actions.setSearchTerm('');
    actions.setRoleFilter('all');
    actions.setStatusFilter('all');
  };

  const roleOptions: { value: UserRole | 'all'; label: string }[] = [
    { value: 'all', label: 'Все роли' },
    { value: 'super-admin', label: 'Супер админ' },
    { value: 'admin', label: 'Администратор' },
    { value: 'manager', label: 'Менеджер' },
    { value: 'trainer', label: 'Тренер' },
    { value: 'member', label: 'Участник' },
    { value: 'client', label: 'Клиент' }
  ];

  const statusOptions = [
    { value: 'all', label: 'Все статусы' },
    { value: 'active', label: 'Активные' },
    { value: 'inactive', label: 'Неактивные' }
  ];

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Поиск */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Поиск по имени или email..."
            value={state.searchTerm}
            onChange={(e) => actions.setSearchTerm(e.target.value)}
            className="pl-10 bg-white/60 border-white/30 focus:bg-white transition-colors"
          />
        </div>

        {/* Фильтр по роли */}
        <div className="w-full lg:w-48">
          <Select value={state.roleFilter} onValueChange={actions.setRoleFilter}>
            <SelectTrigger className="bg-white/60 border-white/30 focus:bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {roleOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

                {/* Фильтр по статусу */}
                <div className="w-full lg:w-48">
          <Select value={state.statusFilter} onValueChange={actions.setStatusFilter}>
            <SelectTrigger className="bg-white/60 border-white/30 focus:bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Очистить фильтры */}
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <X className="h-4 w-4" />
            Очистить
          </button>
        )}
      </div>

      {/* Результаты фильтрации */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center gap-3">
          <Filter className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-600">
            Показано {filteredUsers.length} из {state.users.length} пользователей
          </span>
        </div>

        {/* Активные фильтры */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2">
            {state.searchTerm && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                Поиск: {state.searchTerm}
              </Badge>
            )}
            {state.roleFilter !== 'all' && (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Роль: {roleOptions.find(r => r.value === state.roleFilter)?.label}
              </Badge>
            )}
            {state.statusFilter !== 'all' && (
              <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                Статус: {statusOptions.find(s => s.value === state.statusFilter)?.label}
              </Badge>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

UserFilters.displayName = 'UserFilters';

