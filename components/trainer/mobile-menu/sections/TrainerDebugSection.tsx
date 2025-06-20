// components/trainer/mobile-menu/sections/TrainerDebugSection.tsx
"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  RefreshCw,
  Bug,
  Eye,
  EyeOff,
  Info,
  X,
} from "lucide-react";

interface TrainerDebugSectionProps {
  error: string | null;
  showDebug: boolean;
  setShowDebug: (show: boolean) => void;
  refetch: () => void;
  onClose: () => void;
}

export default function TrainerDebugSection({
  error,
  showDebug,
  setShowDebug,
  refetch,
  onClose,
}: TrainerDebugSectionProps) {

  // Показываем секцию только если есть ошибка или включена отладка
  if (!error && !showDebug) {
    return null;
  }

  const handleRefetch = () => {
    refetch();
    // Не закрываем меню при обновлении данных
  };

  return (
    <div
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-white/70 uppercase tracking-wide flex items-center gap-2">
          <Bug className="h-4 w-4" />
          Отладка
        </h3>
        
        <div className="flex items-center gap-2">
          {error && (
            <Badge variant="destructive" className="text-xs">
              Ошибка
            </Badge>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDebug(!showDebug)}
            className="h-6 w-6 p-0 text-white/60 hover:text-white/80"
          >
            {showDebug ? (
              <EyeOff className="h-3 w-3" />
            ) : (
              <Eye className="h-3 w-3" />
            )}
          </Button>
        </div>
      </div>

      {/* Ошибка */}
      {error && (
        <div
          className="p-3 bg-red-500/20 border border-red-400/20 rounded-lg"
        >
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-red-300 mb-1">
                Ошибка загрузки данных
              </div>
              <div className="text-xs text-red-400/80 break-words">
                {error}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 mt-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefetch}
              className="h-7 px-2 text-xs bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-400/20"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Повторить
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDebug(true)}
              className="h-7 px-2 text-xs text-red-400/80 hover:text-red-300"
            >
              <Info className="h-3 w-3 mr-1" />
              Подробнее
            </Button>
          </div>
        </div>
      )}

      {/* Панель отладки */}
      {showDebug && (
        <div
          className="p-3 bg-yellow-500/10 border border-yellow-400/20 rounded-lg"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium text-yellow-300">
              Отладочная информация
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDebug(false)}
              className="h-5 w-5 p-0 text-yellow-400/60 hover:text-yellow-300"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
          
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-yellow-400/80">Статус:</span>
              <span className="text-yellow-300">
                {error ? "Ошибка" : "Работает"}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-yellow-400/80">Последнее обновление:</span>
              <span className="text-yellow-300">
                {new Date().toLocaleTimeString()}
              </span>
            </div>
            
            {error && (
              <div className="pt-2 border-t border-yellow-400/20">
                <div className="text-yellow-400/80 mb-1">Детали ошибки:</div>
                <div className="text-yellow-300/90 text-xs break-all bg-yellow-500/10 p-2 rounded">
                  {error}
                </div>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2 mt-3 pt-2 border-t border-yellow-400/20">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefetch}
              className="h-7 px-2 text-xs bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 border border-yellow-400/20"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Обновить данные
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                console.log('Debug info requested');
                // Здесь можно добавить логику для отправки отладочной информации
              }}
              className="h-7 px-2 text-xs text-yellow-400/80 hover:text-yellow-300"
            >
              <Bug className="h-3 w-3 mr-1" />
              Отправить отчет
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
