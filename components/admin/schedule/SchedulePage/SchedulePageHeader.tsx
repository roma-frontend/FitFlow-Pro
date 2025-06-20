// components/admin/schedule/SchedulePage/SchedulePageHeader.tsx
"use client";

import React, { useState } from "react";
import { ArrowLeft, Calendar, RefreshCw, Download, Plus, Wifi, WifiOff, Filter, Search } from "lucide-react";

interface SchedulePageHeaderProps {
  /** Заголовок страницы */
  title?: string;
  /** Подзаголовок или описание */
  subtitle?: string;
  /** Доступность API */
  isApiAvailable: boolean;
  /** Состояние загрузки */
  isMutationLoading: boolean;
  /** Показывать ли кнопку "Назад" */
  showBackButton?: boolean;
  /** Показывать ли кнопки действий */
  showActions?: boolean;
  /** Обработчик нажатия на кнопку "Назад" */
  onBack?: () => void;
  /** Обработчик обновления */
  onRefresh: () => void;
  /** Обработчик экспорта */
  onExport: () => void;
  /** Обработчик создания события */
  onCreateEvent: () => void;
  /** Обработчик поиска */
  onSearch?: () => void;
  /** Обработчик фильтров */
  onFilter?: () => void;
}

export function SchedulePageHeader({
  title = "Расписание",
  subtitle,
  isApiAvailable,
  isMutationLoading,
  showBackButton = true,
  showActions = true,
  onBack,
  onRefresh,
  onExport,
  onCreateEvent,
  onSearch,
  onFilter
}: SchedulePageHeaderProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <header className="relative bg-gradient-to-r from-white via-gray-50 to-white border-b border-gray-200/80 backdrop-blur-sm">
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

            {/* Иконка календаря */}
            <div className="relative flex-shrink-0">
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center ring-2 ring-white shadow-lg hover:ring-blue-300 transition-all duration-300 transform hover:scale-105">
                <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              
              {/* Индикатор статуса API */}
              <div className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 sm:h-4 sm:w-4 rounded-full border-2 border-white shadow-sm transition-all duration-300 ${
                isApiAvailable 
                  ? 'bg-green-400 animate-pulse' 
                  : 'bg-orange-400'
              }`} />
            </div>

            {/* Информация о странице */}
            <div 
              className="min-w-0 flex-1"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <h1 className={`text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent truncate transition-all duration-300 ${
                isHovered ? 'from-blue-600 to-indigo-600' : ''
              }`}>
                {title}
              </h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                {isApiAvailable ? (
                  <Wifi className="h-3 w-3 text-green-500" />
                ) : (
                  <WifiOff className="h-3 w-3 text-orange-500" />
                )}
                <p className="text-sm text-gray-500 truncate">
                  {subtitle || (isApiAvailable ? 'Онлайн режим' : 'Оффлайн режим')}
                </p>
              </div>
            </div>
          </div>

          {/* Правая часть - действия */}
          {showActions && (
            <div className="flex items-center gap-1 sm:gap-2">
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
                onClick={onRefresh}
                disabled={isMutationLoading}
                className="group p-2.5 hover:bg-green-50 rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Обновить"
              >
                <RefreshCw className={`h-5 w-5 text-gray-600 group-hover:text-green-600 transition-colors ${
                  isMutationLoading ? 'animate-spin' : ''
                }`} />
              </button>

              {/* Кнопка экспорта */}
              <button
                onClick={onExport}
                disabled={isMutationLoading}
                className="group p-2.5 hover:bg-orange-50 rounded-xl transition-all duration-200 hidden sm:block transform hover:scale-105 active:scale-95 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Экспорт"
              >
                <Download className="h-5 w-5 text-gray-600 group-hover:text-orange-600 transition-colors" />
              </button>

              {/* Кнопка создания события */}
              <button
                onClick={onCreateEvent}
                disabled={isMutationLoading}
                className="group p-2.5 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Создать событие"
              >
                <Plus className="h-5 w-5 text-white" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
