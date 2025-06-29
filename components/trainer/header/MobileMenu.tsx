// components/trainer/header/MobileMenu.tsx (обновленная версия с типами)
"use client";

import { X, Users, Calendar, MessageCircle, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface QuickStats {
  totalTrainers: number;
  completedWorkouts: number;
  scheduledWorkouts: number;
  newMembersThisMonth: number;
  newClientsThisMonth: number;
  clientRetention: number;
}

interface MobileMenuProps {
  isOpen: boolean;
  stats?: QuickStats;
  todayWorkouts: number;
  unreadMessages: number;
  newNotifications: number;
  onClose: () => void;
}

interface MenuItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  color: string;
  badge?: boolean;
}

export default function MobileMenu({
  isOpen,
  stats,
  todayWorkouts,
  unreadMessages,
  newNotifications,
  onClose
}: MobileMenuProps) {
  if (!isOpen) return null;

  const menuItems: MenuItem[] = [
    {
      icon: Calendar,
      label: "Тренировки сегодня",
      value: todayWorkouts,
      color: "text-green-600"
    },
    {
      icon: MessageCircle,
      label: "Непрочитанные сообщения",
      value: unreadMessages,
      color: "text-blue-600",
      badge: unreadMessages > 0
    },
    {
      icon: Users,
      label: "Новые участники",
      value: stats?.newMembersThisMonth || 0,
      color: "text-purple-600"
    },
    {
      icon: TrendingUp,
      label: "Завершенные тренировки",
      value: stats?.completedWorkouts || 0,
      color: "text-orange-600"
    }
  ];

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      
      {/* Menu */}
      <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-xl">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Статистика</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="p-4 space-y-4">
          {menuItems.map((item, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <item.icon className={`h-5 w-5 ${item.color}`} />
                <span className="text-sm font-medium">{item.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold">{item.value}</span>
                {item.badge && (
                  <Badge variant="destructive" className="h-5 w-5 rounded-full p-0" />
                )}
              </div>
            </div>
          ))}
        </div>
        
        {newNotifications > 0 && (
          <div className="p-4 border-t">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                У вас {newNotifications} новых уведомлений
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
