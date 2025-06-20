// app/api/analytics/revenue/route.ts
import { NextResponse } from 'next/server';
import { api } from "@/convex/_generated/api";
import { fetchQuery } from "convex/nextjs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const period = searchParams.get('period') || 'month';

  try {
    // Получаем бронирования для расчета доходов
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

    // Текущий период
    const periodBookings = bookings.filter((booking: any) => 
      booking.createdAt >= startOfPeriod.getTime() &&
      booking.status !== 'cancelled'
    );

    // Предыдущий период
    const previousStart = new Date(startOfPeriod);
    const previousEnd = new Date(startOfPeriod);
    
    if (period === 'week') {
      previousStart.setDate(previousStart.getDate() - 7);
    } else if (period === 'month') {
      previousStart.setMonth(previousStart.getMonth() - 1);
    } else if (period === 'year') {
      previousStart.setFullYear(previousStart.getFullYear() - 1);
    }

    const previousBookings = bookings.filter((booking: any) => 
      booking.createdAt >= previousStart.getTime() && 
      booking.createdAt < previousEnd.getTime() &&
      booking.status !== 'cancelled'
    );

    // Расчет доходов
    const total = periodBookings.reduce((sum: number, booking: any) => 
      sum + (booking.price || 0), 0
    );
    
    const previousTotal = previousBookings.reduce((sum: number, booking: any) => 
      sum + (booking.price || 0), 0
    );

    const growth = previousTotal > 0 
      ? ((total - previousTotal) / previousTotal) * 100 
      : 0;

    const averageOrderValue = periodBookings.length > 0 
      ? total / periodBookings.length 
      : 0;

    // Топ услуг по типам тренировок
    const workoutTypes: any = {};
    periodBookings.forEach((booking: any) => {
      const type = booking.workoutType || 'Общая тренировка';
      if (!workoutTypes[type]) {
        workoutTypes[type] = { name: type, revenue: 0, count: 0 };
      }
      workoutTypes[type].revenue += booking.price || 0;
      workoutTypes[type].count += 1;
    });

    const topProducts = Object.values(workoutTypes)
      .sort((a: any, b: any) => b.revenue - a.revenue)
      .slice(0, 6)
      .map((item: any) => ({
        name: item.name,
        revenue: Math.round(item.revenue)
      }));

    // Дневной тренд
    const dailyStats: any = {};
    periodBookings.forEach((booking: any) => {
      const date = new Date(booking.createdAt).toISOString().split('T')[0];
      if (!dailyStats[date]) {
        dailyStats[date] = { amount: 0, orders: 0 };
      }
      dailyStats[date].amount += booking.price || 0;
      dailyStats[date].orders += 1;
    });

    const dailyTrend = Object.entries(dailyStats)
      .map(([date, stats]: [string, any]) => ({
        date,
        amount: Math.round(stats.amount),
        orders: stats.orders
      }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-30); // Последние 30 дней

    const data = {
      total: Math.round(total),
      growth: Math.round(growth * 10) / 10,
      ordersCount: periodBookings.length,
      averageOrderValue: Math.round(averageOrderValue),
      topProducts,
      dailyTrend,
      previousPeriod: {
        revenue: Math.round(previousTotal),
        ordersCount: previousBookings.length
      }
    };

    return NextResponse.json({ success: true, data });

  } catch (error) {
    console.error('Error fetching revenue stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch revenue statistics' },
      { status: 500 }
    );
  }
}