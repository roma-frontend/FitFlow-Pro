// app/api/leaderboard/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/simple-auth';
import { ConvexHttpClient } from "convex/browser";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET(request: NextRequest) {
  try {
    // Для лидерборда можно не требовать авторизацию или делать её опциональной
    const sessionToken = request.cookies.get('session_id')?.value;
    let userId = undefined;

    if (sessionToken) {
      const sessionData = await getSession(sessionToken);
      if (sessionData) {
        userId = sessionData.user.id;
      }
    }

    // Получаем лидерборд из Convex
    const leaderboardData = await convex.query("bodyAnalysis:getTransformationLeaderboard", { userId });

    return NextResponse.json({
      success: true,
      data: leaderboardData
    });

  } catch (error) {
    console.error('❌ Ошибка получения лидерборда:', error);
    return NextResponse.json({
      success: false,
      error: 'Ошибка получения данных',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}