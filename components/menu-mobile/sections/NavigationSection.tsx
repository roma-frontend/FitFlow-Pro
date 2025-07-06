// components/mobile-menu/sections/NavigationSection.tsx
"use client";

import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import BadgeIcon from "@/components/ui/BadgeIcon";
import { NavigationItem } from "@/components/types/navigation";

interface NavigationSectionProps {
  navigationItems: NavigationItem[];
  user: any;
  onNavigation: (href: string) => void;
  getBadgeWithFallback: (
    href: string
  ) => { variant: string; text: string } | null;
  onClose: () => void;
}

// ✅ Анимация для элементов навигации 【134-1】
const listVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05, // Быстрое поочередное появление
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
};

// ✅ Hover анимации для производительности
const hoverVariants = {
  hover: {
    scale: 1.02,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    transition: { duration: 0.2, ease: "easeOut" },
  },
  tap: {
    scale: 0.98,
    transition: { duration: 0.1 },
  },
};

export default function NavigationSection({
  navigationItems,
  user,
  onNavigation,
  getBadgeWithFallback,
  onClose,
}: NavigationSectionProps) {
  return (
    <div className="space-y-2 mb-6">
      <div className="text-xs font-semibold text-white/70 uppercase tracking-wider px-2 mb-3">
        Навигация
      </div>

      <motion.div
        variants={listVariants}
        initial="hidden"
        animate="visible"
        className="space-y-1"
      >
        {navigationItems.map((item, index) => {
          const IconComponent = item.icon;
          const badgeData = getBadgeWithFallback(item.href);

          if (item.requiresAuth && !user) {
            return (
              <motion.button
                key={item.href}
                variants={itemVariants}
                whileTap="tap"
                onClick={(e) => {
                  e.preventDefault();
                  if (item.onClick) {
                    item.onClick(e);
                  } else {
                    onNavigation(item.href);
                  }

                  onClose();
                }}
                className="relative w-full flex items-center gap-3 p-3 rounded-lg text-white/90 transition-colors group"
                style={{ willChange: "transform" }}
              >
                <motion.div variants={hoverVariants}>
                  <IconComponent className="h-5 w-5" />
                  {badgeData && (
                    <motion.div
                      className="absolute -top-1 -right-1"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        delay: 0.2 + index * 0.05,
                        type: "spring",
                        stiffness: 500,
                      }}
                    >
                      <BadgeIcon
                        variant={badgeData.variant as any}
                        text={badgeData.text}
                        size="sm"
                        animated={true}
                      />
                    </motion.div>
                  )}
                </motion.div>

                <div className="flex-1 text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{item.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-white/60 bg-white/10 px-2 py-1 rounded-full">
                        Требуется вход
                      </span>
                      <motion.div
                        animate={{ x: [0, 3, 0] }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      >
                        <ChevronRight className="h-4 w-4 text-white/60 group-hover:text-white transition-colors" />
                      </motion.div>
                    </div>
                  </div>
                  {item.description && (
                    <motion.div
                      className="text-xs text-white/70 mt-1"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 + index * 0.05 }}
                    >
                      {item.description}
                    </motion.div>
                  )}
                </div>
              </motion.button>
            );
          }

          return (
            <motion.button
              key={item.href}
              variants={itemVariants}
              whileTap="tap"
              onClick={(e) => {
                e.preventDefault();
                if (item.onClick) {
                  item.onClick(e);
                } else {
                  onNavigation(item.href);
                }

                onClose();
              }}
              className="relative w-full flex items-center gap-3 p-3 rounded-lg text-white/90 transition-colors group"
              style={{ willChange: "transform" }}
            >
              <motion.div variants={hoverVariants}>
                <IconComponent className="h-5 w-5" />
                {badgeData && (
                  <motion.div
                    className="absolute -top-1 -right-1"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      delay: 0.2 + index * 0.05,
                      type: "spring",
                      stiffness: 500,
                    }}
                  >
                    <BadgeIcon
                      variant={badgeData.variant as any}
                      text={badgeData.text}
                      size="sm"
                      animated={true}
                    />
                  </motion.div>
                )}
              </motion.div>

              <div className="flex-1 text-left">
                <div className="flex items-center justify-between">
                  <motion.div
                    animate={{ x: [0, 3, 0] }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <ChevronRight className="h-4 w-4 text-white/60 group-hover:text-white transition-colors" />
                  </motion.div>
                </div>
                {item.description && (
                  <motion.div
                    className="text-xs text-white/70 mt-1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 + index * 0.05 }}
                  >
                    {item.description}
                  </motion.div>
                )}
              </div>
            </motion.button>
          );
        })}
      </motion.div>
    </div>
  );
}
