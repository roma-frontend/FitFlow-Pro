// hooks/useAnalytics.ts - Исправленная версия с правильными типами
import { useEffect, useState, useCallback, useMemo } from "react";

// ✅ ДОПОЛНИТЕЛЬНЫЕ ТИПЫ
export interface TrainerStatsData {
  totalClients: number;
  activeClients: number;
  revenue: number;
  sessionsCount: number;
  averageSessionPrice: number;
  clientRetentionRate: number;
}

export interface MembershipStatsData {
  totalMemberships: number;
  activeMemberships: number;
  expiringThisMonth: number;
  revenue: number;
  averageMembershipPrice: number;
}

export interface DashboardStatsData {
  todayStats: {
    newUsers: number;
    revenue: number;
    orders: number;
    sessions: number;
  };
  weekStats: {
    newUsers: number;
    revenue: number;
    orders: number;
    sessions: number;
  };
}

// ✅ ИСПРАВЛЕННЫЕ ОСНОВНЫЕ ТИПЫ
export interface AnalyticsData {
  users: {
    total: number;
    active: number;
    new: number;
    growth: number;
    byRole: Record<string, number>;
    registrationTrend: Array<{ date: string; count: number }>;
  };
  products: {
    total: number;
    inStock: number;
    lowStock: number;
    outOfStock: number;
    totalValue: number;
    byCategory: Record<string, number>;
    salesTrend: Array<{ date: string; sales: number }>;
  };
  activity: {
    totalSessions: number;
    averageSessionTime: number;
    pageViews: number;
    bounceRate: number;
    topPages: Array<{ page: string; views: number }>;
  };
  revenue: {
    total: number;
    monthly: number;
    growth: number;
    byProduct: Array<{ name: string; revenue: number }>;
    trend: Array<{ date: string; amount: number; orders: number }>; // ✅ Добавили orders
  };
}

export interface UserStatsData {
  total: number;
  active: number;
  newInPeriod: number;
  byRole: Record<string, { count: number; active: number }>;
  activityRate: number;
}

export interface ProductStatsData {
  total: number;
  active: number;
  inStock: number;
  lowStock: number;
  outOfStock: number;
  totalValue: number;
  byCategory: Record<string, {
    count: number;
    inStock: number;
    totalValue: number;
    averagePrice: number;
  }>;
  lowStockProducts: Array<{
    id: string;
    name: string;
    currentStock: number;
    minStock: number;
    category: string;
  }>;
}

export interface RevenueStatsData {
  total: number;
  growth: number;
  ordersCount: number;
  averageOrderValue: number;
  topProducts: Array<{ name: string; revenue: number }>;
  dailyTrend: Array<{ date: string; amount: number; orders: number }>; // ✅ Добавили orders
  previousPeriod: {
    revenue: number;
    ordersCount: number;
  };
}

export interface ActivityStatsData {
  totalSessions: number;
  averageSessionTime: number;
  pageViews: number;
  bounceRate: number;
  topPages: Array<{ page: string; views: number }>;
}

export interface AggregatedAnalyticsData {
  overview: {
    totalUsers: number;
    activeUsers: number;
    totalProducts: number;
    totalRevenue: number;
    totalSessions: number;
  };
  growth: {
    userGrowth: number;
    revenueGrowth: number;
    activityRate: number;
  };
  inventory: {
    inStock: number;
    lowStock: number;
    outOfStock: number;
    totalValue: number;
  };
  performance: {
    averageOrderValue: number;
    averageSessionTime: number;
    bounceRate: number;
  };
  trends: {
    registrations: Array<{ date: string; count: number }>;
    revenue: Array<{ date: string; amount: number; orders: number }>; // ✅ Добавили orders
    topProducts: Array<{ name: string; revenue: number }>;
    topPages: Array<{ page: string; views: number }>;
  };
}

export interface ExportConfig {
  type: 'users' | 'products' | 'orders' | 'revenue' | 'analytics' | 'full';
  format: 'json' | 'csv';
  startDate?: number;
  endDate?: number;
}

export interface ExportResult {
  type: string;
  data: any;
  count: number;
  format: string;
  period: {
    start: string;
    end: string;
  };
  exportedAt: string;
}

// ✅ ИСПРАВЛЕННЫЙ ГЕНЕРАТОР ТЕСТОВЫХ ДАННЫХ
function generateTrendData(days: number, baseValue: number = 50, variance: number = 20) {
  return Array.from({ length: days }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (days - i - 1));
    
    const trend = i * 0.5;
    const seasonal = Math.sin((i / days) * Math.PI * 2) * 5;
    const random = (Math.random() - 0.5) * variance;
    
    const value = Math.max(1, Math.floor(baseValue + trend + seasonal + random));
    
    return {
      date: date.toISOString().split('T')[0],
      count: value,
      amount: Math.max(100, value * 100),
      orders: Math.max(1, Math.floor(value / 5)), // ✅ Всегда включаем orders
      sales: value
    };
  });
}

function generateMockData(period: string = "month"): AnalyticsData {
  const now = new Date();
  const daysCount = period === 'week' ? 7 : period === 'year' ? 365 : 30;
  const multiplier = period === 'week' ? 0.25 : period === 'year' ? 12 : 1;
  
  const trendData = generateTrendData(daysCount, 15, 8);
  const revenueTrendData = generateTrendData(daysCount, 500, 200);
  
  return {
    users: {
      total: Math.floor(1247 * multiplier),
      active: Math.floor(892 * multiplier),
      new: Math.floor(156 * multiplier),
      growth: 12.5 + (Math.random() - 0.5) * 10,
      byRole: {
        admin: Math.floor(5 * multiplier),
        member: Math.floor(1200 * multiplier),
        trainer: Math.floor(42 * multiplier),
        guest: Math.floor(25 * multiplier)
      },
      registrationTrend: trendData.map(item => ({
        date: item.date,
        count: item.count
      }))
    },
    products: {
      total: 89,
      inStock: 67,
      lowStock: 15,
      outOfStock: 7,
      totalValue: Math.floor(245000 * multiplier),
      byCategory: {
        'Протеины': 25,
        'Витамины': 30,
        'Спортивное питание': 20,
        'Аксессуары': 14,
        'Оборудование': 8
      },
      salesTrend: trendData.map(item => ({
        date: item.date,
        sales: item.sales
      }))
    },
    activity: {
      totalSessions: Math.floor(3456 * multiplier),
      averageSessionTime: 1800 + Math.floor((Math.random() - 0.5) * 600),
      pageViews: Math.floor(12890 * multiplier),
      bounceRate: 0.35 + (Math.random() - 0.5) * 0.1,
      topPages: [
        { page: '/dashboard', views: Math.floor(2340 * multiplier) },
        { page: '/products', views: Math.floor(1890 * multiplier) },
        { page: '/analytics', views: Math.floor(1560 * multiplier) },
        { page: '/orders', views: Math.floor(1200 * multiplier) },
        { page: '/users', views: Math.floor(890 * multiplier) },
        { page: '/schedule', views: Math.floor(750 * multiplier) }
      ]
    },
    revenue: {
      total: Math.floor(156780 * multiplier),
      monthly: Math.floor(45600 * multiplier),
      growth: 8.7 + (Math.random() - 0.5) * 5,
      byProduct: [
        { name: 'Протеиновый коктейль', revenue: Math.floor(45000 * multiplier) },
        { name: 'Витамин D3', revenue: Math.floor(23000 * multiplier) },
        { name: 'BCAA', revenue: Math.floor(18000 * multiplier) },
        { name: 'Креатин', revenue: Math.floor(15000 * multiplier) },
        { name: 'Омега-3', revenue: Math.floor(12000 * multiplier) },
        { name: 'Гейнер', revenue: Math.floor(8000 * multiplier) }
      ],
      trend: revenueTrendData.map(item => ({
        date: item.date,
        amount: item.amount,
        orders: item.orders // ✅ Включаем orders
      }))
    }
  };
}

// ✅ ОСНОВНЫЕ ХУКИ С ПРАВИЛЬНЫМИ ТИПАМИ
export function useAnalytics(period: string = "month", startDate?: number, endDate?: number) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        period,
        ...(startDate && { startDate: startDate.toString() }),
        ...(endDate && { endDate: endDate.toString() })
      });
      
      const response = await fetch(`/api/analytics?${params}`);
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setData(result.data);
          console.log('✅ Analytics данные загружены с API');
          return;
        }
      }
      
      console.log('⚠️ Analytics API недоступен, используем mock данные');
      setData(generateMockData(period));
      
    } catch (err) {
      console.warn('Analytics API недоступен:', err);
      setData(generateMockData(period));
    } finally {
      setLoading(false);
    }
  }, [period, startDate, endDate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return { data, loading, error, refetch: loadData };
}

export function useUserStats(period: string = "month") {
  const [data, setData] = useState<UserStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/analytics/users?period=${period}`);
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setData(result.data);
          console.log('✅ User stats загружены с API');
          return;
        }
      }
      
      const mockData = generateMockData(period);
      const fallbackData: UserStatsData = {
        total: mockData.users.total,
        active: mockData.users.active,
        newInPeriod: mockData.users.new,
        byRole: Object.entries(mockData.users.byRole).reduce((acc, [role, count]) => {
          acc[role] = { count, active: Math.floor(count * 0.8) };
          return acc;
        }, {} as Record<string, { count: number; active: number }>),
        activityRate: mockData.users.active / mockData.users.total
      };
      
      setData(fallbackData);
      console.log('⚠️ User stats API недоступен, используем mock данные');
      
    } catch (err) {
      console.warn('User stats API недоступен:', err);
      const mockData = generateMockData(period);
      const fallbackData: UserStatsData = {
        total: mockData.users.total,
        active: mockData.users.active,
        newInPeriod: mockData.users.new,
        byRole: Object.entries(mockData.users.byRole).reduce((acc, [role, count]) => {
          acc[role] = { count, active: Math.floor(count * 0.8) };
          return acc;
        }, {} as Record<string, { count: number; active: number }>),
        activityRate: mockData.users.active / mockData.users.total
      };
      setData(fallbackData);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return { data, loading, error, refetch: loadData };
}

export function useProductStats() {
  const [data, setData] = useState<ProductStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/analytics/products');
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setData(result.data);
          console.log('✅ Product stats загружены с API');
          return;
        }
      }
      
      const mockData = generateMockData();
      const fallbackData: ProductStatsData = {
        total: mockData.products.total,
        active: mockData.products.inStock + mockData.products.lowStock,
        inStock: mockData.products.inStock,
        lowStock: mockData.products.lowStock,
        outOfStock: mockData.products.outOfStock,
        totalValue: mockData.products.totalValue,
        byCategory: Object.entries(mockData.products.byCategory).reduce((acc, [category, count]) => {
          acc[category] = {
            count,
            inStock: Math.floor(count * 0.8),
            totalValue: count * 2500,
            averagePrice: 2500
          };
          return acc;
        }, {} as Record<string, any>),
        lowStockProducts: [
          { id: '1', name: 'Протеиновый коктейль', currentStock: 5, minStock: 10, category: 'Протеины' },
          { id: '2', name: 'Витамин C', currentStock: 3, minStock: 15, category: 'Витамины' },
          { id: '3', name: 'BCAA', currentStock: 2, minStock: 8, category: 'Спортивное питание' }
        ]
      };
      
      setData(fallbackData);
      console.log('⚠️ Product stats API недоступен, используем mock данные');
      
    } catch (err) {
      console.warn('Product stats API недоступен:', err);
      const mockData = generateMockData();
      const fallbackData: ProductStatsData = {
        total: mockData.products.total,
        active: mockData.products.inStock + mockData.products.lowStock,
        inStock: mockData.products.inStock,
        lowStock: mockData.products.lowStock,
        outOfStock: mockData.products.outOfStock,
        totalValue: mockData.products.totalValue,
        byCategory: Object.entries(mockData.products.byCategory).reduce((acc, [category, count]) => {
          acc[category] = {
            count,
            inStock: Math.floor(count * 0.8),
            totalValue: count * 2500,
            averagePrice: 2500
          };
          return acc;
        }, {} as Record<string, any>),
        lowStockProducts: [
          { id: '1', name: 'Протеиновый коктейль', currentStock: 5, minStock: 10, category: 'Протеины' },
          { id: '2', name: 'Витамин C', currentStock: 3, minStock: 15, category: 'Витамины' }
        ]
      };
      setData(fallbackData);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return { data, loading, error, refetch: loadData };
}

export function useRevenueStats(period: string = "month", startDate?: number, endDate?: number) {
  const [data, setData] = useState<RevenueStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        period,
        ...(startDate && { startDate: startDate.toString() }),
        ...(endDate && { endDate: endDate.toString() })
      });
      
      const response = await fetch(`/api/analytics/revenue?${params}`);
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setData(result.data);
          console.log('✅ Revenue stats загружены с API');
          return;
        }
      }
      
      const mockData = generateMockData(period);
      const fallbackData: RevenueStatsData = {
        total: mockData.revenue.total,
        growth: mockData.revenue.growth,
        ordersCount: Math.floor(mockData.revenue.total / 344),
        averageOrderValue: 344,
        topProducts: mockData.revenue.byProduct,
        dailyTrend: mockData.revenue.trend, // ✅ Уже содержит orders
        previousPeriod: {
          revenue: Math.floor(mockData.revenue.total * 0.9),
          ordersCount: Math.floor((mockData.revenue.total * 0.9) / 344)
        }
      };
      
      setData(fallbackData);
      console.log('⚠️ Revenue stats API недоступен, используем mock данные');
      
    } catch (err) {
      console.warn('Revenue stats API недоступен:', err);
      const mockData = generateMockData(period);
      const fallbackData: RevenueStatsData = {
        total: mockData.revenue.total,
        growth: mockData.revenue.growth,
        ordersCount: Math.floor(mockData.revenue.total / 344),
        averageOrderValue: 344,
        topProducts: mockData.revenue.byProduct,
        dailyTrend: mockData.revenue.trend,
        previousPeriod: {
          revenue: Math.floor(mockData.revenue.total * 0.9),
          ordersCount: Math.floor((mockData.revenue.total * 0.9) / 344)
        }
      };
      setData(fallbackData);
    } finally {
      setLoading(false);
    }
  }, [period, startDate, endDate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return { data, loading, error, refetch: loadData };
}

export function useActivityStats(period: string = "month") {
  const [data, setData] = useState<ActivityStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/analytics/activity?period=${period}`);
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setData(result.data);
          console.log('✅ Activity stats загружены с API');
          return;
        }
      }
      
      const mockData = generateMockData(period);
      setData(mockData.activity);
      console.log('⚠️ Activity stats API недоступен, используем mock данные');
      
    } catch (err) {
      console.warn('Activity stats API недоступен:', err);
      const mockData = generateMockData(period);
      setData(mockData.activity);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return { data, loading, error, refetch: loadData };
}

// ✅ ИСПРАВЛЕННЫЕ ДОПОЛНИТЕЛЬНЫЕ ХУКИ
export function useTrainerStats(period: string = "month", trainerId?: string) {
  const [data, setData] = useState<TrainerStatsData | null>(null); // ✅ Правильный тип
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({ period });
      if (trainerId) params.append('trainerId', trainerId);
      
      const response = await fetch(`/api/analytics/trainers?${params}`);
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setData(result.data);
          return;
        }
      }
      
      const fallbackData: TrainerStatsData = {
        totalClients: 45,
        activeClients: 38,
        revenue: 67500,
        sessionsCount: 156,
        averageSessionPrice: 432,
        clientRetentionRate: 0.84
      };
      
      setData(fallbackData);
      
    } catch (err) {
      console.warn('Trainer stats API недоступен:', err);
      const fallbackData: TrainerStatsData = {
        totalClients: 45,
        activeClients: 38,
        revenue: 67500,
        sessionsCount: 156,
        averageSessionPrice: 432,
        clientRetentionRate: 0.84
      };
      setData(fallbackData);
    } finally {
      setLoading(false);
    }
  }, [period, trainerId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return { data, loading, error, refetch: loadData };
}

export function useMembershipStats(period: string = "month") {
  const [data, setData] = useState<MembershipStatsData | null>(null); // ✅ Правильный тип
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/analytics/memberships?period=${period}`);
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setData(result.data);
          return;
        }
      }
      
      const fallbackData: MembershipStatsData = {
        totalMemberships: 234,
        activeMemberships: 198,
        expiringThisMonth: 23,
        revenue: 89400,
        averageMembershipPrice: 452
      };
      
      setData(fallbackData);
      
    } catch (err) {
      console.warn('Membership stats API недоступен:', err);
      const fallbackData: MembershipStatsData = {
        totalMemberships: 234,
        activeMemberships: 198,
        expiringThisMonth: 23,
        revenue: 89400,
        averageMembershipPrice: 452
      };
      setData(fallbackData);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return { data, loading, error, refetch: loadData };
}

export function useDashboardAnalytics() {
  const [data, setData] = useState<DashboardStatsData | null>(null); // ✅ Правильный тип
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/analytics/dashboard');
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setData(result.data);
          return;
        }
      }
      
      const fallbackData: DashboardStatsData = {
        todayStats: {
          newUsers: 12,
          revenue: 4560,
          orders: 23,
          sessions: 156
        },
        weekStats: {
          newUsers: 89,
          revenue: 34500,
          orders: 167,
          sessions: 1234
        }
      };
      
      setData(fallbackData);
      
    } catch (err) {
      console.warn('Dashboard analytics API недоступен:', err);
      const fallbackData: DashboardStatsData = {
        todayStats: {
          newUsers: 12,
          revenue: 4560,
          orders: 23,
          sessions: 156
        },
        weekStats: {
          newUsers: 89,
          revenue: 34500,
          orders: 167,
          sessions: 1234
        }
      };
      setData(fallbackData);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return { data, loading, error, refetch: loadData };
}

// ✅ ОСТАЛЬНЫЕ ХУКИ БЕЗ ИЗМЕНЕНИЙ...
export function useAggregatedAnalytics(period: string = "month"): {
  data: AggregatedAnalyticsData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
} {
  const analytics = useAnalytics(period);
  const userStats = useUserStats(period);
  const productStats = useProductStats();
  const revenueStats = useRevenueStats(period);
  const activityStats = useActivityStats(period);

  const [aggregatedData, setAggregatedData] = useState<AggregatedAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(() => {
    analytics.refetch();
    userStats.refetch();
    productStats.refetch();
    revenueStats.refetch();
    activityStats.refetch();
  }, [analytics, userStats, productStats, revenueStats, activityStats]);

  useEffect(() => {
    const allLoading = analytics.loading || userStats.loading || productStats.loading || 
                     revenueStats.loading || activityStats.loading;
    
    const hasError = analytics.error || userStats.error || productStats.error || 
                    revenueStats.error || activityStats.error;

    setLoading(allLoading);
    setError(hasError);

    if (!allLoading && analytics.data && userStats.data && productStats.data && 
        revenueStats.data && activityStats.data) {
      
      const aggregated: AggregatedAnalyticsData = {
        overview: {
          totalUsers: userStats.data.total,
          activeUsers: userStats.data.active,
          totalProducts: productStats.data.total,
          totalRevenue: revenueStats.data.total,
          totalSessions: activityStats.data.totalSessions,
        },
        growth: {
          userGrowth: analytics.data.users.growth,
          revenueGrowth: revenueStats.data.growth,
          activityRate: userStats.data.activityRate,
        },
        inventory: {
          inStock: productStats.data.inStock,
          lowStock: productStats.data.lowStock,
          outOfStock: productStats.data.outOfStock,
          totalValue: productStats.data.totalValue,
        },
        performance: {
          averageOrderValue: revenueStats.data.averageOrderValue,
          averageSessionTime: activityStats.data.averageSessionTime,
          bounceRate: activityStats.data.bounceRate,
        },
        trends: {
          registrations: analytics.data.users.registrationTrend,
          revenue: revenueStats.data.dailyTrend, // ✅ Уже содержит orders
          topProducts: revenueStats.data.topProducts,
          topPages: activityStats.data.topPages,
        }
      };

      setAggregatedData(aggregated);
    }
  }, [analytics, userStats, productStats, revenueStats, activityStats]);

  return { data: aggregatedData, loading, error, refetch };
}

// ✅ ЭКСПОРТ И УТИЛИТЫ (без изменений)
export function useExportManager() {
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const triggerExport = useCallback(async (
    type: ExportConfig['type'],
    format: ExportConfig['format'] = "json",
    startDate?: number,
    endDate?: number
  ) => {
    setIsExporting(true);
    setExportError(null);

    try {
      const params = new URLSearchParams({
        type,
        format,
        ...(startDate && { startDate: startDate.toString() }),
                ...(endDate && { endDate: endDate.toString() })
      });

      const response = await fetch(`/api/analytics/export?${params}`);
      
      if (response.ok) {
        const blob = await response.blob();
        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `${type}_export_${timestamp}.${format}`;
        downloadFile(blob, filename);
      } else {
        // Fallback экспорт
        const mockData = generateMockData();
        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `${type}_export_${timestamp}.${format}`;
        
        if (format === 'csv') {
          const csvContent = convertToCSV([mockData]);
          const blob = new Blob([csvContent], { type: 'text/csv' });
          downloadFile(blob, filename);
        } else {
          downloadJSON(mockData, filename);
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Ошибка экспорта';
      setExportError(errorMessage);
      console.error('Ошибка экспорта:', error);
    } finally {
      setIsExporting(false);
    }
  }, []);

  const resetExport = useCallback(() => {
    setIsExporting(false);
    setExportError(null);
  }, []);

  return {
    triggerExport,
    resetExport,
    isExporting,
    exportError,
    clearError: () => setExportError(null),
    isAvailable: true
  };
}

export function useLocalExport() {
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const exportData = useCallback(async (
    type: string,
    format: string = "json",
    data: any
  ): Promise<boolean> => {
    setIsExporting(true);
    setExportError(null);

    try {
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `${type}_export_${timestamp}.${format}`;

      if (format === 'csv' && Array.isArray(data)) {
        const csvContent = convertToCSV(data);
        const blob = new Blob([csvContent], { type: 'text/csv' });
        downloadFile(blob, filename);
      } else {
        downloadJSON(data, filename);
      }

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Ошибка экспорта';
      setExportError(errorMessage);
      return false;
    } finally {
      setIsExporting(false);
    }
  }, []);

  return {
    exportData,
    isExporting,
    exportError,
    clearError: () => setExportError(null)
  };
}

// ✅ УТИЛИТЫ ДЛЯ ЭКСПОРТА
export function downloadFile(blob: Blob, filename: string): void {
  try {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setTimeout(() => window.URL.revokeObjectURL(url), 100);
  } catch (error) {
    console.error('Ошибка скачивания файла:', error);
    throw new Error('Не удалось скачать файл');
  }
}

export function downloadJSON(data: any, filename: string): void {
  try {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    downloadFile(blob, filename);
  } catch (error) {
    console.error('Ошибка создания JSON файла:', error);
    throw new Error('Не удалось создать JSON файл');
  }
}

export function convertToCSV(data: any[]): string {
  if (!Array.isArray(data) || data.length === 0) {
    return 'Нет данных для экспорта';
  }
  
  try {
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          if (typeof value === 'string') {
            if (value.includes(',') || value.includes('"') || value.includes('\n')) {
              return `"${value.replace(/"/g, '""')}"`;
            }
          }
          return value ?? '';
        }).join(',')
      )
    ].join('\n');
    
    return csvContent;
  } catch (error) {
    console.error('Ошибка конвертации в CSV:', error);
    throw new Error('Не удалось конвертировать данные в CSV');
  }
}

// ✅ ПРОВЕРКА ДОСТУПНОСТИ АНАЛИТИКИ
export function useAnalyticsAvailability() {
  const [isAvailable, setIsAvailable] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const checkAvailability = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/analytics/health');
        setIsAvailable(response.ok);
      } catch (error) {
        console.warn('Analytics API недоступен, используем fallback:', error);
        setIsAvailable(true);
      } finally {
        setIsLoading(false);
      }
    };

    checkAvailability();
  }, []);

  return { isAvailable, isLoading };
}

// ✅ СОВМЕСТИМЫЕ ХУКИ (для обратной совместимости)
export function useAnalyticsWithFallback(period: string = "month", startDate?: number, endDate?: number) {
  return useAnalytics(period, startDate, endDate);
}

export function useUserStatsWithFallback(period: string = "month") {
  return useUserStats(period);
}

export function useProductStatsWithFallback() {
  return useProductStats();
}

export function useRevenueStatsWithFallback(period: string = "month", startDate?: number, endDate?: number) {
  return useRevenueStats(period, startDate, endDate);
}

// ✅ ЭКСПОРТ ОСНОВНЫХ ХУКОВ (для удобства)
export {
  useAnalytics as useAnalyticsData,
  useUserStats as useUserStatsData,
  useProductStats as useProductStatsData,
  useRevenueStats as useRevenueStatsData,
  useActivityStats as useActivityStatsData
};

// ✅ ХУКИ ДЛЯ РЕАЛЬНОГО ВРЕМЕНИ
export function useRealTimeAnalytics(period: string = "month", interval: number = 30000) {
  const analytics = useAnalytics(period);
  
  useEffect(() => {
    if (interval > 0) {
      const timer = setInterval(() => {
        analytics.refetch();
      }, interval);
      
      return () => clearInterval(timer);
    }
  }, [analytics, interval]);
  
  return analytics;
}

export function useRealTimeUserStats(period: string = "month", interval: number = 60000) {
  const userStats = useUserStats(period);
  
  useEffect(() => {
    if (interval > 0) {
      const timer = setInterval(() => {
        userStats.refetch();
      }, interval);
      
      return () => clearInterval(timer);
    }
  }, [userStats, interval]);
  
  return userStats;
}

// ✅ ХУКИ ДЛЯ КЭШИРОВАНИЯ
export function useCachedAnalytics(period: string = "month", cacheTime: number = 300000) {
  const [cachedData, setCachedData] = useState<{
    data: AnalyticsData | null;
    timestamp: number;
  }>({ data: null, timestamp: 0 });
  
  const analytics = useAnalytics(period);
  
  useEffect(() => {
    const now = Date.now();
    const isExpired = now - cachedData.timestamp > cacheTime;
    
    if (analytics.data && (isExpired || !cachedData.data)) {
      setCachedData({
        data: analytics.data,
        timestamp: now
      });
    }
  }, [analytics.data, cachedData.timestamp, cacheTime]);
  
  return {
    ...analytics,
    data: cachedData.data || analytics.data,
    isCached: !!cachedData.data && (Date.now() - cachedData.timestamp < cacheTime)
  };
}

// ✅ ХУКИ ДЛЯ СРАВНЕНИЯ ПЕРИОДОВ
export function useComparisonAnalytics(
  currentPeriod: string = "month",
  previousPeriod: string = "month"
) {
  const current = useAnalytics(currentPeriod);
  const previous = useAnalytics(previousPeriod);
  
  const comparison = useMemo(() => {
    if (!current.data || !previous.data) return null;
    
    return {
      users: {
        total: {
          current: current.data.users.total,
          previous: previous.data.users.total,
          change: current.data.users.total - previous.data.users.total,
          changePercent: previous.data.users.total > 0 
            ? ((current.data.users.total - previous.data.users.total) / previous.data.users.total) * 100 
            : 0
        },
        active: {
          current: current.data.users.active,
          previous: previous.data.users.active,
          change: current.data.users.active - previous.data.users.active,
          changePercent: previous.data.users.active > 0 
            ? ((current.data.users.active - previous.data.users.active) / previous.data.users.active) * 100 
            : 0
        }
      },
      revenue: {
        total: {
          current: current.data.revenue.total,
          previous: previous.data.revenue.total,
          change: current.data.revenue.total - previous.data.revenue.total,
          changePercent: previous.data.revenue.total > 0 
            ? ((current.data.revenue.total - previous.data.revenue.total) / previous.data.revenue.total) * 100 
            : 0
        }
      }
    };
  }, [current.data, previous.data]);
  
  return {
    current,
    previous,
    comparison,
    loading: current.loading || previous.loading,
    error: current.error || previous.error
  };
}

// ✅ ХУКИ ДЛЯ ФИЛЬТРАЦИИ
export function useFilteredAnalytics(
  period: string = "month",
  filters: {
    userRole?: string;
    productCategory?: string;
    minRevenue?: number;
    maxRevenue?: number;
  } = {}
) {
  const analytics = useAnalytics(period);
  
  const filteredData = useMemo(() => {
    if (!analytics.data) return null;
    
    let filtered = { ...analytics.data };
    
    if (filters.userRole) {
      const roleCount = filtered.users.byRole[filters.userRole] || 0;
      filtered.users = {
        ...filtered.users,
        total: roleCount,
        active: Math.floor(roleCount * 0.8)
      };
    }
    
    if (filters.productCategory) {
      const categoryCount = filtered.products.byCategory[filters.productCategory] || 0;
      filtered.products = {
        ...filtered.products,
        total: categoryCount,
        inStock: Math.floor(categoryCount * 0.8),
        lowStock: Math.floor(categoryCount * 0.15),
        outOfStock: Math.floor(categoryCount * 0.05)
      };
    }
    
    if (filters.minRevenue !== undefined || filters.maxRevenue !== undefined) {
      filtered.revenue.byProduct = filtered.revenue.byProduct.filter(product => {
        if (filters.minRevenue !== undefined && product.revenue < filters.minRevenue) {
          return false;
        }
        if (filters.maxRevenue !== undefined && product.revenue > filters.maxRevenue) {
          return false;
        }
        return true;
      });
    }
    
    return filtered;
  }, [analytics.data, filters]);
  
  return {
    ...analytics,
    data: filteredData
  };
}

// ✅ ХУКИ ДЛЯ УВЕДОМЛЕНИЙ О ИЗМЕНЕНИЯХ
export function useAnalyticsNotifications(thresholds: {
  userGrowth?: number;
  revenueGrowth?: number;
  lowStock?: number;
} = {}) {
  const analytics = useAnalytics();
  const [notifications, setNotifications] = useState<string[]>([]);
  
  useEffect(() => {
    if (!analytics.data) return;
    
    const newNotifications: string[] = [];
    
    if (thresholds.userGrowth !== undefined && 
        analytics.data.users.growth < thresholds.userGrowth) {
      newNotifications.push(`Рост пользователей ниже порога: ${analytics.data.users.growth}%`);
    }
    
    if (thresholds.revenueGrowth !== undefined && 
        analytics.data.revenue.growth < thresholds.revenueGrowth) {
      newNotifications.push(`Рост доходов ниже порога: ${analytics.data.revenue.growth}%`);
    }
    
    if (thresholds.lowStock !== undefined && 
        analytics.data.products.lowStock > thresholds.lowStock) {
      newNotifications.push(`Много товаров с низким запасом: ${analytics.data.products.lowStock}`);
    }
    
    setNotifications(newNotifications);
  }, [analytics.data, thresholds]);
  
  return {
    ...analytics,
    notifications,
    hasNotifications: notifications.length > 0,
    clearNotifications: () => setNotifications([])
  };
}

