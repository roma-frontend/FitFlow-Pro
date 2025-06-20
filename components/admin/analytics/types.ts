// components/admin/analytics/types.ts (обновленные типы)
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
    salesTrend: Array<{ date: string; sales: number; revenue: number }>;
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
    trend: Array<{ date: string; amount: number }>;
  };
}

export interface UserStats {
  total: number;
  active: number;
  newInPeriod: number;
  byRole: Record<string, { count: number; active: number }>;
  activityRate: number;
}

export interface ProductStats {
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

export interface RevenueStats {
  total: number;
  growth: number;
  ordersCount: number;
  averageOrderValue: number;
  topProducts: Array<{ name: string; revenue: number }>;
  dailyTrend: Array<{ date: string; amount: number; orders: number }>;
  previousPeriod: {
    revenue: number;
    ordersCount: number;
  };
}

export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface MetricCard {
  title: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down' | 'neutral';
  icon: any;
  color: string;
}
