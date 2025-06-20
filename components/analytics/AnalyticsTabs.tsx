"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Users, Package, Activity } from "lucide-react";
import { OverviewTab } from "@/components/analytics/tabs/OverviewTab";
import { UsersTab } from "@/components/analytics/tabs/UsersTab";
import { ProductsTab } from "@/components/analytics/tabs/ProductsTab";
import { ActivityTab } from "@/components/analytics/tabs/ActivityTab";

interface AnalyticsTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  analytics: any;
  userStats: any;
  productStats: any;
  revenueStats: any;
  loading?: boolean;
}

export function AnalyticsTabs({
  activeTab,
  setActiveTab,
  analytics,
  userStats,
  productStats,
  revenueStats,
  loading
}: AnalyticsTabsProps) {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="overview" className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4" />
          Обзор
        </TabsTrigger>
        <TabsTrigger value="users" className="flex items-center gap-2">
          <Users className="w-4 h-4" />
          Пользователи
        </TabsTrigger>
        <TabsTrigger value="products" className="flex items-center gap-2">
          <Package className="w-4 h-4" />
          Продукты
        </TabsTrigger>
        <TabsTrigger value="activity" className="flex items-center gap-2">
          <Activity className="w-4 h-4" />
          Активность
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        <OverviewTab 
          revenueStats={revenueStats} 
          analytics={analytics}
          loading={loading}
        />
      </TabsContent>

      <TabsContent value="users">
        <UsersTab 
          userStats={userStats}
          loading={loading}
        />
      </TabsContent>

      <TabsContent value="products">
        <ProductsTab 
          productStats={productStats}
          loading={loading}
        />
      </TabsContent>

      <TabsContent value="activity">
        <ActivityTab 
          analytics={analytics} 
          userStats={userStats}
          loading={loading}
        />
      </TabsContent>
    </Tabs>
  );
}
