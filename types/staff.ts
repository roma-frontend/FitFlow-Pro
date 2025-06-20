export interface StaffUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'super-admin' | 'manager' | 'trainer';
  isActive: boolean;
  lastLoginAt?: number;
}

export interface StaffLoginFormData {
  email: string;
  password: string;
  role: string;
}

export interface StaffAuthState {
  isLoading: boolean;
  showForgotPassword: boolean;
  resetEmail: string;
  resetSent: boolean;
  user?: StaffUser;
}

// ✅ Обновляем типы действий с Promise<void>
export interface StaffAuthActions {
  setShowForgotPassword: (show: boolean) => void;
  setResetEmail: (email: string) => void;
  setResetSent: (sent: boolean) => void;
  handleStaffLogin: (formData: StaffLoginFormData) => Promise<void>; // ✅ Promise<void>
  handlePasswordReset: (e: React.FormEvent) => Promise<void>; // ✅ Promise<void>
  handleSuperAdminQuickLogin: () => Promise<void>; // ✅ Promise<void>
}
