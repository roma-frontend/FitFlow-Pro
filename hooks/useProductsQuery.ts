// hooks/useProductsQuery.ts
import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from '@tanstack/react-query';
import {
  fetchProducts,
  fetchProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  bulkUpdateProducts,
  bulkDeleteProducts
} from '@/lib/api/products';
import type { Product, ProductFormData } from '@/types/product';

interface ProductsQueryParams {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Хук для получения списка продуктов
export function useProductsQuery(params?: ProductsQueryParams) {
  const {
    data: products = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['products', params],
    queryFn: () => fetchProducts(params),
    staleTime: 0, // Данные сразу устаревают
    gcTime: 0, // Не кэшируем
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    enabled: true,
  });

  return {
    products,
    isLoading,
    error: error?.message,
    refetch
  };
}

// Хук для получения одного продукта
export function useProductQuery(id: string, options?: Partial<UseQueryOptions<Product>>) {
  return useQuery({
    queryKey: ['products', id],
    queryFn: () => fetchProduct(id),
    enabled: !!id,
    staleTime: 0, // Убираем кэширование для отдельных продуктов
    ...options
  });
}

export function useProductMutations() {
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ProductFormData> }) =>
      updateProduct(id, data),
    onMutate: async ({ id, data }) => {
      // Отменяем исходящие запросы
      await queryClient.cancelQueries({ queryKey: ['products'] });
      
      // Получаем предыдущие данные для отката
      const previousProducts = queryClient.getQueryData(['products']);
      
      // Оптимистично обновляем UI
      queryClient.setQueryData(['products'], (old: Product[] = []) =>
        old.map(product =>
          product._id === id ? { ...product, ...data } : product
        )
      );
      
      return { previousProducts };
    },
    onSuccess: async (updatedProduct, { id }) => {
      console.log('🔍 Update mutation onSuccess:', { updatedProduct, id });

      if (updatedProduct && updatedProduct._id) {
        // Обновляем кеш конкретного продукта
        queryClient.setQueryData(['products', updatedProduct._id], updatedProduct);

        // Обновляем список продуктов
        queryClient.setQueryData(['products'], (oldData: Product[] = []) =>
          oldData.map(product =>
            product._id === updatedProduct._id ? updatedProduct : product
          )
        );

        // Принудительно инвалидируем и рефетчим
        await queryClient.invalidateQueries({
          queryKey: ['products'],
          refetchType: 'active'
        });

        console.log('✅ Cache updated successfully');
      }
    },
    onError: (error, variables, context) => {
      // Откатываем изменения при ошибке
      if (context?.previousProducts) {
        queryClient.setQueryData(['products'], context.previousProducts);
      }
      console.error('Failed to update product:', error);
    },
    onSettled: () => {
      // Всегда инвалидируем после завершения
      queryClient.invalidateQueries({ queryKey: ['products'] });
    }
  });

  // Остальные мутации остаются без изменений...
  const createMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: (newProduct) => {
      queryClient.setQueryData(['products'], (oldData: Product[] = []) => [
        newProduct,
        ...oldData
      ]);
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (error) => {
      console.error('Failed to create product:', error);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: ({ id, deleteType }: { id: string; deleteType?: 'soft' | 'hard' }) =>
      deleteProduct(id, deleteType),
    onSuccess: (_, { id, deleteType }) => {
      console.log('🔍 Delete mutation onSuccess:', { id, deleteType });

      queryClient.removeQueries({ queryKey: ['products', id] });

      if (deleteType === 'hard') {
        queryClient.setQueryData(['products'], (oldData: Product[] = []) => {
          if (!oldData) return [];
          return oldData.filter(product => product._id !== id);
        });
      } else {
        queryClient.setQueryData(['products'], (oldData: Product[] = []) => {
          if (!oldData) return [];
          return oldData.filter(product => product._id !== id);
        });
      }

      queryClient.invalidateQueries({ queryKey: ['products'] });
      console.log('✅ Delete cache updated successfully');
    },
    onError: (error) => {
      console.error('Failed to delete product:', error);
    }
  });

  const bulkUpdateMutation = useMutation({
    mutationFn: ({ ids, updates }: { ids: string[]; updates: Partial<ProductFormData> }) =>
      bulkUpdateProducts(ids, updates),
    onSuccess: (updatedProducts) => {
      updatedProducts.forEach(product => {
        queryClient.setQueryData(['products', product._id], product);
      });
      queryClient.setQueryData(['products'], (oldData: Product[] = []) =>
        oldData.map(product => {
          const updated = updatedProducts.find(p => p._id === product._id);
          return updated || product;
        })
      );
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (error) => {
      console.error('Failed to bulk update products:', error);
    }
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: ({ ids, deleteType }: { ids: string[]; deleteType?: 'soft' | 'hard' }) =>
      bulkDeleteProducts(ids, deleteType),
    onSuccess: (_, { ids }) => {
      ids.forEach(id => {
        queryClient.removeQueries({ queryKey: ['products', id] });
      });
      queryClient.setQueryData(['products'], (oldData: Product[] = []) =>
        oldData.filter(product => !ids.includes(product._id))
      );
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (error) => {
      console.error('Failed to bulk delete products:', error);
    }
  });

  return {
    createProduct: createMutation.mutateAsync,
    updateProduct: (id: string, data: Partial<ProductFormData>) =>
      updateMutation.mutateAsync({ id, data }),
    deleteProduct: (id: string, deleteType?: 'soft' | 'hard') =>
      deleteMutation.mutateAsync({ id, deleteType }),
    bulkUpdateProducts: (ids: string[], updates: Partial<ProductFormData>) =>
      bulkUpdateMutation.mutateAsync({ ids, updates }),
    bulkDeleteProducts: (ids: string[], deleteType?: 'soft' | 'hard') =>
      bulkDeleteMutation.mutateAsync({ ids, deleteType }),

    // Состояния загрузки
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isBulkUpdating: bulkUpdateMutation.isPending,
    isBulkDeleting: bulkDeleteMutation.isPending,

    // Ошибки
    createError: createMutation.error?.message,
    updateError: updateMutation.error?.message,
    deleteError: deleteMutation.error?.message,
    bulkUpdateError: bulkUpdateMutation.error?.message,
    bulkDeleteError: bulkDeleteMutation.error?.message,
  };
}
