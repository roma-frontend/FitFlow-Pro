// components/messages/BulkActions.tsx (исправленная версия)
import React from 'react';

interface BulkActionsProps {
  selectedCount: number;
  onMarkAsRead: () => void;
  onArchive: () => void;
  onDelete: () => void;
  onExport: () => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
}

export function BulkActions({
  selectedCount,
  onMarkAsRead,
  onArchive,
  onDelete,
  onExport,
  onSelectAll,
  onDeselectAll
}: BulkActionsProps) {
  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-40">
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium">
          Выбрано: {selectedCount}
        </span>

        <div className="flex items-center gap-2">
          <button
            onClick={onMarkAsRead}
            className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
            title="Отметить как прочитанное"
          >
            Прочитано
          </button>

          <button
            onClick={onArchive}
            className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            title="Архивировать"
          >
            Архив
          </button>

          <button
            onClick={onExport}
            className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200"
            title="Экспортировать выбранные"
          >
            Экспорт
          </button>

          <button
            onClick={onDelete}
            className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
            title="Удалить"
          >
            Удалить
          </button>

          <div className="border-l border-gray-300 h-6 mx-2"></div>

          <button
            onClick={onSelectAll}
            className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
            title="Выбрать все"
          >
            Все
          </button>

          <button
            onClick={onDeselectAll}
            className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
            title="Снять выделение"
          >
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
}
