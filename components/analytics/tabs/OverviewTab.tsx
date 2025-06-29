"use client";

import { TopProducts } from "@/components/analytics/TopProducts";
import { RegistrationTrend } from "@/components/analytics/RegistrationTrend";
import { RevenueTrend } from "@/components/analytics/RevenueTrend";
import { LowStockAlert } from "@/components/analytics/LowStockAlert";

interface OverviewTabProps {
  revenueStats: any;
  analytics: any;
  loading?: boolean;
}

export function OverviewTab({ revenueStats, analytics, loading }: OverviewTabProps) {
  const getTopProducts = () => {
    if (!revenueStats?.topProducts || !Array.isArray(revenueStats.topProducts))
      return [];
    return revenueStats.topProducts.slice(0, 5);
  };

  const getRegistrationTrend = () => {
    // Используем данные из analytics.users если доступны
    if (!analytics?.users?.registrationTrend || !Array.isArray(analytics.users.registrationTrend))
      return [];
    return analytics.users.registrationTrend.slice(-7);
  };

  const getRevenueTrend = () => {
    if (!revenueStats?.dailyTrend || !Array.isArray(revenueStats.dailyTrend))
      return [];
    return revenueStats.dailyTrend.slice(-7);
  };

  const getLowStockProducts = () => {
    // Используем данные из analytics.products если доступны
    if (!analytics?.products?.lowStockProducts || !Array.isArray(analytics.products.lowStockProducts))
      return [];
    return analytics.products.lowStockProducts.slice(0, 5);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <TopProducts 
        products={getTopProducts()} 
        loading={loading}
      />
      <RegistrationTrend 
        data={getRegistrationTrend()} 
        loading={loading}
      />
      <RevenueTrend 
        data={getRevenueTrend()} 
        loading={loading}
      />
      <LowStockAlert 
        products={getLowStockProducts()} 
        loading={loading}
      />
    </div>
  );
}
