// app/admin/users/components/VirtualizedUserGrid.tsx
"use client";

import React, { useMemo, useCallback } from 'react';
import { FixedSizeGrid as Grid } from 'react-window';
import { UserCard } from './UserCard';
import { User, UserRole } from '@/types/user';

interface VirtualizedUserGridProps {
  users: User[];
  containerWidth: number;
  containerHeight: number;
  currentUserRole: UserRole;
  onEdit: (id: string, name: string) => Promise<void>;
  onDelete: (id: string, name: string) => Promise<void>;
  onToggleStatus: (id: string, isActive: boolean) => Promise<void>;
  onViewDetails?: (user: User) => void; // Добавлен опциональный пропс
}

// Оптимизированные константы
const CARD_WIDTH = 320;
const CARD_HEIGHT = 120; // Уменьшена высота для новой оптимизированной карточки
const GAP = 16; // Уменьшен отступ

export const VirtualizedUserGrid = React.memo(({ 
  users, 
  containerWidth, 
  containerHeight,
  currentUserRole,
  onEdit,
  onDelete,
  onToggleStatus,
  onViewDetails
}: VirtualizedUserGridProps) => {
  // Вычисляем количество колонок и строк
  const { columnCount, rowCount } = useMemo(() => {
    const cols = Math.max(1, Math.floor((containerWidth + GAP) / (CARD_WIDTH + GAP)));
    const rows = Math.ceil(users.length / cols);
    return { columnCount: cols, rowCount: rows };
  }, [containerWidth, users.length]);

  // Оптимизированный компонент ячейки
  const Cell = useCallback(({ columnIndex, rowIndex, style }: any) => {
    const index = rowIndex * columnCount + columnIndex;
    const user = users[index];

    if (!user) return null;

    return (
      <div style={{
        ...style,
        padding: GAP / 2,
        boxSizing: 'border-box'
      }}>
        <UserCard 
          user={user}
          currentUserRole={currentUserRole}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleStatus={onToggleStatus}
          onViewDetails={onViewDetails}
        />
      </div>
    );
  }, [users, columnCount, currentUserRole, onEdit, onDelete, onToggleStatus, onViewDetails]);

  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <div className="w-16 h-16 mb-4 rounded-full bg-gray-100 flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <p className="text-gray-500 font-medium">Пользователи не найдены</p>
        <p className="text-sm text-gray-400 mt-1">Попробуйте изменить фильтры поиска</p>
      </div>
    );
  }

  return (
    <Grid
      className="scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
      columnCount={columnCount}
      columnWidth={CARD_WIDTH + GAP}
      height={containerHeight}
      rowCount={rowCount}
      rowHeight={CARD_HEIGHT + GAP}
      width={containerWidth}
      overscanRowCount={2}
      overscanColumnCount={1}
      itemData={users}
    >
      {Cell}
    </Grid>
  );
});

VirtualizedUserGrid.displayName = 'VirtualizedUserGrid';