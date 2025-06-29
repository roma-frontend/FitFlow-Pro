// components/ui/SimpleToast.tsx
"use client";

import React, { useEffect } from 'react';
import { X, CheckCircle, XCircle, Info } from 'lucide-react';

export interface SimpleToastProps {
  type: 'success' | 'error' | 'info';
  message: string; // ← This accepts a string
  onClose: () => void;
}

export function SimpleToast({ type, message, onClose }: SimpleToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-500 flex-shrink-0" />;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className="fixed top-4 right-4 left-4 sm:left-auto sm:right-4 z-50 max-w-sm sm:max-w-md mx-auto sm:mx-0">
      <div className={`flex items-start gap-3 p-3 sm:p-4 border rounded-lg shadow-lg ${getBackgroundColor()} animate-in slide-in-from-top-2 duration-300`}>
        {getIcon()}
        <span className="text-sm font-medium flex-1 break-words leading-relaxed">
          {message}
        </span>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 flex-shrink-0 mt-0.5"
          aria-label="Закрыть уведомление"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
