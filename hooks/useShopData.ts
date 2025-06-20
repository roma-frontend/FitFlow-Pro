"use client";

import { useMemo } from "react";
import { 
  useShopProductsWithFallback, 
  useShopProductStatsWithFallback,
  useShopAvailability 
} from "@/hooks/useShopProducts";

export function useShopData() {
  // Используем хуки с fallback
  const products = useShopProductsWithFallback();
  const productStats = useShopProductStatsWithFallback();
  const { isAvailable } = useShopAvailability();

  // Проверяем загрузку - если данные undefined, значит еще загружаются
  const isLoading = products === undefined || productStats === undefined;

  // Обрабатываем данные
  const processedData = useMemo(() => {
    if (isLoading) return null;

    // Адаптируем данные под ожидаемую структуру
    return {
      products: {
        items: products || [],
        total: productStats?.total || 0,
        active: productStats?.active || 0,
        inStock: productStats?.inStock || 0,
        lowStock: productStats?.lowStock || 0,
        outOfStock: productStats?.outOfStock || 0,
        totalValue: productStats?.totalValue || 0,
        byCategory: productStats?.byCategory || {},
        lowStockProducts: productStats?.lowStockProducts || []
      },
      categories: Object.keys(productStats?.byCategory || {}),
      popularProducts: products?.filter(p => p.isPopular) || [],
      availability: {
        isAvailable,
        hasProducts: (products?.length || 0) > 0,
        productsCount: products?.length || 0
      }
    };
  }, [products, productStats, isLoading, isAvailable]);

  return {
    data: processedData,
    loading: isLoading,
    products,
    productStats,
    isAvailable
  };
}
