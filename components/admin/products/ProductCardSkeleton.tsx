// components/admin/products/skeletons/ProductCardSkeleton.tsx
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function ProductCardSkeleton() {
  return (
    <Card className="group relative overflow-hidden border border-gray-200/60 hover:border-gray-300/80 transition-all duration-300 hover:shadow-lg">
      {/* Изображение продукта */}
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        <Skeleton className="h-full w-full" />
        
        {/* Бейдж популярности */}
        <div className="absolute top-3 left-3">
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
        
        {/* Бейдж статуса */}
        <div className="absolute top-3 right-3">
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
        
        {/* Кнопки действий */}
        <div className="absolute bottom-3 right-3 flex gap-2">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-8 w-8 rounded-lg" />
        </div>
      </div>

      <CardHeader className="pb-3">
        {/* Название продукта */}
        <Skeleton className="h-5 w-3/4 mb-2" />
        
        {/* Категория */}
        <Skeleton className="h-4 w-1/2" />
      </CardHeader>

      <CardContent className="pt-0">
        {/* Цена */}
        <div className="flex items-center justify-between mb-3">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
        
        {/* Остаток */}
        <div className="flex items-center gap-2 mb-3">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-4 w-24" />
        </div>
        
        {/* Описание */}
        <div className="space-y-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-4/5" />
          <Skeleton className="h-3 w-3/5" />
        </div>
      </CardContent>
    </Card>
  );
}
