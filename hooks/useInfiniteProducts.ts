// hooks/useInfiniteProducts.ts
import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchProducts } from '@/lib/api/products';

interface InfiniteProductsParams {
  limit?: number;
  category?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export function useInfiniteProducts(params: InfiniteProductsParams = {}) {
  const { limit = 20, ...otherParams } = params;

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = useInfiniteQuery({
    queryKey: ['products', 'infinite', params],
    queryFn: ({ pageParam = 1 }) =>
      fetchProducts({
        ...otherParams,
        page: pageParam,
        limit,
      }),
    getNextPageParam: (lastPage, allPages) => {
      // Если последняя страница содержит меньше элементов чем лимит,
      // значит это последняя страница
      if (lastPage.length < limit) {
        return undefined;
      }
      return allPages.length + 1;
    },
    initialPageParam: 1,
  });

  // Объединяем все страницы в один массив
  const products = data?.pages.flat() ?? [];

  return {
    products,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error: error?.message,
  };
}
