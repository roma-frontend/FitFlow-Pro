// components/trainer/header/OnlineStatus.tsx (новый компонент)
"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";

interface OnlineStatusProps {
  className?: string;
}

export default function OnlineStatus({ className = "" }: OnlineStatusProps) {
  const [isOnline, setIsOnline] = useState(true);
  const [lastSeen, setLastSeen] = useState<Date>(new Date());

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => {
      setIsOnline(false);
      setLastSeen(new Date());
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Проверяем начальное состояние
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Badge 
        variant={isOnline ? "default" : "secondary"}
        className={`text-xs ${isOnline ? "bg-green-500" : "bg-gray-500"}`}
      >
        <div className={`w-2 h-2 rounded-full mr-1 ${isOnline ? "bg-white" : "bg-gray-300"}`} />
        {isOnline ? "Онлайн" : "Офлайн"}
      </Badge>
      {!isOnline && (
        <span className="text-xs text-gray-500">
          {lastSeen.toLocaleTimeString('ru-RU', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </span>
      )}
    </div>
  );
}
