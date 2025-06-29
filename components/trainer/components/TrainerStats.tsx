"use client";

import { memo } from "react";
import type { MessageStats, WorkoutStats } from "@/types/trainer";
import { Dumbbell, Users, CalendarDays, MailWarning } from "lucide-react";

export const TrainerStats = memo(({
  messageStats,
  workoutStats,
  stats,
  isLoading,
  loadingStep
}: {
  messageStats: MessageStats;
  workoutStats: WorkoutStats;
  stats: any;
  isLoading: boolean;
  loadingStep: string;
}) => {
  const headerStats = [
    {
      value: workoutStats?.todayWorkouts?.toString() || "0",
      label: "Тренировок сегодня",
      icon: <Dumbbell className="w-5 h-5 text-green-600" />,
      color: "from-green-100 to-green-50"
    },
    {
      value: messageStats?.unreadMessages?.toString() || "0",
      label: "Непрочитанных сообщений",
      icon: <MailWarning className="w-5 h-5 text-blue-600" />,
      color: "from-blue-100 to-blue-50"
    },
    {
      value: workoutStats?.thisWeekWorkouts?.toString() || "0",
      label: "Тренировок за неделю",
      icon: <CalendarDays className="w-5 h-5 text-purple-600" />,
      color: "from-purple-100 to-purple-50"
    },
    {
      value: stats?.activeClients?.toString() || "0",
      label: "Активных клиентов",
      icon: <Users className="w-5 h-5 text-orange-600" />,
      color: "from-orange-100 to-orange-50"
    },
  ];

  if (isLoading) {
    return (
      <div className="hidden 2xl:flex items-center justify-center w-full">
        <div className="flex items-center gap-2 text-sm text-gray-500 animate-pulse">
          <div className="h-4 w-4 border-2 border-gray-400 rounded-full border-t-transparent animate-spin"></div>
          <span>{loadingStep || 'Загрузка статистики...'}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="hidden 2xl:grid grid-cols-4 gap-4 w-full mt-4">
      {headerStats.map((stat, index) => (
        <div
          key={index}
          className={`
            flex items-center gap-4 px-4 py-3 rounded-lg border border-gray-200
            bg-gradient-to-br ${stat.color} shadow-sm hover:shadow-md transition-shadow
          `}
        >
          <div className="p-2 bg-white rounded-full shadow-sm">
            {stat.icon}
          </div>
          <div>
            <div className="text-xl font-bold text-gray-900 leading-tight">{stat.value}</div>
            <div className="text-xs text-gray-600">{stat.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
});

TrainerStats.displayName = "TrainerStats";
