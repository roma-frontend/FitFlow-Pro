// components/manager/bookings/BookingStatusDialog.tsx
import { memo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react";

interface BookingStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: any;
  onStatusChange: (bookingId: string, status: 'scheduled' | 'completed' | 'cancelled' | 'no-show') => void;
}

const BookingStatusDialog = memo(({
  open,
  onOpenChange,
  booking,
  onStatusChange,
}: BookingStatusDialogProps) => {
  const statusOptions = [
    {
      value: "scheduled" as const,
      label: "Запланирована",
      icon: Clock,
      color: "text-blue-600",
      description: "Запись подтверждена и ожидает выполнения",
    },
    {
      value: "completed" as const,
      label: "Завершена",
      icon: CheckCircle,
      color: "text-green-600",
      description: "Тренировка успешно проведена",
    },
    {
      value: "cancelled" as const,
      label: "Отменена",
      icon: XCircle,
      color: "text-red-600",
      description: "Запись отменена клиентом или тренером",
    },
    {
      value: "no-show" as const,
      label: "Не явился",
      icon: AlertTriangle,
      color: "text-gray-600",
      description: "Клиент не пришел на тренировку",
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Изменить статус записи</DialogTitle>
          <DialogDescription>
            Выберите новый статус для записи {booking?.clientName} к{" "}
            {booking?.trainerName}
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
                onClick={() => onStatusChange(booking?.id, status.value)}
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
});

BookingStatusDialog.displayName = "BookingStatusDialog";

export default BookingStatusDialog;
