// components/member/NextWorkout.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, User, Users } from "lucide-react";
import { useRouter } from "next/navigation";

interface Workout {
  id: string;
  type: string;
  date: string;
  time: string;
  trainerName?: string;
  instructor?: string;
}

interface NextWorkoutProps {
  workout: Workout | null;
  isLoading: boolean;
}

export default function NextWorkout({ workout, isLoading }: NextWorkoutProps) {
  const router = useRouter();

  if (isLoading || !workout) {
    return null;
  }

  return (
    <Card className="shadow-lg border-l-4 border-l-blue-500 border-0">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="h-5 w-5 text-blue-600" />
          Следующая тренировка
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <h4 className="font-semibold text-lg text-gray-900">
            {workout.type}
          </h4>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>
                {new Date(workout.date).toLocaleDateString("ru-RU", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{workout.time}</span>
            </div>
            {workout.trainerName && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>{workout.trainerName}</span>
              </div>
            )}
            {workout.instructor && (
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>{workout.instructor}</span>
              </div>
            )}
          </div>
          <Button
            className="w-full mt-4"
            size="sm"
            onClick={() => router.push("/member-dashboard/my-bookings")}
          >
            Подробнее
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
