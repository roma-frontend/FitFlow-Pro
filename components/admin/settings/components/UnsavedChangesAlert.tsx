// components/admin/settings/components/UnsavedChangesAlert.tsx
"use client";

import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Save, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UnsavedChangesAlertProps {
  hasUnsavedChanges: boolean;
  isMobile?: boolean;
  onSave?: () => void;
  onDiscard?: () => void;
  className?: string;
}

export const UnsavedChangesAlert = ({
  hasUnsavedChanges,
  isMobile = false,
  onSave,
  onDiscard,
  className
}: UnsavedChangesAlertProps) => {
  if (!hasUnsavedChanges) return null;

  return (
    <Alert className={cn(
      "border-orange-200 bg-orange-50 text-orange-800",
      "transition-all duration-300 animate-in slide-in-from-top-2",
      className
    )}>
      <AlertTriangle className={cn(
        "text-orange-600",
        isMobile ? "h-4 w-4" : "h-5 w-5"
      )} />
      
      <div className="flex-1 min-w-0">
        <AlertDescription className={cn(
          "font-medium",
          isMobile ? "text-sm" : "text-base"
        )}>
          У вас есть несохраненные изменения
        </AlertDescription>
        
        {!isMobile && (
          <p className="text-sm text-orange-700 mt-1">
            Не забудьте сохранить изменения перед переходом на другую страницу
          </p>
        )}
      </div>

      {/* Кнопки действий */}
      {(onSave || onDiscard) && (
        <div className={cn(
          "flex gap-2 ml-4",
          isMobile && "flex-col w-20"
        )}>
          {onSave && (
            <Button
              size={isMobile ? "sm" : "default"}
              onClick={onSave}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              <Save className="h-4 w-4" />
              {!isMobile && <span className="ml-1">Сохранить</span>}
            </Button>
          )}
          
          {onDiscard && (
            <Button
              variant="outline"
              size={isMobile ? "sm" : "default"}
              onClick={onDiscard}
              className="border-orange-300 text-orange-700 hover:bg-orange-100"
            >
              <X className="h-4 w-4" />
              {!isMobile && <span className="ml-1">Отменить</span>}
            </Button>
          )}
        </div>
      )}
    </Alert>
  );
};
