// components/admin/users/UserStats.tsx (обновленная версия)
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Crown, Shield, Settings, Dumbbell, User, TrendingUp, Sparkles } from "lucide-react";
import { User as UserType } from "@/types/user";

interface UserStatsProps {
  users: UserType[];
}

export function UserStats({ users }: UserStatsProps) {
  const stats = [
    {
      title: "Супер Админы",
      count: users.filter(u => u.role === 'super-admin').length,
      icon: Crown,
      gradient: "from-purple-500 to-pink-500",
      bgGradient: "from-purple-50 to-pink-50",
      shadowColor: "shadow-purple-200"
    },
    {
      title: "Администраторы", 
      count: users.filter(u => u.role === 'admin').length,
      icon: Shield,
      gradient: "from-red-500 to-orange-500",
      bgGradient: "from-red-50 to-orange-50",
      shadowColor: "shadow-red-200"
    },
    {
      title: "Менеджеры",
      count: users.filter(u => u.role === 'manager').length,
      icon: Settings,
      gradient: "from-blue-500 to-cyan-500",
      bgGradient: "from-blue-50 to-cyan-50",
      shadowColor: "shadow-blue-200"
    },
    {
      title: "Тренеры",
      count: users.filter(u => u.role === 'trainer').length,
      icon: Dumbbell,
      gradient: "from-green-500 to-emerald-500",
      bgGradient: "from-green-50 to-emerald-50",
      shadowColor: "shadow-green-200"
    },
    {
      title: "Участники",
      count: users.filter(u => u.role === 'member').length,
      icon: User,
      gradient: "from-gray-500 to-slate-500",
      bgGradient: "from-gray-50 to-slate-50",
      shadowColor: "shadow-gray-200"
    },
    {
      title: "Активные",
      count: users.filter(u => u.isActive).length,
      icon: TrendingUp,
      gradient: "from-emerald-500 to-teal-500",
      bgGradient: "from-emerald-50 to-teal-50",
      shadowColor: "shadow-emerald-200"
    }
  ];

  return (
    <div className="grid md:grid-cols-2 2xl:grid-cols-3 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card 
            key={stat.title} 
            className={`group hover:shadow-xl transition-all duration-500 border-0 bg-gradient-to-br ${stat.bgGradient} hover:scale-105 relative overflow-hidden`}
          >
            {/* Animated background */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600 group-hover:text-gray-700 transition-colors">
                    {stat.title}
                  </p>
                  <p className={`text-3xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>
                    {stat.count}
                  </p>
                </div>
                <div className="relative">
                  <div className={`absolute inset-0 bg-gradient-to-r ${stat.gradient} rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-500`}></div>
                  <div className={`relative p-3 bg-gradient-to-r ${stat.gradient} rounded-2xl shadow-lg group-hover:shadow-xl transition-shadow duration-500`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
              
              {/* Sparkle effect */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <Sparkles className="h-4 w-4 text-gray-400" />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
