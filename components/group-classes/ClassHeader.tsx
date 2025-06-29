// components/group-classes/ClassHeader.tsx
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle } from "lucide-react";
import { GroupClass } from "./types";

interface ClassHeaderProps {
  classItem: GroupClass;
  isUserEnrolled: boolean;
  isUserOnWaitlist: boolean;
}

export const ClassHeader = ({ 
  classItem, 
  isUserEnrolled, 
  isUserOnWaitlist 
}: ClassHeaderProps) => {
  const getDifficultyBadgeClass = (difficulty: string) => {
    switch (difficulty) {
      case "Начинающий":
        return "bg-green-100 text-green-800";
      case "Средний":
        return "bg-yellow-100 text-yellow-800";
      case "Продвинутый":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="flex items-start justify-between mb-4">
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          <h3 className="text-xl font-bold">{classItem.name}</h3>
          <Badge className={getDifficultyBadgeClass(classItem.difficulty)}>
            {classItem.difficulty}
          </Badge>
        </div>

        {classItem.description && (
          <p className="text-gray-600 mb-3">{classItem.description}</p>
        )}
      </div>

      <div className="text-right">
        <p className="text-2xl font-bold">{classItem.price} ₽</p>
        {isUserEnrolled && (
          <Badge className="bg-green-100 text-green-800 mt-1">
            <CheckCircle className="h-3 w-3 mr-1" />
            Записан
          </Badge>
        )}
        {isUserOnWaitlist && (
          <Badge className="bg-yellow-100 text-yellow-800 mt-1">
            <AlertCircle className="h-3 w-3 mr-1" />
            В ожидании
          </Badge>
        )}
      </div>
    </div>
  );
};
