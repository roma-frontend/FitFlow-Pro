// components/PWAAnalytics.tsx - Версия без recharts
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, 
  Download, 
  Wifi, 
  Clock, 
  Users, 
  Smartphone,
  TrendingUp,
  BarChart3,
  PieChart
} from 'lucide-react';

interface PWAMetrics {
  installRate: number;
  offlineUsage: number;
  cacheHitRate: number;
  avgLoadTime: number;
  activeUsers: number;
  totalSessions: number;
  retentionRate: number;
}

interface UsageData {
  date: string;
  online: number;
  offline: number;
  total: number;
}

export function PWAAnalytics() {
  const [metrics, setMetrics] = useState<PWAMetrics | null>(null);
  const [usageData, setUsageData] = useState<UsageData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      // Для демонстрации используем mock данные
      // В реальном проекте здесь будут API вызовы
      setTimeout(() => {
        setMetrics({
          installRate: 34,
          offlineUsage: 15,
          cacheHitRate: 87,
          avgLoadTime: 650,
          activeUsers: 1247,
          totalSessions: 8934,
          retentionRate: 68
        });

        setUsageData([
          { date: '01.12', online: 450, offline: 80, total: 530 },
          { date: '02.12', online: 520, offline: 95, total: 615 },
          { date: '03.12', online: 480, offline: 70, total: 550 },
          { date: '04.12', online: 610, offline: 110, total: 720 },
          { date: '05.12', online: 590, offline: 85, total: 675 },
          { date: '06.12', online: 670, offline: 120, total: 790 },
          { date: '07.12', online: 740, offline: 140, total: 880 },
        ]);

        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Failed to fetch PWA analytics:', error);
      setLoading(false);
    }
  };

  if (loading || !metrics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>PWA Аналитика</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Основные метрики */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Download className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {metrics.installRate}%
                </div>
                <div className="text-sm text-gray-600">Установок</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Wifi className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {metrics.cacheHitRate}%
                </div>
                <div className="text-sm text-gray-600">Cache Hit Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Clock className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {metrics.avgLoadTime}ms
                </div>
                <div className="text-sm text-gray-600">Среднее время</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {metrics.activeUsers.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Активных</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* График использования (простая CSS реализация) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Использование PWA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {usageData.map((data, index) => {
                const maxValue = Math.max(...usageData.map(d => d.total));
                const onlinePercent = (data.online / maxValue) * 100;
                const offlinePercent = (data.offline / maxValue) * 100;
                
                return (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-12 text-xs text-gray-600 font-medium">
                      {data.date}
                    </div>
                    <div className="flex-1 flex gap-1">
                      <div 
                        className="bg-green-500 h-6 rounded-l"
                        style={{ width: `${onlinePercent}%` }}
                        title={`Онлайн: ${data.online}`}
                      />
                      <div 
                        className="bg-yellow-500 h-6 rounded-r"
                        style={{ width: `${offlinePercent}%` }}
                        title={`Офлайн: ${data.offline}`}
                      />
                    </div>
                    <div className="w-12 text-xs text-gray-600 font-medium text-right">
                      {data.total}
                    </div>
                  </div>
                );
              })}
              <div className="flex items-center gap-4 mt-4 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  <span>Онлайн</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                  <span>Офлайн</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Круговая диаграмма (простая CSS реализация) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Режимы использования
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center">
              <div className="relative w-48 h-48">
                {/* Простая круговая диаграмма с CSS */}
                <div 
                  className="w-full h-full rounded-full border-8 border-green-500"
                  style={{
                    background: `conic-gradient(
                      #10b981 0deg ${(100 - metrics.offlineUsage) * 3.6}deg,
                      #f59e0b ${(100 - metrics.offlineUsage) * 3.6}deg 360deg
                    )`
                  }}
                />
                <div className="absolute inset-8 bg-white rounded-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {100 - metrics.offlineUsage}%
                    </div>
                    <div className="text-sm text-gray-600">Онлайн</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center gap-6 mt-6">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span className="text-sm">Онлайн ({100 - metrics.offlineUsage}%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                <span className="text-sm">Офлайн ({metrics.offlineUsage}%)</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Детальная статистика */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Детальная статистика
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">Установка и вовлечение</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Общие сессии</span>
                  <Badge variant="outline">{metrics.totalSessions.toLocaleString()}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Удержание</span>
                  <Badge variant="outline">{metrics.retentionRate}%</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Активные пользователи</span>
                  <Badge variant="outline">{metrics.activeUsers.toLocaleString()}</Badge>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">Производительность</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Cache Hit Rate</span>
                  <Badge 
                    variant={metrics.cacheHitRate > 80 ? "default" : "destructive"}
                  >
                    {metrics.cacheHitRate}%
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Среднее время загрузки</span>
                  <Badge 
                    variant={metrics.avgLoadTime < 1000 ? "default" : "destructive"}
                  >
                    {metrics.avgLoadTime}ms
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Офлайн использование</span>
                  <Badge variant="outline">{metrics.offlineUsage}%</Badge>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">Особенности PWA</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Standalone режим</span>
                  <Badge variant="outline">Поддерживается</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Push уведомления</span>
                  <Badge variant="outline">Активны</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Background Sync</span>
                  <Badge variant="outline">Включен</Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Дополнительная информация */}
      <Card>
        <CardHeader>
          <CardTitle>Техническая информация</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="font-semibold text-gray-900">Service Worker</div>
              <div className="text-green-600 mt-1">Активен</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="font-semibold text-gray-900">Кеш размер</div>
              <div className="text-blue-600 mt-1">15.2 MB</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="font-semibold text-gray-900">Версия PWA</div>
              <div className="text-purple-600 mt-1">2.1.0</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="font-semibold text-gray-900">Последнее обновление</div>
              <div className="text-orange-600 mt-1">2 часа назад</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
