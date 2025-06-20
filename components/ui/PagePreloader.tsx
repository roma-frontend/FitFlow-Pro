"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";

interface PagePreloaderProps {
  duration?: number;
  onComplete?: () => void;
}

export default function PagePreloader({ duration = 2000, onComplete }: PagePreloaderProps) {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsVisible(false);
            onComplete?.();
          }, 500);
          return 100;
        }
        return prev + 2;
      });
    }, duration / 50);

    return () => clearInterval(interval);
  }, [duration, onComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
      <div className="text-center">
        {/* Логотип */}
        <div className="relative mb-8">
          <div className="w-24 h-24 bg-gradient-to-r from-blue-600 to-green-600 rounded-2xl flex items-center justify-center mx-auto animate-pulse">
            <Sparkles className="h-12 w-12 text-white animate-spin" />
          </div>
          
          {/* Анимированные кольца */}
          <div className="absolute inset-0 w-24 h-24 mx-auto">
            <div className="absolute inset-0 border-4 border-blue-200 rounded-2xl animate-ping"></div>
            <div className="absolute inset-2 border-2 border-green-300 rounded-xl animate-ping" style={{ animationDelay: "0.5s" }}></div>
          </div>
        </div>

        {/* Название */}
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          FitFlow
          <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
            {" "}Pro
          </span>
        </h1>
        
        <p className="text-gray-600 mb-8">Загружаем умную систему управления...</p>

        {/* Прогресс бар */}
        <div className="w-80 mx-auto">
          <div className="bg-gray-200 rounded-full h-2 mb-4">
            <div 
              className="bg-gradient-to-r from-blue-600 to-green-600 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          
          <div className="text-sm text-gray-500">
            {progress < 30 && "Инициализация системы..."}
            {progress >= 30 && progress < 60 && "Загрузка компонентов..."}
            {progress >= 60 && progress < 90 && "Подключение к серверу..."}
            {progress >= 90 && "Почти готово..."}
          </div>
        </div>

        {/* Дополнительные элементы */}
        <div className="mt-8 flex justify-center space-x-2">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.2}s` }}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
}
