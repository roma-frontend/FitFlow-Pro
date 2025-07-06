// components/mobile-menu/sections/SpecialFeaturesSection.tsx
"use client";

import { motion } from "framer-motion";
import { Scan, Smartphone, Zap, Star } from "lucide-react";

interface SpecialFeaturesSectionProps {
  user: any;
  isInstalled: boolean;
  handleFaceAuthClick: (e: React.MouseEvent) => void;
  handlePWASettingsClick: () => void;
  onClose: () => void;
}

// ✅ Специальные анимации для выделения функций
const pulseVariants = {
  pulse: {
    scale: [1, 1.05, 1],
    transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
  }
};

const glowVariants = {
  glow: {
    boxShadow: [
      "0 0 5px rgba(168, 85, 247, 0.3)",
      "0 0 20px rgba(168, 85, 247, 0.6)",
      "0 0 5px rgba(168, 85, 247, 0.3)",
    ],
    transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
  }
};

export default function SpecialFeaturesSection({
  user,
  isInstalled,
  handleFaceAuthClick,
  handlePWASettingsClick,
  onClose,
}: SpecialFeaturesSectionProps) {
  return (
    <div className="space-y-2 mb-6">
      <div className="text-xs font-semibold text-white/70 uppercase tracking-wider px-2 mb-3">
        Новые возможности
      </div>
      
      {/* Face ID */}
      <motion.button
        onClick={(e) => {
          handleFaceAuthClick(e);
          onClose();
        }}
        className="w-full flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-400/30 text-white group overflow-hidden relative"
        whileHover={{ 
          scale: 1.02,
          backgroundColor: "rgba(168, 85, 247, 0.3)",
        }}
        whileTap={{ scale: 0.98 }}
        variants={glowVariants}
        animate="glow"
      >
        {/* Анимированный фон */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-blue-600/10"
          animate={{
            background: [
              "linear-gradient(90deg, rgba(168, 85, 247, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)",
              "linear-gradient(90deg, rgba(59, 130, 246, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)",
              "linear-gradient(90deg, rgba(168, 85, 247, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)",
            ]
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
        
        <div className="flex items-center gap-3 w-full">
          <motion.div 
            className="relative"
            variants={pulseVariants}
            animate="pulse"
          >
            <Scan className="h-5 w-5" />
          </motion.div>
          
          <div className="flex-1 text-left">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base font-medium">Face ID</span>
                <motion.span 
                  className="text-xs bg-gradient-to-r from-purple-400 to-blue-500 text-white px-2 py-0.5 rounded-full font-bold"
                  animate={{ 
                    background: [
                      "linear-gradient(90deg, rgba(168, 85, 247, 1) 0%, rgba(59, 130, 246, 1) 100%)",
                      "linear-gradient(90deg, rgba(59, 130, 246, 1) 0%, rgba(168, 85, 247, 1) 100%)",
                      "linear-gradient(90deg, rgba(168, 85, 247, 1) 0%, rgba(59, 130, 246, 1) 100%)",
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  AI
                </motion.span>
              </div>
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              >
                <Star className="h-4 w-4 text-yellow-400" />
              </motion.div>
            </div>
            <div className="text-xs text-white/70 mt-1 flex items-center gap-1">
              <Zap className="h-3 w-3 text-yellow-400" />
              {user ? "Управление Face ID" : "Вход по лицу за 2 секунды"}
            </div>
          </div>
        </div>
      </motion.button>

      {/* PWA Settings (если установлено) */}
      {isInstalled && (
        <motion.button
          onClick={() => {
            handlePWASettingsClick();
            onClose();
          }}
          className="w-full flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-green-400/30 text-white group"
          whileHover={{ 
            scale: 1.02,
            backgroundColor: "rgba(34, 197, 94, 0.3)",
          }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <motion.div
            animate={{ rotateY: [0, 180, 360] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <Smartphone className="h-5 w-5" />
          </motion.div>
          <div className="flex-1 text-left">
            <div className="flex items-center justify-between">
              <span className="font-medium">Настройки PWA</span>
              <motion.div
                animate={{ x: [0, 3, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <span className="text-xs text-green-300">●</span>
              </motion.div>
            </div>
            <div className="text-xs text-white/70 mt-1">
              Управление приложением
            </div>
          </div>
        </motion.button>
      )}
    </div>
  );
}
