// components/book-trainer/steps/BookingDetails.tsx
"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookingForm } from "../forms/BookingForm";
import { BookingSummary } from "../summary/BookingSummary";
import { useBookingStore } from "../hooks/useBookingStore";
import { useBooking } from "../hooks/useBooking";

export function BookingDetails() {
  const { workoutType, setBookingStep } = useBookingStore();
  const { handleBooking, loading } = useBooking();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card>
        <CardHeader>
          <CardTitle>Детали тренировки</CardTitle>
          <CardDescription>
            Расскажите о ваших целях и предпочтениях
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <BookingForm />
          
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setBookingStep("schedule")}
              className="flex-1"
            >
              Назад
            </Button>
            <Button
              onClick={handleBooking}
              disabled={!workoutType || loading}
              className="flex-1"
            >
              {loading ? "Создание записи..." : "Записаться"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <BookingSummary />
    </div>
  );
}
