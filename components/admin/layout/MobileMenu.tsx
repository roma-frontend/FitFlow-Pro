"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Sparkles, ChevronRight, Database } from "lucide-react";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  navigationItems: any[];
  user?: any
}

// Оптимизированные варианты анимаций для производительности
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

const headerVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      delay: 0.1,
      ease: "easeOut"
    }
  }
};

const contentVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.3,
      delay: 0.2,
      staggerChildren: 0.05,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
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

export function MobileMenu({ isOpen, onClose, navigationItems, user }: MobileMenuProps) {
  const pathname = usePathname();
  const router = useRouter()

  // Управление скроллом для производительности
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

  // Обработка Escape
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

  const isSuperAdmin = user?.role === 'super-admin';

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
          {/* Backdrop с аппаратным ускорением */}
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            style={{ willChange: 'opacity' }}
          />

          {/* Slide-out menu с оптимизированными анимациями */}
          <motion.div
            className="absolute top-0 right-0 h-full w-80 max-w-[85vw] bg-gradient-to-br from-blue-600 via-blue-700 to-green-600 shadow-2xl"
            variants={slideVariants}
            style={{ willChange: 'transform' }}
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <motion.div
                className="flex items-center justify-between p-4 border-b border-white/20"
                variants={headerVariants}
                initial="hidden"
                animate="visible"
              >
                <motion.div
                  className="flex items-center gap-3"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <motion.div
                    className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center cursor-pointer"
                    variants={sparkleVariants}
                    animate="twinkle"
                    onClick={() => router.push("/")}
                  >
                    <Sparkles className="h-5 w-5 text-white" />
                  </motion.div>
                  <div className="text-white">
                    <div className="font-bold text-lg">FitFlow Pro</div>
                    <div className="text-xs text-blue-100">Админ-панель</div>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ duration: 0.1 }}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="text-white hover:bg-white/20 p-2 h-9 w-9"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </motion.div>
              </motion.div>

              {/* Navigation Content */}
              <motion.div
                className="flex-1 overflow-y-auto overflow-x-clip p-4"
                variants={contentVariants}
                initial="hidden"
                animate="visible"
              >
                {/* Заголовок навигации */}
                <motion.div
                  className="text-xs font-semibold text-white/70 uppercase tracking-wider px-2 mb-4"
                  variants={itemVariants}
                >
                  Навигация
                </motion.div>

                {/* Навигационные элементы */}
                <motion.nav className="space-y-2">
                  {navigationItems.map((item, index) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    return (
                      <motion.div
                        key={item.href}
                        variants={itemVariants}
                        whileHover={{ scale: 1.02, x: 5 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Link
                          href={item.href}
                          onClick={onClose}
                          className={`group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                            ? 'bg-white/20 text-white shadow-lg backdrop-blur-sm border border-white/30'
                            : 'text-white/80 hover:bg-white/10 hover:text-white'
                            }`}
                        >
                          <div className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 ${isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-white/10 text-white/70 group-hover:bg-white/20 group-hover:text-white'
                            }`}>
                            <Icon className="h-4 w-4" />
                          </div>

                          <span className="flex-1">{item.label}</span>

                          {/* Индикатор активного элемента */}
                          {isActive && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="w-2 h-2 bg-white rounded-full"
                            />
                          )}

                          {/* Стрелка для неактивных элементов */}
                          {!isActive && (
                            <ChevronRight className="h-4 w-4 text-white/50 group-hover:text-white/80 transition-colors" />
                          )}
                        </Link>
                      </motion.div>
                    );
                  })}
                </motion.nav>

                {isSuperAdmin && (
                  <motion.div
                    className="mt-6 pt-6 border-t border-white/20"
                    variants={itemVariants}
                  >
                    <div className="text-xs font-semibold text-white/70 uppercase tracking-wider px-2 mb-4">
                      Системные инструменты
                    </div>

                    <motion.div
                      variants={itemVariants}
                      whileHover={{ scale: 1.02, x: 5 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ duration: 0.2 }}
                    >
                      <button
                        onClick={() => {
                          router.push('/admin/seed-plans');
                          onClose();
                        }}
                        className="w-full group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 text-white/80 hover:bg-white/10 hover:text-white"
                      >
                        <div className="flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 bg-gradient-to-br from-purple-500/20 to-pink-500/20 text-white/70 group-hover:from-purple-500/30 group-hover:to-pink-500/30 group-hover:text-white">
                          <Database className="h-4 w-4" />
                        </div>

                        <span className="flex-1 text-left">Управление планами</span>

                        <motion.div
                          className="px-2 py-1 bg-purple-500/20 rounded-md"
                          whileHover={{ scale: 1.05 }}
                        >
                          <Sparkles className="h-3 w-3 text-purple-300" />
                        </motion.div>
                      </button>
                    </motion.div>
                    {/* Здесь можно добавить другие системные инструменты */}
                  </motion.div>
                )}


                {/* Дополнительная информация */}
                <motion.div
                  className="mt-8 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20"
                  variants={itemVariants}
                >
                  <div className="flex items-center justify-between mb-3">
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

                    <Badge
                      variant="outline"
                      className="text-xs text-white/80 border-white/30 bg-white/10"
                    >
                      v2.1.0
                    </Badge>
                  </div>

                  <div className="text-xs text-white/60">
                    Все системы работают нормально
                  </div>
                </motion.div>
              </motion.div>

              {/* Footer */}
              <motion.div
                className="p-4 border-t border-white/20 bg-gradient-to-r from-blue-800/30 to-green-800/30"
                variants={itemVariants}
              >
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 text-xs text-white/70 mb-2">
                    <span>Сделано с</span>
                    <motion.div
                      animate={{
                        scale: [1, 1.2, 1],
                        transition: { duration: 1.5, repeat: Infinity }
                      }}
                    >
                      ❤️
                    </motion.div>
                    <span>командой FitFlow</span>
                  </div>

                  <div className="text-xs text-white/50">
                    © 2024 FitFlow Pro. Все права защищены.
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
