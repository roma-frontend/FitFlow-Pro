// components/PWAInstallPrompt.tsx - Автоматический промпт установки
'use client';

import { useState, useEffect, useCallback, memo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, X, Smartphone, Zap, Shield, Star } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const PWAInstallPrompt = memo(function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [deviceType, setDeviceType] = useState<'mobile' | 'desktop'>('desktop');

  useEffect(() => {
    // Определяем тип устройства
    const userAgent = navigator.userAgent.toLowerCase();
    setDeviceType(/mobile|android|iphone/.test(userAgent) ? 'mobile' : 'desktop');

    // Проверяем установку
    const isInstalled = 
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    
    if (isInstalled) return;

    // Проверяем лимит показов
    const promptCount = parseInt(localStorage.getItem('pwa-prompt-count') || '0');
    const lastPromptTime = parseInt(localStorage.getItem('pwa-last-prompt') || '0');
    const hoursSinceLastPrompt = (Date.now() - lastPromptTime) / (1000 * 60 * 60);
    
    if (promptCount >= 3 || hoursSinceLastPrompt < 24) return;

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Показываем с задержкой
      setTimeout(() => setShowPrompt(true), 15000); // 15 секунд
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setShowPrompt(false);
      localStorage.removeItem('pwa-prompt-count');
      localStorage.removeItem('pwa-last-prompt');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt || isInstalling) return;

    setIsInstalling(true);
    
    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setShowPrompt(false);
        setDeferredPrompt(null);
      } else {
        handleDismiss();
      }
    } catch (error) {
      console.error('Install failed:', error);
      handleDismiss();
    } finally {
      setIsInstalling(false);
    }
  }, [deferredPrompt, isInstalling]);

  const handleDismiss = useCallback(() => {
    setShowPrompt(false);
    const count = parseInt(localStorage.getItem('pwa-prompt-count') || '0') + 1;
    localStorage.setItem('pwa-prompt-count', count.toString());
    localStorage.setItem('pwa-last-prompt', Date.now().toString());
  }, []);

  if (!showPrompt || !deferredPrompt) return null;

  const benefits = [
    { icon: <Zap className="h-4 w-4" />, text: 'Быстрый запуск' },
    { icon: <Shield className="h-4 w-4" />, text: 'Работает офлайн' },
    { icon: <Star className="h-4 w-4" />, text: 'Как нативное приложение' }
  ];

  return (
    <Card className={`fixed z-50 border-blue-200 bg-blue-50 shadow-xl ${
      deviceType === 'mobile' 
        ? 'bottom-4 left-4 right-4' 
        : 'bottom-6 right-6 w-96'
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <Smartphone className="h-5 w-5" />
            Установить FitFlow-Pro
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            disabled={isInstalling}
            className="h-6 w-6 p-0 text-blue-700 hover:bg-blue-100"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription className="text-blue-700">
          {deviceType === 'mobile' 
            ? 'Добавьте на главный экран для быстрого доступа'
            : 'Установите для быстрого доступа с рабочего стола'
          }
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Преимущества */}
        <div className="grid grid-cols-1 gap-2">
          {benefits.map((benefit, index) => (
            <div key={index} className="flex items-center gap-2 text-sm text-blue-800">
              <div className="text-blue-600">{benefit.icon}</div>
              <span>{benefit.text}</span>
            </div>
          ))}
        </div>

        {/* Кнопки */}
        <div className="flex gap-2">
          <Button
            onClick={handleInstall}
            disabled={isInstalling}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
            size="sm"
          >
            {isInstalling ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Установка...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Установить
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={handleDismiss}
            disabled={isInstalling}
            size="sm"
            className="border-blue-300 text-blue-700 hover:bg-blue-100"
          >
            Позже
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});
