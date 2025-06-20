// components/MobileMenu.tsx - Мобильное меню с PWA
'use client';

import { useState } from 'react';
import { PWAInstallButton } from '@/components/PWAInstallButton';
import { PWAStatus } from '@/components/PWAStatus';
import usePWA from '@/hooks/usePWA';
import { Download, Menu, Settings, Smartphone, Wifi, WifiOff } from 'lucide-react';

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { canInstall, isInstalled, isOnline } = usePWA();

  return (
    <div className="lg:hidden">
      {/* Кнопка меню */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Выпадающее меню */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 bg-white shadow-lg border-t z-50">
          <div className="p-4 space-y-4">
            
            {/* PWA статус в мобильном меню */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium">Статус приложения:</span>
              <PWAStatus showDetails={true} />
            </div>

            {/* PWA кнопка установки */}
            {canInstall && (
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-3 mb-3">
                  <Smartphone className="h-5 w-5 text-blue-600" />
                  <div>
                    <div className="font-medium text-blue-900">Установить приложение</div>
                    <div className="text-sm text-blue-700">Быстрый доступ с главного экрана</div>
                  </div>
                </div>
                <PWAInstallButton size="sm" className="w-full" />
              </div>
            )}

            {/* Индикатор сети */}
            <div className={`flex items-center gap-2 p-2 rounded-lg ${
              isOnline ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}>
              {isOnline ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
              <span className="text-sm">
                {isOnline ? 'Подключено к интернету' : 'Работа в офлайн режиме'}
              </span>
            </div>

            {/* Обычные пункты меню */}
            <nav className="space-y-2">
              {/* ... остальные пункты меню */}
            </nav>

            {/* PWA ссылки */}
            {isInstalled && (
              <div className="pt-3 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Настройки приложения</h4>
                <div className="space-y-1">
                  <a href="/pwa" className="flex items-center gap-2 p-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg">
                    <Settings className="h-4 w-4" />
                    PWA настройки
                  </a>
                  <a href="/offline" className="flex items-center gap-2 p-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg">
                    <Download className="h-4 w-4" />
                    Офлайн контент
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
