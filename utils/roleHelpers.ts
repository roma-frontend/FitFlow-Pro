import type { User } from '@/lib/simple-auth';
import type { AuthStatus } from '@/hooks/useAuth';

export const ROLE_LABELS = {
  member: "Участник",
  client: "Участник", // Добавляем для совместимости
  admin: "Администратор",
  "super-admin": "Супер Администратор",
  manager: "Менеджер",
  trainer: "Тренер",
  staff: "Персонал",
} as const;

export const getRoleLabel = (role: string): string => {
  return ROLE_LABELS[role as keyof typeof ROLE_LABELS] || role;
};

export const isAdmin = (authStatus: AuthStatus | null): boolean => {
  return Boolean(
    authStatus?.authenticated && 
    authStatus?.user?.role &&
    ["admin", "super-admin"].includes(authStatus.user.role)
  );
};

export const isSuperAdmin = (authStatus: AuthStatus | null): boolean => {
  return Boolean(
    authStatus?.authenticated && 
    authStatus?.user?.role === "super-admin"
  );
};

export const hasPermission = (
  authStatus: AuthStatus | null, 
  requiredRoles: string[]
): boolean => {
  return Boolean(
    authStatus?.authenticated && 
    authStatus?.user?.role &&
    requiredRoles.includes(authStatus.user.role)
  );
};

// Дополнительные хелперы для работы с User объектом
export const isUserAdmin = (user: User | null): boolean => {
  return Boolean(
    user?.role && 
    ["admin", "super-admin"].includes(user.role)
  );
};

export const isUserMember = (user: User | null): boolean => {
  return Boolean(
    user?.role && 
    ["member", "client"].includes(user.role)
  );
};

export const getUserDashboardUrl = (user: User | null): string => {
  if (!user?.role) return "/";
  
  const dashboardUrls: Record<string, string> = {
    'admin': '/admin',
    'super-admin': '/admin',
    'manager': '/manager-dashboard',
    'trainer': '/trainer-dashboard',
    'client': '/member-dashboard',
    'member': '/member-dashboard',
    'staff': '/staff'
  };
  
  return dashboardUrls[user.role] || '/dashboard';
};

// Дополнительные утилиты для проверки ролей
export const checkUserRole = (user: User | null, expectedRole: string): boolean => {
  return Boolean(user?.role === expectedRole);
};

export const checkUserRoles = (user: User | null, expectedRoles: string[]): boolean => {
  return Boolean(user?.role && expectedRoles.includes(user.role));
};

// Утилита для безопасного получения роли
export const getUserRole = (user: User | null): string | null => {
  return user?.role || null;
};

// Утилита для проверки, является ли пользователь персоналом
export const isUserStaff = (user: User | null): boolean => {
  return Boolean(
    user?.role && 
    ['admin', 'super-admin', 'manager', 'trainer', 'staff'].includes(user.role)
  );
};

// Утилита для проверки AuthStatus на персонал
export const isStaff = (authStatus: AuthStatus | null): boolean => {
  return Boolean(
    authStatus?.authenticated && 
    authStatus?.user?.role &&
    ['admin', 'super-admin', 'manager', 'trainer', 'staff'].includes(authStatus.user.role)
  );
};

// Утилита для проверки, может ли пользователь управлять другими пользователями
export const canManageUsers = (authStatus: AuthStatus | null): boolean => {
  return Boolean(
    authStatus?.authenticated && 
    authStatus?.user?.role &&
    ['admin', 'super-admin', 'manager'].includes(authStatus.user.role)
  );
};

// Утилита для проверки, может ли пользователь просматривать отчеты
export const canViewReports = (authStatus: AuthStatus | null): boolean => {
  return Boolean(
    authStatus?.authenticated && 
    authStatus?.user?.role &&
    ['admin', 'super-admin', 'manager', 'trainer'].includes(authStatus.user.role)
  );
};
