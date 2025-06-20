// components/layout/LoaderManager.tsx
"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import ShopSkeleton from "@/components/ui/ShopSkeleton";

// Страницы где показывать скелетон
const PAGES_WITH_SKELETON = [
  "/",
  "/admin",
  "/dashboard",
  "/trainer",
  "/manager",
  "/staff-dashboard",
];

// Страницы где НЕ показывать скелетон
const PAGES_WITHOUT_SKELETON = [
  "/",
  "/shop",
  "/member-dashboard",
  "/trainer-dashboard",
  "/manager/trainers",
  "/manager/analytics",
  "/manager/bookings",
  "/admin/users",
  "/admin/settings",
  "/admin/reports",
  "/admin/analytics",
  "/admin/members",
  "/admin/trainers",
  "/admin/schedules",
  "/manager-dashboard",
];

// Функция проверки скелетона
const shouldShowSkeleton = (pathname: string): boolean => {
  const isExcluded = PAGES_WITHOUT_SKELETON.some((page) =>
    pathname?.startsWith(page)
  );

  if (isExcluded) return false;

  return PAGES_WITH_SKELETON.some((page) => pathname?.startsWith(page));
};

// Компонент скелетона для админ панели
const AdminSkeleton = () => {
  return (
    <div className="fixed inset-0 z-50 bg-white">
      <div className="min-h-screen flex">
        {/* Sidebar скелетон */}
        <div className="w-64 bg-gray-50 border-r border-gray-200 p-4">
          <div className="space-y-4">
            {/* Логотип */}
            <div className="h-8 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-md"></div>

            {/* Навигация */}
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-10 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-lg"
                ></div>
              ))}
            </div>
          </div>
        </div>

        {/* Основной контент */}
        <div className="flex-1 p-6">
          {/* Заголовок */}
          <div className="mb-6">
            <div className="h-8 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-md w-64 mb-2"></div>
            <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-md w-96"></div>
          </div>

          {/* Карточки статистики */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-gray-200 p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-lg"></div>
                  <div className="w-6 h-6 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded"></div>
                </div>
                <div className="h-8 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-md mb-2"></div>
                <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-md w-24"></div>
              </div>
            ))}
          </div>

          {/* Таблица */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-md w-48"></div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-md"></div>
                      <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-md w-3/4"></div>
                    </div>
                    <div className="w-20 h-8 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-md"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export function LoaderManager() {
  const pathname = usePathname();
  const { loading } = useAuth();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Не показываем скелетон до mount (избегаем hydration mismatch)
  if (!isMounted) {
    return null;
  }

  // Проверяем, нужен ли скелетон для текущей страницы
  const needsSkeleton = shouldShowSkeleton(pathname || "");

  // Показываем скелетон только если нужен и идет загрузка
  const showSkeleton = needsSkeleton && loading;

  console.log("🔄 LoaderManager:", {
    pathname,
    needsSkeleton,
    loading,
    showSkeleton,
    isMounted,
  });

  if (!showSkeleton) {
    return null;
  }

  // Возвращаем соответствующий скелетон в зависимости от страницы
  if (pathname?.startsWith("/shop")) {
    return <ShopSkeleton />;
  }

  // Для админ панели и других защищенных страниц
  return <AdminSkeleton />;
}
