// app/manager/utils/getStatCards.ts
import { Users, Calendar, DollarSign, Star } from "lucide-react";
import type { ManagerStats } from "@/contexts/ManagerContext";
import type { StatCard } from "@/components/manager/StatCardList";

export function getStatCards(stats: ManagerStats): StatCard[] {
  return [
    {
      title: "Всего тренеров",
      value: stats.totalTrainers,
      change: "+2",
      changeType: "increase",
      icon: Users,
      color: "blue",
      description: `${stats.activeTrainers} активных`,
    },
    {
      title: "Записи сегодня",
      value: stats.todayBookings,
      change: "+5",
      changeType: "increase",
      icon: Calendar,
      color: "green",
      description: "На сегодня",
    },
    {
      title: "Доход за месяц",
      value: `${(stats.monthlyRevenue / 1000).toFixed(0)}К ₽`,
      change: "+12%",
      changeType: "increase",
      icon: DollarSign,
      color: "orange",
      description: "По сравнению с прошлым месяцем",
    },
    {
      title: "Средний рейтинг",
      value: stats.averageRating.toFixed(1),
      change: "+0.2",
      changeType: "increase",
      icon: Star,
      color: "purple",
      description: "Рейтинг тренеров",
    },
  ];
}
