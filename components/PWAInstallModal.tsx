// components/PWAInstallModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Smartphone, 
  Download, 
  X, 
  Wifi, 
  Zap, 
  Bell,
  Star,
  ArrowRight,
  Shield
} from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';
import usePWA from '@/hooks/usePWA';

export function PWAInstallModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [showAgain, setShowAgain] = useState(true);
  const { canInstall, isInstalled } = usePWA();

  useEffect(() => {
    // Проверяем настройки пользователя
    const dismissed = localStorage.getItem('pwa-install-modal-dismissed');
    const lastShown = localStorage.getItem('pwa-install-modal-last-shown');
    
    if (dismissed === 'true') {
      return;
    }

    // Показываем модал через 10 секунд после загрузки, если доступна установка
    if (canInstall && !isInstalled) {
      const now = Date.now();
      const dayInMs = 24 * 60 * 60 * 1000;
      
      // Не показываем чаще раза в день
      if (!lastShown || (now - parseInt(lastShown)) > dayInMs) {
        const timer = setTimeout(() => {
          setIsOpen(true);
          localStorage.setItem('pwa-install-modal-last-shown', now.toString());
        }, 10000);

        return () => clearTimeout(timer);
      }
    }
  }, [canInstall, isInstalled]);

  const handleClose = () => {
    setIsOpen(false);
    
    if (!showAgain) {
      localStorage.setItem('pwa-install-modal-dismissed', 'true');
    }
  };

  const handleInstallSuccess = () => {
    setIsOpen(false);
    localStorage.setItem('pwa-install-modal-dismissed', 'true');
  };

  const features = [
    {
      icon: Zap,
      title: "Быстрый доступ",
      description: "Запуск с рабочего стола"
    },
    {
      icon: Wifi,
      title: "Работа офлайн",
      description: "Функции доступны без интернета"
    },
    {
      icon: Bell,
      title: "Уведомления",
      description: "Push-уведомления о событиях"
    },
    {
      icon: Shield,
      title: "Безопасность",
      description: "Надежная работа и данные"
    }
  ];

  if (!canInstall || isInstalled) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Smartphone className="h-6 w-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-lg">Установить FitFlow Pro</DialogTitle>
                <Badge variant="secondary" className="mt-1">
                  PWA Приложение
                </Badge>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DialogDescription className="text-base">
            Получите полноценное приложение прямо в браузере с нативными возможностями
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Особенности PWA */}
          <div className="grid grid-cols-2 gap-3">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="p-3 bg-gray-50 rounded-lg text-center"
              >
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <feature.icon className="h-4 w-4 text-blue-600" />
                </div>
                <div className="text-sm font-medium text-gray-900 mb-1">
                  {feature.title}
                </div>
                <div className="text-xs text-gray-600">
                  {feature.description}
                </div>
              </div>
            ))}
          </div>

          {/* Преимущества */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Star className="h-5 w-5 text-yellow-500" />
              <span className="font-semibold text-gray-900">Почему стоит установить?</span>
            </div>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <ArrowRight className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <span>Быстрая загрузка и плавная работа</span>
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <span>Работает даже при слабом интернете</span>
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <span>Автоматические обновления</span>
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <span>Занимает минимум места на устройстве</span>
              </li>
            </ul>
          </div>

          {/* Кнопки действий */}
          <div className="space-y-3">
            <PWAInstallButton 
              className="w-full h-12 text-base" 
              onInstall={handleInstallSuccess}
            />
            
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!showAgain}
                  onChange={(e) => setShowAgain(!e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-gray-600">Больше не показывать</span>
              </label>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="text-gray-500 hover:text-gray-700"
              >
                Позже
              </Button>
            </div>
          </div>

          {/* Информация о безопасности */}
          <div className="text-xs text-gray-500 text-center bg-gray-50 p-3 rounded">
            <Shield className="h-4 w-4 inline mr-1" />
            Безопасная установка через браузер. Никакого вредоносного ПО.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
