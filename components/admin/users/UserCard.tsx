// components/admin/users/UserCard.tsx - ОПТИМИЗИРОВАННАЯ ВЕРСИЯ
"use client";

import React, { memo, useCallback } from 'react';
import { cn } from "@/lib/utils";
import { 
  MoreVertical, 
  Edit, 
  Trash2, 
  Mail, 
  Eye,
  CheckCircle,
  XCircle
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { User, UserRole } from "@/types/user";

interface UserCardProps {
  user: User;
  currentUserRole: UserRole;
  onEdit: (id: string, name: string) => Promise<void>;
  onDelete: (id: string, name: string) => Promise<void>;
  onToggleStatus: (id: string, isActive: boolean) => Promise<void>;
  onViewDetails?: (user: User) => void;
}

// Оптимизированные константы вне компонента
const ROLE_STYLES = {
  'super-admin': { bg: 'bg-purple-500', text: 'text-white', label: 'Супер' },
  'admin': { bg: 'bg-red-500', text: 'text-white', label: 'Админ' },
  'manager': { bg: 'bg-blue-500', text: 'text-white', label: 'Менеджер' },
  'trainer': { bg: 'bg-green-500', text: 'text-white', label: 'Тренер' },
  'member': { bg: 'bg-gray-500', text: 'text-white', label: 'Участник' },
  'client': { bg: 'bg-orange-500', text: 'text-white', label: 'Клиент' }
} as const;

// Функция для получения инициалов
const getInitials = (name: string): string => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

// Функция форматирования последнего входа
const formatLastLogin = (timestamp?: number | null): string => {
  if (!timestamp) return 'Никогда';
  const now = Date.now();
  const diff = now - timestamp;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (days === 0) return 'Сегодня';
  if (days === 1) return 'Вчера';
  if (days < 7) return `${days}д`;
  if (days < 30) return `${Math.floor(days / 7)}н`;
  if (days < 365) return `${Math.floor(days / 30)}м`;
  return `${Math.floor(days / 365)}г`;
};

// Компонент аватара - отдельный мемоизированный компонент
const UserAvatar = memo(({ name, photoUrl }: { name: string; photoUrl?: string | null }) => {
  const initials = getInitials(name);
  
  if (photoUrl) {
    return (
      <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100">
        <img 
          src={photoUrl} 
          alt={name}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            e.currentTarget.nextElementSibling?.classList.remove('hidden');
          }}
        />
        <div className="hidden w-full h-full bg-gradient-to-br from-gray-600 to-gray-800 md:flex items-center justify-center text-white font-medium">
          {initials}
        </div>
      </div>
    );
  }
  
  return (
    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center text-white font-medium">
      {initials}
    </div>
  );
});

UserAvatar.displayName = 'UserAvatar';

// Основной компонент карточки
export const UserCard = memo<UserCardProps>(({ 
  user, 
  currentUserRole, 
  onEdit, 
  onDelete, 
  onToggleStatus,
  onViewDetails
}) => {
  // Проверка прав доступа
  const canManage = currentUserRole === 'super-admin' || 
    (currentUserRole === 'admin' && user.role !== 'super-admin' && user.role !== 'admin');
  
  const roleStyle = ROLE_STYLES[user.role as keyof typeof ROLE_STYLES] || ROLE_STYLES.member;
  const lastLogin = formatLastLogin(user.lastLogin);

  // Оптимизированные обработчики
  const handleEdit = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(user.id, user.name);
  }, [user.id, user.name, onEdit]);

  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(user.id, user.name);
  }, [user.id, user.name, onDelete]);

  const handleToggle = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleStatus(user.id, !user.isActive);
  }, [user.id, user.isActive, onToggleStatus]);

  const handleViewDetails = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onViewDetails?.(user);
  }, [user, onViewDetails]);

  return (
    <div className="group relative bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 hover:border-gray-200">
      {/* Статус индикатор */}
      <div className={cn(
        "absolute top-3 right-3 w-2 h-2 rounded-full",
        user.isActive ? "bg-green-500" : "bg-gray-300"
      )} />

      {/* Основной контент */}
      <div className="flex items-start gap-3">
        <UserAvatar name={user.name} photoUrl={user.photoUrl} />
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">
            {user.name}
          </h3>
          <p className="text-sm text-gray-500 truncate">
            {user.email}
          </p>
          
          {/* Роль и последний вход */}
          <div className="flex items-center gap-2 mt-2">
            <span className={cn(
              "inline-flex px-2 py-0.5 text-xs font-medium rounded-md",
              roleStyle.bg,
              roleStyle.text
            )}>
              {roleStyle.label}
            </span>
            <span className="text-xs text-gray-400">
              Вход: {lastLogin}
            </span>
          </div>
        </div>

        {/* Меню действий */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-1 rounded-lg hover:bg-gray-100 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100">
              <MoreVertical className="h-4 w-4 text-gray-500" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {onViewDetails && (
              <>
                <DropdownMenuItem onClick={handleViewDetails}>
                  <Eye className="h-4 w-4 mr-2" />
                  Подробнее
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            
            {canManage && (
              <>
                <DropdownMenuItem onClick={handleEdit}>
                  <Edit className="h-4 w-4 mr-2" />
                  Редактировать
                </DropdownMenuItem>
                
                <DropdownMenuItem onClick={handleToggle}>
                  {user.isActive ? (
                    <>
                      <XCircle className="h-4 w-4 mr-2" />
                      Деактивировать
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Активировать
                    </>
                  )}
                </DropdownMenuItem>
              </>
            )}
            
            <DropdownMenuItem 
              onClick={(e) => {
                e.stopPropagation();
                window.open(`mailto:${user.email}`);
              }}
            >
              <Mail className="h-4 w-4 mr-2" />
              Написать
            </DropdownMenuItem>
            
            {canManage && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleDelete}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Удалить
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
});

UserCard.displayName = 'UserCard';