// app/trainer-dashboard/page.tsx - ФИНАЛЬНАЯ ИСПРАВЛЕННАЯ ВЕРСИЯ

"use client";

import { useState, useEffect, lazy, Suspense } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import TrainerHeader from '@/components/trainer/TrainerHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Users, Calendar, MessageSquare } from "lucide-react";
import { TrainerProvider } from '@/contexts/TrainerContext';
import { TrainerStats } from '@/components/trainer/components/TrainerStats';
import { useTrainerDataQuery } from '@/hooks/useTrainerDataQuery';
import { useAuth } from '@/hooks/useAuth';
import { useWelcomeToast } from '@/hooks/useWelcomeToast';
import StaffLogoutLoader from '../staff-login/components/StaffLogoutLoader';
import { useStaffAuth } from '@/hooks/useStaffAuth';

// Ленивая загрузка компонентов
const TrainerOverview = lazy(() => import('@/components/trainer/TrainerOverview'));
const ClientsManagement = lazy(() => import('@/components/trainer/ClientsManagement'));
const ScheduleManagement = lazy(() => import('@/components/trainer/ScheduleManagement'));
const MessagesComponent = lazy(() => import('@/components/trainer/MessagesComponent'));

// Компонент скелетона для табов
function TabSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white p-6 rounded-lg border animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
      <div className="bg-white p-6 rounded-lg border animate-pulse">
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
}

// Компонент с проверкой загрузки данных
function DashboardContent() {
  const {
    messageStats,
    workoutStats,
    stats,
    isLoading,
    loadingStep,
  } = useTrainerDataQuery();
  const [activeTab, setActiveTab] = useState("overview");
  const { showLogoutLoader } = useStaffAuth();
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Обработка изменения таба из URL при загрузке
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['overview', 'clients', 'schedule', 'messages'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Обновляем URL при смене таба
  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);

    // Создаем новый URL с параметрами
    const params = new URLSearchParams(searchParams.toString());

    if (newTab === 'overview') {
      params.delete('tab');
    } else {
      params.set('tab', newTab);
    }

    // Формируем новый путь
    const newPath = params.toString()
      ? `${pathname}?${params.toString()}`
      : pathname;

    // Используем router.replace для обновления URL без перезагрузки
    router.replace(newPath, { scroll: false });
  };

  if (showLogoutLoader) {
    return (
      <StaffLogoutLoader
        userRole={user?.role || "trainer"}
        userName={user?.name || "Тренер"}
        redirectUrl="/"
      />
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-8">
        {/* Навигационные табы */}
        <div className="hidden sm:block">
          <TabsList className="grid w-full grid-cols-4 lg:w-[600px] mx-auto">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden md:inline">Обзор</span>
            </TabsTrigger>
            <TabsTrigger value="clients" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden md:inline">Клиенты</span>
            </TabsTrigger>
            <TabsTrigger value="schedule" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden md:inline">Расписание</span>
            </TabsTrigger>
            <TabsTrigger value="messages" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <span className="hidden md:inline">Сообщения</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Мобильная навигация */}
        <div className="sm:hidden">
          <select
            value={activeTab}
            onChange={(e) => handleTabChange(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="overview">📊 Обзор</option>
            <option value="clients">👥 Клиенты</option>
            <option value="schedule">📅 Расписание</option>
            <option value="messages">💬 Сообщения</option>
          </select>
        </div>

        <TrainerStats
          messageStats={messageStats}
          workoutStats={workoutStats}
          stats={stats}
          isLoading={isLoading}
          loadingStep={loadingStep}
        />

        {/* Контент табов */}
        <div className="animate-in fade-in-50 duration-200">
          <TabsContent value="overview" className="space-y-6 mt-0">
            <Suspense fallback={<TabSkeleton />}>
              <TrainerOverview />
            </Suspense>
          </TabsContent>

          <TabsContent value="clients" className="space-y-6 mt-0">
            <Suspense fallback={<TabSkeleton />}>
              <ClientsManagement />
            </Suspense>
          </TabsContent>

          <TabsContent value="schedule" className="space-y-6 mt-0">
            <Suspense fallback={<TabSkeleton />}>
              <ScheduleManagement />
            </Suspense>
          </TabsContent>

          <TabsContent value="messages" className="space-y-6 mt-0">
            <Suspense fallback={<TabSkeleton />}>
              <MessagesComponent />
            </Suspense>
          </TabsContent>
        </div>
      </Tabs>
    </main>
  );
}

// Компонент-обертка для всей страницы
function TrainerDashboardPage() {
  useWelcomeToast();

  return (
    <TrainerProvider>
      <div className="min-h-[100svh] bg-gray-50">
        <TrainerHeader />
        <Suspense fallback={
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="animate-pulse">
              <div className="h-12 bg-gray-200 rounded w-1/3 mb-8"></div>
              <TabSkeleton />
            </div>
          </div>
        }>
          <DashboardContent />
        </Suspense>
      </div>
    </TrainerProvider>
  );
}

export default function TrainerDashboard() {
  return <TrainerDashboardPage />;
}