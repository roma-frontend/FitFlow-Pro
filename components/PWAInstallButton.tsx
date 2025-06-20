// components/PWAInstallButton.tsx - Обновленная версия
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Smartphone, Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import usePWA from '@/hooks/usePWA';

interface PWAInstallButtonProps {
  className?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showIcon?: boolean;
  showText?: boolean;
  children?: React.ReactNode;
  onInstall?: () => void;
  onError?: (error: string) => void;
}

export function PWAInstallButton({
  className,
  variant = 'default',
  size = 'default',
  showIcon = true,
  showText = true,
  children,
  onInstall,
  onError,
}: PWAInstallButtonProps) {
  const { canInstall, isInstalled, installPrompt, installApp } = usePWA();
  const [isInstalling, setIsInstalling] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  const handleInstall = async () => {
    if (!canInstall || isInstalled) return;

    setIsInstalling(true);
    
    try {
      const success = await installApp();
      
      if (success) {
        setInstallSuccess(true);
        onInstall?.();
        
        // Сброс состояния через 3 секунды
        setTimeout(() => {
          setInstallSuccess(false);
        }, 3000);
      } else {
        onError?.('Не удалось установить приложение');
      }
    } catch (error) {
      console.error('Installation failed:', error);
      onError?.(error instanceof Error ? error.message : 'Ошибка установки');
    } finally {
      setIsInstalling(false);
    }
  };

  // Не показываем кнопку если PWA уже установлено
  if (isInstalled) {
    return (
      <Button
        variant={variant}
        size={size}
        className={cn(
          "cursor-default opacity-75",
          className
        )}
        disabled
      >
        {showIcon && <Check className="h-4 w-4 mr-2" />}
        {showText && (children || 'Приложение установлено')}
      </Button>
    );
  }

  // Не показываем кнопку если установка недоступна
  if (!canInstall) {
    return null;
  }

  return (
    <Button
      variant={variant}
      size={size}
      className={cn(
        "transition-all duration-300 hover:scale-105",
        installSuccess && "bg-green-600 hover:bg-green-700",
        className
      )}
      onClick={handleInstall}
      disabled={isInstalling || installSuccess}
    >
      {isInstalling ? (
        <>
          {showIcon && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {showText && 'Установка...'}
        </>
      ) : installSuccess ? (
        <>
          {showIcon && <Check className="h-4 w-4 mr-2" />}
          {showText && 'Установлено!'}
        </>
      ) : (
        <>
          {showIcon && <Download className="h-4 w-4 mr-2" />}
          {showText && (children || 'Установить PWA')}
        </>
      )}
    </Button>
  );
}

// Экспортируем также компонент для быстрого доступа с иконкой
export function PWAInstallIconButton({
  className,
  ...props
}: Omit<PWAInstallButtonProps, 'showIcon' | 'showText'>) {
  return (
    <PWAInstallButton
      {...props}
      size="icon"
      showIcon={true}
      showText={false}
      className={cn("w-10 h-10", className)}
    />
  );
}

// Компонент для отображения в разных размерах
export function PWAInstallCard({
  title = "Установить приложение",
  description = "Получите быстрый доступ и работайте офлайн",
  className,
}: {
  title?: string;
  description?: string;
  className?: string;
}) {
  const { canInstall, isInstalled } = usePWA();

  if (!canInstall || isInstalled) {
    return null;
  }

  return (
    <div className={cn(
      "bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4",
      className
    )}>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
          <Smartphone className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
          <p className="text-sm text-gray-600 mb-3">{description}</p>
          <PWAInstallButton 
            size="sm"
            className="w-full"
            showIcon={true}
            showText={true}
          />
        </div>
      </div>
    </div>
  );
}
