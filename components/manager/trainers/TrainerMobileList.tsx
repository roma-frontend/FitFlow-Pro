// components/manager/trainers/TrainerMobileList.tsx (обновленная версия)
"use client";

import { memo } from "react";
import MobileTrainerCard from "@/components/manager/MobileTrainerCard";
import { Trainer } from "@/types/trainer";

interface TrainerMobileListProps {
  trainers: Trainer[];
  onView: (trainerId: string) => void;
  onEdit: (trainerId: string) => void;
  onStatusChange: (trainer: Trainer) => void;
  onSchedule: (trainerId: string) => void;
}

const TrainerMobileList = memo(function TrainerMobileList({
  trainers,
  onView,
  onEdit,
  onStatusChange,
  onSchedule,
}: TrainerMobileListProps) {
  return (
    <div className="block lg:hidden">
      <div className="space-y-4">
        {trainers.map((trainer: Trainer) => (
          <MobileTrainerCard
            key={trainer.id || trainer._id}
            trainer={trainer}
            onView={() => onView(trainer.id)}
            onEdit={() => onEdit(trainer.id)}
            onStatusChange={() => onStatusChange(trainer)}
            onSchedule={() => onSchedule(trainer.id)}
          />
        ))}
      </div>
    </div>
  );
});

export default TrainerMobileList;
