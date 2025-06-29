// components/book-trainer/utils/dateUtils.ts
import { format, addDays, setHours, setMinutes } from "date-fns";
import { ru } from "date-fns/locale";

export const formatDate = (date: Date, formatString: string = "dd MMMM yyyy") => {
  return format(date, formatString, { locale: ru });
};

export const generateTimeSlots = (startTime: string, endTime: string, intervalMinutes: number = 60) => {
  const slots: string[] = [];
  const [startHour, startMinute] = startTime.split(":").map(Number);
  const [endHour, endMinute] = endTime.split(":").map(Number);

  let currentTime = setMinutes(setHours(new Date(), startHour), startMinute);
  const endTimeDate = setMinutes(setHours(new Date(), endHour), endMinute);

  while (currentTime < endTimeDate) {
    slots.push(format(currentTime, "HH:mm"));
    currentTime = new Date(currentTime.getTime() + intervalMinutes * 60 * 1000);
  }

  return slots;
};

export const isDateInPast = (date: Date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
};

export const isDateTooFarInFuture = (date: Date, maxDaysAhead: number = 30) => {
  const maxDate = addDays(new Date(), maxDaysAhead);
  return date > maxDate;
};
