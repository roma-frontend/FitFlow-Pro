// components/messages/ExportDialog.tsx (исправленная версия)
import React, { useState } from 'react';
import { X, Download } from 'lucide-react';

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  messages: any[];
  selectedCount: number;
  totalCount: number;
  unreadCount: number;
  archivedCount: number;
  onExport: (format: string, options: any) => void;
}

export function ExportDialog({
  isOpen,
  onClose,
  messages,
  selectedCount,
  totalCount,
  unreadCount,
  archivedCount,
  onExport
}: ExportDialogProps) {
  const [format, setFormat] = useState('csv');
  const [period, setPeriod] = useState('all');
  const [includeTypes, setIncludeTypes] = useState({
    direct: true,
    announcement: true,
    notification: true
  });

  if (!isOpen) return null;

  const handleExport = () => {
    onExport(format, {
      period,
      includeTypes,
      selectedOnly: selectedCount > 0
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Экспорт сообщений</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Формат экспорта
              </label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="csv">CSV</option>
                <option value="json">JSON</option>
                <option value="pdf">PDF</option>
                <option value="xlsx">Excel</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Период
              </label>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Все сообщения</option>
                <option value="today">Сегодня</option>
                <option value="last7days">Последние 7 дней</option>
                <option value="last30days">Последние 30 дней</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Тип сообщений
              </label>
              <div className="space-y-2">
                {Object.entries(includeTypes).map(([type, checked]) => (
                  <label key={type} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => setIncludeTypes(prev => ({
                        ...prev,
                        [type]: e.target.checked
                      }))}
                      className="mr-2"
                    />
                    {type === 'direct' && 'Личные сообщения'}
                    {type === 'announcement' && 'Объявления'}
                    {type === 'notification' && 'Уведомления'}
                  </label>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">
                <p className="font-medium mb-2">Статистика экспорта:</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p>
                      Всего сообщений:{" "}
                      <span className="font-medium">{totalCount}</span>
                    </p>
                    <p>
                      Выбрано:{" "}
                      <span className="font-medium">
                        {selectedCount || totalCount}
                      </span>
                    </p>
                  </div>
                  <div>
                    <p>
                      Непрочитанных:{" "}
                      <span className="font-medium">{unreadCount}</span>
                    </p>
                    <p>
                      Архивных:{" "}
                      <span className="font-medium">{archivedCount}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-4 border-t">
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Download className="h-4 w-4" />
                Экспортировать
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
