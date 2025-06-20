// components/trainer/header/StatsBar.tsx
"use client";

import { Users, Calendar, Star, MessageCircle } from "lucide-react";

interface StatsBarProps {
  activeMembers: number;
  todayWorkouts: number;
  avgRating: number;
  unreadMessages: number;
}

export default function StatsBar({ 
  activeMembers, 
  todayWorkouts, 
  avgRating, 
  unreadMessages 
}: StatsBarProps) {
  const stats = [
    {
      icon: Users,
      label: "Активные участники",
      value: activeMembers,
      color: "text-blue-600"
    },
    {
      icon: Calendar,
      label: "Тренировки сегодня",
      value: todayWorkouts,
      color: "text-green-600"
    },
    {
      icon: Star,
      label: "Средний рейтинг",
      value: avgRating.toFixed(1),
      color: "text-yellow-600"
    },
    {
      icon: MessageCircle,
      label: "Непрочитанные",
      value: unreadMessages,
      color: "text-red-600"
    }
  ];

  return (
    <div className="border-t border-gray-100 py-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          {stats.map((stat, index) => (
            <div key={index} className="flex items-center gap-2">
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
              <span className="text-sm text-gray-600">{stat.label}:</span>
              <span className="text-sm font-semibold text-gray-900">
                {stat.value}
              </span>
            </div>
          ))}
        </div>
        
        <div className="text-xs text-gray-500">
          Обновлено: {new Date().toLocaleTimeString('ru-RU', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </div>
      </div>
    </div>
  );
}
