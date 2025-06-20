// components/trainer/mobile-menu/sections/TrainerStatsSection.tsx
"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Calendar,
  MessageSquare,
  BarChart3,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Activity,
  Star,
} from "lucide-react";
import type { MessageStats, WorkoutStats, SystemStats } from "@/types/trainer"; // ✅ Правильные типы

interface TrainerStatsSectionProps {
  messageStats: MessageStats;
  workoutStats: WorkoutStats;
  stats: SystemStats; // ✅ Добавляем stats
  isLoading: boolean;
  loadingStep: string;
}

export default function TrainerStatsSection({
  messageStats,
  workoutStats,
  stats, // ✅ Получаем stats
  isLoading,
  loadingStep,
}: TrainerStatsSectionProps) {
  
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

  // ✅ Используем правильные поля из ваших типов
  const statsItems = [
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
      value: stats?.activeClients || 0, // ✅ Используем stats.activeClients
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
  ];

  const weeklyStats = [
    {
      icon: BarChart3,
      label: "На этой неделе",
      value: workoutStats?.thisWeekWorkouts || 0, // ✅ Правильное поле
      color: "text-cyan-400",
    },
    {
      icon: Star,
      label: "Средний рейтинг",
      value: stats?.avgRating?.toFixed(1) || "4.5", // ✅ Используем stats.avgRating
      color: "text-yellow-400",
    },
    {
      icon: Activity,
      label: "Всего тренировок",
      value: workoutStats?.totalWorkouts || 0,
      color: "text-pink-400",
    },
  ];

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
        {statsItems.map((stat, index) => {
          const IconComponent = stat.icon;
          
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
              whileHover={{ scale: 1.02 }}
              className={`p-3 ${stat.bgColor} backdrop-blur-sm rounded-lg border border-white/20 hover:border-white/30 transition-all duration-200`}
            >
              <div className="flex items-center gap-2 mb-2">
                <IconComponent className={`h-4 w-4 ${stat.color}`} />
                <span className="text-xs font-medium text-white/90">{stat.label}</span>
              </div>
              <div className="text-lg font-bold text-white">{stat.value}</div>
              <div className="text-xs text-white/60">{stat.description}</div>
            </motion.div>
          );
        })}
      </div>

      {/* Дополнительная статистика */}
      <div className="space-y-2">
        {weeklyStats.map((stat, index) => {
          const IconComponent = stat.icon;
          
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: (index + 4) * 0.1, duration: 0.3 }}
              whileHover={{ scale: 1.02 }}
              className="flex items-center justify-between p-2 bg-white/5 rounded-lg border border-white/10 hover:border-white/20 transition-all duration-200"
            >
              <div className="flex items-center gap-2">
                <IconComponent className={`h-3 w-3 ${stat.color}`} />
                <span className="text-sm text-white/90">{stat.label}</span>
              </div>
              <span className="text-sm font-semibold text-white">{stat.value}</span>
            </motion.div>
          );
        })}
      </div>

      {/* Индикатор прогресса */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.5 }}
        className="p-3 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-lg border border-white/20"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-white/90">Прогресс дня</span>
          <span className="text-xs text-white/70">
            {workoutStats?.todayWorkouts || 0} из 6 тренировок
          </span>
        </div>
        <div className="w-full bg-white/20 rounded-full h-2">
          <motion.div
            className="bg-gradient-to-r from-green-400 to-blue-400 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ 
              width: `${Math.min(((workoutStats?.todayWorkouts || 0) / 6) * 100, 100)}%` 
            }}
            transition={{ delay: 1, duration: 1, ease: "easeOut" }}
          />
        </div>
      </motion.div>
    </div>
  );
}
