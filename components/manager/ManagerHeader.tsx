// components/manager/ManagerHeader.tsx
"use client";

import { useState, useEffect, memo, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useManager } from "@/contexts/ManagerContext";
import { useAuth } from "@/hooks/useAuth"; // ✅ Добавляем useAuth
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dumbbell,
  Users,
  Calendar,
  BarChart3,
  Menu,
  X,
  Loader2,
} from "lucide-react";
import { ANIMATION_CLASSES, combineAnimations } from "@/utils/animations";
import ManagerUserMenu from "./components/ManagerUserMenu";
import ManagerNotifications from "./components/ManagerNotifications";
import ManagerMobileMenu from "./mobile-menu/ManagerMobileMenu";
import { ManagerNavigationItem } from "./types/manager-navigation";
import { useLoaderStore } from "@/stores/loaderStore";

const ManagerLogo = memo(({ router }: { router: any }) => (
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
        FitFlow-Pro
      </div>
      <div className="text-xs lg:text-md text-blue-100">
        Панель менеджера
      </div>
    </div>
  </div>
));

ManagerLogo.displayName = 'ManagerLogo';

// ✅ Мемоизированная навигация для десктопа
const ManagerDesktopNavigation = memo(({ 
  navigationItems, 
  pathname, 
  router, 
  isLoggingOut 
}: {
  navigationItems: ManagerNavigationItem[];
  pathname: string;
  router: any;
  isLoggingOut: boolean;
}) => {
  const isActivePath = (href: string) => {
    if (href === "/manager") {
      return pathname === "/manager";
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
            variant={isActive ? "gradientLightBlue" : "ghost"}
            onClick={() => router.push(item.href)}
            disabled={isLoggingOut}
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
              <Badge
                className={`ml-1 text-xs ${
                  isActive
                    ? "bg-white/20 text-white"
                    : "bg-white/20 text-white/90"
                }`}
              >
                {item.badge}
              </Badge>
            )}
          </Button>
        );
      })}
    </nav>
  );
});

ManagerDesktopNavigation.displayName = 'ManagerDesktopNavigation';

export default function ManagerHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { stats, loading } = useManager();
  const { user: authUser, logout, isLoading: authLoading } = useAuth();
  const showLoader = useLoaderStore((state) => state.showLoader);

  // ✅ Мемоизируем объект пользователя для предотвращения лишних ререндеров
  const user = useMemo(() => {
    if (!authUser) return null;
    
    return {
      id: authUser.id,
      name: authUser.name,
      firstName: authUser.name,
      email: authUser.email,
      role: authUser.role,
      avatar: authUser.avatar || authUser.avatarUrl,
      isVerified: authUser.isVerified,
      rating: authUser.rating,
      createdAt: authUser.createdAt,
    };
  }, [authUser]);

  const handleLogout = async () => {

    await logout();
  };

  // ✅ Мемоизируем навигационные элементы
  const navigationItems: ManagerNavigationItem[] = useMemo(() => [
    {
      href: "/manager/trainers",
      label: "Тренеры",
      icon: Users,
      badge: `${stats?.activeTrainers || 0}/${stats?.totalTrainers || 0}`,
      category: "management",
      description: "Управление тренерами",
    },
    {
      href: "/manager/bookings",
      label: "Записи",
      icon: Calendar,
      badge: (stats?.todayBookings || 0).toString(),
      category: "bookings",
      description: "Управление записями",
    },
    {
      href: "/manager/analytics",
      label: "Аналитика",
      icon: BarChart3,
      badge: stats?.newClients ? `+${stats.newClients}` : undefined,
      category: "analytics",
      description: "Аналитика и отчеты",
    },
  ], [stats?.activeTrainers, stats?.totalTrainers, stats?.todayBookings, stats?.newClients]);

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
      <header className="bg-gradient-to-r from-blue-600 to-green-600 shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            {/* Левая часть - Логотип */}
            <ManagerLogo router={router} />

            {/* Центральная часть - Навигация (скрыта на мобильных и планшетах) */}
            <ManagerDesktopNavigation
              navigationItems={navigationItems}
              pathname={pathname}
              router={router}
              isLoggingOut={isLoggingOut}
            />

            {/* Правая часть - Статистика и действия */}
            <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
              <ManagerNotifications isLoggingOut={isLoggingOut} />

              {/* ✅ Показываем меню пользователя только если не загружается */}
              {!authLoading && (
                <ManagerUserMenu 
                  user={user} 
                  stats={stats}
                  isLoading={loading}
                  showDebug={false}
                  setShowDebug={() => {}}
                />
              )}

              {/* Мобильное меню */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden text-white hover:bg-white/10 hover:text-white p-2 h-8 w-8 sm:h-9 sm:w-9"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                disabled={isLoggingOut || authLoading}
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
      <ManagerMobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        navigationItems={navigationItems}
        user={user}
        stats={stats}
        onNavigation={handleNavClick}
        onLogout={handleLogout}
        isLoggingOut={isLoggingOut}
      />

      {/* Overlay для блокировки интерфейса во время выхода */}
      {isLoggingOut && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 shadow-xl flex items-center space-x-3 max-w-sm w-full">
            <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin text-blue-600 flex-shrink-0" />
            <div className="min-w-0">
              <p className="font-medium text-gray-900 dark:text-gray-100 text-sm sm:text-base">
                Выходим из системы...
              </p>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                Пожалуйста, подождите
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
