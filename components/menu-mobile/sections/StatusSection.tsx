// components/mobile-menu/sections/StatusSection.tsx
"use client";

import { motion } from "framer-motion";
import { Wifi, Battery, Signal } from "lucide-react";

export default function StatusSection() {
  return (
    <motion.div 
      className="bg-black/20 rounded-lg p-3"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.6 }}
    >
      <div className="text-xs font-semibold text-white/70 uppercase tracking-wider mb-2">
        Статус системы
      </div>
      
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center">
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              color: ["#10b981", "#34d399", "#10b981"]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex justify-center mb-1"
          >
            <Wifi className="h-4 w-4" />
          </motion.div>
          <div className="text-xs text-white/80">Сеть</div>
          <div className="text-xs text-green-400">Отлично</div>
        </div>
        
        <div className="text-center">
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              color: ["#10b981", "#34d399", "#10b981"]
            }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
            className="flex justify-center mb-1"
          >
            <Signal className="h-4 w-4" />
          </motion.div>
          <div className="text-xs text-white/80">API</div>
          <div className="text-xs text-green-400">Активно</div>
        </div>
        
        <div className="text-center">
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              color: ["#10b981", "#34d399", "#10b981"]
            }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
            className="flex justify-center mb-1"
          >
            <Battery className="h-4 w-4" />
          </motion.div>
          <div className="text-xs text-white/80">Сервер</div>
          <div className="text-xs text-green-400">100%</div>
        </div>
      </div>
    </motion.div>
  );
}
