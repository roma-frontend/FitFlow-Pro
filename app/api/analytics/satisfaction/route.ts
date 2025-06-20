// app/api/analytics/satisfaction/route.ts
import { NextResponse } from 'next/server';
import { ConvexHttpClient } from "convex/browser";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const period = searchParams.get('period') || 'month';

  try {
    // В реальном приложении здесь бы были отзывы из базы
    // Пока генерируем на основе количества бронирований
    const bookings = await convex.query("bookings.getAllUserBookings") || [];
    
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

    const periodBookings = bookings.filter((booking: any) => 
      booking.createdAt >= startOfPeriod.getTime()
    );

    // Симулируем распределение оценок на основе завершенных бронирований
    const completedBookings = periodBookings.filter((b: any) => 
      b.status === 'completed'
    ).length;

    const distribution = {
      5: Math.round(completedBookings * 0.65),
      4: Math.round(completedBookings * 0.25),
      3: Math.round(completedBookings * 0.08),
      2: Math.round(completedBookings * 0.02),
      1: 0
    };

    const totalReviews = Object.values(distribution).reduce((sum: number, count: any) => sum + count, 0);
    
    const weightedSum = Object.entries(distribution).reduce((sum, [rating, count]) => 
      sum + (parseInt(rating) * (count as number)), 0
    );
    
    const averageRating = totalReviews > 0 ? weightedSum / totalReviews : 0;

    // Предыдущий период для сравнения
    const previousRating = 4.6; // В реальном приложении считали бы из данных
    const growth = previousRating > 0 ? ((averageRating - previousRating) / previousRating) * 100 : 0;

    return NextResponse.json({
      current: Math.round(averageRating * 10) / 10,
      previous: previousRating,
      growth: Math.round(growth * 10) / 10,
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews,
      distribution
    });

  } catch (error) {
    console.error('Error fetching satisfaction stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch satisfaction statistics' },
      { status: 500 }
    );
  }
}