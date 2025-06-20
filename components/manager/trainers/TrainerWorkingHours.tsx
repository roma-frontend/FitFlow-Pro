// components/manager/trainers/TrainerWorkingHours.tsx (исправленная версия)
"use client";

import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import { WorkingHours } from "@/types/trainer";

interface TrainerWorkingHoursProps {
  workingHours: WorkingHours;
}

export default function TrainerWorkingHours({ workingHours }: TrainerWorkingHoursProps) {
  return (
    <div>
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Clock className="h-4 w-4" />
        <span>
          {workingHours.start} - {workingHours.end}
        </span>
      </div>
      <div className="flex flex-wrap gap-1 mt-1">
        {workingHours.days.map((day: string, index: number) => (
          <Badge key={index} variant="custom" className="text-xs">
            {day}
          </Badge>
        ))}
      </div>
    </div>
  );
}
