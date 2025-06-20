// hooks/usePermissions.ts
"use client";

import { useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import {
  hasPermission,
  canManageRole,
  getCreatableRoles,
  filterDataByPermissions,
  canAccessObject,
  UserRole,
  Resource,
  Action,
  ROLE_HIERARCHY,
  PERMISSIONS
} from '@/lib/permissions';

export const usePermissions = () => {
  const { user } = useAuth();

  const permissions = useMemo(() => {
    const userRole = user?.role as UserRole | undefined;
    const userId = user?.id;

    return {
      // Базовые проверки прав
      can: (resource: Resource, action: Action) =>
        hasPermission(userRole, resource, action),

      // Проверка доступа к объекту
      canAccess: (objectOwnerId: string | undefined, resource: Resource, action: Action) =>
        userRole && userId ? canAccessObject(userRole, userId, objectOwnerId, resource, action) : false,

      // Управление ролями
      canManage: (targetRole: UserRole) =>
        userRole ? canManageRole(userRole, targetRole) : false,

      creatableRoles: userRole ? getCreatableRoles(userRole) : [],

      // Исправленная фильтрация данных - делаем ее более гибкой
      filterData: <T extends Record<string, any>>(
        data: T[],
        resource: Resource
      ): T[] => {
        // Если нет роли пользователя, возвращаем пустой массив
        if (!userRole || !userId) {
          return [];
        }

        // Админы видят все
        if (userRole === 'admin') {
          return data;
        }

        // Менеджеры видят все, кроме других админов
        if (userRole === 'manager') {
          return data.filter(item => {
            // Если у объекта есть роль и это админ, скрываем
            if (item.role === 'admin') return false;
            return true;
          });
        }

        // Тренеры видят только свои данные и данные своих клиентов
        if (userRole === 'trainer') {
          return data.filter(item => {
            // Если это тренер - показываем только если это он сам
            if (resource === 'trainers') {
              return item.id === userId;
            }

            // Если это клиенты - показываем только своих
            if (resource === 'clients') {
              return item.trainerId === userId;
            }

            // Если это расписание - показываем только свои события
            if (resource === 'schedule') {
              return item.trainerId === userId;
            }

            // Для остальных ресурсов - показываем все
            return true;
          });
        }

        // Клиенты видят только свои данные
        if (userRole === 'client') {
          return data.filter(item => {
            // Клиенты видят только себя в списке клиентов
            if (resource === 'clients') {
              return item.id === userId;
            }

            // Клиенты видят только свои события в расписании
            if (resource === 'schedule') {
              return item.clientId === userId;
            }

            // Тренеров не видят
            if (resource === 'trainers') {
              return false;
            }

            // Для остальных ресурсов - показываем все
            return true;
          });
        }

        // По умолчанию возвращаем пустой массив
        return [];
      },

      // Проверка уровня доступа
      hasHigherRole: (targetRole: UserRole) => {
        if (!userRole) return false;
        return ROLE_HIERARCHY[userRole] > ROLE_HIERARCHY[targetRole];
      },

      // Проверка равного уровня доступа
      hasEqualRole: (targetRole: UserRole) => {
        if (!userRole) return false;
        return ROLE_HIERARCHY[userRole] === ROLE_HIERARCHY[targetRole];
      },

      // Получение уровня пользователя
      getUserLevel: () => userRole ? ROLE_HIERARCHY[userRole] : 0,

      // Проверка на роли
      isAdmin: () => userRole === 'admin',
      isManager: () => userRole === 'manager',
      isTrainer: () => userRole === 'trainer',
      isClient: () => userRole === 'client',

      // Текущая роль и ID пользователя
      currentRole: userRole,
      currentUserId: userId,

      // Проверка множественных прав
      canAny: (checks: Array<{ resource: Resource; action: Action }>) =>
        checks.some(({ resource, action }) => hasPermission(userRole, resource, action)),

      canAll: (checks: Array<{ resource: Resource; action: Action }>) =>
        checks.every(({ resource, action }) => hasPermission(userRole, resource, action)),

      // Получение всех прав для ресурса
      getResourcePermissions: (resource: Resource) => {
        if (!userRole) return [];
        const permissions = PERMISSIONS[userRole];
        return permissions[resource] || [];
      },

      // Проверка на владельца объекта
      isOwner: (objectOwnerId: string | undefined) => objectOwnerId === userId,

      // Проверка на персонал
      isStaff: () => userRole ? ['admin', 'manager', 'trainer'].includes(userRole) : false,

      // Проверка на управленческие роли
      isManagement: () => userRole ? ['admin', 'manager'].includes(userRole) : false,

      // НОВЫЕ ФУНКЦИИ ДЛЯ МАГАЗИНА
      canAccessShop: () => userRole !== undefined, // Все авторизованные пользователи
      canViewShop: () => userRole !== undefined,
      canPurchaseFromShop: () => userRole !== undefined,
      canManageShop: () => hasPermission(userRole, 'shop', 'manage'),
      canCreateShopItems: () => hasPermission(userRole, 'shop', 'create'),
      canUpdateShopItems: () => hasPermission(userRole, 'shop', 'update'),
      canDeleteShopItems: () => hasPermission(userRole, 'shop', 'delete')
    };
  }, [user?.role, user?.id]);

  return permissions;
};

// Остальные хуки остаются без изменений...
export const useUserPermissions = () => {
  const permissions = usePermissions();

  return {
    canCreateUser: permissions.can('users', 'create'),
    canEditUser: permissions.can('users', 'update'),
    canDeleteUser: permissions.can('users', 'delete'),
    canViewUsers: permissions.can('users', 'read'),
    canExportUsers: permissions.can('users', 'export'),
    canImportUsers: permissions.can('users', 'import'),
    creatableRoles: permissions.creatableRoles,
    canManageRole: permissions.canManage,
    canEditOwnProfile: (userId: string) =>
      permissions.isOwner(userId) || permissions.isManagement()
  };
};

export const useTrainerPermissions = () => {
  const permissions = usePermissions();

  return {
    canCreateTrainer: permissions.can('trainers', 'create'),
    canEditTrainer: permissions.can('trainers', 'update'),
    canDeleteTrainer: permissions.can('trainers', 'delete'),
    canViewTrainers: permissions.can('trainers', 'read'),
    canExportTrainers: permissions.can('trainers', 'export'),
    canEditOwnProfile: (trainerId: string) =>
      permissions.isTrainer() && permissions.isOwner(trainerId),
    canViewTrainerDetails: (trainerId: string) =>
      permissions.isManagement() || permissions.isOwner(trainerId)
  };
};

export const useClientPermissions = () => {
  const permissions = usePermissions();

  return {
    canCreateClient: permissions.can('clients', 'create'),
    canEditClient: permissions.can('clients', 'update'),
    canDeleteClient: permissions.can('clients', 'delete'),
    canViewClients: permissions.can('clients', 'read'),
    canExportClients: permissions.can('clients', 'export'),
    canEditOwnProfile: (clientId: string) =>
      permissions.isClient() && permissions.isOwner(clientId),
    canViewClientDetails: (clientId: string) =>
      permissions.isManagement() ||
      permissions.isTrainer() ||
      permissions.isOwner(clientId)
  };
};

export const useSchedulePermissions = () => {
  const permissions = usePermissions();

  return {
    canCreateEvent: permissions.can('schedule', 'create'),
    canEditEvent: permissions.can('schedule', 'update'),
    canDeleteEvent: permissions.can('schedule', 'delete'),
    canViewSchedule: permissions.can('schedule', 'read'),
    canExportSchedule: permissions.can('schedule', 'export'),
    canEditOwnEvents: (trainerId: string) =>
      permissions.isTrainer() && permissions.isOwner(trainerId),
    canViewAllSchedule: () => permissions.isManagement(),
    canBookSession: () => permissions.isClient(),
    canCancelSession: (ownerId: string) =>
      permissions.isOwner(ownerId) || permissions.isManagement()
  };
};

export const useAnalyticsPermissions = () => {
  const permissions = usePermissions();

  return {
    canViewAnalytics: permissions.can('analytics', 'read'),
    canExportAnalytics: permissions.can('analytics', 'export'),
    canViewOwnAnalytics: () => true,
    canViewTeamAnalytics: () => permissions.isStaff(),
    canViewAllAnalytics: () => permissions.isManagement()
  };
};

export const useSystemPermissions = () => {
  const permissions = usePermissions();

  return {
    canMaintainSystem: permissions.can('system', 'maintenance'),
    canManageSystem: permissions.can('system', 'manage'),
    canViewSettings: permissions.can('settings', 'read'),
    canEditSettings: permissions.can('settings', 'update'),
    canManageSettings: permissions.can('settings', 'manage'),
    canBackupData: () => permissions.isAdmin(),
    canRestoreData: () => permissions.isAdmin(),
    canViewLogs: () => permissions.isManagement()
  };
};

export const useReportPermissions = () => {
  const permissions = usePermissions();

  return {
    canCreateReport: permissions.can('reports', 'create'),
    canViewReports: permissions.can('reports', 'read'),
    canExportReports: permissions.can('reports', 'export'),
    canViewOwnReports: () => true,
    canViewAllReports: () => permissions.isManagement(),
    canGenerateSystemReports: () => permissions.isManagement()
  };
};

export const useNotificationPermissions = () => {
  const permissions = usePermissions();

  return {
    canCreateNotification: permissions.can('notifications', 'create'),
    canViewNotifications: permissions.can('notifications', 'read'),
    canEditNotifications: permissions.can('notifications', 'update'),
    canDeleteNotifications: permissions.can('notifications', 'delete'),
    canSendBulkNotifications: () => permissions.isManagement(),
    canManageNotificationSettings: () => permissions.isStaff()
  };
};

// НОВЫЙ ХУК ДЛЯ РАЗРЕШЕНИЙ МАГАЗИНА
export const useShopPermissions = () => {
  const permissions = usePermissions();

  return {
    // Базовые разрешения - доступны всем авторизованным пользователям
    canAccessShop: permissions.canAccessShop,
    canViewShop: permissions.canViewShop,
    canPurchaseFromShop: permissions.canPurchaseFromShop,
    
    // Административные разрешения - только для персонала с соответствующими правами
    canManageShop: permissions.canManageShop,
    canCreateShopItems: permissions.canCreateShopItems,
    canEditShopItems: permissions.canUpdateShopItems,
    canDeleteShopItems: permissions.canDeleteShopItems,
    canExportShopData: () => permissions.can('shop', 'export'),
    
    // Дополнительные проверки
    canViewShopAnalytics: () => permissions.isManagement(),
    canConfigureShopSettings: () => permissions.isAdmin(),
    canProcessShopOrders: () => permissions.isStaff(),
    canRefundShopPurchases: () => permissions.isManagement(),
    
    // Проверка доступа к конкретным действиям
    canViewShopItem: () => permissions.canViewShop(),
    canBuyShopItem: () => permissions.canPurchaseFromShop(),
    canEditShopItem: (itemOwnerId?: string) => 
      permissions.canUpdateShopItems() || 
      (itemOwnerId && permissions.isOwner(itemOwnerId)),
    canDeleteShopItem: (itemOwnerId?: string) =>
      permissions.canDeleteShopItems() ||
      (itemOwnerId && permissions.isOwner(itemOwnerId) && permissions.isStaff())
  };
};

export const usePagePermissions = () => {
  const permissions = usePermissions();

  return {
    canAccessAdminPanel: () => permissions.isAdmin(),
    canAccessManagerPanel: () => permissions.isManagement(),
    canAccessTrainerPanel: () => permissions.isStaff(),
    canAccessUserManagement: () => permissions.can('users', 'read'),
    canAccessAnalytics: () => permissions.can('analytics', 'read'),
    canAccessSystemSettings: () => permissions.can('system', 'manage'),
    canAccessReports: () => permissions.can('reports', 'read'),
    canAccessScheduleManagement: () => permissions.can('schedule', 'manage'),
    
    // НОВЫЕ РАЗРЕШЕНИЯ ДЛЯ СТРАНИЦ МАГАЗИНА
    canAccessShopPage: () => permissions.canAccessShop(),
    canAccessShopManagement: () => permissions.canManageShop(),
    canAccessShopAnalytics: () => permissions.isManagement(),
    canAccessShopSettings: () => permissions.isAdmin()
  };
};

// Хук для получения отфильтрованных данных
export const useFilteredData = <T extends Record<string, any>>(
  data: T[],
  resource: Resource
) => {
  const permissions = usePermissions();

  return useMemo(() => {
    return permissions.filterData(data, resource);
  }, [data, resource, permissions]);
};

// Хук для проверки доступа к объекту
export const useObjectAccess = (
  objectOwnerId: string | undefined,
  resource: Resource,
  action: Action
) => {
  const permissions = usePermissions();

  return useMemo(() => {
    return permissions.canAccess(objectOwnerId, resource, action);
  }, [objectOwnerId, resource, action, permissions]);
};

// Хук для получения доступных действий для ресурса
export const useAvailableActions = (resource: Resource) => {
  const permissions = usePermissions();

  return useMemo(() => {
    const actions: Action[] = ['create', 'read', 'update', 'delete', 'export', 'import'];
    return actions.filter(action => permissions.can(resource, action));
  }, [resource, permissions]);
};

// НОВЫЙ ХУК ДЛЯ КОМПЛЕКСНОЙ ПРОВЕРКИ ДОСТУПА К МАГАЗИНУ
export const useShopAccess = () => {
  const permissions = usePermissions();
  const shopPermissions = useShopPermissions();

  return useMemo(() => ({
    // Основные проверки доступа
    hasShopAccess: shopPermissions.canAccessShop(),
    hasShopManagementAccess: shopPermissions.canManageShop(),
    
    // Проверки для конкретных действий
    canBrowseShop: shopPermissions.canViewShop(),
    canMakePurchases: shopPermissions.canPurchaseFromShop(),
    canManageInventory: shopPermissions.canManageShop(),
    canViewSalesData: shopPermissions.canViewShopAnalytics(),
    
    // Роль-специфичные возможности
    shopCapabilities: {
      // Для всех авторизованных пользователей
      browse: shopPermissions.canViewShop(),
      purchase: shopPermissions.canPurchaseFromShop(),
      
      // Для персонала
      addItems: shopPermissions.canCreateShopItems(),
      editItems: shopPermissions.canEditShopItems(),
      deleteItems: shopPermissions.canDeleteShopItems(),
      processOrders: shopPermissions.canProcessShopOrders(),
      
      // Для менеджмента
      viewAnalytics: shopPermissions.canViewShopAnalytics(),
      refundOrders: shopPermissions.canRefundShopPurchases(),
      
      // Для админов
      configureSettings: shopPermissions.canConfigureShopSettings(),
      exportData: shopPermissions.canExportShopData()
    },
    
    // Получение доступных действий для текущего пользователя
    getAvailableShopActions: () => {
      const actions = [];
      
      if (shopPermissions.canViewShop()) actions.push('view');
      if (shopPermissions.canPurchaseFromShop()) actions.push('purchase');
      if (shopPermissions.canCreateShopItems()) actions.push('create');
      if (shopPermissions.canEditShopItems()) actions.push('edit');
      if (shopPermissions.canDeleteShopItems()) actions.push('delete');
      if (shopPermissions.canManageShop()) actions.push('manage');
      if (shopPermissions.canExportShopData()) actions.push('export');
      
      return actions;
    },
    
    // Проверка доступа к конкретному элементу магазина
    canAccessShopItem: (itemId: string, ownerId?: string) => ({
      view: shopPermissions.canViewShopItem(),
      purchase: shopPermissions.canBuyShopItem(),
      edit: shopPermissions.canEditShopItem(ownerId),
      delete: shopPermissions.canDeleteShopItem(ownerId)
    }),
    
    // Получение уровня доступа к магазину
    getShopAccessLevel: () => {
      if (permissions.isAdmin()) return 'admin';
      if (permissions.isManagement()) return 'manager';
      if (permissions.isStaff()) return 'staff';
      if (permissions.currentRole) return 'user';
      return 'none';
    }
  }), [permissions, shopPermissions]);
};

// НОВЫЙ ХУК ДЛЯ НАВИГАЦИИ ПО МАГАЗИНУ
export const useShopNavigation = () => {
  const shopAccess = useShopAccess();
  const permissions = usePermissions();

  return useMemo(() => ({
    // Доступные разделы магазина
    availableSections: {
      catalog: shopAccess.canBrowseShop,
      cart: shopAccess.canMakePurchases,
      orders: shopAccess.canMakePurchases,
      management: shopAccess.hasShopManagementAccess,
      analytics: shopAccess.shopCapabilities.viewAnalytics,
      settings: shopAccess.shopCapabilities.configureSettings
    },
    
    // Генерация навигационного меню
    getShopMenuItems: () => {
      const menuItems = [];
      
      if (shopAccess.canBrowseShop) {
        menuItems.push({
          label: 'Каталог',
          path: '/shop',
          icon: 'catalog',
          access: 'all'
        });
      }
      
      if (shopAccess.canMakePurchases) {
        menuItems.push({
          label: 'Корзина',
          path: '/shop/cart',
          icon: 'cart',
          access: 'user'
        });
        
        menuItems.push({
          label: 'Мои заказы',
          path: '/shop/orders',
          icon: 'orders',
          access: 'user'
        });
      }
      
      if (shopAccess.hasShopManagementAccess) {
        menuItems.push({
          label: 'Управление товарами',
          path: '/shop/manage',
          icon: 'manage',
          access: 'staff'
        });
      }
      
      if (shopAccess.shopCapabilities.viewAnalytics) {
        menuItems.push({
          label: 'Аналитика продаж',
          path: '/shop/analytics',
          icon: 'analytics',
          access: 'manager'
        });
      }
      
      if (shopAccess.shopCapabilities.configureSettings) {
        menuItems.push({
          label: 'Настройки магазина',
          path: '/shop/settings',
          icon: 'settings',
          access: 'admin'
        });
      }
      
      return menuItems;
    },
    
    // Проверка доступа к конкретному маршруту магазина
    canAccessShopRoute: (route: string) => {
      const routePermissions: Record<string, boolean> = {
        '/shop': shopAccess.canBrowseShop,
        '/shop/cart': shopAccess.canMakePurchases,
        '/shop/orders': shopAccess.canMakePurchases,
        '/shop/manage': shopAccess.hasShopManagementAccess,
        '/shop/analytics': shopAccess.shopCapabilities.viewAnalytics,
        '/shop/settings': shopAccess.shopCapabilities.configureSettings
      };
      
      return routePermissions[route] || false;
    }
  }), [shopAccess, permissions]);
};
