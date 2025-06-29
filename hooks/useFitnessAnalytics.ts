// hooks/useFitnessAnalytics.ts
"use client";

import { useState, useEffect } from 'react';
import { 
  TrainerStats, 
  BookingStats, 
  SatisfactionStats, 
  PeakHoursStats, 
  PerformanceMetrics 
} from '@/types/analytics';

// Типы для возвращаемых данных хуков
interface TrainerStatsData {
  topTrainers: TrainerStats[];
  total: number;
  averageRating: number;
  totalEarnings: number;
  averageExperience?: number;
}

export function useTrainerStats(period: string) {
  const [data, setData] = useState<TrainerStatsData | null | undefined>(undefined);

  useEffect(() => {
    const fetchTrainerStats = async () => {
      try {
        // Имитация API запроса
        await new Promise(resolve => setTimeout(resolve, 300));
        
        setData({
          topTrainers: [
            { 
              id: '1', 
              name: 'Иван Петров', 
              monthlyEarnings: 85000, 
              rating: 4.9,
              specialization: 'Силовые тренировки',
              experience: 5,
              clientsCount: 25,
              sessionsCount: 120,
              availability: 95
            },
            { 
              id: '2', 
              name: 'Мария Сидорова', 
              monthlyEarnings: 78000, 
              rating: 4.8,
              specialization: 'Йога',
              experience: 3,
              clientsCount: 30,
              sessionsCount: 110,
              availability: 90
            },
            { 
              id: '3', 
              name: 'Алексей Козлов', 
              monthlyEarnings: 72000, 
              rating: 4.7,
              specialization: 'Кроссфит',
              experience: 4,
              clientsCount: 22,
              sessionsCount: 105,
              availability: 88
            },
            { 
              id: '4', 
              name: 'Елена Волкова', 
              monthlyEarnings: 68000, 
              rating: 4.6,
              specialization: 'Пилатес',
              experience: 2,
              clientsCount: 28,
              sessionsCount: 98,
              availability: 92
            },
            { 
              id: '5', 
              name: 'Дмитрий Орлов', 
              monthlyEarnings: 65000, 
              rating: 4.5,
              specialization: 'Функциональный тренинг',
              experience: 6,
              clientsCount: 20,
              sessionsCount: 95,
              availability: 85
            }
          ],
          total: 12,
          averageRating: 4.7,
          totalEarnings: 368000,
          averageExperience: 4
        });
      } catch (error) {
        console.error('Error fetching trainer stats:', error);
        setData(null);
      }
    };

    fetchTrainerStats();
  }, [period]);

  return data;
}

export function useBookingStats(period: string) {
  const [data, setData] = useState<BookingStats | null | undefined>(undefined);

  useEffect(() => {
    const fetchBookingStats = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 300));
        
        setData({
          current: 456,
          previous: 398,
          growth: 14.6,
          cancellationRate: 12,
          repeatBookings: 78,
          monthlyData: [
            { month: 'Янв', revenue: 980000, bookings: 342, clients: 45 },
            { month: 'Фев', revenue: 1050000, bookings: 378, clients: 52 },
            { month: 'Мар', revenue: 1120000, bookings: 401, clients: 48 },
            { month: 'Апр', revenue: 1180000, bookings: 423, clients: 61 },
            { month: 'Май', revenue: 1250000, bookings: 456, clients: 67 }
          ],
          byService: {
            'Персональные тренировки': { count: 180, revenue: 540000 },
            'Групповые занятия': { count: 150, revenue: 300000 },
            'Массаж': { count: 80, revenue: 240000 },
            'Консультации': { count: 46, revenue: 170000 }
          },
          averageAdvanceBooking: 3.5
        });
      } catch (error) {
        console.error('Error fetching booking stats:', error);
        setData(null);
      }
    };

    fetchBookingStats();
  }, [period]);

  return data;
}

export function useClientSatisfactionStats(period: string) {
  const [data, setData] = useState<SatisfactionStats | null | undefined>(undefined);

  useEffect(() => {
    const fetchSatisfactionStats = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 300));
        
        setData({
          current: 4.8,
          previous: 4.6,
          growth: 4.3,
          averageRating: 4.8,
          totalReviews: 234,
          distribution: {
            5: 65,
            4: 25,
            3: 8,
            2: 2,
            1: 0
          },
          npsScore: 72,
          commonComplaints: [
            { issue: 'Очереди на оборудование', count: 15 },
            { issue: 'Температура в зале', count: 8 },
            { issue: 'Время работы', count: 5 }
          ]
        });
      } catch (error) {
        console.error('Error fetching satisfaction stats:', error);
        setData(null);
      }
    };

    fetchSatisfactionStats();
  }, [period]);

  return data;
}

export function usePeakHoursStats(period: string) {
  const [data, setData] = useState<PeakHoursStats | null | undefined>(undefined);

  useEffect(() => {
    const fetchPeakHoursStats = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 300));
        
        setData({
          timeSlots: [
            { 
              time: '08:00-10:00', 
              load: 45, 
              label: 'Утро',
              capacity: 50,
              bookings: 23
            },
            { 
              time: '12:00-14:00', 
              load: 30, 
              label: 'Обед',
              capacity: 50,
              bookings: 15
            },
            { 
              time: '18:00-20:00', 
              load: 95, 
              label: 'Вечер',
              capacity: 50,
              bookings: 48
            },
            { 
              time: '20:00-22:00', 
              load: 75, 
              label: 'Поздний вечер',
              capacity: 50,
              bookings: 38
            }
          ],
          busiestHour: '18:00-20:00',
          averageLoad: 61.25,
          weeklyPattern: {
            'Понедельник': 85,
            'Вторник': 78,
            'Среда': 82,
            'Четверг': 75,
            'Пятница': 88,
            'Суббота': 92,
            'Воскресенье': 65
          },
          seasonalTrends: [
            { month: 'Январь', averageLoad: 95 },
            { month: 'Февраль', averageLoad: 88 },
            { month: 'Март', averageLoad: 82 },
            { month: 'Апрель', averageLoad: 75 },
            { month: 'Май', averageLoad: 70 }
          ]
        });
      } catch (error) {
        console.error('Error fetching peak hours stats:', error);
        setData(null);
      }
    };

    fetchPeakHoursStats();
  }, [period]);

  return data;
}

export function usePerformanceMetrics(period: string) {
  const [data, setData] = useState<PerformanceMetrics | null | undefined>(undefined);

  useEffect(() => {
    const fetchPerformanceMetrics = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 300));
        
        setData({
          averageLoad: 85,
          planCompletion: 92,
          clientRetention: 96,
          responseTime: '1.2ч',
          equipmentUtilization: 78,
          trainerEfficiency: 88,
          energyConsumption: 2450, // кВт·ч
          maintenanceCosts: 45000 // рублей
        });
      } catch (error) {
        console.error('Error fetching performance metrics:', error);
        setData(null);
      }
    };

    fetchPerformanceMetrics();
  }, [period]);

  return data;
}

// Дополнительные хуки для расширенной аналитики
export function useClassStats(period: string) {
  const [data, setData] = useState<{
    total: number;
    mostPopular: Array<{
      id: string;
      name: string;
      instructor: string;
      averageAttendance: number;
      capacity: number;
      utilizationRate: number;
      rating: number;
      revenue: number;
      waitingList?: number;
    }>;
    averageUtilization: number;
    totalRevenue: number;
  } | null | undefined>(undefined);

  useEffect(() => {
    const fetchClassStats = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 300));
        
        setData({
          total: 25,
          mostPopular: [
            {
              id: '1',
              name: 'Утренняя йога',
              instructor: 'Мария Сидорова',
              averageAttendance: 18,
              capacity: 20,
              utilizationRate: 90,
              rating: 4.9,
              revenue: 54000,
              waitingList: 5
            },
            {
              id: '2',
              name: 'Вечерний кроссфит',
              instructor: 'Алексей Козлов',
              averageAttendance: 15,
              capacity: 16,
              utilizationRate: 94,
              rating: 4.8,
              revenue: 48000,
              waitingList: 8
            },
            {
              id: '3',
              name: 'Пилатес для начинающих',
              instructor: 'Елена Волкова',
              averageAttendance: 12,
              capacity: 15,
              utilizationRate: 80,
              rating: 4.7,
              revenue: 36000,
              waitingList: 2
            }
          ],
          averageUtilization: 78,
          totalRevenue: 285000
        });
      } catch (error) {
        console.error('Error fetching class stats:', error);
        setData(null);
      }
    };

    fetchClassStats();
  }, [period]);

  return data;
}

export function useMembershipStats(period: string) {
  const [data, setData] = useState<{
    total: number;
    byType: Array<{
      type: string;
      count: number;
      revenue: number;
      averageDuration: number;
      churnRate: number;
      upgradeRate?: number;
    }>;
    averageValue: number;
    renewalRate: number;
  } | null | undefined>(undefined);

  useEffect(() => {
    const fetchMembershipStats = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 300));
        
        setData({
          total: 1250,
          byType: [
            {
              type: 'Базовый',
              count: 650,
              revenue: 1950000,
              averageDuration: 6,
              churnRate: 15,
              upgradeRate: 25
            },
            {
              type: 'Премиум',
              count: 400,
              revenue: 2400000,
              averageDuration: 9,
              churnRate: 8,
              upgradeRate: 10
            },
            {
              type: 'VIP',
              count: 200,
              revenue: 2000000,
              averageDuration: 12,
              churnRate: 5,
              upgradeRate: 0
            }
          ],
          averageValue: 5080,
          renewalRate: 85
        });
      } catch (error) {
        console.error('Error fetching membership stats:', error);
        setData(null);
      }
    };

    fetchMembershipStats();
  }, [period]);

  return data;
}

// Хук для KPI и целей
export function useKPITargets(period: string) {
  const [data, setData] = useState<Array<{
    metric: string;
    target: number;
    current: number;
    period: string;
    unit: string;
    status: 'on-track' | 'behind' | 'exceeded';
  }> | null | undefined>(undefined);

  useEffect(() => {
    const fetchKPITargets = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 300));
        
        setData([
          {
            metric: 'Месячный доход',
            target: 1500000,
            current: 1250000,
            period,
            unit: '₽',
            status: 'behind'
          },
          {
            metric: 'Новые клиенты',
            target: 50,
            current: 67,
            period,
            unit: 'чел.',
            status: 'exceeded'
          },
          {
            metric: 'Удержание клиентов',
            target: 90,
            current: 96,
            period,
            unit: '%',
            status: 'exceeded'
          },
          {
            metric: 'Загрузка зала',
            target: 80,
            current: 85,
            period,
            unit: '%',
            status: 'on-track'
          }
        ]);
      } catch (error) {
        console.error('Error fetching KPI targets:', error);
        setData(null);
      }
    };

    fetchKPITargets();
  }, [period]);

  return data;
}

// Хук для алертов и уведомлений
export function useAnalyticsAlerts() {
  const [data, setData] = useState<Array<{
    id: string;
    type: 'warning' | 'error' | 'info' | 'success';
    title: string;
    message: string;
    metric: string;
    threshold: number;
    currentValue: number;
    timestamp: Date;
    acknowledged: boolean;
  }> | null | undefined>(undefined);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
                await new Promise(resolve => setTimeout(resolve, 300));
        
        setData([
          {
            id: '1',
            type: 'warning',
            title: 'Высокая загрузка зала',
            message: 'Загрузка зала превысила 90% в пиковые часы',
            metric: 'gym_load',
            threshold: 90,
            currentValue: 95,
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 часа назад
            acknowledged: false
          },
          {
            id: '2',
            type: 'error',
            title: 'Оборудование требует обслуживания',
            message: 'Беговая дорожка #3 показывает критические показатели',
            metric: 'equipment_status',
            threshold: 0,
            currentValue: 1,
            timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 часа назад
            acknowledged: false
          },
          {
            id: '3',
            type: 'info',
            title: 'Новый рекорд посещаемости',
            message: 'Сегодня зарегистрировано рекордное количество посещений',
            metric: 'daily_visits',
            threshold: 200,
            currentValue: 245,
            timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 час назад
            acknowledged: true
          },
          {
            id: '4',
            type: 'success',
            title: 'Цель по доходу достигнута',
            message: 'Месячная цель по доходу выполнена на 105%',
            metric: 'monthly_revenue',
            threshold: 1200000,
            currentValue: 1260000,
            timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 минут назад
            acknowledged: false
          }
        ]);
      } catch (error) {
        console.error('Error fetching alerts:', error);
        setData(null);
      }
    };

    fetchAlerts();
  }, []);

  const acknowledgeAlert = (alertId: string) => {
    setData(prevData => 
      prevData?.map(alert => 
        alert.id === alertId 
          ? { ...alert, acknowledged: true }
          : alert
      ) || null
    );
  };

  return { data, acknowledgeAlert };
}

// Хук для прогнозирования
export function useForecastData(metric: string, period: string) {
  const [data, setData] = useState<{
    metric: string;
    historical: Array<{ date: string; value: number }>;
    forecast: Array<{ date: string; value: number; confidence: number }>;
    accuracy: number;
  } | null | undefined>(undefined);

  useEffect(() => {
    const fetchForecastData = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 400));
        
        // Генерируем исторические данные
        const historical = [];
        const forecast = [];
        const baseDate = new Date();
        
        // Исторические данные за последние 30 дней
        for (let i = 29; i >= 0; i--) {
          const date = new Date(baseDate);
          date.setDate(date.getDate() - i);
          
          let value;
          switch (metric) {
            case 'revenue':
              value = 35000 + Math.random() * 10000 + Math.sin(i / 7) * 5000;
              break;
            case 'visits':
              value = 80 + Math.random() * 40 + Math.sin(i / 7) * 20;
              break;
            case 'bookings':
              value = 15 + Math.random() * 10 + Math.sin(i / 7) * 5;
              break;
            default:
              value = Math.random() * 100;
          }
          
          historical.push({
            date: date.toISOString().split('T')[0],
            value: Math.round(value)
          });
        }
        
        // Прогноз на следующие 7 дней
        for (let i = 1; i <= 7; i++) {
          const date = new Date(baseDate);
          date.setDate(date.getDate() + i);
          
          const lastValue = historical[historical.length - 1].value;
          const trend = (historical[historical.length - 1].value - historical[historical.length - 7].value) / 7;
          
          const forecastValue = lastValue + trend * i + (Math.random() - 0.5) * lastValue * 0.1;
          const confidence = Math.max(0.5, 0.9 - i * 0.05); // Уверенность снижается с временем
          
          forecast.push({
            date: date.toISOString().split('T')[0],
            value: Math.round(Math.max(0, forecastValue)),
            confidence: Math.round(confidence * 100) / 100
          });
        }
        
        setData({
          metric,
          historical,
          forecast,
          accuracy: 0.85 // 85% точность модели
        });
      } catch (error) {
        console.error('Error fetching forecast data:', error);
        setData(null);
      }
    };

    fetchForecastData();
  }, [metric, period]);

  return data;
}

// Хук для сегментации клиентов
export function useClientSegmentation(period: string) {
  const [data, setData] = useState<Array<{
    name: string;
    count: number;
    percentage: number;
    averageRevenue: number;
    characteristics: string[];
    trend: 'growing' | 'stable' | 'declining';
  }> | null | undefined>(undefined);

  useEffect(() => {
    const fetchSegmentation = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 350));
        
        setData([
          {
            name: 'VIP клиенты',
            count: 85,
            percentage: 6.8,
            averageRevenue: 15000,
            characteristics: ['Премиум абонемент', 'Персональный тренер', 'Дополнительные услуги'],
            trend: 'growing'
          },
          {
            name: 'Постоянные посетители',
            count: 420,
            percentage: 33.6,
            averageRevenue: 4500,
            characteristics: ['Регулярные посещения', 'Групповые занятия', 'Стандартный абонемент'],
            trend: 'stable'
          },
          {
            name: 'Новички',
            count: 280,
            percentage: 22.4,
            averageRevenue: 2800,
            characteristics: ['Первые 3 месяца', 'Базовый абонемент', 'Пробные занятия'],
            trend: 'growing'
          },
          {
            name: 'Периодические посетители',
            count: 315,
            percentage: 25.2,
            averageRevenue: 3200,
            characteristics: ['Нерегулярные посещения', 'Сезонная активность', 'Разовые тренировки'],
            trend: 'declining'
          },
          {
            name: 'Корпоративные клиенты',
            count: 150,
            percentage: 12.0,
            averageRevenue: 6800,
            characteristics: ['Корпоративный тариф', 'Групповые программы', 'Льготы'],
            trend: 'stable'
          }
        ]);
      } catch (error) {
        console.error('Error fetching client segmentation:', error);
        setData(null);
      }
    };

    fetchSegmentation();
  }, [period]);

  return data;
}

// Хук для анализа конкурентов
export function useCompetitorAnalysis(period: string) {
  const [data, setData] = useState<{
    marketShare: number;
    competitors: Array<{
      name: string;
      marketShare: number;
      pricing: {
        basic: number;
        premium: number;
      };
      strengths: string[];
      weaknesses: string[];
    }>;
    opportunities: string[];
    threats: string[];
  } | null | undefined>(undefined);

  useEffect(() => {
    const fetchCompetitorAnalysis = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 400));
        
        setData({
          marketShare: 28.5, // Наша доля рынка в %
          competitors: [
            {
              name: 'FitnessPro',
              marketShare: 35.2,
              pricing: {
                basic: 2500,
                premium: 4500
              },
              strengths: ['Большая сеть', 'Современное оборудование', 'Маркетинг'],
              weaknesses: ['Высокие цены', 'Переполненность', 'Слабый сервис']
            },
            {
              name: 'GymCity',
              marketShare: 22.8,
              pricing: {
                basic: 2000,
                premium: 3500
              },
              strengths: ['Доступные цены', 'Удобное расположение'],
              weaknesses: ['Устаревшее оборудование', 'Ограниченное расписание']
            },
            {
              name: 'EliteFit',
              marketShare: 13.5,
              pricing: {
                basic: 4000,
                premium: 7000
              },
              strengths: ['Премиум сервис', 'Индивидуальный подход', 'Эксклюзивность'],
              weaknesses: ['Очень высокие цены', 'Ограниченная аудитория']
            }
          ],
          opportunities: [
            'Расширение онлайн-услуг',
            'Корпоративные программы',
            'Детские секции',
            'Реабилитационные программы'
          ],
          threats: [
            'Новые конкуренты в районе',
            'Экономический спад',
            'Изменение потребительских предпочтений',
            'Рост цен на аренду'
          ]
        });
      } catch (error) {
        console.error('Error fetching competitor analysis:', error);
        setData(null);
      }
    };

    fetchCompetitorAnalysis();
  }, [period]);

  return data;
}

// Хук для анализа оборудования
export function useEquipmentAnalysis(period: string) {
  const [data, setData] = useState<{
    total: number;
    byStatus: Record<string, number>;
    utilizationRate: number;
    maintenanceSchedule: Array<{
      equipmentId: string;
      name: string;
      type: string;
      nextMaintenance: string;
      priority: 'low' | 'medium' | 'high';
    }>;
    popularEquipment: Array<{
      name: string;
      type: string;
      usageHours: number;
      utilizationRate: number;
    }>;
  } | null | undefined>(undefined);

  useEffect(() => {
    const fetchEquipmentAnalysis = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 350));
        
        setData({
          total: 85,
          byStatus: {
            'В работе': 78,
            'На обслуживании': 4,
            'Требует ремонта': 2,
            'Не используется': 1
          },
          utilizationRate: 76,
          maintenanceSchedule: [
            {
              equipmentId: 'TM001',
              name: 'Беговая дорожка Matrix T7x',
              type: 'Кардио',
              nextMaintenance: '2024-01-15',
              priority: 'high'
            },
            {
              equipmentId: 'ST005',
              name: 'Силовая станция Hammer',
              type: 'Силовой',
              nextMaintenance: '2024-01-20',
              priority: 'medium'
            },
            {
              equipmentId: 'CY003',
              name: 'Велотренажер Life Fitness',
              type: 'Кардио',
              nextMaintenance: '2024-01-25',
              priority: 'low'
            }
          ],
          popularEquipment: [
            {
              name: 'Беговые дорожки',
              type: 'Кардио',
              usageHours: 156,
              utilizationRate: 89
            },
            {
              name: 'Свободные веса',
              type: 'Силовой',
              usageHours: 142,
              utilizationRate: 85
            },
            {
              name: 'Велотренажеры',
              type: 'Кардио',
              usageHours: 98,
              utilizationRate: 72
            },
            {
              name: 'Тренажеры для пресса',
              type: 'Силовой',
              usageHours: 76,
              utilizationRate: 68
            }
          ]
        });
      } catch (error) {
        console.error('Error fetching equipment analysis:', error);
        setData(null);
      }
    };

    fetchEquipmentAnalysis();
  }, [period]);

  return data;
}

