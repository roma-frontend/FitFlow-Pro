// components/manager/analytics/MetricsGrid.tsx
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, Calendar, Users, Star } from "lucide-react";

interface Metric {
  title: string;
  value: string;
  change: number;
  icon: any;
  color: 'green' | 'blue' | 'purple' | 'orange';
}

interface MetricsGridProps {
  revenue: { current: number; growth: number };
  bookings: { current: number; growth: number };
  newClients: { current: number; growth: number };
  satisfaction: { current: number; growth: number };
}

export default function MetricsGrid({ revenue, bookings, newClients, satisfaction }: MetricsGridProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getGrowthColor = (growth: number) => {
    return growth >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const getGrowthIcon = (growth: number) => {
    return growth >= 0 ? TrendingUp : TrendingDown;
  };

  const metrics: Metric[] = [
    {
      title: 'Доход',
      value: formatCurrency(revenue.current),
      change: revenue.growth,
      icon: DollarSign,
      color: 'green'
    },
    {
      title: 'Записи',
      value: bookings.current.toString(),
      change: bookings.growth,
      icon: Calendar,
      color: 'blue'
    },
    {
      title: 'Новые клиенты',
      value: newClients.current.toString(),
      change: newClients.growth,
      icon: Users,
      color: 'purple'
    },
    {
      title: 'Удовлетворенность',
      value: satisfaction.current.toFixed(1),
      change: satisfaction.growth,
      icon: Star,
      color: 'orange'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {metrics.map((metric, index) => {
        const IconComponent = metric.icon;
        const GrowthIcon = getGrowthIcon(metric.change);
        
        return (
          <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {metric.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mb-2">
                    {metric.value}
                  </p>
                  <div className="flex items-center gap-1">
                    <GrowthIcon className={`h-4 w-4 ${getGrowthColor(metric.change)}`} />
                    <span className={`text-sm font-medium ${getGrowthColor(metric.change)}`}>
                      {metric.change > 0 ? '+' : ''}{metric.change.toFixed(1)}%
                    </span>
                    <span className="text-xs text-gray-500 ml-1">
                      vs прошлый период
                    </span>
                  </div>
                </div>
                
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  metric.color === 'green' ? 'bg-green-100' :
                  metric.color === 'blue' ? 'bg-blue-100' :
                  metric.color === 'purple' ? 'bg-purple-100' : 'bg-orange-100'
                }`}>
                  <IconComponent className={`h-6 w-6 ${
                    metric.color === 'green' ? 'text-green-600' :
                    metric.color === 'blue' ? 'text-blue-600' :
                    metric.color === 'purple' ? 'text-purple-600' : 'text-orange-600'
                  }`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
