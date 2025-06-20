"use client";

import React, { useState } from "react";
import { useAnalyticsData } from "@/hooks/useAnalyticsData";
import { useAnalyticsAvailability } from "@/hooks/useAnalytics";

// Импорт компонентов
import { AnalyticsHeader } from "@/components/analytics/AnalyticsHeader";
import { DemoModeAlert } from "@/components/analytics/DemoModeAlert";
import { MetricsOverview } from "@/components/analytics/MetricsOverview";
import { AnalyticsTabs } from "@/components/analytics/AnalyticsTabs";
import { QuickActions } from "@/components/analytics/QuickActions";
import { SummaryAndRecommendations } from "@/components/analytics/SummaryAndRecommendations";
import { LoadingSpinner } from "@/components/analytics/LoadingSpinner";

export default function AnalyticsPage() {
  const [period, setPeriod] = useState("month");
  const [activeTab, setActiveTab] = useState("overview");

  // Получаем данные используя ваш рабочий хук
  const { data, loading, users, products, revenue, activity, isAvailable } = useAnalyticsData(period);
  const { isLoading: availabilityLoading } = useAnalyticsAvailability();

  // Показываем загрузку только если загружается доступность
  if (availabilityLoading) {
    return <LoadingSpinner size="lg" text="Проверка доступности аналитики..." />;
  }

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <AnalyticsHeader
        period={period}
        setPeriod={setPeriod}
        isAvailable={isAvailable}
      />

      {/* Предупреждение о тестовых данных */}
      <DemoModeAlert isAvailable={isAvailable} />

      {/* Основные метрики */}
      <MetricsOverview
        userStats={data?.users}
        productStats={data?.products}
        revenueStats={data?.revenue}
        loading={loading}
      />

      {/* Табы для детальной аналитики */}
      <AnalyticsTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        analytics={data}
        userStats={data?.users}
        productStats={data?.products}
        revenueStats={data?.revenue}
        loading={loading}
      />

      {/* Дополнительные быстрые действия */}
      <QuickActions />

      {/* Сводка и рекомендации - показываем только если данные загружены */}
      {!loading && data && (
        <SummaryAndRecommendations
          userStats={data.users}
          productStats={data.products}
          revenueStats={data.revenue}
          analytics={data}
        />
      )}
    </div>
  );
}
