// hooks/useProductFiltering.ts
import { useMemo } from 'react';
import { Product, FilterState } from '@/types/product';

export function useProductFiltering(products: Product[], filters: FilterState) {
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Поиск по названию и описанию
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        const matchesSearch = 
          product.name.toLowerCase().includes(searchLower) ||
          product.description.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Фильтр по категории
      if (filters.categoryFilter !== 'all' && product.category !== filters.categoryFilter) {
        return false;
      }

      // Фильтр по наличию на складе
      if (filters.stockFilter !== 'all') {
        switch (filters.stockFilter) {
          case 'in-stock':
            if (product.inStock <= 10) return false;
            break;
          case 'low-stock':
            if (product.inStock === 0 || product.inStock > 10) return false;
            break;
          case 'out-of-stock':
            if (product.inStock > 0) return false;
            break;
        }
      }

      // Фильтр по популярности
      if (filters.popularFilter !== 'all') {
        switch (filters.popularFilter) {
          case 'popular':
            if (!product.isPopular) return false;
            break;
          case 'regular':
            if (product.isPopular) return false;
            break;
        }
      }

      return true;
    });
  }, [products, filters]);

  const sortedProducts = useMemo(() => {
    const sorted = [...filteredProducts];
    
    sorted.sort((a, b) => {
      let aValue: any = a[filters.sortBy as keyof Product];
      let bValue: any = b[filters.sortBy as keyof Product];

      // Специальная обработка для разных типов данных
      if (filters.sortBy === 'price' || filters.sortBy === 'inStock') {
        aValue = Number(aValue);
        bValue = Number(bValue);
      } else if (filters.sortBy === 'createdAt' || filters.sortBy === 'updatedAt') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      } else if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) {
        return filters.sortOrder === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return filters.sortOrder === 'asc' ? 1 : -1;
      }
      return 0;
    });

    return sorted;
  }, [filteredProducts, filters.sortBy, filters.sortOrder]);

  const filterStats = useMemo(() => {
    const total = products.length;
    const filtered = filteredProducts.length;
    const categories = products.reduce((acc, product) => {
      acc[product.category] = (acc[product.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const stockLevels = {
      inStock: products.filter(p => p.inStock > 10).length,
      lowStock: products.filter(p => p.inStock > 0 && p.inStock <= 10).length,
      outOfStock: products.filter(p => p.inStock === 0).length,
    };

    const popularity = {
      popular: products.filter(p => p.isPopular).length,
      regular: products.filter(p => !p.isPopular).length,
    };

    return {
      total,
      filtered,
      categories,
      stockLevels,
      popularity,
    };
  }, [products, filteredProducts]);

  return {
    filteredProducts,
    sortedProducts,
    filterStats,
  };
}
