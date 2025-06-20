// components/trainer/mobile-menu/TrainerMobileMenuContent.tsx
"use client";

import { motion } from "framer-motion";
import { TrainerNavigationItem } from "../types/trainer-navigation";
import type { MessageStats, WorkoutStats, SystemStats } from "@/types/trainer";
import TrainerUserSection from "./sections/TrainerUserSection";
import TrainerStatsSection from "./sections/TrainerStatsSection";
import TrainerNavigationSection from "./sections/TrainerNavigationSection";
import TrainerActionsSection from "./sections/TrainerActionsSection";
import TrainerDebugSection from "./sections/TrainerDebugSection";

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

const contentVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      duration: 0.3,
      delay: 0.2,
      staggerChildren: 0.1
    }
  }
};

export default function TrainerMobileMenuContent({
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
  return (
    <motion.div 
      className="flex-1 overflow-y-auto p-4 space-y-6"
      variants={contentVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Секция пользователя */}
      <TrainerUserSection 
        user={user}
        isLoading={isLoading}
        loadingStep={loadingStep}
      />

      {/* Секция статистики */}
      <TrainerStatsSection
        messageStats={messageStats}
        workoutStats={workoutStats}
        stats={stats}
        isLoading={isLoading}
        loadingStep={loadingStep}
      />

      {/* Секция навигации */}
      <TrainerNavigationSection
        navigationItems={navigationItems}
        messageStats={messageStats} // ✅ Добавляем
        workoutStats={workoutStats} // ✅ Добавляем
        onNavigation={onNavigation}
        isLoading={isLoading}
        onClose={onClose}
      />

      {/* Секция быстрых действий */}
      <TrainerActionsSection
        onNavigation={onNavigation}
        onLogout={onLogout}
        isLoading={isLoading}
        onClose={onClose}
      />

      {/* Секция отладки */}
      <TrainerDebugSection
        error={error}
        showDebug={showDebug}
        setShowDebug={setShowDebug}
        refetch={refetch}
        onClose={onClose}
      />
    </motion.div>
  );
}
