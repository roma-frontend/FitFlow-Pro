// components/trainer/mobile-menu/sections/TrainerUserSection.tsx - ОПТИМИЗИРОВАННАЯ ВЕРСИЯ
"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User, Shield, Star, Clock } from "lucide-react";

interface TrainerUserSectionProps {
  user: any;
  isLoading: boolean;
  loadingStep: string;
}

const TrainerUserSection = memo<TrainerUserSectionProps>(({
  user,
  isLoading,
  loadingStep,
}) => {
  
  if (isLoading) {
    return (
      <div 
        className="space-y-3"
      >
        <div className="flex items-center gap-3 p-3 bg-white/10 rounded-lg">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white/50"></div>
          <div className="flex-1">
            <div className="text-sm text-white/80">Загрузка профиля...</div>
            <div className="text-xs text-white/60">{loadingStep}</div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div 
        className="space-y-3"
      >
        <div className="flex items-center gap-3 p-3 bg-red-500/20 rounded-lg border border-red-400/20">
          <User className="h-8 w-8 text-red-400" />
          <div className="flex-1">
            <div className="text-sm text-white/80">Пользователь не найден</div>
            <div className="text-xs text-white/60">Попробуйте войти заново</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="space-y-3"
    >
      {/* Профиль пользователя */}
      <div className="flex items-center gap-3 p-3 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
        <Avatar className="h-12 w-12 border-2 border-white/20">
          <AvatarImage 
            src={user.avatar} 
            alt={user.name}
            className="object-cover"
          />
          <AvatarFallback className="bg-white/20 text-white font-semibold">
            {user.name?.charAt(0)?.toUpperCase() || 'T'}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-white truncate">
              {user.name || 'Тренер'}
            </h3>
            {user.isVerified && (
              <Shield className="h-4 w-4 text-blue-400 flex-shrink-0" />
            )}
          </div>
          
          <div className="text-sm text-white/70 truncate mb-2">
            {user.email || 'trainer@fitnesspro.com'}
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs border-green-400/50 text-green-300 bg-green-500/20">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-1 animate-pulse" />
              Онлайн
            </Badge>
            
            {user.rating && (
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 text-yellow-400 fill-current" />
                <span className="text-xs text-white/80">{user.rating}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Дополнительная информация */}
      <div className="grid grid-cols-2 gap-2">
        <div className="p-2 bg-white/5 rounded-lg border border-white/10">
          <div className="text-xs text-white/60 mb-1">Специализация</div>
          <div className="text-sm text-white/90 font-medium truncate">
            {user.specialization?.join(', ') || 'Фитнес-тренер'}
          </div>
        </div>
        
        <div className="p-2 bg-white/5 rounded-lg border border-white/10">
          <div className="text-xs text-white/60 mb-1">Опыт</div>
          <div className="text-sm text-white/90 font-medium flex items-center gap-1">
            <Clock className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">{user.experience || 5} лет</span>
          </div>
        </div>
      </div>
    </div>
  );
});

TrainerUserSection.displayName = 'TrainerUserSection';

export default TrainerUserSection;