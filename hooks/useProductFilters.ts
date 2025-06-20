// hooks/useProductFilters.ts
import { Product } from '@/types/product';
import { useState, useMemo } from 'react';

export function useProductFilters(products: Product[]) {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<"supplements" | "drinks" | "snacks" | "merchandise" | "all">("all");
  const [stockFilter, setStockFilter] = useState<"all" | "in-stock" | "low-stock" | "out-of-stock">("all");
  const [popularFilter, setPopularFilter] = useState<"popular" | "all" | "regular">("all");

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;
      const matchesStock = stockFilter === "all" ||
        (stockFilter === "in-stock" && product.inStock > 10) ||
        (stockFilter === "low-stock" && product.inStock > 0 && product.inStock <= 10) ||
        (stockFilter === "out-of-stock" && product.inStock === 0);
      const matchesPopular = popularFilter === "all" ||
        (popularFilter === "popular" && product.isPopular) ||
        (popularFilter === "regular" && !product.isPopular);

      return matchesSearch && matchesCategory && matchesStock && matchesPopular;
    });
  }, [products, searchTerm, categoryFilter, stockFilter, popularFilter]);

  return {
    searchTerm,
    setSearchTerm,
    categoryFilter,
    setCategoryFilter,
    stockFilter,
    setStockFilter,
    popularFilter,
    setPopularFilter,
    filteredProducts
  };
}
