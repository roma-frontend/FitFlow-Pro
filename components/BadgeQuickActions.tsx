// components/admin/BadgeQuickActions.tsx (исправленная версия)
"use client";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Zap, 
  Eye, 
  EyeOff, 
  Trash2, 
  Copy, 
  RefreshCw,
  TrendingUp,
  Clock,
  X,
  CheckSquare
} from 'lucide-react';
import type { HeaderBadgeSetting } from '@/types/badge';
import { settingToFormData } from '@/utils/badgeUtils';
import { useHeaderBadgeManagement } from '@/hooks/useHeaderBadgeManagement';

interface BadgeQuickActionsProps {
  selectedIds: string[];
  onRefresh: () => void;
  onSelectionChange: (ids: string[]) => void;
}

export function BadgeQuickActions({
  selectedIds,
  onRefresh,
  onSelectionChange
}: BadgeQuickActionsProps) {
  const { 
    allSettings, 
    updateBadgeSetting, 
    deleteBadgeSetting,
    createBadgeSetting 
  } = useHeaderBadgeManagement();

  // ✅ Исправлена типизация фильтрации
  const selectedSettings = allSettings?.filter((s: HeaderBadgeSetting) => 
    selectedIds.includes(s._id)
  ) || [];

  // Быстрые действия
  const quickActions = [
    {
      id: 'enable-all',
      label: 'Включить все',
      icon: <Eye className="h-4 w-4" />,
      color: 'green',
      action: async () => {
        if (!updateBadgeSetting) return;
        
        for (const setting of selectedSettings) {
          const formData = settingToFormData(setting);
          await updateBadgeSetting({
            id: setting._id,
            updates: { ...formData, badgeEnabled: true },
            updatedBy: "current-user-id"
          });
        }
        onRefresh();
      },
      disabled: selectedIds.length === 0
    },
    {
      id: 'disable-all',
      label: 'Выключить все',
      icon: <EyeOff className="h-4 w-4" />,
      color: 'gray',
      action: async () => {
        if (!updateBadgeSetting) return;
        
        for (const setting of selectedSettings) {
          const formData = settingToFormData(setting);
          await updateBadgeSetting({
            id: setting._id,
            updates: { ...formData, badgeEnabled: false },
            updatedBy: "current-user-id"
          });
        }
        onRefresh();
      },
      disabled: selectedIds.length === 0
    },
    {
      id: 'duplicate',
      label: 'Дублировать',
      icon: <Copy className="h-4 w-4" />,
      color: 'blue',
      action: async () => {
        if (!createBadgeSetting) return;
        
        for (const setting of selectedSettings) {
          const formData = settingToFormData(setting);
          const duplicateData = {
            ...formData,
            navigationItemHref: formData.navigationItemHref + '-copy',
            badgeEnabled: false,
            priority: formData.priority + 1,
            createdBy: "current-user-id"
          };
          
          await createBadgeSetting(duplicateData);
        }
        onSelectionChange([]);
        onRefresh();
      },
      disabled: selectedIds.length === 0
    },
    {
      id: 'delete-all',
      label: 'Удалить все',
      icon: <Trash2 className="h-4 w-4" />,
      color: 'red',
      action: async () => {
        if (!deleteBadgeSetting) return;
        
        if (confirm(`Удалить ${selectedIds.length} настроек?`)) {
          for (const setting of selectedSettings) {
            await deleteBadgeSetting({ id: setting._id });
          }
          onSelectionChange([]);
          onRefresh();
        }
      },
      disabled: selectedIds.length === 0
    }
  ];

  // ✅ Исправлена типизация статистики
  const selectedStats = {
    total: selectedIds.length,
    enabled: selectedSettings.filter((s: HeaderBadgeSetting) => s.badgeEnabled).length,
    disabled: selectedSettings.filter((s: HeaderBadgeSetting) => !s.badgeEnabled).length,
    totalClicks: selectedSettings.reduce((sum: number, s: HeaderBadgeSetting) => 
      sum + (s.analytics?.clicks || 0), 0
    ),
    totalImpressions: selectedSettings.reduce((sum: number, s: HeaderBadgeSetting) => 
      sum + (s.analytics?.impressions || 0), 0
    )
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Быстрые действия
          {selectedIds.length > 0 && (
            <Badge variant="secondary" className="ml-auto">
              {selectedIds.length} выбрано
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Статистика по выбранным */}
        {selectedIds.length > 0 && (
          <div className="p-3 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Выбранные настройки</h4>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-center">
              <div className="p-2 bg-white rounded">
                <div className="text-lg font-semibold text-blue-700">
                  {selectedStats.total}
                </div>
                <div className="text-xs text-blue-600">Всего</div>
              </div>
              <div className="p-2 bg-white rounded">
                <div className="text-lg font-semibold text-green-700">
                  {selectedStats.enabled}
                </div>
                <div className="text-xs text-green-600">Включено</div>
              </div>
              <div className="p-2 bg-white rounded">
                <div className="text-lg font-semibold text-gray-700">
                  {selectedStats.disabled}
                </div>
                <div className="text-xs text-gray-600">Выключено</div>
              </div>
              <div className="p-2 bg-white rounded">
                <div className="text-lg font-semibold text-purple-700">
                  {selectedStats.totalImpressions}
                </div>
                <div className="text-xs text-purple-600">Показов</div>
              </div>
              <div className="p-2 bg-white rounded">
                <div className="text-lg font-semibold text-orange-700">
                  {selectedStats.totalClicks}
                </div>
                <div className="text-xs text-orange-600">Кликов</div>
              </div>
            </div>
          </div>
        )}

        {/* Кнопки быстрых действий */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {quickActions.map((action) => (
            <Button
              key={action.id}
              variant="outline"
              size="sm"
              onClick={action.action}
              disabled={action.disabled}
              className={`flex items-center gap-2 ${
                action.color === 'green' ? 'text-green-600 hover:text-green-700' :
                action.color === 'red' ? 'text-red-600 hover:text-red-700' :
                action.color === 'blue' ? 'text-blue-600 hover:text-blue-700' :
                'text-gray-600 hover:text-gray-700'
              }`}
            >
              {action.icon}
              {action.label}
            </Button>
          ))}
        </div>

        {/* Дополнительные действия */}
        <div className="pt-3 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefresh}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Обновить
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSelectionChange([])}
              disabled={selectedIds.length === 0}
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Снять выбор
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (allSettings) {
                  onSelectionChange(allSettings.map((s: HeaderBadgeSetting) => s._id));
                }
              }}
              className="flex items-center gap-2"
            >
              <CheckSquare className="h-4 w-4" />
              Выбрать все
            </Button>
          </div>
        </div>

        {/* Предустановленные фильтры */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Быстрые фильтры</h4>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (allSettings) {
                  const activeIds = allSettings
                    .filter((s: HeaderBadgeSetting) => s.isActive && s.badgeEnabled)
                    .map((s: HeaderBadgeSetting) => s._id);
                  onSelectionChange(activeIds);
                }
              }}
              className="text-xs"
            >
              <TrendingUp className="h-3 w-3 mr-1" />
              Активные
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (allSettings) {
                  const expiredIds = allSettings
                    .filter((s: HeaderBadgeSetting) => 
                      s.validTo && s.validTo < Date.now()
                    )
                    .map((s: HeaderBadgeSetting) => s._id);
                  onSelectionChange(expiredIds);
                }
              }}
              className="text-xs"
            >
              <Clock className="h-3 w-3 mr-1" />
              Истекшие
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (allSettings) {
                  const highPriorityIds = allSettings
                    .filter((s: HeaderBadgeSetting) => s.priority <= 2)
                    .map((s: HeaderBadgeSetting) => s._id);
                  onSelectionChange(highPriorityIds);
                }
              }}
              className="text-xs"
            >
              <Zap className="h-3 w-3 mr-1" />
              Высокий приоритет
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
