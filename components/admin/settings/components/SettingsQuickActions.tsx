// components/admin/settings/components/SettingsQuickActions.tsx (обновленная версия с Badge)
"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Save,
  Download,
  Upload,
  RotateCcw,
  Clock,
  CheckCircle,
  AlertCircle,
  Zap,
  Badge as BadgeIcon, // ✅ Добавлен импорт
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdaptiveSettings } from "@/hooks/useAdaptiveSettings";

interface QuickAction {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
  variant: "primary" | "secondary" | "destructive" | "badge";
  disabled?: boolean;
  badge?: string;
  description?: string;
}

interface SettingsQuickActionsProps {
  hasUnsavedChanges: boolean;
  lastSaved?: Date | null;
  onSave: () => void;
  onImport: () => void;
  onExport: () => void;
  onReset: () => void;
  saving?: boolean;
  className?: string;
}

export const SettingsQuickActions = ({
  hasUnsavedChanges,
  lastSaved,
  onSave,
  onImport,
  onExport,
  onReset,
  saving = false,
  className,
}: SettingsQuickActionsProps) => {
  const { isMobile, isTablet } = useAdaptiveSettings();
  const [lastAction, setLastAction] = useState<string | null>(null);
  const router = useRouter();

  const handleAction = (actionId: string, action: () => void) => {
    setLastAction(actionId);
    action();
    setTimeout(() => setLastAction(null), 2000);
  };

  // ✅ Обработчик для Badge Management
  const handleBadgeManagement = () => {
    router.push("/admin/header-badges");
  };

  const formatLastSaved = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return "только что";
    if (minutes < 60) return `${minutes} мин назад`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} ч назад`;

    return date.toLocaleDateString();
  };

  const quickActions: QuickAction[] = [
    {
      id: "save",
      label: isMobile ? "Сохранить" : "Сохранить изменения",
      icon: Save,
      action: () => handleAction("save", onSave),
      variant: "primary",
      disabled: !hasUnsavedChanges || saving,
      badge: hasUnsavedChanges ? "Есть изменения" : undefined,
      description: "Сохранить текущие настройки",
    },
    // ✅ Добавлена кнопка Badge Management
    {
      id: "badge",
      label: isMobile ? "Badge" : "Управление Badge",
      icon: BadgeIcon,
      action: () => handleAction("badge", handleBadgeManagement),
      variant: "badge",
      disabled: saving,
      badge: "NEW",
      description: "Настройка значков навигации",
    },
    {
      id: "export",
      label: isMobile ? "Экспорт" : "Экспорт настроек",
      icon: Download,
      action: () => handleAction("export", onExport),
      variant: "secondary",
      disabled: saving,
      description: "Скачать конфигурацию",
    },
    {
      id: "import",
      label: isMobile ? "Импорт" : "Импорт настроек",
      icon: Upload,
      action: () => handleAction("import", onImport),
      variant: "secondary",
      disabled: saving,
      description: "Загрузить конфигурацию",
    },
    {
      id: "reset",
      label: isMobile ? "Сброс" : "Сбросить настройки",
      icon: RotateCcw,
      action: () => handleAction("reset", onReset),
      variant: "destructive",
      disabled: saving,
      description: "Вернуть к умолчанию",
    },
  ];

  return (
    <Card className={cn("w-full", className)}>
      <CardContent className={cn("space-y-4", isMobile ? "p-4" : "p-6")}>
        {/* Статус последнего сохранения */}
        {lastSaved && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="h-4 w-4" />
            <span>Последнее сохранение: {formatLastSaved(lastSaved)}</span>
            {hasUnsavedChanges ? (
              <AlertCircle className="h-4 w-4 text-orange-500" />
            ) : (
              <CheckCircle className="h-4 w-4 text-green-500" />
            )}
          </div>
        )}

        {/* Быстрые действия */}
        <div
          className={cn(
            "grid gap-3",
            isMobile ? "grid-cols-1" : isTablet ? "grid-cols-2" : "grid-cols-3"
          )}
        >
          {quickActions.map((action) => {
            const Icon = action.icon;
            const isRecentAction = lastAction === action.id;

            return (
              <Button
                key={action.id}
                variant={
                  action.variant === "primary"
                    ? "destructiveGlass"
                    : action.variant === "destructive"
                      ? "destructiveMinimal"
                      : action.variant === "badge"
                        ? "outline"
                        : "outline"
                }
                onClick={() => action.action()}
                disabled={action.disabled}
                className={cn(
                  "relative h-auto flex-col gap-2 transition-all duration-200",
                  isMobile ? "p-4" : "p-3",
                  action.variant === "primary" &&
                    "bg-green-600 hover:bg-green-700",
                  // ✅ Специальный стиль для Badge кнопки
                  action.variant === "badge" &&
                    "border-purple-300 text-purple-700 hover:bg-purple-50 hover:border-purple-400",
                  isRecentAction && "ring-2 ring-green-500/50 bg-green-50",
                  action.disabled && "opacity-50 cursor-not-allowed"
                )}
              >
                {/* Иконка и лейбл */}
                <div className="flex items-center gap-2">
                  <Icon
                    className={cn(
                      "flex-shrink-0",
                      isMobile ? "h-5 w-5" : "h-4 w-4",
                      action.variant === "badge" && "text-purple-600"
                    )}
                  />
                  <span
                    className={cn(
                      "font-medium truncate",
                      isMobile ? "text-sm" : "text-xs"
                    )}
                  >
                    {action.label}
                  </span>
                </div>

                {/* Бейдж */}
                {action.badge && (
                  <Badge
                    variant="special"
                    className={cn(
                      "absolute -top-1 -right-1 text-xs",
                      action.variant === "primary" &&
                        "bg-orange-100 text-orange-700",
                      // ✅ Стиль для Badge кнопки
                      action.variant === "badge" &&
                        "bg-purple-100 text-purple-700 animate-pulse"
                    )}
                  >
                    {action.badge}
                  </Badge>
                )}

                {/* Описание для больших экранов */}
                {!isMobile && action.description && (
                    <div className="flex-1 flex items-center justify-center text-wrap">
                      <span 
                        className={cn(
                          "text-xs text-center leading-tight max-w-full px-1",
                          action.variant === "primary" && "text-blue-100",
                          action.variant === "badge" && "text-purple-500",
                          action.variant === "destructive" && "text-red-600",
                          action.variant === "secondary" && "text-gray-500",
                          isRecentAction && "text-green-700"
                        )}
                      >
                        {action.description}
                      </span>
                    </div>
                  )}

                {/* Индикатор недавнего действия */}
                {isRecentAction && (
                  <div className="absolute inset-0 flex items-center justify-center bg-green-500/10 rounded-md">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                )}
              </Button>
            );
          })}
        </div>

        {/* Индикатор производительности */}
        {!isMobile && (
          <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
            <div className="flex items-center gap-1">
              <Zap className="h-3 w-3" />
              <span>Быстрые действия</span>
            </div>
            <span>{saving ? "Обработка..." : "Готово к работе"}</span>
          </div>
        )}

        {/* ✅ Дополнительная информация о Badge Management */}
        {!isMobile && (
          <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
            <div className="flex items-center gap-2 text-sm text-purple-800">
              <BadgeIcon className="h-4 w-4" />
              <span className="font-medium">Badge Management</span>
            </div>
            <p className="text-xs text-purple-600 mt-1">
              Создавайте персонализированные значки для навигации с таргетингом
              по ролям и устройствам
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
