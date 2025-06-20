"use client";

import React, { useState } from "react";
import { ArrowLeft, BarChart3, Download, Calendar, TrendingUp, Wifi, WifiOff, Filter, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ExportDialog } from "@/components/analytics/ExportDialog";

interface AnalyticsHeaderProps {
  /** Заголовок страницы */
  title?: string;
  /** Подзаголовок или описание */
  subtitle?: string;
  /** Текущий период */
  period: string;
  /** Функция изменения периода */
  setPeriod: (period: string) => void;
  /** Доступность данных в реальном времени */
  isAvailable: boolean;
  /** Показывать ли кнопку "Назад" */
  showBackButton?: boolean;
  /** Показывать ли кнопки действий */
  showActions?: boolean;
  /** Обработчик нажатия на кнопку "Назад" */
  onBack?: () => void;
  /** Обработчик обновления данных */
  onRefresh?: () => void;
  /** Обработчик фильтров */
  onFilter?: () => void;
  /** Состояние загрузки */
  isLoading?: boolean;
}

export function AnalyticsHeader({
  title = "Аналитика",
  subtitle,
  period,
  setPeriod,
  isAvailable,
  showBackButton = true,
  showActions = true,
  onBack,
  onRefresh,
  onFilter,
  isLoading = false
}: AnalyticsHeaderProps) {
  const [isHovered, setIsHovered] = useState(false);

  const getSubtitle = () => {
    if (subtitle) return subtitle;
    return isAvailable ? "Данные в реальном времени" : "Демонстрационные данные";
  };

  return (
    <header className="relative bg-gradient-to-r from-white via-gray-50 to-white border-b border-gray-200/80 backdrop-blur-sm">
      {/* Декоративная линия */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-green-500/20 to-transparent" />
      
      <div className="px-4 py-3 sm:px-6 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Левая часть */}
          <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
            {/* Кнопка назад */}
            {showBackButton && onBack && (
              <button
                onClick={onBack}
                className="group p-2 hover:bg-green-50 rounded-xl transition-all duration-200 sm:hidden transform hover:scale-105 active:scale-95"
                aria-label="Назад"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600 group-hover:text-green-600 transition-colors" />
              </button>
            )}

            {/* Иконка аналитики */}
            <div className="relative flex-shrink-0">
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center ring-2 ring-white shadow-lg hover:ring-green-300 transition-all duration-300 transform hover:scale-105">
                <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              
              {/* Индикатор доступности данных */}
              <div className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 sm:h-4 sm:w-4 rounded-full border-2 border-white shadow-sm transition-all duration-300 ${
                isAvailable 
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
                isHovered ? 'from-green-600 to-emerald-600' : ''
              }`}>
                {title}
              </h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                {isAvailable ? (
                  <TrendingUp className="h-3 w-3 text-green-500" />
                ) : (
                  <Wifi className="h-3 w-3 text-orange-500" />
                )}
                <p className="text-sm text-gray-500 truncate">
                  {getSubtitle()}
                </p>
              </div>
            </div>
          </div>

          {/* Правая часть - действия */}
          {showActions && (
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Селектор периода */}
              <div className="hidden sm:block">
                <Select value={period} onValueChange={setPeriod}>
                  <SelectTrigger className="w-32 sm:w-40 h-10 border-gray-200 hover:border-green-300 transition-colors">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <SelectValue />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="day">За день</SelectItem>
                    <SelectItem value="week">За неделю</SelectItem>
                    <SelectItem value="month">За месяц</SelectItem>
                    <SelectItem value="quarter">За квартал</SelectItem>
                    <SelectItem value="year">За год</SelectItem>
                  </SelectContent>
                </Select>
              </div>

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
              {onRefresh && (
                <button
                  onClick={onRefresh}
                  disabled={isLoading}
                  className="group p-2.5 hover:bg-blue-50 rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Обновить"
                >
                  <RefreshCw className={`h-5 w-5 text-gray-600 group-hover:text-blue-600 transition-colors ${
                    isLoading ? 'animate-spin' : ''
                  }`} />
                </button>
              )}

              {/* Кнопка экспорта */}
              <ExportDialog>
                <button className="group p-2.5 hover:bg-green-50 rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95 hover:shadow-lg">
                  <Download className="h-5 w-5 text-gray-600 group-hover:text-green-600 transition-colors" />
                </button>
              </ExportDialog>
            </div>
          )}
        </div>

        {/* Мобильный селектор периода */}
        <div className="sm:hidden mt-3 pt-3 border-t border-gray-100">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-full h-10 border-gray-200">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <SelectValue />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">За день</SelectItem>
              <SelectItem value="week">За неделю</SelectItem>
              <SelectItem value="month">За месяц</SelectItem>
              <SelectItem value="quarter">За квартал</SelectItem>
              <SelectItem value="year">За год</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </header>
  );
}
