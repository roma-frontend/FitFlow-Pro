// app/admin/users/components/SmartUserGrid.tsx
"use client";

import React, { useMemo } from 'react';
import { User } from '@/types/user';
import { LazyUserGrid } from './LazyUserGrid';
import { useUsersPage } from '../providers/UsersPageProvider';
import { VirtualizedUserGrid } from '@/components/admin/users/VirtualizedUsersList';

interface SmartUserGridProps {
  users: User[];
}

// Пороговые значения для выбора стратегии отображения
const VIRTUALIZATION_THRESHOLD = 100; // Используем виртуализацию при > 100 пользователей
const SIMPLE_THRESHOLD = 20; // Простой рендеринг при < 20 пользователей

export const SmartUserGrid: React.FC<SmartUserGridProps> = ({ users }) => {
  const { state, actions } = useUsersPage();
  
  // Автоматический выбор стратегии отображения
  const renderStrategy = useMemo(() => {
    const count = users.length;
    
    if (count <= SIMPLE_THRESHOLD) {
      return 'simple';
    } else if (count > VIRTUALIZATION_THRESHOLD) {
      return 'virtualized';
    } else {
      return 'lazy';
    }
  }, [users.length]);

  // Общие обработчики
  const handleEdit = async (id: string, name: string) => {
    const user = users.find(u => u.id === id);
    if (user) {
      actions.setEditingUser(user);
      actions.setShowCreateDialog(true);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    await actions.deleteUser(id, name);
  };

  const handleToggleStatus = async (id: string, isActive: boolean) => {
    await actions.toggleUserStatus(id, isActive);
  };

  const handleViewDetails = (user: User) => {
    // Этот обработчик может быть реализован в родительском компоненте
    console.log('View details for:', user);
  };

  // Отладочная информация в development
  if (process.env.NODE_ENV === 'development') {
    console.log(`SmartUserGrid: Using ${renderStrategy} strategy for ${users.length} users`);
  }

  // Для виртуализированного списка нужны размеры контейнера
  if (renderStrategy === 'virtualized') {
    return (
      <div className="w-full h-[calc(100vh-200px)]">
        <VirtualizedUserGrid
          users={users}
          containerWidth={window.innerWidth - 64}
          containerHeight={window.innerHeight - 200}
          currentUserRole={state.userRole}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleStatus={handleToggleStatus}
          onViewDetails={handleViewDetails}
        />
      </div>
    );
  }

  // Для остальных случаев используем LazyUserGrid
  return <LazyUserGrid users={users} />;
};

SmartUserGrid.displayName = 'SmartUserGrid';