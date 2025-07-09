// app/staff-login/components/StaffLogoutLoader.tsx
"use client";

import { useEffect, useState } from "react";
import FitnessLoader from "@/components/ui/FitnessLoader";
import { UserRole } from "@/lib/permissions";
import { useRoleTexts } from "@/lib/roleTexts";

interface StaffLogoutLoaderProps {
  userRole: UserRole;
  userName: string;
  redirectUrl: string;
  isOpen?: boolean;
}

// Маппинг ролей на варианты лоадера
const roleToLoaderVariant: Record<UserRole, "strength" | "heartbeat" | "running" | "yoga" | "cardio" | "dumbbell"> = {
  "super-admin": "strength",
  "admin": "heartbeat",
  "manager": "running",
  "trainer": "dumbbell",
  "member": "yoga",
  "client": "cardio"
};

// Персонализированные тексты для выхода по ролям
const roleToLogoutTexts: Record<UserRole, string[]> = {
  "super-admin": [
    "Завершаем административную сессию...",
    "Отключаем системные компоненты...",
    "Очищаем кэш и временные данные...",
    "Обеспечиваем безопасность выхода...",
    "До встречи, супер-админ!"
  ],
  "admin": [
    "Завершаем сессию администратора...",
    "Сохраняем изменения...",
    "Очищаем административные данные...",
    "Безопасный выход...",
    "До скорого, админ!"
  ],
  "manager": [
    "Завершаем менеджерскую сессию...",
    "Сохраняем отчёты...",
    "Отключаем рабочие процессы...",
    "Очищаем временные данные...",
    "До встречи, менеджер!"
  ],
  "trainer": [
    "Завершаем тренерскую сессию...",
    "Сохраняем прогресс клиентов...",
    "Отключаем тренерские инструменты...",
    "Очищаем данные...",
    "До скорого, тренер!"
  ],
  "member": [
    "Завершаем пользовательскую сессию...",
    "Сохраняем ваши достижения...",
    "Отключаем персональные рекомендации...",
    "Очищаем личные данные...",
    "До встречи, участник!"
  ],
  "client": [
    "Завершаем клиентскую сессию...",
    "Сохраняем ваши тренировки...",
    "Отключаем персональные сервисы...",
    "Очищаем данные...",
    "До скорого, клиент!"
  ]
};

export default function StaffLogoutLoader({ userRole, userName, redirectUrl, isOpen }: StaffLogoutLoaderProps) {
  const roleTexts = useRoleTexts(userRole);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isOpen) {
      // Save current scroll position
      const scrollY = window.scrollY;

      // Add styles to prevent scrolling
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';

      // Add touch-action to prevent mobile scroll
      document.documentElement.style.touchAction = 'none';

      return () => {
        // Restore scroll position and remove styles
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        document.documentElement.style.touchAction = '';

        // Restore scroll position
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);

  useEffect(() => {
    // Симулируем прогресс выхода
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          
          // Ждем немного перед редиректом
          setTimeout(() => {
            window.location.href = redirectUrl || "/";
          }, 500);
          
          return 100;
        }
        return prev + Math.random() * 15 + 5;
      });
    }, 300);

    return () => clearInterval(progressInterval);
  }, [redirectUrl]);

  // Персонализированное прощание
  const getFarewell = () => {
    const hour = new Date().getHours();
    let timeFarewell = "";

    if (hour < 12) {
      timeFarewell = "Хорошего утра";
    } else if (hour < 17) {
      timeFarewell = "Хорошего дня";
    } else {
      timeFarewell = "Хорошего вечера";
    }

    const roleFarewells: Record<UserRole, string> = {
      "super-admin": `${timeFarewell}, ${userName}! Выход из системной панели...`,
      "admin": `${timeFarewell}, ${userName}! Выход из административного центра...`,
      "manager": `${timeFarewell}, ${userName}! Выход из менеджерской панели...`,
      "trainer": `${timeFarewell}, ${userName}! Выход из тренерского интерфейса...`,
      "member": `${timeFarewell}, ${userName}! До новых встреч!`,
      "client": `${timeFarewell}, ${userName}! До новых тренировок!`
    };

    return roleFarewells[userRole] || `${timeFarewell}, ${userName}!`;
  };

  return (
    <div className="min-h-[100lvh] bg-gradient-to-br from-slate-700 via-blue-700 to-indigo-800 md:bg-gradient-to-br md:from-slate-50 md:via-gray-50 md:to-zinc-50 relative overflow-hidden">
      {/* Декоративные элементы */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="md:hidden">
          <div className="absolute top-20 left-10 w-16 h-16 bg-white/10 rounded-full animate-pulse" />
          <div className="absolute top-40 right-20 w-12 h-12 bg-white/10 rounded-full animate-pulse" style={{ animationDelay: "0.5s" }} />
          <div className="absolute bottom-40 left-20 w-20 h-20 bg-white/10 rounded-full animate-pulse" style={{ animationDelay: "1s" }} />
          <div className="absolute bottom-20 right-10 w-14 h-14 bg-white/10 rounded-full animate-pulse" style={{ animationDelay: "1.5s" }} />
        </div>
        <div className="hidden md:block">
          <div className="absolute top-20 left-10 w-16 h-16 bg-gray-500/10 rounded-full animate-pulse" />
          <div className="absolute top-40 right-20 w-12 h-12 bg-slate-500/10 rounded-full animate-pulse" style={{ animationDelay: "0.5s" }} />
          <div className="absolute bottom-40 left-20 w-20 h-20 bg-zinc-500/10 rounded-full animate-pulse" style={{ animationDelay: "1s" }} />
          <div className="absolute bottom-20 right-10 w-14 h-14 bg-gray-500/10 rounded-full animate-pulse" style={{ animationDelay: "1.5s" }} />
        </div>
      </div>

      {/* Центральный контент */}
      <div className="relative z-10 flex items-center justify-center min-h-[100lvh] p-4">
        <div className="text-center max-w-2xl mx-auto">
          {/* Прощание */}
          <h1 className="text-2xl md:text-3xl font-bold text-white md:text-gray-800 mb-8 opacity-0 animate-[fadeIn_0.8s_ease-out_forwards]">
            {getFarewell()}
          </h1>

          {/* Лоадер */}
          <FitnessLoader
            isMobile={false}
            theme="staff"
            size="xl"
            variant={roleToLoaderVariant[userRole]}
            text="Выход из системы..."
            showProgress={true}
            motivationalTexts={roleToLogoutTexts[userRole]}
            className="drop-shadow-2xl"
          />

          <div className="mt-12 space-y-6">
            <div className="bg-white/20 md:bg-gray-100/50 backdrop-blur-md rounded-2xl p-6 border border-white/30 md:border-gray-200/50 shadow-lg">
              <h2 className="text-lg font-semibold text-white md:text-gray-800 mb-2 drop-shadow-sm">
                {roleTexts.roleDisplayName}
              </h2>
              <p className="text-sm text-white/90 md:text-gray-600 drop-shadow-sm">
                {roleTexts.dashboardSubtitle}
              </p>
            </div>
            
            <div className="bg-black/20 md:bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/20 md:border-gray-200/30">
              <div className="text-xs text-white/80 md:text-gray-500 space-y-1">
                <p className="drop-shadow-sm">Завершение сессии: {Math.min(progress * 1.2, 100).toFixed(0)}%</p>
                <p className="drop-shadow-sm">Очистка данных: {Math.min(progress * 1.1, 100).toFixed(0)}%</p>
                <p className="drop-shadow-sm">Безопасный выход: {Math.min(progress, 100).toFixed(0)}%</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}