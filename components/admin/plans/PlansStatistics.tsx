// components/PlansStatistics.tsx
import React, { memo } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Package, Activity, CreditCard } from "lucide-react";
import type { MembershipPlan } from '@/hooks/usePlans';

interface PlansStatisticsProps {
  plans: MembershipPlan[];
}

export const PlansStatistics = memo<PlansStatisticsProps>(({ plans }) => {
  const stats = {
    total: plans.length,
    active: plans.filter(p => p.isActive).length,
    monthly: plans.filter(p => p.duration === 30).length,
    yearly: plans.filter(p => p.duration === 365).length,
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between space-x-4">
            <div className="flex flex-col">
              <p className="text-sm font-medium text-muted-foreground">Всего планов</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <Package className="h-8 w-8 text-blue-600 opacity-20" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between space-x-4">
            <div className="flex flex-col">
              <p className="text-sm font-medium text-muted-foreground">Активные</p>
              <p className="text-2xl font-bold text-green-600">{stats.active}</p>
            </div>
            <Activity className="h-8 w-8 text-green-600 opacity-20" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between space-x-4">
            <div className="flex flex-col">
              <p className="text-sm font-medium text-muted-foreground">Месячные</p>
              <p className="text-2xl font-bold text-blue-600">{stats.monthly}</p>
            </div>
            <CreditCard className="h-8 w-8 text-blue-600 opacity-20" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between space-x-4">
            <div className="flex flex-col">
              <p className="text-sm font-medium text-muted-foreground">Годовые</p>
              <p className="text-2xl font-bold text-purple-600">{stats.yearly}</p>
            </div>
            <CreditCard className="h-8 w-8 text-purple-600 opacity-20" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

PlansStatistics.displayName = 'PlansStatistics';