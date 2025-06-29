// components/book-trainer/steps/BookingConfirmation.tsx
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Router } from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { useBookingStore } from "../hooks/useBookingStore";
import { useRouter } from "next/navigation";

export function BookingConfirmation() {
  const { selectedTrainer, selectedDate, selectedTime, resetBooking } = useBookingStore();
  const router = useRouter()

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Запись отправлена!
          </h2>

          <p className="text-gray-600 mb-6">
            Ваша запись к тренеру <strong>{selectedTrainer?.name}</strong>{" "}
            на{" "}
            <strong>
              {selectedDate &&
                format(selectedDate, "dd MMMM", { locale: ru })}{" "}
              в {selectedTime}
            </strong>{" "}
            отправлена на подтверждение.
          </p>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-medium mb-2">Что дальше?</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Тренер рассмотрит вашу заявку в течение 2-4 часов</li>
              <li>
                • Вы получите уведомление о подтверждении или изменениях
              </li>
              <li>• За 1 час до тренировки придет напоминание</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => (router.push("/member-dashboard"))}
              className="flex-1"
            >
              В личный кабинет
            </Button>
            <Button onClick={resetBooking} className="flex-1">
              Записаться еще
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
