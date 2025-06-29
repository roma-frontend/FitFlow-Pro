// components/OfflineIndicator.tsx - Индикатор офлайн режима
'use client';

import { useState, useEffect, memo } from 'react';
import { WifiOff, Wifi } from 'lucide-react';

export const OfflineIndicator = memo(function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const [showIndicator, setShowIndicator] = useState(false);

  useEffect(() => {
    const updateOnlineStatus = () => {
      const online = navigator.onLine;
      setIsOnline(online);
      
      if (!online) {
        setShowIndicator(true);
      } else if (showIndicator) {
        // Показываем "снова онлайн" на 3 секунды
        setTimeout(() => setShowIndicator(false), 3000);
      }
    };

    updateOnlineStatus();
    window.addEventListener('online', updateOnlineStatus, { passive: true });
    window.addEventListener('offline', updateOnlineStatus, { passive: true });

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, [showIndicator]);

  if (!showIndicator) return null;

  return (
    <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-4 py-2 rounded-lg text-white text-sm font-medium transition-all duration-300 shadow-lg ${
      isOnline ? 'bg-green-600' : 'bg-red-600'
    }`}>
      <div className="flex items-center gap-2">
        {isOnline ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
        <span>
          {isOnline ? 'Соединение восстановлено' : 'Нет подключения к интернету'}
        </span>
      </div>
    </div>
  );
});
