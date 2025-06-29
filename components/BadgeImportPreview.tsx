// components/admin/BadgeImportPreview.tsx
"use client";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import BadgeIcon from '@/components/ui/BadgeIcon';
import type { BadgeFormData } from '@/types/badge';

interface BadgeImportPreviewProps {
  settings: BadgeFormData[];
  validationErrors: string[];
  onConfirm: () => void;
  onCancel: () => void;
  isProcessing?: boolean;
}

export function BadgeImportPreview({
  settings,
  validationErrors,
  onConfirm,
  onCancel,
  isProcessing = false
}: BadgeImportPreviewProps) {
  const hasErrors = validationErrors.length > 0;

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {hasErrors ? (
            <XCircle className="h-5 w-5 text-red-500" />
          ) : (
            <CheckCircle className="h-5 w-5 text-green-500" />
          )}
          Предварительный просмотр импорта
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Ошибки валидации */}
        {hasErrors && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <span className="font-medium text-red-800">Ошибки валидации:</span>
            </div>
            <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Статистика импорта */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-700">{settings.length}</div>
            <div className="text-sm text-blue-600">Настроек к импорту</div>
          </div>
          <div className="p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-700">
              {settings.filter(s => s.badgeEnabled).length}
            </div>
            <div className="text-sm text-green-600">Будут включены</div>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-700">
              {new Set(settings.map(s => s.badgeVariant)).size}
            </div>
            <div className="text-sm text-gray-600">Типов badge</div>
          </div>
        </div>

        {/* Список настроек для импорта */}
        {!hasErrors && settings.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">Настройки для импорта:</h4>
            <div className="max-h-64 overflow-y-auto space-y-2">
              {settings.map((setting, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                        <span className="text-xs font-medium text-blue-700">
                          {index + 1}
                        </span>
                      </div>
                      {setting.badgeEnabled && (
                        <BadgeIcon
                          variant={setting.badgeVariant}
                          text={setting.badgeText || ""}
                          size="sm"
                        />
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-sm">{setting.navigationItemHref}</div>
                      <div className="text-xs text-gray-600">
                        {setting.badgeVariant} • Приоритет: {setting.priority}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={setting.badgeEnabled ? "default" : "secondary"}>
                      {setting.badgeEnabled ? "Включен" : "Выключен"}
                    </Badge>
                    {setting.targetRoles && setting.targetRoles.length > 0 && (
                      <Badge variant="outline" className="text-xs">
                        Роли: {setting.targetRoles.length}
                      </Badge>
                    )}
                    {setting.targetDevices && setting.targetDevices.length > 0 && (
                      <Badge variant="outline" className="text-xs">
                        Устройства: {setting.targetDevices.length}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Кнопки действий */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onCancel} disabled={isProcessing}>
            Отмена
          </Button>
          <Button
            onClick={onConfirm}
            disabled={hasErrors || isProcessing}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Импорт...
              </>
            ) : (
              `Импортировать ${settings.length} настроек`
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
