// components/trainer/mobile-menu/TrainerMobileMenu.tsx - ОПТИМИЗИРОВАННАЯ ВЕРСИЯ

"use client";

import { useEffect, useCallback, memo } from "react";
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

// ✅ Оптимизированные варианты анимации
const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.15, ease: "easeOut" } // Ускорили анимацию
  },
  exit: { 
    opacity: 0,
    transition: { duration: 0.1, ease: "easeIn" }  // Ускорили закрытие
  },
};

const menuVariants = {
  hidden: { 
    x: "100%",
    transition: { duration: 0 } // Убрали анимацию при монтировании
  },
  visible: {
    x: 0,
    transition: {
      type: "spring",
      damping: 30, // Увеличили демпинг для меньшего колебания
      stiffness: 300, // Увеличили жесткость для быстроты
      mass: 0.8, // Уменьшили массу для быстроты
    },
  },
  exit: {
    x: "100%",
    transition: {
      type: "spring",
      damping: 35,
      stiffness: 400,
      mass: 0.6,
    },
  },
};

// ✅ Мемоизированный заголовок
const MenuHeader = memo(({ onClose }: { onClose: () => void }) => (
  <div className="flex items-center justify-between p-4 border-b border-white/20">
    <h2 className="text-lg font-semibold text-white">Меню тренера</h2>
    <Button
      variant="ghost"
      size="sm"
      onClick={onClose}
      className="text-white hover:bg-white/10 hover:text-white p-2 h-8 w-8 transition-colors duration-150"
    >
      <X className="h-4 w-4" />
    </Button>
  </div>
));

MenuHeader.displayName = 'MenuHeader';

export default memo(function TrainerMobileMenu({
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
  const { user } = useAuth();

  // ✅ Оптимизированное управление скроллом
  useEffect(() => {
    if (isOpen) {
      // Запоминаем текущую позицию скролла
      const scrollY = window.scrollY;
      
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
      
      return () => {
        // Восстанавливаем позицию скролла
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);

  // ✅ Мемоизированный обработчик закрытия
  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  // ✅ Мемоизированный обработчик клика по overlay
  const handleOverlayClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  }, [handleClose]);

  // ✅ Обработка Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, handleClose]);

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={handleOverlayClick}
            style={{ willChange: 'opacity' }} // Оптимизация для браузера
          />

          {/* Menu */}
          <motion.div
            className="fixed top-0 right-0 h-full w-80 bg-gradient-to-br from-blue-500 via-indigo-500 to-blue-500 shadow-2xl z-50 flex flex-col"
            variants={menuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{ 
              willChange: 'transform', // Оптимизация для браузера
              backfaceVisibility: 'hidden', // Предотвращение мерцания
            }}
          >
            {/* Header */}
            <MenuHeader onClose={handleClose} />

            {/* Content */}
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
              onClose={handleClose}
              refetch={refetch}
              showDebug={showDebug}
              setShowDebug={setShowDebug}
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
});