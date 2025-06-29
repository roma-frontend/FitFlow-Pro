// components/trainer/mobile-menu/TrainerMobileMenuFooter.tsx
"use client";

import { motion } from "framer-motion";
import { Heart, Code, Dumbbell, Star, Shield, Zap, Activity, Coffee, Sparkles } from "lucide-react";

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
  sparkle: {
    scale: [1, 1.3, 1],
    rotate: [0, 180, 360],
    transition: { 
      duration: 2, 
      repeat: Infinity, 
      ease: "easeInOut",
      delay: 0.5
    }
  }
};

export default function TrainerMobileMenuFooter() {
  return (
    <motion.div 
      className="p-4 border-t border-white/20 bg-gradient-to-r from-green-800/30 to-blue-800/30 backdrop-blur-sm"
      variants={footerVariants}
      initial="hidden"
      animate="visible"
    >

      {/* Copyright */}
      <div className="text-center border-t border-white/10 pt-2">
        <motion.div 
          className="text-xs text-white/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          © 2024 FitnessPro. Все права защищены.
        </motion.div>
        <motion.div 
          className="text-xs text-white/40 mt-1 flex items-center justify-center gap-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          <span>Версия для тренеров</span>
          <motion.div
            animate={{ 
              opacity: [0.4, 1, 0.4],
              transition: { duration: 2, repeat: Infinity }
            }}
          >
            •
          </motion.div>
          <span>Build 2024.06.16</span>
        </motion.div>
      </div>

      {/* Скрытая пасхалка для разработчиков */}
      <motion.div 
        className="text-center mt-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
      >
        <motion.button
          className="text-xs text-white/30 hover:text-white/60 transition-colors"
          whileHover={{ scale: 1.1 }}
          onClick={() => {
            console.log('🎉 Easter egg activated! 🏋️‍♂️');
            // Можно добавить какую-то скрытую функциональность
          }}
        >
          🏋️‍♂️ Made with 💪 by developers who lift
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
