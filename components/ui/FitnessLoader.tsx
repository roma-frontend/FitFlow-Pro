"use client";

import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useClientOnly } from "@/hooks/useClientOnly";

type LoaderSize = "sm" | "md" | "lg" | "xl";
type LoaderVariant = "dumbbell" | "heartbeat" | "running" | "strength" | "yoga" | "cardio";
type LoaderTheme = "member" | "staff";

interface FitnessLoaderProps {
  size?: LoaderSize;
  text?: string;
  variant?: LoaderVariant;
  className?: string;
  showProgress?: boolean;
  motivationalTexts?: string[];
  theme?: LoaderTheme;
  isMobile?: boolean;
}

export default function FitnessLoader({ 
  size = "lg", 
  text = "Загружаем...",
  variant = "dumbbell",
  className,
  showProgress = true,
  theme = "member",
  isMobile = false,
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
    sm: "w-16 h-16",
    md: "w-20 h-20",
    lg: "w-24 h-24", 
    xl: "w-32 h-32"
  };

  // Градиенты для разных тем
  const themeGradients = {
    member: {
      bg: "from-blue-600 via-purple-600 to-indigo-700",
      loader: "from-blue-500 to-purple-600",
      text: "from-blue-600 to-purple-600",
      accent: "text-blue-300"
    },
    staff: {
      bg: "from-slate-700 via-blue-700 to-indigo-800",
      loader: "from-slate-500 to-blue-600",
      text: "from-slate-600 to-blue-600",
      accent: "text-slate-300"
    }
  };

  const currentTheme = themeGradients[theme];

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
        const increment = 8 + (prev % 3) * 2;
        const newProgress = prev + increment;
        return newProgress > 95 ? 95 : newProgress;
      });
    }, 300);
    
    return () => clearInterval(interval);
  }, [showProgress, mounted]);

  const renderVariant = () => {
    switch (variant) {
      case "heartbeat":
        return <HeartbeatLoader size={size} theme={theme} isMobile={isMobile} />;
      case "running":
        return <RunningLoader size={size} theme={theme} isMobile={isMobile} />;
      case "strength":
        return <StrengthLoader size={size} theme={theme} isMobile={isMobile} />;
      case "yoga":
        return <YogaLoader size={size} theme={theme} isMobile={isMobile} />;
      case "cardio":
        return <CardioLoader size={size} theme={theme} isMobile={isMobile} />;
      default:
        return <DumbbellLoader size={size} theme={theme} isMobile={isMobile} />;
    }
  };

  if (isMobile) {
    // ✅ ИСПРАВЛЕНО: МОБИЛЬНАЯ ВЕРСИЯ с лучшей видимостью текста
    return (
      <div className={cn(`min-h-[100svh] bg-gradient-to-br ${currentTheme.bg} flex items-center justify-center p-4`, className)}>
        <div className="text-center text-white">
          {/* Логотип/лоадер */}
          <div className="mb-6">
            <div className="w-20 h-20 mx-auto bg-white/30 rounded-3xl flex items-center justify-center backdrop-blur-md mb-4 border border-white/20 shadow-lg">
              {renderVariant()}
            </div>
          </div>

          {/* ✅ ИСПРАВЛЕНО: Основной текст с лучшей видимостью */}
          <h2 className="text-xl font-semibold mb-2 text-white drop-shadow-lg">{text}</h2>
          
          {/* ✅ ИСПРАВЛЕНО: Мотивационный текст с тенью для лучшей читаемости */}
          {mounted && motivationalTexts.length > 0 && (
            <p className="text-sm text-white/95 mb-4 transition-all duration-500 ease-in-out drop-shadow-md max-w-sm mx-auto leading-relaxed">
              {motivationalTexts[currentTextIndex]}
            </p>
          )}
          
          {/* Fallback для SSR */}
          {!mounted && motivationalTexts.length > 0 && (
            <p className="text-sm text-white/95 mb-4 drop-shadow-md max-w-sm mx-auto leading-relaxed">
              {motivationalTexts[0]}
            </p>
          )}

          {/* ✅ ИСПРАВЛЕНО: Прогресс бар с лучшей видимостью */}
          {mounted && showProgress && (
            <div className="w-64 mx-auto mb-4">
              <div className="h-2 bg-white/25 rounded-full overflow-hidden backdrop-blur-sm border border-white/20">
                <div 
                  className="h-full bg-white/90 rounded-full transition-all duration-300 ease-out shadow-sm"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-white/90 mt-2 font-medium drop-shadow-sm">{Math.round(progress)}%</p>
            </div>
          )}

          {/* Fallback прогресс */}
          {!mounted && showProgress && (
            <div className="w-64 mx-auto mb-4">
              <div className="h-2 bg-white/25 rounded-full overflow-hidden backdrop-blur-sm border border-white/20">
                <div className="h-full bg-white/90 rounded-full w-0" />
              </div>
              <p className="text-xs text-white/90 mt-2 font-medium drop-shadow-sm">0%</p>
            </div>
          )}

          {/* ✅ ИСПРАВЛЕНО: Анимированные точки с лучшей видимостью */}
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-white/80 rounded-full animate-bounce shadow-sm" />
            <div className="w-2 h-2 bg-white/80 rounded-full animate-bounce animation-delay-200 shadow-sm" />
            <div className="w-2 h-2 bg-white/80 rounded-full animate-bounce animation-delay-400 shadow-sm" />
          </div>
        </div>
      </div>
    );
  }

  // ДЕСКТОПНАЯ ВЕРСИЯ остается без изменений
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
          <p className={`text-lg font-semibold bg-gradient-to-r ${currentTheme.text} bg-clip-text text-transparent animate-pulse`}>
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
                className={`h-full bg-gradient-to-r ${currentTheme.loader} rounded-full transition-all duration-300 ease-out`}
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
              <div className={`h-full bg-gradient-to-r ${currentTheme.loader} rounded-full w-0`} />
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

// Обновленные компоненты лоадеров с поддержкой тем
interface LoaderComponentProps {
  size: LoaderSize;
  theme: LoaderTheme;
  isMobile: boolean;
}

function DumbbellLoader({ size, theme, isMobile }: LoaderComponentProps) {
  const iconSizes: Record<LoaderSize, string> = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
    xl: "w-8 h-8"
  };

  const mobileIconSizes: Record<LoaderSize, string> = {
    sm: "w-6 h-6",
    md: "w-7 h-7",
    lg: "w-8 h-8",
    xl: "w-10 h-10"
  };

  const currentIconSize = isMobile ? mobileIconSizes[size] : iconSizes[size];
  const iconColor = isMobile ? "text-white" : theme === "member" ? "text-blue-600" : "text-slate-600";

  if (isMobile) {
    return (
      <div className="animate-workout">
        <DumbbellIcon className={cn(iconColor, currentIconSize)} />
      </div>
    );
  }

  return (
    <div className="relative w-36 h-36">
      {/* Внешнее кольцо */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/20 to-green-500/20 animate-ping" />
      
      {/* Вращающееся кольцо */}
      <div className="absolute inset-2 rounded-full border-4 border-transparent bg-gradient-to-r from-blue-500 to-green-500 animate-spin">
        <div className="absolute inset-1 rounded-full bg-white" />
      </div>

      {/* Центральная гантель */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="animate-workout">
          <DumbbellIcon className={cn(iconColor, currentIconSize)} />
        </div>
      </div>
    </div>
  );
}

function HeartbeatLoader({ size, theme, isMobile }: LoaderComponentProps) {
  const iconSizes: Record<LoaderSize, string> = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
    xl: "w-8 h-8"
  };

  const mobileIconSizes: Record<LoaderSize, string> = {
    sm: "w-6 h-6",
    md: "w-7 h-7",
    lg: "w-8 h-8",
    xl: "w-10 h-10"
  };

  const currentIconSize = isMobile ? mobileIconSizes[size] : iconSizes[size];
  const iconColor = isMobile ? "text-white" : "text-red-500";

  if (isMobile) {
    return (
      <div className="animate-heartbeat">
        <HeartIcon className={cn(iconColor, currentIconSize)} />
      </div>
    );
  }

  return (
    <div className="relative w-36 h-36">
      {/* Пульсирующие кольца */}
      <div className="absolute inset-0 rounded-full bg-red-500/20 animate-ping" />
      <div className="absolute inset-2 rounded-full bg-red-500/30 animate-ping animation-delay-500" />
      
      {/* Центральное сердце */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="animate-heartbeat">
          <HeartIcon className={cn(iconColor, currentIconSize)} />
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

function RunningLoader({ size, theme, isMobile }: LoaderComponentProps) {
  const iconSizes: Record<LoaderSize, string> = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
    xl: "w-8 h-8"
  };

  const mobileIconSizes: Record<LoaderSize, string> = {
    sm: "w-6 h-6",
    md: "w-7 h-7",
    lg: "w-8 h-8",
    xl: "w-10 h-10"
  };

  const currentIconSize = isMobile ? mobileIconSizes[size] : iconSizes[size];
  const iconColor = isMobile ? "text-white" : theme === "member" ? "text-blue-600" : "text-slate-600";

  if (isMobile) {
    return (
      <div className="animate-bounce">
        <RunnerIcon className={cn(iconColor, currentIconSize)} />
      </div>
    );
  }

  return (
    <div className="relative w-36 h-36">
      {/* Беговая дорожка */}
      <div className="absolute inset-0 rounded-full border-4 border-gray-300">
        <div className="absolute inset-0 rounded-full border-t-4 border-blue-500 animate-spin" />
      </div>
      
      {/* Бегущий человек */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="animate-bounce">
          <RunnerIcon className={cn(iconColor, currentIconSize)} />
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

function StrengthLoader({ size, theme, isMobile }: LoaderComponentProps) {
  const iconSizes: Record<LoaderSize, string> = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
    xl: "w-8 h-8"
  };

  const mobileIconSizes: Record<LoaderSize, string> = {
    sm: "w-6 h-6",
    md: "w-7 h-7",
    lg: "w-8 h-8",
    xl: "w-10 h-10"
  };

  const currentIconSize = isMobile ? mobileIconSizes[size] : iconSizes[size];
  const iconColor = isMobile ? "text-white" : "text-orange-600";

  if (isMobile) {
    return (
      <div className="animate-workout">
        <BarbellIcon className={cn(iconColor, currentIconSize)} />
      </div>
    );
  }

  return (
    <div className="relative w-36 h-36">
      {/* Силовые кольца */}
      <div className="absolute inset-0 rounded-full border-4 border-orange-200">
        <div className="absolute inset-0 rounded-full border-t-4 border-orange-500 animate-spin" />
      </div>
      
      {/* Штанга */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="animate-workout">
          <BarbellIcon className={cn(iconColor, currentIconSize)} />
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

function YogaLoader({ size, theme, isMobile }: LoaderComponentProps) {
  const iconSizes: Record<LoaderSize, string> = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
    xl: "w-8 h-8"
  };

  const mobileIconSizes: Record<LoaderSize, string> = {
    sm: "w-6 h-6",
    md: "w-7 h-7",
    lg: "w-8 h-8",
    xl: "w-10 h-10"
  };

  const currentIconSize = isMobile ? mobileIconSizes[size] : iconSizes[size];
  const iconColor = isMobile ? "text-white" : "text-purple-600";

  if (isMobile) {
    return (
      <div className="animate-pulse">
        <YogaIcon className={cn(iconColor, currentIconSize)} />
      </div>
    );
  }

  return (
    <div className="relative w-36 h-36">
      {/* Медитативные кольца */}
      <div className="absolute inset-0 rounded-full bg-purple-500/10 animate-pulse" />
      <div className="absolute inset-4 rounded-full bg-purple-500/20 animate-pulse animation-delay-500" />
      <div className="absolute inset-8 rounded-full bg-purple-500/30 animate-pulse animation-delay-1000" />
      
      {/* Поза йоги */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="animate-pulse">
          <YogaIcon className={cn(iconColor, currentIconSize)} />
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

// ✨ НОВЫЙ КАРДИО ЛОАДЕР
function CardioLoader({ size, theme, isMobile }: LoaderComponentProps) {
  const iconSizes: Record<LoaderSize, string> = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
    xl: "w-8 h-8"
  };

  const mobileIconSizes: Record<LoaderSize, string> = {
    sm: "w-6 h-6",
    md: "w-7 h-7",
    lg: "w-8 h-8",
    xl: "w-10 h-10"
  };

  const currentIconSize = isMobile ? mobileIconSizes[size] : iconSizes[size];
  const iconColor = isMobile ? "text-white" : theme === "member" ? "text-green-600" : "text-emerald-600";

  if (isMobile) {
    return (
      <div className="animate-bounce">
        <CardioIcon className={cn(iconColor, currentIconSize)} />
      </div>
    );
  }

  return (
    <div className="relative w-36 h-36">
      {/* Кардио кольца */}
      <div className="absolute inset-0 rounded-full border-4 border-green-200">
        <div className="absolute inset-0 rounded-full border-t-4 border-green-500 animate-spin" />
        <div className="absolute inset-0 rounded-full border-r-4 border-emerald-400 animate-spin animation-reverse animation-duration-2000" />
      </div>
      
      {/* Центральная иконка кардио */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="animate-pulse">
          <CardioIcon className={cn(iconColor, currentIconSize)} />
        </div>
      </div>

      {/* Пульсирующие точки как сердцебиение */}
      <div className="absolute inset-0">
        <div className="absolute top-4 left-1/2 w-2 h-2 bg-green-400 rounded-full animate-ping" />
        <div className="absolute top-1/2 right-4 w-2 h-2 bg-emerald-400 rounded-full animate-ping animation-delay-300" />
        <div className="absolute bottom-4 left-1/2 w-2 h-2 bg-green-400 rounded-full animate-ping animation-delay-600" />
        <div className="absolute top-1/2 left-4 w-2 h-2 bg-emerald-400 rounded-full animate-ping animation-delay-900" />
      </div>

      {/* Волновой эффект */}
      <div className="absolute inset-6 rounded-full bg-green-500/10 animate-pulse animation-delay-500" />
    </div>
  );
}

// Иконки
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

// ✨ НОВАЯ ИКОНКА КАРДИО
function CardioIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
      <circle cx="12" cy="12" r="3" fill="currentColor" opacity="0.6"/>
      <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zm0 8c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z" opacity="0.8"/>
    </svg>
  );
}