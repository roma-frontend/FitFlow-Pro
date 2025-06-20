// types/product.ts
export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: 'supplements' | 'drinks' | 'snacks' | 'merchandise';
  inStock: number;
  isPopular: boolean;
  imageUrl: string;
  createdAt: string; // Используем string для совместимости с API
  updatedAt: string;
  isDeleted?: boolean;
}

export interface ProductFormData {
  name: string;
  description: string;
  price: number;
  category: 'supplements' | 'drinks' | 'snacks' | 'merchandise';
  inStock: number;
  isPopular: boolean;
  imageUrl: string;
}

export type CategoryFilter = 'all' | 'supplements' | 'drinks' | 'snacks' | 'merchandise';
export type StockFilter = 'all' | 'in-stock' | 'low-stock' | 'out-of-stock';
export type PopularFilter = 'all' | 'popular' | 'regular';
export type SortByOption = 'name' | 'price' | 'inStock' | 'createdAt' | 'updatedAt' | 'category';
export type SortOrderOption = 'asc' | 'desc';

export interface FilterState {
  searchTerm: string;
  categoryFilter: CategoryFilter;
  stockFilter: StockFilter;
  popularFilter: PopularFilter;
  sortBy: SortByOption;
  sortOrder: SortOrderOption;
}
