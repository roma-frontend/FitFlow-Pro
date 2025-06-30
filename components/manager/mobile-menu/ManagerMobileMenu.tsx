// components/manager/mobile-menu/ManagerMobileMenu.tsx
"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import ManagerMobileMenuContent from "./ManagerMobileMenuContent";
import { ManagerNavigationItem } from "../types/manager-navigation";
import { ManagerStats } from "@/contexts/ManagerContext";

interface ManagerMobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  navigationItems: ManagerNavigationItem[];
  user: any;
  stats: ManagerStats;
  onNavigation: (href: string) => void;
  onLogout: () => void;
  isLoggingOut: boolean;
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

export default function ManagerMobileMenu({
  isOpen,
  onClose,
  navigationItems,
  user,
  stats,
  onNavigation,
  onLogout,
  isLoggingOut,
}: ManagerMobileMenuProps) {
  // Блокируем скролл при открытом меню
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

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
            style={{ willChange: 'opacity' }} 
          />

          {/* Menu */}
          <motion.div
            className="fixed top-0 right-0 h-full w-80 bg-gradient-to-br from-blue-600 via-blue-700 to-green-600 shadow-2xl z-50 flex flex-col"
            variants={menuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{ 
              willChange: 'transform',
              backfaceVisibility: 'hidden',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/20">
              <h2 className="text-lg font-semibold text-white">
                Меню менеджера
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-white hover:bg-white/10 hover:text-white p-2 h-8 w-8"
                disabled={isLoggingOut}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Content */}
            <ManagerMobileMenuContent
              navigationItems={navigationItems}
              user={user}
              stats={stats}
              onNavigation={onNavigation}
              onLogout={onLogout}
              isLoggingOut={isLoggingOut}
              onClose={onClose}
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
