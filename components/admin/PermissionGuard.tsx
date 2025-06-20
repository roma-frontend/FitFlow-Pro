// components/admin/PermissionGuard.tsx
"use client";

import { ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { hasPermission, canAccessObject, UserRole, Resource, Action } from '@/lib/permissions';
import { AlertTriangle, Lock, Eye } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface PermissionGuardProps {
  resource: Resource;
  action: Action;
  objectOwnerId?: string;
  fallback?: ReactNode;
  showFallback?: boolean;
  children: ReactNode;
}

export const PermissionGuard = ({ 
  resource, 
  action, 
  objectOwnerId,
  fallback, 
  showFallback = true,
  children 
}: PermissionGuardProps) => {
  const { user } = useAuth();

  // Если пользователь не авторизован
  if (!user) {
    if (!showFallback) return null;
    
    return (
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-full">
              <Lock className="h-4 w-4 text-yellow-600" />
            </div>
            <div>
              <h4 className="font-medium text-yellow-800">Требуется авторизация</h4>
              <p className="text-sm text-yellow-600">
                Войдите в систему для доступа к этому разделу
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Проверяем базовые права
  const hasBasicPermission = hasPermission(user.role as UserRole, resource, action);
  
  // Проверяем доступ к конкретному объекту
  const hasObjectAccess = objectOwnerId 
    ? canAccessObject(user.role as UserRole, user.id, objectOwnerId, resource, action)
    : true;

  const hasAccess = hasBasicPermission && hasObjectAccess;

  if (hasAccess) {
    return <>{children}</>;
  }

  if (!showFallback) {
    return null;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  // Дефолтный fallback
  return (
    <Card className="border-red-200 bg-red-50">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-100 rounded-full">
            <Lock className="h-4 w-4 text-red-600" />
          </div>
          <div>
            <h4 className="font-medium text-red-800">Доступ ограничен</h4>
            <p className="text-sm text-red-600">
              У вас нет прав для выполнения действия "{action}" с ресурсом "{resource}"
            </p>
            <p className="text-xs text-red-500 mt-1">
              Ваша роль: {user.role}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Компонент для скрытия элементов без прав
export const PermissionHidden = ({ 
  resource, 
  action, 
  objectOwnerId,
  children 
}: Omit<PermissionGuardProps, 'fallback' | 'showFallback'>) => {
  return (
    <PermissionGuard 
      resource={resource} 
      action={action} 
      objectOwnerId={objectOwnerId}
      showFallback={false}
    >
      {children}
    </PermissionGuard>
  );
};

// Компонент для показа информации о правах
export const PermissionInfo = ({ 
  resource, 
  action,
  className = ""
}: { 
  resource: Resource; 
  action: Action;
  className?: string;
}) => {
  const { user } = useAuth();
  
  if (!user) {
    return (
      <div className={`flex items-center gap-2 text-xs ${className}`}>
        <AlertTriangle className="h-3 w-3 text-gray-400" />
        <span className="text-gray-400">Не авторизован</span>
      </div>
    );
  }

  const hasAccess = hasPermission(user.role as UserRole, resource, action);

  return (
    <div className={`flex items-center gap-2 text-xs ${className}`}>
      {hasAccess ? (
        <>
          <Eye className="h-3 w-3 text-green-600" />
          <span className="text-green-600">Доступно</span>
        </>
      ) : (
        <>
          <AlertTriangle className="h-3 w-3 text-red-600" />
          <span className="text-red-600">Ограничено</span>
        </>
      )}
    </div>
  );
};

// HOC для защиты страниц
export const withPermissionGuard = (
  resource: Resource,
  action: Action,
  fallbackComponent?: ReactNode
) => {
  return function PermissionGuardHOC<T extends object>(
    WrappedComponent: React.ComponentType<T>
  ) {
    return function GuardedComponent(props: T) {
      return (
        <PermissionGuard 
          resource={resource} 
          action={action}
          fallback={fallbackComponent}
        >
          <WrappedComponent {...props} />
        </PermissionGuard>
      );
    };
  };
};
