// components/manager/analytics/PerformanceMetrics.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target } from "lucide-react";

interface PerformanceData {
  averageLoad: number;
  planCompletion: number;
  clientRetention: number;
}

interface PerformanceMetricsProps {
  data: PerformanceData;
}

export default function PerformanceMetrics({ data }: PerformanceMetricsProps) {
  const metrics = [
    { label: 'Средняя загрузка', value: data.averageLoad, color: 'bg-blue-600' },
    { label: 'Выполнение плана', value: data.planCompletion, color: 'bg-green-600' },
    { label: 'Удержание клиентов', value: data.clientRetention, color: 'bg-purple-600' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Эффективность
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {metrics.map((metric, index) => (
          <div key={index} className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">{metric.label}</span>
              <span className="text-sm font-medium">{metric.value}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`${metric.color} h-2 rounded-full`} 
                style={{ width: `${metric.value}%` }}
              ></div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
