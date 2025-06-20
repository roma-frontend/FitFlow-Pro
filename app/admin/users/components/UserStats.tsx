// app/admin/users/components/UserStats.tsx
"use client";

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, UserX, Crown, Shield, User } from "lucide-react";
import { User as UserType } from "@/types/user";

interface UserStatsProps {
  users: UserType[];
}

export const UserStats = React.memo<UserStatsProps>(({ users }) => {
  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter(u => u.isActive).length;
    const inactive = total - active;
    
    const byRole = users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const recentUsers = users.filter(user => {
      const createdAt = new Date(user.createdAt || 0);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return createdAt > weekAgo;
    }).length;

    return {
      total,
      active,
      inactive,
      byRole,
      recentUsers,
      activePercentage: total > 0 ? Math.round((active / total) * 100) : 0
    };
  }, [users]);

  const statCards = [
    {
      title: "Всего пользователей",
      value: stats.total,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      change: `+${stats.recentUsers} за неделю`
    },
    {
      title: "Активные",
      value: stats.active,
      icon: UserCheck,
      color: "text-green-600",
      bgColor: "bg-green-50",
      change: `${stats.activePercentage}% от общего`
    },
    {
      title: "Неактивные",
      value: stats.inactive,
      icon: UserX,
      color: "text-red-600",
      bgColor: "bg-red-50",
      change: `${100 - stats.activePercentage}% от общего`
    },
    {
      title: "Администраторы",
      value: (stats.byRole['super-admin'] || 0) + (stats.byRole.admin || 0),
      icon: Crown,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      change: "Высшие права"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg hover:shadow-xl transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {stat.value.toLocaleString()}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {stat.change}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
});

UserStats.displayName = 'UserStats';
