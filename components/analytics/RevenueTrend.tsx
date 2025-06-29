"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

interface RevenueTrendProps {
  data: Array<{ date: string; amount: number }>;
  loading?: boolean; // Добавляем параметр loading
}

export function RevenueTrend({ data, loading }: RevenueTrendProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Выручка за неделю
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex justify-between items-center">
                  <div className="w-16 h-4 bg-gray-200 rounded"></div>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-2 bg-gray-200 rounded-full"></div>
                    <div className="w-16 h-4 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const maxAmount = data && data.length > 0 ? Math.max(...data.map(item => item.amount)) : 1;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Выручка за неделю
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data && data.length > 0 ? (
            data.map((item, index) => (
              <div
                key={`revenue-${index}`}
                className="flex justify-between items-center"
              >
                <span className="text-sm">
                  {new Date(item.date).toLocaleDateString("ru-RU", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-muted rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{
                        width: `${maxAmount > 0 ? (item.amount / maxAmount) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <span className="font-medium text-sm">
                    ₽{item.amount.toLocaleString()}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground text-center py-4">
              Нет данных о выручке
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
