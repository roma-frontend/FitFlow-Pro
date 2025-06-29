// components/messages/BulkActions.tsx
import React, { memo } from 'react';
import { Button } from '@/components/ui/button';

interface BulkActionsProps {
  selectedCount: number;
  onMarkAsRead: () => void;
  onArchive: () => void;
  onDelete: () => void;
  onExport: () => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  isMobile: boolean;
}

const BulkActions: React.FC<BulkActionsProps> = memo(({
  selectedCount,
  onMarkAsRead,
  onArchive,
  onDelete,
  onExport,
  onSelectAll,
  onDeselectAll,
  isMobile
}) => {
  return (
    <div className={`
      fixed ${isMobile ? "bottom-0 left-0 right-0" : "sticky bottom-4 left-4 right-4"} 
      z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-3
      transition-all duration-300
    `}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm font-medium">
          Выбрано: <span className="font-bold">{selectedCount}</span> сообщ.
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={onMarkAsRead}>
            Прочитано
          </Button>
          <Button variant="outline" size="sm" onClick={onArchive}>
            Архив
          </Button>
          <Button variant="destructive" size="sm" onClick={onDelete}>
            Удалить
          </Button>
          
          {!isMobile && (
            <Button variant="secondary" size="sm" onClick={onExport}>
              Экспорт
            </Button>
          )}
          
          <div className="flex gap-2 border-l border-gray-200 pl-2">
            <Button variant="ghost" size="sm" onClick={onSelectAll}>
              Выбрать все
            </Button>
            <Button variant="ghost" size="sm" onClick={onDeselectAll}>
              Отменить
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
});

export default BulkActions;