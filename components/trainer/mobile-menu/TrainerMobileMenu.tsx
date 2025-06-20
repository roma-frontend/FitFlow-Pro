// components/trainer/mobile-menu/TrainerMobileMenu.tsx - ОБНОВЛЕННЫЙ ИНТЕРФЕЙС

"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import TrainerMobileMenuContent from "./TrainerMobileMenuContent";
import { TrainerNavigationItem } from "../types/trainer-navigation";
import type { MessageStats, WorkoutStats, SystemStats } from "@/types/trainer";
import { useAuth } from "@/hooks/useAuth";

interface TrainerMobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  navigationItems: TrainerNavigationItem[];
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
}

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const menuVariants = {
  hidden: { x: "100%" },
  visible: {
    x: 0,
    transition: {
      type: "spring",
      damping: 25,
      stiffness: 200,
    },
  },
  exit: {
    x: "100%",
    transition: {
      type: "spring",
      damping: 25,
      stiffness: 200,
    },
  },
};

export default function TrainerMobileMenu({
  isOpen,
  onClose,
  navigationItems,
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
}: TrainerMobileMenuProps) {
  // Блокируем скролл при открытом меню
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const { user } = useAuth();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
          />

          {/* Menu */}
          <motion.div
            className="fixed top-0 right-0 h-full w-80 bg-gradient-to-br from-green-600 via-green-700 to-blue-600 shadow-2xl z-50 flex flex-col"
            variants={menuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/20">
              <h2 className="text-lg font-semibold text-white">Меню тренера</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-white hover:bg-white/10 p-2 h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Content - также не передаем user */}
            <TrainerMobileMenuContent
              user={user}
              navigationItems={navigationItems}
              messageStats={messageStats}
              workoutStats={workoutStats}
              stats={stats}
              isLoading={isLoading}
              loadingStep={loadingStep}
              error={error}
              onNavigation={onNavigation}
              onLogout={onLogout}
              onClose={onClose}
              refetch={refetch}
              showDebug={showDebug}
              setShowDebug={setShowDebug}
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
