// components/mobile-menu/MobileMenu.tsx
"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { NavigationItem } from "../types/navigation";
import MobileMenuHeader from "./MobileMenuHeader";
import MobileMenuContent from "./MobileMenuContent";
import MobileMenuFooter from "./MobileMenuFooter"; // ✅ Добавлен импорт

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  navigationItems: NavigationItem[];
  user: any;
  onNavigation: (href: string) => void;
  onLogin: () => void;
  onRegister: () => void;
  getBadgeWithFallback: (href: string) => { variant: string; text: string } | null;
  canInstall: boolean;
  isInstalled: boolean;
  handleFaceAuthClick: (e: React.MouseEvent) => void;
  handlePWASettingsClick: () => void;
}

// ✅ Оптимизированные варианты анимаций для производительности
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
      ease: [0.4, 0, 0.2, 1] // Кубическая кривая для плавности
    }
  },
  visible: { 
    x: 0,
    transition: { 
      duration: 0.4, 
      ease: [0.4, 0, 0.2, 1],
      type: "tween" // Используем tween для лучшей производительности
    }
  }
};

export default function MobileMenu({
  isOpen,
  onClose,
  navigationItems,
  user,
  onNavigation,
  onLogin,
  onRegister,
  getBadgeWithFallback,
  canInstall,
  isInstalled,
  handleFaceAuthClick,
  handlePWASettingsClick,
}: MobileMenuProps) {
  
  // ✅ Управление скроллом для производительности
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, [isOpen]);

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
          className="fixed inset-0 z-50 lg:hidden"
          onClick={handleOverlayClick}
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={backdropVariants}
        >
          {/* ✅ Backdrop с аппаратным ускорением */}
          <motion.div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            style={{ willChange: 'opacity' }} // Подсказка браузеру для оптимизации
          />
          
          {/* ✅ Slide-out menu с оптимизированными анимациями */}
          <motion.div 
            className="absolute top-0 right-0 h-full w-80 max-w-[85vw] bg-gradient-to-br from-blue-600 via-blue-700 to-green-600 shadow-2xl"
            variants={slideVariants}
            style={{ willChange: 'transform' }} // Оптимизация для transform
          >
            <div className="flex flex-col h-full">
              <MobileMenuHeader onClose={onClose} />
              
              <MobileMenuContent
                navigationItems={navigationItems}
                user={user}
                onNavigation={onNavigation}
                onLogin={onLogin}
                onRegister={onRegister}
                getBadgeWithFallback={getBadgeWithFallback}
                canInstall={canInstall}
                isInstalled={isInstalled}
                handleFaceAuthClick={handleFaceAuthClick}
                handlePWASettingsClick={handlePWASettingsClick}
                onClose={onClose}
              />
              
              <MobileMenuFooter /> {/* ✅ Теперь компонент найден */}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
