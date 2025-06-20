// components/book-trainer/hooks/useTimeSlots.ts
import { useState, useEffect } from "react";
import { format, addDays, setHours, setMinutes } from "date-fns";
import { Trainer, TimeSlot } from "../types";

export function useTimeSlots(trainer: Trainer | null, selectedDate: Date | undefined) {
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (trainer && selectedDate) {
      generateTimeSlots();
    } else {
      setAvailableSlots([]);
    }
  }, [trainer, selectedDate]);

  const generateTimeSlots = async () => {
    if (!trainer || !selectedDate) return;

    setLoading(true);
    
    try {
      const dayOfWeek = selectedDate.toLocaleDateString("en-US", {
        weekday: "long",
      }).toLowerCase();
      
      const workingHours = trainer.workingHours[dayOfWeek];

      if (!workingHours) {
        setAvailableSlots([]);
        return;
      }

      const slots: TimeSlot[] = [];
      const [startHour, startMinute] = workingHours.start.split(":").map(Number);
      const [endHour, endMinute] = workingHours.end.split(":").map(Number);

      let currentTime = setMinutes(setHours(selectedDate, startHour), startMinute);
      const endTime = setMinutes(setHours(selectedDate, endHour), endMinute);

      while (currentTime < endTime) {
        const timeString = format(currentTime, "HH:mm");
        
        // Здесь можно добавить реальную проверку занятости через API
        const isAvailable = Math.random() > 0.3; // Симуляция занятости

        slots.push({
          time: timeString,
          available: isAvailable,
          price: trainer.hourlyRate,
        });

        currentTime = new Date(currentTime.getTime() + 60 * 60 * 1000); // +1 час
      }

      setAvailableSlots(slots);
    } catch (error) {
      console.error("Ошибка генерации слотов:", error);
      setAvailableSlots([]);
    } finally {
      setLoading(false);
    }
  };

  return { availableSlots, loading };
}
