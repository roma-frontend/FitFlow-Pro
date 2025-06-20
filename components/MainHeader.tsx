// components/MainHeader.tsx
"use client";

import { useState, useEffect, memo } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useHeaderBadges } from "@/hooks/useHeaderBadges";
import { Button } from "@/components/ui/button";
import {
  Menu,
  X,
  Sparkles,
  Users,
  Calendar,
  ShoppingCart,
  BarChart3,
  Scan,
  Smartphone,
} from "lucide-react";
import UserMenu from "@/components/auth/UserMenu";
import { ANIMATION_CLASSES, combineAnimations } from "@/utils/animations";
import { PWAInstallButton } from "@/components/PWAInstallButton";
import { PWAStatus } from "@/components/PWAStatus";
import usePWA from "@/hooks/usePWA";
import BadgeIcon from "./ui/BadgeIcon";
import { NavigationItem } from "./types/navigation";
import MobileMenu from "./menu-mobile/MobileMenu";

// ✅ Мемоизированные компоненты для производительности
const Logo = memo(() => (
  <Link
    href="/"
    className={combineAnimations(
      "flex items-center gap-2 sm:gap-3 min-w-0",
      ANIMATION_CLASSES.transition.all,
      ANIMATION_CLASSES.hover.scale
    )}
  >
    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
      <Sparkles className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
    </div>
    <div className="text-white min-w-0">
      <div className="text-md sm:text-xl lg:text-xl font-bold truncate flex items-center gap-2">
        FitFlow Pro
        <div className="hidden 2xl:block">
          <PWAStatus showDetails={false} />
        </div>
      </div>
      <div className="text-xs lg:text-md text-blue-100">
        Умная система управления
      </div>
    </div>
  </Link>
));

Logo.displayName = 'Logo';

// ✅ Мемоизированная навигация
const DesktopNavigation = memo(({ 
  navigationItems, 
  pathname, 
  router, 
  user, 
  getBadgeWithFallback 
}: {
  navigationItems: NavigationItem[];
  pathname: string;
  router: any;
  user: any;
  getBadgeWithFallback: (href: string) => { variant: string; text: string } | null;
}) => (
  <nav className="hidden lg:flex items-center space-x-1 xl:space-x-2">
    {navigationItems.map((item) => {
      const IconComponent = item.icon;
      const isActive = pathname === item.href;
      const badgeData = getBadgeWithFallback(item.href);

      if (item.requiresAuth && !user) {
        return (
          <button
            key={item.href}
            onClick={item.onClick}
            className={combineAnimations(
              "flex items-center gap-2 px-3 xl:px-4 py-2 rounded-lg text-white/90 hover:text-white hover:bg-white/10 relative group",
              ANIMATION_CLASSES.transition.colors
            )}
            title="Требуется авторизация"
          >
            <IconComponent className="h-4 w-4" />
            <span className="text-sm font-medium hidden xl:inline">
              {item.label}
            </span>
            {badgeData && (
              <BadgeIcon
                variant={badgeData.variant as any}
                text={badgeData.text}
                size="sm"
                animated={true}
              />
            )}
          </button>
        );
      }

      return (
        <button
          key={item.href}
          onClick={item.onClick || (() => router.push(item.href))}
          className={combineAnimations(
            `flex items-center gap-2 px-3 xl:px-4 py-2 rounded-lg relative group transition-colors ${
              isActive
                ? "bg-white/20 text-white"
                : "text-white/90 hover:text-white hover:bg-white/10"
            }`,
            ANIMATION_CLASSES.transition.colors
          )}
          title={item.description}
        >
          <IconComponent className="h-4 w-4" />
          <span className="text-sm font-medium hidden xl:inline">
            {item.label}
          </span>
          {badgeData && (
            <BadgeIcon
              variant={badgeData.variant as any}
              text={badgeData.text}
              size="sm"
              animated={true}
            />
          )}
        </button>
      );
    })}
  </nav>
));

DesktopNavigation.displayName = 'DesktopNavigation';

export default function MainHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, isLoading } = useAuth();
  const {
    getBadgeForItem,
    handleBadgeClick,
    isApiAvailable,
  } = useHeaderBadges();

  const { isInstalled, canInstall } = usePWA();

  const handleNavClick = (href: string) => {
    if (isApiAvailable) {
      const badge = getBadgeForItem(href);
      if (badge) {
        handleBadgeClick(href);
      }
    }
    setIsMobileMenuOpen(false);
  };

  const handleShopClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      router.push("/member-login?redirect=" + encodeURIComponent("/shop"));
    } else {
      router.push("/shop");
    }
    handleNavClick("/shop");
  };

  const handleFaceAuthClick = (e: React.MouseEvent) => {
    if (user) {
      router.push("/auth/face-auth?mode=manage");
    } else {
      router.push("/auth/face-auth");
    }
    handleNavClick("/auth/face-auth");
  };

  const handlePWASettingsClick = () => {
    router.push("/pwa");
    handleNavClick("/pwa");
  };

  const handleLogin = () => {
    router.push("/member-login");
  };

  const handleRegister = () => {
    router.push("/register");
  };

  const navigationItems: NavigationItem[] = [
    {
      href: "/trainers",
      label: "Тренеры",
      icon: Users,
      category: "services",
      description: "Профессиональные тренеры",
    },
    {
      href: "/programs",
      label: "Программы",
      icon: Calendar,
      category: "services", 
      description: "Тренировочные программы",
    },
    {
      href: "/shop",
      label: "Магазин",
      icon: ShoppingCart,
      requiresAuth: true,
      onClick: handleShopClick,
      showPulse: true,
      category: "commerce",
      description: "Спортивные товары и питание",
    },
    {
      href: "/auth/face-auth",
      label: "Face ID",
      icon: Scan,
      requiresAuth: false,
      description: user ? "Управление Face ID" : "Вход по лицу за 2 сек",
      onClick: handleFaceAuthClick,
      category: "tech",
      isNew: true,
    },
    {
      href: "/about",
      label: "О нас",
      icon: BarChart3,
      category: "info",
      description: "История и команда",
    },
    ...(isInstalled
      ? [
          {
            href: "/pwa",
            label: "PWA",
            icon: Smartphone,
            description: "Настройки приложения",
            onClick: handlePWASettingsClick,
            category: "tech",
          } as NavigationItem,
        ]
      : []),
  ];

  const getBadgeWithFallback = (href: string) => {
    if (!isApiAvailable) {
      const fallbackBadges: Record<string, { variant: string; text: string }> = {
        '/auth/face-auth': { variant: 'quantum-ai', text: 'AI' },
        '/shop': { variant: 'holographic', text: 'SALE' },
        '/trainers': { variant: 'neural-new', text: 'TOP' },
        '/programs': { variant: 'minimal', text: 'NEW' },
        '/about': { variant: 'matrix', text: 'BETA' },
      };
      return fallbackBadges[href] || null;
    }
    
    const dynamicBadge = getBadgeForItem(href);
    if (dynamicBadge) {
      return {
        variant: dynamicBadge.badgeVariant,
        text: dynamicBadge.badgeText
      };
    }
    
    return null;
  };

  return (
    <>
      <header className="bg-gradient-to-r from-blue-600 to-green-600 shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <Logo />

            <DesktopNavigation
              navigationItems={navigationItems}
              pathname={pathname}
              router={router}
              user={user}
              getBadgeWithFallback={getBadgeWithFallback}
            />

            {/* Правая часть хедера */}
            <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
              {canInstall && (
                <div className="hidden lg:block">
                  <PWAInstallButton
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/10 border-white/20 hover:border-white/30"
                    showIcon={true}
                  >
                    <span className="hidden xl:inline">Установить</span>
                  </PWAInstallButton>
                </div>
              )}

              {!isLoading && (
                <>
                  {user ? (
                    <UserMenu />
                  ) : (
                    <>
                      <div className="hidden sm:flex items-center gap-2 lg:gap-3">
                        <Link href="/member-login">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-white hover:bg-white/10 transition-colors text-xs sm:text-sm px-2 sm:px-3"
                          >
                            Вход
                          </Button>
                        </Link>
                        <Link href="/register">
                          <Button
                            size="sm"
                            className="bg-white text-blue-600 hover:bg-blue-50 transition-colors text-xs sm:text-sm px-2 sm:px-3"
                          >
                            Регистрация
                          </Button>
                        </Link>
                      </div>

                      <div className="sm:hidden">
                        <Link href="/member-login">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-white hover:bg-white/10 transition-colors text-xs px-2"
                          >
                            Вход
                          </Button>
                        </Link>
                      </div>
                    </>
                  )}
                </>
              )}

              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden text-white hover:bg-white/10 p-2"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5 sm:h-6 sm:w-6" />
                ) : (
                  <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
                )}
              </Button>
            </div>
          </div>
        </div>

      </header>

      {/* ✅ Новое оптимизированное мобильное меню */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        navigationItems={navigationItems}
        user={user}
        onNavigation={(href) => {
          handleNavClick(href);
          router.push(href);
        }}
        onLogin={handleLogin}
        onRegister={handleRegister}
        getBadgeWithFallback={getBadgeWithFallback}
        canInstall={canInstall}
        isInstalled={isInstalled}
        handleFaceAuthClick={handleFaceAuthClick}
        handlePWASettingsClick={handlePWASettingsClick}
      />
    </>
  );
}
