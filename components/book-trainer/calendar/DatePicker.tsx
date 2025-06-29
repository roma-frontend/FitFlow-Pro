// components/book-trainer/calendar/DatePicker.tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { addDays } from "date-fns";
import { ru } from "date-fns/locale";

interface DatePickerProps {
  selectedDate: Date | undefined;
  onDateSelect: (date: Date | undefined) => void;
}

export function DatePicker({ selectedDate, onDateSelect }: DatePickerProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Выберите дату</CardTitle>
      </CardHeader>
      <CardContent>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={onDateSelect}
          disabled={(date) =>
            date < new Date() || date > addDays(new Date(), 30)
          }
          className="rounded-md border"
          locale={ru}
        />
      </CardContent>
    </Card>
  );
}
