// components/book-trainer/steps/ScheduleSelection.tsx
"use client";

import { TrainerInfo } from "../cards/TrainerInfo";
import { DatePicker } from "../calendar/DatePicker";
import { TimeSlots } from "../calendar/TimeSlots";
import { useBookingStore } from "../hooks/useBookingStore";
import { useTimeSlots } from "../hooks/useTimeSlots";

export function ScheduleSelection() {
  const { selectedTrainer, selectedDate, setSelectedDate, setSelectedTime, setBookingStep } = useBookingStore();
  const { availableSlots, loading } = useTimeSlots(selectedTrainer, selectedDate);

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setBookingStep("details");
  };

  if (!selectedTrainer) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <TrainerInfo trainer={selectedTrainer} />
      
      <DatePicker
        selectedDate={selectedDate}
        onDateSelect={setSelectedDate}
      />
      
      <TimeSlots
        selectedDate={selectedDate}
        availableSlots={availableSlots}
        loading={loading}
        onTimeSelect={handleTimeSelect}
      />
    </div>
  );
}
