// components/trainer/mobile-menu/sections/TrainerActionsSection.tsx
"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Calendar,
  MessageSquare,
  Users,
  Settings,
  LogOut,
  Zap,
  FileText,
  BarChart3,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLoaderStore } from "@/stores/loaderStore";

interface TrainerActionsSectionProps {
  onNavigation: (href: string) => void;
  onLogout: () => void;
  isLoading: boolean;
  onClose: () => void;
}

export default function TrainerActionsSection({
  onNavigation,
  isLoading,
  onClose,
}: TrainerActionsSectionProps) {
  const { logout, user } = useAuth();
  const { showLoader } = useLoaderStore();

  const handleAction = (action: () => void) => {
    action();
    onClose();
  };

const handleLogout = async () => {
    console.log('🚪 TrainerActionsSection: начинаем logout...');
    
    // ✅ ИСПРАВЛЕНО: Показываем loader сразу при клике
    showLoader("logout", {
      userRole: user?.role || "trainer",
      userName: user?.name || user?.email?.split('@')[0] || "Тренер",
      redirectUrl: "/"
    });
    
    console.log('📱 TrainerActionsSection: loader показан, вызываем logout...');
    
    try {
      // Закрываем меню сразу
      onClose();
      
      // Вызываем logout (который уже НЕ будет показывать loader, так как он уже показан)
      await logout();
    } catch (error) {
      console.error('❌ TrainerActionsSection: ошибка logout:', error);
      // При ошибке loader скроется автоматически в useAuth.logout()
    }
  };

  const quickActions = [
    {
      icon: Plus,
      label: "Новая тренировка",
      description: "Создать тренировку",
      href: "/trainer/workouts/create",
      color: "bg-green-500/20 text-green-300 border-green-400/20",
      hoverColor: "hover:bg-green-500/30 hover:border-green-400/40",
    },
    {
      icon: Calendar,
      label: "Расписание",
      description: "Управление расписанием",
      href: "/trainer/schedule",
      color: "bg-blue-500/20 text-blue-300 border-blue-400/20",
      hoverColor: "hover:bg-blue-500/30 hover:border-blue-400/40",
    },
    {
      icon: MessageSquare,
      label: "Новое сообщение",
      description: "Написать клиенту",
      href: "/trainer/messages/new",
      color: "bg-purple-500/20 text-purple-300 border-purple-400/20",
      hoverColor: "hover:bg-purple-500/30 hover:border-purple-400/40",
    },
    {
      icon: BarChart3,
      label: "Отчеты",
      description: "Создать отчет",
      href: "/trainer/reports",
      color: "bg-orange-500/20 text-orange-300 border-orange-400/20",
      hoverColor: "hover:bg-orange-500/30 hover:border-orange-400/40",
    },
  ];

  const systemActions = [
    {
      icon: Settings,
      label: "Настройки",
      description: "Настройки профиля",
      href: "/trainer/settings",
    },
    {
      icon: FileText,
      label: "Документы",
      description: "Сертификаты и документы",
      href: "/trainer/documents",
    },
  ];

  return (
    <div className="space-y-4">
      {/* Быстрые действия */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-white/70 uppercase tracking-wide">
          Быстрые действия
        </h3>

        <div className="grid grid-cols-2 gap-2">
          {quickActions.map((action, index) => {
            const IconComponent = action.icon;

            return (
              <div key={index}>
                <Button
                  variant="ghost"
                  onClick={() => handleAction(() => onNavigation(action.href))}
                  disabled={isLoading}
                  className={`w-full h-auto p-3 flex-col gap-2 border ${action.color} ${action.hoverColor} transition-all duration-200`}
                >
                  <IconComponent className="h-5 w-5" />
                  <div className="text-center">
                    <div className="text-xs font-medium text-white">
                      {action.label}
                    </div>
                    <div className="text-xs text-white/60 mt-1">
                      {action.description}
                    </div>
                  </div>
                </Button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Системные действия */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-white/70 uppercase tracking-wide">
          Система
        </h3>

        <div className="space-y-2">
          {systemActions.map((action, index) => {
            const IconComponent = action.icon;

            return (
              <motion.div
                key={action.href}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: (index + 4) * 0.1, duration: 0.3 }}
              >
                <Button
                  variant="ghost"
                  onClick={() => handleAction(() => onNavigation(action.href))}
                  disabled={isLoading}
                  className="w-full justify-start h-auto p-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-200"
                >
                  <div className="flex items-center gap-3 w-full">
                    <IconComponent className="h-4 w-4 text-white/80" />
                    <div className="flex-1 text-left">
                      <div className="text-sm font-medium text-white">
                        {action.label}
                      </div>
                      <div className="text-xs text-white/60 text-wrap">
                        {action.description}
                      </div>
                    </div>
                  </div>
                </Button>
              </motion.div>
            );
          })}

          {/* Выход */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7, duration: 0.3 }}
          >
            <Button
              variant="ghost"
              onClick={handleLogout}
              disabled={isLoading}
              className="w-full justify-start h-auto p-3 bg-red-500/10 hover:bg-red-500/20 border border-red-400/20 hover:border-red-400/40 text-red-300 hover:text-red-200 transition-all duration-200"
            >
              <div className="flex items-center gap-3 w-full">
                <LogOut className="h-4 w-4" />
                <div className="flex-1 text-left">
                  <div className="text-sm font-medium">Выйти</div>
                  <div className="text-xs text-red-400/80">Завершить сеанс</div>
                </div>
              </div>
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
