// stores/productsStore.ts
import { create } from 'zustand';
import type { ShopProduct } from '@/hooks/useShopProductsAPI';

export interface ProductsStore {
  // Products data
  products: ShopProduct[];
  filteredProducts: ShopProduct[];
  loading: boolean;
  error: string | null;
  
  // Actions for products data
  setProducts: (products: ShopProduct[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  filterProducts: () => void;
  
  // Поиск
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  
  // Категория
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  
  // Диапазон цен
  priceRange: [number, number] | null;
  setPriceRange: (range: [number, number] | null) => void;
  
  // Сортировка
   sortBy: 'name' | 'price' | 'popular' | 'inStock' | 'newest';
  setSortBy: (sort: 'name' | 'price' | 'popular' | 'inStock' | 'newest') => void;
  
  sortOrder: 'asc' | 'desc';
  setSortOrder: (order: 'asc' | 'desc') => void;
  
  // Сброс всех фильтров
  resetFilters: () => void;
}

export const useProductsStore = create<ProductsStore>((set, get) => ({
  // Products data - начальные значения
  products: [],
  filteredProducts: [],
  loading: false,
  error: null,
  
  // Filter state - начальные значения
  searchQuery: '',
  selectedCategory: 'all',
  priceRange: null,
  sortBy: 'newest',
  sortOrder: 'desc',
  
  // Products data actions
  setProducts: (products: ShopProduct[]) => {
    set({ products });
    // Автоматически запускаем фильтрацию при обновлении продуктов
    get().filterProducts();
  },
  
  setLoading: (loading: boolean) => set({ loading }),
  
  setError: (error: string | null) => set({ error }),
  
  filterProducts: () => {
    const state = get();
    let filtered = [...state.products];
    
    // Фильтрация по поисковому запросу
    if (state.searchQuery?.trim()) {
      const query = state.searchQuery.toLowerCase().trim();
      filtered = filtered.filter(product => {
        if (!product) return false;
        
        const name = product.name?.toLowerCase() || '';
        const description = product.description?.toLowerCase() || '';
        const category = product.category?.toLowerCase() || '';
        
        return name.includes(query) || description.includes(query) || category.includes(query);
      });
    }
    
    // Фильтрация по категории
    if (state.selectedCategory && state.selectedCategory !== 'all') {
      filtered = filtered.filter(product =>
        product?.category === state.selectedCategory
      );
    }
    
    // Фильтрация по диапазону цен
    if (state.priceRange && Array.isArray(state.priceRange) && state.priceRange.length === 2) {
      const [min, max] = state.priceRange;
      filtered = filtered.filter(product => {
        const price = product?.price || 0;
        return price >= min && price <= max;
      });
    }
    
    // Фильтр только активные товары
    filtered = filtered.filter(product => product?.isActive !== false);
    
    // Сортировка
    filtered.sort((a, b) => {
      if (!a || !b) return 0;
      
      let comparison = 0;
      
      switch (state.sortBy) {
        case 'name':
          comparison = (a.name || '').localeCompare(b.name || '');
          break;
        case 'price':
          comparison = (a.price || 0) - (b.price || 0);
          break;
        case 'inStock':
          comparison = (b.inStock || 0) - (a.inStock || 0);
          break;
        case 'newest':
          comparison = (b.createdAt || 0) - (a.createdAt || 0);
          break;
        default:
          comparison = 0;
      }
      
      return state.sortOrder === 'desc' ? -comparison : comparison;
    });
    
    set({ filteredProducts: filtered });
  },
  
  // Filter actions - обновляем с автоматической фильтрацией
  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
    get().filterProducts();
  },
  
  setSelectedCategory: (category: string) => {
    set({ selectedCategory: category });
    get().filterProducts();
  },
  
  setPriceRange: (range: [number, number] | null) => {
    set({ priceRange: range });
    get().filterProducts();
  },
  
  setSortBy: (sort: 'name' | 'price' | 'popular' | 'inStock' | 'newest') => {
    set({ sortBy: sort });
    get().filterProducts();
  },
  
  setSortOrder: (order: 'asc' | 'desc') => {
    set({ sortOrder: order });
    get().filterProducts();
  },
  
  resetFilters: () => {
    set({
      searchQuery: '',
      selectedCategory: 'all',
      priceRange: null,
      sortBy: 'newest',
      sortOrder: 'desc',
    });
    get().filterProducts();
  },
}));
