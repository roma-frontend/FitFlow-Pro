// components/mobile-menu/sections/PWASection.tsx
"use client";

import { motion } from "framer-motion";
import { Download, Smartphone, Zap } from "lucide-react";

export default function PWASection() {
  return (
    <motion.div 
      className="bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-green-400/30 rounded-lg p-4 mb-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <div className="flex items-center gap-3">
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <Download className="h-6 w-6 text-green-400" />
        </motion.div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-white font-semibold">Установить приложение</span>
            <motion.span 
              className="text-xs bg-gradient-to-r from-green-400 to-blue-500 text-white px-2 py-0.5 rounded-full font-bold"
              animate={{ 
                background: [
                  "linear-gradient(90deg, rgba(34, 197, 94, 1) 0%, rgba(59, 130, 246, 1) 100%)",
                  "linear-gradient(90deg, rgba(59, 130, 246, 1) 0%, rgba(34, 197, 94, 1) 100%)",
                  "linear-gradient(90deg, rgba(34, 197, 94, 1) 0%, rgba(59, 130, 246, 1) 100%)",
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              PWA
            </motion.span>
          </div>
          <div className="flex items-center gap-2 text-xs text-white/70">
            <Smartphone className="h-3 w-3" />
            <span>Быстрый доступ с рабочего стола</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
