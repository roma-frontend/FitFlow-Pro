// Обновленный ShopView.tsx
"use client";

import React from 'react';
import ProductsFilters from '@/components/ProductsFilters';
import CartButton from '@/components/CartButton';
import ProductGrid from './ProductGrid';
import Cart from '../products/Cart';
import ShopSkeleton from '@/components/ui/ShopSkeleton';
import { ShoppingBag, Sparkles } from 'lucide-react';
import { useShopProductsAPI } from '@/hooks/useShopProductsAPI';

export default function ShopView() {
  const { isLoading } = useShopProductsAPI();

  // Показываем полный скелетон страницы при первоначальной загрузке
  if (isLoading) {
    return <ShopSkeleton />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4">
      {/* Улучшенный заголовок */}
      <div className="relative mb-8 p-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl text-white overflow-hidden">
        {/* Декоративные элементы */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
        
        <div className="relative flex justify-between items-center">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <ShoppingBag className="w-8 h-8" />
              <h1 className="text-3xl font-bold">Магазин спортивного питания</h1>
            </div>
            <p className="text-blue-100 text-lg mb-4">
              Качественные добавки для ваших тренировок
            </p>
            <div className="flex items-center gap-2 text-sm text-blue-100">
              <Sparkles className="w-4 h-4" />
              <span>Быстрая доставка • Гарантия качества • Лучшие цены</span>
            </div>
          </div>
          <div className="hidden lg:block">
            <CartButton />
          </div>
        </div>
      </div>

      {/* Мобильная кнопка корзины */}
      <div className="lg:hidden mb-6 flex justify-end">
        <CartButton />
      </div>

      {/* Основной контент */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Фильтры */}
        <div className="lg:col-span-1">
          <div className="sticky top-32">
            <ProductsFilters />
          </div>
        </div>

        {/* Сетка товаров */}
        <div className="lg:col-span-3">
          <ProductGrid />
        </div>
      </div>

      {/* Корзина */}
      <Cart />
    </div>
  );
}

