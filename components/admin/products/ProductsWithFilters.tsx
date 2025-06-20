// components/admin/products/ProductsWithFilters.tsx (исправленная версия)
import React, { memo } from 'react';
import { useDebouncedFilters } from '@/hooks/useDebouncedFilters';
import { useProductFiltering } from '@/hooks/useProductFiltering';
import { useProducts } from '@/hooks/useProducts';
import { ProductFilters } from './ProductFilters';
import { FilterStats } from './FilterStats';
import { FilterManager } from './FilterManager';
import { ProductGrid } from './ProductGrid';
import { Product, SortByOption, SortOrderOption } from '@/types/product';

interface ProductsWithFiltersProps {
  onEdit: (product: Product) => void;
  onDelete: (id: string, name: string, deleteType?: 'soft' | 'hard') => void;
}

export const ProductsWithFilters = memo(function ProductsWithFilters({
  onEdit,
  onDelete
}: ProductsWithFiltersProps) {
  const { products, isLoading, error } = useProducts();
  const { 
    filters, 
    originalFilters, 
    updateFilter, 
    resetFilters, 
    isDebouncing 
  } = useDebouncedFilters(300);
  
  const { 
    filteredProducts, 
    sortedProducts, 
    filterStats 
  } = useProductFiltering(products, filters);

  const handleSortChange = (sortBy: SortByOption, sortOrder: SortOrderOption) => {
    updateFilter('sortBy', sortBy);
    updateFilter('sortOrder', sortOrder);
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 text-lg">Ошибка загрузки продуктов</div>
        <div className="text-gray-500 text-sm mt-2">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Статистика фильтров */}
      <FilterStats stats={filterStats} />

      {/* Управление фильтрами */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <ProductFilters
            searchTerm={originalFilters.searchTerm}
            onSearchChange={(value) => updateFilter('searchTerm', value)}
            categoryFilter={originalFilters.categoryFilter}
            onCategoryFilterChange={(value) => updateFilter('categoryFilter', value)}
            stockFilter={originalFilters.stockFilter}
            onStockFilterChange={(value) => updateFilter('stockFilter', value)}
            popularFilter={originalFilters.popularFilter}
            onPopularFilterChange={(value) => updateFilter('popularFilter', value)}
            sortBy={originalFilters.sortBy}
            sortOrder={originalFilters.sortOrder}
            onSortChange={handleSortChange}
            totalProducts={filterStats.total}
            filteredProducts={filterStats.filtered}
            isDebouncing={isDebouncing}
          />
        </div>
        
        <div>
          <FilterManager />
        </div>
      </div>

      {/* Сетка продуктов */}
      <ProductGrid
        products={sortedProducts}
        onEdit={onEdit}
        onDelete={onDelete}
        isLoading={isLoading}
      />
    </div>
  );
});
