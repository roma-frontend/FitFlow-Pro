// components/DeleteConfirmDialog.tsx
import React, { memo } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { AlertTriangle, Loader2 } from "lucide-react";
import type { MembershipPlan } from '@/types/membership';

interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan: MembershipPlan | null;
  loading: boolean;
  onConfirm: () => void;
}

export const DeleteConfirmDialog = memo<DeleteConfirmDialogProps>(({
  open,
  onOpenChange,
  plan,
  loading,
  onConfirm
}) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Удалить план?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Вы действительно хотите удалить план "{plan?.name}"?
            Это действие нельзя отменить. План будет деактивирован, если у него есть активные абонементы.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Отмена</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Удаление...
              </>
            ) : (
              "Удалить"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
});

DeleteConfirmDialog.displayName = 'DeleteConfirmDialog';

// Default export wrapper for lazy loading  
export default DeleteConfirmDialog;