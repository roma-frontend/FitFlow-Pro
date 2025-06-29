// components/PWAInfo.tsx - Адаптивная версия
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PWAInstallButton } from './PWAInstallButton';
import { PWAStatus } from './PWAStatus';
import { Smartphone, Wifi, Shield, Zap } from 'lucide-react';
import usePWA from '@/hooks/usePWA';

interface PWAInfoProps {
  compact?: boolean;
  showActions?: boolean;
  className?: string;
}

export function PWAInfo({ compact = false, showActions = false, className }: PWAInfoProps) {
  const { canInstall, isInstalled, isOnline } = usePWA();

  if (compact) {
    return (
      <Card className={`w-full ${className}`}>
        <CardHeader className="pb-3">
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            <Smartphone className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
            <span className="truncate">PWA Приложение</span>
            <PWAStatus showDetails={false} />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-gray-600">
            Современное веб-приложение с возможностью работы офлайн
          </p>
          
          {showActions && canInstall && (
            <PWAInstallButton 
              variant="default"
              size="sm"
              className="w-full"
            />
          )}
          
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Wifi className="h-3 w-3" />
              <span>{isOnline ? 'Онлайн' : 'Офлайн'}</span>
            </div>
            <div className="flex items-center gap-1">
              <Shield className="h-3 w-3" />
              <span>Безопасно</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Полная версия для больших экранов
  return (
    <Card className={`w-full ${className}`}>
      <CardHeader>
        <CardTitle className="text-xl text-center flex flex-col xl:flex-row items-start xl:items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Smartphone className="h-5 w-5 text-white" />
          </div>
          <div className='flex flex-col items-start gap-2'>
            <div>FitFlow Pro PWA</div>
            <PWAStatus showDetails={true} />
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-gray-600">
          Установите наше прогрессивное веб-приложение для лучшего опыта использования
        </p>
        
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <Zap className="h-4 w-4 text-yellow-500" />
            <span>Быстрая загрузка</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Wifi className="h-4 w-4 text-green-500" />
            <span>Работа офлайн</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Shield className="h-4 w-4 text-blue-500" />
            <span>Безопасность</span>
          </div>
        </div>

        {canInstall && (
          <PWAInstallButton 
            variant="default"
            className="w-full"
          />
        )}
      </CardContent>
    </Card>
  );
}
