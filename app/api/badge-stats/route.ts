// app/api/badge-stats/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from "convex/browser";
import { getSession } from '@/lib/simple-auth';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

async function getUserFromRequest(request: NextRequest) {
  try {
    const sessionId = request.cookies.get('session_id')?.value || 
                     request.cookies.get('session_id_debug')?.value;
    
    if (sessionId) {
      const session = await getSession(sessionId);
      if (session) {
        return session.user;
      }
    }
    
    const authResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/auth/check`, {
      headers: {
        'Cookie': request.headers.get('cookie') || '',
      }
    });
    
    if (!authResponse.ok) {
      return null;
    }
    
    const authData = await authResponse.json();
    
    if (!authData.authenticated || !authData.user) {
      return null;
    }
    
    return authData.user;
  } catch (error) {
    console.error('Ошибка проверки авторизации:', error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Не авторизован' },
        { status: 401 }
      );
    }

    // Получаем статистику через Convex (если функция существует)
    let stats = null;
    try {
      stats = await convex.query("headerBadges:getBadgeStats", {});
    } catch (error) {
      console.warn('Функция статистики не найдена в Convex:', error);
      // Возвращаем базовую статистику
      stats = {
        totalBadges: 0,
        activeBadges: 0,
        totalImpressions: 0,
        totalClicks: 0,
        averageCTR: 0,
      };
    }

    return NextResponse.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('❌ Ошибка получения статистики badge:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Ошибка сервера при получении статистики' 
      },
      { status: 500 }
    );
  }
}
