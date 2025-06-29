// components/manager/bookings/BookingStats.tsx
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Clock, CheckCircle, XCircle, DollarSign } from "lucide-react";

interface BookingStatsProps {
  stats: {
    total: number;
    scheduled: number;
    completed: number;
    cancelled: number;
    revenue: number;
  };
}

export default function BookingStats({ stats }: BookingStatsProps) {
  const statItems = [
    {
      icon: Calendar,
      value: stats.total,
      label: "Всего записей",
      bgColor: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      icon: Clock,
      value: stats.scheduled,
      label: "Запланированных",
      bgColor: "bg-yellow-100",
      iconColor: "text-yellow-600",
    },
    {
      icon: CheckCircle,
      value: stats.completed,
      label: "Завершенных",
      bgColor: "bg-green-100",
      iconColor: "text-green-600",
    },
    {
      icon: XCircle,
      value: stats.cancelled,
      label: "Отмененных",
      bgColor: "bg-red-100",
      iconColor: "text-red-600",
    },
    {
      icon: DollarSign,
      value: `${(stats.revenue / 1000).toFixed(0)}К`,
      label: "Доход (₽)",
      bgColor: "bg-purple-100",
      iconColor: "text-purple-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      {statItems.map((item, index) => {
        const IconComponent = item.icon;
        return (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 ${item.bgColor} rounded-lg flex items-center justify-center`}>
                  <IconComponent className={`h-5 w-5 ${item.iconColor}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{item.value}</p>
                  <p className="text-sm text-gray-600">{item.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
