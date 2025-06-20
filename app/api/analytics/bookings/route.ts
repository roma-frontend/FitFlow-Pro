// app/api/analytics/bookings/route.ts
import { NextResponse } from 'next/server';
import { api } from "@/convex/_generated/api";
import { fetchQuery } from "convex/nextjs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const period = searchParams.get('period') || 'month';

  try {
    // Получаем все бронирования из Convex
    const bookings = await fetchQuery(api.bookings.getAllUserBookings) || [];
    
    // Получаем текущую дату для фильтрации
    const now = new Date();
    const startOfPeriod = new Date();
    
    if (period === 'week') {
      startOfPeriod.setDate(now.getDate() - 7);
    } else if (period === 'month') {
      startOfPeriod.setMonth(now.getMonth() - 1);
    } else if (period === 'year') {
      startOfPeriod.setFullYear(now.getFullYear() - 1);
    }

    // Фильтруем бронирования за период
    const periodBookings = bookings.filter((booking: any) => 
      booking.createdAt >= startOfPeriod.getTime()
    );

    // Предыдущий период для сравнения
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
      booking.createdAt < previousEnd.getTime()
    );

    // Подсчитываем статистику
    const current = periodBookings.length;
    const previous = previousBookings.length;
    const growth = previous > 0 ? ((current - previous) / previous) * 100 : 0;

    // Подсчет отмененных бронирований
    const cancelledCount = periodBookings.filter((b: any) => 
      b.status === 'cancelled'
    ).length;
    const cancellationRate = current > 0 ? (cancelledCount / current) * 100 : 0;

    // Подсчет повторных клиентов
    const userBookingCounts = periodBookings.reduce((acc: any, booking: any) => {
      const userId = booking.userId || booking.memberId;
      acc[userId] = (acc[userId] || 0) + 1;
      return acc;
    }, {});
    
    const repeatUsers = Object.values(userBookingCounts).filter((count: any) => count > 1).length;
    const repeatBookings = Object.keys(userBookingCounts).length > 0 
      ? (repeatUsers / Object.keys(userBookingCounts).length) * 100 
      : 0;

    // Группируем по месяцам для графика
    const monthlyData = getMonthlyData(periodBookings, period);

    return NextResponse.json({
      current,
      previous,
      growth: Math.round(growth * 10) / 10,
      cancellationRate: Math.round(cancellationRate),
      repeatBookings: Math.round(repeatBookings),
      monthlyData
    });

  } catch (error) {
    console.error('Error fetching booking stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch booking statistics' },
      { status: 500 }
    );
  }
}

function getMonthlyData(bookings: any[], period: string) {
  const months = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
  const monthlyStats: any = {};

  bookings.forEach((booking: any) => {
    const date = new Date(booking.createdAt);
    const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
    
    if (!monthlyStats[monthKey]) {
      monthlyStats[monthKey] = {
        month: months[date.getMonth()],
        revenue: 0,
        bookings: 0,
        clients: new Set()
      };
    }
    
    monthlyStats[monthKey].revenue += booking.price || 0;
    monthlyStats[monthKey].bookings += 1;
    monthlyStats[monthKey].clients.add(booking.userId || booking.memberId);
  });

  // Преобразуем в массив и сортируем
  return Object.entries(monthlyStats)
    .map(([key, stats]: [string, any]) => ({
      month: stats.month,
      revenue: Math.round(stats.revenue),
      bookings: stats.bookings,
      clients: stats.clients.size
    }))
    .sort((a, b) => {
      const [yearA, monthA] = a.month.split('-').map(Number);
      const [yearB, monthB] = b.month.split('-').map(Number);
      return yearA !== yearB ? yearA - yearB : monthA - monthB;
    })
    .slice(-5); // Последние 5 месяцев
}