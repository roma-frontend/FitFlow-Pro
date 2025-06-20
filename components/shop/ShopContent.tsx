"use client";

import React, { memo } from "react";
import { useHydration } from "@/hooks/useHydration";
import ProductFilters from "./ProductFilters";
import ProductGrid from "./ProductGrid";
import CartButton from "../CartButton";
import Cart from "../products/Cart";

const ShopContent = memo(() => {
  const isHydrated = useHydration();

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Хедер с кнопкой корзины */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Магазин FitAccess
          </h1>
          <p className="text-gray-600">
            Спортивное питание и аксессуары для фитнеса
          </p>
        </div>
        <CartButton />
      </div>

      {/* Фильтры */}
      <div className="mb-8">
        <ProductFilters />
      </div>

      {/* Сетка продуктов */}
      <ProductGrid />

      {isHydrated && <Cart />}
    </div>
  );
});

ShopContent.displayName = "ShopContent";

export default ShopContent;
