"use client";

import { useEffect, useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useShopProductsAPI, type ShopProduct } from './useShopProductsAPI';

export interface ShopProductStats {
  total: number;
  active: number;
  inStock: number;
  lowStock: number;
  outOfStock: number;
  totalValue: number;
  byCategory: Record<string, {
    count: number;
    inStock: number;
    totalValue: number;
    averagePrice: number;
  }>;
  lowStockProducts: Array<{
    id: string;
    name: string;
    currentStock: number;
    minStock: number;
    category: string;
  }>;
}

// Проверяем доступность Products API
function isProductsApiAvailable() {
  try {
    return api && api.products && typeof api.products === 'object';
  } catch (error) {
    return false;
  }
}

// Один мок-продукт как fallback
function getMockProduct(): ShopProduct {
  return {
    _id: "mock_fallback" as Id<"products">,
    name: "Протеиновый коктейль (демо)",
    description: "Высококачественный сывороточный протеин для набора мышечной массы. Это демо-продукт, показывается когда база данных недоступна.",
    category: "supplements",
    price: 2500,
    imageUrl: "https://via.placeholder.com/300x300/4F46E5/FFFFFF?text=Demo+Protein",
    inStock: 50,
    minStock: 10,
    isPopular: true,
    isActive: true,
    nutrition: {
      calories: 120,
      protein: 25,
      carbs: 3,
      fat: 1
    },
    createdAt: Date.now()
  };
}

// Основной хук для получения всех активных продуктов
export function useShopProducts() {
  const { products, isLoading, error } = useShopProductsAPI();
  
  // Если загрузка - возвращаем undefined
  if (isLoading) {
    console.log('⏳ useShopProducts: Загрузка через API...');
    return undefined;
  }
  
  // Если ошибка - возвращаем мок-данные
  if (error) {
    console.log('❌ useShopProducts: Ошибка API, используем мок-данные:', error);
    return [getMockProduct()];
  }
  
  // Если есть данные - возвращаем их
  if (products && products.length > 0) {
    console.log('✅ useShopProducts: Получены данные через API:', products.length);
    return products;
  }
  
  // Если пустой массив - возвращаем мок-данные
  console.log('🔄 useShopProducts: Пустой ответ API, используем мок-данные');
  return [getMockProduct()];
}

// Хук для получения продукта по ID
export function useShopProduct(productId: Id<"products">) {
  let result;
  try {
    if (isProductsApiAvailable() && api.products?.getById) {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      result = useQuery(api.products.getById, { id: productId });
    }
  } catch (error) {
    console.warn('Product by ID API недоступен:', error);
    result = undefined;
  }

  return result ?? null;
}

// Хук для получения продуктов по категории
export function useShopProductsByCategory(category: string) {
  const fallbackData: ShopProduct[] = category === 'supplements' ? [getMockProduct()] : [];

  let result;
  try {
    if (isProductsApiAvailable() && api.products?.getByCategory) {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      result = useQuery(api.products.getByCategory, { category });
    }
  } catch (error) {
    console.warn('Products by category API недоступен:', error);
    result = undefined;
  }

  return result ?? fallbackData;
}

// Хук для получения популярных продуктов
export function usePopularProducts() {
  const fallbackData: ShopProduct[] = [getMockProduct()];

  let result;
  try {
    if (isProductsApiAvailable() && api.products?.getPopular) {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      result = useQuery(api.products.getPopular, {});
    }
  } catch (error) {
    console.warn('Popular products API недоступен:', error);
    result = undefined;
  }

  return result ?? fallbackData;
}

// Хук для статистики продуктов - ВЫЧИСЛЯЕМ НА КЛИЕНТЕ
export function useShopProductStats() {
  const products = useShopProducts();

  return useMemo(() => {
    // Если продукты еще загружаются
    if (products === undefined) {
      console.log('⏳ useShopProductStats: Продукты загружаются...');
      return undefined;
    }

    // Если нет продуктов
    if (!products || products.length === 0) {
      return {
        total: 0,
        active: 0,
        inStock: 0,
        lowStock: 0,
        outOfStock: 0,
        totalValue: 0,
        byCategory: {},
        lowStockProducts: []
      };
    }

    console.log('📊 useShopProductStats: Вычисляем статистику для', products.length, 'продуктов');

    // Вычисляем статистику
    const stats: ShopProductStats = {
      total: products.length,
      active: products.filter((p: ShopProduct) => p.isActive).length,
      inStock: products.filter((p: ShopProduct) => p.inStock > (p.minStock || 5)).length,
      lowStock: products.filter((p: ShopProduct) => p.inStock > 0 && p.inStock <= (p.minStock || 5)).length,
      outOfStock: products.filter((p: ShopProduct) => p.inStock === 0).length,
      totalValue: products.reduce((sum: number, p: ShopProduct) => sum + (p.price * p.inStock), 0),
      byCategory: products.reduce((acc: Record<string, any>, p: ShopProduct) => {
        if (!acc[p.category]) {
          acc[p.category] = {
            count: 0,
            inStock: 0,
            totalValue: 0,
            averagePrice: 0
          };
        }
        
        acc[p.category].count++;
        if (p.inStock > 0) acc[p.category].inStock++;
        acc[p.category].totalValue += p.price * p.inStock;
        
        return acc;
      }, {}),
      lowStockProducts: products
        .filter((p: ShopProduct) => p.inStock > 0 && p.inStock <= (p.minStock || 5))
        .map((p: ShopProduct) => ({
          id: p._id,
          name: p.name,
          currentStock: p.inStock,
          minStock: p.minStock || 5,
          category: p.category
        }))
    };

    // Вычисляем среднюю цену по категориям
    Object.keys(stats.byCategory).forEach((category: string) => {
      const categoryProducts = products.filter((p: ShopProduct) => p.category === category);
      const totalPrice = categoryProducts.reduce((sum: number, p: ShopProduct) => sum + p.price, 0);
      stats.byCategory[category].averagePrice = totalPrice / categoryProducts.length;
    });

    console.log('✅ useShopProductStats: Статистика вычислена:', stats);
    return stats;
  }, [products]);
}

// Хук для проверки доступности Products API
export function useShopAvailability() {
  const [isAvailable, setIsAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const products = useShopProducts();

  useEffect(() => {
    const checkAvailability = () => {
      try {
        const available = isProductsApiAvailable();
        setIsAvailable(available);
        console.log('🔍 useShopAvailability: API доступен:', available);
      } catch (error) {
        console.warn('Products API недоступен:', error);
        setIsAvailable(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAvailability();
  }, []);

  return { 
    isAvailable, 
    isLoading: isLoading || products === undefined,
    hasProducts: products && products.length > 0,
    productsCount: products?.length || 0
  };
}

// Хук для отладки - показывает все продукты включая служебную информацию
export function useShopDebugProducts() {
  let result;
  try {
    if (isProductsApiAvailable() && api.products?.getAllForDebug) {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      result = useQuery(api.products.getAllForDebug, {});
    }
  } catch (error) {
    console.warn('Debug products API недоступен:', error);
    result = undefined;
  }

  return result ?? [getMockProduct()];
}

// Хук для использования реальных данных с fallback на мок
export function useShopProductsWithFallback() {
  const realData = useShopProducts();
  const { isAvailable } = useShopAvailability();

  // Если данные загружаются - возвращаем undefined
  if (realData === undefined) {
    console.log('⏳ useShopProductsWithFallback: Загрузка...');
    return undefined;
  }

  // Если API доступен и есть реальные данные - используем их
  if (isAvailable && realData && realData.length > 0) {
    console.log('✅ useShopProductsWithFallback: Используем реальные данные:', realData.length);
    return realData;
  }

  // Иначе возвращаем мок-данные
  console.log('🔄 useShopProductsWithFallback: Используем мок-данные');
  return [getMockProduct()];
}

// Хук для статистики с fallback
export function useShopProductStatsWithFallback() {
  const realData = useShopProductStats();
  const { isAvailable } = useShopAvailability();

  // Если есть реальные данные - используем их
  if (realData !== undefined) {
    console.log('✅ useShopProductStatsWithFallback: Используем реальную статистику');
    return realData;
  }

  // Иначе вычисляем статистику из мок-данных
  console.log('🔄 useShopProductStatsWithFallback: Используем мок-статистику');
  const mockProduct = getMockProduct();
  
  const fallbackStats: ShopProductStats = {
    total: 1,
    active: 1,
    inStock: 1,
    lowStock: 0,
    outOfStock: 0,
    totalValue: mockProduct.price * mockProduct.inStock,
    byCategory: {
      [mockProduct.category]: {
        count: 1,
        inStock: 1,
        totalValue: mockProduct.price * mockProduct.inStock,
        averagePrice: mockProduct.price
      }
    },
    lowStockProducts: []
  };

  return fallbackStats;
}

// Утилитарные функции для работы с продуктами
export function getCategoryDisplayName(category: string): string {
  const names: Record<string, string> = {
    'supplements': 'Добавки',
    'drinks': 'Напитки',
    'snacks': 'Снеки',
    'merchandise': 'Товары'
  };
  return names[category] || category;
}

export const formatProductPrice = (price: number | undefined | null): string => {
  if (typeof price !== 'number' || isNaN(price)) {
    return '0 ₽';
  }
  return `${price.toLocaleString('ru-RU')} ₽`;
};

export function getStockStatus(product: ShopProduct): 'in_stock' | 'low_stock' | 'out_of_stock' {
  if (product.inStock === 0) return 'out_of_stock';
  if (product.inStock <= (product.minStock || 5)) return 'low_stock';
  return 'in_stock';
}

export function getStockStatusText(status: 'in_stock' | 'low_stock' | 'out_of_stock'): string {
  const texts: Record<string, string> = {
    'in_stock': 'В наличии',
    'low_stock': 'Мало на складе',
    'out_of_stock': 'Нет в наличии'
  };
  return texts[status];
}

// Экспорт основных хуков для удобства
export {
  useShopProductsWithFallback as useProductsData,
  useShopProductStatsWithFallback as useProductStatsData,
  useShopAvailability as useAvailability
};

// Экспорт типов
export type { ShopProduct };
