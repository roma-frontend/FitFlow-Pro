// components/admin/settings/components/SettingsStatusIndicator.tsx
"use client";

import React from 'react';
import { CheckCircle, AlertTriangle, Clock, Wifi, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SettingsStatusIndicatorProps {
  hasUnsavedChanges: boolean;
  saving: boolean;
  lastSaved?: Date | null;
  isOnline?: boolean;
  className?: string;
}

export const SettingsStatusIndicator = ({
  hasUnsavedChanges,
  saving,
  lastSaved,
  isOnline = true,
  className
}: SettingsStatusIndicatorProps) => {
  const getStatus = () => {
    if (saving) return { icon: Clock, color: 'text-blue-500', text: 'Сохранение...' };
    if (hasUnsavedChanges) return { icon: AlertTriangle, color: 'text-orange-500', text: 'Есть изменения' };
    return { icon: CheckCircle, color: 'text-green-500', text: 'Все сохранено' };
  };

  const status = getStatus();
  const Icon = status.icon;

  const formatLastSaved = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'только что';
    if (minutes < 60) return `${minutes} мин назад`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} ч назад`;
    
    return date.toLocaleDateString();
  };

  return (
    <div className={cn("flex items-center gap-2 text-sm", className)}>
      {/* Статус сохранения */}
      <div className="flex items-center gap-1.5">
        <Icon className={cn("h-4 w-4", status.color, saving && "animate-spin")} />
        <span className={status.color}>{status.text}</span>
      </div>

      {/* Разделитель */}
      {lastSaved && (
        <>
          <div className="h-4 w-px bg-gray-300" />
          <div className="flex items-center gap-1.5 text-gray-500">
            <Clock className="h-3 w-3" />
            <span>Последнее: {formatLastSaved(lastSaved)}</span>
          </div>
        </>
      )}

      {/* Статус подключения */}
      <div className="flex items-center gap-1">
        {isOnline ? (
          <Wifi className="h-3 w-3 text-green-500" />
        ) : (
          <WifiOff className="h-3 w-3 text-red-500" />
        )}
      </div>
    </div>
  );
};
