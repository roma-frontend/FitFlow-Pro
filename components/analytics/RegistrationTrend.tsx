"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart } from "lucide-react";

interface RegistrationTrendProps {
  data: Array<{ date: string; count: number }>;
  loading?: boolean;
}

export function RegistrationTrend({ data, loading }: RegistrationTrendProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LineChart className="w-5 h-5" />
            Регистрации за неделю
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
                    <div className="w-8 h-4 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const maxCount = data && data.length > 0 ? Math.max(...data.map(item => item.count)) : 1;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LineChart className="w-5 h-5" />
          Регистрации за неделю
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data && data.length > 0 ? (
            data.map((item, index) => (
              <div
                key={`reg-${index}`}
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
                      className="bg-primary h-2 rounded-full"
                      style={{
                        width: `${(item.count / maxCount) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="font-medium text-sm w-8">
                    {item.count}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground text-center py-4">
              Нет данных о регистрациях
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
