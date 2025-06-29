// components/ui/ProductSkeleton.tsx
import React from 'react';

interface ProductSkeletonProps {
  count?: number;
}

const ProductSkeleton = ({ count = 6 }: ProductSkeletonProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <div 
          key={index} 
          className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
        >
          {/* Изображение скелетон */}
          <div className="relative h-48 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer">
            <div className="absolute inset-0 bg-gray-200/50"></div>
          </div>
          
          {/* Контент скелетон */}
          <div className="p-4 space-y-3">
            {/* Заголовок */}
            <div className="h-5 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-md"></div>
            
            {/* Описание */}
            <div className="space-y-2">
              <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-md w-full"></div>
              <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-md w-3/4"></div>
            </div>
            
            {/* Цена и кнопка */}
            <div className="flex items-center justify-between pt-2">
              <div className="h-6 w-20 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-md"></div>
              <div className="h-9 w-24 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-md"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductSkeleton;
