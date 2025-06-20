'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

interface PWAHook {
  canInstall: boolean;
  isInstalled: boolean;
  isOnline: boolean;
  installPrompt: BeforeInstallPromptEvent | null;
  installApp: () => Promise<boolean>;
  deferredPrompt?: BeforeInstallPromptEvent | null;
  deviceType: 'mobile' | 'desktop';
}

export default function usePWA(): PWAHook {
  const [canInstall, setCanInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [deviceType, setDeviceType] = useState<'mobile' | 'desktop'>('desktop');
  
  // Add a session flag to track if prompt has been shown
  const [promptShown, setPromptShown] = useState(false);

  const { toast } = useToast();

  // Проверяем режим разработки
  const isDev = process.env.NODE_ENV === 'development' &&
    typeof window !== 'undefined' &&
    !localStorage.getItem('pwa-force-enable') &&
    !new URLSearchParams(window.location.search).get('pwa');

  // Определение типа устройства
  const detectDeviceType = useCallback(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    return /mobile|android|iphone|ipad/.test(userAgent) ? 'mobile' : 'desktop';
  }, []);

  // Проверка установки PWA
  const checkIfInstalled = useCallback(() => {
    if (isDev) {
      setIsInstalled(false);
      return false;
    }

    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches;
    const isIOSStandalone = (window.navigator as any).standalone === true;
    const isAndroidTWA = document.referrer.includes('android-app://');

    const installed = isInStandaloneMode || isIOSStandalone || isAndroidTWA;

    console.log('PWA Check:', {
      isInStandaloneMode,
      isIOSStandalone,
      isAndroidTWA,
      installed
    });

    setIsInstalled(installed);
    return installed;
  }, [isDev]);

  // Проверка сетевого подключения
  const updateOnlineStatus = useCallback(() => {
    setIsOnline(navigator.onLine);
  }, []);

  // Проверка лимитов показа промпта - modified to check session flag
  const canShowPrompt = useCallback(() => {
    // Check if we've already shown the prompt this session
    if (promptShown || sessionStorage.getItem('pwa-prompt-shown') === 'true') {
      return false;
    }
    
    const promptCount = parseInt(localStorage.getItem('pwa-prompt-count') || '0');
    const lastPromptTime = parseInt(localStorage.getItem('pwa-last-prompt') || '0');
    const hoursSinceLastPrompt = (Date.now() - lastPromptTime) / (1000 * 60 * 60);

    return promptCount < 3 && hoursSinceLastPrompt >= 24;
  }, [promptShown]);

  // Обновление счетчика промптов
  const updatePromptStats = useCallback(() => {
    const count = parseInt(localStorage.getItem('pwa-prompt-count') || '0') + 1;
    localStorage.setItem('pwa-prompt-count', count.toString());
    localStorage.setItem('pwa-last-prompt', Date.now().toString());
    
    // Mark prompt as shown for this session
    setPromptShown(true);
    sessionStorage.setItem('pwa-prompt-shown', 'true');
  }, []);

  // Сброс статистики промптов (при успешной установке)
  const resetPromptStats = useCallback(() => {
    localStorage.removeItem('pwa-prompt-count');
    localStorage.removeItem('pwa-last-prompt');
    
    // Keep the session flag to prevent showing again
    setPromptShown(true);
    sessionStorage.setItem('pwa-prompt-shown', 'true');
  }, []);

  // Получение инструкций для браузера
  const getBrowserInstructions = useCallback(() => {
    const userAgent = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(userAgent);
    const isChrome = /Chrome/.test(userAgent) && !/Edg/.test(userAgent);
    const isEdge = /Edg/.test(userAgent);
    const isFirefox = /Firefox/.test(userAgent);
    const isSafari = /Safari/.test(userAgent) && !/Chrome/.test(userAgent);

    if (isIOS) {
      return {
        title: "Установка на iOS 📱",
        description: "1. Нажмите кнопку \"Поделиться\" (⬆️)\n2. Выберите \"На экран 'Домой'\""
      };
    } else if (isChrome) {
      return {
        title: "Установка в Chrome 🟢",
        description: "Нажмите на иконку установки (⬇️) в адресной строке справа"
      };
    } else if (isEdge) {
      return {
        title: "Установка в Edge 🔵",
        description: "Нажмите на иконку установки в адресной строке или меню '⋯'"
      };
    } else if (isFirefox) {
      return {
        title: "Установка в Firefox 🟠",
        description: "Используйте меню '☰' → 'Установить это приложение'"
      };
    } else if (isSafari) {
      return {
        title: "Установка в Safari 🔵",
        description: "Нажмите 'Поделиться' → 'Добавить на экран Домой'"
      };
    } else {
      return {
        title: "Установка приложения",
        description: "Найдите опцию 'Установить приложение' в меню браузера"
      };
    }
  }, []);

  // Установка PWA
  const installApp = useCallback(async (): Promise<boolean> => {
    if (isDev) {
      console.log('PWA Install - blocked in development mode');
      toast({
        title: "Разработка",
        description: "PWA установка отключена в режиме разработки",
        variant: "default",
      });
      return false;
    }

    console.log('PWA Install - attempting installation');

    // Если есть промпт - используем его
    if (installPrompt) {
      try {
        console.log('PWA Install - showing native prompt');
        await installPrompt.prompt();

        const { outcome } = await installPrompt.userChoice;
        console.log('PWA Install - user choice:', outcome);

        if (outcome === 'accepted') {
          setCanInstall(false);
          setIsInstalled(true);
          setInstallPrompt(null);
          resetPromptStats();

          toast({
            title: "Успешно установлено! 🎉",
            description: "FitFlow Pro успешно установлено как приложение",
            variant: "default",
          });

          return true;
        } else {
          updatePromptStats();
          toast({
            title: "Установка отменена",
            description: "Вы можете установить приложение позже",
            variant: "default",
          });
        }

        return false;
      } catch (error) {
        console.error('PWA Install error:', error);

        toast({
          title: "Ошибка установки",
          description: "Произошла ошибка при установке приложения. Попробуйте еще раз.",
          variant: "destructive",
        });

        return false;
      }
    }

    // Fallback: показываем инструкции для браузера
    const instructions = getBrowserInstructions();
    toast({
      title: instructions.title,
      description: instructions.description,
      variant: "default",
    });

    // Mark as shown even for the fallback method
    updatePromptStats();
    
    return false;
  }, [installPrompt, isDev, toast, getBrowserInstructions, updatePromptStats, resetPromptStats]);

  useEffect(() => {
    // Check if prompt has already been shown this session
    if (sessionStorage.getItem('pwa-prompt-shown') === 'true') {
      setPromptShown(true);
      return;
    }
    
    // Определяем тип устройства
    setDeviceType(detectDeviceType());

    if (isDev) {
      console.log('PWA - disabled in development mode');
      setCanInstall(false);
      setIsInstalled(false);
      updateOnlineStatus();
      return;
    }

    // Проверяем установку
    const installed = checkIfInstalled();
    if (installed) return;

    updateOnlineStatus();

    // Обработчик beforeinstallprompt
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault(); // ✅ Скрывает стандартный промпт

      // Only set prompt if we haven't shown it yet this session
      if (!promptShown) {
        const promptEvent = event as BeforeInstallPromptEvent;
        setInstallPrompt(promptEvent);
        setCanInstall(true);

        // Сохраняем промпт для использования позже
        (window as any).deferredPrompt = promptEvent;
      }
    };

    // Обработчик appinstalled
    const handleAppInstalled = () => {
      console.log('PWA - app installed');
      setCanInstall(false);
      setIsInstalled(true);
      setInstallPrompt(null);
      (window as any).deferredPrompt = null;
      resetPromptStats();

      toast({
        title: "Приложение установлено! 🎉",
        description: "FitFlow Pro теперь доступно как приложение на вашем устройстве",
        variant: "default",
      });
    };

    // Добавляем слушатели
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    // Проверяем существующий промпт - only if not shown yet
    if (!promptShown && (window as any).deferredPrompt) {
      console.log('PWA - found existing deferred prompt');
      const existingPrompt = (window as any).deferredPrompt as BeforeInstallPromptEvent;
      setInstallPrompt(existingPrompt);

      if (canShowPrompt()) {
        setCanInstall(true);
        // Mark as shown immediately to prevent future checks
        updatePromptStats();
      }
    }

    // Альтернативная проверка для браузеров без beforeinstallprompt
    const checkAlternativeInstall = async () => {
      if (!promptShown && 'serviceWorker' in navigator && !installed) {
        const manifestLink = document.querySelector('link[rel="manifest"]');
        if (manifestLink && canShowPrompt()) {
          console.log('PWA - enabling install button (fallback method)');
          setCanInstall(true);
          // Mark as shown immediately
          updatePromptStats();
        }
      }
    };

    // Only check once
    if (!promptShown) {
      setTimeout(checkAlternativeInstall, 2000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, [isDev, checkIfInstalled, updateOnlineStatus, canShowPrompt, resetPromptStats, detectDeviceType, toast, promptShown, updatePromptStats]);

  return {
    canInstall,
    isInstalled,
    isOnline,
    installPrompt,
    installApp,
    deferredPrompt: installPrompt,
    deviceType
  };
}

// Остальной код без изменений...
export function usePWACapabilities() {
  // Код остался тем же
  const [capabilities, setCapabilities] = useState({
    canInstall: false,
    isStandalone: false,
    isOnline: true,
    hasServiceWorker: false,
    hasManifest: false
  });

  const isDev = process.env.NODE_ENV === 'development' &&
    !localStorage.getItem('pwa-force-enable') &&
    !new URLSearchParams(window.location.search).get('pwa');

  useEffect(() => {
    const checkCapabilities = async () => {
      if (isDev) {
        setCapabilities({
          canInstall: false,
          isStandalone: false,
          isOnline: navigator.onLine,
          hasServiceWorker: false,
          hasManifest: false
        });
        return;
      }

      const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true;

      const hasServiceWorker = 'serviceWorker' in navigator;

      let hasManifest = false;
      try {
        const manifestLink = document.querySelector('link[rel="manifest"]');
        hasManifest = !!manifestLink;
      } catch (error) {
        console.log('Manifest check failed:', error);
      }

      const canInstall = hasServiceWorker && hasManifest && !isStandalone;

      setCapabilities({
        canInstall,
        isStandalone,
        isOnline: navigator.onLine,
        hasServiceWorker,
        hasManifest
      });
    };

    checkCapabilities();

    const handleOnline = () => setCapabilities(prev => ({ ...prev, isOnline: true }));
    const handleOffline = () => setCapabilities(prev => ({ ...prev, isOnline: false }));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isDev]);

  return capabilities;
}
