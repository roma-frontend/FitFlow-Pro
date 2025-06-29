// app/admin/users/components/VirtualizedUserGrid.tsx
"use client";

import React, { useMemo } from 'react';
import { FixedSizeGrid as Grid } from 'react-window';
import { UserCard } from './UserCard';
import { User, UserRole } from '@/types/user'; // Import UserRole type

interface VirtualizedUserGridProps {
  users: User[];
  containerWidth: number;
  containerHeight: number;
  currentUserRole: UserRole; // Use specific UserRole type instead of string
  onEdit: (id: string, name: string) => Promise<void>; // Match expected signature
  onDelete: (id: string, name: string) => Promise<void>; // Match expected signature  
  onToggleStatus: (id: string, isActive: boolean) => Promise<void>; // Match expected signature
}

const CARD_WIDTH = 320;
const CARD_HEIGHT = 280;
const GAP = 24;

export const VirtualizedUserGrid = React.memo(({ 
  users, 
  containerWidth, 
  containerHeight,
  currentUserRole,
  onEdit,
  onDelete,
  onToggleStatus
}: VirtualizedUserGridProps) => {
  const { columnCount, rowCount } = useMemo(() => {
    const cols = Math.floor((containerWidth + GAP) / (CARD_WIDTH + GAP));
    const rows = Math.ceil(users.length / cols);
    return { columnCount: cols, rowCount: rows };
  }, [containerWidth, users.length]);

  const Cell = React.memo(({ columnIndex, rowIndex, style }: any) => {
    const index = rowIndex * columnCount + columnIndex;
    const user = users[index];

    if (!user) return null;

    // Create wrapper functions that match the expected signatures
    const handleEdit = async (id: string, name: string) => {
      await onEdit(id, name);
    };

    const handleDelete = async (id: string, name: string) => {
      await onDelete(id, name);
    };

    const handleToggleStatus = async (id: string, isActive: boolean) => {
      await onToggleStatus(id, isActive);
    };

    return (
      <div style={{
        ...style,
        padding: GAP / 2,
      }}>
        <UserCard 
          user={user}
          currentUserRole={currentUserRole}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleStatus={handleToggleStatus}
        />
      </div>
    );
  });

  if (users.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Пользователи не найдены</p>
      </div>
    );
  }

  return (
    <Grid
      columnCount={columnCount}
      columnWidth={CARD_WIDTH + GAP}
      height={containerHeight}
      rowCount={rowCount}
      rowHeight={CARD_HEIGHT + GAP}
      width={containerWidth}
      overscanRowCount={2}
      overscanColumnCount={1}
    >
      {Cell}
    </Grid>
  );
});

VirtualizedUserGrid.displayName = 'VirtualizedUserGrid';
