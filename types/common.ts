// types/common.ts
export type FilterType = 'all' | 'basic' | 'premium' | 'vip' | 'unlimited';
export type SortBy = 'name' | 'price' | 'duration' | 'createdAt';
export type PlanType = 'basic' | 'premium' | 'vip' | 'unlimited';

// Общие типы для API
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: SortBy;
  filterType?: FilterType;
  search?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Типы для форм
export interface FormValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

// Типы для состояний загрузки
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface AsyncState<T = any> {
  data: T | null;
  loading: LoadingState;
  error: string | null;
}

// types/plans.ts
export interface MembershipPlan {
  _id: string;
  name: string;
  type: PlanType;
  duration: number;
  price: number;
  description?: string;
  features: string[];
  isActive: boolean;
  createdAt?: number;
  updatedAt?: number;
}

export interface PlanFormData {
  name: string;
  type: PlanType;
  duration: number;
  price: number;
  description: string;
  features: string[];
  isActive: boolean;
}

export interface PlanStatistics {
  total: number;
  active: number;
  inactive: number;
  monthly: number;
  yearly: number;
  byType: Record<PlanType, number>;
  averagePrice: number;
  totalRevenue: number;
}