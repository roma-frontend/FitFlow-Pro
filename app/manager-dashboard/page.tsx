// app/manager-dashboard/page.tsx - ИСПРАВЛЕННАЯ ВЕРСИЯ

"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ManagerHeader from "@/components/manager/ManagerHeader";
import { ManagerProvider, useManager } from "@/contexts/ManagerContext";
import { Button } from "@/components/ui/button";
import { Download, Plus, RefreshCw } from "lucide-react";
import BottomStats from "@/components/manager/BottomStats";
import SideWidgets from "@/components/manager/SideWidgets";
import { StatCardList } from "@/components/manager/StatCardList";
import { TrainerList } from "@/components/manager/TrainerList";
import { BookingTable } from "@/components/manager/BookingTable";

import { useWelcomeToast } from "@/hooks/useWelcomeToast";

import {
  getTrainerStatusColor,
  getTrainerStatusText,
  getBookingStatusColor,
  getBookingStatusText
} from "@/app/manager/utils/statusHelpers";
import { getStatCards } from "@/app/manager/utils/getStatCards";
import { useLoaderStore } from "@/stores/loaderStore";

function ManagerDashboardContent() {
  const hideLoader = useLoaderStore((state) => state.hideLoader);

   useEffect(() => {
    // Очищаем loader и флаги при загрузке страницы admin
    hideLoader();
    sessionStorage.removeItem('is_redirecting');
  }, [hideLoader]);

  useWelcomeToast();
  const router = useRouter();
  const { stats, trainers, bookings, loading, refreshData } = useManager();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

  const statCards = getStatCards(stats);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Заголовок страницы и кнопки */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 px-4 sm:px-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Дашборд менеджера
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Управление тренерами, записями и аналитикой фитнес-центра
          </p>
        </div>
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 mt-4 md:mt-0">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing || loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            Обновить
          </Button>
          <Button
            onClick={() => router.push("/manager/reports")}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Экспорт
          </Button>
          <Button
            onClick={() => router.push("/manager/trainers/add")}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
          >
            <Plus className="h-4 w-4" />
            Добавить тренера
          </Button>
        </div>
      </div>

      {/* Статистические карточки */}
      <StatCardList statCards={statCards} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Левая часть: тренеры и записи */}
        <div className="lg:col-span-2 space-y-6">
          <TrainerList
            trainers={trainers}
            getTrainerStatusColor={getTrainerStatusColor}
            getTrainerStatusText={getTrainerStatusText}
          />
          <BookingTable
            bookings={bookings}
            getBookingStatusColor={getBookingStatusColor}
            getBookingStatusText={getBookingStatusText}
          />
        </div>
        {/* Правая часть: боковые виджеты */}
        <SideWidgets trainers={trainers} />
      </div>

      {/* Нижние карточки статистики */}
      <BottomStats stats={stats} />
    </div>
  );
}

export default function ManagerDashboard() {
  return (
    <ManagerProvider>
      <div className="min-h-[100svh] bg-gray-50">
        <ManagerHeader />
        <ManagerDashboardContent />
      </div>
    </ManagerProvider>
  );
}