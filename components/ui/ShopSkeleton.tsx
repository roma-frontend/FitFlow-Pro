// components/ui/ShopSkeleton.tsx
import React from 'react';

const ShopSkeleton = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 animate-pulse">
      {/* Заголовок скелетон */}
      <div className="relative mb-8 p-6 bg-gradient-to-r from-gray-300 to-gray-400 rounded-2xl overflow-hidden">
        <div className="relative flex justify-between items-center">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-white/30 rounded"></div>
              <div className="h-8 bg-white/30 rounded-md w-80"></div>
            </div>
            <div className="h-5 bg-white/20 rounded-md w-64 mb-4"></div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-white/30 rounded"></div>
              <div className="h-4 bg-white/20 rounded-md w-96"></div>
            </div>
          </div>
          <div className="hidden lg:block">
            <div className="w-12 h-12 bg-white/30 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Мобильная кнопка корзины скелетон */}
      <div className="lg:hidden mb-6 flex justify-end">
        <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
      </div>

      {/* Основной контент */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Фильтры скелетон */}
        <div className="lg:col-span-1">
          <div className="sticky top-32 space-y-6">
            {/* Поиск */}
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="h-5 bg-gray-200 rounded-md w-20 mb-3"></div>
              <div className="h-10 bg-gray-100 rounded-md"></div>
            </div>
            
            {/* Категории */}
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="h-5 bg-gray-200 rounded-md w-24 mb-3"></div>
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-4 bg-gray-100 rounded-md"></div>
                ))}
              </div>
            </div>
            
            {/* Цена */}
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="h-5 bg-gray-200 rounded-md w-16 mb-3"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-100 rounded-md"></div>
                <div className="flex gap-2">
                  <div className="h-8 bg-gray-100 rounded-md flex-1"></div>
                  <div className="h-8 bg-gray-100 rounded-md flex-1"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Сетка товаров скелетон */}
        <div className="lg:col-span-3">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div 
                key={index} 
                className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm"
              >
                {/* Изображение скелетон */}
                <div className="h-48 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer"></div>
                
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
        </div>
      </div>
    </div>
  );
};

export default ShopSkeleton;
