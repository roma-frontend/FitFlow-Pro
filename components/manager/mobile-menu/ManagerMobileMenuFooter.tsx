// components/manager/mobile-menu/ManagerMobileMenuFooter.tsx
"use client";

import { motion } from "framer-motion";
import { Heart, Code, Dumbbell, Star, Shield, Zap, Users } from "lucide-react";

export default function ManagerMobileMenuFooter() {
  return (
    <div 
      className="p-4 border-t border-white/20 bg-gradient-to-r from-blue-800/30 to-green-800/30"
    >
      

      {/* Быстрые действия */}
      <div className="flex items-center justify-center gap-4 mt-3 pt-3 border-t border-white/10">
        <button
          className="flex items-center gap-1 text-xs text-white/70 hover:text-white transition-colors"
        >
          <Zap className="h-3 w-3" />
          <span>Обратная связь</span>
        </button>
        
        <div className="w-px h-4 bg-white/20" />
        
        <button
          className="flex items-center gap-1 text-xs text-white/70 hover:text-white transition-colors"
        >
          <Star className="h-3 w-3" />
          <span>Оценить</span>
        </button>
        
        <div className="w-px h-4 bg-white/20" />
        
        <button
          className="flex items-center gap-1 text-xs text-white/70 hover:text-white transition-colors"
        >
          <Shield className="h-3 w-3" />
          <span>Поддержка</span>
        </button>
      </div>

      {/* Copyright */}
      <div className="text-center mt-3 pt-2 border-t border-white/10">
        <div 
          className="text-xs text-white/50"
        >
          © 2024 FitFlow-Pro. Все права защищены.
        </div>
        <div 
          className="text-xs text-white/40 mt-1"
        >
          Версия для менеджеров
        </div>
      </div>
    </div>
  );
}
