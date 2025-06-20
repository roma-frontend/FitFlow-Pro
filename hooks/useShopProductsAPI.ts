"use client";

import { useState, useEffect, useMemo } from 'react';
import { Id } from "@/convex/_generated/dataModel";

export interface ShopProduct {
  _id: Id<"products"> | string;
  name: string;
  description: string;
  category: 'supplements' | 'drinks' | 'snacks' | 'merchandise';
  price: number;
  imageUrl?: string;
  inStock: number;
  minStock?: number;
  isPopular?: boolean;
  isActive: boolean;
  nutrition?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    sugar?: number;
  };
  createdAt: number;
  updatedAt?: number;
}

interface APIResponse {
  success: boolean;
  data: ShopProduct[];
  count: number;
  timestamp?: string;
  error?: string;
}

interface UseShopProductsAPIProps {
  searchQuery?: string;
  category?: string;
  priceRange?: [number, number] | null;
  sortBy?: 'name' | 'price' | 'popularity' | 'inStock' | 'newest';
  sortOrder?: 'asc' | 'desc';
}

export function useShopProductsAPI(filters: UseShopProductsAPIProps = {}) {
  const [allProducts, setAllProducts] = useState<ShopProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    searchQuery = '',
    category = 'all',
    priceRange = null,
    sortBy = 'name',
    sortOrder = 'asc'
  } = filters;

  // Fetch all products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch('/api/shop/products');
        const data: APIResponse = await response.json();

        if (data.success) {
          setAllProducts(data.data || []);
        } else {
          setError(data.error || 'Ошибка загрузки');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ошибка загрузки');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filter and sort products based on parameters
  const filteredProducts = useMemo(() => {
    let filtered = [...allProducts];

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query)
      );
    }

    // Filter by category
    if (category && category !== 'all') {
      filtered = filtered.filter(product => product.category === category);
    }

    // Filter by price range
    if (priceRange && priceRange.length === 2) {
      const [minPrice, maxPrice] = priceRange;
      filtered = filtered.filter(product =>
        product.price >= minPrice && product.price <= maxPrice
      );
    }

    // Filter only active products
    filtered = filtered.filter(product => product.isActive);

    // Sort products
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'price':
          comparison = a.price - b.price;
          break;
        case 'popularity':
          comparison = (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0);
          break;
        case 'inStock':
          comparison = b.inStock - a.inStock;
          break;
        case 'newest':
          comparison = b.createdAt - a.createdAt;
          break;
        default:
          comparison = 0;
      }

      return sortOrder === 'desc' ? -comparison : comparison;
    });

    return filtered;
  }, [allProducts, searchQuery, category, priceRange, sortBy, sortOrder]);

  const refetch = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/shop/products');
      const data: APIResponse = await response.json();

      if (data.success) {
        setAllProducts(data.data || []);
      } else {
        setError(data.error || 'Ошибка загрузки');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    products: filteredProducts,
    isLoading,
    error,
    refetch,
    totalCount: allProducts.length
  };
}

export type { UseShopProductsAPIProps };
