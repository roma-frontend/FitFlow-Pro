"use client";

import { CheckCircle, RefreshCw, AlertTriangle } from "lucide-react";

interface GlobalNotificationsProps {
  lastSync: Date | null;
  scheduleLoading: boolean;
  scheduleError: any;
  roleTexts: any;
}

export function GlobalNotifications({
  lastSync,
  scheduleLoading,
  scheduleError,
  roleTexts
}: GlobalNotificationsProps) {
  return (
    <>
      {/* Уведомление об успешном обновлении */}
      {lastSync && (
        <div className="fixed bottom-8 left-4 z-50 animate-fade-in">
          <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg shadow-lg text-sm border border-green-200">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              {roleTexts.successMessages?.dataUpdated || 'Данные обновлены'}
            </div>
          </div>
        </div>
      )}

      {/* Индикатор загрузки */}
      {scheduleLoading && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg shadow-lg text-sm border border-blue-200">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4 animate-spin" />
              Синхронизация данных...
            </div>
          </div>
        </div>
      )}

      {/* Индикатор ошибки */}
      {scheduleError && (
        <div className="fixed bottom-4 left-4 z-50">
          <div className="bg-red-100 text-red-800 px-4 py-2 rounded-lg shadow-lg text-sm border border-red-200">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Ошибка загрузки данных
            </div>
          </div>
        </div>
      )}
    </>
  );
}
