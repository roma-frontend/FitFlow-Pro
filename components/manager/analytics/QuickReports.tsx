// components/manager/analytics/QuickReports.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, DollarSign, Users, Target, BarChart3 } from "lucide-react";
import { useRouter } from 'next/navigation';

export default function QuickReports() {
  const router = useRouter();

  const reports = [
    {
      title: 'Финансовый отчет',
      icon: DollarSign,
      path: '/manager/reports/financial'
    },
    {
      title: 'Отчет по тренерам',
      icon: Users,
      path: '/manager/reports/trainers'
    },
    {
      title: 'Отчет по клиентам',
      icon: Target,
      path: '/manager/reports/clients'
    },
    {
      title: 'Настроить отчет',
      icon: BarChart3,
      path: '/manager/reports/custom'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Отчеты
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {reports.map((report, index) => {
          const IconComponent = report.icon;
          return (
            <Button
              key={index}
              variant="outline"
              className="w-full justify-start"
              onClick={() => router.push(report.path)}
            >
              <IconComponent className="mr-2 h-4 w-4" />
              {report.title}
            </Button>
          );
        })}
      </CardContent>
    </Card>
  );
}

