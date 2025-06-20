// components/manager/mobile-menu/sections/ManagerUserSection.tsx
"use client";

import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getAvatarUrl } from "@/utils/image-utils";
import { Crown, Shield, Sparkles } from "lucide-react";

interface ManagerUserSectionProps {
  user: any;
}

export default function ManagerUserSection({ user }: ManagerUserSectionProps) {
  return (
    <motion.div 
      className="mb-6 p-5 bg-gradient-to-br from-white/15 via-white/10 to-white/5 backdrop-blur-md rounded-2xl border border-white/20 relative overflow-hidden group"
      whileHover={{ 
        scale: 1.02,
        y: -2,
        transition: { duration: 0.3, ease: "easeOut" }
      }}
      transition={{ duration: 0.2 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* ✅ Декоративные элементы */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/20 to-transparent rounded-full blur-2xl pointer-events-none group-hover:scale-150 transition-transform duration-500" />
      <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-white/10 to-transparent rounded-full blur-xl pointer-events-none group-hover:scale-125 transition-transform duration-500" />
      
      {/* ✅ Плавающие частицы */}
      <motion.div 
        className="absolute top-2 right-2 w-1 h-1 bg-white/60 rounded-full"
        animate={{ 
          y: [0, -10, 0],
          opacity: [0.6, 1, 0.6]
        }}
        transition={{ 
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div 
        className="absolute top-4 right-6 w-0.5 h-0.5 bg-white/40 rounded-full"
        animate={{ 
          y: [0, -8, 0],
          opacity: [0.4, 0.8, 0.4]
        }}
        transition={{ 
          duration: 2.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5
        }}
      />
      
      <div className="relative z-10">
        <div className="flex items-center gap-4 mb-4">
          <motion.div
            whileHover={{ 
              scale: 1.1,
              rotate: 5,
              transition: { duration: 0.2 }
            }}
            className="relative"
          >
            <Avatar className="h-14 w-14 ring-2 ring-white/30 group-hover:ring-white/50 flex-shrink-0 transition-all duration-300 shadow-lg">
              <AvatarImage src={user.avatar || getAvatarUrl(user.name)} />
              <AvatarFallback className="bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 text-white text-lg font-bold">
                АМ
              </AvatarFallback>
            </Avatar>
            
            {/* ✅ Корона менеджера с анимацией */}
            <motion.div 
              className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-amber-400 to-orange-400 rounded-full border-2 border-white shadow-lg flex items-center justify-center"
              animate={{ 
                rotate: [0, 10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Crown className="h-2.5 w-2.5 text-white" />
            </motion.div>
          </motion.div>
          
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <motion.p 
                className="font-bold text-white text-lg truncate group-hover:text-xl transition-all duration-300"
                whileHover={{ x: 2 }}
              >
                {user.name}
              </motion.p>
              <motion.div
                animate={{ 
                  rotate: [0, 15, 0],
                  scale: [1, 1.2, 1]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Sparkles className="h-4 w-4 text-amber-300 flex-shrink-0" />
              </motion.div>
            </div>
            <p className="text-sm text-white/80 truncate group-hover:text-white transition-colors duration-300">
              {user.email}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <Badge className="text-xs bg-gradient-to-r from-orange-500/30 to-red-500/30 text-white border-white/30 group-hover:from-orange-500/40 group-hover:to-red-500/40 flex items-center gap-1.5 px-3 py-1 backdrop-blur-sm transition-all duration-300">
              <Shield className="h-3 w-3" />
              Менеджер
            </Badge>
          </motion.div>
          
          <div className="flex items-center gap-2">
            <motion.div 
              className="w-2 h-2 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full shadow-lg"
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.8, 1, 0.8]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <span className="text-xs text-white/70 group-hover:text-white/90 font-medium transition-colors duration-300">
              Активен
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
