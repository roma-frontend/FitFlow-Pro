"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Calendar, Target, Award } from "lucide-react";

interface ProgressTrackerProps {
  userRole: string;
}

export function ProgressTracker({ userRole }: ProgressTrackerProps) {
  if (userRole !== "client" && userRole !== "member") {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-green-500" />
          Мой прогресс в тренировках
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-3 bg-green-100 rounded-full flex items-center justify-center">
              <Target className="h-8 w-8 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-green-600 mb-1">75%</div>
            <div className="text-sm text-gray-600">Прогресс к цели</div>
            <div className="text-xs text-green-600 mt-1">-5 кг из -7 кг</div>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-3 bg-blue-100 rounded-full flex items-center justify-center">
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-blue-600 mb-1">12</div>
            <div className="text-sm text-gray-600">Тренировок в месяце</div>
            <div className="text-xs text-blue-600 mt-1">Цель: 16 тренировок</div>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-3 bg-purple-100 rounded-full flex items-center justify-center">
              <Award className="h-8 w-8 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-purple-600 mb-1">8</div>
            <div className="text-sm text-gray-600">Достижений</div>
            <div className="text-xs text-purple-600 mt-1">+2 за месяц</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
