// components/PWABadge.tsx - Бейдж для PWA статуса
'use client';

import { Badge } from '@/components/ui/badge';
import { Smartphone, Download, Wifi, WifiOff } from 'lucide-react';
import usePWA from '@/hooks/usePWA';

interface PWABadgeProps {
  variant?: 'install' | 'status' | 'network';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  showText?: boolean;
}

export function PWABadge({ 
  variant = 'status', 
  size = 'sm', 
  showIcon = true, 
  showText = true 
}: PWABadgeProps) {
  const { isInstalled, canInstall, isOnline } = usePWA();

  const getVariantProps = () => {
    switch (variant) {
      case 'install':
        if (canInstall) {
          return {
            variant: 'secondary' as const,
            className: 'bg-blue-100 text-blue-700 border-blue-300',
            icon: Download,
            text: 'Установить'
          };
        }
        if (isInstalled) {
          return {
            variant: 'default' as const,
            className: 'bg-green-100 text-green-700 border-green-300',
            icon: Smartphone,
            text: 'Установлено'
          };
        }
        return null;

      case 'network':
        return {
          variant: isOnline ? 'default' as const : 'destructive' as const,
          className: isOnline 
            ? 'bg-green-100 text-green-700 border-green-300' 
            : 'bg-red-100 text-red-700 border-red-300',
          icon: isOnline ? Wifi : WifiOff,
          text: isOnline ? 'Онлайн' : 'Офлайн'
        };

      case 'status':
      default:
        return {
          variant: isInstalled ? 'default' as const : 'secondary' as const,
          className: isInstalled 
            ? 'bg-green-100 text-green-700 border-green-300' 
            : 'bg-gray-100 text-gray-700 border-gray-300',
          icon: Smartphone,
          text: isInstalled ? 'PWA' : 'Браузер'
        };
    }
  };

  const props = getVariantProps();
  if (!props) return null;

  const { variant: badgeVariant, className, icon: Icon, text } = props;

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-2'
  };

  return (
    <Badge 
      variant={badgeVariant} 
      className={`${className} ${sizeClasses[size]} flex items-center gap-1`}
    >
      {showIcon && <Icon className={`${size === 'sm' ? 'h-3 w-3' : size === 'md' ? 'h-4 w-4' : 'h-5 w-5'}`} />}
      {showText && text}
    </Badge>
  );
}
