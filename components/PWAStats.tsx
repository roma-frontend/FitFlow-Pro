// components/PWAStats.tsx - Упрощенная версия статистики
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { HardDrive, Wifi, Smartphone, RefreshCw, Trash2 } from 'lucide-react';
import usePWA from '@/hooks/usePWA';

interface CacheStats {
  totalSize: number;
  cacheCount: number;
}

export function PWAStats() {
  const { isInstalled, isOnline } = usePWA();
  const [cacheStats, setCacheStats] = useState<CacheStats>({ totalSize: 0, cacheCount: 0 });
  const [isLoading, setIsLoading] = useState(true);

  const loadCacheStats = async () => {
    try {
      setIsLoading(true);
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        const appCaches = cacheNames.filter(name => name.includes('FitFlow-Pro'));
        
        // Примерный расчет размера
        const totalSize = appCaches.length * 2048; // 2KB на кеш (примерно)
        
        setCacheStats({
          totalSize,
          cacheCount: appCaches.length
        });
      }
    } catch (error) {
      console.error('Failed to load cache stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearCache = async () => {
    try {
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
        await loadCacheStats();
      }
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  useEffect(() => {
    loadCacheStats();
  }, []);

  return (
    <div className="space-y-6">
      {/* Общая статистика */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Сеть</CardTitle>
            <Wifi className={`h-4 w-4 ${isOnline ? 'text-green-600' : 'text-red-600'}`} />
          </CardHeader>
          <CardContent>
            <Badge variant={isOnline ? 'default' : 'destructive'}>
              {isOnline ? 'Онлайн' : 'Офлайн'}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Статус</CardTitle>
            <Smartphone className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <Badge variant={isInstalled ? 'special' : 'outline'} className='text-blue-600'>
              {isInstalled ? 'Установлено' : 'Веб-версия'}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Кеш</CardTitle>
            <HardDrive className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl 2xl:text-2xl font-bold">
              {formatBytes(cacheStats.totalSize)}
            </div>
            <p className="text-xs text-muted-foreground">
              {cacheStats.cacheCount} кешей
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Управление кешем */}
      <Card>
        <CardHeader>
          <div className="flex flex-col xl:flex-row items-start gap-4 xl:gap-0 xl:items-center justify-between">
            <div className='grid gap-2 lg:gap-0'>
              <CardTitle>Управление кешем</CardTitle>
              <CardDescription>
                Очистка кешированных данных
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={loadCacheStats}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Обновить
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={clearCache}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Очистить
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">Загрузка...</div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              <HardDrive className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Размер кеша: {formatBytes(cacheStats.totalSize)}</p>
              <p className="text-sm">Кешей: {cacheStats.cacheCount}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
