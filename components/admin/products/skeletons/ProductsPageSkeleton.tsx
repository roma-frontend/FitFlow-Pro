// components/admin/products/skeletons/ProductsPageSkeleton.tsx
import React from 'react';
import { ProductsHeaderSkeleton } from './ProductsHeaderSkeleton';
import { StatsCardSkeleton } from './StatsCardSkeleton';
import { ProductFiltersSkeleton } from './ProductFiltersSkeleton';
import { ProductGridSkeleton } from './ProductGridSkeleton';

export function ProductsPageSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <ProductsHeaderSkeleton />

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
        {Array.from({ length: 5 }, (_, i) => (
          <StatsCardSkeleton key={i} />
        ))}
      </div>

      {/* Предупреждения */}
      <div className="space-y-2 mb-6">
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="h-5 w-5 bg-red-200 rounded animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-red-200 rounded w-64 animate-pulse" />
            <div className="h-3 bg-red-100 rounded w-48 animate-pulse" />
          </div>
          <div className="h-6 w-8 bg-red-200 rounded-full animate-pulse" />
        </div>
      </div>

      {/* Фильтры и управление */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <ProductFiltersSkeleton />
          </div>
          <div>
            <div className="h-32 bg-white rounded-lg border animate-pulse" />
          </div>
        </div>

        {/* Сетка продуктов */}
        <ProductGridSkeleton count={8} />
      </div>
    </div>
  );
}
