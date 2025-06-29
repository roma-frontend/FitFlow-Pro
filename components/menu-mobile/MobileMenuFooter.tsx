// components/mobile-menu/MobileMenuFooter.tsx
"use client";

import { motion } from "framer-motion";
import { Heart, Code, Sparkles, Star, Zap } from "lucide-react";

// ✅ Анимации для footer 【138-1】
const footerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.4,
      delay: 0.3,
      ease: "easeOut"
    }
  }
};

const heartVariants = {
  beat: {
    scale: [1, 1.2, 1],
    transition: { 
      duration: 1.5, 
      repeat: Infinity, 
      ease: "easeInOut" 
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
      ease: "easeInOut",
      staggerChildren: 0.2
    }
  }
};

export default function MobileMenuFooter() {
  return (
    <motion.div 
      className="p-4 border-t border-white/20 bg-gradient-to-r from-blue-800/30 to-green-800/30"
      variants={footerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Версия приложения и статус */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <motion.div
            variants={sparkleVariants}
            animate="twinkle"
          >
            <Sparkles className="h-4 w-4 text-yellow-300" />
          </motion.div>
          <div className="text-xs text-white/80">
            <div className="font-semibold">FitFlow Pro v2.1.0</div>
            <div className="text-white/60">PWA Ready</div>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <motion.div
            animate={{ 
              boxShadow: [
                "0 0 0 0 rgba(34, 197, 94, 0.4)",
                "0 0 0 8px rgba(34, 197, 94, 0)",
              ]
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-2 h-2 bg-green-400 rounded-full"
          />
          <span className="text-xs text-white/70">Онлайн</span>
        </div>
      </div>

      {/* Рейтинг и отзывы */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + i * 0.1, type: "spring", stiffness: 500 }}
              >
                <Star className="h-3 w-3 text-yellow-400 fill-current" />
              </motion.div>
            ))}
          </div>
          <span className="text-xs text-white/80 font-medium">4.9</span>
        </div>
        
        <div className="text-xs text-white/60">
          2,847 отзывов
        </div>
      </div>

      {/* Быстрые действия */}
      <div className="flex items-center justify-center gap-4 mt-3 pt-3 border-t border-white/10">
        <motion.button
          className="flex items-center gap-1 text-xs text-white/70 hover:text-white transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Zap className="h-3 w-3" />
          <span>Обратная связь</span>
        </motion.button>
        
        <div className="w-px h-4 bg-white/20" />
        
        <motion.button
          className="flex items-center gap-1 text-xs text-white/70 hover:text-white transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Star className="h-3 w-3" />
          <span>Оценить</span>
        </motion.button>
      </div>

      {/* Copyright */}
      <div className="text-center mt-3 pt-2 border-t border-white/10">
        <motion.div 
          className="text-xs text-white/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          © 2024 FitFlow Pro. Все права защищены.
        </motion.div>
      </div>
    </motion.div>
  );
}
