// types/membership.ts
export interface Membership {
  _id: string;
  userId: string;
  trainerId?: string;
  type: 'basic' | 'premium' | 'vip' | 'unlimited';
  price: number;
  startDate: number;
  expiresAt: number;
  isActive: boolean;
  remainingDays?: number;
  status?: 'active' | 'expired' | 'cancelled';
  autoRenew?: boolean;
  paymentIntentId?: string;
  paymentMethod?: string;
  usageStats?: {
    visitsThisMonth: number;
    totalVisits: number;
    favoriteTime: string;
  };
  _version?: number;
  _lastSync?: number;
  _isDirty?: boolean;
}

export interface MembershipPlan {
  _id: string;
  name: string;
  type: string;
  duration: number; // в днях
  price: number;
  description?: string;
  features: string[];
  isActive: boolean;
  createdAt: number;
  limitations?: string[];
  color?: string;
  icon?: string;
  popular?: boolean;
  discount?: number;
  _version?: number;
  _lastSync?: number;
  _isDirty?: boolean;
}

export interface MembershipFormData {
  userId: string;
  planId: string;
  trainerId?: string;
  autoRenew?: boolean;
  paymentIntentId?: string;
  paymentMethod?: string;
}

export interface MembershipStats {
  total: number;
  active: number;
  expired: number;
  basic: number;
  premium: number;
  vip: number;
  unlimited: number;
}

export interface MembershipPlanFormData {
  name: string;
  type: string;
  duration: number;
  price: number;
  description?: string;
  features: string[];
}