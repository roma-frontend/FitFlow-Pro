// components/manager/mobile-menu/ManagerMobileMenuContent.tsx
"use client";

import { motion } from "framer-motion";
import { ManagerNavigationItem } from "../types/manager-navigation";
import ManagerNavigationSection from "./sections/ManagerNavigationSection";
import ManagerUserSection from "./sections/ManagerUserSection";
import ManagerStatsSection from "./sections/ManagerStatsSection";
import ManagerActionsSection from "./sections/ManagerActionsSection";

interface ManagerMobileMenuContentProps {
  navigationItems: ManagerNavigationItem[];
  user: any;
  stats: any;
  onNavigation: (href: string) => void;
  onLogout: () => void;
  isLoggingOut: boolean;
  onClose: () => void;
}

export default function ManagerMobileMenuContent({
  navigationItems,
  user,
  stats,
  onNavigation,
  onLogout,
  isLoggingOut,
  onClose,
}: ManagerMobileMenuContentProps) {
  return (
    <div
      className="flex-1 overflow-y-auto overflow-x-clip p-4"
    >
      {/* Приветствие пользователя */}
        <ManagerUserSection user={user} />

      {/* ✅ Статистика */}
        <ManagerStatsSection stats={stats} />

      {/* ✅ Основная навигация (убираем дублирование) */}
      
        <ManagerNavigationSection
          navigationItems={navigationItems}
          onNavigation={onNavigation}
          onClose={onClose}
          isLoggingOut={isLoggingOut}
        />

      {/* Быстрые действия */}
        <ManagerActionsSection
          onNavigation={onNavigation}
          onLogout={onLogout}
          isLoggingOut={isLoggingOut}
          onClose={onClose}
        />
    </div>
  );
}
