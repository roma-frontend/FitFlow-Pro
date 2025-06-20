// contexts/SuperAdminContext.tsx
"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { ensureDebugSystem } from '@/utils/cleanTypes';

// ✅ ЭКСПОРТИРУЕМ ТИПЫ
export interface TrainerData {
  id: string;
  _id?: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  avatar?: string;
  status: 'active' | 'inactive' | 'suspended';
  rating: number;
  specializations: string[];
  activeClients: number;
  totalClients: number;
  totalWorkouts: number;
  monthlyRevenue: number;
  joinDate: string;
  lastActivity: string;
  workingHours: {
    start: string;
    end: string;
    days: number[];
  };
}

export interface ClientData {
  id: string;
  _id?: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  status: 'active' | 'inactive' | 'suspended';
  currentProgram: string;
  progress: number;
  joinDate: string;
  lastActivity: string;
  trainerId?: string;
}

export interface TrainerStats {
  thisWeekEvents: number;
  thisMonthEvents: number;
  completedEvents: number;
  cancelledEvents: number;
  totalRevenue: number;
  averageRating: number;
  clientRetentionRate: number;
}

export interface SuperAdminStats {
  revenue: {
    total: number;
    thisMonth: number;
    lastMonth: number;
    growth: number;
  };
  workouts: {
    total: number;
    completed: number;
    cancelled: number;
    scheduled: number;
    thisWeek?: number; 
  };
  clients: {
    total: number;
    active: number;
    new: number;
    retention: number;
  };
  trainers: {
    total: number;
    active: number;
    avgRating: number;
    avgRevenue: number;
  };
  activity?: any; // Добавьте это если нужно
}

export interface TopPerformers {
  byRevenue: TrainerData[];
  byRating: TrainerData[];
  byClients: TrainerData[];
  byCompletion: TrainerData[];
}

export interface RevenueAnalytics {
  monthly: Array<{ month: string; amount: number; growth: number }>;
  byTrainer: Array<{ trainerId: string; name: string; amount: number; percentage: number }>;
  avgPerClient: number;
  avgPerWorkout: number;
}

export interface ClientAnalytics {
  retention: number;
  avgProgress: number;
  newClients: number;
  churnRate: number;
  byProgram: Array<{ program: string; count: number; avgProgress: number }>;
}

// ✅ ОБНОВЛЯЕМ ИНТЕРФЕЙС КОНТЕКСТА
interface SuperAdminContextType {
  trainers: TrainerData[];
  clients: ClientData[];
  loading: boolean;
  error: string | null;
  stats: SuperAdminStats; // ✅ ДОБАВЛЯЕМ STATS
  refreshData: () => Promise<void>;
  
  // Основные функции
  getTrainerStats: (trainerId: string) => TrainerStats;
  getTrainerClients: (trainerId: string) => ClientData[];
  
  // CRUD operations
  addTrainer?: (trainer: Partial<TrainerData>) => void;
  updateTrainer?: (id: string, data: Partial<TrainerData>) => void;
  deleteTrainer?: (id: string) => void;
  addClient?: (client: Partial<ClientData>) => void;
  updateClient?: (id: string, data: Partial<ClientData>) => void;
  deleteClient?: (id: string) => void;
}

const SuperAdminContext = createContext<SuperAdminContextType | undefined>(undefined);

export function SuperAdminProvider({ children }: { children: React.ReactNode }) {
  const [trainers, setTrainers] = useState<TrainerData[]>([
    {
      id: "trainer1",
      _id: "trainer1",
      name: "Анна Петрова",
      role: "Персональный тренер",
      email: "anna.petrova@fitaccess.ru",
      phone: "+7 (999) 123-45-67",
      avatar: "/avatars/trainer1.jpg",
      status: "active",
      rating: 4.8,
      specializations: ["Силовые тренировки", "Функциональный тренинг", "Реабилитация"],
      activeClients: 15,
      totalClients: 28,
      totalWorkouts: 450,
      monthlyRevenue: 180000,
      joinDate: "2023-01-15",
      lastActivity: new Date().toISOString(),
      workingHours: {
        start: "09:00",
        end: "18:00",
        days: [1, 2, 3, 4, 5]
      }
    },
    {
      id: "trainer2",
      _id: "trainer2",
      name: "Дмитрий Козлов",
      role: "Фитнес тренер",
      email: "dmitry.kozlov@fitaccess.ru",
      phone: "+7 (999) 234-56-78",
      avatar: "/avatars/trainer2.jpg",
      status: "active",
      rating: 4.6,
      specializations: ["Кардио", "Групповые тренировки", "Кроссфит"],
      activeClients: 12,
      totalClients: 20,
      totalWorkouts: 320,
      monthlyRevenue: 144000,
      joinDate: "2023-03-20",
      lastActivity: new Date().toISOString(),
      workingHours: {
        start: "08:00",
        end: "17:00",
        days: [1, 2, 3, 4, 5, 6]
      }
    },
    {
      id: "trainer3",
      _id: "trainer3",
      name: "Елена Васильева",
      role: "Йога инструктор",
      email: "elena.vasilieva@fitaccess.ru",
      phone: "+7 (999) 345-67-89",
      avatar: "/avatars/trainer3.jpg",
      status: "active",
      rating: 4.9,
      specializations: ["Хатха-йога", "Виньяса", "Медитация", "Растяжка"],
      activeClients: 18,
      totalClients: 25,
      totalWorkouts: 380,
      monthlyRevenue: 162000,
      joinDate: "2022-11-10",
      lastActivity: new Date().toISOString(),
      workingHours: {
        start: "10:00",
        end: "19:00",
        days: [1, 2, 3, 4, 5, 6, 0]
      }
    }
  ]);

  const [clients, setClients] = useState<ClientData[]>([
    {
      id: "client1",
      _id: "client1",
      name: "Анна Смирнова",
      email: "anna.smirnova@email.com",
      phone: "+7 (999) 111-22-33",
      avatar: "/avatars/client1.jpg",
      status: "active",
      currentProgram: "Похудение и тонус",
      progress: 75,
      joinDate: "2024-01-15",
      lastActivity: new Date().toISOString(),
      trainerId: "trainer1"
    },
    {
      id: "client2",
      _id: "client2",
      name: "Дмитрий Козлов",
      email: "dmitry.kozlov@email.com",
      phone: "+7 (999) 222-33-44",
      avatar: "/avatars/client2.jpg",
      status: "active",
      currentProgram: "Набор мышечной массы",
      progress: 60,
      joinDate: "2024-02-01",
      lastActivity: new Date().toISOString(),
      trainerId: "trainer2"
    },
    {
      id: "client3",
      _id: "client3",
      name: "Елена Васильева",
      email: "elena.vasilieva@email.com",
      phone: "+7 (999) 333-44-55",
      avatar: "/avatars/client3.jpg",
      status: "active",
      currentProgram: "Йога и гибкость",
      progress: 85,
      joinDate: "2023-12-10",
      lastActivity: new Date().toISOString(),
      trainerId: "trainer3"
    },
    {
      id: "client4",
      _id: "client4",
      name: "Михаил Петров",
      email: "mikhail.petrov@email.com",
      phone: "+7 (999) 444-55-66",
      avatar: "/avatars/client4.jpg",
      status: "active",
      currentProgram: "Функциональный тренинг",
      progress: 40,
      joinDate: "2024-03-05",
      lastActivity: new Date().toISOString(),
      trainerId: "trainer1"
    }
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ ВЫЧИСЛЯЕМ СТАТИСТИКУ
  const stats: SuperAdminStats = React.useMemo(() => {
    const totalRevenue = trainers.reduce((sum, t) => sum + t.monthlyRevenue, 0);
    const totalWorkouts = trainers.reduce((sum, t) => sum + t.totalWorkouts, 0);
    const activeClients = clients.filter(c => c.status === 'active').length;
    const avgRating = trainers.reduce((sum, t) => sum + t.rating, 0) / trainers.length;

    return {
      revenue: {
        total: totalRevenue * 12, // Годовая выручка
        thisMonth: totalRevenue,
        lastMonth: totalRevenue * 0.92, // Примерно 8% рост
        growth: 8.3
      },
      workouts: {
        total: totalWorkouts,
        completed: Math.floor(totalWorkouts * 0.85),
        cancelled: Math.floor(totalWorkouts * 0.05),
        scheduled: Math.floor(totalWorkouts * 0.1)
      },
      clients: {
        total: clients.length,
        active: activeClients,
        new: clients.filter(c => {
          const joinDate = new Date(c.joinDate);
          const monthAgo = new Date();
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          return joinDate > monthAgo;
        }).length,
        retention: 85.2
      },
      trainers: {
        total: trainers.length,
        active: trainers.filter(t => t.status === 'active').length,
        avgRating: avgRating,
        avgRevenue: totalRevenue / trainers.length
      }
    };
  }, [trainers, clients]);

  // ✅ РЕАЛИЗУЕМ НЕДОСТАЮЩИЕ ФУНКЦИИ
  const getTrainerStats = (trainerId: string): TrainerStats => {
    const trainer = trainers.find(t => t.id === trainerId || t._id === trainerId);
    if (!trainer) {
      return {
        thisWeekEvents: 0,
        thisMonthEvents: 0,
        completedEvents: 0,
        cancelledEvents: 0,
        totalRevenue: 0,
        averageRating: 0,
        clientRetentionRate: 0
      };
    }

    const baseEvents = Math.floor(trainer.activeClients * 2.5);
    
    return {
      thisWeekEvents: baseEvents,
      thisMonthEvents: baseEvents * 4,
      completedEvents: trainer.totalWorkouts,
      cancelledEvents: Math.floor(trainer.totalWorkouts * 0.05),
      totalRevenue: trainer.monthlyRevenue,
      averageRating: trainer.rating,
      clientRetentionRate: Math.floor((trainer.activeClients / trainer.totalClients) * 100)
    };
  };

  const getTrainerClients = (trainerId: string): ClientData[] => {
    return clients.filter(client => client.trainerId === trainerId);
  };

  const refreshData = async () => {
    console.log("🔄 SuperAdmin: обновление данных...");
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setLoading(false);
    console.log("✅ SuperAdmin: данные обновлены");
  };

  const addTrainer = (trainer: Partial<TrainerData>) => {
    console.log('➕ SuperAdmin: добавление тренера', trainer);
    const newTrainer: TrainerData = {
      id: `trainer_${Date.now()}`,
      _id: `trainer_${Date.now()}`,
      name: trainer.name || '',
      role: trainer.role || 'Тренер',
      email: trainer.email || '',
      phone: trainer.phone || '',
      status: trainer.status || 'active',
      rating: trainer.rating || 0,
      specializations: trainer.specializations || [],
      activeClients: trainer.activeClients || 0,
      totalClients: trainer.totalClients || 0,
      totalWorkouts: trainer.totalWorkouts || 0,
      monthlyRevenue: trainer.monthlyRevenue || 0,
      joinDate: trainer.joinDate || new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      workingHours: trainer.workingHours || {
        start: "09:00",
        end: "18:00",
        days: [1, 2, 3, 4, 5]
      },
      ...trainer
    };
    setTrainers(prev => [...prev, newTrainer]);
  };

  const updateTrainer = (id: string, data: Partial<TrainerData>) => {
    console.log('📝 SuperAdmin: обновление тренера', id, data);
    setTrainers(prev => prev.map(t => 
      (t._id === id || t.id === id) ? { ...t, ...data } : t
    ));
  };

  const deleteTrainer = (id: string) => {
    console.log('🗑️ SuperAdmin: удаление тренера', id);
    setTrainers(prev => prev.filter(t => t._id !== id && t.id !== id));
  };

  const addClient = (client: Partial<ClientData>) => {
    console.log('➕ SuperAdmin: добавление клиента', client);
    const newClient: ClientData = {
      id: `client_${Date.now()}`,
      _id: `client_${Date.now()}`,
      name: client.name || '',
      email: client.email || '',
      phone: client.phone || '',
      status: client.status || 'active',
      currentProgram: client.currentProgram || '',
      progress: client.progress || 0,
      joinDate: client.joinDate || new Date().toISOString(),
            lastActivity: new Date().toISOString(),
      ...client
    };
    setClients(prev => [...prev, newClient]);
  };

  const updateClient = (id: string, data: Partial<ClientData>) => {
    console.log('📝 SuperAdmin: обновление клиента', id, data);
    setClients(prev => prev.map(c => 
      (c._id === id || c.id === id) ? { ...c, ...data } : c
    ));
  };

  const deleteClient = (id: string) => {
    console.log('🗑️ SuperAdmin: удаление клиента', id);
    setClients(prev => prev.filter(c => c._id !== id && c.id !== id));
  };

  // ✅ РЕГИСТРИРУЕМ В DEBUG СИСТЕМЕ С ЕДИНОЙ ФУНКЦИЕЙ
  useEffect(() => {
    if (typeof window !== "undefined") {
      ensureDebugSystem();

      const superAdminContext = {
        trainers,
        clients,
        loading,
        error,
        stats,
        refreshData,
        getTrainerStats,
        getTrainerClients,
        getStats: () => ({
          totalTrainers: trainers.length,
          totalClients: clients.length,
          loading,
          lastUpdate: new Date().toISOString(),
        }),
        addTrainer,
        updateTrainer,
        deleteTrainer,
        addClient,
        updateClient,
        deleteClient,
      };

      window.fitAccessDebug.superAdmin = superAdminContext;
      console.log("✅ SuperAdmin контекст зарегистрирован в debug системе");
    }
  }, [trainers, clients, loading, error, stats]);

  // ✅ ВКЛЮЧАЕМ ВСЕ ФУНКЦИИ В VALUE
  const value: SuperAdminContextType = {
    trainers,
    clients,
    loading,
    error,
    stats,
    refreshData,
    getTrainerStats,
    getTrainerClients,
    addTrainer,
    updateTrainer,
    deleteTrainer,
    addClient,
    updateClient,
    deleteClient,
  };

  return (
    <SuperAdminContext.Provider value={value}>
      {children}
    </SuperAdminContext.Provider>
  );
}

export function useSuperAdmin() {
  const context = useContext(SuperAdminContext);
  if (context === undefined) {
    throw new Error("useSuperAdmin must be used within a SuperAdminProvider");
  }
  return context;
}

// ✅ ДОБАВЛЯЕМ ХУКИ ДЛЯ АНАЛИТИКИ
export function useSuperAdminAnalytics() {
  const { trainers, clients, stats } = useSuperAdmin();

  const getTopPerformers = (): TopPerformers => {
    const sortedByRevenue = [...trainers].sort((a, b) => b.monthlyRevenue - a.monthlyRevenue);
    const sortedByRating = [...trainers].sort((a, b) => b.rating - a.rating);
    const sortedByClients = [...trainers].sort((a, b) => b.activeClients - a.activeClients);
    const sortedByCompletion = [...trainers].sort((a, b) => {
      const aCompletion = (a.totalWorkouts * 0.85) / a.totalWorkouts * 100;
      const bCompletion = (b.totalWorkouts * 0.85) / b.totalWorkouts * 100;
      return bCompletion - aCompletion;
    });

    return {
      byRevenue: sortedByRevenue,
      byRating: sortedByRating,
      byClients: sortedByClients,
      byCompletion: sortedByCompletion
    };
  };

  const getRevenueAnalytics = (): RevenueAnalytics => {
    const totalRevenue = trainers.reduce((sum, t) => sum + t.monthlyRevenue, 0);
    
    const monthly = [
      { month: "Май 2024", amount: totalRevenue, growth: 12.5 },
      { month: "Апрель 2024", amount: totalRevenue * 0.89, growth: 8.3 },
      { month: "Март 2024", amount: totalRevenue * 0.82, growth: 15.2 },
      { month: "Февраль 2024", amount: totalRevenue * 0.71, growth: 6.8 },
      { month: "Январь 2024", amount: totalRevenue * 0.66, growth: 9.2 }
    ];

    const byTrainer = trainers.map(trainer => ({
      trainerId: trainer.id,
      name: trainer.name,
      amount: trainer.monthlyRevenue,
      percentage: (trainer.monthlyRevenue / totalRevenue) * 100
    })).sort((a, b) => b.amount - a.amount);

    return {
      monthly,
      byTrainer,
      avgPerClient: totalRevenue / clients.length,
      avgPerWorkout: totalRevenue / stats.workouts.completed
    };
  };

  const getClientAnalytics = (): ClientAnalytics => {
    const activeClients = clients.filter(c => c.status === 'active');
    const avgProgress = activeClients.reduce((sum, c) => sum + c.progress, 0) / activeClients.length;
    
    const now = new Date();
    const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    const newClients = clients.filter(c => new Date(c.joinDate) > monthAgo).length;

    // Группировка по программам
    const programGroups = clients.reduce((acc, client) => {
      const program = client.currentProgram;
      if (!acc[program]) {
        acc[program] = { count: 0, totalProgress: 0 };
      }
      acc[program].count++;
      acc[program].totalProgress += client.progress;
      return acc;
    }, {} as Record<string, { count: number; totalProgress: number }>);

    const byProgram = Object.entries(programGroups).map(([program, data]) => ({
      program,
      count: data.count,
      avgProgress: data.totalProgress / data.count
    }));

    return {
      retention: stats.clients.retention,
      avgProgress,
      newClients,
      churnRate: 100 - stats.clients.retention,
      byProgram
    };
  };

  return {
    getTopPerformers,
    getRevenueAnalytics,
    getClientAnalytics
  };
}

