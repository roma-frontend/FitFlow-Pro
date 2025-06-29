// types/user.ts
export type UserRole = 'super-admin' | 'admin' | 'manager' | 'trainer' | 'member' | 'client';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  createdAt?: number;
  createdBy?: string;
  isActive?: boolean;
  photoUrl?: string | null;
  lastLogin?: number | null;
  phone?: string;
  bio?: string;
  specializations?: string[];
  experience?: number;
  hourlyRate?: number;
  avatar?: string;
  image?: string; 
}

export interface CreateUserData {
  id?: string;
  email: string;
  password: string;
  role: UserRole;
  name: string;
  isActive: boolean;
  photoUrl?: string;
  phone?: string;
  bio?: string;
  specializations?: string[];
  experience?: number;
  hourlyRate?: number;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  role?: UserRole;
  isActive?: boolean;
  photoUrl?: string;
  password?: string;
  phone?: string;
  bio?: string;
  specializations?: string[];
  experience?: number;
  hourlyRate?: number;
}

// Add the missing UserStats interface
export interface UserStats {
  total: number;
  active: number;
  inactive: number;
  byRole: Record<UserRole, number>;
  newThisMonth: number;
  newThisWeek: number;
  lastLoginStats: {
    today: number;
    thisWeek: number;
    thisMonth: number;
    never: number;
  };
  trainerStats?: {
    totalTrainers: number;
    activeTrainers: number;
    averageRating: number;
    totalSessions: number;
  };
}

export interface OperationResult {
  success: boolean;
  error?: string;
}

// Additional interfaces for better type safety
export interface UserFilters {
  role?: UserRole;
  isActive?: boolean;
  search?: string;
  sortBy?: 'name' | 'email' | 'createdAt' | 'lastLogin';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface UsersPaginationInfo {
  total: number;
  page: number;
  limit: number;
  pages: number;
  hasMore: boolean;
}

export interface UsersApiResponse {
  success: boolean;
  users: User[];
  stats?: UserStats;
  pagination?: UsersPaginationInfo;
  error?: string;
}

// Bulk action types
export type BulkAction = 'activate' | 'deactivate' | 'delete' | 'updateRole';

export interface BulkActionRequest {
  action: BulkAction;
  userIds: string[];
  updates?: {
    role?: UserRole;
    isActive?: boolean;
  };
}

export interface BulkActionResult {
  success: boolean;
  processed: number;
  failed: number;
  errors?: string[];
}
