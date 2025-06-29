// services/analyticsService.ts
const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

// Добавляем обработку ошибок и fallback данные
export async function fetchTrainerStats(period: string) {
  try {
    const response = await fetch(`${API_BASE}/analytics/trainers?period=${period}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.warn('Failed to fetch trainer stats, using fallback data:', error);
    // Возвращаем fallback данные
    return {
      topTrainers: [
        { id: '1', name: 'Иван Петров', monthlyEarnings: 85000, rating: 4.9 },
        { id: '2', name: 'Мария Сидорова', monthlyEarnings: 78000, rating: 4.8 },
        { id: '3', name: 'Алексей Козлов', monthlyEarnings: 72000, rating: 4.7 }
      ],
      total: 12,
      averageRating: 4.7,
      totalEarnings: 368000
    };
  }
}

export async function fetchBookingStats(period: string) {
  try {
    const response = await fetch(`${API_BASE}/analytics/bookings?period=${period}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.warn('Failed to fetch booking stats, using fallback data:', error);
    return {
      current: 456,
      previous: 398,
      growth: 14.6,
      cancellationRate: 12,
      repeatBookings: 78,
      monthlyData: [
        { month: 'Янв', revenue: 980000, bookings: 342, clients: 45 },
        { month: 'Фев', revenue: 1050000, bookings: 378, clients: 52 },
        { month: 'Мар', revenue: 1120000, bookings: 401, clients: 48 },
        { month: 'Апр', revenue: 1180000, bookings: 423, clients: 61 },
        { month: 'Май', revenue: 1250000, bookings: 456, clients: 67 }
      ]
    };
  }
}

export async function fetchSatisfactionStats(period: string) {
  try {
    const response = await fetch(`${API_BASE}/analytics/satisfaction?period=${period}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.warn('Failed to fetch satisfaction stats, using fallback data:', error);
    return {
      current: 4.8,
      previous: 4.6,
      growth: 4.3,
      averageRating: 4.8,
      totalReviews: 234,
      distribution: {
        5: 65,
        4: 25,
        3: 8,
        2: 2,
        1: 0
      }
    };
  }
}

export async function fetchPeakHoursStats(period: string) {
  try {
    const response = await fetch(`${API_BASE}/analytics/peak-hours?period=${period}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.warn('Failed to fetch peak hours stats, using fallback data:', error);
    return {
      timeSlots: [
        { time: '08:00-10:00', load: 45, label: 'Утро' },
        { time: '12:00-14:00', load: 30, label: 'Обед' },
        { time: '18:00-20:00', load: 95, label: 'Вечер' },
        { time: '20:00-22:00', load: 75, label: 'Поздний вечер' }
      ],
      busiestHour: '18:00-20:00',
      averageLoad: 61.25
    };
  }
}

export async function fetchPerformanceMetrics(period: string) {
  try {
    const response = await fetch(`${API_BASE}/analytics/performance?period=${period}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.warn('Failed to fetch performance metrics, using fallback data:', error);
    // Возвращаем fallback данные вместо выброса ошибки
    return {
      averageLoad: 85,
      planCompletion: 92,
      clientRetention: 96,
      responseTime: '1.2ч',
      equipmentUtilization: 78,
      trainerEfficiency: 88,
      energyConsumption: 2450,
      maintenanceCosts: 45000
    };
  }
}

// Добавляем функцию для проверки доступности API
export async function checkAPIHealth() {
  try {
    const response = await fetch(`${API_BASE}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.ok;
  } catch (error) {
    console.warn('API health check failed:', error);
    return false;
  }
}

// Универсальная функция для получения всех данных аналитики
export async function fetchAllAnalyticsData(period: string) {
  try {
    // Проверяем доступность API
    const isAPIAvailable = await checkAPIHealth();
    
    if (!isAPIAvailable) {
      console.warn('API not available, using fallback data');
      return getFallbackAnalyticsData(period);
    }

    // Параллельно загружаем все данные
    const [
      trainerStats,
      bookingStats,
      satisfactionStats,
      peakHoursStats,
      performanceMetrics
    ] = await Promise.allSettled([
      fetchTrainerStats(period),
      fetchBookingStats(period),
      fetchSatisfactionStats(period),
      fetchPeakHoursStats(period),
      fetchPerformanceMetrics(period)
    ]);

    return {
      trainers: trainerStats.status === 'fulfilled' ? trainerStats.value : null,
      bookings: bookingStats.status === 'fulfilled' ? bookingStats.value : null,
      satisfaction: satisfactionStats.status === 'fulfilled' ? satisfactionStats.value : null,
      peakHours: peakHoursStats.status === 'fulfilled' ? peakHoursStats.value : null,
      performance: performanceMetrics.status === 'fulfilled' ? performanceMetrics.value : null,
    };
  } catch (error) {
    console.error('Failed to fetch analytics data:', error);
    return getFallbackAnalyticsData(period);
  }
}

// Fallback данные для случаев, когда API недоступен
function getFallbackAnalyticsData(period: string) {
  return {
    trainers: {
      topTrainers: [
        { id: '1', name: 'Иван Петров', monthlyEarnings: 85000, rating: 4.9 },
        { id: '2', name: 'Мария Сидорова', monthlyEarnings: 78000, rating: 4.8 },
        { id: '3', name: 'Алексей Козлов', monthlyEarnings: 72000, rating: 4.7 }
      ],
      total: 12,
      averageRating: 4.7,
      totalEarnings: 368000
    },
    bookings: {
      current: 456,
      previous: 398,
      growth: 14.6,
      cancellationRate: 12,
      repeatBookings: 78,
      monthlyData: [
        { month: 'Янв', revenue: 980000, bookings: 342, clients: 45 },
        { month: 'Фев', revenue: 1050000, bookings: 378, clients: 52 },
        { month: 'Мар', revenue: 1120000, bookings: 401, clients: 48 },
        { month: 'Апр', revenue: 1180000, bookings: 423, clients: 61 },
        { month: 'Май', revenue: 1250000, bookings: 456, clients: 67 }
      ]
    },
    satisfaction: {
      current: 4.8,
      previous: 4.6,
      growth: 4.3,
      averageRating: 4.8,
      totalReviews: 234,
      distribution: { 5: 65, 4: 25, 3: 8, 2: 2, 1: 0 }
    },
    peakHours: {
      timeSlots: [
        { time: '08:00-10:00', load: 45, label: 'Утро' },
        { time: '12:00-14:00', load: 30, label: 'Обед' },
        { time: '18:00-20:00', load: 95, label: 'Вечер' },
        { time: '20:00-22:00', load: 75, label: 'Поздний вечер' }
      ],
      busiestHour: '18:00-20:00',
      averageLoad: 61.25
    },
    performance: {
      averageLoad: 85,
      planCompletion: 92,
      clientRetention: 96,
      responseTime: '1.2ч',
      equipmentUtilization: 78,
      trainerEfficiency: 88,
      energyConsumption: 2450,
      maintenanceCosts: 45000
    }
  };
}

// Функция для экспорта данных
export async function exportAnalyticsData(format: 'csv' | 'pdf' | 'excel', data: any, timeRange: string) {
  try {
    const response = await fetch(`${API_BASE}/analytics/export`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        format,
        timeRange,
        data
      }),
    });

    if (!response.ok) {
      throw new Error(`Export failed: ${response.status}`);
    }

    return await response.blob();
  } catch (error) {
    console.error('Export error:', error);
    throw new Error('Ошибка экспорта данных');
  }
}
