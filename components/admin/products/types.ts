// types/product.ts (обновленная версия)
export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: 'supplements' | 'drinks' | 'snacks' | 'merchandise';
  inStock: number;
  isPopular: boolean;
  imageUrl: string; // Обязательное поле
  createdAt: string;
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

// Типы для фильтров
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

// Дополнительные типы для статистики
export interface FilterStats {
  total: number;
  filtered: number;
  categories: Record<string, number>;
  stockLevels: {
    inStock: number;
    lowStock: number;
    outOfStock: number;
  };
  popularity: {
    popular: number;
    regular: number;
  };
}

// Типы для API ответов
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
