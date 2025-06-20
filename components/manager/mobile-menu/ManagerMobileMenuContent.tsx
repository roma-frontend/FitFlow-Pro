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

const contentVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.3,
      delay: 0.2,
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const sectionVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
};

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
    <motion.div
      className="flex-1 overflow-y-auto overflow-x-clip p-4"
      variants={contentVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Приветствие пользователя */}
      <motion.div variants={sectionVariants}>
        <ManagerUserSection user={user} />
      </motion.div>

      {/* ✅ Статистика */}
      <motion.div variants={sectionVariants}>
        <ManagerStatsSection stats={stats} />
      </motion.div>

      {/* ✅ Основная навигация (убираем дублирование) */}
      <motion.div variants={sectionVariants}>
        <ManagerNavigationSection
          navigationItems={navigationItems}
          onNavigation={onNavigation}
          onClose={onClose}
          isLoggingOut={isLoggingOut}
        />
      </motion.div>

      {/* Быстрые действия */}
      <motion.div variants={sectionVariants}>
        <ManagerActionsSection
          onNavigation={onNavigation}
          onLogout={onLogout}
          isLoggingOut={isLoggingOut}
          onClose={onClose}
        />
      </motion.div>
    </motion.div>
  );
}
