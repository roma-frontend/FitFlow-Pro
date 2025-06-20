// components/book-trainer/hooks/useBooking.ts (продолжение)
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useBookingStore } from "./useBookingStore";

export function useBooking() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const {
    selectedTrainer,
    selectedDate,
    selectedTime,
    duration,
    workoutType,
    notes,
    setBookingStep,
  } = useBookingStore();

  const handleBooking = async () => {
    if (!selectedTrainer || !selectedDate || !selectedTime || !workoutType) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Заполните все обязательные поля",
      });
      return;
    }

    setLoading(true);

    try {
      const startDateTime = new Date(selectedDate);
      const [hours, minutes] = selectedTime.split(":").map(Number);
      startDateTime.setHours(hours, minutes, 0, 0);

      const endDateTime = new Date(startDateTime);
      endDateTime.setMinutes(endDateTime.getMinutes() + duration);

      const response = await fetch("/api/bookings/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          trainerId: selectedTrainer._id,
          startTime: startDateTime.getTime(),
          endTime: endDateTime.getTime(),
          duration,
          workoutType,
          notes,
          price: selectedTrainer.hourlyRate * (duration / 60),
        }),
      });

      if (response.ok) {
        setBookingStep("confirm");
        toast({
          title: "Успешно!",
          description: "Ваша запись отправлена тренеру на подтверждение",
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Ошибка создания записи");
      }
    } catch (error) {
      console.error("Ошибка бронирования:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: error instanceof Error ? error.message : "Не удалось создать запись. Попробуйте еще раз.",
      });
    } finally {
      setLoading(false);
    }
  };

  return { handleBooking, loading };
}
