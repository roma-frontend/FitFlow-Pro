// app/admin/users/components/UsersPageHeader.tsx
"use client";

import React, { useState } from 'react';
import { ArrowLeft, Users, RefreshCw, Plus, Search, Filter, AlertCircle, UserCheck, UserX } from "lucide-react";
import { useUsersPage } from '../providers/UsersPageProvider';

export interface UsersPageHeaderProps {
  /** Заголовок страницы */
  title?: string;
  /** Подзаголовок или описание */
  subtitle?: string;
  /** Показывать ли кнопку "Назад" */
  showBackButton?: boolean;
  /** Показывать ли кнопки действий */
  showActions?: boolean;
  /** Обработчик нажатия на кнопку "Назад" */
  onBack?: () => void;
  /** Обработчик поиска */
  onSearch?: () => void;
  /** Обработчик фильтров */
  onFilter?: () => void;
}

export const UsersPageHeader = React.memo(({
  title = "Управление пользователями",
  subtitle,
  showBackButton = true,
  showActions = true,
  onBack,
  onSearch,
  onFilter
}: UsersPageHeaderProps) => {
  const { state, permissions, actions } = useUsersPage();
  const [isHovered, setIsHovered] = useState(false);

  // Статистика пользователей (используем доступные поля)
  const stats = {
    total: state.users.length,
    // Если есть поле isActive, используем его, иначе считаем всех активными
    active: state.users.filter(u => u.isActive !== false).length,
    // Если есть поле isBlocked, используем его
    blocked: state.users.filter(u => (u as any).isBlocked === true).length,
  };

  const getStatusColor = () => {
    if (stats.blocked > 0) return 'bg-red-400 animate-pulse';
    if (stats.total === 0) return 'bg-gray-400';
    return 'bg-green-400 animate-pulse';
  };

  const getStatusText = () => {
    if (state.loading) return 'Загрузка...';
    if (stats.blocked > 0) return `${stats.blocked} заблокированных пользователей`;
    if (stats.total === 0) return 'Нет пользователей';
    return `${stats.total} пользователей`;
  };

  return (
    <header className="relative bg-gradient-to-r from-white via-gray-50 to-white border-b border-gray-200/80 backdrop-blur-sm rounded-xl">
      {/* Декоративная линия */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
      
      <div className="px-4 py-3 sm:px-6 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Левая часть */}
          <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
            {/* Кнопка назад */}
            {showBackButton && onBack && (
              <button
                onClick={onBack}
                className="group p-2 hover:bg-blue-50 rounded-xl transition-all duration-200 sm:hidden transform hover:scale-105 active:scale-95"
                aria-label="Назад"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
              </button>
            )}

            {/* Иконка пользователей */}
            <div className="hidden sm:block relative flex-shrink-0">
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center ring-2 ring-white shadow-lg hover:ring-blue-300 transition-all duration-300 transform hover:scale-105">
                <Users className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              
              {/* Индикатор статуса пользователей */}
              <div className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 sm:h-4 sm:w-4 rounded-full border-2 border-white shadow-sm transition-all duration-300 ${getStatusColor()}`} />
            </div>

            {/* Информация о странице */}
            <div 
              className="min-w-0 flex-1"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <h1 className={`text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent transition-all duration-300 ${
                isHovered ? 'from-blue-600 to-purple-600' : ''
              }`}>
                {title}
              </h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                {stats.total > 0 ? (
                  <UserCheck className="h-3 w-3 text-green-500" />
                ) : (
                  <UserX className="h-3 w-3 text-gray-400" />
                )}
                <p className="text-sm text-gray-500 truncate">
                  {getStatusText()}
                </p>
              </div>
            </div>
          </div>

          {/* Правая часть - действия */}
          {showActions && (
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Ошибка */}
              {state.error && (
                <div className="flex items-center gap-2 text-red-600 bg-red-50 px-2 py-1 rounded-lg mr-2">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm hidden sm:inline">{state.error}</span>
                  <button
                    onClick={actions.clearError}
                    className="text-red-600 hover:text-red-700 ml-1"
                  >
                    ×
                  </button>
                </div>
              )}

              {/* Кнопка поиска */}
              {onSearch && (
                <button
                  onClick={onSearch}
                  className="group p-2.5 hover:bg-blue-50 rounded-xl transition-all duration-200 hidden sm:block transform hover:scale-105 active:scale-95 hover:shadow-lg"
                  aria-label="Поиск"
                >
                  <Search className="h-5 w-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
                </button>
              )}

              {/* Кнопка фильтров */}
              {onFilter && (
                <button
                  onClick={onFilter}
                  className="group p-2.5 hover:bg-purple-50 rounded-xl transition-all duration-200 hidden sm:block transform hover:scale-105 active:scale-95 hover:shadow-lg"
                  aria-label="Фильтры"
                >
                  <Filter className="h-5 w-5 text-gray-600 group-hover:text-purple-600 transition-colors" />
                </button>
              )}

              {/* Кнопка обновления */}
              <button
                onClick={actions.refreshUsers}
                disabled={state.loading}
                className="group p-2.5 hover:bg-green-50 rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Обновить"
              >
                <RefreshCw className={`h-5 w-5 text-gray-600 group-hover:text-green-600 transition-colors ${
                  state.loading ? 'animate-spin' : ''
                }`} />
              </button>

              {/* Кнопка создания пользователя */}
              {permissions.canCreate && (
                <button
                  onClick={() => {
                    actions.setEditingUser(null);
                    actions.setShowCreateDialog(true);
                  }}
                  className="group p-2.5 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95 hover:shadow-lg"
                  aria-label="Создать пользователя"
                >
                  <Plus className="h-5 w-5 text-white" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
});

UsersPageHeader.displayName = 'UsersPageHeader';
