// app/api/admin/recent-activity/route.ts (новый файл)
import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from "convex/browser";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET(request: NextRequest) {
  try {
    const activity: { type: string; description: string; time: string; timestamp: any; }[] = [];

    // Получаем последние посещения
    const recentVisits = await convex.query("visits:getRecent", { limit: 5 });
    recentVisits.forEach((visit: any) => {
      activity.push({
        type: 'visit',
        description: `${visit.memberName || 'Участник'} посетил клуб`,
        time: new Date(visit.timestamp).toLocaleString('ru-RU'),
        timestamp: visit.timestamp
      });
    });

    // Получаем последние бронирования
    const recentBookings = await convex.query("bookings:getRecent", { limit: 5 });
    recentBookings.forEach((booking: any) => {
      activity.push({
        type: 'booking',
        description: `Новая запись к тренеру ${booking.trainerName}`,
        time: new Date(booking.createdAt).toLocaleString('ru-RU'),
        timestamp: booking.createdAt
      });
    });

    // Получаем последние заказы
    const recentOrders = await convex.query("orders:getRecent", { limit: 5 });
    recentOrders.forEach((order: any) => {
      activity.push({
        type: 'order',
        description: `Новый заказ на ${order.totalAmount} ₽`,
        time: new Date(order.orderTime).toLocaleString('ru-RU'),
        timestamp: order.orderTime
      });
    });

    // Сортируем по времени
    activity.sort((a, b) => b.timestamp - a.timestamp);

    return NextResponse.json({
      success: true,
      activity: activity.slice(0, 10)
    });

  } catch (error) {
    console.error('Ошибка получения активности:', error);
    return NextResponse.json(
      { error: 'Ошибка получения активности' },
      { status: 500 }
    );
  }
}
