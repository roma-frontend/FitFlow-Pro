// components/mobile-menu/MobileMenuContent.tsx
"use client";

import { motion } from "framer-motion";
import { NavigationItem } from "../types/navigation";
import NavigationSection from "./sections/NavigationSection";
import SpecialFeaturesSection from "./sections/SpecialFeaturesSection";
import UserWelcome from "./sections/UserWelcome";
import PWASection from "./sections/PWASection";
import AuthSection from "./sections/AuthSection";
import StatusSection from "./sections/StatusSection";

interface MobileMenuContentProps {
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
  onClose: () => void;
}

// ✅ Staggered анимация для контента 【134-1】
const contentVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.3,
      delay: 0.2,
      staggerChildren: 0.1, // Поочередное появление секций
      delayChildren: 0.1
    }
  }
};

const sectionVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { 
      duration: 0.4,
      ease: "easeOut"
    }
  }
};

export default function MobileMenuContent({
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
  onClose,
}: MobileMenuContentProps) {
  return (
    <motion.div 
      className="flex-1 overflow-y-auto overflow-x-clip p-4"
      variants={contentVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Приветствие пользователя */}
      {user && (
        <motion.div variants={sectionVariants}>
          <UserWelcome user={user} />
        </motion.div>
      )}

      {/* Основная навигация */}
      <motion.div variants={sectionVariants}>
        <NavigationSection
          navigationItems={navigationItems}
          user={user}
          onNavigation={onNavigation}
          getBadgeWithFallback={getBadgeWithFallback}
          onClose={onClose}
        />
      </motion.div>

      {/* Специальные функции */}
      <motion.div variants={sectionVariants}>
        <SpecialFeaturesSection
          user={user}
          isInstalled={isInstalled}
          handleFaceAuthClick={handleFaceAuthClick}
          handlePWASettingsClick={handlePWASettingsClick}
          onClose={onClose}
        />
      </motion.div>

      {/* PWA Install */}
      {canInstall && (
        <motion.div variants={sectionVariants}>
          <PWASection />
        </motion.div>
      )}

      {/* Авторизация */}
      {!user && (
        <motion.div variants={sectionVariants}>
          <AuthSection
            onLogin={onLogin}
            onRegister={onRegister}
            onClose={onClose}
          />
        </motion.div>
      )}

      {/* Статус приложения */}
      <motion.div variants={sectionVariants}>
        <StatusSection />
      </motion.div>
    </motion.div>
  );
}
