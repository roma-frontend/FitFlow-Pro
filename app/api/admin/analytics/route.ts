// app/api/admin/analytics/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // В реальном приложении здесь будут запросы к базе данных
    const analyticsData = {
      users: {
        total: 1234,
        active: 856,
        new: 45,
        growth: 12.5,
        byRole: {
          'super-admin': 2,
          'admin': 5,
          'manager': 12,
          'trainer': 34,
          'member': 1181
        },
        registrationTrend: generateTrendData(7, 20, 60)
      },
      products: {
        total: 156,
        inStock: 134,
        lowStock: 18,
        outOfStock: 4,
        totalValue: 2456780,
        byCategory: {
          supplements: 45,
          drinks: 38,
          snacks: 42,
          merchandise: 31
        },
        salesTrend: generateSalesTrend(7)
      },
      activity: {
        totalSessions: 142,
        averageSessionTime: 1847,
        pageViews: 15678,
        bounceRate: 23.4,
        topPages: [
          { page: '/dashboard', views: 3456 },
          { page: '/products', views: 2789 },
          { page: '/profile', views: 2134 },
          { page: '/training', views: 1876 },
          { page: '/nutrition', views: 1543 }
        ]
      },
      revenue: {
        total: 5678900,
        monthly: 456780,
        growth: 18.7,
        byProduct: [
          { name: 'Протеиновый коктейль', revenue: 125600 },
          { name: 'BCAA комплекс', revenue: 98400 },
          { name: 'Энергетический напиток', revenue: 87300 },
          { name: 'Протеиновый батончик', revenue: 76200 },
          { name: 'Футболка FitAccess', revenue: 69100 }
        ],
        trend: generateRevenueTrend(7)
      }
    };

    return NextResponse.json({
      success: true,
      data: analyticsData
    });
  } catch (error) {
    console.error('Ошибка получения аналитики:', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка загрузки аналитики' },
      { status: 500 }
    );
  }
}

// Вспомогательные функции для генерации тестовых данных
function generateTrendData(days: number, min: number, max: number) {
  const data = [];
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (days - 1 - i));
    data.push({
      date: date.toISOString().split('T')[0],
      count: Math.floor(Math.random() * (max - min + 1)) + min
    });
  }
  return data;
}

function generateSalesTrend(days: number) {
  const data = [];
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (days - 1 - i));
    const sales = Math.floor(Math.random() * 50) + 20;
    data.push({
      date: date.toISOString().split('T')[0],
      sales,
      revenue: sales * (Math.random() * 1000 + 500)
    });
  }
  return data;
}

function generateRevenueTrend(days: number) {
  const data = [];
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (days - 1 - i));
    data.push({
      date: date.toISOString().split('T')[0],
      amount: Math.floor(Math.random() * 50000) + 30000
    });
  }
  return data;
}
