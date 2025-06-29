// components/trainer/mobile-menu/sections/TrainerStatsSection.tsx
"use client";

import { memo, useMemo } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Calendar,
  MessageSquare,
  BarChart3,
  CheckCircle,
  Star,
  Activity,
} from "lucide-react";
import type { MessageStats, WorkoutStats, SystemStats } from "@/types/trainer";

interface TrainerStatsSectionProps {
  messageStats: MessageStats;
  workoutStats: WorkoutStats;
  stats: SystemStats;
  isLoading: boolean;
  loadingStep: string;
}

// ✅ Мемоизированный компонент для статистики
const StatCard = memo(({ 
  icon: IconComponent, 
  label, 
  value, 
  description, 
  color, 
  bgColor, 
  index 
}: {
  icon: any;
  label: string;
  value: number | string;
  description: string;
  color: string;
  bgColor: string;
  index: number;
}) => (
  <div
    className={`p-3 ${bgColor} backdrop-blur-sm rounded-lg border border-white/20 hover:border-white/30 transition-all duration-150`}
  >
    <div className="flex items-center gap-2 mb-2">
      <IconComponent className={`h-4 w-4 ${color}`} />
      <span className="text-xs font-medium text-white/90">{label}</span>
    </div>
    <div className="text-lg font-bold text-white">{value}</div>
    <div className="text-xs text-white/60">{description}</div>
  </div>
));

StatCard.displayName = 'StatCard';

// ✅ Мемоизированный компонент для недельной статистики
const WeeklyStatRow = memo(({ 
  icon: IconComponent, 
  label, 
  value, 
  color, 
}: {
  icon: any;
  label: string;
  value: number | string;
  color: string;
}) => (
  <div
    className="flex items-center justify-between p-2 bg-white/5 rounded-lg border border-white/10 hover:border-white/20 transition-all duration-150"
  >
    <div className="flex items-center gap-2">
      <IconComponent className={`h-3 w-3 ${color}`} />
      <span className="text-sm text-white/90">{label}</span>
    </div>
    <span className="text-sm font-semibold text-white">{value}</span>
  </div>
));

WeeklyStatRow.displayName = 'WeeklyStatRow';

// ✅ Мемоизированный индикатор прогресса
const ProgressIndicator = memo(({ 
  currentValue, 
  maxValue = 6 
}: {
  currentValue: number;
  maxValue?: number;
}) => {

  return (
    <div
      className="p-3 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-lg border border-white/20"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-white/90">Прогресс дня</span>
        <span className="text-xs text-white/70">
          {currentValue} из {maxValue} тренировок
        </span>
      </div>
      <div className="w-full bg-white/20 rounded-full h-2">
        <div
          className="bg-gradient-to-r from-green-400 to-blue-400 h-2 rounded-full"
        />
      </div>
    </div>
  );
});

ProgressIndicator.displayName = 'ProgressIndicator';

// ✅ Основной компонент с мемоизацией
export default memo(function TrainerStatsSection({
  messageStats,
  workoutStats,
  stats,
  isLoading,
  loadingStep,
}: TrainerStatsSectionProps) {
  
  // ✅ Мемоизируем данные статистики для предотвращения пересчетов
  const statsItems = useMemo(() => [
    {
      icon: Calendar,
      label: "Сегодня",
      value: workoutStats?.todayWorkouts || 0,
      description: "тренировок",
      color: "text-green-400",
      bgColor: "bg-green-500/20",
    },
    {
      icon: MessageSquare,
      label: "Сообщения",
      value: messageStats?.unreadMessages || 0,
      description: "непрочитанных",
      color: "text-blue-400",
      bgColor: "bg-blue-500/20",
    },
    {
      icon: Users,
      label: "Клиенты",
      value: stats?.activeClients || 0,
      description: "активных",
      color: "text-purple-400",
      bgColor: "bg-purple-500/20",
    },
    {
      icon: CheckCircle,
      label: "Завершено",
      value: workoutStats?.completedWorkouts || 0,
      description: "тренировок",
      color: "text-orange-400",
      bgColor: "bg-orange-500/20",
    },
  ], [messageStats, workoutStats, stats]);

  const weeklyStats = useMemo(() => [
    {
      icon: BarChart3,
      label: "На этой неделе",
      value: workoutStats?.thisWeekWorkouts || 0,
      color: "text-cyan-400",
    },
    {
      icon: Star,
      label: "Средний рейтинг",
      value: stats?.avgRating?.toFixed(1) || "4.5",
      color: "text-yellow-400",
    },
    {
      icon: Activity,
      label: "Всего тренировок",
      value: workoutStats?.totalWorkouts || 0,
      color: "text-pink-400",
    },
  ], [workoutStats, stats]);

  if (isLoading) {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-white/70 uppercase tracking-wide">
          Статистика
        </h3>
        <div className="flex items-center gap-2 p-3 bg-white/10 rounded-lg">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white/50"></div>
          <span className="text-sm text-white/80">{loadingStep}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-white/70 uppercase tracking-wide">
          Статистика
        </h3>
        <Badge variant="outline" className="text-xs border-white/20 text-white/80 bg-white/10">
          Сегодня
        </Badge>
      </div>

      {/* Основная статистика */}
      <div className="grid grid-cols-2 gap-3">
        {statsItems.map((stat, index) => (
          <StatCard
            key={stat.label}
            icon={stat.icon}
            label={stat.label}
            value={stat.value}
            description={stat.description}
            color={stat.color}
            bgColor={stat.bgColor}
            index={index}
          />
        ))}
      </div>

      {/* Дополнительная статистика */}
      <div className="space-y-2">
        {weeklyStats.map((stat, index) => (
          <WeeklyStatRow
            key={stat.label}
            icon={stat.icon}
            label={stat.label}
            value={stat.value}
            color={stat.color}
          />
        ))}
      </div>

      {/* Индикатор прогресса */}
      <ProgressIndicator 
        currentValue={workoutStats?.todayWorkouts || 0}
        maxValue={6}
      />
    </div>
  );
});