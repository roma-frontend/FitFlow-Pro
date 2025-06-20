"use client";

import { memo } from "react";
import { UserCheck, CalendarCheck, UserPlus, CreditCard } from "lucide-react";

export const ManagerStatsComponent = memo(({ stats }: { stats: any }) => {
  const headerStats = [
    {
      value: `${stats?.activeTrainers || 0}/${stats?.totalTrainers || 0}`,
      label: "Активных тренеров",
      icon: <UserCheck className="w-5 h-5 text-blue-600" />,
      color: "from-blue-100 to-blue-50",
    },
    {
      value: (stats?.todayBookings || 0).toString(),
      label: "Сегодня записей",
      icon: <CalendarCheck className="w-5 h-5 text-green-600" />,
      color: "from-green-100 to-green-50",
    },
    {
      value: (stats?.newClients || 0).toString(),
      label: "Новых клиентов",
      icon: <UserPlus className="w-5 h-5 text-purple-600" />,
      color: "from-purple-100 to-purple-50",
    },
    {
      value: `${((stats?.monthlyRevenue || 0) / 1000).toFixed(0)}K`,
      label: "Доход за месяц",
      icon: <CreditCard className="w-5 h-5 text-orange-600" />,
      color: "from-orange-100 to-orange-50",
    },
  ];

  return (
    <div className="hidden 2xl:grid grid-cols-4 gap-5 w-full mt-4">
      {headerStats.map((stat, index) => (
        <div
          key={index}
          className={`
            flex items-center gap-4 px-5 py-3 rounded-lg border border-gray-200
            bg-gradient-to-br ${stat.color} shadow-sm hover:shadow-md transition-shadow cursor-default
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

ManagerStatsComponent.displayName = "ManagerStatsComponent";
