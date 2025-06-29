// components/group-classes/ClassCard.tsx
"use client";

import { memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Clock,
  Users,
  MapPin,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";
import { ClassCardProps } from "./types";
import { ClassHeader } from "./ClassHeader";
import { ClassDetails } from "./ClassDetails";
import { EquipmentList } from "./EquipmentList";
import { ClassFooter } from "./ClassFooter";

const ClassCard = memo(({
  classItem,
  onEnroll,
  onCancel,
  isEnrolling,
  isUserEnrolled,
  isUserOnWaitlist,
}: ClassCardProps) => {
  const availableSpots = classItem.capacity - classItem.enrolled.length;
  const isFullyBooked = availableSpots === 0;
  const isAlmostFull = availableSpots <= 3 && availableSpots > 0;

  const getStatusColor = () => {
    if (isFullyBooked) return "text-red-600";
    if (isAlmostFull) return "text-yellow-600";
    return "text-green-600";
  };

  const getActionButton = () => {
    if (isUserEnrolled) {
      return (
        <Button
          variant="outline"
          onClick={onCancel}
          className="border-red-200 text-red-600 hover:bg-red-50"
        >
          Отменить запись
        </Button>
      );
    }

    if (isUserOnWaitlist) {
      return (
        <Button
          variant="outline"
          onClick={onCancel}
          className="border-yellow-200 text-yellow-600 hover:bg-yellow-50"
        >
          Убрать из ожидания
        </Button>
      );
    }

    if (isFullyBooked) {
      return (
        <Button
          onClick={onEnroll}
          disabled={isEnrolling}
          variant="outline"
          className="border-yellow-200 text-yellow-600 hover:bg-yellow-50"
        >
          {isEnrolling ? "Записываем..." : "В лист ожидания"}
        </Button>
      );
    }

    return (
      <Button
        onClick={onEnroll}
        disabled={isEnrolling}
        className="bg-green-600 hover:bg-green-700"
      >
        {isEnrolling ? "Записываем..." : "Записаться"}
      </Button>
    );
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <ClassHeader 
          classItem={classItem}
          isUserEnrolled={isUserEnrolled}
          isUserOnWaitlist={isUserOnWaitlist}
        />
        
        <ClassDetails classItem={classItem} getStatusColor={getStatusColor} />
        
        {classItem.equipment && classItem.equipment.length > 0 && (
          <EquipmentList equipment={classItem.equipment} />
        )}

        <ClassFooter 
          classItem={classItem}
          getActionButton={getActionButton}
        />
      </CardContent>
    </Card>
  );
});

ClassCard.displayName = "ClassCard";

export default ClassCard;
