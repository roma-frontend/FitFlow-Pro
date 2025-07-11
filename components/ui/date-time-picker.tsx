// components/ui/date-time-picker.tsx
"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";

export interface DateTimePickerProps {
  value: Date | null;
  onChange: (date: Date | null) => void;
  disabled?: boolean;
}

export function DateTimePicker({ value, onChange, disabled }: DateTimePickerProps) {
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(
    value ? new Date(value) : undefined
  );
  const [timeValue, setTimeValue] = React.useState<string>(
    value ? format(value, "HH:mm") : ""
  );

  // Обновляем внутреннее состояние при изменении внешнего значения
  React.useEffect(() => {
    if (value) {
      setSelectedDate(new Date(value));
      setTimeValue(format(value, "HH:mm"));
    } else {
      setSelectedDate(undefined);
      setTimeValue("");
    }
  }, [value]);

  // Обработчик изменения даты
  const handleDateChange = (date: Date | undefined) => {
    setSelectedDate(date);
    
    if (date) {
      const newDateTime = combineDateTime(date, timeValue);
      onChange(newDateTime);
    } else if (!timeValue) {
      onChange(null);
    }
  };

  // Обработчик изменения времени
  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTimeValue = e.target.value;
    setTimeValue(newTimeValue);
    
    if (selectedDate && newTimeValue) {
      const newDateTime = combineDateTime(selectedDate, newTimeValue);
      onChange(newDateTime);
    } else if (selectedDate) {
      onChange(selectedDate);
    }
  };

  // Функция для объединения даты и времени
  const combineDateTime = (date: Date, timeString: string): Date => {
    const newDate = new Date(date);
    
    if (timeString) {
      const [hours, minutes] = timeString.split(":").map(Number);
      if (!isNaN(hours) && !isNaN(minutes)) {
        newDate.setHours(hours, minutes);
      }
    }
    
    return newDate;
  };

  // Очистить выбор
  const handleClear = () => {
    setSelectedDate(undefined);
    setTimeValue("");
    onChange(null);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col sm:flex-row gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-full justify-start text-left font-normal",
                !selectedDate && "text-muted-foreground"
              )}
              disabled={disabled}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {selectedDate ? format(selectedDate, "PPP") : "Выберите дату"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateChange}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        
        <div className="relative flex-shrink-0">
          <Input
            type="time"
            value={timeValue}
            onChange={handleTimeChange}
            disabled={disabled}
            className="w-full sm:w-32"
          />
          {(selectedDate || timeValue) && (
            <Button
              size="icon"
              variant="ghost"
              className="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full"
              onClick={handleClear}
              disabled={disabled}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Очистить</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}