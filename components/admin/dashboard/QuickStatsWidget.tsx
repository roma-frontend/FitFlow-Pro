"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

interface QuickStatsWidgetProps {
  userRole: string;
}

export function QuickStatsWidget({ userRole }: QuickStatsWidgetProps) {
  const getStats = () => {
    switch (userRole) {
      case 'super-admin':
        return [
          { label: 'Общее время работы', value: '99.8%', color: 'text-green-600' },
          { label: 'Активные сессии', value: '89', color: 'text-blue-600' },
          { label: 'Ошибки за день', value: '2', color: 'text-red-600' },
        ];
      case 'admin':
        return [
          { label: 'Активные абонементы', value: '456', color: 'text-green-600' },
          { label: 'Истекают в этом месяце', value: '23', color: 'text-orange-600' },
          { label: 'Средний чек', value: '₽2,500', color: 'text-blue-600' },
        ];
      case 'manager':
        return [
          { label: 'Тренеров в смене', value: '8', color: 'text-green-600' },
          { label: 'Свободных залов', value: '2', color: 'text-blue-600' },
          { label: 'Заявки на сегодня', value: '15', color: 'text-purple-600' },
        ];
      case 'trainer':
        return [
          { label: 'Тренировок на неделе', value: '28', color: 'text-green-600' },
          { label: 'Новых клиентов', value: '3', color: 'text-blue-600' },
          { label: 'Доход за неделю', value: '₽42,000', color: 'text-purple-600' },
        ];
      default:
        return [
          { label: 'Дней до окончания', value: '18', color: 'text-green-600' },
          { label: 'Калорий сожжено', value: '4,200', color: 'text-red-600' },
          { label: 'Достижений', value: '12', color: 'text-yellow-600' },
        ];
    }
  };

  const stats = getStats();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-purple-500" />
          Быстрая статистика
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {stats.map((stat, index) => (
            <div key={index} className="flex justify-between items-center">
              <span className="text-sm text-gray-600">{stat.label}</span>
              <span className={`font-semibold ${stat.color}`}>{stat.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
