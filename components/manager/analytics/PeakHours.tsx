// components/manager/analytics/PeakHours.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";

interface TimeSlot {
  time: string;
  load: number;
  label: string;
}

interface PeakHoursProps {
  timeSlots: TimeSlot[];
}

export default function PeakHours({ timeSlots }: PeakHoursProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Пиковые часы
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {timeSlots.map((slot, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-900">
                  {slot.label}
                </span>
                <span className="text-xs text-gray-500">
                  {slot.time}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    slot.load > 80 ? 'bg-red-500' :
                    slot.load > 60 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${slot.load}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-500">
                Загрузка: {slot.load}%
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
