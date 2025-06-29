// components/admin/users/QuickActions.tsx (обновленная версия)
"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  UserCheck, 
  Download,
  Zap,
  AlertTriangle,
  Sparkles,
  TrendingUp,
  Clock
} from "lucide-react";
import { User, UserRole } from "@/types/user";

interface QuickActionsProps {
  users: User[];
  userRole: UserRole;
  onBulkAction: (action: string, userIds: string[]) => void;
}

export function QuickActions({ users, userRole, onBulkAction }: QuickActionsProps) {

  const inactiveUsers = users.filter(u => !u.isActive);
  const recentUsers = users.filter(u => 
    u.createdAt && Date.now() - u.createdAt < 7 * 24 * 60 * 60 * 1000
  );

  const quickActions = [
    {
      title: "Активировать неактивных",
      description: `${inactiveUsers.length} пользователей`,
      icon: UserCheck,
      gradient: "from-green-500 to-emerald-500",
      bgGradient: "from-green-50 to-emerald-50",
      action: () => onBulkAction('activate', inactiveUsers.map(u => u.id)),
      disabled: inactiveUsers.length === 0
    },
    {
      title: "Экспорт данных",
      description: "Скачать CSV файл",
      icon: Download,
      gradient: "from-blue-500 to-cyan-500",
      bgGradient: "from-blue-50 to-cyan-50",
      action: () => onBulkAction('export', users.map(u => u.id)),
      disabled: users.length === 0
    },
    {
      title: "Массовая рассылка",
      description: "Отправить уведомление",
      icon: Zap,
      gradient: "from-purple-500 to-pink-500",
      bgGradient: "from-purple-50 to-pink-50",
      action: () => onBulkAction('notify', users.filter(u => u.isActive).map(u => u.id)),
      disabled: users.filter(u => u.isActive).length === 0
    }
  ];

  return (
    <div className="space-y-6">
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <span className="bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Быстрые действия
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Activity Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Recent Activity */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200/50 rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-2xl"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl shadow-lg">
                      <TrendingUp className="h-5 w-5 text-white" />
                    </div>
                    <h4 className="font-bold text-blue-900">Недавняя активность</h4>
                  </div>
                  <Badge className="bg-blue-500 text-white px-3 py-1 shadow-lg">
                    {recentUsers.length} новых
                  </Badge>
                </div>
                <p className="text-sm text-blue-700 leading-relaxed">
                  {recentUsers.length > 0 
                    ? `${recentUsers.length} пользователей зарегистрировано за последние 7 дней`
                    : 'Нет новых регистраций за последние 7 дней'
                  }
                </p>
              </div>
            </div>

            {/* Warning for inactive users */}
            {inactiveUsers.length > 0 && (
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200/50 rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-yellow-400/20 to-orange-400/20 rounded-full blur-2xl"></div>
                <div className="relative">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl shadow-lg">
                      <AlertTriangle className="h-5 w-5 text-white" />
                    </div>
                    <h4 className="font-bold text-yellow-900">Требует внимания</h4>
                  </div>
                  <p className="text-sm text-yellow-700 leading-relaxed">
                    {inactiveUsers.length} неактивных пользователей требуют проверки
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <div 
                  key={action.title}
                  className={`group bg-gradient-to-br ${action.bgGradient} border border-white/20 rounded-2xl p-6 transition-all duration-500 hover:shadow-2xl hover:scale-105 relative overflow-hidden`}
                >
                  {/* Animated background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <div className="relative">
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`p-3 bg-gradient-to-r ${action.gradient} rounded-2xl shadow-lg group-hover:shadow-xl transition-shadow duration-500`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h5 className="font-bold text-gray-900 group-hover:text-gray-800 transition-colors">
                          {action.title}
                        </h5>
                        <p className="text-sm text-gray-600 mt-1">{action.description}</p>
                      </div>
                    </div>
                    
                    <Button 
                      size="sm" 
                      disabled={action.disabled}
                      onClick={action.action}
                      className={`w-full h-10 bg-gradient-to-r ${action.gradient} hover:shadow-lg transition-all duration-300 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      Выполнить
                    </Button>
                  </div>

                  {/* Sparkle effect */}
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <Sparkles className="h-4 w-4 text-gray-400 animate-pulse" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Additional Stats */}
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 border border-gray-200/50 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-gray-600" />
                <div>
                  <h4 className="font-semibold text-gray-900">Статистика системы</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Общий обзор активности пользователей
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">{users.length}</p>
                <p className="text-sm text-gray-600">Всего пользователей</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

                
