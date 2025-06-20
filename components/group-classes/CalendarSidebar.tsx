// components/group-classes/CalendarSidebar.tsx
"use client";

import { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { addDays } from "date-fns";
import { ru } from "date-fns/locale";

interface CalendarSidebarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

const CalendarSidebar = memo(({ selectedDate, onDateSelect }: CalendarSidebarProps) => {
  return (
    <Card className="lg:col-span-1">
      <CardHeader>
        <CardTitle>Выберите дату</CardTitle>
      </CardHeader>
      <CardContent>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(date) => date && onDateSelect(date)}
          disabled={(date) =>
            date < new Date() || date > addDays(new Date(), 30)
          }
          className="rounded-md border"
          locale={ru}
        />

        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Легенда</h4>
          <div className="space-y-1 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Есть места</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span>Мало мест</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>Мест нет</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

CalendarSidebar.displayName = "CalendarSidebar";

export default CalendarSidebar;
