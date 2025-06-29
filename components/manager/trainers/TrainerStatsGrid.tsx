// components/manager/trainers/TrainerStatsGrid.tsx (исправленная версия)
"use client";

import { Star, Users, DollarSign } from "lucide-react";
import { formatEarnings } from "@/utils/trainerHelpers";

interface TrainerStatsGridProps {
  rating: number;
  totalClients: number;
  monthlyEarnings: number;
}

export default function TrainerStatsGrid({ 
  rating, 
  totalClients, 
  monthlyEarnings 
}: TrainerStatsGridProps) {
  const stats = [
    {
      icon: Star,
      value: rating.toFixed(1),
      label: "Рейтинг",
      color: "text-yellow-500",
    },
    {
      icon: Users,
      value: totalClients.toString(),
      label: "Клиентов",
      color: "text-blue-500",
    },
    {
      icon: DollarSign,
      value: formatEarnings(monthlyEarnings),
      label: "Доход",
      color: "text-green-500",
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-4 text-center">
      {stats.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <div key={index}>
            <div className="flex items-center justify-center gap-1 mb-1">
              <IconComponent className={`h-4 w-4 ${stat.color}`} />
              <span className="font-semibold text-gray-900">
                {stat.value}
              </span>
            </div>
            <p className="text-xs text-gray-500">{stat.label}</p>
          </div>
        );
      })}
    </div>
  );
}
