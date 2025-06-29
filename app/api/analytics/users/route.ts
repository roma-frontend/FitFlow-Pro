// app/api/analytics/users/route.ts
import { NextResponse } from 'next/server';
import { api } from "@/convex/_generated/api";
import { fetchQuery } from "convex/nextjs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const period = searchParams.get('period') || 'month';

  try {
    // Получаем всех пользователей из Convex
    const users = await fetchQuery(api.users.getAll) || [];
    
    // Фильтруем по периоду для новых пользователей
    const now = new Date();
    const startOfPeriod = new Date();
    
    if (period === 'week') {
      startOfPeriod.setDate(now.getDate() - 7);
    } else if (period === 'month') {
      startOfPeriod.setMonth(now.getMonth() - 1);
    } else if (period === 'year') {
      startOfPeriod.setFullYear(now.getFullYear() - 1);
    }

    // Подсчитываем новых пользователей за период
    const newUsers = users.filter((user: any) => 
      user.createdAt >= startOfPeriod.getTime()
    );

    // Подсчитываем активных пользователей (те, кто заходил за последние 30 дней)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const activeUsers = users.filter((user: any) => 
      user.isActive && (!user.lastLogin || user.lastLogin >= thirtyDaysAgo.getTime())
    );

    // Группируем по ролям
    const byRole = users.reduce((acc: any, user: any) => {
      const role = user.role || 'member';
      if (!acc[role]) {
        acc[role] = { count: 0, active: 0 };
      }
      acc[role].count++;
      if (user.isActive) {
        acc[role].active++;
      }
      return acc;
    }, {});

    const data = {
      total: users.length,
      active: activeUsers.length,
      newInPeriod: newUsers.length,
      byRole,
      activityRate: users.length > 0 ? activeUsers.length / users.length : 0
    };

    return NextResponse.json({ success: true, data });

  } catch (error) {
    console.error('Error fetching user stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user statistics' },
      { status: 500 }
    );
  }
}
