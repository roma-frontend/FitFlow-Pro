// hooks/useInfiniteScroll.ts
import { useState, useEffect, useCallback } from 'react';

interface UseInfiniteScrollProps<T> {
  items: T[];
  itemsPerPage?: number;
  hasMore?: boolean;
  onLoadMore?: () => Promise<void>;
}

export function useInfiniteScroll<T>({
  items,
  itemsPerPage = 20,
  hasMore = true,
  onLoadMore
}: UseInfiniteScrollProps<T>) {
  const [displayedItems, setDisplayedItems] = useState<T[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Инициализация первой страницы
  useEffect(() => {
    setDisplayedItems(items.slice(0, itemsPerPage));
    setCurrentPage(1);
  }, [items, itemsPerPage]);

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    
    try {
      if (onLoadMore) {
        await onLoadMore();
      } else {
        // Локальная пагинация
        const nextPage = currentPage + 1;
        const startIndex = (nextPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const newItems = items.slice(0, endIndex);
        
        setDisplayedItems(newItems);
        setCurrentPage(nextPage);
      }
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, itemsPerPage, items, isLoading, hasMore, onLoadMore]);

  // Обработчик скролла
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop
        >= document.documentElement.offsetHeight - 1000
      ) {
        loadMore();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadMore]);

  const hasMoreItems = onLoadMore ? hasMore : displayedItems.length < items.length;

  return {
    displayedItems,
    isLoading,
    hasMore: hasMoreItems,
    loadMore
  };
}
