// app/api/analytics/activity/route.ts
import { NextResponse } from 'next/server';
import { api } from "@/convex/_generated/api";
import { fetchQuery } from "convex/nextjs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const period = searchParams.get('period') || 'month';

  try {
    // Получаем данные о пользователях и их активности
    const users = await fetchQuery(api.users.getAll) || [];
    const bookings = await fetchQuery(api.bookings.getAllUserBookings) || [];
    
    // Фильтруем по периоду
    const now = new Date();
    const startOfPeriod = new Date();
    
    if (period === 'week') {
      startOfPeriod.setDate(now.getDate() - 7);
    } else if (period === 'month') {
      startOfPeriod.setMonth(now.getMonth() - 1);
    } else if (period === 'year') {
      startOfPeriod.setFullYear(now.getFullYear() - 1);
    }

    // Подсчитываем сессии (бронирования) за период
    const periodBookings = bookings.filter((booking: any) => 
      booking.createdAt >= startOfPeriod.getTime()
    );

    // Симулируем данные о страницах (в реальном приложении это бы трекалось)
    const pageViews = periodBookings.length * 28; // В среднем 28 просмотров на сессию
    const bounceRate = 0.35; // 35% bounce rate
    const averageSessionTime = 1800; // 30 минут в секундах

    // Топ страниц (симуляция на основе реальных данных)
    const topPages = [
      { page: '/dashboard', views: Math.round(pageViews * 0.18) },
      { page: '/products', views: Math.round(pageViews * 0.15) },
      { page: '/analytics', views: Math.round(pageViews * 0.12) },
      { page: '/orders', views: Math.round(pageViews * 0.09) },
      { page: '/users', views: Math.round(pageViews * 0.07) },
      { page: '/schedule', views: Math.round(pageViews * 0.06) }
    ];

    const data = {
      totalSessions: periodBookings.length,
      averageSessionTime,
      pageViews,
      bounceRate,
      topPages
    };

    return NextResponse.json({ success: true, data });

  } catch (error) {
    console.error('Error fetching activity stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch activity statistics' },
      { status: 500 }
    );
  }
}