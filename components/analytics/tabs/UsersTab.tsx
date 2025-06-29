"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BarChart3, CheckCircle, Calendar, Activity } from "lucide-react";

interface UsersTabProps {
  userStats: any;
  loading?: boolean;
}

export function UsersTab({ userStats, loading }: UsersTabProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Пользователи по ролям
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="animate-pulse space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="w-20 h-4 bg-gray-200 rounded"></div>
                    <div className="w-24 h-4 bg-gray-200 rounded"></div>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full"></div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Статистика пользователей
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="animate-pulse p-3 bg-gray-100 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div className="w-32 h-4 bg-gray-200 rounded"></div>
                    <div className="w-16 h-6 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getUserRoleEntries = () => {
    if (!userStats?.byRole) return [];
    return Object.entries(userStats.byRole);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Пользователи по ролям */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Пользователи по ролям
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {getUserRoleEntries().map(([role, data]: [string, any]) => (
              <div key={role} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="capitalize font-medium">{role}</span>
                  <span className="text-sm text-muted-foreground">
                    {data.count} пользователей
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>Активных: {data.active}</span>
                    <span>
                      {data.count > 0 ? ((data.active / data.count) * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{
                        width: `${data.count > 0 ? (data.active / data.count) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
            {getUserRoleEntries().length === 0 && (
              <p className="text-muted-foreground text-center py-4">
                Нет данных о ролях пользователей
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Статистика пользователей */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Статистика пользователей
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-500" />
                <span className="font-medium">Всего пользователей</span>
              </div>
              <span className="text-xl font-bold">
                {userStats?.total || 0}
              </span>
            </div>

            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="font-medium">Активные</span>
              </div>
              <span className="text-xl font-bold text-green-600">
                {userStats?.active || 0}
              </span>
            </div>

            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-500" />
                <span className="font-medium">Новые за период</span>
              </div>
              <span className="text-xl font-bold text-purple-600">
                {userStats?.newInPeriod || 0}
              </span>
            </div>

            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-orange-500" />
                <span className="font-medium">Уровень активности</span>
              </div>
              <span className="text-xl font-bold text-orange-600">
                {((userStats?.activityRate || 0) * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
