// Обновленный MobileSettingsNavigation.tsx с улучшенным дизайном
"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { 
  Menu, 
  X, 
  ChevronRight, 
  Save, 
  Download, 
  Upload,
  RotateCcw,
  Settings,
  Zap,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileSettingsNavigationProps {
  hasUnsavedChanges: boolean;
  onSave: () => void;
  onImport: () => void;
  onExport: () => void;
  onReset: () => void;
  saving?: boolean;
}

export const MobileSettingsNavigation = ({
  hasUnsavedChanges,
  onSave,
  onImport,
  onExport,
  onReset,
  saving = false
}: MobileSettingsNavigationProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    {
      id: 'save',
      label: 'Сохранить изменения',
      icon: Save,
      action: onSave,
      variant: 'primary' as const,
      disabled: !hasUnsavedChanges || saving,
      badge: hasUnsavedChanges ? 'Есть изменения' : null,
      description: 'Применить все внесенные изменения'
    },
    {
      id: 'export',
      label: 'Экспорт настроек',
      icon: Download,
      action: onExport,
      variant: 'secondary' as const,
      disabled: saving,
      description: 'Скачать файл с текущими настройками'
    },
    {
      id: 'import',
      label: 'Импорт настроек',
      icon: Upload,
      action: onImport,
      variant: 'secondary' as const,
      disabled: saving,
      description: 'Загрузить настройки из файла'
    },
    {
      id: 'reset',
      label: 'Сбросить настройки',
      icon: RotateCcw,
      action: onReset,
      variant: 'destructive' as const,
      disabled: saving,
      description: 'Вернуть все настройки к значениям по умолчанию'
    }
  ];

  const handleAction = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <button
          className="group relative p-2.5 hover:bg-gray-100 rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95 hover:shadow-lg"
          aria-label="Меню действий"
        >
          <Menu className="h-5 w-5 text-gray-600 group-hover:text-gray-800 transition-colors" />
          {hasUnsavedChanges && (
            <div className="absolute -top-1 -right-1 h-3 w-3 bg-orange-500 rounded-full animate-pulse" />
          )}
        </button>
      </SheetTrigger>
      
      <SheetContent side="bottom" className="h-auto max-h-[80vh] rounded-t-2xl">
        <div className="space-y-6">
          {/* Заголовок с градиентом */}
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                <Settings className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Быстрые действия</h3>
                <p className="text-sm text-gray-500">Управление настройками</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* Статус */}
          {(hasUnsavedChanges || saving) && (
            <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-xl border border-orange-200">
              <Clock className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium text-orange-800">
                {saving ? 'Идет сохранение...' : 'У вас есть несохраненные изменения'}
              </span>
            </div>
          )}

          {/* Список действий с улучшенным дизайном */}
          <div className="space-y-3">
            {actions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.id}
                  onClick={() => handleAction(action.action)}
                  disabled={action.disabled}
                  className={cn(
                    "w-full flex items-center justify-between p-4 rounded-xl text-left transition-all duration-200",
                    "border-2 border-transparent hover:border-gray-200",
                    "transform hover:scale-[1.02] active:scale-[0.98]",
                    action.variant === 'primary' && !action.disabled && 
                      "bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 text-blue-700",
                    action.variant === 'secondary' && !action.disabled && 
                      "bg-gray-50 hover:bg-gray-100 text-gray-700",
                    action.variant === 'destructive' && !action.disabled && 
                      "bg-red-50 hover:bg-red-100 text-red-700 border-red-200",
                    action.disabled && "opacity-50 cursor-not-allowed bg-gray-50"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "p-2 rounded-lg",
                      action.variant === 'primary' && "bg-blue-100",
                      action.variant === 'secondary' && "bg-gray-100",
                      action.variant === 'destructive' && "bg-red-100"
                    )}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold">{action.label}</div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {action.description}
                      </div>
                      {action.badge && (
                        <Badge variant="secondary" className="mt-2 text-xs">
                          {action.badge}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </button>
              );
            })}
          </div>

          {/* Футер */}
          <div className="flex items-center justify-center gap-2 pt-4 border-t border-gray-100">
            <Zap className="h-4 w-4 text-blue-500" />
            <span className="text-sm text-gray-500">
                            {saving ? 'Обработка...' : 'Готово к работе'}
            </span>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

