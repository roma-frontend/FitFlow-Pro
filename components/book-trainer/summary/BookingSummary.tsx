// components/book-trainer/summary/BookingSummary.tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { useBookingStore } from "../hooks/useBookingStore";

export function BookingSummary() {
  const { selectedTrainer, selectedDate, selectedTime, duration, workoutType } = useBookingStore();

  if (!selectedTrainer) return null;

  const totalPrice = Math.round(selectedTrainer.hourlyRate * (duration / 60));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Сводка записи</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
          <Avatar>
            <AvatarImage
              src={selectedTrainer.photoUrl}
              alt={selectedTrainer.name}
            />
            <AvatarFallback>
              {selectedTrainer.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{selectedTrainer.name}</p>
            <p className="text-sm text-gray-600">
              {selectedTrainer.specializations.join(", ")}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <SummaryItem
            label="Дата"
            value={selectedDate ? format(selectedDate, "dd MMMM yyyy", { locale: ru }) : ""}
          />
          
          <SummaryItem label="Время" value={selectedTime} />
          
          <SummaryItem label="Продолжительность" value={`${duration} минут`} />
          
          {workoutType && (
            <SummaryItem label="Тип" value={workoutType} />
          )}
        </div>

        <div className="pt-4 border-t">
          <div className="flex items-center justify-between text-lg">
            <span className="font-medium">Стоимость:</span>
            <span className="font-bold">{totalPrice} ₽</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {selectedTrainer.hourlyRate} ₽/час × {duration / 60} ч
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-800">
            💡 Запись будет отправлена тренеру на подтверждение. Вы получите уведомление о статусе записи.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

interface SummaryItemProps {
  label: string;
  value: string;
}

function SummaryItem({ label, value }: SummaryItemProps) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-600">{label}:</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
