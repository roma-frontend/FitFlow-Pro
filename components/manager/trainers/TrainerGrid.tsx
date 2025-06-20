// components/manager/trainers/TrainerGrid.tsx (исправленная версия)
"use client";

import { memo } from "react";
import TrainerCard from "./TrainerCard";
import { Trainer } from "@/types/trainer";

interface TrainerGridProps {
  trainers: Trainer[];
  onView: (trainerId: string) => void;
  onEdit: (trainerId: string) => void;
  onStatusChange: (trainer: Trainer) => void;
  onSchedule: (trainerId: string) => void;
  onDelete?: (trainerId: string) => void;
}

const TrainerGrid = memo(function TrainerGrid({
  trainers,
  onView,
  onEdit,
  onStatusChange,
  onSchedule,
  onDelete,
}: TrainerGridProps) {
  return (
    <div className="hidden lg:grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {trainers.map((trainer: Trainer) => (
        <TrainerCard
          key={trainer.id || trainer._id}
          trainer={trainer}
          onView={() => onView(trainer.id)}
          onEdit={() => onEdit(trainer.id)}
          onStatusChange={() => onStatusChange(trainer)}
          onSchedule={() => onSchedule(trainer.id)}
          onDelete={onDelete ? () => onDelete(trainer.id) : undefined}
        />
      ))}
    </div>
  );
});

export default TrainerGrid;
