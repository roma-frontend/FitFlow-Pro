"use client";

import { useCartStore } from '@/stores/cartStore';
import { useProductsStore } from '@/stores/productsStore';
import { CartItem } from '@/types/shop';

// Хук для безопасного получения значений из ProductsStore
export function useProductsStoreWithDefaults() {
  const store = useProductsStore();
  
  return {
    ...store,
    searchQuery: store.searchQuery ?? '',
    selectedCategory: store.selectedCategory ?? 'all',
    priceRange: store.priceRange ?? [0, 10000] as [number, number],
    sortBy: store.sortBy ?? 'name' as const,
    sortOrder: store.sortOrder ?? 'asc' as const,
  };
}

// Хук для безопасного получения значений из CartStore
export function useCartStoreWithDefaults() {
  const store = useCartStore();
  
  return {
    ...store,
    // Гарантируем определенные значения
    items: store.items ?? [] as CartItem[],
    isOpen: store.isOpen ?? false,
  };
}
