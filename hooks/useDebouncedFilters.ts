// hooks/useDebouncedFilters.ts
import { useState, useEffect, useMemo } from 'react';
import { usePersistentFiltersTyped } from './usePersistentFiltersTyped';
import { FilterState } from '@/types/product';

export function useDebouncedFilters(delay: number = 300) {
  const { 
    filters: originalFilters, 
    updateFilter, 
    resetFilters 
  } = usePersistentFiltersTyped();
  
  const [debouncedFilters, setDebouncedFilters] = useState<FilterState>(originalFilters);

  // Debounce для поискового запроса
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedFilters(originalFilters);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [originalFilters, delay]);

  // Мгновенное обновление для не-текстовых фильтров
  const filters = useMemo((): FilterState => ({
    ...debouncedFilters,
    categoryFilter: originalFilters.categoryFilter,
    stockFilter: originalFilters.stockFilter,
    popularFilter: originalFilters.popularFilter,
    sortBy: originalFilters.sortBy,
    sortOrder: originalFilters.sortOrder,
  }), [debouncedFilters, originalFilters]);

  return {
    filters,
    originalFilters,
    updateFilter,
    resetFilters,
    isDebouncing: JSON.stringify(originalFilters) !== JSON.stringify(debouncedFilters)
  };
}
