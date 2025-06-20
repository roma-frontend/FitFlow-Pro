// components/admin/settings/components/SettingsErrorState.tsx
"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, RefreshCw, ArrowLeft, Wifi, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SettingsErrorStateProps {
  error?: Error;
  onBack?: () => void;
  onRetry: () => void;
  isMobile?: boolean;
  title?: string;
  description?: string;
}

export const SettingsErrorState = ({
  error,
  onBack,
  onRetry,
  isMobile = false,
  title = "Ошибка загрузки настроек",
  description = "Произошла ошибка при загрузке настроек. Попробуйте обновить страницу или повторить попытку."
}: SettingsErrorStateProps) => {
  const isNetworkError = error?.message?.includes('fetch') || error?.message?.includes('network');
  
  return (
    <div className={cn(
      "min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100",
      "flex items-center justify-center",
      isMobile ? "p-4" : "p-6"
    )}>
      <Card className={cn(
        "w-full max-w-md mx-auto",
        "border border-red-200/60 shadow-lg"
      )}>
        <CardHeader className={cn(
          "text-center",
          isMobile ? "p-4 pb-3" : "p-6 pb-4"
        )}>
          <div className="flex justify-center mb-4">
            {isNetworkError ? (
              <WifiOff className="h-12 w-12 text-red-500" />
            ) : (
              <AlertCircle className="h-12 w-12 text-red-500" />
            )}
          </div>
          
          <CardTitle className={cn(
            "text-red-800",
            isMobile ? "text-lg" : "text-xl"
          )}>
            {title}
          </CardTitle>
          
          <p className={cn(
            "text-red-600 mt-2",
            isMobile ? "text-sm" : "text-base"
          )}>
            {description}
          </p>

          {/* Детали ошибки для разработки */}
          {process.env.NODE_ENV === 'development' && error && (
            <details className="mt-4 text-left">
              <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
                Детали ошибки (dev)
              </summary>
              <pre className="mt-2 p-2 bg-gray-100 rounded text-xs text-gray-800 overflow-auto max-h-32">
                {error.message}
                {error.stack && `\n\n${error.stack}`}
              </pre>
            </details>
          )}
        </CardHeader>

        <CardContent className={cn(
          "space-y-3",
          isMobile ? "p-4 pt-0" : "p-6 pt-0"
        )}>
          {/* Кнопка повтора */}
          <Button
            onClick={onRetry}
            className={cn(
              "w-full bg-blue-600 hover:bg-blue-700",
              isMobile && "touch-target"
            )}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Попробовать снова
          </Button>

          {/* Кнопка назад */}
          {onBack && (
            <Button
              variant="outline"
              onClick={onBack}
              className={cn(
                "w-full",
                isMobile && "touch-target"
              )}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Вернуться назад
            </Button>
          )}

          {/* Дополнительные действия */}
          <div className="pt-2 border-t border-gray-200">
            <p className={cn(
              "text-center text-gray-500",
              isMobile ? "text-xs" : "text-sm"
            )}>
              Если проблема повторяется, обратитесь к администратору
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
