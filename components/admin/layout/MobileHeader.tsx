"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Menu, BarChart3, Sparkles, X } from "lucide-react";
import { PersonalizedNotifications } from '@/components/admin/PersonalizedNotifications';
import { PersonalizedStats } from '@/components/admin/PersonalizedStats';
import { useRouter } from 'next/navigation';

interface MobileHeaderProps {
  roleTexts: any;
  onMenuOpen: () => void;
}

// Анимации для заголовка
const headerVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.3, 
      ease: "easeOut"
    }
  }
};

const logoVariants = {
  hover: { 
    scale: 1.05,
    transition: { duration: 0.2 }
  },
  tap: { 
    scale: 0.95,
    transition: { duration: 0.1 }
  }
};

const sparkleVariants = {
  twinkle: {
    opacity: [0.3, 1, 0.3],
    scale: [0.8, 1.2, 0.8],
    rotate: [0, 180, 360],
    transition: { 
      duration: 2, 
      repeat: Infinity, 
      ease: "easeInOut"
    }
  }
};

const statsSlideVariants = {
  hidden: { 
    opacity: 0, 
    height: 0,
    transition: { 
      duration: 0.3,
      ease: "easeInOut"
    }
  },
  visible: { 
    opacity: 1, 
    height: "auto",
    transition: { 
      duration: 0.4,
      ease: "easeInOut"
    }
  }
};

export function MobileHeader({ roleTexts, onMenuOpen }: MobileHeaderProps) {
  const [showMobileStats, setShowMobileStats] = useState(false);
  const router = useRouter()

  return (
    <motion.div 
      className="lg:hidden bg-gradient-to-r from-blue-600 via-blue-700 to-green-600 shadow-lg border-b border-white/20"
      variants={headerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Основной заголовок */}
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Левая часть - логотип и название */}
          <div className="flex items-center gap-3">
            <motion.div
              whileHover="hover"
              whileTap="tap"
              variants={logoVariants}
            >
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onMenuOpen}
                className="text-white hover:bg-white/20 p-2 h-10 w-10 hover:text-white"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </motion.div>
            
            <motion.div 
              className="flex items-center gap-3"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <motion.div 
                className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center"
                variants={sparkleVariants}
                animate="twinkle"
                onClick={() => router.push("/")}
              >
                <Sparkles className="h-4 w-4 text-white" />
              </motion.div>
              <div className="hidden sm:block text-white">
                <h1 className="font-bold text-lg leading-tight">
                  {roleTexts.dashboardTitle || 'FitFlow Pro'}
                </h1>
                <div className="text-xs text-blue-100 opacity-90">
                  Панель управления
                </div>
              </div>
            </motion.div>
          </div>
          
          {/* Правая часть - действия */}
          <div className="flex items-center gap-2">
            {/* Уведомления */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.1 }}
            >
              <PersonalizedNotifications />
            </motion.div>
            
            {/* Кнопка статистики */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.1 }}
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMobileStats(!showMobileStats)}
                className={`text-white hover:bg-white/20 p-2 h-10 w-10 transition-colors hover:text-white ${
                  showMobileStats ? 'bg-white/20' : ''
                }`}
              >
                <BarChart3 className="h-5 w-5" />
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Индикатор статуса */}
        <motion.div 
          className="flex items-center justify-between mt-3 pt-3 border-t border-white/20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ 
                boxShadow: [
                  "0 0 0 0 rgba(34, 197, 94, 0.4)",
                  "0 0 0 6px rgba(34, 197, 94, 0)",
                ]
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-2 h-2 bg-green-400 rounded-full"
            />
            <span className="text-xs text-white/80 font-medium">Система активна</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge 
              variant="outline" 
              className="text-xs text-white/80 border-white/30 bg-white/10 backdrop-blur-sm"
            >
              v2.1.0
            </Badge>
          </div>
        </motion.div>
      </div>

      {/* Выдвижная панель статистики */}
      <AnimatePresence>
        {showMobileStats && (
          <motion.div
            variants={statsSlideVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="border-t border-white/20 bg-gradient-to-r from-blue-800/30 to-green-800/30 backdrop-blur-sm overflow-hidden"
          >
            <div className="p-4">
              {/* Заголовок секции статистики */}
              <motion.div 
                className="flex items-center justify-between mb-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-white" />
                  <span className="text-sm font-semibold text-white">
                    Быстрая статистика
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowMobileStats(false)}
                  className="text-white/70 hover:text-white hover:bg-white/20 p-1 h-6 w-6"
                >
                  <X className="h-3 w-3" />
                </Button>
              </motion.div>

              {/* Контейнер статистики */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20"
              >
                <PersonalizedStats />
              </motion.div>

              {/* Дополнительная информация */}
              <motion.div 
                className="mt-3 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <div className="text-xs text-white/60">
                  Данные обновлены только что
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
