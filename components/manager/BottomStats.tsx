import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, UserCheck, Star } from "lucide-react";
import type { ManagerStats } from "@/contexts/ManagerContext";

interface BottomStatsProps {
  stats: ManagerStats;
}

const BottomStats: React.FC<BottomStatsProps> = ({ stats }) => {
  return (
    <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Завершенных тренировок
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.completedSessions}
              </p>
              <p className="text-xs text-gray-500">За текущий месяц</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Новых клиентов
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.newClients}
              </p>
              <p className="text-xs text-gray-500">За последние 30 дней</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <UserCheck className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Общий рейтинг
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.averageRating.toFixed(1)}
              </p>
              <p className="text-xs text-gray-500">
                Средний по всем тренерам
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Star className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BottomStats;
