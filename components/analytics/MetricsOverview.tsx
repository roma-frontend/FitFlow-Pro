"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Package,
  TrendingUp,
  ShoppingCart,
  DollarSign,
  AlertTriangle,
  XCircle
} from "lucide-react";

interface MetricsOverviewProps {
  userStats: any;
  productStats: any;
  revenueStats: any;
  loading?: boolean;
}

export function MetricsOverview({ userStats, productStats, revenueStats, loading }: MetricsOverviewProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="w-16 h-8 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="w-20 h-3 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="w-24 h-6 bg-gray-200 rounded animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Пользователи */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Всего пользователей</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {(userStats?.total || 0).toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">
            Активных: {(userStats?.active || 0).toLocaleString()}
          </p>
          <div className="flex items-center mt-2">
            <Badge
              variant={userStats?.activityRate > 0.7 ? "default" : "secondary"}
              className="text-xs"
            >
              {((userStats?.activityRate || 0) * 100).toFixed(1)}% активность
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Продукты */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Продукты</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{productStats?.total || 0}</div>
          <p className="text-xs text-muted-foreground">
            В наличии: {productStats?.inStock || 0}
          </p>
          <div className="flex items-center gap-2 mt-2">
            {(productStats?.lowStock || 0) > 0 && (
              <Badge variant="destructive" className="text-xs">
                <AlertTriangle className="w-3 h-3 mr-1" />
                {productStats?.lowStock} заканчивается
              </Badge>
            )}
            {(productStats?.outOfStock || 0) > 0 && (
              <Badge variant="outline" className="text-xs">
                <XCircle className="w-3 h-3 mr-1" />
                {productStats?.outOfStock} нет в наличии
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Выручка */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Выручка</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ₽{(revenueStats?.total || 0).toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">
            Рост: {(revenueStats?.growth || 0) > 0 ? "+" : ""}
            {(revenueStats?.growth || 0).toFixed(1)}%
          </p>
          <div className="flex items-center mt-2">
            <Badge
              variant={(revenueStats?.growth || 0) > 0 ? "default" : "secondary"}
              className="text-xs"
            >
              {(revenueStats?.growth || 0) > 0 ? (
                <TrendingUp className="w-3 h-3 mr-1" />
              ) : (
                <TrendingUp className="w-3 h-3 mr-1 rotate-180" />
              )}
              {Math.abs(revenueStats?.growth || 0).toFixed(1)}%
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Заказы */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Заказы</CardTitle>
          <ShoppingCart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {revenueStats?.ordersCount || 0}
          </div>
          <p className="text-xs text-muted-foreground">
            Средний чек: ₽{Math.round(revenueStats?.averageOrderValue || 0).toLocaleString()}
          </p>
          <div className="flex items-center mt-2">
            <Badge variant="outline" className="text-xs text-blue-500">
              <DollarSign className="w-3 h-3 mr-1" />₽
              {Math.round((revenueStats?.total || 0) / (revenueStats?.ordersCount || 1)).toLocaleString()} за заказ
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
