// app/api/admin/users/stats/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from "convex/browser";
import { verifyToken } from '@/lib/auth';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    
    if (!['super-admin', 'admin', 'manager'].includes(payload.role)) {
      return NextResponse.json({ error: 'Недостаточно прав' }, { status: 403 });
    }

    const url = new URL(request.url);
    const period = url.searchParams.get('period') || '30'; // дней
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');

    let stats;

    if (startDate && endDate) {
      // Статистика за определенный период
      stats = await convex.query("users:getUserStatsByPeriod", {
        startDate: parseInt(startDate),
        endDate: parseInt(endDate)
      });
    } else {
      // Общая статистика
      stats = await convex.query("users:getUserStats");
      
      // Добавляем недавних пользователей
      const recentUsers = await convex.query("users:getRecentUsers", {
        limit: 10,
        days: parseInt(period)
      });
      
      stats = {
        ...stats,
        recent: recentUsers
      };
    }

    return NextResponse.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('Ошибка получения статистики:', error);
    return NextResponse.json({ 
      error: 'Ошибка получения статистики' 
    }, { status: 500 });
  }
}
