// hooks/usePlansFilter.ts
import { useMemo, useState, useCallback } from 'react';
import type { MembershipPlan } from '@/types/membership';
import type { FilterType, SortBy } from '@/types/common';
import { useDebounce } from '@/hooks/useDebounce';

export type { FilterType, SortBy } from '@/types/common';

export const usePlansFilter = (plans: MembershipPlan[]) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortBy>('name');
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  
  const filteredPlans = useMemo(() => {
    return plans
      .filter(plan => {
        const matchesSearch = plan.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                            plan.description?.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
        const matchesType = filterType === 'all' || plan.type === filterType;
        const matchesActive = !showActiveOnly || plan.isActive;
        
        return matchesSearch && matchesType && matchesActive;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'price':
            return a.price - b.price;
          case 'duration':
            return a.duration - b.duration;
          case 'createdAt':
            return (b.createdAt || 0) - (a.createdAt || 0);
          default:
            return a.name.localeCompare(b.name);
        }
      });
  }, [plans, debouncedSearchTerm, filterType, sortBy, showActiveOnly]);

  // Wrapped setters для совместимости с компонентом
  const handleFilterTypeChange = useCallback((value: FilterType) => {
    setFilterType(value);
  }, []);

  const handleSortByChange = useCallback((value: SortBy) => {
    setSortBy(value);
  }, []);
  
  return {
    filteredPlans,
    searchTerm,
    setSearchTerm,
    filterType,
    setFilterType: handleFilterTypeChange,
    sortBy,
    setSortBy: handleSortByChange,
    showActiveOnly,
    setShowActiveOnly,
    resultsCount: filteredPlans.length,
    totalCount: plans.length
  };
};