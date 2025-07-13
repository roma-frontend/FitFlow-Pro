// components/auth/FaceIdQuickAccess.tsx - Быстрый доступ к Face ID на странице входа
"use client";

import { useEffect, useState } from 'react';
import { useFaceIdSmart } from '@/hooks/useFaceIdSmart';
import { FaceIdQuickLogin } from '@/components/auth/FaceIdQuickLogin';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, X, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FaceIdQuickAccessProps {
  className?: string;
  variant?: 'floating' | 'inline' | 'banner';
}

export function FaceIdQuickAccess({ 
  className, 
  variant = 'floating' 
}: FaceIdQuickAccessProps) {
  const { 
    isFaceIdRegistered, 
    checkFaceIdStatus,
    faceIdStatus,
    profiles 
  } = useFaceIdSmart();

  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);

  // Проверяем статус Face ID при монтировании
  useEffect(() => {
    const checkStatus = async () => {
      await checkFaceIdStatus();
      setHasChecked(true);
      
      // Автоматически показываем, если Face ID настроен
      if (isFaceIdRegistered) {
        setTimeout(() => setIsOpen(true), 1000);
      }
    };
    checkStatus();
  }, []);

  // Не показываем, если Face ID не настроен или еще не проверили
  if (!hasChecked || !isFaceIdRegistered) {
    return null;
  }

  // Плавающая версия (для десктопа)
  if (variant === 'floating') {
    return (
      <>
        {/* Минимизированная кнопка */}
        {!isOpen && (
          <div
            className={cn(
              "fixed bottom-6 right-6 z-50 transition-all duration-300",
              className
            )}
          >
            <Button
              onClick={() => setIsOpen(true)}
              className="group relative bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all"
            >
              <Eye className="h-6 w-6" />
              
              {/* Пульсирующий индикатор */}
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500 border-2 border-white" />
              </span>
              
              {/* Всплывающая подсказка */}
              <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="bg-black text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap">
                  Быстрый вход с Face ID
                </div>
              </div>
            </Button>
          </div>
        )}

        {/* Развернутое окно */}
        {isOpen && (
          <div
            className={cn(
              "fixed bottom-6 right-6 z-50 w-96 transition-all duration-300",
              className
            )}
          >
            <Card className="shadow-2xl border-0 overflow-hidden">
              {/* Заголовок */}
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Eye className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Face ID готов</h3>
                    <p className="text-xs opacity-90">
                      {profiles.length} профиль{profiles.length > 1 ? 'ей' : ''} активен
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsMinimized(!isMinimized)}
                    className="text-white hover:bg-white/20 h-8 w-8 p-0"
                  >
                    <ChevronUp className={cn(
                      "h-4 w-4 transition-transform",
                      isMinimized && "rotate-180"
                    )} />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsOpen(false)}
                    className="text-white hover:bg-white/20 h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Контент */}
              {!isMinimized && (
                <div className="transition-all duration-200">
                  <FaceIdQuickLogin 
                    variant="compact"
                    className="border-0"
                  />
                </div>
              )}
            </Card>
          </div>
        )}
      </>
    );
  }

  // Баннер версия (для мобильных)
  if (variant === 'banner') {
    return (
      <>
        {isOpen && (
          <div
            className={cn(
              "fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-500 to-purple-600 text-white transition-transform duration-300",
              !isOpen && "-translate-y-full",
              className
            )}
          >
            <div className="container mx-auto px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Eye className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">Face ID доступен для быстрого входа</p>
                    <p className="text-xs opacity-90">
                      Последний вход: {faceIdStatus?.profile?.lastUsedAt 
                        ? new Date(faceIdStatus.profile.lastUsedAt).toLocaleDateString()
                        : 'Никогда'
                      }
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      const faceAuthUrl = `/auth/face-auth`;
                      window.location.href = faceAuthUrl;
                    }}
                    className="bg-white text-blue-600 hover:bg-gray-100"
                  >
                    Войти
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsOpen(false)}
                    className="text-white hover:bg-white/20"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // Инлайн версия
  return (
    <Card className={cn("p-4", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Eye className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="font-medium text-sm">Face ID настроен</p>
            <p className="text-xs text-gray-600">
              Войдите за секунды
            </p>
          </div>
        </div>
        
        <Button
          size="sm"
          onClick={() => {
            const faceAuthUrl = `/auth/face-auth`;
            window.location.href = faceAuthUrl;
          }}
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
        >
          Быстрый вход
        </Button>
      </div>
    </Card>
  );
}