// components/manager/trainers/TrainerHeader.tsx (исправленная версия)
"use client";

import { Badge } from "@/components/ui/badge";
import {
  getTrainerStatusColor,
  getTrainerStatusIcon,
  getTrainerStatusText,
} from "@/utils/trainerHelpers";

interface TrainerHeaderProps {
  name: string;
  status?: string;
}

export default function TrainerHeader({ name, status }: TrainerHeaderProps) {
  const StatusIcon = getTrainerStatusIcon(status);

  return (
    <div>
      <h3 className="font-semibold text-gray-900">{name}</h3>
      <div className="flex items-center gap-2 mt-1">
        <Badge className={getTrainerStatusColor(status)}>
          <StatusIcon className="h-3 w-3 mr-1" />
          {getTrainerStatusText(status)}
        </Badge>
      </div>
    </div>
  );
}
