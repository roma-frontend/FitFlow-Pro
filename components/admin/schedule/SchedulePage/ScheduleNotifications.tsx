// components/admin/schedule/SchedulePage/ScheduleNotifications.tsx
import React, { memo } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { X, AlertTriangle, Info, Bug } from "lucide-react";

interface ScheduleNotificationsProps {
  isApiAvailable: boolean;
  mutationError: string | null;
  onClearError: () => void;
  isDevelopment: boolean;
  debugInfo: {
    eventsCount: number;
    trainersCount: number;
    clientsCount: number;
    isMutationLoading: boolean;
    lastEvent?: any;
  };
}

export const ScheduleNotifications = memo(function ScheduleNotifications({
  isApiAvailable,
  mutationError,
  onClearError,
  isDevelopment,
  debugInfo,
}: ScheduleNotificationsProps) {
  return (
    <div className="py-4 space-y-4">
      {/* API Status Warning */}
      {!isApiAvailable && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <strong>Внимание:</strong> API недоступен. Работаем с локальными данными. 
            Изменения могут не сохраниться при перезагрузке страницы.
          </AlertDescription>
        </Alert>
      )}

      {/* Mutation Error */}
      {mutationError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{mutationError}</span>
            <Button
              onClick={onClearError}
              variant="ghost"
              size="sm"
              className="h-auto p-1 text-red-600 hover:text-red-700"
            >
              <X className="h-4 w-4" />
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Development Debug Info */}
      {isDevelopment && (
        <Alert className="border-blue-200 bg-blue-50">
          <Bug className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <div className="flex items-center justify-between">
              <div>
                <strong>Debug:</strong> События: {debugInfo.eventsCount}, 
                Тренеры: {debugInfo.trainersCount}, 
                Клиенты: {debugInfo.clientsCount}
                {debugInfo.isMutationLoading && " | Загрузка..."}
              </div>
              <details className="text-xs">
                <summary className="cursor-pointer">Подробности</summary>
                <pre className="mt-2 text-xs bg-blue-100 p-2 rounded">
                  {JSON.stringify(debugInfo, null, 2)}
                </pre>
              </details>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Success notification for API availability */}
      {isApiAvailable && (
        <Alert className="border-green-200 bg-green-50">
          <Info className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Система работает в штатном режиме. Все изменения сохраняются автоматически.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
});
