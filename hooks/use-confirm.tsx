// hooks/use-confirm.tsx
"use client";

import { useState, useCallback } from 'react';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

interface ConfirmOptions {
  title: string;
  description: string;
  confirmText: string;
  cancelText?: string;
  variant?: 'destructive' | 'warning' | 'default';
  icon?: React.ReactNode;
}

export function useConfirm() {
  const [dialogState, setDialogState] = useState<{
    open: boolean;
    options: ConfirmOptions;
    resolve: ((value: boolean) => void) | null;
  }>({
    open: false,
    options: { title: '', description: '', confirmText: '' },
    resolve: null
  });

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setDialogState({
        open: true,
        options,
        resolve
      });
    });
  }, []);

  const handleConfirm = useCallback(() => {
    if (dialogState.resolve) {
      dialogState.resolve(true);
    }
    setDialogState(prev => ({ ...prev, open: false, resolve: null }));
  }, [dialogState.resolve]);

  const handleCancel = useCallback(() => {
    if (dialogState.resolve) {
      dialogState.resolve(false);
    }
    setDialogState(prev => ({ ...prev, open: false, resolve: null }));
  }, [dialogState.resolve]);

  const ConfirmDialogComponent = useCallback(() => (
    <ConfirmDialog
      open={dialogState.open}
      onOpenChange={(open) => {
        if (!open) handleCancel();
      }}
      title={dialogState.options.title}
      description={dialogState.options.description}
      confirmText={dialogState.options.confirmText}
      cancelText={dialogState.options.cancelText}
      variant={dialogState.options.variant}
      icon={dialogState.options.icon}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    />
  ), [dialogState, handleConfirm, handleCancel]);

  return { confirm, ConfirmDialog: ConfirmDialogComponent };
}