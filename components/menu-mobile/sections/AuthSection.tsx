// components/mobile-menu/sections/AuthSection.tsx
"use client";

import { motion } from "framer-motion";
import { MobileMenuButton } from "../MobileMenuButton";
import { LogIn, UserPlus, Sparkles } from "lucide-react";

interface AuthSectionProps {
  onLogin: () => void;
  onRegister: () => void;
  onClose: () => void;
}

export default function AuthSection({ onLogin, onRegister, onClose }: AuthSectionProps) {
  return (
    <div className="space-y-3 mb-6">
      <div className="text-xs font-semibold text-white/70 uppercase tracking-wider px-2 mb-3">
        Авторизация
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <MobileMenuButton
          onClick={() => {
            onLogin();
            onClose();
          }}
          variant="primary"
          size="lg"
        >
          <LogIn className="h-5 w-5 mr-2" />
          Войти в аккаунт
        </MobileMenuButton>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <MobileMenuButton
          onClick={() => {
            onRegister();
            onClose();
          }}
          variant="outline"
          size="lg"
        >
          <UserPlus className="h-5 w-5 mr-2" />
          Создать аккаунт
        </MobileMenuButton>
      </motion.div>
      
      <motion.div 
        className="text-center text-xs text-white/60 flex items-center justify-center gap-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <Sparkles className="h-3 w-3" />
        <span>Получите доступ ко всем функциям</span>
      </motion.div>
    </div>
  );
}
