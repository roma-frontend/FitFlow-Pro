// components/admin/schedule/ScheduleStats.tsx
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle,
  Activity,
  Target
} from "lucide-react";

// Создаем более гибкий тип
interface ScheduleStatsProps {
  stats: {
    totalEvents?: number;
    completedEvents?: number;
    cancelledEvents?: number;
    todayEvents?: number;
    upcomingEvents?: number;
    pendingConfirmation?: number;
    overdueEvents?: number;
    completionRate?: number;
    cancellationRate?: number;
    noShowRate?: number;
    averageSessionDuration?: number;
    totalRevenue?: number;
    utilizationRate?: number;
    eventsByStatus?: {
      scheduled: number;
      confirmed: number;
      completed: number;
      cancelled: number;
      "no-show": number;
    };
    eventsByTrainer?: Record<string, number>;
  };
}

export function ScheduleStats({ stats }: ScheduleStatsProps) {
  const statCards = [
    {
      title: "Всего событий",
      value: stats.totalEvents || 0,
      icon: Calendar,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      change: "+12%"
    },
    {
      title: "Сегодня",
      value: stats.todayEvents || 0,
      icon: Clock,
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      change: "+3"
    },
    {
      title: "Предстоящие",
      value: stats.upcomingEvents || 0,
      icon: Activity,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      change: "+8%"
    },
    {
      title: "Завершенные",
      value: stats.completedEvents || 0,
      icon: CheckCircle,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-200",
      change: "+15%"
    },
    {
      title: "Отмененные",
      value: stats.cancelledEvents || 0,
      icon: XCircle,
      color: "text-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      change: "-2%"
    },
    {
      title: "Загруженность",
      value: `${stats.utilizationRate || 0}%`,
      icon: Target,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
      change: "+5%"
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {statCards.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title} className={`${stat.bgColor} ${stat.borderColor} border-l-4`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Icon className={`h-5 w-5 ${stat.color}`} />
                <span className="text-xs text-green-600 font-medium">{stat.change}</span>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-600 mb-1">{stat.title}</p>
                <p className={`text-lg font-bold ${stat.color}`}>{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

