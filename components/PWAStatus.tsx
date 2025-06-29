// components/PWAStatus.tsx
'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { 
  Wifi, 
  WifiOff, 
  Smartphone, 
  Download, 
  Check,
  AlertCircle 
} from 'lucide-react';
import usePWA from '@/hooks/usePWA';

interface PWAStatusProps {
  showDetails?: boolean;
  className?: string;
}

export function PWAStatus({ showDetails = false, className }: PWAStatusProps) {
  const { isInstalled, canInstall, isOnline } = usePWA();
  const [swStatus, setSWStatus] = useState<'active' | 'inactive' | 'loading'>('loading');

  useEffect(() => {
    // Проверка Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready
        .then(() => setSWStatus('active'))
        .catch(() => setSWStatus('inactive'));
    } else {
      setSWStatus('inactive');
    }
  }, []);

  if (!showDetails) {
    // Простое отображение статуса
    if (isInstalled) {
      return (
        <Badge variant="default" className={className}>
          <Smartphone className="h-3 w-3 mr-1" />
          PWA
        </Badge>
      );
    }
    
    if (canInstall) {
      return (
        <Badge variant="outline" className={className}>
          <Download className="h-3 w-3 mr-1" />
          Доступно
        </Badge>
      );
    }

    return null;
  }

  // Детальное отображение
  return (
    <div className={className}>
      <div className="flex items-center gap-2 mb-2">
        {/* PWA статус */}
        {isInstalled ? (
          <Badge variant="default" className="bg-green-500/20 text-green-400 border-green-500/30">
            <Check className="h-3 w-3 mr-1" />
            Установлено
          </Badge>
        ) : canInstall ? (
          <Badge variant="outline" className="border-blue-500/30 text-blue-400">
            <Download className="h-3 w-3 mr-1" />
            Можно установить
          </Badge>
        ) : (
          <Badge variant="outline" className="border-gray-500/30 text-gray-400">
            <AlertCircle className="h-3 w-3 mr-1" />
            Недоступно
          </Badge>
        )}

        {/* Сетевой статус */}
        {isOnline ? (
          <Badge variant="outline" className="border-green-500/30 text-green-400">
            <Wifi className="h-3 w-3 mr-1" />
            Онлайн
          </Badge>
        ) : (
          <Badge variant="outline" className="border-red-500/30 text-red-400">
            <WifiOff className="h-3 w-3 mr-1" />
            Офлайн
          </Badge>
        )}

        {/* Service Worker статус */}
        <Badge 
          variant="outline" 
          className={
            swStatus === 'active' 
              ? "border-green-500/30 text-green-400" 
              : "border-gray-500/30 text-gray-400"
          }
        >
          <div className={`w-2 h-2 rounded-full mr-1 ${
            swStatus === 'active' ? 'bg-green-400' : 'bg-gray-400'
          } ${swStatus === 'loading' ? 'animate-pulse' : ''}`} />
          SW
        </Badge>
      </div>
    </div>
  );
}
