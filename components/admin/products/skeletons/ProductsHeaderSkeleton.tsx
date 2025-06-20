// components/admin/products/skeletons/ProductsHeaderSkeleton.tsx
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export function ProductsHeaderSkeleton() {
  return (
    <header className="relative bg-gradient-to-r from-white via-gray-50 to-white border-b border-gray-200/80 backdrop-blur-sm mb-4">
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />
      
      <div className="px-4 py-3 sm:px-6 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Левая часть */}
          <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
            {/* Иконка */}
            <div className="relative flex-shrink-0">
              <Skeleton className="h-10 w-10 sm:h-12 sm:w-12 rounded-full" />
              <Skeleton className="absolute -bottom-0.5 -right-0.5 h-3 w-3 sm:h-4 sm:w-4 rounded-full" />
            </div>

            {/* Информация */}
            <div className="min-w-0 flex-1">
              <Skeleton className="h-6 sm:h-7 lg:h-8 w-48 mb-1" />
              <div className="flex items-center gap-1.5">
                <Skeleton className="h-3 w-3 rounded" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          </div>

          {/* Правая часть - кнопки */}
          <div className="flex items-center gap-1 sm:gap-2">
            <Skeleton className="h-10 w-10 rounded-xl hidden sm:block" />
            <Skeleton className="h-10 w-10 rounded-xl hidden sm:block" />
            <Skeleton className="h-10 w-10 rounded-xl hidden sm:block" />
            <Skeleton className="h-10 w-10 rounded-xl" />
            <Skeleton className="h-10 w-10 rounded-xl" />
          </div>
        </div>
      </div>
    </header>
  );
}
