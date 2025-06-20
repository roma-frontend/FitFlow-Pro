// components/book-trainer/BookTrainerPage.tsx (обновленная версия)
"use client";

import { TrainerSelection } from "./steps/TrainerSelection";
import { ScheduleSelection } from "./steps/ScheduleSelection";
import { BookingDetails } from "./steps/BookingDetails";
import { BookingConfirmation } from "./steps/BookingConfirmation";
import { BookingHeader } from "./BookingHeader";
import { useBookingStore } from "./hooks/useBookingStore";

export default function BookTrainerPage() {
  const { bookingStep } = useBookingStore();

  const renderStep = () => {
    switch (bookingStep) {
      case "select":
        return <TrainerSelection />;
      case "schedule":
        return <ScheduleSelection />;
      case "details":
        return <BookingDetails />;
      case "confirm":
        return <BookingConfirmation />;
      default:
        return <TrainerSelection />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <BookingHeader />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderStep()}
      </div>
    </div>
  );
}
