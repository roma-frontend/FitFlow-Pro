// app/api/analytics/performance/route.ts
import { NextResponse } from 'next/server';
import { ConvexHttpClient } from "convex/browser";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const period = searchParams.get('period') || 'month';

  try {
    // Получаем данные из Convex
    const bookings = await convex.query("bookings.getAllUserBookings") || [];
    const trainers = await convex.query("users.getTrainers") || [];
    const users = await convex.query("users.getAll") || [];
    
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

    // Подсчет метрик
    const totalSlots = trainers.length * 8 * 20; // тренеры * часов в день * дней
    const bookedSlots = periodBookings.length;
    const averageLoad = Math.round((bookedSlots / totalSlots) * 100);

    // Процент выполнения плана (считаем от целевого количества бронирований)
    const targetBookings = totalSlots * 0.8; // Целевая загрузка 80%
    const planCompletion = Math.round((bookedSlots / targetBookings) * 100);

    // Удержание клиентов
    const uniqueClients = new Set(periodBookings.map((b: any) => b.userId || b.memberId));
    const returningClients = Array.from(uniqueClients).filter(clientId => {
      const clientBookings = periodBookings.filter((b: any) => 
        (b.userId || b.memberId) === clientId
      );
      return clientBookings.length > 1;
    }).length;
    
    const clientRetention = uniqueClients.size > 0 
      ? Math.round((returningClients / uniqueClients.size) * 100)
      : 0;

    // Среднее время ответа (симуляция)
    const responseTime = '1.2ч';

    // Эффективность тренеров
    const activeTrainers = trainers.filter((t: any) => {
      const trainerBookings = periodBookings.filter((b: any) => b.trainerId === t.id);
      return trainerBookings.length > 0;
    }).length;
    
    const trainerEfficiency = trainers.length > 0
      ? Math.round((activeTrainers / trainers.length) * 100)
      : 0;

    return NextResponse.json({
      averageLoad,
      planCompletion,
      clientRetention,
      responseTime,
      equipmentUtilization: 78, // Можно связать с реальными данными об оборудовании
      trainerEfficiency,
      energyConsumption: 2450, // Можно связать с реальными данными
      maintenanceCosts: 45000 // Можно связать с реальными данными
    });

  } catch (error) {
    console.error('Error fetching performance metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch performance metrics' },
      { status: 500 }
    );
  }
}
