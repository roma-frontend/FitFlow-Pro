// components/admin/settings/components/AdaptiveToast.tsx
"use client";

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAdaptiveSettings } from '@/hooks/useAdaptiveSettings';

interface ToastProps {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  onClose: (id: string) => void;
}

const AdaptiveToast = ({ id, type, title, message, duration = 5000, onClose }: ToastProps) => {
  const { isMobile } = useAdaptiveSettings();
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Показываем toast
    const showTimer = setTimeout(() => setIsVisible(true), 100);
    
    // Автоматически скрываем через duration
    const hideTimer = setTimeout(() => {
      setIsLeaving(true);
      setTimeout(() => onClose(id), 300);
    }, duration);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [id, duration, onClose]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => onClose(id), 300);
  };

  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info
  };

  const colors = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800'
  };

  const iconColors = {
    success: 'text-green-600',
    error: 'text-red-600',
    warning: 'text-yellow-600',
    info: 'text-blue-600'
  };

  const Icon = icons[type];

  return (
    <div className={cn(
      'flex items-start gap-3 p-4 rounded-lg border shadow-lg backdrop-blur-sm',
      'transition-all duration-300 transform',
      colors[type],
      // Адаптивные размеры
      isMobile ? 'max-w-sm text-sm' : 'max-w-md text-base',
      // Анимации
      isVisible && !isLeaving ? 'translate-x-0 opacity-100 scale-100' : 
      isLeaving ? 'translate-x-full opacity-0 scale-95' : 
      'translate-x-full opacity-0 scale-95'
    )}>
      <Icon className={cn('flex-shrink-0 mt-0.5', iconColors[type], isMobile ? 'h-4 w-4' : 'h-5 w-5')} />
      
      <div className="flex-1 min-w-0">
        <h4 className="font-medium">{title}</h4>
        {message && (
          <p className={cn('mt-1 opacity-90', isMobile ? 'text-xs' : 'text-sm')}>
            {message}
          </p>
        )}
      </div>

      <button
        onClick={handleClose}
        className={cn(
          'flex-shrink-0 p-1 rounded-md transition-colors',
          'hover:bg-black/10 focus:outline-none focus:ring-2 focus:ring-offset-2',
          isMobile ? 'touch-target' : ''
        )}
      >
        <X className={cn(isMobile ? 'h-4 w-4' : 'h-5 w-5')} />
      </button>
    </div>
  );
};

// Toast Container
interface ToastContainerProps {
  toasts: ToastProps[];
  onClose: (id: string) => void;
}

export const AdaptiveToastContainer = ({ toasts, onClose }: ToastContainerProps) => {
  const { isMobile } = useAdaptiveSettings();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div className={cn(
      'fixed z-50 pointer-events-none',
      // Адаптивное позиционирование
      isMobile 
        ? 'top-4 left-4 right-4' 
        : 'top-4 right-4 w-96'
    )}>
      <div className="space-y-2 pointer-events-auto">
        {toasts.map((toast) => (
          <AdaptiveToast
            key={toast.id}
            {...toast}
            onClose={onClose}
          />
        ))}
      </div>
    </div>,
    document.body
  );
};

// Hook для управления toast
export const useAdaptiveToast = () => {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const addToast = (toast: Omit<ToastProps, 'id' | 'onClose'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { ...toast, id, onClose: removeToast }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const clearToasts = () => {
    setToasts([]);
  };

  return {
    toasts,
    addToast,
    removeToast,
    clearToasts,
    ToastContainer: () => <AdaptiveToastContainer toasts={toasts} onClose={removeToast} />
  };
};
