// components/manager/analytics/AnalyticsContent.tsx
"use client";

import { useEffect, useState } from 'react';
import { useManager } from '@/contexts/ManagerContext';
import { useAnalyticsData } from '@/hooks/useAnalyticsData';
import AnalyticsHeader from './AnalyticsHeader';
import MetricsGrid from './MetricsGrid';
import RevenueChart from './RevenueChart';
import BookingsChart from './BookingsChart';
import TopTrainers from './TopTrainers';
import PerformanceMetrics from './PerformanceMetrics';
import PeakHours from './PeakHours';
import QuickReports from './QuickReports';
import AdditionalStats from './AdditionalStats';
import AnalyticsLoading from './AnalyticsLoading';
import { ManagerStatsComponent } from '../components/ManagerStatsComponent';

export default function AnalyticsContent() {
  const [timeRange, setTimeRange] = useState('month');
  const [refreshing, setRefreshing] = useState(false);
  const { data: analyticsData, loading } = useAnalyticsData(timeRange);
  const [stats, setStats] = useState(null);

  const handleRefresh = async () => {
    setRefreshing(true);
    const response = await fetch("/api/stats");
    const data = await response.json();
    setStats(data);
    setRefreshing(false);
  };

  useEffect(() => {
    handleRefresh();
  }, [timeRange]);

  if (loading || !analyticsData) {
    return <AnalyticsLoading />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mt-6 mb-10 bg-white/5 backdrop-blur rounded-2xl shadow-sm border border-white/10 px-6 py-4">
        <ManagerStatsComponent stats={stats} />
      </div>
      
      <AnalyticsHeader
        timeRange={timeRange}
        onTimeRangeChange={setTimeRange}
        onRefresh={handleRefresh}
        refreshing={refreshing}
      />


      <MetricsGrid
        revenue={analyticsData.revenue}
        bookings={analyticsData.bookings}
        newClients={analyticsData.newClients}
        satisfaction={analyticsData.satisfaction}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <RevenueChart data={analyticsData.bookings.monthlyData} />
          <BookingsChart data={analyticsData.bookings.monthlyData} />
        </div>

        <div className="space-y-6">
          <TopTrainers trainers={analyticsData.trainers.topTrainers} />
          <PerformanceMetrics data={analyticsData.performance} />
          <PeakHours timeSlots={analyticsData.peakHours.timeSlots} />
          <QuickReports />
        </div>
      </div>

      <AdditionalStats
        averageCheck={analyticsData.additionalStats.averageCheck}
        cancellationRate={analyticsData.additionalStats.cancellationRate}
        responseTime={analyticsData.additionalStats.responseTime}
        repeatBookings={analyticsData.additionalStats.repeatBookings}
      />
    </div>
  );

}
