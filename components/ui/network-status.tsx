// components/ui/network-status.tsx
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wifi, WifiOff, RefreshCw } from "lucide-react";

interface NetworkStatusProps {
  onRetry?: () => void;
  isRetrying?: boolean;
}

export function NetworkStatus({ onRetry, isRetrying = false }: NetworkStatusProps) {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    // Проверяем начальное состояние
    setIsOnline(navigator.onLine);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-3">
          <div className="flex items-center gap-2">
            <Wifi className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-800">
              Подключение активно
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-red-200 bg-red-50">
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <WifiOff className="h-4 w-4 text-red-600" />
            <div>
              <span className="text-sm font-medium text-red-800">
                Нет подключения к интернету
              </span>
              <p className="text-xs text-red-600">
                Работа в автономном режиме
              </p>
            </div>
          </div>
          
          {onRetry && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={onRetry}
              disabled={isRetrying}
              className="border-red-300 text-red-700 hover:bg-red-100"
            >
              {isRetrying ? (
                <RefreshCw className="h-3 w-3 animate-spin" />
              ) : (
                'Повторить'
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
