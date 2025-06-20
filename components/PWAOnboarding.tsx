// components/PWAOnboarding.tsx - Исправленная версия
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Smartphone, 
  Download, 
  Wifi, 
  Bell, 
  Star, 
  ArrowRight, 
  Check,
  Sparkles 
} from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';
import usePWA from '@/hooks/usePWA';

export function PWAOnboarding() {
  const [currentStep, setCurrentStep] = useState(0);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const { canInstall, isInstalled } = usePWA();

  useEffect(() => {
    // Показываем онбординг только новым пользователям
    const hasSeenOnboarding = localStorage.getItem('pwa-onboarding-seen');
    if (!hasSeenOnboarding && canInstall) {
      setShowOnboarding(true);
    }
  }, [canInstall]);

  const steps = [
    {
      title: "Установите приложение",
      description: "Получите быстрый доступ прямо с рабочего стола",
      icon: Download,
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    },
    {
      title: "Работайте офлайн",
      description: "Используйте основные функции даже без интернета",
      icon: Wifi,
      color: "text-green-600",
      bgColor: "bg-green-100"
    },
    {
      title: "Получайте уведомления",
      description: "Будьте в курсе важных событий и напоминаний",
      icon: Bell,
      color: "text-purple-600",
      bgColor: "bg-purple-100"
    },
    {
      title: "Наслаждайтесь опытом",
      description: "Нативное приложение прямо в браузере",
      icon: Star,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100"
    }
  ];

  const handleComplete = () => {
    localStorage.setItem('pwa-onboarding-seen', 'true');
    setShowOnboarding(false);
  };

  const handleSkip = () => {
    localStorage.setItem('pwa-onboarding-seen', 'true');
    setShowOnboarding(false);
  };

  const handleInstallComplete = () => {
    // Обработка успешной установки
    handleComplete();
  };

  if (!showOnboarding || isInstalled) return null;

  // Получаем текущий шаг
  const currentStepData = steps[currentStep];
  const StepIcon = currentStepData.icon; // ✅ Правильное присвоение компонента

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-xl">Добро пожаловать в FitFlow Pro PWA!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Прогресс */}
          <div className="flex items-center justify-center gap-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index <= currentStep ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          {/* Текущий шаг */}
          <div className="text-center space-y-4">
            <div className={`w-16 h-16 ${currentStepData.bgColor} rounded-2xl flex items-center justify-center mx-auto`}>
              <StepIcon className={`h-8 w-8 ${currentStepData.color}`} />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">{currentStepData.title}</h3>
              <p className="text-gray-600">{currentStepData.description}</p>
            </div>
          </div>

          {/* Кнопки навигации */}
          <div className="flex gap-3">
            {currentStep < steps.length - 1 ? (
              <>
                <Button 
                  variant="outline" 
                  onClick={handleSkip}
                  className="flex-1"
                >
                  Пропустить
                </Button>
                <Button 
                  onClick={() => setCurrentStep(currentStep + 1)}
                  className="flex-1"
                >
                  Далее
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </>
            ) : (
              <div className="w-full space-y-3">
                {/* Обёртка для PWA кнопки */}
                <div onClick={handleInstallComplete}>
                  <PWAInstallButton 
                    className="w-full" 
                    size="default"
                  />
                </div>
                <Button 
                  variant="outline" 
                  onClick={handleComplete}
                  className="w-full"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Понятно
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
