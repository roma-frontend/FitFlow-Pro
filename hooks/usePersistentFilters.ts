// hooks/usePersistentFilters.ts (исправленная версия)
import { useState, useCallback, useEffect } from 'react';

export interface FilterState {
  searchTerm: string;
  categoryFilter: string;
  stockFilter: string;
  popularFilter: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

const defaultFilters: FilterState = {
  searchTerm: '',
  categoryFilter: 'all',
  stockFilter: 'all',
  popularFilter: 'all',
  sortBy: 'name',
  sortOrder: 'asc',
};

const STORAGE_KEY = 'shop-filters';

// Функция для безопасного чтения из localStorage
function getStoredFilters(): Partial<FilterState> {
  if (typeof window === 'undefined') return {};
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.warn('Ошибка чтения фильтров из localStorage:', error);
    return {};
  }
}

// Функция для безопасной записи в localStorage
function setStoredFilters(filters: FilterState): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
  } catch (error) {
    console.warn('Ошибка записи фильтров в localStorage:', error);
  }
}

export function usePersistentFilters() {
  // Инициализируем состояние с данными из localStorage
  const [filters, setFilters] = useState<FilterState>(() => {
    const storedFilters = getStoredFilters();
    return { ...defaultFilters, ...storedFilters };
  });

  // Сохраняем фильтры в localStorage при их изменении
  useEffect(() => {
    setStoredFilters(filters);
  }, [filters]);

  // Обновление одного фильтра
  const updateFilter = useCallback(<K extends keyof FilterState>(
    key: K,
    value: FilterState[K]
  ) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  // Обновление нескольких фильтров одновременно
  const updateMultipleFilters = useCallback((updates: Partial<FilterState>) => {
    setFilters(prev => ({
      ...prev,
      ...updates,
    }));
  }, []);

  // Сброс всех фильтров к значениям по умолчанию
  const resetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  // Проверка, есть ли активные фильтры (отличные от значений по умолчанию)
  const hasActiveFilters = useCallback(() => {
    return Object.keys(filters).some(key => {
      const filterKey = key as keyof FilterState;
      return filters[filterKey] !== defaultFilters[filterKey];
    });
  }, [filters]);

  // Получение количества активных фильтров
  const getActiveFiltersCount = useCallback(() => {
    return Object.keys(filters).filter(key => {
      const filterKey = key as keyof FilterState;
      return filters[filterKey] !== defaultFilters[filterKey];
    }).length;
  }, [filters]);

  return {
    filters,
    updateFilter,
    updateMultipleFilters,
    resetFilters,
    hasActiveFilters,
    getActiveFiltersCount,
  };
}

// Дополнительные утилиты для работы с фильтрами
export const filterOptions = {
  categories: [
    { value: 'all', label: 'Все категории' },
    { value: 'supplements', label: 'Добавки' },
    { value: 'drinks', label: 'Напитки' },
    { value: 'snacks', label: 'Снеки' },
    { value: 'merchandise', label: 'Товары' },
  ],
  stock: [
    { value: 'all', label: 'Все товары' },
    { value: 'in_stock', label: 'В наличии' },
    { value: 'low_stock', label: 'Мало на складе' },
    { value: 'out_of_stock', label: 'Нет в наличии' },
  ],
  popular: [
    { value: 'all', label: 'Все товары' },
    { value: 'popular', label: 'Популярные' },
    { value: 'regular', label: 'Обычные' },
  ],
  sortBy: [
    { value: 'name', label: 'По названию' },
    { value: 'price', label: 'По цене' },
    { value: 'popularity', label: 'По популярности' },
    { value: 'stock', label: 'По остатку' },
    { value: 'newest', label: 'По дате добавления' },
  ],
  sortOrder: [
    { value: 'asc', label: 'По возрастанию' },
    { value: 'desc', label: 'По убыванию' },
  ],
} as const;

// Функция для получения отображаемого названия фильтра
export function getFilterDisplayName(filterType: keyof FilterState, value: string): string {
  switch (filterType) {
    case 'categoryFilter':
      return filterOptions.categories.find(opt => opt.value === value)?.label || value;
    case 'stockFilter':
      return filterOptions.stock.find(opt => opt.value === value)?.label || value;
    case 'popularFilter':
      return filterOptions.popular.find(opt => opt.value === value)?.label || value;
    case 'sortBy':
      return filterOptions.sortBy.find(opt => opt.value === value)?.label || value;
    case 'sortOrder':
      return filterOptions.sortOrder.find(opt => opt.value === value)?.label || value;
    default:
      return value;
  }
}

// Функция для валидации фильтров
export function validateFilters(filters: Partial<FilterState>): FilterState {
  const validatedFilters: FilterState = { ...defaultFilters };

  // Валидация searchTerm
  if (typeof filters.searchTerm === 'string') {
    validatedFilters.searchTerm = filters.searchTerm.trim();
  }

  // Валидация categoryFilter
  const validCategories = filterOptions.categories.map(opt => opt.value);
  if (filters.categoryFilter && validCategories.includes(filters.categoryFilter as any)) {
    validatedFilters.categoryFilter = filters.categoryFilter;
  }

  // Валидация stockFilter
  const validStockOptions = filterOptions.stock.map(opt => opt.value);
  if (filters.stockFilter && validStockOptions.includes(filters.stockFilter as any)) {
    validatedFilters.stockFilter = filters.stockFilter;
  }

  // Валидация popularFilter
  const validPopularOptions = filterOptions.popular.map(opt => opt.value);
  if (filters.popularFilter && validPopularOptions.includes(filters.popularFilter as any)) {
    validatedFilters.popularFilter = filters.popularFilter;
  }

  // Валидация sortBy
  const validSortOptions = filterOptions.sortBy.map(opt => opt.value);
  if (filters.sortBy && validSortOptions.includes(filters.sortBy as any)) {
    validatedFilters.sortBy = filters.sortBy;
  }

  // Валидация sortOrder
  if (filters.sortOrder === 'asc' || filters.sortOrder === 'desc') {
    validatedFilters.sortOrder = filters.sortOrder;
  }

  return validatedFilters;
}
