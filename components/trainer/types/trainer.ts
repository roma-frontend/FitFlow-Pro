// types/trainer.ts
export interface MessageStats {
  unreadMessages: number;
  totalMessages: number;
  totalClients: number; // ✅ Добавляем это поле
  activeChats: number;
  responseTime: string;
  lastMessageTime: string;
  pendingResponses?: number;
  averageResponseTime?: string;
}

export interface WorkoutStats {
  todayWorkouts: number;
  weeklyWorkouts: number;
  monthlyWorkouts: number;
  totalWorkouts: number;
  activeClients: number;
  completedSessions: number;
  averageRating: number;
  totalRevenue?: number;
  upcomingWorkouts?: number;
  cancelledWorkouts?: number;
}

export interface TrainerUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'trainer';
  specialization?: string[];
  certification?: string[];
  experience?: number;
  rating?: number;
  isVerified?: boolean;
}

export interface TrainerSystemInfo {
  version: string;
  buildDate: string;
  uptime: string;
  memoryUsage: string;
  apiLatency: string;
  syncStatus: "ok" | "syncing" | "error";
  connectionStatus: "connected" | "disconnected" | "reconnecting";
  lastSync?: string;
  errorCount?: number;
}
