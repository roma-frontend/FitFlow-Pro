
// components/trainer/TrainerHeader.tsx - ИСПРАВЛЕННАЯ ВЕРСИЯ

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
} from "lucide-react";
import { ANIMATION_CLASSES, combineAnimations } from "@/utils/animations";
import TrainerUserMenu from "./components/TrainerUserMenu";
import TrainerNotifications from "./components/TrainerNotifications";
import TrainerMobileMenu from "./mobile-menu/TrainerMobileMenu";
import { TrainerNavigationItem } from "./types/trainer-navigation";

// ✅ Мемоизированный логотип
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
  router 
}: {
  navigationItems: TrainerNavigationItem[];
  pathname: string;
  router: any;
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

export default function TrainerHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  
  const { logout, isLoading: authLoading } = useAuth();
  
  // ✅ Используем хук для данных тренера
  const { 
    messageStats, 
    workoutStats, 
    stats,
    isLoading: dataLoading, 
    error, 
    loadingStep, 
    refetch 
  } = useTrainerDataQuery();

  const handleLogout = async () => {
    await logout();
  };

  // ✅ Навигационные элементы с данными из хука
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

            {/* Центральная часть - Навигация */}
            <TrainerDesktopNavigation
              navigationItems={navigationItems}
              pathname={pathname}
              router={router}
            />

            {/* Правая часть - Статистика и действия */}
            <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
              {/* Кнопка быстрого действия */}
              <Button
                onClick={() => router.push("/trainer/workouts/create")}
                disabled={dataLoading}
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
                isLoading={dataLoading}
                loadingStep={loadingStep}
                error={error}
              />

              {/* ✅ ИСПРАВЛЕНО: НЕ передаем user через пропсы */}
              <TrainerUserMenu 
                messageStats={messageStats}
                workoutStats={workoutStats}
                stats={stats}
                isLoading={dataLoading}
                showDebug={showDebug}
                setShowDebug={setShowDebug}
              />

              {/* Мобильное меню */}
              <Button
                variant="ghost"
                size="sm"
                className="xl:hidden text-white hover:bg-white/10 hover:text-white p-2 h-8 w-8 sm:h-9 sm:w-9"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                disabled={authLoading}
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

      <TrainerMobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        navigationItems={navigationItems}
        messageStats={messageStats}
        workoutStats={workoutStats}
        stats={stats}
        isLoading={dataLoading}
        loadingStep={loadingStep}
        error={error}
        onNavigation={handleNavClick}
        onLogout={handleLogout}
        refetch={refetch}
        showDebug={showDebug}
        setShowDebug={setShowDebug}
      />
    </>
  );
}