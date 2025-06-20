// components/group-classes/EquipmentList.tsx
import { Badge } from "@/components/ui/badge";

interface EquipmentListProps {
  equipment: string[];
}

export const EquipmentList = ({ equipment }: EquipmentListProps) => {
  return (
    <div className="mb-4">
      <p className="text-sm font-medium text-gray-700 mb-2">
        Необходимое оборудование:
      </p>
      <div className="flex flex-wrap gap-1">
        {equipment.map((item, index) => (
          <Badge key={index} variant="outline" className="text-xs">
            {item}
          </Badge>
        ))}
      </div>
    </div>
  );
};
