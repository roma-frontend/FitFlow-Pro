// components/trainer/types/trainer-navigation.ts
import { LucideIcon } from "lucide-react";

export interface TrainerNavigationItem {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: string;
  category: "clients" | "workouts" | "messages" | "analytics" | "settings" | "tools";
  description: string;
  requiresAuth?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  showPulse?: boolean;
  isNew?: boolean;
  priority?: "high" | "medium" | "low";
}

export interface TrainerStats {
  todayWorkouts: number;
  weeklyWorkouts: number;
  monthlyWorkouts: number;
  totalWorkouts: number;
  activeClients: number;
  completedSessions: number;
  averageRating: number;
  totalRevenue: number;
}

export interface TrainerMessageStats {
  unreadMessages: number;
  totalMessages: number;
  totalClients: number;
  activeChats: number;
  responseTime: string;
  lastMessageTime: string;
}

export interface TrainerSystemInfo {
  version: string;
  buildDate: string;
  uptime: string;
  memoryUsage: string;
  apiLatency: string;
  syncStatus: "ok" | "syncing" | "error";
  connectionStatus: "connected" | "disconnected" | "reconnecting";
}
