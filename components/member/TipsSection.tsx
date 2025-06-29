// components/member/TipsSection.tsx
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Target, Heart, Clock, TrendingUp } from "lucide-react";

export default function TipsSection() {
  return (
    <Card className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 border-blue-200 shadow-lg border-0">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          💡 Советы для эффективных тренировок
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div className="flex items-start gap-3 p-3 bg-white/50 rounded-lg">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Target className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-1">
                Регулярность
              </h4>
              <p className="text-gray-600">
                Занимайтесь минимум 3 раза в неделю
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-white/50 rounded-lg">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Heart className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-1">Питание</h4>
              <p className="text-gray-600">
                Правильное питание - 70% успеха
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-white/50 rounded-lg">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Clock className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-1">Отдых</h4>
              <p className="text-gray-600">Давайте мышцам восстановиться</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-white/50 rounded-lg">
            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
              <TrendingUp className="h-4 w-4 text-orange-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-1">Прогресс</h4>
              <p className="text-gray-600">
                Ведите дневник тренировок
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
