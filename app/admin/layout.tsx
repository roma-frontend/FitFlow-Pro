// app/admin/layout.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useUnifiedData } from "@/contexts/UnifiedDataContext";
import { useRoleTexts, getContextualHints } from "@/lib/roleTexts";
import { SuperAdminProvider } from "@/contexts/SuperAdminContext";
import { QueryProvider } from "@/components/providers/QueryProvider";
import FitnessLoader from '@/components/ui/FitnessLoader';

import { useWelcomeToast } from "@/hooks/useWelcomeToast";

// Импорт компонентов
import { Sidebar } from "@/components/admin/layout/Sidebar";
import { MobileHeader } from "@/components/admin/layout/MobileHeader";
import { MobileMenu } from "@/components/admin/layout/MobileMenu";

import {
  LayoutDashboard,
  Users,
  Calendar,
  BarChart3,
  Settings,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  MessageCircle,
  Package,
  Shield,
} from "lucide-react";
import { GlobalNotifications } from "@/components/admin/layout/GlobalNotifications";
import { PersonalizedTooltips } from "@/components/admin/layout/PersonalizedTooltips";

// Хук для определения мобильного устройства
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  return isMobile;
};

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  useWelcomeToast();
  const { user, loading: authLoading, refreshUser } = useAuth();
  const router = useRouter();
  const userRole = user?.role;
  const roleTexts = useRoleTexts(userRole);
  const isMobile = useIsMobile();

  const {
    events,
    loading: scheduleLoading,
    error: scheduleError,
    isOnline,
    retryCount,
    lastSync,
    syncAllData,
  } = useUnifiedData();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Получаем контекстные подсказки
  const hints = getContextualHints(userRole);

  // Проверка авторизации и загрузка данных пользователя
  useEffect(() => {
    const initializeAuth = async () => {
      console.log('🔍 AdminLayout: Инициализация авторизации...');

      // Сначала проверяем localStorage
      const storedUser = localStorage.getItem('auth_user');
      const storedToken = localStorage.getItem('auth_token');

      if (!storedUser || !storedToken) {
        console.log('❌ AdminLayout: Нет сохраненных данных авторизации');
        return;
      }

      // Если user еще не загружен, но есть данные в localStorage
      if (!user && !authLoading) {
        console.log('🔄 AdminLayout: Обновляем данные пользователя...');
        await refreshUser();
      }

      // Проверка прав доступа
      if (user) {
        const adminRoles = ['admin', 'super-admin', 'manager', 'trainer'];
        if (!adminRoles.includes(user.role)) {
          console.log('❌ AdminLayout: Недостаточно прав доступа');
          router.push('/unauthorized');
          return;
        }
        setIsInitialized(true);
      }
    };

    initializeAuth();
  }, [user, authLoading, refreshUser, router]);

  // Функция проверки прав доступа
  const hasPermission = (resource: string, action: string) => {
    if (!userRole) return false;

    switch (userRole) {
      case "super-admin":
        return true;
      case "admin":
        return true;
      case "manager":
        return [
          "users",
          "schedule",
          "messages",
          "analytics",
          "products",
        ].includes(resource);
      case "trainer":
        return ["schedule", "messages"].includes(resource);
      case "member":
      case "client":
        return ["schedule", "messages"].includes(resource);
      default:
        return false;
    }
  };

  // Навигационные элементы с проверкой прав доступа
  const navigationItems = useMemo(() => {
    if (!userRole) return [];

    const items = [
      {
        href: "/admin",
        label: roleTexts.dashboardTitle,
        icon: LayoutDashboard,
        permission: null,
      },
      {
        href: "/admin/users",
        label: roleTexts.usersTitle,
        icon: Users,
        permission: { resource: "users", action: "read" },
      },
      {
        href: "/admin/products",
        label: roleTexts.productsTitle,
        icon: Package,
        permission: { resource: "products", action: "read" },
      },
      {
        href: "/admin/analytics",
        label: roleTexts.reportsTitle,
        icon: BarChart3,
        permission: { resource: "analytics", action: "read" },
      },
      {
        href: "/admin/schedule",
        label: roleTexts.scheduleTitle,
        icon: Calendar,
        permission: { resource: "schedule", action: "read" },
      },
      {
        href: "/admin/messages",
        label: roleTexts.messagesTitle,
        icon: MessageCircle,
        permission: { resource: "messages", action: "read" },
      },
      {
        href: "/admin/settings",
        label: roleTexts.settingsTitle,
        icon: Settings,
        permission: { resource: "settings", action: "read" },
      },
      {
        label: roleTexts.resetPasswordTitle,
        href: "/admin/password-reset",
        icon: Shield,
        description: roleTexts.resetPasswordDescription,
        permission: null,
      },
    ];

    return items.filter((item) => {
      if (!item.permission) return true;
      return hasPermission(item.permission.resource, item.permission.action);
    });
  }, [userRole, roleTexts]);

  // Статистика для сайдбара
  const sidebarStats = useMemo(() => {
    const today = new Date();
    const todayEvents = events.filter((event) => {
      try {
        const eventDate = new Date(event.startTime);
        return eventDate.toDateString() === today.toDateString();
      } catch {
        return false;
      }
    });

    const thisWeekEvents = events.filter((event) => {
      try {
        const eventDate = new Date(event.startTime);
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        return eventDate >= weekStart && eventDate <= weekEnd;
      } catch {
        return false;
      }
    });

    const completionRate =
      events.length > 0
        ? Math.round(
          (events.filter((e) => e.status === "completed").length /
            events.length) *
          100
        )
        : 0;

    return {
      totalEvents: events.length,
      todayEvents: todayEvents.length,
      weekEvents: thisWeekEvents.length,
      completionRate,
    };
  }, [events]);

  // Определяем статус системы
  const systemStatus = useMemo(() => {
    if (scheduleError) {
      return {
        text:
          roleTexts.warningMessages?.offlineMode ||
          "Работа в автономном режиме",
        color: "text-red-600",
        bgColor: "from-red-50 to-red-100",
        icon: AlertTriangle,
      };
    }

    if (isOnline) {
      return {
        text:
          userRole === "super-admin"
            ? "Все системы работают"
            : "Система работает",
        color: "text-green-600",
        bgColor: "from-green-50 to-green-100",
        icon: CheckCircle,
      };
    }

    return {
      text: "Проверка соединения...",
      color: "text-yellow-600",
      bgColor: "from-yellow-50 to-yellow-100",
      icon: RefreshCw,
    };
  }, [scheduleError, isOnline, userRole, roleTexts]);

  // Если пользователь не авторизован после загрузки
  if (!authLoading && !user) {
    if (isMobile) {
      return (
        <FitnessLoader
          isMobile={true}
          theme="staff"
          size="lg"
          variant="heartbeat"
          text="До новых встреч!"
          showProgress={false}
          motivationalTexts={[
            "Требуется авторизация...",
            "Перенаправление на страницу входа...",
            "Пожалуйста, войдите в систему"
          ]}
        />
      );
    }
  }

  // Если нет навигационных элементов, показываем ошибку
  if (isInitialized && navigationItems.length === 0) {
    if (isMobile) {
      return (
        <FitnessLoader
          isMobile={true}
          theme="staff"
          size="lg"
          variant="yoga"
          text="Ошибка загрузки"
          showProgress={false}
          motivationalTexts={[
            "Ошибка загрузки навигации...",
            "Проверяем настройки...",
            "Попробуйте обновить страницу"
          ]}
        />
      );
    }
  }

  return (
    <div className="min-h-[100svh] bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Мобильная шапка */}
      <MobileHeader
        roleTexts={roleTexts}
        onMenuOpen={() => setSidebarOpen(true)}
      />

      <div className="relative flex">
        {/* Мобильное меню */}
        <MobileMenu
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          navigationItems={navigationItems}
          user={user}
        />

        {/* Сайдбар */}
        <Sidebar
          user={user}
          roleTexts={roleTexts}
          navigationItems={navigationItems}
          sidebarStats={sidebarStats}
          systemStatus={systemStatus}
          isOnline={isOnline}
          lastSync={lastSync}
          retryCount={retryCount}
          scheduleError={scheduleError}
          scheduleLoading={scheduleLoading}
          syncAllData={syncAllData}
          hints={hints}
        />

        {/* Основной контент */}
        <main className="static flex-1">
          <div className="max-w-7xl mx-auto p-4 lg:p-6">
            {children}
          </div>
        </main>
      </div>

      {/* Глобальные уведомления */}
      <GlobalNotifications
        lastSync={lastSync}
        scheduleLoading={scheduleLoading}
        scheduleError={scheduleError}
        roleTexts={roleTexts}
      />

      {/* Персонализированные всплывающие подсказки */}
      <PersonalizedTooltips userRole={userRole ?? ''} />
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SuperAdminProvider>
      <QueryProvider>
        <AdminLayoutContent>{children}</AdminLayoutContent>
      </QueryProvider>
    </SuperAdminProvider>
  );
}