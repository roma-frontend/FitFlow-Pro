// components/book-trainer/calendar/TimeSlots.tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { TimeSlot } from "../types";
import { useBookingStore } from "../hooks/useBookingStore";

interface TimeSlotsProps {
  selectedDate: Date | undefined;
  availableSlots: TimeSlot[];
  loading: boolean;
  onTimeSelect: (time: string) => void;
}

export function TimeSlots({ selectedDate, availableSlots, loading, onTimeSelect }: TimeSlotsProps) {
  const { selectedTime } = useBookingStore();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Доступное время</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-3"></div>
            <p className="text-gray-600">Загрузка слотов...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Доступное время</CardTitle>
        <CardDescription>
          {selectedDate && format(selectedDate, "dd MMMM yyyy", { locale: ru })}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {availableSlots.length > 0 ? (
          <div className="grid grid-cols-2 gap-2">
            {availableSlots.map((slot) => (
              <Button
                key={slot.time}
                variant={selectedTime === slot.time ? "default" : "outline"}
                disabled={!slot.available}
                onClick={() => onTimeSelect(slot.time)}
                className="h-12"
              >
                <div className="text-center">
                  <div className="font-medium">{slot.time}</div>
                  <div className="text-xs opacity-75">
                    {slot.available ? `${slot.price} ₽` : "Занято"}
                  </div>
                </div>
              </Button>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">
              {selectedDate
                ? "В этот день тренер не работает"
                : "Выберите дату для просмотра доступного времени"}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
