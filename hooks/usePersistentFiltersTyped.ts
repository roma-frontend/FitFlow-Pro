import { useLocalStorage } from './useLocalStorage';
import { useCallback } from 'react';
import { FilterState, CategoryFilter, StockFilter, PopularFilter, SortByOption, SortOrderOption } from '@/types/product';

const defaultFilters: FilterState = {
  searchTerm: '',
  categoryFilter: 'all',
  stockFilter: 'all',
  popularFilter: 'all',
  sortBy: 'name',
  sortOrder: 'asc'
};

// Массивы для валидации
const CATEGORY_FILTERS: CategoryFilter[] = ['all', 'supplements', 'drinks', 'snacks', 'merchandise'];
const STOCK_FILTERS: StockFilter[] = ['all', 'in-stock', 'low-stock', 'out-of-stock'];
const POPULAR_FILTERS: PopularFilter[] = ['all', 'popular', 'regular'];
const SORT_BY_OPTIONS: SortByOption[] = ['name', 'price', 'inStock', 'createdAt', 'updatedAt', 'category'];
const SORT_ORDER_OPTIONS: SortOrderOption[] = ['asc', 'desc'];

// Type guards
const isValidCategoryFilter = (value: unknown): value is CategoryFilter => {
  return typeof value === 'string' && CATEGORY_FILTERS.includes(value as CategoryFilter);
};

const isValidStockFilter = (value: unknown): value is StockFilter => {
  return typeof value === 'string' && STOCK_FILTERS.includes(value as StockFilter);
};

const isValidPopularFilter = (value: unknown): value is PopularFilter => {
  return typeof value === 'string' && POPULAR_FILTERS.includes(value as PopularFilter);
};

const isValidSortBy = (value: unknown): value is SortByOption => {
  return typeof value === 'string' && SORT_BY_OPTIONS.includes(value as SortByOption);
};

const isValidSortOrder = (value: unknown): value is SortOrderOption => {
  return typeof value === 'string' && SORT_ORDER_OPTIONS.includes(value as SortOrderOption);
};

function sanitizeFilters(input: unknown): FilterState {
  const filters = (input && typeof input === 'object' ? input : {}) as Record<string, unknown>;
  
  return {
    searchTerm: typeof filters.searchTerm === 'string' ? filters.searchTerm : defaultFilters.searchTerm,
    categoryFilter: isValidCategoryFilter(filters.categoryFilter) ? filters.categoryFilter : defaultFilters.categoryFilter,
    stockFilter: isValidStockFilter(filters.stockFilter) ? filters.stockFilter : defaultFilters.stockFilter,
    popularFilter: isValidPopularFilter(filters.popularFilter) ? filters.popularFilter : defaultFilters.popularFilter,
    sortBy: isValidSortBy(filters.sortBy) ? filters.sortBy : defaultFilters.sortBy,
    sortOrder: isValidSortOrder(filters.sortOrder) ? filters.sortOrder : defaultFilters.sortOrder,
  };
}

export function usePersistentFiltersTyped() {
  const [storedFilters, setStoredFilters] = useLocalStorage<FilterState>('productFilters', defaultFilters);
  
  const filters = sanitizeFilters(storedFilters);

  const updateFilter = useCallback(<K extends keyof FilterState>(
    key: K, 
    value: FilterState[K]
  ) => {
    const newFilters: FilterState = { ...filters, [key]: value };
    setStoredFilters(newFilters);
  }, [filters, setStoredFilters]);

  const updateMultipleFilters = useCallback((updates: Partial<FilterState>) => {
    const newFilters: FilterState = { ...filters, ...updates };
    setStoredFilters(newFilters);
  }, [filters, setStoredFilters]);

  const resetFilters = useCallback(() => {
    setStoredFilters(defaultFilters);
  }, [setStoredFilters]);

  // Специфические функции обновления для каждого фильтра
  const updateSearchTerm = useCallback((value: string) => {
    updateFilter('searchTerm', value);
  }, [updateFilter]);

  const updateCategoryFilter = useCallback((value: CategoryFilter) => {
    updateFilter('categoryFilter', value);
  }, [updateFilter]);

  const updateStockFilter = useCallback((value: StockFilter) => {
    updateFilter('stockFilter', value);
  }, [updateFilter]);

  const updatePopularFilter = useCallback((value: PopularFilter) => {
    updateFilter('popularFilter', value);
  }, [updateFilter]);

  const updateSortBy = useCallback((value: SortByOption) => {
    updateFilter('sortBy', value);
  }, [updateFilter]);

  const updateSortOrder = useCallback((value: SortOrderOption) => {
    updateFilter('sortOrder', value);
  }, [updateFilter]);

  return {
    filters,
    updateFilter,
    updateMultipleFilters,
    resetFilters,
    // Специфические функции обновления
    updateSearchTerm,
    updateCategoryFilter,
    updateStockFilter,
    updatePopularFilter,
    updateSortBy,
    updateSortOrder,
    // Константы
    CATEGORY_FILTERS,
    STOCK_FILTERS,
    POPULAR_FILTERS,
    SORT_BY_OPTIONS,
    SORT_ORDER_OPTIONS
  };
}
