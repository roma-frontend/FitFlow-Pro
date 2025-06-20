// components/trainer/mobile-menu/TrainerMobileMenu.tsx
"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrainerNavigationItem } from "../types/trainer-navigation";
import TrainerMobileMenuHeader from "./TrainerMobileMenuHeader";
import TrainerMobileMenuContent from "./TrainerMobileMenuContent";
import TrainerMobileMenuFooter from "./TrainerMobileMenuFooter";
import type { SystemStats, WorkoutStats, MessageStats } from "@/types/trainer"; // ✅ Используем MessageStats из trainer

interface TrainerMobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  navigationItems: TrainerNavigationItem[];
  user: any;
  messageStats: MessageStats; // ✅ Используем MessageStats из @/types/trainer
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

// ✅ Оптимизированные варианты анимаций
const backdropVariants = {
  hidden: { 
    opacity: 0,
    transition: { duration: 0.2, ease: "easeOut" }
  },
  visible: { 
    opacity: 1,
    transition: { duration: 0.3, ease: "easeOut" }
  }
};

const slideVariants = {
  hidden: { 
    x: "100%",
    transition: { 
      duration: 0.3, 
      ease: [0.4, 0, 0.2, 1]
    }
  },
  visible: { 
    x: 0,
    transition: { 
      duration: 0.4, 
      ease: [0.4, 0, 0.2, 1],
      type: "tween"
    }
  }
};

export default function TrainerMobileMenu({
  isOpen,
  onClose,
  navigationItems,
  user,
  messageStats,
  workoutStats,
  stats, // ✅ Добавляем stats в деструктуризацию
  isLoading,
  loadingStep,
  error,
  onNavigation,
  onLogout,
  refetch,
  showDebug,
  setShowDebug,
}: TrainerMobileMenuProps) {
  
  // ✅ Обработка Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div 
          className="fixed inset-0 z-50 xl:hidden"
          onClick={handleOverlayClick}
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={backdropVariants}
        >
          {/* Backdrop */}
          <motion.div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            style={{ willChange: 'opacity' }}
          />
          
          {/* Slide-out menu */}
          <motion.div 
            className="absolute top-0 right-0 h-full w-80 max-w-[85vw] bg-gradient-to-br from-green-600 via-green-700 to-blue-600 shadow-2xl"
            variants={slideVariants}
            style={{ willChange: 'transform' }}
          >
            <div className="flex flex-col h-full">
              <TrainerMobileMenuHeader onClose={onClose} />
              
              <TrainerMobileMenuContent
                navigationItems={navigationItems}
                user={user}
                messageStats={messageStats}
                workoutStats={workoutStats}
                stats={stats} // ✅ Передаем stats
                isLoading={isLoading}
                loadingStep={loadingStep}
                error={error}
                onNavigation={onNavigation}
                onLogout={onLogout}
                refetch={refetch}
                showDebug={showDebug}
                setShowDebug={setShowDebug}
                onClose={onClose}
              />
              
              <TrainerMobileMenuFooter />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
