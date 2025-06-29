// components/modals/CancelMembershipModal.tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, X } from "lucide-react";

interface CancelMembershipModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isProcessing: boolean;
  membershipName: string;
  remainingDays: number;
}

export function CancelMembershipModal({
  isOpen,
  onClose,
  onConfirm,
  isProcessing,
  membershipName,
  remainingDays,
}: CancelMembershipModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <DialogTitle className="text-xl">Отменить абонемент?</DialogTitle>
          </div>
        </DialogHeader>
        
        <DialogDescription className="space-y-3 pt-4" asChild>
          <div>
            <p>
              Вы действительно хотите отменить абонемент <strong>{membershipName}</strong>?
            </p>
            
            {remainingDays > 0 && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <p className="text-sm text-orange-800">
                  <strong>Внимание:</strong> У вас осталось еще {remainingDays} {
                    remainingDays === 1 ? "день" : "дней"
                  } активного абонемента. После отмены вы потеряете доступ к услугам.
                </p>
              </div>
            )}
            
            <p className="text-sm text-gray-600">
              Это действие нельзя отменить. Вы сможете приобрести новый абонемент в любое время.
            </p>
          </div>
        </DialogDescription>
        
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isProcessing}
          >
            <X className="h-4 w-4 mr-2" />
            Оставить
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isProcessing}
            className="bg-red-600 hover:bg-red-700"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Отмена...
              </>
            ) : (
              <>
                <AlertTriangle className="h-4 w-4 mr-2" />
                Да, отменить
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}