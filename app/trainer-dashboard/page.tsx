// app/trainer-dashboard/page.tsx - ИСПРАВЛЕННАЯ ВЕРСИЯ

"use client";

import { useState, useEffect, lazy, Suspense } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import TrainerHeader from '@/components/trainer/TrainerHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Users, Calendar, MessageSquare } from "lucide-react";
import { TrainerProvider } from '@/contexts/TrainerContext';
import { TrainerStats } from '@/components/trainer/components/TrainerStats';
import { useTrainerDataQuery } from '@/hooks/useTrainerDataQuery';
import { useWelcomeToast } from '@/hooks/useWelcomeToast';
import { useLoaderStore } from '@/stores/loaderStore';

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

// Компонент для работы с searchParams (обернут в Suspense)
function SearchParamsHandler({ onTabChange }: { onTabChange: (tab: string) => void }) {
  const { useSearchParams } = require('next/navigation');
  const searchParams = useSearchParams();

  useEffect(() => {
    const tab = searchParams?.get('tab');
    if (tab && ['overview', 'clients', 'schedule', 'messages'].includes(tab)) {
      onTabChange(tab);
    }
  }, [searchParams, onTabChange]);

  return null;
}

// Компонент с проверкой загрузки данных
function DashboardContent() {

  const hideLoader = useLoaderStore((state) => state.hideLoader);

  useEffect(() => {
    hideLoader();
    sessionStorage.removeItem('is_redirecting');
  }, [hideLoader]);

  const {
    messageStats,
    workoutStats,
    stats,
    isLoading,
    loadingStep,
    error,
    refetch
  } = useTrainerDataQuery();
  const [activeTab, setActiveTab] = useState("overview");
  const router = useRouter();
  const pathname = usePathname();

  // Обработчик изменения таба из URL
  const handleTabFromUrl = (tab: string) => {
    setActiveTab(tab);
  };

  // Обновляем URL при смене таба
  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);

    // Создаем новый URL с параметрами
    const params = new URLSearchParams(window.location.search);

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

  // Показываем ошибку если есть
  if (error) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="text-red-800 font-semibold mb-2">Ошибка загрузки данных</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={refetch}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 mr-2"
          >
            Повторить загрузку
          </button>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Перезагрузить страницу
          </button>
        </div>
      </main>
    );
  }

  // Основной контент дашборда
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Обработчик URL параметров в Suspense */}
      <Suspense fallback={null}>
        <SearchParamsHandler onTabChange={handleTabFromUrl} />
      </Suspense>

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

export default function TrainerDashboard() {
  useWelcomeToast();
  return (
    <TrainerProvider>
      <div className="min-h-[100svh] bg-gray-50">
        <TrainerHeader />
        <DashboardContent />
      </div>
    </TrainerProvider>
  );
}
