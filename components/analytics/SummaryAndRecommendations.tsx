"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, AlertTriangle } from "lucide-react";

interface SummaryAndRecommendationsProps {
  userStats: any;
  productStats: any;
  revenueStats: any;
  analytics: any;
}

export function SummaryAndRecommendations({
  userStats,
  productStats,
  revenueStats,
  analytics,
}: SummaryAndRecommendationsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          Сводка и рекомендации
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h4 className="font-medium text-green-600">
              Положительные тенденции
            </h4>
            <div className="space-y-2">
              {(revenueStats?.growth || 0) > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>
                    Рост выручки на {(revenueStats?.growth || 0).toFixed(1)}%
                  </span>
                </div>
              )}
              {(userStats?.activityRate || 0) > 0.7 && (
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>
                    Высокая активность пользователей (
                    {((userStats?.activityRate || 0) * 100).toFixed(1)}%)
                  </span>
                </div>
              )}
              {(productStats?.outOfStock || 0) === 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Нет товаров без остатков на складе</span>
                </div>
              )}
              {(analytics?.activity?.bounceRate || 0) < 0.4 && (
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>
                    Низкий показатель отказов (
                    {((analytics?.activity?.bounceRate || 0) * 100).toFixed(1)}
                    %)
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium text-orange-600">
              Области для улучшения
            </h4>
            <div className="space-y-2">
              {(productStats?.lowStock || 0) > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <AlertTriangle className="w-4 h-4 text-orange-500" />
                  <span>
                    Пополнить {productStats?.lowStock} товаров с низкими
                    остатками
                  </span>
                </div>
              )}
              {(revenueStats?.growth || 0) < 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <AlertTriangle className="w-4 h-4 text-orange-500" />
                  <span>
                    Снижение выручки на{" "}
                    {Math.abs(revenueStats?.growth || 0).toFixed(1)}%
                  </span>
                </div>
              )}
              {(userStats?.activityRate || 0) < 0.5 && (
                <div className="flex items-center gap-2 text-sm">
                  <AlertTriangle className="w-4 h-4 text-orange-500" />
                  <span>
                    Низкая активность пользователей (
                    {((userStats?.activityRate || 0) * 100).toFixed(1)}%)
                  </span>
                </div>
              )}
              {(analytics?.activity?.bounceRate || 0) > 0.6 && (
                <div className="flex items-center gap-2 text-sm">
                  <AlertTriangle className="w-4 h-4 text-orange-500" />
                  <span>
                    Высокий показатель отказов (
                    {((analytics?.activity?.bounceRate || 0) * 100).toFixed(1)}
                    %)
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">💡 Рекомендации</h4>
          <div className="space-y-1 text-sm text-blue-700">
            <p>
              • Настройте автоматические уведомления о низких остатках товаров
            </p>
            <p>
              • Проанализируйте популярные страницы для улучшения
              пользовательского опыта
            </p>
            <p>
              • Рассмотрите возможность персонализации контента для повышения
              вовлеченности
            </p>
            <p>• Регулярно экспортируйте данные для более глубокого анализа</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
