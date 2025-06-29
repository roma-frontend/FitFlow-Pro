// types/password-reset.ts
export interface PasswordResetLog {
  _id: string;
  userId: string;
  userType: 'staff' | 'member';
  email: string;
  action: 'requested' | 'completed' | 'failed' | 'expired';
  timestamp: number;
  details?: string;
}

export type UserTypeFilter = 'all' | 'staff' | 'member';
export type ActionFilter = 'all' | 'requested' | 'completed' | 'failed' | 'expired';
export type DateRangeFilter = 'all' | 'today' | 'week' | 'month';

export interface LogStats {
  total: number;
  requested: number;
  completed: number;
  failed: number;
  expired: number;
  staff: number;
  members: number;
}

export interface CleanupResult {
  success: boolean;
  message?: string;
  error?: string;
  cleanedCount?: number;
}
