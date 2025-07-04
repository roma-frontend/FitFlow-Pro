// components/trainer/mobile-menu/TrainerMobileMenuContent.tsx - ОПТИМИЗИРОВАННАЯ ВЕРСИЯ
"use client";

import { memo, useMemo } from "react";
import { motion } from "framer-motion";
import { TrainerNavigationItem } from "../types/trainer-navigation";
import type { MessageStats, WorkoutStats, SystemStats } from "@/types/trainer";
import TrainerUserSection from "./sections/TrainerUserSection";
import TrainerStatsSection from "./sections/TrainerStatsSection";
import TrainerActionsSection from "./sections/TrainerActionsSection";

interface TrainerMobileMenuContentProps {
  navigationItems: TrainerNavigationItem[];
  user: any;
  messageStats: MessageStats;
  workoutStats: WorkoutStats;
  stats: SystemStats;
  isLoading: boolean;
  loadingStep: string;
  error: string | null;
  onNavigation: (href: string) => void;
  onLogout: () => void;
  refetch: () => void;
  showDebug: boolean;
  setShowDebug: (show: boolean) => void;
  onClose: () => void;
}


export default memo(function TrainerMobileMenuContent({
  navigationItems,
  user,
  messageStats,
  workoutStats,
  stats,
  isLoading,
  loadingStep,
  error,
  onNavigation,
  onLogout,
  refetch,
  showDebug,
  setShowDebug,
  onClose,
}: TrainerMobileMenuContentProps) {
  
  // ✅ Мемоизируем секции для предотвращения пересоздания
  const userSection = useMemo(() => (
    <TrainerUserSection 
      user={user}
      isLoading={isLoading}
      loadingStep={loadingStep}
    />
  ), [user, isLoading, loadingStep]);

  const statsSection = useMemo(() => (
    <TrainerStatsSection
      messageStats={messageStats}
      workoutStats={workoutStats}
      stats={stats}
      isLoading={isLoading}
      loadingStep={loadingStep}
    />
  ), [messageStats, workoutStats, stats, isLoading, loadingStep]);

  const actionsSection = useMemo(() => (
    <TrainerActionsSection
      onNavigation={onNavigation}
      onLogout={onLogout}
      isLoading={isLoading}
      onClose={onClose}
    />
  ), [onNavigation, onLogout, isLoading, onClose]);

  return (
    <div 
      className="flex-1 overflow-y-auto p-4 space-y-6"
    >
      {/* Секция пользователя */}
      {userSection}

      {/* Секция статистики */}
      {statsSection}

      {/* Секция быстрых действий */}
      {actionsSection}
    </div>
  );
});