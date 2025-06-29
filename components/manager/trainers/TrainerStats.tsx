// components/manager/trainers/TrainerStats.tsx (обновленная версия)
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Users, CheckCircle, Clock, Star } from "lucide-react";

interface TrainerStatsProps {
  totalTrainers: number;
  activeTrainers: number;
  busyTrainers: number;
  averageRating: number;
}

export default function TrainerStats({
  totalTrainers,
  activeTrainers,
  busyTrainers,
  averageRating,
}: TrainerStatsProps) {
  const stats = [
    {
      icon: Users,
      value: totalTrainers.toString(),
      label: "Всего тренеров",
      bgColor: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      icon: CheckCircle,
      value: activeTrainers.toString(),
      label: "Активных",
      bgColor: "bg-green-100",
      iconColor: "text-green-600",
    },
    {
      icon: Clock,
      value: busyTrainers.toString(),
      label: "Занятых",
      bgColor: "bg-yellow-100",
      iconColor: "text-yellow-600",
    },
    {
      icon: Star,
      value: averageRating.toFixed(1),
      label: "Средний рейтинг",
      bgColor: "bg-purple-100",
      iconColor: "text-purple-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                  <IconComponent className={`h-5 w-5 ${stat.iconColor}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
