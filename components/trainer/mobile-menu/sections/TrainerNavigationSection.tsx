// components/trainer/mobile-menu/sections/TrainerNavigationSection.tsx
"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrainerNavigationItem } from "../../types/trainer-navigation";
import type { MessageStats, WorkoutStats } from "@/types/trainer";

interface TrainerNavigationSectionProps {
  navigationItems: TrainerNavigationItem[];
  messageStats: MessageStats;
  workoutStats: WorkoutStats;
  onNavigation: (href: string) => void;
  isLoading: boolean;
  onClose: () => void;
}

export default function TrainerNavigationSection({
  navigationItems,
  messageStats,
  workoutStats,
  onNavigation,
  isLoading,
  onClose,
}: TrainerNavigationSectionProps) {

  const handleNavigation = (href: string) => {
    onNavigation(href);
    onClose();
  };

  // Функция для получения значения badge
  const getBadgeValue = (item: TrainerNavigationItem): string | undefined => {
    switch (item.category) {
      case "messages":
        return messageStats?.unreadMessages?.toString();
      case "workouts":
        return workoutStats?.todayWorkouts?.toString();
      case "clients":
        return messageStats?.totalMessages?.toString(); // или другое подходящее поле
      default:
        return item.badge;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-white/70 uppercase tracking-wide">
          Навигация
        </h3>
        <Badge variant="outline" className="text-xs border-white/20 text-white/80 bg-white/10">
          {navigationItems.length} разделов
        </Badge>
      </div>

      <div className="space-y-2">
        {navigationItems.map((item, index) => {
          const IconComponent = item.icon;
          const badgeValue = getBadgeValue(item);
          const hasNotifications = badgeValue && parseInt(badgeValue) > 0;

          return (
            <div
            >
              <Button
                variant="ghost"
                onClick={() => handleNavigation(item.href)}
                disabled={isLoading}
                className="w-full justify-start h-auto p-3 text-left bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-200 group"
              >
                <div className="flex items-center gap-3 w-full">
                  <div className={`p-2 rounded-lg ${
                    item.category === 'clients' ? 'bg-purple-500/20 text-purple-300' :
                    item.category === 'workouts' ? 'bg-green-500/20 text-green-300' :
                    item.category === 'messages' ? 'bg-blue-500/20 text-blue-300' :
                    item.category === 'analytics' ? 'bg-orange-500/20 text-orange-300' :
                    'bg-gray-500/20 text-gray-300'
                  } group-hover:scale-110 transition-transform duration-200`}>
                    <IconComponent className="h-4 w-4" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-white group-hover:text-white/90">
                        {item.label}
                      </span>
                      
                      {badgeValue && (
                        <Badge 
                          variant={hasNotifications ? "default" : "outline"}
                          className={`text-xs ml-2 ${
                            hasNotifications 
                              ? "bg-red-500 text-white border-red-400" 
                              : "border-white/20 text-white/80 bg-white/10"
                          }`}
                        >
                          {badgeValue}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="text-sm text-white/60 group-hover:text-white/70 mt-1">
                      {item.description}
                    </div>
                  </div>
                </div>
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
