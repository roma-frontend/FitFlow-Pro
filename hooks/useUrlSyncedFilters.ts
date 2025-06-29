// hooks/useUrlSyncedFilters.ts
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect } from 'react';
import { usePersistentFilters, validateFilters, type FilterState } from './usePersistentFilters';

export function useUrlSyncedFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { filters, updateFilter, updateMultipleFilters, resetFilters } = usePersistentFilters();

  // Синхронизируем URL с фильтрами при изменении фильтров
  const syncToUrl = useCallback(() => {
    try {
      const params = new URLSearchParams();

      if (filters.searchTerm) params.set('search', filters.searchTerm);
      if (filters.categoryFilter !== 'all') params.set('category', filters.categoryFilter);
      if (filters.stockFilter !== 'all') params.set('stock', filters.stockFilter);
      if (filters.popularFilter !== 'all') params.set('popular', filters.popularFilter);
      if (filters.sortBy !== 'name') params.set('sortBy', filters.sortBy);
      if (filters.sortOrder !== 'asc') params.set('sortOrder', filters.sortOrder);

      const newUrl = params.toString() ? `?${params.toString()}` : '';
      router.replace(newUrl, { scroll: false });
    } catch (error) {
      console.warn('Ошибка синхронизации URL:', error);
    }
  }, [filters, router]);

  // Синхронизируем фильтры с URL при загрузке страницы
  useEffect(() => {
    try {
      const urlFilters: Partial<FilterState> = {};
      
      const search = searchParams.get('search');
      if (search) urlFilters.searchTerm = search;

      const category = searchParams.get('category');
      if (category) urlFilters.categoryFilter = category;

      const stock = searchParams.get('stock');
      if (stock) urlFilters.stockFilter = stock;

      const popular = searchParams.get('popular');
      if (popular) urlFilters.popularFilter = popular;

      const sortBy = searchParams.get('sortBy');
      if (sortBy) urlFilters.sortBy = sortBy;

      const sortOrder = searchParams.get('sortOrder');
      if (sortOrder && (sortOrder === 'asc' || sortOrder === 'desc')) {
        urlFilters.sortOrder = sortOrder;
      }

      if (Object.keys(urlFilters).length > 0) {
        // Валидируем фильтры перед применением
        const validatedFilters = validateFilters(urlFilters);
        updateMultipleFilters(validatedFilters);
      }
    } catch (error) {
      console.warn('Ошибка чтения параметров URL:', error);
    }
  }, [searchParams, updateMultipleFilters]);

  // Обновляем URL при изменении фильтров (с debounce)
  useEffect(() => {
    const timeoutId = setTimeout(syncToUrl, 300);
    return () => clearTimeout(timeoutId);
  }, [syncToUrl]);

  const resetFiltersAndUrl = useCallback(() => {
    try {
      resetFilters();
      router.replace('', { scroll: false });
    } catch (error) {
      console.warn('Ошибка сброса фильтров и URL:', error);
      resetFilters(); // Хотя бы сбросим фильтры
    }
  }, [resetFilters, router]);

  // Функция для установки конкретного фильтра через URL
  const setFilterFromUrl = useCallback((key: keyof FilterState, value: string) => {
    try {
      const params = new URLSearchParams(searchParams.toString());
      
      if (value && value !== 'all' && value !== '') {
        params.set(key === 'searchTerm' ? 'search' : key.replace('Filter', ''), value);
      } else {
        params.delete(key === 'searchTerm' ? 'search' : key.replace('Filter', ''));
      }

      const newUrl = params.toString() ? `?${params.toString()}` : '';
      router.replace(newUrl, { scroll: false });
      
      updateFilter(key, value as any);
    } catch (error) {
      console.warn('Ошибка установки фильтра через URL:', error);
      updateFilter(key, value as any); // Хотя бы обновим локальный фильтр
    }
  }, [searchParams, router, updateFilter]);

  return {
    filters,
    updateFilter,
    updateMultipleFilters,
    resetFilters: resetFiltersAndUrl,
    setFilterFromUrl,
  };
}

// Экспорт типов для удобства
export type { FilterState };
