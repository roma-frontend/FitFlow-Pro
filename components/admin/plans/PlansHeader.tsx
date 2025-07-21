// components/PlansHeader.tsx
import React, { memo } from 'react';
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Plus,
  CreditCard,
  RefreshCw,
  Settings,
  Eye,
  Database,
  Package
} from "lucide-react";

interface PlansHeaderProps {
  loading: boolean;
  onRefresh: () => void;
  onCreatePlan: () => void;
  onCheckPlans: () => void;
  onSeedPlans: () => void;
}

export const PlansHeader = memo<PlansHeaderProps>(({
  loading,
  onRefresh,
  onCreatePlan,
  onCheckPlans,
  onSeedPlans
}) => {
  const router = useRouter();

  return (
    <header className="relative bg-gradient-to-r from-white via-gray-50 to-white border-b border-gray-200/80 backdrop-blur-sm rounded-xl">
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />

      <div className="px-4 py-3 sm:px-6 sm:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
            <button
              onClick={() => router.push("/admin")}
              className="group p-2 hover:bg-blue-50 rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
            </button>

            <div className="relative flex-shrink-0">
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center ring-2 ring-white shadow-lg hover:ring-blue-300 transition-all duration-300 transform hover:scale-105">
                <CreditCard className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 sm:h-4 sm:w-4 rounded-full border-2 border-white shadow-sm bg-green-400 animate-pulse" />
            </div>

            <div className="min-w-0 flex flex-col flex-1">
              <h1 className="hidden md:inline text-base md:text-xl lg:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Управление планами
              </h1>
              <p className="hidden md:inline-block text-sm text-gray-500 mt-0.5">
                Создание и редактирование тарифных планов
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={onRefresh}
              disabled={loading}
              className="group p-2.5 hover:bg-green-50 rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Обновить"
            >
              <RefreshCw className={`h-5 w-5 text-gray-600 group-hover:text-green-600 transition-colors ${loading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={() => router.push("/admin/memberships")}
              className="group p-2.5 hover:bg-purple-50 rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95 hover:shadow-lg"
              aria-label="Абонементы"
            >
              <Package className="h-5 w-5 text-gray-600 group-hover:text-purple-600 transition-colors" />
            </button>

            <button
              onClick={() => router.push('/admin/settings')}
              className="group p-2.5 hover:bg-orange-50 rounded-xl transition-all duration-200 hidden sm:block transform hover:scale-105 active:scale-95 hover:shadow-lg"
              aria-label="Настройки"
            >
              <Settings className="h-5 w-5 text-gray-600 group-hover:text-orange-600 transition-colors" />
            </button>

            <button
              onClick={onCheckPlans}
              disabled={loading}
              className="group p-2.5 hover:bg-blue-50 rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Проверить планы"
            >
              <Eye className="h-5 w-5 text-gray-600 group-hover:text-blue-600 hidden sm:block transition-colors" />
            </button>

            <button
              onClick={onSeedPlans}
              disabled={loading}
              className="group p-2.5 hover:bg-indigo-50 rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hidden sm:block"
              aria-label="Инициализировать планы"
            >
              <Database className="h-5 w-5 text-gray-600 group-hover:text-indigo-600 transition-colors" />
            </button>

            <Button
              onClick={onCreatePlan}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg ml-2"
            >
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden md:inline">Новый план</span>
              <span className="md:hidden">Новый</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
});

PlansHeader.displayName = 'PlansHeader';