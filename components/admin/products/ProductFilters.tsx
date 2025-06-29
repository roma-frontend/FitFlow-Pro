// components/admin/products/ProductFilters.tsx
import React, { memo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Search, 
  X, 
  Loader2, 
  SortAsc, 
  SortDesc,
  Filter,
  RotateCcw
} from 'lucide-react';
import { 
  CategoryFilter, 
  StockFilter, 
  PopularFilter, 
  SortByOption, 
  SortOrderOption 
} from '@/types/product';

export interface ProductFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  categoryFilter: CategoryFilter;
  onCategoryFilterChange: (value: CategoryFilter) => void;
  stockFilter: StockFilter;
  onStockFilterChange: (value: StockFilter) => void;
  popularFilter: PopularFilter;
  onPopularFilterChange: (value: PopularFilter) => void;
  sortBy: SortByOption;
  sortOrder: SortOrderOption;
  onSortChange: (sortBy: SortByOption, sortOrder: SortOrderOption) => void;
  totalProducts: number;
  filteredProducts: number;
  isDebouncing?: boolean;
}

export const ProductFilters = memo(function ProductFilters({
  searchTerm,
  onSearchChange,
  categoryFilter,
  onCategoryFilterChange,
  stockFilter,
  onStockFilterChange,
  popularFilter,
  onPopularFilterChange,
  sortBy,
  sortOrder,
  onSortChange,
  totalProducts,
  filteredProducts,
  isDebouncing = false
}: ProductFiltersProps) {
  const hasActiveFilters = 
    searchTerm !== '' ||
    categoryFilter !== 'all' ||
    stockFilter !== 'all' ||
    popularFilter !== 'all' ||
    sortBy !== 'name' ||
    sortOrder !== 'asc';

  const clearSearch = () => onSearchChange('');

  const toggleSortOrder = () => {
    onSortChange(sortBy, sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const resetFilters = () => {
    onSearchChange('');
    onCategoryFilterChange('all');
    onStockFilterChange('all');
    onPopularFilterChange('all');
    onSortChange('name', 'asc');
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Заголовок с результатами */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-500" />
              <h3 className="font-medium">Фильтры</h3>
              {isDebouncing && (
                <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
              )}
            </div>
            
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-sm text-yellow-700">
                {filteredProducts} из {totalProducts}
              </Badge>
              
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetFilters}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Сбросить
                </Button>
              )}
            </div>
          </div>

          {/* Поиск */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Поиск продуктов..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 pr-10"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSearch}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>

          {/* Основные фильтры */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Категория</label>
              <Select value={categoryFilter} onValueChange={onCategoryFilterChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все категории</SelectItem>
                  <SelectItem value="supplements">Добавки</SelectItem>
                  <SelectItem value="drinks">Напитки</SelectItem>
                  <SelectItem value="snacks">Снеки</SelectItem>
                  <SelectItem value="merchandise">Мерч</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Наличие</label>
              <Select value={stockFilter} onValueChange={onStockFilterChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все товары</SelectItem>
                  <SelectItem value="in-stock">В наличии</SelectItem>
                  <SelectItem value="low-stock">Заканчивается</SelectItem>
                  <SelectItem value="out-of-stock">Нет в наличии</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Популярность</label>
              <Select value={popularFilter} onValueChange={onPopularFilterChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все товары</SelectItem>
                  <SelectItem value="popular">Популярные</SelectItem>
                  <SelectItem value="regular">Обычные</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Сортировка */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Сортировка:</label>
              <Select value={sortBy} onValueChange={(value: SortByOption) => onSortChange(value, sortOrder)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Название</SelectItem>
                  <SelectItem value="price">Цена</SelectItem>
                  <SelectItem value="inStock">Количество</SelectItem>
                  <SelectItem value="createdAt">Дата создания</SelectItem>
                  <SelectItem value="category">Категория</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={toggleSortOrder}
              className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 flex items-center gap-1 text-white"
            >
              {sortOrder === 'asc' ? (
                <SortAsc className="h-4 w-4" />
              ) : (
                <SortDesc className="h-4 w-4" />
              )}
              {sortOrder === 'asc' ? 'По возрастанию' : 'По убыванию'}
            </Button>
          </div>

          {/* Активные фильтры */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 pt-2 border-t">
              {searchTerm && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Поиск: "{searchTerm}"
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={clearSearch}
                  />
                </Badge>
              )}
              {categoryFilter !== 'all' && (
                <Badge variant="product" className="flex items-center gap-1">
                  Категория: {getCategoryLabel(categoryFilter)}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => onCategoryFilterChange('all')}
                  />
                </Badge>
              )}
              {stockFilter !== 'all' && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Склад: {getStockLabel(stockFilter)}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => onStockFilterChange('all')}
                  />
                </Badge>
              )}
              {popularFilter !== 'all' && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Популярность: {getPopularLabel(popularFilter)}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => onPopularFilterChange('all')}
                  />
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
});

// Хелперы для отображения лейблов
function getCategoryLabel(category: CategoryFilter): string {
  const labels = {
    all: 'Все',
    supplements: 'Добавки',
    drinks: 'Напитки',
    snacks: 'Снеки',
    merchandise: 'Мерч'
  };
  return labels[category];
}

function getStockLabel(stock: StockFilter): string {
  const labels = {
    all: 'Все',
    'in-stock': 'В наличии',
    'low-stock': 'Заканчивается',
    'out-of-stock': 'Нет в наличии'
  };
  return labels[stock];
}

function getPopularLabel(popular: PopularFilter): string {
  const labels = {
    all: 'Все',
    popular: 'Популярные',
    regular: 'Обычные'
  };
  return labels[popular];
}
