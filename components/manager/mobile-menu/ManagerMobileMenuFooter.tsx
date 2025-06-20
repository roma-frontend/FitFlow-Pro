// components/manager/mobile-menu/ManagerMobileMenuFooter.tsx
"use client";

import { motion } from "framer-motion";
import { Heart, Code, Dumbbell, Star, Shield, Zap, Users } from "lucide-react";

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

export default function ManagerMobileMenuFooter() {
  return (
    <motion.div 
      className="p-4 border-t border-white/20 bg-gradient-to-r from-blue-800/30 to-green-800/30"
      variants={footerVariants}
      initial="hidden"
      animate="visible"
    >
      

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
        
        <div className="w-px h-4 bg-white/20" />
        
        <motion.button
          className="flex items-center gap-1 text-xs text-white/70 hover:text-white transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Shield className="h-3 w-3" />
          <span>Поддержка</span>
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
          © 2024 FitAccess. Все права защищены.
        </motion.div>
        <motion.div 
          className="text-xs text-white/40 mt-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          Версия для менеджеров
        </motion.div>
      </div>
    </motion.div>
  );
}
