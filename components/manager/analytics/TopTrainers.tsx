// components/manager/analytics/TopTrainers.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, Star } from "lucide-react";

interface Trainer {
  id: string;
  name: string;
  monthlyEarnings: number;
  rating: number;
}

interface TopTrainersProps {
  trainers: Trainer[];
}

export default function TopTrainers({ trainers }: TopTrainersProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5" />
          Топ тренеры
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {trainers.map((trainer, index) => (
            <div key={trainer.id} className="flex items-center gap-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                index === 0 ? 'bg-yellow-100 text-yellow-800' :
                index === 1 ? 'bg-gray-100 text-gray-800' :
                'bg-orange-100 text-orange-800'
              }`}>
                {index + 1}
              </div>
              
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {trainer.name}
                </p>
                <p className="text-xs text-gray-500">
                  {formatCurrency(trainer.monthlyEarnings)}
                </p>
              </div>
              
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 text-yellow-500" />
                <span className="text-xs font-medium">{trainer.rating}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
