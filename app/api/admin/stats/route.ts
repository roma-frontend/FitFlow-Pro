// app/api/admin/stats/route.ts (новый файл)
import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from "convex/browser";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET(request: NextRequest) {
  try {
    // Получаем всех участников
    const members = await convex.query("members:getAll");
    const activeMembers = members.filter((m: any) => m.status === 'active');

    // Получаем посещения за сегодня
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayVisits = await convex.query("visits:getByDateRange", {
      start: today.getTime(),
      end: Date.now()
    });

    // Получаем заказы
    const orders = await convex.query("orders:getAll");
    const activeOrders = orders.filter((o: any) => 
      ['pending', 'preparing', 'ready'].includes(o.status)
    );

    // Получаем бронирования
    const bookings = await convex.query("bookings:getAll");
    const pendingBookings = bookings.filter((b: any) => b.status === 'pending');

    // Получаем продукты
    const products = await convex.query("products:getAll");
    const lowStockProducts = products.filter((p: any) => p.inStock <= p.minStock);

    // Получаем занятия
    const classes = await convex.query("classes:getUpcoming");

    // Рассчитываем месячную выручку (заглушка)
    const monthlyRevenue = orders
      .filter((o: any) => o.status === 'completed')
      .reduce((sum: number, o: any) => sum + o.totalAmount, 0);

    const stats = {
      totalMembers: members.length,
      activeMembers: activeMembers.length,
      todayVisits: todayVisits.length,
      monthlyRevenue,
      pendingBookings: pendingBookings.length,
      activeOrders: activeOrders.length,
      lowStockProducts: lowStockProducts.length,
      upcomingClasses: classes.length
    };

    return NextResponse.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('Ошибка получения статистики:', error);
    return NextResponse.json(
      { error: 'Ошибка получения статистики' },
      { status: 500 }
    );
  }
}
