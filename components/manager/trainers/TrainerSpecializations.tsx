// components/manager/trainers/TrainerSpecializations.tsx (исправленная версия)
"use client";

import { Badge } from "@/components/ui/badge";

interface TrainerSpecializationsProps {
  specializations: string[];
  maxVisible?: number;
}

export default function TrainerSpecializations({ 
  specializations, 
  maxVisible = 3 
}: TrainerSpecializationsProps) {
  const visibleSpecs = specializations.slice(0, maxVisible);
  const remainingCount = specializations.length - maxVisible;

  return (
    <div className="flex flex-wrap gap-1">
      {visibleSpecs.map((spec: string, index: number) => (
        <Badge key={index} variant="secondary" className="text-xs">
          {spec}
        </Badge>
      ))}
      {remainingCount > 0 && (
        <Badge variant="secondary" className="text-xs">
          +{remainingCount}
        </Badge>
      )}
    </div>
  );
}
