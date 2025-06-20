// components/trainer/TrainerHeader.tsx
"use client";

import { useState, useEffect, memo } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useTrainerDataQuery } from "@/hooks/useTrainerDataQuery";
import { Button } from "@/components/ui/button";
import {
  Dumbbell,
  Users,
  Calendar,
  MessageSquare,
  BarChart3,
  Plus,
  Menu,
  X,
  AlertCircle,
} from "lucide-react";
import { ANIMATION_CLASSES, combineAnimations } from "@/utils/animations";
import TrainerUserMenu from "./components/TrainerUserMenu";
import TrainerNotifications from "./components/TrainerNotifications";
import TrainerMobileMenu from "./mobile-menu/TrainerMobileMenu";
import { TrainerNavigationItem } from "./types/trainer-navigation";

// ✅ Мемоизированный логотип с пропсом router
const TrainerLogo = memo(({ router }: { router: any }) => (
  
  <div
    className={combineAnimations(
      "flex items-center gap-2 sm:gap-3 min-w-0 cursor-pointer group",
      ANIMATION_CLASSES.transition.all,
      ANIMATION_CLASSES.hover.scale
    )}
    onKeyDown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        router.push("/")
      }
    }}
    onClick={() => router.push("/")}
  >
    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
      <Dumbbell className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
    </div>
    <div className="text-white min-w-0">
      <div className="text-md sm:text-xl lg:text-xl font-bold truncate">
        FitnessPro
      </div>
      <div className="text-xs lg:text-md text-blue-100">
        Панель тренера
      </div>
    </div>
  </div>
));

TrainerLogo.displayName = 'TrainerLogo';

// ✅ Мемоизированная навигация для десктопа
const TrainerDesktopNavigation = memo(({ 
  navigationItems, 
  pathname, 
  router, 
  isLoading 
}: {
  navigationItems: TrainerNavigationItem[];
  pathname: string;
  router: any;
  isLoading: boolean;
}) => {
  const isActivePath = (href: string) => {
    if (href === "/trainer") {
      return pathname === "/trainer";
    }
    return pathname.startsWith(href);
  };

  return (
    <nav className="hidden xl:flex items-center space-x-1 flex-1 justify-center max-w-2xl mx-4">
      {navigationItems.map((item) => {
        const IconComponent = item.icon;
        const isActive = isActivePath(item.href);

        return (
          <Button
            key={item.href}
            variant={isActive ? "default" : "ghost"}
            onClick={() => router.push(item.href)}
            disabled={isLoading}
            className={combineAnimations(
              `relative flex items-center gap-2 px-3 py-2 transition-all duration-200 ${
                isActive
                  ? "bg-white/20 text-white shadow-md"
                  : "text-white/90 hover:text-white hover:bg-white/10"
              }`,
              ANIMATION_CLASSES.transition.colors
            )}
          >
            <IconComponent className="h-4 w-4 flex-shrink-0" />
            <span className="font-medium whitespace-nowrap">
              {item.label}
            </span>
            {item.badge && (
              <div className={`ml-1 text-xs px-2 py-1 rounded-full ${
                isActive
                  ? "bg-white/20 text-white"
                  : "bg-white/20 text-white/90"
              }`}>
                {item.badge}
              </div>
            )}
          </Button>
        );
      })}
    </nav>
  );
});

TrainerDesktopNavigation.displayName = 'TrainerDesktopNavigation';

// ✅ Компонент для отладки
const DebugPanel = memo(({ 
  showDebug, 
  setShowDebug, 
  token, 
  user, 
  isLoading, 
  error, 
  loadingStep, 
  refetch 
}: {
  showDebug: boolean;
  setShowDebug: (show: boolean) => void;
  token: any;
  user: any;
  isLoading: boolean;
  error: string | null;
  loadingStep: string;
  refetch: () => void;
}) => {
  if (!showDebug) return null;

  return (
    <div className="bg-yellow-50 border-b border-yellow-200 p-4">
      <div className="max-w-7xl mx-auto">
        <h3 className="font-semibold text-yellow-800 mb-2">Отладочная информация</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <p><strong>Токен:</strong> {token ? '✅ Есть' : '❌ Нет'}</p>
            <p><strong>Пользователь:</strong> {user ? '✅ Есть' : '❌ Нет'}</p>
            <p><strong>Загрузка:</strong> {isLoading ? '🔄 Да' : '✅ Нет'}</p>
          </div>
          <div>
            <p><strong>Ошибка:</strong> {error || 'Нет'}</p>
            <p><strong>Этап:</strong> {loadingStep || 'Нет'}</p>
          </div>
          <div>
            <Button onClick={refetch} size="sm" className="mr-2">
              Перезагрузить
            </Button>
            <Button onClick={() => setShowDebug(false)} size="sm" variant="outline">
              Скрыть
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
});

DebugPanel.displayName = 'DebugPanel';

export default function TrainerHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, token } = useAuth();
  
  // ✅ Используем ваш хук с правильными полями
  const { 
    messageStats, 
    workoutStats, 
    stats,
    isLoading, 
    error, 
    loadingStep, 
    refetch 
  } = useTrainerDataQuery();

  const handleLogout = async () => {
    await logout();
  };

  // ✅ Навигационные элементы с правильными полями из вашего хука
  const navigationItems: TrainerNavigationItem[] = [
    {
      href: "/trainer/clients",
      label: "Клиенты",
      icon: Users,
      badge: stats?.activeClients?.toString(),
      category: "clients",
      description: "Управление клиентами",
    },
    {
      href: "/trainer/workouts",
      label: "Тренировки",
      icon: Calendar,
      badge: workoutStats?.todayWorkouts?.toString(),
      category: "workouts",
      description: "Расписание тренировок",
    },
    {
      href: "/trainer/messages",
      label: "Сообщения",
      icon: MessageSquare,
      badge: messageStats?.unreadMessages?.toString(),
      category: "messages",
      description: "Чат с клиентами",
    },
    {
      href: "/trainer/analytics",
      label: "Аналитика",
      icon: BarChart3,
      category: "analytics",
      description: "Статистика и отчеты",
    },
  ];

  // ✅ Если загрузка длится больше 10 секунд, показываем отладку
  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => {
        setShowDebug(true);
      }, 10000);
      return () => clearTimeout(timer);
    } else {
      setShowDebug(false);
    }
  }, [isLoading]);

  // ✅ Управление скроллом для мобильного меню
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, [isMobileMenuOpen]);

  const handleNavClick = (href: string) => {
    setIsMobileMenuOpen(false);
    router.push(href);
  };

  return (
    <>
      {/* Основной header */}
      <header className="bg-gradient-to-r from-green-600 to-blue-600 shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            {/* Левая часть - Логотип */}
            <TrainerLogo router={router} />

            {/* Центральная часть - Навигация (скрыта на мобильных и планшетах) */}
            <TrainerDesktopNavigation
              navigationItems={navigationItems}
              pathname={pathname}
              router={router}
              isLoading={isLoading}
            />

            {/* Правая часть - Статистика и действия */}
            <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">

              {/* Кнопка отладки (если есть проблемы) */}
              {(error || showDebug) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={refetch}
                  className="hidden sm:flex items-center gap-1 text-orange-300 hover:text-orange-200 hover:bg-orange-500/20 border border-orange-400/20 hover:border-orange-400/30 px-2 sm:px-3"
                >
                  <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                  <span className="text-sm">Перезагрузить</span>
                </Button>
              )}

              {/* Кнопка быстрого действия */}
              <Button
                onClick={() => router.push("/trainer/workouts/create")}
                disabled={isLoading}
                className="hidden sm:flex items-center gap-1 sm:gap-2 bg-white/20 hover:bg-white/30 text-white border-white/20 hover:border-white/30 transition-all duration-300 px-2 sm:px-3 lg:px-4 h-8 sm:h-9 lg:h-10"
              >
                <Plus className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                <span className="hidden md:inline text-sm">
                  Новая тренировка
                </span>
                <span className="md:hidden text-sm">Создать</span>
              </Button>

              {/* Уведомления */}
              <TrainerNotifications 
                messageStats={messageStats}
                workoutStats={workoutStats}
                stats={stats}
                isLoading={isLoading}
                loadingStep={loadingStep}
                error={error}
              />

              {/* Профиль пользователя */}
              <TrainerUserMenu 
                user={user} 
                messageStats={messageStats}
                workoutStats={workoutStats}
                stats={stats}
                isLoading={isLoading}
                showDebug={showDebug}
                setShowDebug={setShowDebug}
              />

              {/* Мобильное меню */}
              <Button
                variant="ghost"
                size="sm"
                className="xl:hidden text-white hover:bg-white/10 p-2 h-8 w-8 sm:h-9 sm:w-9"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                disabled={isLoading}
              >
                {isMobileMenuOpen ? (
                  <X className="h-4 w-4 sm:h-5 sm:w-5" />
                ) : (
                  <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* ✅ Мобильное меню */}
      <TrainerMobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        navigationItems={navigationItems}
        user={user}
        messageStats={messageStats}
        workoutStats={workoutStats}
        stats={stats}
        isLoading={isLoading}
        loadingStep={loadingStep}
        error={error}
        onNavigation={handleNavClick}
        onLogout={handleLogout}
        refetch={refetch}
        showDebug={showDebug}
        setShowDebug={setShowDebug}
      />

      {/* Панель отладки */}
      <DebugPanel
        showDebug={showDebug}
        setShowDebug={setShowDebug}
        token={token}
        user={user}
        isLoading={isLoading}
        error={error}
        loadingStep={loadingStep}
        refetch={refetch}
      />
    </>
  );
}
