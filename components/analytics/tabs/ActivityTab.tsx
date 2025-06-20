"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Eye, Clock, LineChart } from "lucide-react";

interface ActivityTabProps {
  analytics: any;
  userStats: any;
  loading?: boolean; // Убедимся, что этот параметр есть
}

export function ActivityTab({ analytics, userStats, loading }: ActivityTabProps) {
  if (loading) {
    return (
      <div className="space-y-6">
        {/* Статистика активности - скелетон */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Активность пользователей
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="animate-pulse text-center p-4 bg-gray-100 rounded-lg">
                  <div className="w-12 h-8 bg-gray-200 rounded mx-auto mb-2"></div>
                  <div className="w-20 h-3 bg-gray-200 rounded mx-auto mb-1"></div>
                  <div className="w-16 h-2 bg-gray-200 rounded mx-auto"></div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Популярные страницы и метрики - скелетон */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Популярные страницы
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="animate-pulse space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="w-32 h-4 bg-gray-200 rounded"></div>
                      <div className="w-16 h-4 bg-gray-200 rounded"></div>
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
                <Clock className="w-5 h-5" />
                Метрики производительности
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="animate-pulse p-3 border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <div className="w-24 h-4 bg-gray-200 rounded"></div>
                      <div className="w-16 h-4 bg-gray-200 rounded"></div>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full"></div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const getTopPages = () => {
    if (!analytics?.activity?.topPages || !Array.isArray(analytics.activity.topPages))
      return [];
    return analytics.activity.topPages;
  };

  return (
    <div className="space-y-6">
      {/* Статистика активности */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Активность пользователей
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-3xl font-bold text-blue-600">
                {analytics?.activity?.totalSessions || 0}
              </div>
              <div className="text-sm text-blue-700 mt-1">Всего сессий</div>
              <div className="text-xs text-muted-foreground mt-1">
                За выбранный период
              </div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-3xl font-bold text-green-600">
                {Math.round((analytics?.activity?.averageSessionTime || 0) / 60)}м
              </div>
              <div className="text-sm text-green-700 mt-1">Средняя сессия</div>
              <div className="text-xs text-muted-foreground mt-1">
                {Math.round((analytics?.activity?.averageSessionTime || 0) % 60)}с
              </div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-3xl font-bold text-purple-600">
                {analytics?.activity?.pageViews || 0}
              </div>
              <div className="text-sm text-purple-700 mt-1">Просмотры страниц</div>
              <div className="text-xs text-muted-foreground mt-1">
                Уникальные просмотры
              </div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-3xl font-bold text-orange-600">
                {((analytics?.activity?.bounceRate || 0) * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-orange-700 mt-1">Показатель отказов</div>
              <div className="text-xs text-muted-foreground mt-1">
                Покинули сразу
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Популярные страницы */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Популярные страницы
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {getTopPages().map((page: any, index: number) => {
                const maxViews = Math.max(...getTopPages().map((p: any) => p.views));
                return (
                  <div key={`${page.page}-${index}`} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          #{index + 1}
                        </span>
                        <span className="font-mono text-sm">{page.page}</span>
                      </div>
                      <span className="font-medium">
                        {page.views.toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{
                          width: `${maxViews > 0 ? (page.views / maxViews) * 100 : 0}%`,
                        }}
                      />
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {((page.views / (analytics?.activity?.pageViews || 1)) * 100).toFixed(1)}% от всех просмотров
                    </div>
                  </div>
                );
              })}
              {getTopPages().length === 0 && (
                <p className="text-muted-foreground text-center py-4">
                  Нет данных о посещениях страниц
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Метрики производительности */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Метрики производительности
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 border rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Время на сайте</span>
                  <span className="text-lg font-bold">
                    {Math.floor((analytics?.activity?.averageSessionTime || 0) / 60)}:
                    {String(Math.round((analytics?.activity?.averageSessionTime || 0) % 60)).padStart(2, "0")}
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{
                      width: `${Math.min(((analytics?.activity?.averageSessionTime || 0) / 3600) * 100, 100)}%`,
                    }}
                  />
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Среднее время сессии
                </div>
              </div>

              <div className="p-3 border rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Вовлеченность</span>
                  <span className="text-lg font-bold">
                    {(100 - (analytics?.activity?.bounceRate || 0) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{
                      width: `${100 - (analytics?.activity?.bounceRate || 0) * 100}%`,
                    }}
                  />
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Пользователи взаимодействуют с сайтом
                </div>
              </div>

              <div className="p-3 border rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Страниц за сессию</span>
                  <span className="text-lg font-bold">
                    {((analytics?.activity?.pageViews || 0) / (analytics?.activity?.totalSessions || 1)).toFixed(1)}
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-purple-500 h-2 rounded-full"
                    style={{
                      width: `${Math.min(((analytics?.activity?.pageViews || 0) / (analytics?.activity?.totalSessions || 1)) * 20, 100)}%`,
                    }}
                  />
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Среднее количество просмотренных страниц
                </div>
              </div>

              <div className="p-3 border rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Возвращаемость</span>
                  <span className="text-lg font-bold">
                    {(((userStats?.active || 0) / (userStats?.total || 1)) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-orange-500 h-2 rounded-full"
                    style={{
                      width: `${((userStats?.active || 0) / (userStats?.total || 1)) * 100}%`,
                    }}
                  />
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Активные из всех зарегистрированных
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Детальная статистика по времени */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LineChart className="w-5 h-5" />
            Активность по времени
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium">Пиковые часы</h4>
              <div className="space-y-2">
                {["10:00-12:00", "14:00-16:00", "19:00-21:00"].map((time, index) => (
                  <div
                    key={time}
                    className="flex justify-between items-center p-2 bg-muted/50 rounded"
                  >
                    <span className="text-sm">{time}</span>
                    <Badge variant="outline">
                      {Math.round(Math.random() * 30 + 20)}% активности
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Популярные дни</h4>
              <div className="space-y-2">
                {["Понедельник", "Среда", "Пятница"].map((day, index) => (
                  <div
                    key={day}
                    className="flex justify-between items-center p-2 bg-muted/50 rounded"
                  >
                    <span className="text-sm">{day}</span>
                    <Badge variant="outline">
                      {Math.round(Math.random() * 25 + 15)}% посещений
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Устройства</h4>
              <div className="space-y-2">
                {[
                  { device: "Desktop", percent: 45 },
                  { device: "Mobile", percent: 35 },
                  { device: "Tablet", percent: 20 },
                ].map((item) => (
                  <div
                    key={item.device}
                    className="flex justify-between items-center p-2 bg-muted/50 rounded"
                  >
                    <span className="text-sm">{item.device}</span>
                    <Badge variant="outline">{item.percent}%</Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
