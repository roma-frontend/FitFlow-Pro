// app/api/analytics/peak-hours/route.ts
import { NextResponse } from 'next/server';
import { ConvexHttpClient } from "convex/browser";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const period = searchParams.get('period') || 'month';

  try {
    // Получаем все бронирования
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

    // Группируем по временным слотам
    const timeSlots = {
      '08:00-10:00': { count: 0, label: 'Утро' },
      '10:00-12:00': { count: 0, label: 'Позднее утро' },
      '12:00-14:00': { count: 0, label: 'Обед' },
      '14:00-16:00': { count: 0, label: 'После обеда' },
      '16:00-18:00': { count: 0, label: 'Ранний вечер' },
      '18:00-20:00': { count: 0, label: 'Вечер' },
      '20:00-22:00': { count: 0, label: 'Поздний вечер' }
    };

    // Подсчитываем бронирования по времени
    periodBookings.forEach((booking: any) => {
      const startTime = new Date(booking.startTime);
      const hour = startTime.getHours();
      
      if (hour >= 8 && hour < 10) timeSlots['08:00-10:00'].count++;
      else if (hour >= 10 && hour < 12) timeSlots['10:00-12:00'].count++;
      else if (hour >= 12 && hour < 14) timeSlots['12:00-14:00'].count++;
      else if (hour >= 14 && hour < 16) timeSlots['14:00-16:00'].count++;
      else if (hour >= 16 && hour < 18) timeSlots['16:00-18:00'].count++;
      else if (hour >= 18 && hour < 20) timeSlots['18:00-20:00'].count++;
      else if (hour >= 20 && hour < 22) timeSlots['20:00-22:00'].count++;
    });

    // Находим максимальную загрузку
    const maxCount = Math.max(...Object.values(timeSlots).map(slot => slot.count));
    const totalBookings = Object.values(timeSlots).reduce((sum, slot) => sum + slot.count, 0);

    // Форматируем данные
    const formattedSlots = Object.entries(timeSlots).map(([time, data]) => ({
      time,
      load: maxCount > 0 ? Math.round((data.count / maxCount) * 100) : 0,
      label: data.label,
      bookings: data.count
    }));

    // Находим самое загруженное время
    const busiestSlot = formattedSlots.reduce((max, slot) => 
      slot.bookings > max.bookings ? slot : max
    );

    const averageLoad = totalBookings > 0 
      ? Math.round((totalBookings / (formattedSlots.length * maxCount)) * 100)
      : 0;

    return NextResponse.json({
      timeSlots: formattedSlots,
      busiestHour: busiestSlot.time,
      averageLoad
    });

  } catch (error) {
    console.error('Error fetching peak hours stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch peak hours statistics' },
      { status: 500 }
    );
  }
}