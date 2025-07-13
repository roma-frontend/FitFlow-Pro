// components/ui/FaceIdStatusIndicator.tsx - Индикатор статуса Face ID
"use client";

import { useEffect } from 'react';
import { useFaceIdSmart } from '@/hooks/useFaceIdSmart';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  Shield, 
  ShieldCheck, 
  ShieldOff,
  Eye,
  Fingerprint
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface FaceIdStatusIndicatorProps {
  variant?: 'icon' | 'badge' | 'button' | 'minimal';
  showLabel?: boolean;
  className?: string;
  onClick?: () => void;
}

export function FaceIdStatusIndicator({
  variant = 'icon',
  showLabel = false,
  className,
  onClick
}: FaceIdStatusIndicatorProps) {
  const router = useRouter();
  const {
    isFaceIdRegistered,
    faceIdStatus,
    profiles,
    checkFaceIdStatus
  } = useFaceIdSmart();

  // Проверяем статус при монтировании
  useEffect(() => {
    checkFaceIdStatus();
  }, []);

  // Обработчик клика по умолчанию
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      router.push('/member-dashboard?tab=security');
    }
  };

  // Получаем информацию о последнем использовании
  const getLastUsedText = () => {
    if (!faceIdStatus?.profile?.lastUsedAt) return 'Не использовался';
    
    const lastUsed = new Date(faceIdStatus.profile.lastUsedAt);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - lastUsed.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Использован недавно';
    if (diffHours < 24) return `${diffHours}ч назад`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Вчера';
    if (diffDays < 7) return `${diffDays}д назад`;
    
    return lastUsed.toLocaleDateString();
  };

  // Минимальная версия (только точка)
  if (variant === 'minimal') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button 
              onClick={handleClick}
              className={cn("relative", className)}
            >
              <span
                className={cn(
                  "block w-2 h-2 rounded-full",
                  isFaceIdRegistered 
                    ? "bg-green-500 animate-pulse" 
                    : "bg-gray-400"
                )}
              />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p className="font-medium">
              Face ID {isFaceIdRegistered ? 'активен' : 'не настроен'}
            </p>
            {isFaceIdRegistered && (
              <p className="text-xs text-muted-foreground">
                {getLastUsedText()}
              </p>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Версия с иконкой
  if (variant === 'icon') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={handleClick}
              className={cn(
                "relative p-2 rounded-lg transition-colors",
                "hover:bg-accent hover:text-accent-foreground",
                className
              )}
            >
              {isFaceIdRegistered ? (
                <ShieldCheck className="h-5 w-5 text-green-600" />
              ) : (
                <ShieldOff className="h-5 w-5 text-muted-foreground" />
              )}
              
              {/* Индикатор активности */}
              {isFaceIdRegistered && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              )}
              
              {showLabel && (
                <span className="ml-2 text-sm">
                  Face ID
                </span>
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="w-64">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">Face ID</span>
                <Badge variant={isFaceIdRegistered ? "default" : "secondary"} className="text-xs">
                  {isFaceIdRegistered ? 'Активен' : 'Не настроен'}
                </Badge>
              </div>
              
              {isFaceIdRegistered && faceIdStatus?.profile && (
                <>
                  <div className="text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Последний вход:</span>
                      <span>{getLastUsedText()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Использований:</span>
                      <span>{faceIdStatus.profile.usageCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Профилей:</span>
                      <span>{profiles.length} из 3</span>
                    </div>
                  </div>
                  
                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground">
                      Нажмите для управления Face ID
                    </p>
                  </div>
                </>
              )}
              
              {!isFaceIdRegistered && (
                <p className="text-xs text-muted-foreground">
                  Настройте Face ID для быстрого и безопасного входа
                </p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Версия с badge
  if (variant === 'badge') {
    return (
      <button
        onClick={handleClick}
        className={cn("inline-flex items-center", className)}
      >
        <Badge 
          variant={isFaceIdRegistered ? "default" : "secondary"}
          className={cn(
            "transition-all",
            isFaceIdRegistered && "bg-green-500 hover:bg-green-600"
          )}
        >
          {isFaceIdRegistered ? (
            <>
              <Eye className="w-3 h-3 mr-1" />
              Face ID
            </>
          ) : (
            <>
              <ShieldOff className="w-3 h-3 mr-1" />
              Настроить Face ID
            </>
          )}
        </Badge>
      </button>
    );
  }

  // Версия с кнопкой
  if (variant === 'button') {
    return (
      <Button
        variant={isFaceIdRegistered ? "outline" : "default"}
        size="sm"
        onClick={handleClick}
        className={cn("relative", className)}
      >
        {isFaceIdRegistered ? (
          <>
            <Fingerprint className="w-4 h-4 mr-2" />
            Face ID активен
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          </>
        ) : (
          <>
            <Shield className="w-4 h-4 mr-2" />
            Настроить Face ID
          </>
        )}
      </Button>
    );
  }

  return null;
}