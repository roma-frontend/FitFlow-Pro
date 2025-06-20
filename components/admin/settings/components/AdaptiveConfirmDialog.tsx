// components/admin/settings/components/AdaptiveConfirmDialog.tsx
"use client";

import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { useAdaptiveSettings } from '@/hooks/useAdaptiveSettings';

interface AdaptiveConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
  onConfirm: () => void;
  onCancel?: () => void;
}

export const AdaptiveConfirmDialog = ({
  open,
  onOpenChange,
  title,
  description,
  confirmText = 'Подтвердить',
  cancelText = 'Отмена',
  variant = 'default',
  onConfirm,
  onCancel
}: AdaptiveConfirmDialogProps) => {
  const { isMobile } = useAdaptiveSettings();

  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  const handleCancel = () => {
    onCancel?.();
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className={cn(
        'transition-all duration-300',
        // Адаптивные размеры
        isMobile ? 'mx-4 max-w-sm' : 'max-w-md',
        // Адаптивное позиционирование для мобильных
        isMobile && 'fixed bottom-4 top-auto transform-none'
      )}>
        <AlertDialogHeader className={cn(
          isMobile ? 'text-center' : 'text-left'
        )}>
          <AlertDialogTitle className={cn(
            'font-semibold',
            isMobile ? 'text-lg' : 'text-xl'
          )}>
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className={cn(
            'text-gray-600',
            isMobile ? 'text-sm' : 'text-base'
          )}>
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className={cn(
          'gap-3',
          // Адаптивное расположение кнопок
          isMobile ? 'flex-col-reverse' : 'flex-row'
        )}>
          <AlertDialogCancel 
            onClick={handleCancel}
            className={cn(
              'transition-all duration-200',
              isMobile && 'w-full touch-target'
            )}
          >
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className={cn(
              'transition-all duration-200',
              variant === 'destructive' && 'bg-red-600 hover:bg-red-700',
              isMobile && 'w-full touch-target'
            )}
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
