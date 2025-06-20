// components/admin/products/ProductsHeader.tsx
"use client";

import React, { useState } from 'react';
import { ArrowLeft, Package, Plus, Search, Filter, RefreshCw, BarChart3, TrendingUp } from 'lucide-react';

export interface ProductsHeaderProps {
  title?: string;
  subtitle?: string;
  stats?: {
    total: number;
    inStock: number;
    lowStock: number;
    outOfStock: number;
    popular: number;
  };
  showBackButton?: boolean;
  showActions?: boolean;
  isLoading?: boolean;
  onBack?: () => void;
  onCreateProduct?: () => void;
  onSearch?: () => void;
  onFilter?: () => void;
  onRefresh?: () => void;
  onAnalytics?: () => void;
}

export function ProductsHeader({
  title = "Управление продуктами",
  subtitle = "Создавайте, редактируйте и управляйте продуктами вашего магазина",
  stats,
  showBackButton = true,
  showActions = true,
  isLoading = false,
  onBack,
  onCreateProduct,
  onSearch,
  onFilter,
  onRefresh,
  onAnalytics
}: ProductsHeaderProps) {
  const [isHovered, setIsHovered] = useState(false);

  const getStatusColor = () => {
    if (!stats) return 'bg-gray-300';
    
    const totalIssues = stats.lowStock + stats.outOfStock;
    if (totalIssues === 0) return 'bg-green-400 animate-pulse';
    if (stats.outOfStock > 0) return 'bg-red-400 animate-pulse';
    return 'bg-yellow-400 animate-pulse';
  };

  const getStatusText = () => {
    if (!stats) return 'Загрузка...';
    
    const totalIssues = stats.lowStock + stats.outOfStock;
    if (totalIssues === 0) return `${stats.total} продуктов в наличии`;
    if (stats.outOfStock > 0) return `${stats.outOfStock} товаров нет в наличии`;
    return `${stats.lowStock} товаров заканчивается`;
  };

  return (
    <header className="relative bg-gradient-to-r from-white via-gray-50 to-white border-b border-gray-200/80 backdrop-blur-sm mb-4">
      {/* Декоративная линия */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />
      
      <div className="px-4 py-3 sm:px-6 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Левая часть */}
          <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
            {/* Кнопка назад */}
            {showBackButton && onBack && (
              <button
                onClick={onBack}
                className="group p-2 hover:bg-purple-50 rounded-xl transition-all duration-200 sm:hidden transform hover:scale-105 active:scale-95"
                aria-label="Назад"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600 group-hover:text-purple-600 transition-colors" />
              </button>
            )}

            {/* Иконка продуктов */}
            <div className="relative flex-shrink-0">
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center ring-2 ring-white shadow-lg hover:ring-purple-300 transition-all duration-300 transform hover:scale-105">
                <Package className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              
              {/* Индикатор статуса продуктов */}
              <div className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 sm:h-4 sm:w-4 rounded-full border-2 border-white shadow-sm transition-all duration-300 ${getStatusColor()}`} />
            </div>

            {/* Информация о странице */}
            <div 
              className="min-w-0 flex-1"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <h1 className={`text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent truncate transition-all duration-300 ${
                isHovered ? 'from-purple-600 to-pink-600' : ''
              }`}>
                {title}
              </h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                {stats && stats.popular > 0 ? (
                  <TrendingUp className="h-3 w-3 text-purple-500" />
                ) : (
                  <Package className="h-3 w-3 text-gray-400" />
                )}
                <p className="text-sm text-gray-500 truncate">
                  {isLoading ? 'Загрузка...' : getStatusText()}
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
                  className="group p-2.5 hover:bg-orange-50 rounded-xl transition-all duration-200 hidden sm:block transform hover:scale-105 active:scale-95 hover:shadow-lg"
                  aria-label="Фильтры"
                >
                  <Filter className="h-5 w-5 text-gray-600 group-hover:text-orange-600 transition-colors" />
                </button>
              )}

              {/* Кнопка аналитики */}
              {onAnalytics && (
                <button
                  onClick={onAnalytics}
                  className="group p-2.5 hover:bg-green-50 rounded-xl transition-all duration-200 hidden sm:block transform hover:scale-105 active:scale-95 hover:shadow-lg"
                  aria-label="Аналитика"
                >
                  <BarChart3 className="h-5 w-5 text-gray-600 group-hover:text-green-600 transition-colors" />
                </button>
              )}

              {/* Кнопка обновления */}
              {onRefresh && (
                <button
                  onClick={onRefresh}
                  disabled={isLoading}
                  className="group p-2.5 hover:bg-gray-50 rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Обновить"
                >
                  <RefreshCw className={`h-5 w-5 text-gray-600 group-hover:text-gray-800 transition-colors ${
                    isLoading ? 'animate-spin' : ''
                  }`} />
                </button>
              )}

              {/* Кнопка создания продукта */}
              {onCreateProduct && (
                <button
                  onClick={onCreateProduct}
                  className="group p-2.5 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95 hover:shadow-lg"
                  aria-label="Добавить продукт"
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
}
