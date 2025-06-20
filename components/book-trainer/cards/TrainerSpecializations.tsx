// components/book-trainer/cards/TrainerSpecializations.tsx
import { Badge } from "@/components/ui/badge";

interface TrainerSpecializationsProps {
  specializations: string[];
}

export function TrainerSpecializations({ specializations }: TrainerSpecializationsProps) {
  return (
    <div className="mb-4">
      <p className="text-xs text-gray-500 mb-2">Специализации:</p>
      <div className="flex flex-wrap gap-1">
        {specializations.slice(0, 3).map((spec, index) => (
          <Badge key={index} variant="outline" className="text-xs">
            {spec}
          </Badge>
        ))}
        {specializations.length > 3 && (
          <Badge variant="outline" className="text-xs">
            +{specializations.length - 3}
          </Badge>
        )}
      </div>
    </div>
  );
}
