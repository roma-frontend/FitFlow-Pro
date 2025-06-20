// app/admin/users/components/tabs/UsersTab.tsx
"use client";

import React from 'react';
import { UserStats } from '../UserStats';
import { UserFilters } from '../UserFilters';
import { UserGrid } from '../UserGrid';
import { BulkActions } from '../BulkActions';
import { useUsersPage } from '../../providers/UsersPageProvider';

export const UsersTab = React.memo(() => {
  const { state, filteredUsers, actions } = useUsersPage();

  return (
    <div className="space-y-8">
      {/* Статистика */}
      <UserStats users={state.users} />

      {/* Фильтры */}
      <UserFilters />

      {/* Массовые действия */}
      {state.selectedUsers.size > 0 && (
        <BulkActions />
      )}

      {/* Список пользователей */}
      <UserGrid users={filteredUsers} />
    </div>
  );
});

UsersTab.displayName = 'UsersTab';
