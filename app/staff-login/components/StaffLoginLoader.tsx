// app/staff-login/components/StaffLoginLoader.tsx - ИСПРАВЛЕННАЯ ВЕРСИЯ
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import FitnessLoader from "@/components/ui/FitnessLoader";
import { UserRole } from "@/lib/permissions";

interface StaffLoginLoaderProps {
  userRole: UserRole;
  userName: string;
  dashboardUrl: string;
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

// Персонализированные тексты загрузки для каждой роли
const roleToMotivationalTexts: Record<UserRole, string[]> = {
  "super-admin": [
    "Инициализируем системные компоненты...",
    "Проверяем безопасность и доступы...",
    "Загружаем административную панель...",
    "Подключаемся к серверам мониторинга...",
    "Настраиваем системные инструменты...",
    "Почти готово! Запускаем панель управления..."
  ],
  "admin": [
    "Загружаем административный интерфейс...",
    "Синхронизируем бизнес-данные...",
    "Подготавливаем аналитические отчеты...",
    "Проверяем статус клиентской базы...",
    "Настраиваем управленческие инструменты...",
    "Готовим вашу панель администратора..."
  ],
  "manager": [
    "Подготавливаем менеджерскую панель...",
    "Загружаем расписание команды...",
    "Синхронизируем операционные данные...",
    "Проверяем загрузку залов...",
    "Обновляем статистику эффективности...",
    "Настраиваем рабочее пространство..."
  ],
  "trainer": [
    "Загружаем тренерский интерфейс...",
    "Синхронизируем данные клиентов...",
    "Подготавливаем программы тренировок...",
    "Проверяем расписание занятий...",
    "Обновляем прогресс подопечных...",
    "Готовим ваше рабочее место..."
  ],
  "member": [
    "Загружаем личный кабинет...",
    "Синхронизируем ваши достижения...",
    "Подготавливаем персональные рекомендации...",
    "Обновляем расписание занятий...",
    "Проверяем ваш прогресс...",
    "Почти готово! Добро пожаловать!"
  ],
  "client": [
    "Загружаем персональный кабинет...",
    "Синхронизируем ваши тренировки...",
    "Подготавливаем индивидуальную программу...",
    "Связываемся с вашим тренером...",
    "Обновляем личные достижения...",
    "Готовим ваше персональное пространство..."
  ]
};

// Тексты для ролей
const roleTexts: Record<UserRole, {
  roleDisplayName: string;
  dashboardTitle: string;
  dashboardSubtitle: string;
}> = {
  "super-admin": {
    roleDisplayName: "Супер Администратор",
    dashboardTitle: "Системная Панель",
    dashboardSubtitle: "Полный контроль над системой"
  },
  "admin": {
    roleDisplayName: "Администратор", 
    dashboardTitle: "Административная Панель",
    dashboardSubtitle: "Управление системой и пользователями"
  },
  "manager": {
    roleDisplayName: "Менеджер",
    dashboardTitle: "Панель Менеджера",
    dashboardSubtitle: "Управление операциями и персоналом"
  },
  "trainer": {
    roleDisplayName: "Тренер",
    dashboardTitle: "Панель Тренера", 
    dashboardSubtitle: "Работа с клиентами и программами"
  },
  "member": {
    roleDisplayName: "Участник",
    dashboardTitle: "Личный Кабинет",
    dashboardSubtitle: "Ваши тренировки и прогресс"
  },
  "client": {
    roleDisplayName: "Клиент",
    dashboardTitle: "Персональный Кабинет",
    dashboardSubtitle: "Индивидуальные программы"
  }
};

export default function StaffLoginLoader({ userRole, userName, dashboardUrl }: StaffLoginLoaderProps) {
  const router = useRouter();
  const [progress, setProgress] = useState(0);

  // Безопасное получение текстов для роли
  const currentRoleTexts = roleTexts[userRole] || roleTexts["member"];

  useEffect(() => {
    // Симулируем прогресс загрузки
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          // Перенаправляем после завершения загрузки
          setTimeout(() => {
            router.push(dashboardUrl);
          }, 500);
          return 100;
        }
        return prev + Math.random() * 15 + 5;
      });
    }, 300);

    return () => clearInterval(progressInterval);
  }, [dashboardUrl, router]);

  // Получаем персонализированное приветствие
  const getGreeting = () => {
    const hour = new Date().getHours();
    let timeGreeting = "";

    if (hour < 12) {
      timeGreeting = "Доброе утро";
    } else if (hour < 17) {
      timeGreeting = "Добрый день";
    } else {
      timeGreeting = "Добрый вечер";
    }

    return `${timeGreeting}, ${userName}! ${currentRoleTexts.dashboardSubtitle}`;
  };

  return (
    <div className="min-h-[100svh] bg-gradient-to-br from-slate-700 via-blue-700 to-indigo-800 md:bg-gradient-to-br md:from-slate-50 md:via-gray-50 md:to-zinc-50 relative overflow-hidden">
      {/* Декоративные элементы - адаптивные цвета */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Мобильные декорации */}
        <div className="md:hidden">
          <div className="absolute top-20 left-10 w-16 h-16 bg-white/10 rounded-full animate-pulse" />
          <div className="absolute top-40 right-20 w-12 h-12 bg-white/10 rounded-full animate-pulse" style={{ animationDelay: "0.5s" }} />
          <div className="absolute bottom-40 left-20 w-20 h-20 bg-white/10 rounded-full animate-pulse" style={{ animationDelay: "1s" }} />
          <div className="absolute bottom-20 right-10 w-14 h-14 bg-white/10 rounded-full animate-pulse" style={{ animationDelay: "1.5s" }} />
        </div>

        {/* Десктопные декорации */}
        <div className="hidden md:block">
          <div className="absolute top-20 left-10 w-16 h-16 bg-gray-500/10 rounded-full animate-pulse" />
          <div className="absolute top-40 right-20 w-12 h-12 bg-slate-500/10 rounded-full animate-pulse" style={{ animationDelay: "0.5s" }} />
          <div className="absolute bottom-40 left-20 w-20 h-20 bg-zinc-500/10 rounded-full animate-pulse" style={{ animationDelay: "1s" }} />
          <div className="absolute bottom-20 right-10 w-14 h-14 bg-gray-500/10 rounded-full animate-pulse" style={{ animationDelay: "1.5s" }} />
        </div>
      </div>

      {/* Центральный контент */}
      <div className="relative z-10 flex items-center justify-center min-h-[100svh] p-4">
        <div className="text-center max-w-2xl mx-auto">
          {/* Приветствие */}
          <h1 className="text-2xl md:text-3xl font-bold text-white md:text-gray-800 mb-8 opacity-0 animate-[fadeIn_0.8s_ease-out_forwards]">
            {getGreeting()}
          </h1>

          {/* Лоадер */}
          <FitnessLoader
            isMobile={false}
            theme="staff"
            size="xl"
            variant={roleToLoaderVariant[userRole]}
            text={currentRoleTexts.dashboardTitle}
            showProgress={true}
            motivationalTexts={roleToMotivationalTexts[userRole]}
            className="drop-shadow-2xl"
          />

          {/* Дополнительная информация о роли */}
          <div className="mt-12 space-y-6">
            {/* Роль и описание */}
            <div className="bg-white/10 md:bg-gray-100/50 backdrop-blur-sm rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white md:text-gray-800 mb-2">
                {currentRoleTexts.roleDisplayName}
              </h2>
              <p className="text-sm text-white/80 md:text-gray-600">
                {currentRoleTexts.dashboardSubtitle}
              </p>
            </div>

            {/* Доступные разделы */}
            <div className="bg-white/10 md:bg-gray-100/50 backdrop-blur-sm rounded-2xl p-6">
              <h3 className="text-sm font-medium text-white/70 md:text-gray-500 uppercase tracking-wide mb-4">
                Подготавливаем разделы:
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {getAvailableSections(userRole).map((section, index) => (
                  <div 
                    key={section}
                    className="flex items-center gap-2 text-sm text-white/80 md:text-gray-600 opacity-0"
                    style={{
                      animation: `fadeInUp 0.5s ease-out ${index * 0.1}s forwards`
                    }}
                  >
                    <div className={`w-2 h-2 rounded-full animate-pulse ${
                      progress > (index + 1) * 20 
                        ? "bg-green-400 md:bg-green-500" 
                        : "bg-white/40 md:bg-gray-400"
                    }`} />
                    <span>{section}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Прогресс детализированный */}
            <div className="text-xs text-white/50 md:text-gray-400 space-y-1">
              <p>Инициализация: {Math.min(progress * 1.2, 100).toFixed(0)}%</p>
              <p>Загрузка данных: {Math.min(progress * 1.1, 100).toFixed(0)}%</p>
              <p>Настройка интерфейса: {Math.min(progress, 100).toFixed(0)}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Добавляем глобальные стили для анимаций */}
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

// Функция для получения доступных разделов по роли
function getAvailableSections(role: UserRole): string[] {
  const sections: Record<UserRole, string[]> = {
    "super-admin": [
      "Управление пользователями",
      "Системные настройки", 
      "Отчеты и аналитика",
      "Системный мониторинг",
      "Безопасность",
      "Резервное копирование"
    ],
    "admin": [
      "Управление тренерами",
      "Управление клиентами",
      "Расписание залов",
      "Отчеты и статистика",
      "Управление продуктами",
      "Системные настройки"
    ],
    "manager": [
      "Команда тренеров",
      "База клиентов", 
      "Расписание занятий",
      "Отчеты по эффективности",
      "Управление оборудованием",
      "Операционные задачи"
    ],
    "trainer": [
      "Мои клиенты",
      "Расписание тренировок",
      "Программы тренировок", 
      "Прогресс клиентов",
      "Сообщения",
      "Личная статистика"
    ],
    "member": [
      "Мои тренировки",
      "Расписание занятий",
      "Мой прогресс",
      "Достижения",
      "Сообщество",
      "Настройки профиля"
    ],
    "client": [
      "Персональные тренировки",
      "Мой прогресс",
      "Мой тренер",
      "План питания",
      "Мои цели",
      "Настройки аккаунта"
    ]
  };

  return sections[role] || [];
}