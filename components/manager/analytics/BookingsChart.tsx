// components/manager/analytics/BookingsChart.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";

interface MonthlyData {
  month: string;
  revenue: number;
  bookings: number;
  clients: number;
}

interface BookingsChartProps {
  data: MonthlyData[];
}

export default function BookingsChart({ data }: BookingsChartProps) {
  const maxBookings = Math.max(...data.map(d => d.bookings));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Количество записей
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 flex items-end justify-between gap-2 p-4">
          {data.map((item, index) => (
            <div key={index} className="flex flex-col items-center flex-1">
              <div 
                className="w-full bg-green-500 rounded-t transition-all duration-300 hover:bg-green-600"
                style={{ 
                  height: `${(item.bookings / maxBookings) * 200}px`,
                  minHeight: '20px'
                }}
              ></div>
              <span className="text-xs text-gray-600 mt-2">{item.month}</span>
            </div>
          ))}
        </div>
        <div className="text-center text-sm text-gray-600 mt-4">
          Количество записей по месяцам
        </div>
      </CardContent>
    </Card>
  );
}
