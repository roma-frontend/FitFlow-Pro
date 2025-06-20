// components/manager/analytics/AdditionalStats.tsx
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, Calendar, Clock, Users } from "lucide-react";

interface StatItem {
  title: string;
  value: string;
  change: number;
  changeLabel: string;
  icon: any;
  iconColor: string;
  iconBg: string;
}

interface AdditionalStatsProps {
  averageCheck: number;
  cancellationRate: number;
  responseTime: string;
  repeatBookings: number;
}

export default function AdditionalStats({ 
  averageCheck, 
  cancellationRate, 
  responseTime, 
  repeatBookings 
}: AdditionalStatsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const stats: StatItem[] = [
    {
      title: 'Средний чек',
      value: formatCurrency(averageCheck),
      change: 8.2,
      changeLabel: '+8.2%',
      icon: DollarSign,
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-100'
    },
    {
      title: 'Отмены записей',
      value: `${cancellationRate}%`,
      change: -2.1,
      changeLabel: '-2.1%',
      icon: Calendar,
      iconColor: 'text-red-600',
      iconBg: 'bg-red-100'
    },
    {
      title: 'Время отклика',
      value: responseTime,
      change: -15,
      changeLabel: '-15min',
      icon: Clock,
      iconColor: 'text-yellow-600',
      iconBg: 'bg-yellow-100'
    },
    {
      title: 'Повторные записи',
      value: `${repeatBookings}%`,
      change: 5.3,
      changeLabel: '+5.3%',
      icon: Users,
      iconColor: 'text-green-600',
      iconBg: 'bg-green-100'
    }
  ];

  return (
    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
        const IconComponent = stat.icon;
        const TrendIcon = stat.change >= 0 ? TrendingUp : TrendingDown;
        const trendColor = stat.change >= 0 ? 'text-green-500' : 'text-red-500';
        
        return (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendIcon className={`h-3 w-3 ${trendColor}`} />
                    <span className={`text-xs ${trendColor}`}>
                      {stat.changeLabel}
                    </span>
                  </div>
                </div>
                <div className={`w-12 h-12 ${stat.iconBg} rounded-lg flex items-center justify-center`}>
                  <IconComponent className={`h-6 w-6 ${stat.iconColor}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
