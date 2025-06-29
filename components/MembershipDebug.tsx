// components/MembershipDebug.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Info } from 'lucide-react';

interface MembershipDebugProps {
  plans: any[];
  isLoadingPlans: boolean;
  error: string | null | undefined;
}

export function MembershipDebug({ plans, isLoadingPlans, error }: MembershipDebugProps) {
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <Card className="border-yellow-200 bg-yellow-50 mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-yellow-800">
          <Info className="h-5 w-5" />
          Debug информация (только в dev)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold">Статус загрузки:</span>
          <Badge variant={isLoadingPlans ? "default" : "secondary"}>
            {isLoadingPlans ? "Загрузка..." : "Загружено"}
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="font-semibold">Количество планов:</span>
          <Badge variant={plans.length > 0 ? "special" : "destructive"}>
            {plans.length}
          </Badge>
        </div>
        
        {error && (
          <div className="text-red-600">
            <span className="font-semibold">Ошибка:</span> {error}
          </div>
        )}
        
        {plans.length > 0 && (
          <div className="mt-4">
            <p className="font-semibold mb-2">Загруженные планы:</p>
            <div className="space-y-1">
              {plans.map((plan, index) => (
                <div key={index} className="text-sm bg-white p-2 rounded">
                  <span className="font-medium">{plan.name}</span>
                  <span className="text-gray-600 ml-2">
                    (type: {plan.type}, id: {plan._id})
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {plans.length === 0 && !isLoadingPlans && (
          <div className="bg-red-100 text-red-800 p-3 rounded mt-2">
            <p className="font-semibold">⚠️ Планы не найдены в базе данных!</p>
            <p className="text-sm mt-1">
              Перейдите на страницу <code className="bg-red-200 px-1 rounded">/admin/seed-plans</code> для добавления планов.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}