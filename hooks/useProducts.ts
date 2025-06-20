// hooks/useProducts.ts
import { useProductsQuery, useProductMutations } from './useProductsQuery';
import { useQueryClient } from '@tanstack/react-query';
import type { Product, ProductFormData } from '@/types/product';

export function useProducts(params?: {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) {
  const { products, isLoading, error, refetch } = useProductsQuery(params);
  const mutations = useProductMutations();
  const queryClient = useQueryClient();

  // Принудительное обновление всех связанных запросов
  const forceRefresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ['products'] });
    await refetch();
  };

  return {
    products,
    isLoading,
    error,
    refetch,
    forceRefresh, // Новый метод для принудительного обновления
    ...mutations
  };
}

export function useProductManagement() {
  const mutations = useProductMutations();
  const queryClient = useQueryClient();

  return {
    createProduct: async (data: ProductFormData): Promise<Product> => {
      try {
        const result = await mutations.createProduct(data);
        // Принудительно обновляем кэш после создания
        await queryClient.invalidateQueries({ queryKey: ['products'] });
        return result;
      } catch (error) {
        console.error('Create product error:', error);
        throw error;
      }
    },
    
    updateProduct: async (id: string, data: Partial<ProductFormData>): Promise<Product> => {
      try {
        const result = await mutations.updateProduct(id, data);
        // Принудительно обновляем кэш после обновления
        await queryClient.invalidateQueries({ queryKey: ['products'] });
        // Дополнительно рефетчим данные
        await queryClient.refetchQueries({ queryKey: ['products'] });
        return result;
      } catch (error) {
        console.error('Update product error:', error);
        throw error;
      }
    },
    
    deleteProduct: async (id: string, deleteType: 'soft' | 'hard' = 'soft'): Promise<void> => {
      try {
        await mutations.deleteProduct(id, deleteType);
        // Принудительно обновляем кэш после удаления
        await queryClient.invalidateQueries({ queryKey: ['products'] });
        await queryClient.refetchQueries({ queryKey: ['products'] });
      } catch (error) {
        console.error('Delete product error:', error);
        throw error;
      }
    },
    
    isCreating: mutations.isCreating,
    isUpdating: mutations.isUpdating,
    isDeleting: mutations.isDeleting,
    
    createError: mutations.createError,
    updateError: mutations.updateError,
    deleteError: mutations.deleteError,
  };
}
