"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X, Download, Smartphone, Monitor, Star } from 'lucide-react';
import usePWA from '@/hooks/usePWA';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

const PWAInstallBanner = () => {
  const { canInstall, installApp, deviceType } = usePWA();
  const [showBanner, setShowBanner] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Показываем баннер через 3 секунды после загрузки, если можно установить
    const timer = setTimeout(() => {
      if (canInstall) {
        setShowBanner(true);
        setTimeout(() => setIsVisible(true), 100); // Анимация появления
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [canInstall]);

  const handleInstall = async () => {
    const success = await installApp();
    if (success) {
      setShowBanner(false);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => setShowBanner(false), 300); // Ждем анимацию
    
    // Сохраняем что пользователь закрыл баннер
    localStorage.setItem('pwa-banner-dismissed', Date.now().toString());
  };

  // Не показываем если недавно закрывали
  useEffect(() => {
    const dismissed = localStorage.getItem('pwa-banner-dismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed);
      const hoursSinceDismiss = (Date.now() - dismissedTime) / (1000 * 60 * 60);
      if (hoursSinceDismiss < 24) { // Не показываем 24 часа
        setShowBanner(false);
      }
    }
  }, []);

  if (!showBanner) return null;

  return (
    <>
      {/* Оверлей */}
      <div className={`fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`} />
      
      {/* Баннер */}
      <div className={`fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 transition-all duration-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}>
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-2xl border-0 overflow-hidden">
          {/* Фоновые элементы */}
          <div className="absolute inset-0">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12" />
          </div>
          
          <div className="relative p-6">
            {/* Кнопка закрытия */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="absolute top-2 right-2 text-white/70 hover:text-white hover:bg-white/10 h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>

            {/* Иконка приложения */}
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                {deviceType === 'mobile' ? (
                  <Smartphone className="h-6 w-6 text-white" />
                ) : (
                  <Monitor className="h-6 w-6 text-white" />
                )}
              </div>
              
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-1">FitFlow Pro</h3>
                <p className="text-white/90 text-sm mb-2">
                  Установите приложение для лучшего опыта
                </p>
                
                {/* Преимущества */}
                <div className="flex items-center gap-4 text-xs text-white/80">
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    <span>Быстрый доступ</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Download className="h-3 w-3" />
                    <span>Офлайн режим</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Кнопки действий */}
            <div className="flex gap-3">
              <Button
                onClick={handleInstall}
                className="flex-1 bg-white text-blue-600 hover:bg-white/90 font-medium"
              >
                <Download className="h-4 w-4 mr-2" />
                Установить
              </Button>
              <Button
                variant="outline"
                onClick={handleDismiss}
                className="px-4 border-white/30 text-blue-600 hover:bg-white/90"
              >
                Позже
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
};

export default PWAInstallBanner;
