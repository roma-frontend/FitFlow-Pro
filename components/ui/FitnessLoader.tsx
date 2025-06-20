"use client";

import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useClientOnly } from "@/hooks/useClientOnly";

type LoaderSize = "sm" | "md" | "lg" | "xl";
type LoaderVariant = "dumbbell" | "heartbeat" | "running" | "strength" | "yoga";

interface FitnessLoaderProps {
  size?: LoaderSize;
  text?: string;
  variant?: LoaderVariant;
  className?: string;
  showProgress?: boolean;
  motivationalTexts?: string[];
}

export default function FitnessLoader({ 
  size = "lg", 
  text = "Загружаем...",
  variant = "dumbbell",
  className,
  showProgress = true,
  motivationalTexts = [
    "Подготавливаем вашу тренировку...",
    "Загружаем программы упражнений...",
    "Синхронизируем данные о прогрессе...",
    "Настраиваем персональные рекомендации...",
    "Почти готово! Последние штрихи..."
  ]
}: FitnessLoaderProps) {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const mounted = useClientOnly();

  const containerSizes: Record<LoaderSize, string> = {
    sm: "w-20 h-20",
    md: "w-28 h-28",
    lg: "w-36 h-36", 
    xl: "w-44 h-44"
  };

  // Анимация смены текста - только на клиенте
  useEffect(() => {
    if (!mounted || motivationalTexts.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentTextIndex((prev) => (prev + 1) % motivationalTexts.length);
    }, 2000);
    
    return () => clearInterval(interval);
  }, [motivationalTexts, mounted]);

  // Анимация прогресса - только на клиенте
  useEffect(() => {
    if (!mounted || !showProgress) return;
    
    const interval = setInterval(() => {
      setProgress((prev) => {
        // Используем детерминированные значения вместо Math.random()
        const increment = 8 + (prev % 3) * 2; // Псевдослучайное значение от 8 до 12
        const newProgress = prev + increment;
        return newProgress > 95 ? 95 : newProgress;
      });
    }, 300);
    
    return () => clearInterval(interval);
  }, [showProgress, mounted]);

  const renderVariant = () => {
    switch (variant) {
      case "heartbeat":
        return <HeartbeatLoader size={size} />;
      case "running":
        return <RunningLoader size={size} />;
      case "strength":
        return <StrengthLoader size={size} />;
      case "yoga":
        return <YogaLoader size={size} />;
      default:
        return <DumbbellLoader size={size} />;
    }
  };

  return (
    <div className={cn("flex flex-col items-center gap-6", className)}>
      {/* Основной лоадер */}
      <div className="relative">
        {renderVariant()}
      </div>

      {/* Текст и прогресс */}
      <div className="text-center space-y-4 max-w-md">
        {/* Основной текст */}
        <div className="min-h-[2rem] flex items-center justify-center">
          <p className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent animate-pulse">
            {text}
          </p>
        </div>

        {/* Мотивационный текст - только на клиенте */}
        {mounted && motivationalTexts.length > 0 && (
          <div className="min-h-[1.5rem] flex items-center justify-center">
            <p className="text-sm text-gray-600 transition-all duration-500 ease-in-out">
              {motivationalTexts[currentTextIndex]}
            </p>
          </div>
        )}

        {/* Fallback для SSR */}
        {!mounted && motivationalTexts.length > 0 && (
          <div className="min-h-[1.5rem] flex items-center justify-center">
            <p className="text-sm text-gray-600">
              {motivationalTexts[0]}
            </p>
          </div>
        )}

        {/* Прогресс бар - только на клиенте */}
        {mounted && showProgress && (
          <div className="space-y-2">
            <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-gray-500">{Math.round(progress)}%</p>
          </div>
        )}

        {/* Fallback для SSR */}
        {!mounted && showProgress && (
          <div className="space-y-2">
            <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full w-0" />
            </div>
            <p className="text-xs text-gray-500">0%</p>
          </div>
        )}

        {/* Анимированные точки */}
        <div className="flex items-center justify-center gap-1">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
          <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce animation-delay-200" />
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce animation-delay-400" />
        </div>
      </div>
    </div>
  );
}

// Компоненты разных вариантов лоадеров остаются без изменений
interface LoaderComponentProps {
  size: LoaderSize;
}

function DumbbellLoader({ size }: LoaderComponentProps) {
  const containerSizes: Record<LoaderSize, string> = {
    sm: "w-20 h-20",
    md: "w-28 h-28",
    lg: "w-36 h-36", 
    xl: "w-44 h-44"
  };

  const iconSizes: Record<LoaderSize, string> = {
    sm: "w-6 h-6",
    md: "w-7 h-7",
    lg: "w-8 h-8",
    xl: "w-10 h-10"
  };

  return (
    <div className={cn("relative", containerSizes[size])}>
      {/* Внешнее кольцо */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/20 to-green-500/20 animate-ping" />
      
      {/* Вращающееся кольцо */}
      <div className="absolute inset-2 rounded-full border-4 border-transparent bg-gradient-to-r from-blue-500 to-green-500 animate-spin">
        <div className="absolute inset-1 rounded-full bg-white" />
      </div>

      {/* Центральная гантель */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="animate-workout">
          <DumbbellIcon className={cn("text-blue-600", iconSizes[size])} />
        </div>
      </div>
    </div>
  );
}

function HeartbeatLoader({ size }: LoaderComponentProps) {
  const containerSizes: Record<LoaderSize, string> = {
    sm: "w-20 h-20",
    md: "w-28 h-28",
    lg: "w-36 h-36", 
    xl: "w-44 h-44"
  };

  const iconSizes: Record<LoaderSize, string> = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-10 h-10",
    xl: "w-12 h-12"
  };

  return (
    <div className={cn("relative", containerSizes[size])}>
      {/* Пульсирующие кольца */}
      <div className="absolute inset-0 rounded-full bg-red-500/20 animate-ping" />
      <div className="absolute inset-2 rounded-full bg-red-500/30 animate-ping animation-delay-500" />
      
      {/* Центральное сердце */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="animate-heartbeat">
          <HeartIcon className={cn("text-red-500", iconSizes[size])} />
        </div>
      </div>

      {/* EKG линия */}
      <div className="absolute bottom-2 left-2 right-2 h-1 bg-red-200 rounded overflow-hidden">
        <div className="h-full bg-red-500 animate-pulse" style={{
          background: 'linear-gradient(90deg, transparent 0%, #ef4444 50%, transparent 100%)',
          animation: 'ekg 1.5s ease-in-out infinite'
        }} />
      </div>
    </div>
  );
}

function RunningLoader({ size }: LoaderComponentProps) {
  const containerSizes: Record<LoaderSize, string> = {
    sm: "w-20 h-20",
    md: "w-28 h-28",
    lg: "w-36 h-36", 
    xl: "w-44 h-44"
  };

  const iconSizes: Record<LoaderSize, string> = {
    sm: "w-6 h-6",
    md: "w-7 h-7",
    lg: "w-8 h-8",
    xl: "w-10 h-10"
  };

  return (
    <div className={cn("relative", containerSizes[size])}>
      {/* Беговая дорожка */}
      <div className="absolute inset-0 rounded-full border-4 border-gray-300">
        <div className="absolute inset-0 rounded-full border-t-4 border-blue-500 animate-spin" />
      </div>
      
      {/* Бегущий человек */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="animate-bounce">
          <RunnerIcon className={cn("text-blue-600", iconSizes[size])} />
        </div>
      </div>

      {/* Следы */}
      <div className="absolute inset-0 animate-spin animation-duration-3000">
        <div className="absolute top-1 left-1/2 w-1 h-1 bg-blue-400 rounded-full" />
        <div className="absolute top-1/2 right-1 w-1 h-1 bg-blue-400 rounded-full" />
        <div className="absolute bottom-1 left-1/2 w-1 h-1 bg-blue-400 rounded-full" />
        <div className="absolute top-1/2 left-1 w-1 h-1 bg-blue-400 rounded-full" />
      </div>
    </div>
  );
}

function StrengthLoader({ size }: LoaderComponentProps) {
  const containerSizes: Record<LoaderSize, string> = {
    sm: "w-20 h-20",
    md: "w-28 h-28",
    lg: "w-36 h-36", 
    xl: "w-44 h-44"
  };

  const iconSizes: Record<LoaderSize, string> = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-10 h-10",
    xl: "w-12 h-12"
  };

  return (
    <div className={cn("relative", containerSizes[size])}>
      {/* Силовые кольца */}
      <div className="absolute inset-0 rounded-full border-4 border-orange-200">
        <div className="absolute inset-0 rounded-full border-t-4 border-orange-500 animate-spin" />
      </div>
      
      {/* Штанга */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="animate-workout">
          <BarbellIcon className={cn("text-orange-600", iconSizes[size])} />
        </div>
      </div>

      {/* Искры силы */}
      <div className="absolute inset-0">
        <div className="absolute top-2 right-2 w-1 h-1 bg-yellow-400 rounded-full animate-ping" />
        <div className="absolute bottom-2 left-2 w-1 h-1 bg-yellow-400 rounded-full animate-ping animation-delay-500" />
        <div className="absolute top-2 left-2 w-1 h-1 bg-yellow-400 rounded-full animate-ping animation-delay-1000" />
        <div className="absolute bottom-2 right-2 w-1 h-1 bg-yellow-400 rounded-full animate-ping animation-delay-1500" />
      </div>
    </div>
  );
}

function YogaLoader({ size }: LoaderComponentProps) {
  const containerSizes: Record<LoaderSize, string> = {
    sm: "w-20 h-20",
    md: "w-28 h-28",
    lg: "w-36 h-36", 
    xl: "w-44 h-44"
  };

  const iconSizes: Record<LoaderSize, string> = {
    sm: "w-6 h-6",
    md: "w-7 h-7",
    lg: "w-8 h-8",
    xl: "w-10 h-10"
  };

  return (
    <div className={cn("relative", containerSizes[size])}>
      {/* Медитативные кольца */}
      <div className="absolute inset-0 rounded-full bg-purple-500/10 animate-pulse" />
      <div className="absolute inset-4 rounded-full bg-purple-500/20 animate-pulse animation-delay-500" />
      <div className="absolute inset-8 rounded-full bg-purple-500/30 animate-pulse animation-delay-1000" />
      
      {/* Поза йоги */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="animate-pulse">
          <YogaIcon className={cn("text-purple-600", iconSizes[size])} />
        </div>
      </div>

            {/* Энергетические точки */}
      <div className="absolute inset-0 animate-spin animation-duration-5000">
        <div className="absolute top-0 left-1/2 w-1 h-1 bg-purple-400 rounded-full animate-pulse" />
        <div className="absolute top-1/4 right-0 w-1 h-1 bg-purple-400 rounded-full animate-pulse animation-delay-500" />
        <div className="absolute bottom-0 left-1/2 w-1 h-1 bg-purple-400 rounded-full animate-pulse animation-delay-1000" />
        <div className="absolute top-1/4 left-0 w-1 h-1 bg-purple-400 rounded-full animate-pulse animation-delay-1500" />
      </div>
    </div>
  );
}

// Иконки для разных вариантов
function DumbbellIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22l1.43-1.43L16.29 22l2.14-2.14 1.43 1.43 1.43-1.43-1.43-1.43L22 16.29l-1.43-1.43z"/>
    </svg>
  );
}

function HeartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
    </svg>
  );
}

function RunnerIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M13.49 5.48c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-3.6 13.9l1-4.4 2.1 2v6h2v-7.5l-2.1-2 .6-3c1.3 1.5 3.3 2.5 5.5 2.5v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1l-5.2 2.2v4.7h2v-3.4l1.8-.7-1.6 8.1-4.9-1-.4 2 7 1.4z"/>
    </svg>
  );
}

function BarbellIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.5 5.5h-1v-2c0-.28-.22-.5-.5-.5s-.5.22-.5.5v2h-1c-.28 0-.5.22-.5.5s.22.5.5.5h1v2c0 .28.22.5.5.5s.5-.22.5-.5v-2h1c.28 0 .5-.22.5-.5s-.22-.5-.5-.5zm-14 6h-1v-2c0-.28-.22-.5-.5-.5s-.5.22-.5.5v2h-1c-.28 0-.5.22-.5.5s.22.5.5.5h1v2c0 .28.22.5.5.5s.5-.22.5-.5v-2h1c.28 0 .5-.22.5-.5s-.22-.5-.5-.5zm7.5-5h-4c-.28 0-.5.22-.5.5v10c0 .28.22.5.5.5h4c.28 0 .5-.22.5-.5v-10c0-.28-.22-.5-.5-.5z"/>
    </svg>
  );
}

function YogaIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm9 7h-6v13h-2v-6h-2v6H9V9H3V7h18v2z"/>
    </svg>
  );
}

