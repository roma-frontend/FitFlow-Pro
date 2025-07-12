// app/admin/page.tsx - добавляем SecurityWidget
"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRoleTexts } from "@/lib/roleTexts";
import { useRouter } from "next/navigation";

// Импорт компонентов
import { WelcomeHeader } from "@/components/admin/dashboard/WelcomeHeader";
import { StatusCards } from "@/components/admin/dashboard/StatusCards";
import { PersonalizedStats } from "@/components/admin/PersonalizedStats";
import { PersonalizedProgress } from "@/components/admin/PersonalizedProgress";
import { QuickActions } from "@/components/admin/QuickActions";
import { RecentActivity } from "@/components/admin/RecentActivity";
import { RoleTips } from "@/components/admin/dashboard/RoleTips";
import { RoleSpecificWidgets } from "@/components/admin/dashboard/RoleSpecificWidgets";
import { QuickStatsWidget } from "@/components/admin/dashboard/QuickStatsWidget";
import { NotificationsWidget } from "@/components/admin/dashboard/NotificationsWidget";
import { QuickLinksWidget } from "@/components/admin/dashboard/QuickLinksWidget";
import { SecurityWidget } from "@/components/admin/dashboard/SecurityWidget";
import { KeyMetrics } from "@/components/admin/dashboard/KeyMetrics";
import { WeeklyCalendar } from "@/components/admin/dashboard/WeeklyCalendar";
import { ProgressTracker } from "@/components/admin/dashboard/ProgressTracker";
import { DashboardFooter } from "@/components/admin/dashboard/DashboardFooter";
import { AdminDashboardSkeleton } from "@/components/admin/AdminDashboardSkeleton";
import { PWAStats } from "@/components/PWAStats";
import { PWAInstallButton } from "@/components/PWAInstallButton";
import { PWAStatus } from "@/components/PWAStatus";
import usePWA from "@/hooks/usePWA";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminDashboard() {
  const { user } = useAuth();
  const userRole = user?.role;
  const roleTexts = useRoleTexts(userRole);
  const router = useRouter();
  const { isInstalled, canInstall } = usePWA();

  // Получаем время суток для персонализированного приветствия
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Доброе утро";
    if (hour < 17) return "Добрый день";
    return "Добрый вечер";
  };

  // Обработчики навигации
  const goToHome = () => router.push("/");
  const goToProfile = () => router.push("admin/profile");
  const goToSettings = () => router.push("admin/settings");
  const goToPWASettings = () => router.push("/pwa");

  // Показываем загрузку если пользователь не загружен
  if (!user || !userRole) {
    return <AdminDashboardSkeleton />;
  }

  return (
    <div className="min-h-[100lvh] bg-gray-50 w-full overflow-x-hidden">
      <main className="w-full">
        <div className="px-2 sm:px-4 lg:px-6 xl:px-8 py-3 sm:py-4 lg:py-6">
          <div className="space-y-4 sm:space-y-6">
            {/* ПЕРСОНАЛИЗИРОВАННОЕ ПРИВЕТСТВИЕ */}
            <div className="w-full">
              <WelcomeHeader
                roleTexts={roleTexts}
                greeting={getGreeting()}
                onHome={goToHome}
                onProfile={goToProfile}
                onSettings={goToSettings}
              />
            </div>

            {/* КАРТОЧКИ СТАТУСА */}
            <div className="w-full">
              <StatusCards userRole={userRole} />
            </div>

            {/* ПЕРСОНАЛИЗИРОВАННАЯ СТАТИСТИКА */}
            <div className="w-full">
              <PersonalizedStats />
            </div>

            {/* ОСНОВНОЙ КОНТЕНТ */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
              {/* Основная область контента */}
              <div className="xl:col-span-2 space-y-4 sm:space-y-6">
                <QuickActions variant="expanded" />
              </div>

              {/* Боковая панель */}
              <div className="xl:col-span-2 space-y-4 sm:space-y-6">
                <PersonalizedProgress />

                {/* ✅ Добавляем SecurityWidget */}
                <SecurityWidget />

                {/* PWA виджет только если доступен */}
                {(canInstall || isInstalled) && (
                  <div className="w-full">
                    <PWAStats />
                  </div>
                )}
              </div>
            </div>

            {/* АКТИВНОСТЬ И СОВЕТЫ */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 sm:gap-6">
              {/* Недавняя активность */}
              <div className="xl:col-span-8 w-full">
                <RecentActivity />
              </div>

              {/* Советы по роли */}
              <div className="xl:col-span-4 w-full">
                <RoleTips userRole={userRole} />
              </div>
            </div>

            {/* ПЕРСОНАЛИЗИРОВАННЫЕ ВИДЖЕТЫ ПО РОЛИ */}
            <div className="w-full">
              <RoleSpecificWidgets userRole={userRole} />
            </div>

            {/* ДОПОЛНИТЕЛЬНЫЕ ВИДЖЕТЫ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
              <div className="w-full">
                <QuickStatsWidget userRole={userRole} />
              </div>

              <div className="w-full">
                <NotificationsWidget userRole={userRole} />
              </div>

              <div className="w-full sm:col-span-2 lg:col-span-1 space-y-4">
                <QuickLinksWidget userRole={userRole} />

                {(canInstall || isInstalled) && (
                  <Card className="w-full">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base sm:text-lg flex items-center gap-2 flex-wrap">
                        <Smartphone className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 flex-shrink-0" />
                        <span className="truncate">Приложение</span>
                        <PWAStatus showDetails={false} />
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {canInstall && (
                        <PWAInstallButton
                          variant="outline"
                          size="sm"
                          className="w-full"
                        />
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start"
                        onClick={goToPWASettings}
                      >
                        <Settings className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span className="truncate">Настройки PWA</span>
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            <div className="w-full">
              <KeyMetrics userRole={userRole} />
            </div>

            <div className="w-full">
              <WeeklyCalendar userRole={userRole} />
            </div>

            <div className="w-full">
              <ProgressTracker userRole={userRole} />
            </div>

            <div className="w-full">
              <DashboardFooter userRole={userRole} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}