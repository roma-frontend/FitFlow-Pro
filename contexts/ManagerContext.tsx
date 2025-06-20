// contexts/ManagerContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

interface ManagerStats {
  totalTrainers: number;
  activeTrainers: number;
  totalClients: number;
  todayBookings: number;
  monthlyRevenue: number;
  newClients: number;
  completedSessions: number;
  averageRating: number;
}

interface Trainer {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  specialization: string[];
  status: 'active' | 'inactive' | 'busy' | 'vacation';
  rating: number;
  totalClients: number;
  completedSessions: number;
  monthlyEarnings: number;
  joinDate: string;
  lastActive: string;
  workingHours: {
    start: string;
    end: string;
    days: string[];
  };
  certifications: string[];
  nextSession?: {
    time: string;
    client: string;
  };
}

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  membershipType: string;
  joinDate: string;
  lastVisit: string;
  totalSessions: number;
  assignedTrainer?: string;
  status: 'active' | 'inactive' | 'pending';
}

interface Booking {
  id: string;
  trainerId: string;
  trainerName: string;
  trainerAvatar?: string;
  clientId: string;
  clientName: string;
  clientAvatar?: string;
  clientPhone?: string;
  date: string;
  time: string;
  duration: number;
  type: 'personal' | 'group';
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  price: number;
  service: string;
  notes?: string;
}

interface ManagerContextType {
  stats: ManagerStats;
  trainers: Trainer[];
  clients: Client[];
  bookings: Booking[];
  loading: boolean;
  refreshData: () => Promise<void>;
  refreshBookings: () => Promise<void>;
  assignTrainerToClient: (clientId: string, trainerId: string) => Promise<void>;

  // CRUD операции для записей
  createBooking: (bookingData: any) => Promise<void>;
  updateBooking: (bookingId: string, updates: any) => Promise<void>;
  deleteBooking: (bookingId: string) => Promise<void>;

  // CRUD операции для тренеров
  createTrainer: (trainerData: any) => Promise<void>;
  updateTrainer: (trainerId: string, updates: any) => Promise<void>;
  deleteTrainer: (trainerId: string) => Promise<void>;
  updateTrainerStatus: (trainerId: string, status: string) => Promise<void>;

  // Фильтры и поиск
  searchBookings: (query: string) => Booking[];
  searchTrainers: (query: string) => Trainer[];
  getTrainerBookings: (trainerId: string, date?: string) => Booking[];

  // Аналитика
  getRevenueData: (period: string) => any;
  getBookingStats: (period: string) => any;
  getTrainerPerformance: (trainerId?: string) => any;
}

const ManagerContext = createContext<ManagerContextType | undefined>(undefined);

export function ManagerProvider({ children }: { children: React.ReactNode }) {
  const [stats, setStats] = useState<ManagerStats>({
    totalTrainers: 0,
    activeTrainers: 0,
    totalClients: 0,
    todayBookings: 0,
    monthlyRevenue: 0,
    newClients: 0,
    completedSessions: 0,
    averageRating: 0
  });

  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInitialData();
  }, []);

  const refreshBookings = async () => {
    try {
      // Здесь будет логика загрузки только записей
      // Пока используем ту же логику, что и в loadInitialData для записей
      const mockBookings: Booking[] = [
        {
          id: 'booking-1',
          trainerId: 'trainer-1',
          trainerName: 'Адам Петров',
          trainerAvatar: '/avatars/trainer-adam.jpg',
          clientId: 'client-1',
          clientName: 'Мария Иванова',
          clientAvatar: '/avatars/client-maria.jpg',
          clientPhone: '+7 (999) 111-22-33',
          date: new Date().toISOString().split('T')[0],
          time: '14:00',
          duration: 60,
          type: 'personal',
          status: 'scheduled',
          price: 2500,
          service: 'Персональная тренировка',
          notes: 'Работа над силовыми упражнениями'
        },
        {
          id: 'booking-2',
          trainerId: 'trainer-2',
          trainerName: 'Елена Смирнова',
          trainerAvatar: '/avatars/trainer-elena.jpg',
          clientId: 'client-2',
          clientName: 'Анна Козлова',
          clientAvatar: '/avatars/client-anna.jpg',
          clientPhone: '+7 (999) 222-33-44',
          date: new Date().toISOString().split('T')[0],
          time: '15:30',
          duration: 90,
          type: 'personal',
          status: 'completed',
          price: 3500,
          service: 'Йога и стретчинг',
          notes: 'Восстановительная тренировка'
        }
      ];

      setBookings(mockBookings);
    } catch (error) {
      console.error('Ошибка обновления записей:', error);
      throw error;
    }
  };

  const loadInitialData = async () => {
    setLoading(true);
    try {
      // Симуляция загрузки данных
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Мок данные для демонстрации
      const mockStats: ManagerStats = {
        totalTrainers: 12,
        activeTrainers: 8,
        totalClients: 245,
        todayBookings: 18,
        monthlyRevenue: 1250000,
        newClients: 15,
        completedSessions: 156,
        averageRating: 4.7
      };

      const mockTrainers: Trainer[] = [
        {
          id: 'trainer-1',
          name: 'Адам Петров',
          email: 'adam@fitaccess.com',
          phone: '+7 (999) 123-45-67',
          avatar: '/avatars/trainer-adam.jpg',
          specialization: ['Силовые тренировки', 'Кроссфит'],
          status: 'active',
          rating: 4.9,
          totalClients: 35,
          completedSessions: 287,
          monthlyEarnings: 185000,
          joinDate: '2022-03-15',
          lastActive: new Date().toISOString(),
          workingHours: {
            start: '08:00',
            end: '20:00',
            days: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']
          },
          certifications: ['ACSM', 'CrossFit L2'],
          nextSession: {
            time: '14:00',
            client: 'Мария Иванова'
          }
        },
        {
          id: 'trainer-2',
          name: 'Елена Смирнова',
          email: 'elena@fitaccess.com',
          phone: '+7 (999) 234-56-78',
          avatar: '/avatars/trainer-elena.jpg',
          specialization: ['Йога', 'Пилатес', 'Стретчинг'],
          status: 'busy',
          rating: 4.8,
          totalClients: 42,
          completedSessions: 324,
          monthlyEarnings: 156000,
          joinDate: '2021-11-20',
          lastActive: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          workingHours: {
            start: '09:00',
            end: '18:00',
            days: ['Пн', 'Ср', 'Пт', 'Сб', 'Вс']
          },
          certifications: ['RYT-200', 'Pilates Method Alliance'],
          nextSession: {
            time: '15:30',
            client: 'Анна Козлова'
          }
        },
        {
          id: 'trainer-3',
          name: 'Михаил Волков',
          email: 'mikhail@fitaccess.com',
          phone: '+7 (999) 345-67-89',
          avatar: '/avatars/trainer-mikhail.jpg',
          specialization: ['Бокс', 'Функциональный тренинг'],
          status: 'active',
          rating: 4.6,
          totalClients: 28,
          completedSessions: 198,
          monthlyEarnings: 142000,
          joinDate: '2023-01-10',
          lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          workingHours: {
            start: '10:00',
            end: '22:00',
            days: ['Вт', 'Ср', 'Чт', 'Пт', 'Сб']
          },
          certifications: ['Boxing Coach', 'Functional Movement'],
          nextSession: {
            time: '16:00',
            client: 'Сергей Петров'
          }
        }
      ];

      const mockClients: Client[] = [
        {
          id: 'client-1',
          name: 'Мария Иванова',
          email: 'maria@example.com',
          phone: '+7 (999) 111-22-33',
          avatar: '/avatars/client-maria.jpg',
          membershipType: 'Premium',
          joinDate: '2023-06-15',
          lastVisit: new Date().toISOString(),
          totalSessions: 45,
          assignedTrainer: 'trainer-1',
          status: 'active'
        },
        {
          id: 'client-2',
          name: 'Анна Козлова',
          email: 'anna@example.com',
          phone: '+7 (999) 222-33-44',
          avatar: '/avatars/client-anna.jpg',
          membershipType: 'Standard',
          joinDate: '2023-08-20',
          lastVisit: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          totalSessions: 23,
          assignedTrainer: 'trainer-2',
          status: 'active'
        }
      ];

      const mockBookings: Booking[] = [
        {
          id: 'booking-1',
          trainerId: 'trainer-1',
          trainerName: 'Адам Петров',
          trainerAvatar: '/avatars/trainer-adam.jpg',
          clientId: 'client-1',
          clientName: 'Мария Иванова',
          clientAvatar: '/avatars/client-maria.jpg',
          clientPhone: '+7 (999) 111-22-33',
          date: new Date().toISOString().split('T')[0],
          time: '14:00',
          duration: 60,
          type: 'personal',
          status: 'scheduled',
          price: 2500,
          service: 'Персональная тренировка',
          notes: 'Работа над силовыми упражнениями'
        },
        {
          id: 'booking-2',
          trainerId: 'trainer-2',
          trainerName: 'Елена Смирнова',
          trainerAvatar: '/avatars/trainer-elena.jpg',
          clientId: 'client-2',
          clientName: 'Анна Козлова',
          clientAvatar: '/avatars/client-anna.jpg',
          clientPhone: '+7 (999) 222-33-44',
          date: new Date().toISOString().split('T')[0],
          time: '15:30',
          duration: 90,
          type: 'personal',
          status: 'completed',
          price: 3500,
          service: 'Йога и стретчинг',
          notes: 'Восстановительная тренировка'
        }
      ];

      setStats(mockStats);
      setTrainers(mockTrainers);
      setClients(mockClients);
      setBookings(mockBookings);
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    await loadInitialData();
  };

  // CRUD операции для записей
  const createBooking = async (bookingData: any) => {
    try {
      const newBooking: Booking = {
        id: `booking-${Date.now()}`,
        ...bookingData,
        status: 'scheduled' as const
      };

      setBookings(prev => [...prev, newBooking]);

      // Обновляем статистику
      setStats(prev => ({
        ...prev,
        todayBookings: bookingData.date === new Date().toISOString().split('T')[0]
          ? prev.todayBookings + 1
          : prev.todayBookings
      }));

    } catch (error) {
      console.error('Ошибка создания записи:', error);
      throw error;
    }
  };

  const updateBooking = async (bookingId: string, updates: Partial<Booking>) => {
    try {
      setBookings(prev =>
        prev.map(booking =>
          booking.id === bookingId
            ? { ...booking, ...updates }
            : booking
        )
      );
    } catch (error) {
      console.error('Ошибка обновления записи:', error);
      throw error;
    }
  };

  const deleteBooking = async (bookingId: string) => {
    try {
      setBookings(prev => prev.filter(booking => booking.id !== bookingId));
    } catch (error) {
      console.error('Ошибка удаления записи:', error);
      throw error;
    }
  };

  // CRUD операции для тренеров
  const createTrainer = async (trainerData: any) => {
    try {
      const newTrainer: Trainer = {
        id: `trainer-${Date.now()}`,
        ...trainerData,
        rating: 0,
        totalClients: 0,
        completedSessions: 0,
        monthlyEarnings: 0,
        joinDate: new Date().toISOString(),
        lastActive: new Date().toISOString()
      };

      setTrainers(prev => [...prev, newTrainer]);

      setStats(prev => ({
        ...prev,
        totalTrainers: prev.totalTrainers + 1,
        activeTrainers: trainerData.status === 'active'
          ? prev.activeTrainers + 1
          : prev.activeTrainers
      }));

    } catch (error) {
      console.error('Ошибка создания тренера:', error);
      throw error;
    }
  };

  const updateTrainer = async (trainerId: string, updates: Partial<Trainer>) => {
    try {
      setTrainers(prev =>
        prev.map(trainer =>
          trainer.id === trainerId
            ? { ...trainer, ...updates }
            : trainer
        )
      );
    } catch (error) {
      console.error('Ошибка обновления тренера:', error);
      throw error;
    }
  };

  const deleteTrainer = async (trainerId: string) => {
    try {
      const trainer = trainers.find(t => t.id === trainerId);

      setTrainers(prev => prev.filter(trainer => trainer.id !== trainerId));

      if (trainer) {
        setStats(prev => ({
          ...prev,
          totalTrainers: prev.totalTrainers - 1,
          activeTrainers: trainer.status === 'active'
            ? prev.activeTrainers - 1
            : prev.activeTrainers
        }));
      }

    } catch (error) {
      console.error('Ошибка удаления тренера:', error);
      throw error;
    }
  };

  const updateTrainerStatus = async (trainerId: string, status: string) => {
    try {
      const oldTrainer = trainers.find(t => t.id === trainerId);

      setTrainers(prev =>
        prev.map(trainer =>
          trainer.id === trainerId
            ? { ...trainer, status: status as Trainer['status'] }
            : trainer
        )
      );

      // Обновляем статистику активных тренеров
      if (oldTrainer) {
        setStats(prev => ({
          ...prev,
          activeTrainers:
            oldTrainer.status !== 'active' && status === 'active'
              ? prev.activeTrainers + 1
              : oldTrainer.status === 'active' && status !== 'active'
                ? prev.activeTrainers - 1
                : prev.activeTrainers
        }));
      }

    } catch (error) {
      console.error('Ошибка обновления статуса тренера:', error);
      throw error;
    }
  };

  const assignTrainerToClient = async (clientId: string, trainerId: string) => {
    try {
      setClients(prev => prev.map(client =>
        client.id === clientId ? { ...client, assignedTrainer: trainerId } : client
      ));
    } catch (error) {
      console.error('Ошибка назначения тренера:', error);
      throw error;
    }
  };

  // Методы поиска и фильтрации
  const searchBookings = (query: string): Booking[] => {
    if (!query.trim()) return bookings;

    const lowercaseQuery = query.toLowerCase();
    return bookings.filter(booking =>
      booking.clientName.toLowerCase().includes(lowercaseQuery) ||
      booking.trainerName.toLowerCase().includes(lowercaseQuery) ||
      booking.service.toLowerCase().includes(lowercaseQuery) ||
      booking.notes?.toLowerCase().includes(lowercaseQuery)
    );
  };

  const searchTrainers = (query: string): Trainer[] => {
    if (!query.trim()) return trainers;

    const lowercaseQuery = query.toLowerCase();
    return trainers.filter(trainer =>
      trainer.name.toLowerCase().includes(lowercaseQuery) ||
      trainer.email.toLowerCase().includes(lowercaseQuery) ||
      trainer.phone.toLowerCase().includes(lowercaseQuery) ||
      trainer.specialization.some(spec =>
        spec.toLowerCase().includes(lowercaseQuery)
      ) ||
      trainer.certifications.some(cert =>
        cert.toLowerCase().includes(lowercaseQuery)
      )
    );
  };

  const getTrainerBookings = (trainerId: string, date?: string): Booking[] => {
    return bookings.filter(booking => {
      const matchesTrainer = booking.trainerId === trainerId;
      const matchesDate = date ? booking.date === date : true;
      return matchesTrainer && matchesDate;
    });
  };

  // Методы аналитики
  const getRevenueData = (period: string) => {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'quarter':
        startDate = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const filteredBookings = bookings.filter(booking => {
      const bookingDate = new Date(booking.date);
      return bookingDate >= startDate && booking.status === 'completed';
    });

    const total = filteredBookings.reduce((sum, booking) => sum + booking.price, 0);
    const count = filteredBookings.length;
    const average = count > 0 ? total / count : 0;

    // Группировка по дням для графика
    const byDay = filteredBookings.reduce((acc, booking) => {
      const day = booking.date;
      acc[day] = (acc[day] || 0) + booking.price;
      return acc;
    }, {} as Record<string, number>);

    // Группировка по тренерам
    const byTrainer = filteredBookings.reduce((acc, booking) => {
      const trainer = booking.trainerName;
      acc[trainer] = (acc[trainer] || 0) + booking.price;
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      count,
      average,
      byDay,
      byTrainer,
      growth: calculateGrowth(total, period),
      trend: calculateTrend(byDay)
    };
  };

  const getBookingStats = (period: string) => {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const filteredBookings = bookings.filter(booking => {
      const bookingDate = new Date(booking.date);
      return bookingDate >= startDate;
    });

    const total = filteredBookings.length;
    const scheduled = filteredBookings.filter(b => b.status === 'scheduled').length;
    const completed = filteredBookings.filter(b => b.status === 'completed').length;
    const cancelled = filteredBookings.filter(b => b.status === 'cancelled').length;
    const noShow = filteredBookings.filter(b => b.status === 'no-show').length;

    // Статистика по статусам
    const byStatus = filteredBookings.reduce((acc, booking) => {
      acc[booking.status] = (acc[booking.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Статистика по типам
    const byType = filteredBookings.reduce((acc, booking) => {
      acc[booking.type] = (acc[booking.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Статистика по времени
    const byHour = filteredBookings.reduce((acc, booking) => {
      const hour = booking.time.split(':')[0];
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      scheduled,
      completed,
      cancelled,
      noShow,
      byStatus,
      byType,
      byHour,
      completionRate: total > 0 ? (completed / total) * 100 : 0,
      cancellationRate: total > 0 ? (cancelled / total) * 100 : 0,
      noShowRate: total > 0 ? (noShow / total) * 100 : 0
    };
  };

  const getTrainerPerformance = (trainerId?: string) => {
    const targetTrainers = trainerId
      ? trainers.filter(t => t.id === trainerId)
      : trainers;

    return targetTrainers.map(trainer => {
      const trainerBookings = bookings.filter(b => b.trainerId === trainer.id);
      const completedBookings = trainerBookings.filter(b => b.status === 'completed');
      const cancelledBookings = trainerBookings.filter(b => b.status === 'cancelled');
      const noShowBookings = trainerBookings.filter(b => b.status === 'no-show');

      const revenue = completedBookings.reduce((sum, b) => sum + b.price, 0);
      const averagePrice = completedBookings.length > 0
        ? revenue / completedBookings.length
        : 0;

      const completionRate = trainerBookings.length > 0
        ? (completedBookings.length / trainerBookings.length) * 100
        : 0;

      const cancellationRate = trainerBookings.length > 0
        ? (cancelledBookings.length / trainerBookings.length) * 100
        : 0;

      const noShowRate = trainerBookings.length > 0
        ? (noShowBookings.length / trainerBookings.length) * 100
        : 0;

      // Загруженность по дням недели
      const workloadByDay = trainerBookings.reduce((acc, booking) => {
        const date = new Date(booking.date);
        const dayName = date.toLocaleDateString('ru-RU', { weekday: 'long' });
        acc[dayName] = (acc[dayName] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Средняя оценка (из профиля тренера)
      const rating = trainer.rating;

      return {
        trainerId: trainer.id,
        trainerName: trainer.name,
        trainerStatus: trainer.status,
        totalBookings: trainerBookings.length,
        completedBookings: completedBookings.length,
        cancelledBookings: cancelledBookings.length,
        noShowBookings: noShowBookings.length,
        revenue,
        averagePrice,
        rating,
        completionRate,
        cancellationRate,
        noShowRate,
        workloadByDay,
        specialization: trainer.specialization,
        monthlyEarnings: trainer.monthlyEarnings,
        totalClients: trainer.totalClients,
        efficiency: calculateEfficiency(completionRate, rating, revenue)
      };
    });
  };

  // Вспомогательные функции для расчетов
  const calculateGrowth = (currentValue: number, period: string): number => {
    // Простая имитация расчета роста
    // В реальном приложении здесь будет сравнение с предыдущим периодом
    const mockPreviousValue = currentValue * 0.85; // Имитация предыдущего значения
    return currentValue > 0 ? ((currentValue - mockPreviousValue) / mockPreviousValue) * 100 : 0;
  };

  const calculateTrend = (dataByDay: Record<string, number>): 'up' | 'down' | 'stable' => {
    const values = Object.values(dataByDay);
    if (values.length < 2) return 'stable';

    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));

    const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;

    const difference = ((secondAvg - firstAvg) / firstAvg) * 100;

    if (difference > 5) return 'up';
    if (difference < -5) return 'down';
    return 'stable';
  };

  const calculateEfficiency = (completionRate: number, rating: number, revenue: number): number => {
    // Формула эффективности: (завершаемость * 0.4) + (рейтинг * 20 * 0.3) + (доход/1000 * 0.3)
    const normalizedRating = (rating / 5) * 100; // Приводим рейтинг к 100-балльной шкале
    const normalizedRevenue = Math.min((revenue / 100000) * 100, 100); // Нормализуем доход

    return (completionRate * 0.4) + (normalizedRating * 0.3) + (normalizedRevenue * 0.3);
  };

  const value: ManagerContextType = {
    stats,
    trainers,
    clients,
    bookings,
    loading,
    refreshData,
    refreshBookings,
    assignTrainerToClient,

    // CRUD операции для записей
    createBooking,
    updateBooking,
    deleteBooking,

    // CRUD операции для тренеров
    createTrainer,
    updateTrainer,
    deleteTrainer,
    updateTrainerStatus,

    // Фильтры и поиск
    searchBookings,
    searchTrainers,
    getTrainerBookings,

    // Аналитика
    getRevenueData,
    getBookingStats,
    getTrainerPerformance
  };

  return (
    <ManagerContext.Provider value={value}>
      {children}
    </ManagerContext.Provider>
  );
}

export function useManager() {
  const context = useContext(ManagerContext);
  if (context === undefined) {
    throw new Error('useManager must be used within a ManagerProvider');
  }
  return context;
}

export type { Trainer, Booking, Client, ManagerStats };