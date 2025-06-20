// lib/permissions.ts
export type UserRole = 'super-admin' | 'admin' | 'manager' | 'trainer' | 'member' | 'client';

export type Resource =
  | 'users'
  | 'trainers'
  | 'clients'
  | 'schedule'
  | 'analytics'
  | 'notifications'
  | 'settings'
  | 'billing'
  | 'reports'
  | 'system'
  | 'shop';

export type Action =
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'export'
  | 'import'
  | 'manage'
  | 'maintenance'
  | 'write'
  | 'restore'
  | 'backup';

// Матрица разрешений для каждой роли
export const permissions: Record<UserRole, Record<Resource, Action[]>> = {
  'super-admin': {
    users: ['create', 'read', 'update', 'delete', 'manage', 'export', 'import', 'write'],
    trainers: ['create', 'read', 'update', 'delete', 'manage', 'export', 'import', 'write'],
    clients: ['create', 'read', 'update', 'delete', 'manage', 'export', 'import', 'write'],
    schedule: ['create', 'read', 'update', 'delete', 'manage', 'export', 'import', 'write'],
    analytics: ['read', 'export', 'import', 'manage', 'write'],
    notifications: ['create', 'read', 'update', 'delete', 'manage', 'export', 'import', 'write'],
    settings: ['create', 'read', 'update', 'delete', 'manage', 'export', 'import', 'write'],
    billing: ['create', 'read', 'update', 'delete', 'export', 'import', 'manage', 'write'],
    reports: ['create', 'read', 'export', 'import', 'manage', 'write'],
    system: ['maintenance', 'manage', 'export', 'import', 'write', 'backup'],
    shop: ['create', 'read', 'update', 'delete', 'manage', 'export', 'import', 'write']
  },
  admin: {
    users: ['create', 'read', 'update', 'delete', 'export', 'import', 'write'],
    trainers: ['create', 'read', 'update', 'delete', 'export', 'import', 'write'],
    clients: ['create', 'read', 'update', 'delete', 'export', 'import', 'write'],
    schedule: ['create', 'read', 'update', 'delete', 'export', 'import', 'write'],
    analytics: ['read', 'export', 'import', 'write'],
    notifications: ['create', 'read', 'update', 'delete', 'export', 'import', 'write'],
    settings: ['read', 'update', 'export', 'import', 'write'],
    billing: ['read', 'update', 'export', 'import', 'write'],
    reports: ['create', 'read', 'export', 'import', 'write'],
    system: ['maintenance', 'export', 'import', 'write', 'backup'],
    shop: ['create', 'read', 'update', 'delete', 'export', 'import', 'write']
  },
  manager: {
    users: ['read', 'export'],
    trainers: ['read', 'update', 'export', 'write'],
    clients: ['create', 'read', 'update', 'export', 'import', 'write'],
    schedule: ['create', 'read', 'update', 'delete', 'export', 'import', 'write'],
    analytics: ['read', 'export', 'write'],
    notifications: ['create', 'read', 'export', 'write'],
    settings: ['read', 'export'],
    billing: ['read', 'export'],
    reports: ['read', 'export', 'write'],
    system: ['export'],
    shop: ['read', 'update', 'export', 'write']
  },
  trainer: {
    users: [],
    trainers: ['read', 'export'],
    clients: ['read', 'update', 'export', 'write'],
    schedule: ['read', 'update', 'export', 'write'],
    analytics: ['read'],
    notifications: ['read'],
    settings: ['read'],
    billing: [],
    reports: ['read', 'export'],
    system: [],
    shop: ['read', 'export']
  },
  member: {
    users: [],
    trainers: ['read'],
    clients: ['read', 'export'],
    schedule: ['read', 'export'],
    analytics: [],
    notifications: ['read'],
    settings: ['read', 'export'],
    billing: ['read', 'export'],
    reports: [],
    system: [],
    shop: ['read', 'export']
  },
  client: {
    users: [],
    trainers: ['read'],
    clients: ['read', 'export'],
    schedule: ['read', 'export'],
    analytics: [],
    notifications: ['read'],
    settings: ['read', 'export'],
    billing: ['read', 'export'],
    reports: [],
    system: [],
    shop: ['read', 'export']
  }
};

// Основная функция проверки разрешений
export const hasPermission = (
  userRole: UserRole | undefined,
  resource: Resource,
  action: Action
): boolean => {
  if (!userRole) return false;

  const rolePermissions = permissions[userRole];
  if (!rolePermissions) return false;

  const resourcePermissions = rolePermissions[resource];
  if (!resourcePermissions) return false;

  return resourcePermissions.includes(action);
};

// Функция проверки доступа к объекту (для проверки владения)
export const canAccessObject = (
  userRole: UserRole,
  userId: string,
  ownerId: string | undefined,
  resource: Resource,
  action: Action
): boolean => {
  // Супер-админы и админы имеют доступ ко всему
  if (userRole === 'super-admin' || userRole === 'admin') {
    return hasPermission(userRole, resource, action);
  }

  // Менеджеры имеют доступ к большинству ресурсов
  if (userRole === 'manager') {
    return hasPermission(userRole, resource, action);
  }

  // Тренеры могут работать только со своими объектами
  if (userRole === 'trainer') {
    if (!ownerId || userId !== ownerId) {
      return false;
    }
    return hasPermission(userRole, resource, action);
  }

  // Клиенты могут работать только со своими объектами
  if (userRole === 'client' || userRole === 'member') {
    if (!ownerId || userId !== ownerId) {
      return false;
    }
    return hasPermission(userRole, resource, action);
  }

  return false;
};

export const isSuperAdmin = (userRole: UserRole | undefined): boolean => {
  return userRole === 'super-admin';
};

export const isAdmin = (userRole: UserRole | undefined): boolean => {
  return userRole === 'admin' || userRole === 'super-admin';
};

export const isManager = (userRole: UserRole | undefined): boolean => {
  return userRole === 'manager' || isAdmin(userRole);
};

export const isTrainer = (userRole: UserRole | undefined): boolean => {
  return userRole === 'trainer';
};

export const isClient = (userRole: UserRole | undefined): boolean => {
  return userRole === 'client' || userRole === 'member';
};

export const isStaff = (userRole: UserRole | undefined): boolean => {
  return userRole === 'super-admin' || userRole === 'admin' || userRole === 'manager' || userRole === 'trainer';
};

// Добавьте эту функцию здесь:
export const isValidRole = (role: string | undefined): role is UserRole => {
  if (!role) return false;
  const validRoles: UserRole[] = ['super-admin', 'admin', 'manager', 'trainer', 'member', 'client'];
  return validRoles.includes(role as UserRole);
};

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  'client': 1,
  'member': 2,
  'trainer': 3,
  'manager': 4,
  'admin': 5,
  'super-admin': 6
};

// ✅ УПРАВЛЕНИЕ ПОЛЬЗОВАТЕЛЯМИ
export const canManageUsers = (userRole: UserRole | undefined): boolean => {
  return hasPermission(userRole, 'users', 'manage');
};

// ✅ ФИЛЬТРАЦИЯ ДАННЫХ ПО ПРАВАМ
export const filterDataByPermissions = <T extends Record<string, any>>(
  data: T[],
  userRole: UserRole,
  resource: Resource,
  filterFn?: (item: T, userRole: UserRole) => boolean
): T[] => {
  // Проверяем базовые права на чтение
  if (!hasPermission(userRole, resource, 'read')) {
    return [];
  }

  // Применяем дополнительную фильтрацию если предоставлена
  if (filterFn) {
    return data.filter(item => filterFn(item, userRole));
  }

  // Базовая фильтрация по уровню доступа
  if (userRole === 'trainer') {
    // Тренеры видят только свои данные
    return data.filter(item =>
      item.trainerId === userRole ||
      item.id === userRole ||
      item.createdBy === userRole
    );
  }

  // Менеджеры и выше видят все
  if (isManager(userRole)) {
    return data;
  }

  return data;
};

export const PERMISSIONS = permissions;

export const canCreateUsers = (userRole: UserRole | undefined): boolean => {
  return hasPermission(userRole, 'users', 'create');
};

export const canUpdateUsers = (userRole: UserRole | undefined): boolean => {
  return hasPermission(userRole, 'users', 'update');
};

export const canDeleteUsers = (userRole: UserRole | undefined): boolean => {
  return hasPermission(userRole, 'users', 'delete');
};

export const canViewUsers = (userRole: UserRole | undefined): boolean => {
  return hasPermission(userRole, 'users', 'read');
};

export const canExportUsers = (userRole: UserRole | undefined): boolean => {
  return hasPermission(userRole, 'users', 'export');
};

// ✅ УПРАВЛЕНИЕ ТРЕНЕРАМИ
export const canManageTrainers = (userRole: UserRole | undefined): boolean => {
  return hasPermission(userRole, 'trainers', 'manage');
};

export const canCreateTrainers = (userRole: UserRole | undefined): boolean => {
  return hasPermission(userRole, 'trainers', 'create');
};

export const canUpdateTrainers = (userRole: UserRole | undefined): boolean => {
  return hasPermission(userRole, 'trainers', 'update');
};

export const canDeleteTrainers = (userRole: UserRole | undefined): boolean => {
  return hasPermission(userRole, 'trainers', 'delete');
};

export const canViewTrainers = (userRole: UserRole | undefined): boolean => {
  return hasPermission(userRole, 'trainers', 'read');
};

export const canExportTrainers = (userRole: UserRole | undefined): boolean => {
  return hasPermission(userRole, 'trainers', 'export');
};

// ✅ УПРАВЛЕНИЕ КЛИЕНТАМИ
export const canManageClients = (userRole: UserRole | undefined): boolean => {
  return hasPermission(userRole, 'clients', 'manage');
};

export const canCreateClients = (userRole: UserRole | undefined): boolean => {
  return hasPermission(userRole, 'clients', 'create');
};

export const canUpdateClients = (userRole: UserRole | undefined): boolean => {
  return hasPermission(userRole, 'clients', 'update');
};

export const canDeleteClients = (userRole: UserRole | undefined): boolean => {
  return hasPermission(userRole, 'clients', 'delete');
};

export const canViewClients = (userRole: UserRole | undefined): boolean => {
  return hasPermission(userRole, 'clients', 'read');
};

export const canExportClients = (userRole: UserRole | undefined): boolean => {
  return hasPermission(userRole, 'clients', 'export');
};

// ✅ УПРАВЛЕНИЕ РАСПИСАНИЕМ
export const canManageSchedule = (userRole: UserRole | undefined): boolean => {
  return hasPermission(userRole, 'schedule', 'manage');
};

export const canCreateSchedule = (userRole: UserRole | undefined): boolean => {
  return hasPermission(userRole, 'schedule', 'create');
};

export const canUpdateSchedule = (userRole: UserRole | undefined): boolean => {
  return hasPermission(userRole, 'schedule', 'update');
};

export const canDeleteSchedule = (userRole: UserRole | undefined): boolean => {
  return hasPermission(userRole, 'schedule', 'delete');
};

export const canViewSchedule = (userRole: UserRole | undefined): boolean => {
  return hasPermission(userRole, 'schedule', 'read');
};

export const canExportSchedule = (userRole: UserRole | undefined): boolean => {
  return hasPermission(userRole, 'schedule', 'export');
};

export const canWriteSchedule = (userRole: UserRole | undefined): boolean => {
  return hasPermission(userRole, 'schedule', 'write');
};

// ✅ АНАЛИТИКА
export const canViewAnalytics = (userRole: UserRole | undefined): boolean => {
  return hasPermission(userRole, 'analytics', 'read');
};

export const canExportAnalytics = (userRole: UserRole | undefined): boolean => {
  return hasPermission(userRole, 'analytics', 'export');
};

export const canManageAnalytics = (userRole: UserRole | undefined): boolean => {
  return hasPermission(userRole, 'analytics', 'manage');
};

export const canWriteAnalytics = (userRole: UserRole | undefined): boolean => {
  return hasPermission(userRole, 'analytics', 'write');
};

// ✅ УВЕДОМЛЕНИЯ
export const canCreateNotifications = (userRole: UserRole | undefined): boolean => {
  return hasPermission(userRole, 'notifications', 'create');
};

export const canUpdateNotifications = (userRole: UserRole | undefined): boolean => {
  return hasPermission(userRole, 'notifications', 'update');
};

export const canDeleteNotifications = (userRole: UserRole | undefined): boolean => {
  return hasPermission(userRole, 'notifications', 'delete');
};

export const canViewNotifications = (userRole: UserRole | undefined): boolean => {
  return hasPermission(userRole, 'notifications', 'read');
};

export const canManageNotifications = (userRole: UserRole | undefined): boolean => {
  return hasPermission(userRole, 'notifications', 'manage');
};

export const canWriteNotifications = (userRole: UserRole | undefined): boolean => {
  return hasPermission(userRole, 'notifications', 'write');
};

// ✅ НАСТРОЙКИ
export const canUpdateSettings = (userRole: UserRole | undefined): boolean => {
  return hasPermission(userRole, 'settings', 'update');
};

export const canViewSettings = (userRole: UserRole | undefined): boolean => {
  return hasPermission(userRole, 'settings', 'read');
};

export const canManageSettings = (userRole: UserRole | undefined): boolean => {
  return hasPermission(userRole, 'settings', 'manage');
};

export const canExportSettings = (userRole: UserRole | undefined): boolean => {
  return hasPermission(userRole, 'settings', 'export');
};

export const canWriteSettings = (userRole: UserRole | undefined): boolean => {
  return hasPermission(userRole, 'settings', 'write');
};

// ✅ БИЛЛИНГ
export const canViewBilling = (userRole: UserRole | undefined): boolean => {
  return hasPermission(userRole, 'billing', 'read');
};

export const canUpdateBilling = (userRole: UserRole | undefined): boolean => {
  return hasPermission(userRole, 'billing', 'update');
};

export const canManageBilling = (userRole: UserRole | undefined): boolean => {
  return hasPermission(userRole, 'billing', 'manage');
};

export const canExportBilling = (userRole: UserRole | undefined): boolean => {
  return hasPermission(userRole, 'billing', 'export');
};

export const canWriteBilling = (userRole: UserRole | undefined): boolean => {
  return hasPermission(userRole, 'billing', 'write');
};

// ✅ ОТЧЕТЫ
export const canCreateReports = (userRole: UserRole | undefined): boolean => {
  return hasPermission(userRole, 'reports', 'create');
};

export const canViewReports = (userRole: UserRole | undefined): boolean => {
  return hasPermission(userRole, 'reports', 'read');
};

export const canExportReports = (userRole: UserRole | undefined): boolean => {
  return hasPermission(userRole, 'reports', 'export');
};

export const canManageReports = (userRole: UserRole | undefined): boolean => {
  return hasPermission(userRole, 'reports', 'manage');
};

export const canWriteReports = (userRole: UserRole | undefined): boolean => {
  return hasPermission(userRole, 'reports', 'write');
};

// ✅ СИСТЕМА
export const canPerformMaintenance = (userRole: UserRole | undefined): boolean => {
  return hasPermission(userRole, 'system', 'maintenance');
};

export const canManageSystem = (userRole: UserRole | undefined): boolean => {
  return hasPermission(userRole, 'system', 'manage');
};

export const canExportSystem = (userRole: UserRole | undefined): boolean => {
  return hasPermission(userRole, 'system', 'export');
};

export const canWriteSystem = (userRole: UserRole | undefined): boolean => {
  return hasPermission(userRole, 'system', 'write');
};

// ✅ ДОПОЛНИТЕЛЬНЫЕ ФУНКЦИИ ДЛЯ ПРОВЕРКИ ПРАВ НА ЗАПИСЬ
export const canWrite = (userRole: UserRole | undefined, resource: Resource): boolean => {
  return hasPermission(userRole, resource, 'write');
};

// ✅ ПРОВЕРКА ДОСТУПА К КОНКРЕТНЫМ ФУНКЦИЯМ
export const canAccessAdminPanel = (userRole: UserRole | undefined): boolean => {
  return isAdmin(userRole);
};

export const canAccessManagerPanel = (userRole: UserRole | undefined): boolean => {
  return isManager(userRole);
};

export const canAccessTrainerPanel = (userRole: UserRole | undefined): boolean => {
  return isStaff(userRole);
};

export const canAccessClientPanel = (userRole: UserRole | undefined): boolean => {
  return isClient(userRole);
};

// ✅ ПРОВЕРКА ДОСТУПА К ФИНАНСОВЫМ ДАННЫМ
export const canViewFinancials = (userRole: UserRole | undefined): boolean => {
  return isManager(userRole);
};

export const canManageFinancials = (userRole: UserRole | undefined): boolean => {
  return isAdmin(userRole);
};

// ✅ ПРОВЕРКА ДОСТУПА К ПЕРСОНАЛЬНЫМ ДАННЫМ
export const canViewPersonalData = (userRole: UserRole | undefined): boolean => {
  return isStaff(userRole);
};

export const canEditPersonalData = (userRole: UserRole | undefined): boolean => {
  return isManager(userRole);
};

// ✅ ПРОВЕРКА ДОСТУПА К СИСТЕМНЫМ ФУНКЦИЯМ
export const canAccessSystemLogs = (userRole: UserRole | undefined): boolean => {
  return isAdmin(userRole);
};

export const canModifySystemSettings = (userRole: UserRole | undefined): boolean => {
  return isSuperAdmin(userRole);
};

export const canPerformBackup = (userRole: UserRole | undefined): boolean => {
  return isAdmin(userRole);
};

export const canRestoreData = (userRole: UserRole | undefined): boolean => {
  return isSuperAdmin(userRole);
};

// ✅ ПРОВЕРКА ДОСТУПА К РАСШИРЕННОЙ АНАЛИТИКЕ
export const canViewAdvancedAnalytics = (userRole: UserRole | undefined): boolean => {
  return isManager(userRole);
};

export const canConfigureAnalytics = (userRole: UserRole | undefined): boolean => {
  return isAdmin(userRole);
};

// ✅ ПРОВЕРКА ДОСТУПА К МАССОВЫМ ОПЕРАЦИЯМ
export const canPerformBulkOperations = (userRole: UserRole | undefined): boolean => {
  return isManager(userRole);
};

export const canBulkDeleteUsers = (userRole: UserRole | undefined): boolean => {
  return isAdmin(userRole);
};

export const canBulkUpdateSchedule = (userRole: UserRole | undefined): boolean => {
  return isManager(userRole);
};

export const canBulkExportData = (userRole: UserRole | undefined): boolean => {
  return isStaff(userRole);
};

// ✅ ПРОВЕРКА ДОСТУПА К ИНТЕГРАЦИЯМ
export const canManageIntegrations = (userRole: UserRole | undefined): boolean => {
  return isAdmin(userRole);
};

export const canConfigureAPI = (userRole: UserRole | undefined): boolean => {
  return isSuperAdmin(userRole);
};

export const canViewAPILogs = (userRole: UserRole | undefined): boolean => {
  return isAdmin(userRole);
};

// ✅ ПРОВЕРКА ДОСТУПА К УВЕДОМЛЕНИЯМ И КОММУНИКАЦИЯМ
export const canSendBulkNotifications = (userRole: UserRole | undefined): boolean => {
  return isManager(userRole);
};

export const canConfigureNotificationTemplates = (userRole: UserRole | undefined): boolean => {
  return isAdmin(userRole);
};

export const canAccessCommunicationLogs = (userRole: UserRole | undefined): boolean => {
  return isManager(userRole);
};

// ✅ ПРОВЕРКА ДОСТУПА К БЕЗОПАСНОСТИ
export const canViewSecurityLogs = (userRole: UserRole | undefined): boolean => {
  return isAdmin(userRole);
};

export const canManageUserSessions = (userRole: UserRole | undefined): boolean => {
  return isAdmin(userRole);
};

export const canConfigureSecurity = (userRole: UserRole | undefined): boolean => {
  return isSuperAdmin(userRole);
};

export const canViewAuditLogs = (userRole: UserRole | undefined): boolean => {
  return isAdmin(userRole);
};

// ✅ ПРОВЕРКА ДОСТУПА К СПЕЦИАЛЬНЫМ ФУНКЦИЯМ
export const canImpersonateUsers = (userRole: UserRole | undefined): boolean => {
  return isSuperAdmin(userRole);
};

export const canBypassRateLimit = (userRole: UserRole | undefined): boolean => {
  return isAdmin(userRole);
};

export const canAccessDebugMode = (userRole: UserRole | undefined): boolean => {
  return isSuperAdmin(userRole);
};

export const canModifyPermissions = (userRole: UserRole | undefined): boolean => {
  return isSuperAdmin(userRole);
};

// ✅ КОНТЕКСТНЫЕ ПРОВЕРКИ ДОСТУПА
export const canAccessTrainerData = (
  userRole: UserRole | undefined,
  userId: string,
  trainerId: string
): boolean => {
  if (isManager(userRole)) return true;
  if (isTrainer(userRole) && userId === trainerId) return true;
  return false;
};

export const canAccessClientData = (
  userRole: UserRole | undefined,
  userId: string,
  clientId: string,
  trainerId?: string
): boolean => {
  if (isManager(userRole)) return true;
  if (isClient(userRole) && userId === clientId) return true;
  if (isTrainer(userRole) && userId === trainerId) return true;
  return false;
};

export const canModifySession = (
  userRole: UserRole | undefined,
  userId: string,
  sessionTrainerId: string,
  sessionClientId: string
): boolean => {
  if (isManager(userRole)) return true;
  if (isTrainer(userRole) && userId === sessionTrainerId) return true;
  if (isClient(userRole) && userId === sessionClientId) return true;
  return false;
};

export const canViewTrainerSchedule = (
  userRole: UserRole | undefined,
  userId: string,
  trainerId: string
): boolean => {
  if (isStaff(userRole)) return true;
  if (isClient(userRole)) return true; // Клиенты могут видеть расписание тренеров
  return false;
};

export const canBookSession = (
  userRole: UserRole | undefined,
  userId: string,
  clientId: string
): boolean => {
  if (isManager(userRole)) return true;
  if (isClient(userRole) && userId === clientId) return true;
  return false;
};

// ✅ ПРОВЕРКА ДОСТУПА К ОТЧЕТАМ ПО ТИПАМ
export const canViewFinancialReports = (userRole: UserRole | undefined): boolean => {
  return isManager(userRole);
};

export const canViewPerformanceReports = (userRole: UserRole | undefined): boolean => {
  return isStaff(userRole);
};

export const canViewClientReports = (userRole: UserRole | undefined): boolean => {
  return isStaff(userRole);
};

export const canViewSystemReports = (userRole: UserRole | undefined): boolean => {
  return isAdmin(userRole);
};

// ✅ ПРОВЕРКА ДОСТУПА К ЭКСПОРТУ ПО ТИПАМ
export const canExportFinancialData = (userRole: UserRole | undefined): boolean => {
  return isManager(userRole);
};

export const canExportPersonalData = (userRole: UserRole | undefined): boolean => {
  return isAdmin(userRole);
};

export const canExportSystemData = (userRole: UserRole | undefined): boolean => {
  return isSuperAdmin(userRole);
};

// ✅ ПРОВЕРКА ВРЕМЕННЫХ ОГРАНИЧЕНИЙ
export const canAccessOutsideBusinessHours = (userRole: UserRole | undefined): boolean => {
  return isStaff(userRole);
};

export const canOverrideScheduleRestrictions = (userRole: UserRole | undefined): boolean => {
  return isManager(userRole);
};

// ✅ ПРОВЕРКА ДОСТУПА К МОБИЛЬНЫМ ФУНКЦИЯМ
export const canUseMobileApp = (userRole: UserRole | undefined): boolean => {
  return userRole !== undefined; // Все авторизованные пользователи
};

export const canAccessMobileAdminFeatures = (userRole: UserRole | undefined): boolean => {
  return isStaff(userRole);
};

// ✅ ПРОВЕРКА ДОСТУПА К ЭКСПЕРИМЕНТАЛЬНЫМ ФУНКЦИЯМ
export const canAccessBetaFeatures = (userRole: UserRole | undefined): boolean => {
  return isAdmin(userRole);
};

export const canAccessDeveloperTools = (userRole: UserRole | undefined): boolean => {
  return isSuperAdmin(userRole);
};

// ✅ УТИЛИТЫ ДЛЯ ПРОВЕРКИ МНОЖЕСТВЕННЫХ РАЗРЕШЕНИЙ
export const hasAnyPermission = (
  userRole: UserRole | undefined,
  checks: Array<{ resource: Resource; action: Action }>
): boolean => {
  return checks.some(check => hasPermission(userRole, check.resource, check.action));
};

export const hasAllPermissions = (
  userRole: UserRole | undefined,
  checks: Array<{ resource: Resource; action: Action }>
): boolean => {
  return checks.every(check => hasPermission(userRole, check.resource, check.action));
};

// ✅ ПОЛУЧЕНИЕ ВСЕХ РАЗРЕШЕНИЙ ДЛЯ РОЛИ
export const getRolePermissions = (userRole: UserRole): Record<Resource, Action[]> => {
  return permissions[userRole] || {};
};

// ✅ ПОЛУЧЕНИЕ ВСЕХ ДОСТУПНЫХ РЕСУРСОВ ДЛЯ РОЛИ
export const getAccessibleResources = (userRole: UserRole | undefined): Resource[] => {
  if (!userRole) return [];

  const rolePermissions = permissions[userRole];
  return Object.keys(rolePermissions).filter(
    resource => rolePermissions[resource as Resource].length > 0
  ) as Resource[];
};

// ✅ ПОЛУЧЕНИЕ ВСЕХ ДОСТУПНЫХ ДЕЙСТВИЙ ДЛЯ РЕСУРСА
export const getResourceActions = (userRole: UserRole | undefined, resource: Resource): Action[] => {
  if (!userRole) return [];

  const rolePermissions = permissions[userRole];
  return rolePermissions[resource] || [];
};

// ✅ УПРАВЛЕНИЕ МАГАЗИНОМ - ОБНОВЛЕННЫЕ ФУНКЦИИ
export const canAccessShop = (userRole: UserRole | undefined): boolean => {
  // Все авторизованные пользователи могут заходить в магазин
  return userRole !== undefined;
};

export const canManageShop = (userRole: UserRole | undefined): boolean => {
  return hasPermission(userRole, 'shop', 'manage');
};

export const canCreateShopItems = (userRole: UserRole | undefined): boolean => {
  return hasPermission(userRole, 'shop', 'create');
};

export const canUpdateShopItems = (userRole: UserRole | undefined): boolean => {
  return hasPermission(userRole, 'shop', 'update');
};

export const canDeleteShopItems = (userRole: UserRole | undefined): boolean => {
  return hasPermission(userRole, 'shop', 'delete');
};

export const canViewShop = (userRole: UserRole | undefined): boolean => {
  // Все авторизованные пользователи могут просматривать магазин
  return userRole !== undefined;
};

export const canPurchaseFromShop = (userRole: UserRole | undefined): boolean => {
  // Все авторизованные пользователи могут покупать в магазине
  return userRole !== undefined;
};

// ✅ ПРОВЕРКА ДОСТУПА К КОНКРЕТНОМУ МАРШРУТУ - ОБНОВЛЕННАЯ
export const canAccessRoute = (userRole: UserRole | undefined, route: string): boolean => {
  const routePermissions: Record<string, () => boolean> = {
    '/admin': () => canAccessAdminPanel(userRole),
    '/admin/users': () => canViewUsers(userRole),
    '/admin/trainers': () => canViewTrainers(userRole),
    '/admin/clients': () => canViewClients(userRole),
    '/admin/analytics': () => canViewAnalytics(userRole),
    '/admin/settings': () => canViewSettings(userRole),
    '/admin/billing': () => canViewBilling(userRole),
    '/admin/reports': () => canViewReports(userRole),
    '/admin/system': () => canPerformMaintenance(userRole),
    '/manager': () => canAccessManagerPanel(userRole),
    '/trainer': () => canAccessTrainerPanel(userRole),
    '/client': () => canAccessClientPanel(userRole),
    '/schedule': () => canViewSchedule(userRole),
    '/analytics': () => canViewAnalytics(userRole),
    '/profile': () => userRole !== undefined,
    '/notifications': () => canViewNotifications(userRole),
    '/shop': () => userRole !== undefined, // Все авторизованные пользователи
    '/shop/manage': () => canManageShop(userRole),
    '/shop/admin': () => canManageShop(userRole),
  };

  const checkFunction = routePermissions[route];
  return checkFunction ? checkFunction() : false;
};

// ✅ ПОЛУЧЕНИЕ УРОВНЯ ДОСТУПА ДЛЯ РОЛИ
export const getAccessLevel = (userRole: UserRole | undefined): number => {
  const levels: Record<UserRole, number> = {
    'super-admin': 100,
    'admin': 90,
    'manager': 70,
    'trainer': 50,
    'member': 30,
    'client': 20
  };

  return userRole ? levels[userRole] : 0;
};

// ✅ СРАВНЕНИЕ УРОВНЕЙ ДОСТУПА
export const hasHigherAccessLevel = (
  userRole: UserRole | undefined,
  targetRole: UserRole | undefined
): boolean => {
  return getAccessLevel(userRole) > getAccessLevel(targetRole);
};

export const hasEqualOrHigherAccessLevel = (
  userRole: UserRole | undefined,
  targetRole: UserRole | undefined
): boolean => {
  return getAccessLevel(userRole) >= getAccessLevel(targetRole);
};

// ✅ ПРОВЕРКА ДОСТУПА К ДЕЙСТВИЯМ НАД ДРУГИМИ ПОЛЬЗОВАТЕЛЯМИ
export const canManageUser = (
  userRole: UserRole | undefined,
  targetUserRole: UserRole | undefined
): boolean => {
  if (!userRole || !targetUserRole) return false;

  // Супер-админы могут управлять всеми
  if (isSuperAdmin(userRole)) return true;

  // Админы могут управлять всеми кроме супер-админов
  if (isAdmin(userRole) && !isSuperAdmin(targetUserRole)) return true;

  // Менеджеры могут управлять тренерами и клиентами
  if (isManager(userRole) && (isTrainer(targetUserRole) || isClient(targetUserRole))) return true;

  return false;
};

export const canManageRole = (
  userRole: UserRole | undefined,
  targetRole: UserRole
): boolean => {
  if (!userRole) return false;

  // Супер-админы могут назначать любые роли
  if (isSuperAdmin(userRole)) return true;

  // Админы могут назначать все роли кроме супер-админа
  if (isAdmin(userRole) && targetRole !== 'super-admin') return true;

  // Менеджеры могут назначать роли тренера, клиента и участника
  if (isManager(userRole) && (targetRole === 'trainer' || targetRole === 'client' || targetRole === 'member')) return true;

  return false;
};

// ✅ ПРОВЕРКА ВОЗМОЖНОСТИ СОЗДАНИЯ ПОЛЬЗОВАТЕЛЯ С ОПРЕДЕЛЕННОЙ РОЛЬЮ
export const canCreateUserWithRole = (
  userRole: UserRole | undefined,
  targetRole: UserRole
): boolean => {
  if (!userRole) return false;

  // Супер-админы могут создавать всех
  if (isSuperAdmin(userRole)) return true;

  // Админы могут создавать всех кроме супер-админов
  if (isAdmin(userRole) && targetRole !== 'super-admin') return true;

  // Менеджеры могут создавать тренеров и клиентов
  if (isManager(userRole) && (targetRole === 'trainer' || targetRole === 'client' || targetRole === 'member')) return true;

  return false;
};

// ✅ ПРОВЕРКА ВОЗМОЖНОСТИ ИЗМЕНЕНИЯ РОЛИ ПОЛЬЗОВАТЕЛЯ
export const canChangeUserRole = (
  userRole: UserRole | undefined,
  currentTargetRole: UserRole,
  newTargetRole: UserRole
): boolean => {
  if (!userRole) return false;

  // Проверяем, может ли пользователь управлять текущей ролью
  if (!canManageUser(userRole, currentTargetRole)) return false;

  // Проверяем, может ли пользователь создать новую роль
  if (!canCreateUserWithRole(userRole, newTargetRole)) return false;

  return true;
};

// ✅ ПОЛУЧЕНИЕ СПИСКА РОЛЕЙ, КОТОРЫЕ МОЖЕТ СОЗДАВАТЬ ПОЛЬЗОВАТЕЛЬ
export const getCreatableRoles = (userRole: UserRole | undefined): UserRole[] => {
  if (!userRole) return [];

  const allRoles: UserRole[] = ['super-admin', 'admin', 'manager', 'trainer', 'member', 'client'];

  return allRoles.filter(role => canCreateUserWithRole(userRole, role));
};

// ✅ ПОЛУЧЕНИЕ СПИСКА РОЛЕЙ, КОТОРЫМИ МОЖЕТ УПРАВЛЯТЬ ПОЛЬЗОВАТЕЛЬ
export const getManageableRoles = (userRole: UserRole | undefined): UserRole[] => {
  if (!userRole) return [];

  const allRoles: UserRole[] = ['super-admin', 'admin', 'manager', 'trainer', 'member', 'client'];

  return allRoles.filter(role => canManageUser(userRole, role));
};

// ✅ ПРОВЕРКА ДОСТУПА К СПЕЦИАЛЬНЫМ ОПЕРАЦИЯМ
export const canResetUserPassword = (
  userRole: UserRole | undefined,
  targetUserRole: UserRole | undefined
): boolean => {
  return canManageUser(userRole, targetUserRole);
};

export const canDeactivateUser = (
  userRole: UserRole | undefined,
  targetUserRole: UserRole | undefined
): boolean => {
  return canManageUser(userRole, targetUserRole);
};

export const canDeleteUser = (
  userRole: UserRole | undefined,
  targetUserRole: UserRole | undefined
): boolean => {
  // Удаление пользователей - более серьезная операция
  if (!userRole || !targetUserRole) return false;

  // Супер-админы могут удалять всех кроме других супер-админов
  if (isSuperAdmin(userRole) && !isSuperAdmin(targetUserRole)) return true;

  // Админы могут удалять менеджеров, тренеров и клиентов
  if (isAdmin(userRole) && !isAdmin(targetUserRole)) return true;

  return false;
};

// ✅ ПРОВЕРКА ДОСТУПА К ФИНАНСОВЫМ ОПЕРАЦИЯМ
export const canProcessPayments = (userRole: UserRole | undefined): boolean => {
  return isManager(userRole);
};

export const canRefundPayments = (userRole: UserRole | undefined): boolean => {
  return isAdmin(userRole);
};

export const canViewPaymentDetails = (userRole: UserRole | undefined): boolean => {
  return isManager(userRole);
};

export const canModifyPricing = (userRole: UserRole | undefined): boolean => {
  return isAdmin(userRole);
};

// ✅ ПРОВЕРКА ДОСТУПА К РАСПИСАНИЮ И БРОНИРОВАНИЮ
export const canCancelAnySession = (userRole: UserRole | undefined): boolean => {
  return isManager(userRole);
};

export const canRescheduleAnySession = (userRole: UserRole | undefined): boolean => {
  return isManager(userRole);
};

export const canOverrideBookingLimits = (userRole: UserRole | undefined): boolean => {
  return isManager(userRole);
};

export const canCreateRecurringSchedule = (userRole: UserRole | undefined): boolean => {
  return isStaff(userRole);
};

// ✅ ПРОВЕРКА ДОСТУПА К КОММУНИКАЦИЯМ
export const canSendDirectMessages = (userRole: UserRole | undefined): boolean => {
  return isStaff(userRole);
};

export const canBroadcastMessages = (userRole: UserRole | undefined): boolean => {
  return isManager(userRole);
};

export const canModerateMessages = (userRole: UserRole | undefined): boolean => {
  return isManager(userRole);
};

export const canAccessMessageHistory = (userRole: UserRole | undefined): boolean => {
  return isManager(userRole);
};

// ✅ ПРОВЕРКА ДОСТУПА К КОНТЕНТУ И МЕДИА
export const canUploadFiles = (userRole: UserRole | undefined): boolean => {
  return isStaff(userRole);
};

export const canDeleteFiles = (userRole: UserRole | undefined): boolean => {
  return isManager(userRole);
};

export const canManageMediaLibrary = (userRole: UserRole | undefined): boolean => {
  return isAdmin(userRole);
};

export const canAccessPrivateFiles = (userRole: UserRole | undefined): boolean => {
  return isStaff(userRole);
};

// ✅ ПРОВЕРКА ДОСТУПА К ИНТЕГРАЦИЯМ И API
export const canCreateAPIKeys = (userRole: UserRole | undefined): boolean => {
  return isAdmin(userRole);
};

export const canRevokeAPIKeys = (userRole: UserRole | undefined): boolean => {
  return isAdmin(userRole);
};

export const canConfigureWebhooks = (userRole: UserRole | undefined): boolean => {
  return isAdmin(userRole);
};

export const canAccessAPIDocumentation = (userRole: UserRole | undefined): boolean => {
  return isStaff(userRole);
};

// ✅ ПРОВЕРКА ДОСТУПА К МОНИТОРИНГУ И ЛОГАМ
export const canViewSystemMetrics = (userRole: UserRole | undefined): boolean => {
  return isAdmin(userRole);
};

export const canViewErrorLogs = (userRole: UserRole | undefined): boolean => {
  return isAdmin(userRole);
};

export const canViewAccessLogs = (userRole: UserRole | undefined): boolean => {
  return isAdmin(userRole);
};

export const canConfigureMonitoring = (userRole: UserRole | undefined): boolean => {
  return isSuperAdmin(userRole);
};

// ✅ ПРОВЕРКА ДОСТУПА К РЕЗЕРВНОМУ КОПИРОВАНИЮ
export const canCreateBackup = (userRole: UserRole | undefined): boolean => {
  return isAdmin(userRole);
};

export const canRestoreBackup = (userRole: UserRole | undefined): boolean => {
  return isSuperAdmin(userRole);
};

export const canScheduleBackups = (userRole: UserRole | undefined): boolean => {
  return isAdmin(userRole);
};

export const canDownloadBackups = (userRole: UserRole | undefined): boolean => {
  return isSuperAdmin(userRole);
};

// ✅ ПРОВЕРКА ДОСТУПА К ТЕСТИРОВАНИЮ И РАЗРАБОТКЕ
export const canAccessTestEnvironment = (userRole: UserRole | undefined): boolean => {
  return isAdmin(userRole);
};

export const canRunDatabaseMigrations = (userRole: UserRole | undefined): boolean => {
  return isSuperAdmin(userRole);
};

export const canAccessDatabaseConsole = (userRole: UserRole | undefined): boolean => {
  return isSuperAdmin(userRole);
};

export const canExecuteSystemCommands = (userRole: UserRole | undefined): boolean => {
  return isSuperAdmin(userRole);
};

// ✅ КОНТЕКСТНЫЕ ПРОВЕРКИ ДЛЯ СПЕЦИАЛЬНЫХ СЛУЧАЕВ
export const canAccessDuringMaintenance = (userRole: UserRole | undefined): boolean => {
  return isAdmin(userRole);
};

export const canBypassMaintenanceMode = (userRole: UserRole | undefined): boolean => {
  return isSuperAdmin(userRole);
};

export const canAccessEmergencyMode = (userRole: UserRole | undefined): boolean => {
  return isAdmin(userRole);
};

// ✅ ПРОВЕРКА ДОСТУПА К СПЕЦИАЛЬНЫМ ОТЧЕТАМ
export const canViewComplianceReports = (userRole: UserRole | undefined): boolean => {
  return isAdmin(userRole);
};

export const canViewSecurityReports = (userRole: UserRole | undefined): boolean => {
  return isAdmin(userRole);
};

export const canViewUsageReports = (userRole: UserRole | undefined): boolean => {
  return isManager(userRole);
};

// ✅ ПРОВЕРКА ДОСТУПА К АВТОМАТИЗАЦИИ
export const canCreateAutomationRules = (userRole: UserRole | undefined): boolean => {
  return isManager(userRole);
};

export const canModifyAutomationRules = (userRole: UserRole | undefined): boolean => {
  return isAdmin(userRole);
};

export const canDeleteAutomationRules = (userRole: UserRole | undefined): boolean => {
  return isAdmin(userRole);
};

export const canViewAutomationLogs = (userRole: UserRole | undefined): boolean => {
  return isManager(userRole);
};

// ✅ СЛОЖНЫЕ ПРОВЕРКИ ДОСТУПА
export const canPerformBulkUserOperations = (
  userRole: UserRole | undefined,
  targetRoles: UserRole[]
): boolean => {
  if (!userRole) return false;

  // Проверяем, может ли пользователь управлять всеми целевыми ролями
  return targetRoles.every(targetRole => canManageUser(userRole, targetRole));
};

export const canAccessMultipleResources = (
  userRole: UserRole | undefined,
  resources: Resource[]
): boolean => {
  if (!userRole) return false;

  return resources.every(resource =>
    hasPermission(userRole, resource, 'read')
  );
};

// ✅ ВРЕМЕННЫЕ РАЗРЕШЕНИЯ
export const canAccessDuringBusinessHours = (
  userRole: UserRole | undefined,
  currentHour: number
): boolean => {
  // Бизнес-часы: 8:00 - 22:00
  const isBusinessHours = currentHour >= 8 && currentHour <= 22;

  if (isStaff(userRole)) return true; // Персонал может работать в любое время
  if (isBusinessHours) return true; // В бизнес-часы все могут работать

  return false;
};

export const canPerformMaintenanceOperations = (
  userRole: UserRole | undefined,
  isMaintenanceWindow: boolean
): boolean => {
  if (!isMaintenanceWindow && !isSuperAdmin(userRole)) return false;

  return canPerformMaintenance(userRole);
};

// ✅ ГЕОЛОКАЦИОННЫЕ РАЗРЕШЕНИЯ
export const canAccessFromLocation = (
  userRole: UserRole | undefined,
  isAllowedLocation: boolean
): boolean => {
  // Супер-админы могут работать откуда угодно
  if (isSuperAdmin(userRole)) return true;

  // Остальные только из разрешенных локаций
  return isAllowedLocation;
};

// ✅ УСТРОЙСТВО-СПЕЦИФИЧНЫЕ РАЗРЕШЕНИЯ
export const canAccessFromDevice = (
  userRole: UserRole | undefined,
  deviceType: 'desktop' | 'mobile' | 'tablet'
): boolean => {
  // Все роли могут использовать все устройства
  // Можно добавить ограничения в будущем
  return userRole !== undefined;
};

// ✅ ПРОВЕРКА ЛИМИТОВ И КВОТ
export const canExceedRateLimit = (userRole: UserRole | undefined): boolean => {
  return isAdmin(userRole);
};

export const canExceedStorageQuota = (userRole: UserRole | undefined): boolean => {
  return isAdmin(userRole);
};

export const canExceedAPIQuota = (userRole: UserRole | undefined): boolean => {
  return isAdmin(userRole);
};

// ✅ ПРОВЕРКА ДОСТУПА К ЭКСПЕРИМЕНТАЛЬНЫМ ФУНКЦИЯМ
export const canUseBetaFeatures = (userRole: UserRole | undefined): boolean => {
  return isStaff(userRole);
};

export const canUseAlphaFeatures = (userRole: UserRole | undefined): boolean => {
  return isAdmin(userRole);
};

export const canAccessDeveloperPreview = (userRole: UserRole | undefined): boolean => {
  return isSuperAdmin(userRole);
};

// ✅ ФИНАЛЬНЫЕ УТИЛИТЫ
export const getPermissionSummary = (userRole: UserRole | undefined): {
  role: UserRole | undefined;
  accessLevel: number;
  canManageUsers: boolean;
  canViewAnalytics: boolean;
  canModifySystem: boolean;
  creatableRoles: UserRole[];
  accessibleResources: Resource[];
} => {
  return {
    role: userRole,
    accessLevel: getAccessLevel(userRole),
    canManageUsers: canManageUsers(userRole),
    canViewAnalytics: canViewAnalytics(userRole),
    canModifySystem: canPerformMaintenance(userRole),
    creatableRoles: getCreatableRoles(userRole),
    accessibleResources: getAccessibleResources(userRole)
  };
};

// ✅ ПРОВЕРКА ДОСТУПА К КОНКРЕТНЫМ СТРАНИЦАМ ПРИЛОЖЕНИЯ - ОБНОВЛЕННАЯ
export const getPagePermissions = (userRole: UserRole | undefined) => {
  return {
    // Основные страницы
    dashboard: userRole !== undefined,
    profile: userRole !== undefined,

    // Страницы магазина - ОБНОВЛЕНО: доступны всем авторизованным пользователям
    shop: userRole !== undefined,
    shopManagement: canManageShop(userRole),
    shopAdmin: canManageShop(userRole),
    shopPurchase: userRole !== undefined,

    // Административные страницы
    adminDashboard: canAccessAdminPanel(userRole),
    userManagement: canViewUsers(userRole),
    trainerManagement: canViewTrainers(userRole),
    clientManagement: canViewClients(userRole),

    // Управленческие страницы
    managerDashboard: canAccessManagerPanel(userRole),
    analytics: canViewAnalytics(userRole),
    reports: canViewReports(userRole),
    billing: canViewBilling(userRole),

    // Тренерские страницы
    trainerDashboard: canAccessTrainerPanel(userRole),
    schedule: canViewSchedule(userRole),
    clientList: canViewClients(userRole),

    // Клиентские страницы
    clientDashboard: canAccessClientPanel(userRole),
    bookingSessions: canViewSchedule(userRole),
    myTrainer: canViewTrainers(userRole),

    // Системные страницы
    systemSettings: canViewSettings(userRole),
    systemMaintenance: canPerformMaintenance(userRole),
    systemLogs: canAccessSystemLogs(userRole),
    systemBackup: canCreateBackup(userRole),

    // Специальные страницы
    apiDocumentation: canAccessAPIDocumentation(userRole),
    developerTools: canAccessDeveloperTools(userRole),
    betaFeatures: canUseBetaFeatures(userRole),

    // Финансовые страницы
    financialReports: canViewFinancialReports(userRole),
    paymentProcessing: canProcessPayments(userRole),
    pricingManagement: canModifyPricing(userRole),

    // Коммуникационные страницы
    messaging: canSendDirectMessages(userRole),
    notifications: canViewNotifications(userRole),
    broadcasts: canBroadcastMessages(userRole),

    // Аналитические страницы
    performanceAnalytics: canViewPerformanceReports(userRole),
    usageAnalytics: canViewUsageReports(userRole),
    securityAnalytics: canViewSecurityReports(userRole),

    // Интеграционные страницы
    apiManagement: canManageIntegrations(userRole),
    webhookConfiguration: canConfigureWebhooks(userRole),
    thirdPartyIntegrations: canManageIntegrations(userRole)
  };
};

// ✅ ПРОВЕРКА ДОСТУПА К ДЕЙСТВИЯМ НА СТРАНИЦАХ
export const getActionPermissions = (userRole: UserRole | undefined) => {
  return {
    // Действия с пользователями
    createUser: canCreateUsers(userRole),
    editUser: canUpdateUsers(userRole),
    deleteUser: canDeleteUsers(userRole),
    resetPassword: (targetRole: UserRole) => canResetUserPassword(userRole, targetRole),
    changeRole: (currentRole: UserRole, newRole: UserRole) => canChangeUserRole(userRole, currentRole, newRole),

    // Действия с тренерами
    createTrainer: canCreateTrainers(userRole),
    editTrainer: canUpdateTrainers(userRole),
    deleteTrainer: canDeleteTrainers(userRole),
    assignClients: canUpdateTrainers(userRole),

    // Действия с клиентами
    createClient: canCreateClients(userRole),
    editClient: canUpdateClients(userRole),
    deleteClient: canDeleteClients(userRole),
    assignTrainer: canUpdateClients(userRole),

    // Действия с расписанием
    createSession: canCreateSchedule(userRole),
    editSession: canUpdateSchedule(userRole),
    cancelSession: canDeleteSchedule(userRole),
    rescheduleSession: canUpdateSchedule(userRole),
    bulkScheduleOperations: canPerformBulkOperations(userRole),

    // Финансовые действия
    processPayment: canProcessPayments(userRole),
    refundPayment: canRefundPayments(userRole),
    modifyPricing: canModifyPricing(userRole),
    viewFinancials: canViewFinancials(userRole),

    // Системные действия
    backupSystem: canCreateBackup(userRole),
    restoreSystem: canRestoreBackup(userRole),
    maintainSystem: canPerformMaintenance(userRole),
    configureSystem: canModifySystemSettings(userRole),

    // Коммуникационные действия
    sendMessage: canSendDirectMessages(userRole),
    broadcastMessage: canBroadcastMessages(userRole),
    moderateContent: canModerateMessages(userRole),

    // Аналитические действия
    viewAnalytics: canViewAnalytics(userRole),
    exportData: canExportAnalytics(userRole),
    configureReports: canManageReports(userRole),

    // Интеграционные действия
    createAPIKey: canCreateAPIKeys(userRole),
    configureWebhook: canConfigureWebhooks(userRole),
    manageIntegrations: canManageIntegrations(userRole),

    // Действия с магазином - ОБНОВЛЕНО
    viewShop: userRole !== undefined,
    purchaseFromShop: userRole !== undefined,
    manageShopItems: canManageShop(userRole),
    createShopItems: canCreateShopItems(userRole),
    editShopItems: canUpdateShopItems(userRole),
    deleteShopItems: canDeleteShopItems(userRole)
  };
};

// ✅ ВАЛИДАЦИЯ РАЗРЕШЕНИЙ ДЛЯ ФОРМ
export const validateFormPermissions = (
  userRole: UserRole | undefined,
  formType: string,
  action: 'create' | 'read' | 'update' | 'delete'
): { allowed: boolean; message?: string } => {
  const formPermissions: Record<string, { resource: Resource; requiredAction: Action }> = {
    userForm: { resource: 'users', requiredAction: action },
    trainerForm: { resource: 'trainers', requiredAction: action },
    clientForm: { resource: 'clients', requiredAction: action },
    sessionForm: { resource: 'schedule', requiredAction: action },
    settingsForm: { resource: 'settings', requiredAction: action },
    billingForm: { resource: 'billing', requiredAction: action },
    reportForm: { resource: 'reports', requiredAction: action },
    systemForm: { resource: 'system', requiredAction: 'maintenance' },
    shopForm: { resource: 'shop', requiredAction: action }
  };

  const permission = formPermissions[formType];
  if (!permission) {
    return { allowed: false, message: 'Неизвестный тип формы' };
  }

  const allowed = hasPermission(userRole, permission.resource, permission.requiredAction);

  return {
    allowed,
    message: allowed ? undefined : `Недостаточно прав для ${action} в ${formType}`
  };
};

// ✅ ПРОВЕРКА ДОСТУПА К API ЭНДПОИНТАМ - ОБНОВЛЕННАЯ
export const validateAPIAccess = (
  userRole: UserRole | undefined,
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
): { allowed: boolean; message?: string } => {
  const endpointPermissions: Record<string, Record<string, () => boolean>> = {
    '/api/users': {
      'GET': () => canViewUsers(userRole),
      'POST': () => canCreateUsers(userRole),
      'PUT': () => canUpdateUsers(userRole),
      'PATCH': () => canUpdateUsers(userRole),
      'DELETE': () => canDeleteUsers(userRole)
    },
    '/api/trainers': {
      'GET': () => canViewTrainers(userRole),
      'POST': () => canCreateTrainers(userRole),
      'PUT': () => canUpdateTrainers(userRole),
      'PATCH': () => canUpdateTrainers(userRole),
      'DELETE': () => canDeleteTrainers(userRole)
    },
    '/api/clients': {
      'GET': () => canViewClients(userRole),
      'POST': () => canCreateClients(userRole),
      'PUT': () => canUpdateClients(userRole),
      'PATCH': () => canUpdateClients(userRole),
      'DELETE': () => canDeleteClients(userRole)
    },
    '/api/schedule': {
      'GET': () => canViewSchedule(userRole),
      'POST': () => canCreateSchedule(userRole),
      'PUT': () => canUpdateSchedule(userRole),
      'PATCH': () => canUpdateSchedule(userRole),
      'DELETE': () => canDeleteSchedule(userRole)
    },
    '/api/analytics': {
      'GET': () => canViewAnalytics(userRole),
      'POST': () => canWriteAnalytics(userRole),
      'PUT': () => canWriteAnalytics(userRole),
      'PATCH': () => canWriteAnalytics(userRole),
      'DELETE': () => canWriteAnalytics(userRole)
    },
    '/api/settings': {
      'GET': () => canViewSettings(userRole),
      'POST': () => canWriteSettings(userRole),
      'PUT': () => canUpdateSettings(userRole),
      'PATCH': () => canUpdateSettings(userRole),
      'DELETE': () => canWriteSettings(userRole)
    },
    '/api/billing': {
      'GET': () => canViewBilling(userRole),
      'POST': () => canWriteBilling(userRole),
      'PUT': () => canUpdateBilling(userRole),
      'PATCH': () => canUpdateBilling(userRole),
      'DELETE': () => canWriteBilling(userRole)
    },
    '/api/reports': {
      'GET': () => canViewReports(userRole),
      'POST': () => canCreateReports(userRole),
      'PUT': () => canWriteReports(userRole),
      'PATCH': () => canWriteReports(userRole),
      'DELETE': () => canWriteReports(userRole)
    },
    '/api/system': {
      'GET': () => canViewSystemReports(userRole),
      'POST': () => canPerformMaintenance(userRole),
      'PUT': () => canPerformMaintenance(userRole),
      'PATCH': () => canPerformMaintenance(userRole),
      'DELETE': () => canPerformMaintenance(userRole)
    },
    '/api/shop': {
      'GET': () => userRole !== undefined, // Все авторизованные могут просматривать
      'POST': () => canCreateShopItems(userRole),
      'PUT': () => canUpdateShopItems(userRole),
      'PATCH': () => canUpdateShopItems(userRole),
      'DELETE': () => canDeleteShopItems(userRole)
    },
    '/api/shop/purchase': {
      'POST': () => userRole !== undefined // Все авторизованные могут покупать
    }
  };

  const methodPermissions = endpointPermissions[endpoint];
  if (!methodPermissions) {
    return { allowed: false, message: 'Неизвестный эндпоинт' };
  }

  const permissionCheck = methodPermissions[method];
  if (!permissionCheck) {
    return { allowed: false, message: 'Метод не поддерживается' };
  }

  const allowed = permissionCheck();

  return {
    allowed,
    message: allowed ? undefined : `Недостаточно прав для ${method} ${endpoint}`
  };
};

// ✅ ВАЛИДАЦИЯ ДАННЫХ ПОЛЬЗОВАТЕЛЯ
export const validateUserCreationData = (
  data: any,
  creatorRole: UserRole | undefined
): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  // Базовая валидация
  if (!data.name || typeof data.name !== 'string' || data.name.trim().length < 2) {
    errors.push('Имя обязательно и должно содержать минимум 2 символа');
  }

  if (!data.email || typeof data.email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('Некорректный email адрес');
  }

  if (!data.type || !['trainer', 'client'].includes(data.type)) {
    errors.push('Тип пользователя должен быть trainer или client');
  }

  // Валидация для тренера
  if (data.type === 'trainer') {
    if (!data.role || !canCreateUserWithRole(creatorRole, data.role)) {
      errors.push('Недостаточно прав для создания пользователя с указанной ролью');
    }

    if (data.experience !== undefined && (typeof data.experience !== 'number' || data.experience < 0)) {
      errors.push('Опыт должен быть положительным числом');
    }

    if (data.hourlyRate !== undefined && (typeof data.hourlyRate !== 'number' || data.hourlyRate < 0)) {
      errors.push('Почасовая ставка должна быть положительным числом');
    }

    if (data.specialization && !Array.isArray(data.specialization)) {
      errors.push('Специализация должна быть массивом');
    }
  }

  // Валидация для клиента
  if (data.type === 'client') {
    if (data.membershipType && !['basic', 'premium', 'vip'].includes(data.membershipType)) {
      errors.push('Некорректный тип членства');
    }
  }

  // Валидация телефона если указан
  if (data.phone && (typeof data.phone !== 'string' || !/^\+?[\d\s\-()]{10,}$/.test(data.phone))) {
    errors.push('Некорректный формат телефона');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// ✅ ПРОВЕРКА ДОСТУПА К ФАЙЛАМ И МЕДИА
export const validateFileAccess = (
  userRole: UserRole | undefined,
  fileType: 'public' | 'private' | 'system' | 'user-data',
  operation: 'read' | 'write' | 'delete'
): { allowed: boolean; message?: string } => {
  const filePermissions: Record<string, Record<string, () => boolean>> = {
    public: {
      read: () => userRole !== undefined,
      write: () => canUploadFiles(userRole),
      delete: () => canDeleteFiles(userRole)
    },
    private: {
      read: () => canAccessPrivateFiles(userRole),
      write: () => canUploadFiles(userRole),
      delete: () => canDeleteFiles(userRole)
    },
    system: {
      read: () => isAdmin(userRole),
      write: () => isSuperAdmin(userRole),
      delete: () => isSuperAdmin(userRole)
    },
    'user-data': {
      read: () => canViewPersonalData(userRole),
      write: () => canEditPersonalData(userRole),
      delete: () => isAdmin(userRole)
    }
  };

  const operationPermissions = filePermissions[fileType];
  if (!operationPermissions) {
    return { allowed: false, message: 'Неизвестный тип файла' };
  }

  const permissionCheck = operationPermissions[operation];
  if (!permissionCheck) {
    return { allowed: false, message: 'Операция не поддерживается' };
  }

    const allowed = permissionCheck();

  return {
    allowed,
    message: allowed ? undefined : `Недостаточно прав для ${operation} файлов типа ${fileType}`
  };
};

// ✅ ПРОВЕРКА ВРЕМЕННЫХ ОГРАНИЧЕНИЙ
export const validateTimeBasedAccess = (
  userRole: UserRole | undefined,
  currentTime: Date = new Date()
): {
  canAccessNow: boolean;
  canAccessDuringBusinessHours: boolean;
  canAccessDuringMaintenance: boolean;
  nextAllowedAccess?: Date;
} => {
  const hour = currentTime.getHours();
  const isBusinessHours = hour >= 8 && hour <= 22;
  const isMaintenanceWindow = hour >= 2 && hour <= 4; // 2-4 AM maintenance window

  return {
    canAccessNow: userRole !== undefined,
    canAccessDuringBusinessHours: canAccessDuringBusinessHours(userRole, hour),
    canAccessDuringMaintenance: canAccessDuringMaintenance(userRole),
    nextAllowedAccess: !isBusinessHours && !isStaff(userRole)
      ? new Date(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate() + 1, 8, 0, 0)
      : undefined
  };
};

// ✅ КОМПЛЕКСНАЯ ПРОВЕРКА ДОСТУПА
export const validateComplexAccess = (
  userRole: UserRole | undefined,
  context: {
    resource: Resource;
    action: Action;
    targetUserId?: string;
    currentUserId?: string;
    targetUserRole?: UserRole;
    isOwner?: boolean;
    isBusinessHours?: boolean;
    isMaintenanceMode?: boolean;
    deviceType?: 'desktop' | 'mobile' | 'tablet';
    location?: 'allowed' | 'restricted';
  }
): {
  allowed: boolean;
  reason?: string;
  warnings?: string[];
} => {
  const warnings: string[] = [];

  // Базовая проверка разрешений
  if (!hasPermission(userRole, context.resource, context.action)) {
    return {
      allowed: false,
      reason: `Недостаточно прав для ${context.action} в ${context.resource}`
    };
  }

  // Проверка владения объектом
  if (context.targetUserId && context.currentUserId && context.targetUserRole) {
    if (!canAccessObject(userRole!, context.currentUserId, context.targetUserId, context.resource, context.action)) {
      return {
        allowed: false,
        reason: 'Нет доступа к данному объекту'
      };
    }
  }

  // Проверка управления пользователями
  if (context.targetUserRole && (context.action === 'update' || context.action === 'delete')) {
    if (!canManageUser(userRole, context.targetUserRole)) {
      return {
        allowed: false,
        reason: 'Недостаточно прав для управления пользователем с данной ролью'
      };
    }
  }

  // Проверка времени доступа
  if (context.isBusinessHours === false && !canAccessOutsideBusinessHours(userRole)) {
    return {
      allowed: false,
      reason: 'Доступ разрешен только в рабочие часы'
    };
  }

  // Проверка режима обслуживания
  if (context.isMaintenanceMode && !canAccessDuringMaintenance(userRole)) {
    return {
      allowed: false,
      reason: 'Система находится в режиме обслуживания'
    };
  }

  // Проверка локации
  if (context.location === 'restricted' && !canAccessFromLocation(userRole, false)) {
    return {
      allowed: false,
      reason: 'Доступ с данной локации запрещен'
    };
  }

  // Предупреждения
  if (context.deviceType === 'mobile' && isAdmin(userRole)) {
    warnings.push('Административные функции лучше выполнять с компьютера');
  }

  if (context.isBusinessHours === false && isStaff(userRole)) {
    warnings.push('Работа вне рабочих часов');
  }

  if (context.action === 'delete' && context.resource === 'users') {
    warnings.push('Удаление пользователей - необратимая операция');
  }

  return {
    allowed: true,
    warnings: warnings.length > 0 ? warnings : undefined
  };
};

// ✅ ПОЛУЧЕНИЕ РЕКОМЕНДАЦИЙ ПО БЕЗОПАСНОСТИ
export const getSecurityRecommendations = (userRole: UserRole | undefined): string[] => {
  const recommendations: string[] = [];

  if (isSuperAdmin(userRole)) {
    recommendations.push(
      'Используйте двухфакторную аутентификацию',
      'Регулярно меняйте пароль',
      'Не используйте супер-админ аккаунт для повседневных задач',
      'Ведите журнал всех административных действий',
      'Ограничьте доступ к супер-админ функциям по IP'
    );
  }

  if (isAdmin(userRole)) {
    recommendations.push(
      'Используйте сильные пароли',
      'Включите уведомления о входе в систему',
      'Регулярно проверяйте логи доступа',
      'Не делитесь административными учетными данными'
    );
  }

  if (isManager(userRole)) {
    recommendations.push(
      'Регулярно проверяйте права доступа подчиненных',
      'Используйте принцип минимальных привилегий',
      'Документируйте все изменения в системе'
    );
  }

  if (isTrainer(userRole)) {
    recommendations.push(
      'Защищайте персональные данные клиентов',
      'Не передавайте учетные данные третьим лицам',
      'Сообщайте о подозрительной активности'
    );
  }

  if (isClient(userRole)) {
    recommendations.push(
      'Используйте уникальный пароль для этого сервиса',
      'Не передавайте свои учетные данные другим',
      'Сообщайте о подозрительной активности в вашем аккаунте'
    );
  }

  return recommendations;
};

// ✅ ПРОВЕРКА СООТВЕТСТВИЯ ТРЕБОВАНИЯМ БЕЗОПАСНОСТИ
export const validateSecurityCompliance = (
  userRole: UserRole | undefined,
  context: {
    hasMultiFactorAuth?: boolean;
    lastPasswordChange?: Date;
    loginLocation?: 'trusted' | 'untrusted';
    sessionAge?: number; // в минутах
    deviceTrusted?: boolean;
  }
): {
  compliant: boolean;
  violations: string[];
  recommendations: string[];
} => {
  const violations: string[] = [];
  const recommendations: string[] = [];

  // Проверки для супер-админов
  if (isSuperAdmin(userRole)) {
    if (!context.hasMultiFactorAuth) {
      violations.push('Супер-админы должны использовать двухфакторную аутентификацию');
    }

    if (context.lastPasswordChange &&
      (Date.now() - context.lastPasswordChange.getTime()) > 30 * 24 * 60 * 60 * 1000) {
      violations.push('Пароль супер-админа должен меняться каждые 30 дней');
    }

    if (context.loginLocation === 'untrusted') {
      violations.push('Супер-админы могут входить только с доверенных локаций');
    }
  }

  // Проверки для админов
  if (isAdmin(userRole)) {
    if (context.lastPasswordChange &&
      (Date.now() - context.lastPasswordChange.getTime()) > 90 * 24 * 60 * 60 * 1000) {
      recommendations.push('Рекомендуется сменить пароль (последняя смена более 90 дней назад)');
    }

    if (context.sessionAge && context.sessionAge > 480) { // 8 часов
      recommendations.push('Длительная сессия - рекомендуется переавторизация');
    }
  }

  // Проверки для всех ролей
  if (context.deviceTrusted === false && isStaff(userRole)) {
    recommendations.push('Работа с недоверенного устройства - будьте осторожны');
  }

  return {
    compliant: violations.length === 0,
    violations,
    recommendations
  };
};

// ✅ ПОЛУЧЕНИЕ ОГРАНИЧЕНИЙ ДЛЯ РОЛИ
export const getRoleLimitations = (userRole: UserRole | undefined): {
  maxSessionDuration?: number; // в минутах
  maxConcurrentSessions?: number;
  allowedIPs?: string[];
  allowedDevices?: string[];
  businessHoursOnly?: boolean;
  requiresMFA?: boolean;
  passwordExpiryDays?: number;
  maxFailedLogins?: number;
} => {
  const limitations: Record<UserRole, any> = {
    'super-admin': {
      maxSessionDuration: 240, // 4 часа
      maxConcurrentSessions: 2,
      businessHoursOnly: false,
      requiresMFA: true,
      passwordExpiryDays: 30,
      maxFailedLogins: 3
    },
    'admin': {
      maxSessionDuration: 480, // 8 часов
      maxConcurrentSessions: 3,
      businessHoursOnly: false,
      requiresMFA: true,
      passwordExpiryDays: 60,
      maxFailedLogins: 5
    },
    'manager': {
      maxSessionDuration: 600, // 10 часов
      maxConcurrentSessions: 2,
      businessHoursOnly: false,
      requiresMFA: false,
      passwordExpiryDays: 90,
      maxFailedLogins: 5
    },
    'trainer': {
      maxSessionDuration: 720, // 12 часов
      maxConcurrentSessions: 2,
      businessHoursOnly: true,
      requiresMFA: false,
      passwordExpiryDays: 180,
      maxFailedLogins: 10
    },
    'member': {
      maxSessionDuration: 1440, // 24 часа
      maxConcurrentSessions: 1,
      businessHoursOnly: false,
      requiresMFA: false,
      passwordExpiryDays: 365,
      maxFailedLogins: 10
    },
    'client': {
      maxSessionDuration: 1440, // 24 часа
      maxConcurrentSessions: 1,
      businessHoursOnly: false,
      requiresMFA: false,
      passwordExpiryDays: 365,
      maxFailedLogins: 10
    }
  };

  return userRole ? limitations[userRole] : {};
};

// ✅ ПРОВЕРКА ДОСТУПА К ЭКСПОРТУ ДАННЫХ
export const validateDataExport = (
  userRole: UserRole | undefined,
  dataType: 'personal' | 'financial' | 'system' | 'analytics' | 'logs',
  format: 'csv' | 'json' | 'pdf' | 'excel'
): {
  allowed: boolean;
  requiresApproval?: boolean;
  approverRoles?: UserRole[];
  restrictions?: string[];
} => {
  const exportRules: Record<string, any> = {
    personal: {
      allowed: canExportPersonalData(userRole),
      requiresApproval: !isAdmin(userRole),
      approverRoles: ['admin', 'super-admin'],
      restrictions: isManager(userRole) ? ['Только данные подчиненных'] : []
    },
    financial: {
      allowed: canExportFinancialData(userRole),
      requiresApproval: !isAdmin(userRole),
      approverRoles: ['admin', 'super-admin'],
      restrictions: []
    },
    system: {
      allowed: canExportSystemData(userRole),
      requiresApproval: true,
      approverRoles: ['super-admin'],
      restrictions: ['Только для технического обслуживания']
    },
    analytics: {
      allowed: canExportAnalytics(userRole),
      requiresApproval: false,
      approverRoles: [],
      restrictions: []
    },
    logs: {
      allowed: canAccessSystemLogs(userRole),
      requiresApproval: !isSuperAdmin(userRole),
      approverRoles: ['super-admin'],
      restrictions: ['Ограниченный временной период']
    }
  };

  const rule = exportRules[dataType];
  if (!rule) {
    return { allowed: false };
  }

  // Дополнительные ограничения по формату
  if (format === 'json' && dataType === 'system' && !isSuperAdmin(userRole)) {
    return {
      allowed: false,
      restrictions: ['JSON экспорт системных данных только для супер-админов']
    };
  }

  return rule;
};

// ✅ ПРОВЕРКА ДОСТУПА К ИМПОРТУ ДАННЫХ
export const validateDataImport = (
  userRole: UserRole | undefined,
  dataType: 'users' | 'schedule' | 'settings' | 'system',
  source: 'file' | 'api' | 'database'
): {
  allowed: boolean;
  requiresValidation?: boolean;
  requiresBackup?: boolean;
  restrictions?: string[];
} => {
  const importRules: Record<string, any> = {
    users: {
      allowed: canCreateUsers(userRole) && isManager(userRole),
      requiresValidation: true,
      requiresBackup: true,
      restrictions: ['Максимум 1000 пользователей за раз']
    },
    schedule: {
      allowed: canCreateSchedule(userRole),
      requiresValidation: true,
      requiresBackup: true,
      restrictions: ['Только будущие даты']
    },
    settings: {
      allowed: canUpdateSettings(userRole),
      requiresValidation: true,
      requiresBackup: true,
      restrictions: ['Требуется подтверждение изменений']
    },
    system: {
      allowed: isSuperAdmin(userRole),
      requiresValidation: true,
      requiresBackup: true,
      restrictions: ['Только в режиме обслуживания']
    }
  };

  const rule = importRules[dataType];
  if (!rule) {
    return { allowed: false };
  }

  // Дополнительные ограничения по источнику
  if (source === 'database' && !isSuperAdmin(userRole)) {
    return {
      allowed: false,
      restrictions: ['Прямой импорт из БД только для супер-админов']
    };
  }

  return rule;
};

// ✅ ФИНАЛЬНАЯ ФУНКЦИЯ ПРОВЕРКИ ВСЕХ РАЗРЕШЕНИЙ
export const checkAllPermissions = (
  userRole: UserRole | undefined,
  userId?: string
): {
  role: UserRole | undefined;
  summary: ReturnType<typeof getPermissionSummary>;
  pages: ReturnType<typeof getPagePermissions>;
  actions: ReturnType<typeof getActionPermissions>;
  limitations: ReturnType<typeof getRoleLimitations>;
  securityRecommendations: string[];
  accessLevel: number;
  isStaff: boolean;
  canEscalate: boolean;
} => {
  return {
    role: userRole,
    summary: getPermissionSummary(userRole),
    pages: getPagePermissions(userRole),
    actions: getActionPermissions(userRole),
    limitations: getRoleLimitations(userRole),
    securityRecommendations: getSecurityRecommendations(userRole),
    accessLevel: getAccessLevel(userRole),
    isStaff: isStaff(userRole),
    canEscalate: isManager(userRole)
  };
};

// ✅ ЭКСПОРТ ВСЕХ ОСНОВНЫХ ФУНКЦИЙ
export default {
  // Основные проверки
  hasPermission,
  canAccessObject,

  // Проверки ролей
  isSuperAdmin,
  isAdmin,
  isManager,
  isTrainer,
  isClient,
  isStaff,

  // Проверки ресурсов
  canManageUsers,
  canViewAnalytics,
  canPerformMaintenance,

  // Магазин - ОБНОВЛЕНО
  canAccessShop,
  canViewShop,
  canPurchaseFromShop,
  canManageShop,
  canCreateShopItems,
  canUpdateShopItems,
  canDeleteShopItems,

  // Комплексные проверки
  validateComplexAccess,
  validateAPIAccess,
  validateFormPermissions,
  validateDataExport,
  validateDataImport,

  // Утилиты
  getPermissionSummary,
  getPagePermissions,
  getActionPermissions,
  checkAllPermissions,

  // Безопасность
  getSecurityRecommendations,
  validateSecurityCompliance,
  getRoleLimitations
};


