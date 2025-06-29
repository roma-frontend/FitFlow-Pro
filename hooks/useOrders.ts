import { useState, useEffect, useCallback } from 'react';
import { Order } from '@/types/order';

export const useOrders = (userId?: string) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/orders', {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Ошибка загрузки заказов');
      }
      
      const data = await response.json();
      setOrders(data.orders || []);
    } catch (err) {
      console.error('Ошибка загрузки заказов:', err);
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return { orders, loading, error, refetch: fetchOrders };
};
