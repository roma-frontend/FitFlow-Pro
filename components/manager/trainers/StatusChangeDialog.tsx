// components/manager/trainers/StatusChangeDialog.tsx (обновленная версия)
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
import {
  CheckCircle,
  Clock,
  XCircle,
  Plane,
} from "lucide-react";
import { Trainer } from "@/types/trainer";

interface StatusChangeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trainer: Trainer | null;
  onStatusChange: (trainerId: string, status: string) => void;
}

export default function StatusChangeDialog({
  open,
  onOpenChange,
  trainer,
  onStatusChange,
}: StatusChangeDialogProps) {
  const statusOptions = [
    {
      value: "active",
      label: "Активен",
      icon: CheckCircle,
      color: "text-green-600",
      description: "Тренер доступен для записи",
    },
    {
      value: "busy",
      label: "Занят",
      icon: Clock,
      color: "text-yellow-600",
      description: "Тренер временно недоступен",
    },
    {
      value: "inactive",
      label: "Неактивен",
      icon: XCircle,
      color: "text-gray-600",
      description: "Тренер не работает",
    },
    {
      value: "vacation",
      label: "В отпуске",
      icon: Plane,
      color: "text-blue-600",
      description: "Тренер в отпуске",
    },
  ];

  const handleStatusChange = (status: string) => {
    if (trainer?.id) {
      onStatusChange(trainer.id, status);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Изменить статус тренера</DialogTitle>
          <DialogDescription>
            Выберите новый статус для {trainer?.name || "тренера"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {statusOptions.map((status) => {
            const IconComponent = status.icon;
            return (
              <Button
                key={status.value}
                variant="outline"
                className="w-full justify-start h-auto p-4"
                onClick={() => handleStatusChange(status.value)}
              >
                <IconComponent className={`h-5 w-5 mr-3 ${status.color}`} />
                <div className="text-left">
                  <div className="font-medium">{status.label}</div>
                  <div className="text-sm text-gray-500">
                    {status.description}
                  </div>
                </div>
              </Button>
            );
          })}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
