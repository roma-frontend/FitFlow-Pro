// components/book-trainer/cards/TrainerExperience.tsx
import { Award } from "lucide-react";

interface TrainerExperienceProps {
  experience: number;
}

export function TrainerExperience({ experience }: TrainerExperienceProps) {
  return (
    <div className="flex items-center gap-2 text-sm text-gray-600">
      <Award className="h-4 w-4" />
      <span>{experience} лет опыта</span>
    </div>
  );
}
