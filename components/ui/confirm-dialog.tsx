// components/ui/confirm-dialog.tsx
"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmText: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  variant?: 'destructive' | 'warning' | 'default';
  icon?: React.ReactNode;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText,
  cancelText = "Отмена",
  onConfirm,
  onCancel,
  variant = 'default',
  icon
}: ConfirmDialogProps) {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  const handleCancel = () => {
    if (onCancel) onCancel();
    onOpenChange(false);
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'destructive':
        return {
          buttonClass: "bg-red-600 hover:bg-red-700 text-white",
          bgClass: "bg-red-50 border-red-200",
          textClass: "text-red-800"
        };
      case 'warning':
        return {
          buttonClass: "bg-yellow-600 hover:bg-yellow-700 text-white",
          bgClass: "bg-yellow-50 border-yellow-200",
          textClass: "text-yellow-800"
        };
      default:
        return {
          buttonClass: "bg-blue-600 hover:bg-blue-700 text-white",
          bgClass: "bg-blue-50 border-blue-200",
          textClass: "text-blue-800"
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {icon}
            {title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <DialogDescription className="text-left">
            {description}
          </DialogDescription>
          
          {variant !== 'default' && (
            <div className={`flex items-start gap-2 p-3 rounded-lg border ${styles.bgClass}`}>
              <AlertTriangle className={`h-4 w-4 flex-shrink-0 mt-0.5 ${
                variant === 'destructive' ? 'text-red-600' : 'text-yellow-600'
              }`} />
              <div className={`text-sm ${styles.textClass}`}>
                <p className="font-medium">
                  {variant === 'destructive' ? 'Внимание!' : 'Информация'}
                </p>
                <p>
                  {variant === 'destructive' 
                    ? 'Это действие нельзя отменить. Все данные будут потеряны навсегда.'
                    : 'Продукт будет скрыт из каталога, но его можно восстановить позже.'
                  }
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="w-full sm:w-auto"
          >
            {cancelText}
          </Button>
          <Button
            onClick={handleConfirm}
            className={`w-full sm:w-auto ${styles.buttonClass}`}
          >
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
