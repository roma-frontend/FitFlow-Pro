// components/group-classes/ClassDetails.tsx
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Clock, Users, MapPin } from "lucide-react";
import { format } from "date-fns";
import { GroupClass } from "./types";

interface ClassDetailsProps {
  classItem: GroupClass;
  getStatusColor: () => string;
}

export const ClassDetails = ({ classItem, getStatusColor }: ClassDetailsProps) => {
  const availableSpots = classItem.capacity - classItem.enrolled.length;
  const isFullyBooked = availableSpots === 0;
  const isAlmostFull = availableSpots <= 3 && availableSpots > 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 text-gray-500" />
        <div>
          <p className="text-sm font-medium">
            {format(new Date(classItem.startTime), "HH:mm")} -{" "}
            {format(new Date(classItem.endTime), "HH:mm")}
          </p>
          <p className="text-xs text-gray-500">
            {Math.round(
              (classItem.endTime - classItem.startTime) / (1000 * 60)
            )}{" "}
            минут
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <MapPin className="h-4 w-4 text-gray-500" />
        <div>
          <p className="text-sm font-medium">{classItem.location}</p>
          <p className="text-xs text-gray-500">Место проведения</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Users className="h-4 w-4 text-gray-500" />
        <div>
          <p className={`text-sm font-medium ${getStatusColor()}`}>
            {classItem.enrolled.length}/{classItem.capacity}
          </p>
          <p className="text-xs text-gray-500">
            {isFullyBooked
              ? "Мест нет"
              : isAlmostFull
                ? `Осталось ${availableSpots}`
                : "Есть места"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Avatar className="h-8 w-8">
          <AvatarImage
            src={classItem.instructorPhoto}
            alt={classItem.instructorName}
          />
          <AvatarFallback>
            {classItem.instructorName.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-medium">{classItem.instructorName}</p>
          <p className="text-xs text-gray-500">Инструктор</p>
        </div>
      </div>
    </div>
  );
};
