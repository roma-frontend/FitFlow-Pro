// utils/typeGuards.ts

import { FilterType, LoadingState, PlanType, SortBy } from "@/types/common";


export const isPlanType = (value: string): value is PlanType => {
    return ['basic', 'premium', 'vip', 'unlimited'].includes(value);
  };
  
  export const isFilterType = (value: string): value is FilterType => {
    return ['all', 'basic', 'premium', 'vip', 'unlimited'].includes(value);
  };
  
  export const isSortBy = (value: string): value is SortBy => {
    return ['name', 'price', 'duration', 'createdAt'].includes(value);
  };
  
  export const isLoadingState = (value: string): value is LoadingState => {
    return ['idle', 'loading', 'success', 'error'].includes(value);
  };