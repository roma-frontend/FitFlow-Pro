// Продолжение пункта 8. Обновляем компоненты уведомлений

// components/notifications/PWAToast.tsx - PWA уведомления
'use client';

import { toast } from '@/hooks/use-toast';
import { PWAInstallButton } from '@/components/PWAInstallButton';
import { Smartphone, Download, Wifi, WifiOff } from 'lucide-react';

export const showPWAInstallToast = () => {
  toast({
    title: "Установите приложение",
    description: (
      <div className="space-y-3">
        <p>Получите быстрый доступ и работу офлайн</p>
        <PWAInstallButton size="sm" className="w-full" />
      </div>
    ),
    duration: 10000,
  });
};

export const showOfflineToast = () => {
  toast({
    title: "Работа в офлайн режиме",
    description: (
      <div className="flex items-center gap-2">
        <WifiOff className="h-4 w-4 text-orange-500" />
        <span>Некоторые функции могут быть ограничены</span>
      </div>
    ),
    variant: "destructive",
  });
};

export const showOnlineToast = () => {
  toast({
    title: "Подключение восстановлено",
    description: (
      <div className="flex items-center gap-2">
        <Wifi className="h-4 w-4 text-green-500" />
        <span>Все функции доступны</span>
      </div>
    ),
  });
};

export const showPWAUpdateToast = () => {
  toast({
    title: "Обновление доступно",
    description: (
      <div className="space-y-3">
        <p>Новая версия приложения готова к установке</p>
        <button 
          onClick={() => window.location.reload()}
          className="w-full py-2 px-3 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
        >
          Обновить сейчас
        </button>
      </div>
    ),
    duration: 15000,
  });
};
