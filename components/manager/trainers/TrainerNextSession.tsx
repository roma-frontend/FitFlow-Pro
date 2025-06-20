// components/manager/trainers/TrainerNextSession.tsx
"use client";

import { Calendar } from "lucide-react";
import { NextSession } from "@/types/trainer";

interface TrainerNextSessionProps {
  nextSession: NextSession;
}

export default function TrainerNextSession({ nextSession }: TrainerNextSessionProps) {
  return (
    <div className="p-3 bg-blue-50 rounded-lg">
      <div className="flex items-center gap-2 text-sm">
        <Calendar className="h-4 w-4 text-blue-600" />
        <span className="font-medium text-blue-800">
          Следующая тренировка:
        </span>
      </div>
      <p className="text-sm text-blue-700 mt-1">
        {nextSession.time} - {nextSession.client}
      </p>
    </div>
  );
}
