"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

interface KeyMetricsProps {
  userRole: string;
}

export function KeyMetrics({ userRole }: KeyMetricsProps) {
  if (userRole !== "admin" && userRole !== "super-admin") {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-green-500" />
          Ключевые метрики
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">₽847,230</div>
            <div className="text-sm text-gray-600">Выручка за месяц</div>
            <div className="text-xs text-green-600 mt-1">+18% к прошлому месяцу</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">456</div>
            <div className="text-sm text-gray-600">Активные клиенты</div>
            <div className="text-xs text-blue-600 mt-1">+12 за неделю</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 mb-1">89%</div>
            <div className="text-sm text-gray-600">Удержание клиентов</div>
            <div className="text-xs text-purple-600 mt-1">+3% к цели</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600 mb-1">4.8</div>
            <div className="text-sm text-gray-600">Средний рейтинг</div>
            <div className="text-xs text-orange-600 mt-1">+0.2 за месяц</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
