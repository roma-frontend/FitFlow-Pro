// app/admin/users/components/tabs/AnalyticsTab.tsx
"use client";

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Calendar,
  Activity,
  Clock,
  UserPlus,
  UserMinus
} from "lucide-react";
import { useUsersPage } from '../../providers/UsersPageProvider';

export const AnalyticsTab = React.memo(() => {
  const { state } = useUsersPage();

  // Вычисляем аналитику
  const analytics = useMemo(() => {
    const users = state.users;
    const now = new Date();
    
    // Статистика по ролям
    const roleStats = users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Статистика по активности
    const activeUsers = users.filter(u => u.isActive).length;
    const inactiveUsers = users.length - activeUsers;

    // Регистрации за последние 30 дней
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);
    const recentRegistrations = users.filter(user => 
      new Date(user.createdAt || 0) > last30Days
    ).length;

    // Регистрации за последние 7 дней
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);
    const weeklyRegistrations = users.filter(user => 
      new Date(user.createdAt || 0) > last7Days
    ).length;

    // Тренд регистраций по дням (последние 7 дней)
    const registrationTrend = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));
      
      const count = users.filter(user => {
        const createdAt = new Date(user.createdAt || 0);
        return createdAt >= dayStart && createdAt <= dayEnd;
      }).length;

      return {
        date: dayStart.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' }),
        count
      };
    });

    // Процент роста за месяц
    const last60Days = new Date();
    last60Days.setDate(last60Days.getDate() - 60);
    const previousMonthRegistrations = users.filter(user => {
      const createdAt = new Date(user.createdAt || 0);
      return createdAt > last60Days && createdAt <= last30Days;
    }).length;

    const growthRate = previousMonthRegistrations > 0 
      ? ((recentRegistrations - previousMonthRegistrations) / previousMonthRegistrations) * 100
      : recentRegistrations > 0 ? 100 : 0;

    return {
      total: users.length,
      activeUsers,
      inactiveUsers,
      roleStats,
      recentRegistrations,
      weeklyRegistrations,
      registrationTrend,
      growthRate,
      activePercentage: users.length > 0 ? Math.round((activeUsers / users.length) * 100) : 0
    };
  }, [state.users]);

  const roleLabels = {
    super_admin: 'Супер админы',
    admin: 'Администраторы',
    manager: 'Менеджеры',
    trainer: 'Тренеры',
    member: 'Участники'
  };

  const roleColors = {
    super_admin: 'bg-purple-500',
    admin: 'bg-red-500',
    manager: 'bg-blue-500',
    trainer: 'bg-green-500',
    member: 'bg-gray-500'
  };

  return (
    <div className="space-y-8">
      {/* Основная статистика */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Всего пользователей</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.total}</div>
            <p className="text-xs text-gray-600 mt-1">
              {analytics.activePercentage}% активных
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">За месяц</CardTitle>
            <UserPlus className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.recentRegistrations}</div>
            <p className="text-xs text-gray-600 mt-1">
              {analytics.growthRate > 0 ? '+' : ''}{analytics.growthRate.toFixed(1)}% к предыдущему
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">За неделю</CardTitle>
            <Calendar className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.weeklyRegistrations}</div>
            <p className="text-xs text-gray-600 mt-1">
              Новых регистраций
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Активность</CardTitle>
            <Activity className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.activePercentage}%</div>
            <p className="text-xs text-gray-600 mt-1">
              {analytics.activeUsers} из {analytics.total}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Графики */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Распределение по ролям */}
        <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Распределение по ролям
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(analytics.roleStats).map(([role, count]) => {
                const percentage = analytics.total > 0 ? (count / analytics.total) * 100 : 0;
                return (
                  <div key={role} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">
                        {roleLabels[role as keyof typeof roleLabels] || role}
                      </span>
                      <span className="text-gray-600">
                        {count} ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          roleColors[role as keyof typeof roleColors] || 'bg-gray-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Тренд регистраций */}
        <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Регистрации за неделю
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.registrationTrend.map((day, index) => {
                const maxCount = Math.max(...analytics.registrationTrend.map(d => d.count));
                const percentage = maxCount > 0 ? (day.count / maxCount) * 100 : 0;
                
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{day.date}</span>
                      <span className="text-gray-600">{day.count}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Детальная статистика */}
      <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Детальная статистика
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <UserPlus className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600">
                {analytics.activeUsers}
              </div>
              <div className="text-sm text-gray-600">Активные пользователи</div>
            </div>
            
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <UserMinus className="h-8 w-8 text-red-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-red-600">
                {analytics.inactiveUsers}
              </div>
              <div className="text-sm text-gray-600">Неактивные пользователи</div>
            </div>
            
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <TrendingUp className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-600">
                {analytics.growthRate > 0 ? '+' : ''}{analytics.growthRate.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Рост за месяц</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

AnalyticsTab.displayName = 'AnalyticsTab';
