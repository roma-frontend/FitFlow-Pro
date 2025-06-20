"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";

interface WeeklyCalendarProps {
  userRole: string;
}

export function WeeklyCalendar({ userRole }: WeeklyCalendarProps) {
  if (userRole !== "manager") {
    return null;
  }

  const events = [
    {
      day: "ПН",
      date: "15",
      title: "Собрание команды",
      time: "10:00 - Планерка с тренерами",
      color: "blue"
    },
    {
      day: "СР",
      date: "17",
      title: "Инвентаризация",
      time: "14:00 - Проверка оборудования",
      color: "green"
    },
    {
      day: "ПТ",
      date: "19",
      title: "Отчет по неделе",
      time: "16:00 - Подготовка отчета",
      color: "purple"
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-blue-500" />
          Важные события на неделе
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {events.map((event, index) => (
            <div
              key={index}
              className={`flex items-center gap-4 p-3 bg-${event.color}-50 rounded-lg`}
            >
              <div className="text-center">
                <div className={`text-lg font-bold text-${event.color}-600`}>
                  {event.day}
                </div>
                <div className="text-xs text-gray-600">{event.date}</div>
              </div>
              <div className="flex-1">
                <div className="font-medium">{event.title}</div>
                <div className="text-sm text-gray-600">{event.time}</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
