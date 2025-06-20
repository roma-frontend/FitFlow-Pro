import { useMemo } from 'react';
import { Order } from '@/types/order';

interface UseOrderFiltersProps {
  orders: Order[];
  searchTerm: string;
  statusFilter: string;
}

export const useOrderFilters = ({ orders, searchTerm, statusFilter }: UseOrderFiltersProps) => {
  return useMemo(() => {
    return orders.filter(order => {
      const matchesSearch = order.items.some(item => 
        item.productName.toLowerCase().includes(searchTerm.toLowerCase())
      ) || order._id.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchTerm, statusFilter]);
};
