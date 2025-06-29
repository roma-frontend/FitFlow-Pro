// components/member/UpcomingWorkouts.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, Users, Dumbbell } from "lucide-react";
import { useRouter } from "next/navigation";

interface Workout {
  id: string;
  type: string;
  date: string;
  time: string;
  duration: number;
  status: string;
  price: number;
  notes?: string;
  category?: "trainer" | "program";
  trainerName?: string;
  trainerSpecializations?: string[];
  programTitle?: string;
  instructor?: string;
  createdAt: string;
}

interface UpcomingWorkoutsProps {
  workouts: Workout[];
  isLoading: boolean;
  stats: {
    upcoming: number;
    completed: number;
    totalHours: number;
    daysLeft: number;
  };
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "confirmed":
    case "pending":
      return "bg-blue-100 text-blue-800";
    case "completed":
      return "bg-green-100 text-green-800";
    case "cancelled":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case "confirmed":
      return "Подтверждено";
    case "pending":
      return "Ожидает подтверждения";
    case "completed":
      return "Завершено";
    case "cancelled":
      return "Отменено";
    default:
      return status;
  }
};

export default function UpcomingWorkouts({ workouts, isLoading, stats }: UpcomingWorkoutsProps) {
  const router = useRouter();

  const upcomingWorkouts = workouts
    .filter((w) => new Date(w.date) > new Date() && w.status !== "cancelled")
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-blue-600" />
          Ближайшие тренировки
          {stats.upcoming > 0 && (
            <Badge className="bg-blue-100 text-blue-800">
              {stats.upcoming}
            </Badge>
          )}
        </CardTitle>
        <Button
          size="sm"
          onClick={() => router.push("/member-dashboard/my-bookings")}
          className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 hover:shadow-md transition-shadow"
        >
          Все тренировки
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : upcomingWorkouts.length > 0 ? (
          <div className="space-y-4">
            {upcomingWorkouts.map((workout) => (
              <div
                key={workout.id}
                className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl hover:shadow-md transition-all duration-300 cursor-pointer border border-gray-100"
                onClick={() => router.push("/member-dashboard/my-bookings")}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <Dumbbell className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">
                      {workout.type}
                    </h4>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(workout.date).toLocaleDateString("ru-RU", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {workout.time}
                      </span>
                    </div>
                    {workout.trainerName && (
                      <p className="text-sm text-gray-500 mt-1">
                        <User className="h-3 w-3 inline mr-1" />
                        {workout.trainerName}
                      </p>
                    )}
                    {workout.instructor && (
                      <p className="text-sm text-gray-500 mt-1">
                        <Users className="h-3 w-3 inline mr-1" />
                        {workout.instructor}
                      </p>
                    )}
                  </div>
                </div>
                <Badge className={getStatusColor(workout.status)}>
                  {getStatusText(workout.status)}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Нет запланированных тренировок
            </h3>
            <p className="text-gray-600 mb-6">
              Запишитесь на тренировку или программу прямо сейчас
            </p>
            <div className="flex flex-col md:flex-row gap-3 justify-center">
              <Button onClick={() => router.push("/trainers")} className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600">
                <User className="h-4 w-4 mr-2" />
                Записаться к тренеру
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/programs")}
              >
                <Users className="h-4 w-4 mr-2" />
                Выбрать программу
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
