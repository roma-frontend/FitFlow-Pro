// components/mobile-menu/sections/UserWelcome.tsx
"use client";

import { motion } from "framer-motion";
import { User, Crown, Zap } from "lucide-react";

interface UserWelcomeProps {
  user: any;
}

export default function UserWelcome({ user }: UserWelcomeProps) {
  return (
    <motion.div 
      className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30 rounded-lg p-4 mb-6"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-3">
        <motion.div 
          className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center"
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ duration: 0.2 }}
        >
          {user.avatar ? (
            <img 
              src={user.avatar} 
              alt={user.name} 
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <User className="h-6 w-6 text-white" />
          )}
        </motion.div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-white font-semibold">
              Привет, {user.name || user.email}!
            </span>
            {user.isPremium && (
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Crown className="h-4 w-4 text-yellow-400" />
              </motion.div>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-white/70">
            <Zap className="h-3 w-3 text-green-400" />
            <span>{user.isPremium ? "Premium аккаунт" : "Базовый аккаунт"}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
