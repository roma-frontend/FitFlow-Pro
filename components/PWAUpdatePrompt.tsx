// components/PWAUpdatePrompt.tsx - Промпт обновления
'use client';

import { memo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RefreshCw, X } from 'lucide-react';

interface PWAUpdatePromptProps {
  show: boolean;
  onUpdate: () => void;
}

export const PWAUpdatePrompt = memo(function PWAUpdatePrompt({ 
  show, 
  onUpdate 
}: PWAUpdatePromptProps) {
  const handleUpdate = useCallback(async () => {
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        if (registration.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          window.location.reload();
        }
      }
    } catch (error) {
      console.error('Update failed:', error);
      window.location.reload();
    } finally {
      onUpdate();
    }
  }, [onUpdate]);

  if (!show) return null;

  return (
    <Card className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 border-green-200 bg-green-50 shadow-xl">
      <CardContent className="p-4">
        <div className="flex items-center justify-between space-x-4">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            <div>
              <p className="font-medium text-green-900">Доступно обновление!</p>
              <p className="text-sm text-green-700">Обновите для получения новых функций</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              onClick={handleUpdate}
              size="sm"
              className="bg-green-600 hover:bg-green-700"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Обновить
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onUpdate}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
