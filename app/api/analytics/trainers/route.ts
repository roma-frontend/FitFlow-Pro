// app/api/analytics/trainers/route.ts
import { NextResponse } from 'next/server';
import { api } from "@/convex/_generated/api";
import { fetchQuery } from "convex/nextjs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const period = searchParams.get('period') || 'month';
  const trainerId = searchParams.get('trainerId');

  try {
    // Получаем всех тренеров
    const trainers = await fetchQuery(api.users.getTrainers) || [];
    
    // Получаем все бронирования
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

    // Подсчитываем статистику для каждого тренера
    const trainerStats = trainers.map((trainer: any) => {
      const trainerBookings = bookings.filter((booking: any) => 
        booking.trainerId === trainer.id && 
        booking.createdAt >= startOfPeriod.getTime() &&
        booking.status !== 'cancelled'
      );

      const monthlyEarnings = trainerBookings.reduce((sum: number, booking: any) => 
        sum + (booking.price || 0), 0
      );

      // Подсчет рейтинга (пока случайный, можно связать с реальными отзывами)
      const rating = 4.5 + Math.random() * 0.5;

      return {
        id: trainer.id,
        name: trainer.name,
        monthlyEarnings: Math.round(monthlyEarnings),
        rating: Math.round(rating * 10) / 10,
        sessionsCount: trainerBookings.length
      };
    });

    // Сортируем по доходам
    const topTrainers = trainerStats
      .sort((a: any, b: any) => b.monthlyEarnings - a.monthlyEarnings)
      .slice(0, 10);

    // Общая статистика
    const totalEarnings = trainerStats.reduce((sum: number, trainer: any) => 
      sum + trainer.monthlyEarnings, 0
    );
    
    const averageRating = trainerStats.length > 0
      ? trainerStats.reduce((sum: number, trainer: any) => sum + trainer.rating, 0) / trainerStats.length
      : 0;

    return NextResponse.json({
      topTrainers,
      total: trainers.length,
      averageRating: Math.round(averageRating * 10) / 10,
      totalEarnings
    });

  } catch (error) {
    console.error('Error fetching trainer stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trainer statistics' },
      { status: 500 }
    );
  }
}