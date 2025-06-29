// components/manager/mobile-menu/sections/ManagerStatsSection.tsx
"use client";

import { motion } from "framer-motion";
import {
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  Building2,
  Activity,
  Star,
  Clock,
} from "lucide-react";
import { ManagerStats } from "@/contexts/ManagerContext";

interface ManagerStatsSectionProps {
  stats: ManagerStats;
}

export default function ManagerStatsSection({
  stats,
}: ManagerStatsSectionProps) {
  // ✅ Статистика для мобильного меню менеджера (используем только доступные поля)
  const mobileStats = [
    {
      label: "Всего тренеров",
      value: stats?.totalTrainers || 0,
      subValue: `${stats?.activeTrainers || 0} активных`,
      icon: Users,
      color: "text-indigo-400",
      bgColor: "bg-indigo-500/20",
      borderColor: "border-indigo-500/30",
    },
    {
      label: "Записи сегодня",
      value: stats?.todayBookings || 0,
      subValue: "На сегодня",
      icon: Calendar,
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/20",
      borderColor: "border-emerald-500/30",
    },
    {
      label: "Доход за месяц",
      value: `${((stats?.monthlyRevenue || 0) / 1000).toFixed(0)}К`,
      subValue: "Месячный доход",
      icon: DollarSign,
      color: "text-amber-400",
      bgColor: "bg-amber-500/20",
      borderColor: "border-amber-500/30",
    },
    {
      label: "Новые клиенты",
      value: stats?.newClients || 0,
      subValue: `${stats?.totalClients || 0} всего`,
      icon: TrendingUp,
      color: "text-purple-400",
      bgColor: "bg-purple-500/20",
      borderColor: "border-purple-500/30",
    },
  ];

  return (
    <div className="mb-6">
      <h3 className="text-sm font-medium text-white/70 uppercase tracking-wide mb-3">
        Статистика
      </h3>

      <div className="grid grid-cols-2 gap-3">
        {mobileStats.map((stat, index) => {
          const IconComponent = stat.icon;

          return (
            <div
              key={index}
              className={`p-3 rounded-xl border ${stat.bgColor} ${stat.borderColor} backdrop-blur-sm`}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={`p-1.5 rounded-lg bg-white/10`}>
                  <IconComponent className={`h-4 w-4 ${stat.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-lg font-bold text-white">
                    {stat.value}
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-xs font-medium text-white/90 truncate">
                  {stat.label}
                </div>
                <div className="text-xs text-white/60 truncate">
                  {stat.subValue}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ✅ Дополнительная быстрая статистика (используем только доступные поля) */}
      <div className="mt-4 p-3 rounded-xl bg-white/5 border border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-yellow-400" />
            <span className="text-sm font-medium text-white/90">
              Средний рейтинг
            </span>
          </div>
          <span className="text-sm font-bold text-yellow-400">
            {(stats?.averageRating || 0).toFixed(1)}
          </span>
        </div>

        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-green-400" />
            <span className="text-sm font-medium text-white/90">
              Завершено сессий
            </span>
          </div>
          <span className="text-sm font-bold text-green-400">
            {stats?.completedSessions || 0}
          </span>
        </div>

        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-blue-400" />
            <span className="text-sm font-medium text-white/90">
              Всего клиентов
            </span>
          </div>
          <span className="text-sm font-bold text-blue-400">
            {stats?.totalClients || 0}
          </span>
        </div>
      </div>
    </div>
  );
}
