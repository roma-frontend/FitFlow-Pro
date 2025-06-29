// app/admin/users/components/BulkActions.tsx (ИСПРАВЛЕННАЯ ВЕРСИЯ)
"use client";

import React from 'react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CheckSquare, X, Users, Download, UserCheck, UserX, Trash2 } from "lucide-react";
import { useUsersPage } from '../providers/UsersPageProvider';

export const BulkActions = React.memo(() => {
  const { state, permissions, actions } = useUsersPage();
  const [selectedAction, setSelectedAction] = React.useState<string>('');

  const bulkActionOptions = [
    { value: 'activate', label: 'Активировать', icon: UserCheck, disabled: !permissions.canUpdate },
    { value: 'deactivate', label: 'Деактивировать', icon: UserX, disabled: !permissions.canUpdate },
    { value: 'delete', label: 'Удалить', icon: Trash2, disabled: !permissions.canDelete },
    { value: 'export', label: 'Экспортировать', icon: Download, disabled: false }
  ];

  const handleBulkAction = () => {
    if (!selectedAction) return;
    
    // ✅ Конвертируем Set в Array перед передачей
    const selectedUsersArray = Array.from(state.selectedUsers);
    actions.bulkAction(selectedAction, selectedUsersArray);
    setSelectedAction('');
  };

  // ✅ Мемоизированное значение для оптимизации
  const selectedUsersCount = React.useMemo(() => 
    state.selectedUsers.size, 
    [state.selectedUsers]
  );

  // ✅ Не показываем компонент, если нет выбранных пользователей
  if (selectedUsersCount === 0) {
    return null;
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/20">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Информация о выбранных пользователях */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5 text-blue-600" />
            <span className="font-medium text-gray-900">
              Выбрано пользователей:
            </span>
            <Badge variant="default" className="bg-blue-600">
              {selectedUsersCount}
            </Badge>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={actions.clearSelection}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-4 w-4 mr-1" />
            Отменить выбор
          </Button>
        </div>

        {/* Действия */}
        <div className="flex items-center gap-3">
          <Select value={selectedAction} onValueChange={setSelectedAction}>
            <SelectTrigger className="w-48 bg-white/60 border-white/30">
              <SelectValue placeholder="Выберите действие" />
            </SelectTrigger>
            <SelectContent>
              {bulkActionOptions.map(option => {
                const Icon = option.icon;
                return (
                  <SelectItem 
                    key={option.value} 
                    value={option.value}
                    disabled={option.disabled}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      {option.label}
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>

          <Button
            onClick={handleBulkAction}
            disabled={!selectedAction || state.bulkActionLoading}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            {state.bulkActionLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Выполняется...
              </>
            ) : (
              <>
                <Users className="h-4 w-4 mr-2" />
                Выполнить
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
});

BulkActions.displayName = 'BulkActions';
