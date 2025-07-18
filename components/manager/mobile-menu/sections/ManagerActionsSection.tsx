// components/manager/mobile-menu/sections/ManagerActionsSection.tsx
"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useLoaderStore } from "@/stores/loaderStore";
import {
  Plus,
  Calendar,
  Settings,
  UserCheck,
  LogOut,
  Loader2,
  FileText,
  BarChart3,
} from "lucide-react";

interface ManagerActionsSectionProps {
  onNavigation: (href: string) => void;
  onLogout: () => void;
  isLoggingOut: boolean;
  onClose: () => void;
}

export default function ManagerActionsSection({
  onNavigation,
  isLoggingOut,
  onClose,
}: ManagerActionsSectionProps) {
  
  const {  logout } = useAuth();

  const handleAction = (href: string) => {
    onNavigation(href);
    onClose();
  };

  const handleLogout = async () => {
    onClose();
    
    // Выполняем logout
    await logout();
  };

  const quickActions = [
    {
      icon: Plus,
      label: "Добавить тренера",
      href: "/manager/trainers/add",
      color: "from-green-500 to-green-600",
      description: "Новый тренер в команду",
    },
    {
      icon: Calendar,
      label: "Создать запись",
      href: "/manager/bookings/create",
      color: "from-blue-500 to-blue-600",
      description: "Запись на тренировку",
    },
    {
      icon: FileText,
      label: "Отчеты",
      href: "/manager/reports",
      color: "from-purple-500 to-purple-600",
      description: "Аналитические отчеты",
    },
    {
      icon: BarChart3,
      label: "Статистика",
      href: "/manager/analytics",
      color: "from-orange-500 to-orange-600",
      description: "Подробная аналитика",
    },
  ];

  const profileActions = [
    {
      icon: UserCheck,
      label: "Мой профиль",
      href: "/manager/profile",
      description: "Личная информация",
    },
    {
      icon: Settings,
      label: "Настройки",
      href: "/manager/settings",
      description: "Конфигурация системы",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Быстрые действия */}
      <div>
        <h3 className="text-sm font-medium text-white/70 uppercase tracking-wide mb-3">
          Быстрые действия
        </h3>

        <div className="grid grid-cols-2 gap-2">
          {quickActions.map((action, index) => {
            const IconComponent = action.icon;
            
            return (
              <div key={index}>
                <Button
                  onClick={() => handleAction(action.href)}
                  className={`w-full h-16 p-3 bg-gradient-to-br ${action.color} bg-opacity-20 hover:bg-opacity-30 text-white border border-white/20 hover:border-white/30 flex flex-col items-center justify-center gap-1 transition-all duration-200`}
                  disabled={isLoggingOut}
                  variant="ghost"
                >
                  <IconComponent className="h-5 w-5 flex-shrink-0" />
                  <span className="text-xs font-medium text-center leading-tight">
                    {action.label}
                  </span>
                </Button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Профиль и настройки */}
      <div>
        <h3 className="text-sm font-medium text-white/70 uppercase tracking-wide mb-3">
          Профиль
        </h3>

        <div className="space-y-2">
          {profileActions.map((action, index) => {
            const IconComponent = action.icon;
            
            return (
              <div key={index}>
                <Button
                  variant="ghost"
                  className="w-full justify-start h-12 text-white hover:bg-white/10 border border-white/10 hover:border-white/20 group transition-all duration-200"
                  onClick={() => handleAction(action.href)}
                  disabled={isLoggingOut}
                >
                  <IconComponent className="mr-3 h-5 w-5 flex-shrink-0 group-hover:scale-110 transition-transform duration-200" />
                  <div className="flex-1 text-left">
                    <div className="font-medium">{action.label}</div>
                    <div className="text-xs text-white/60">{action.description}</div>
                  </div>
                </Button>
              </div>
            );
          })}

          {/* ✅ ИЗМЕНИЛИ: Выход из системы с новой логикой */}
          <div>
            <Button
              variant="ghost"
              className="w-full justify-start h-12 text-red-300 hover:text-red-200 hover:bg-red-500/20 border border-red-400/20 hover:border-red-400/30 group transition-all duration-200 mt-4"
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? (
                <>
                  <Loader2 className="mr-3 h-5 w-5 animate-spin flex-shrink-0" />
                  <div className="flex-1 text-left">
                    <div className="font-medium">Выходим...</div>
                    <div className="text-xs text-red-300/60">Пожалуйста, подождите</div>
                  </div>
                </>
              ) : (
                <>
                  <LogOut className="mr-3 h-5 w-5 flex-shrink-0 group-hover:scale-110 transition-transform duration-200" />
                  <div className="flex-1 text-left">
                    <div className="font-medium">Выйти из системы</div>
                    <div className="text-xs text-red-300/60">Завершить сеанс</div>
                  </div>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}