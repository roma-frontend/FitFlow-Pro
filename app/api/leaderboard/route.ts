// app/api/leaderboard/route.ts - Лидерборд
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/simple-auth';
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";

export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('session_id')?.value;
    let userId: string | undefined;
    
    if (sessionToken) {
      const sessionData = await getSession(sessionToken);
      userId = sessionData?.user.id;
    }
    
    // Получаем лидерборд из Convex (userId опциональный)
    const leaderboard = await fetchQuery(api.bodyAnalysis.getTransformationLeaderboard, {
      userId
    });
    
    return NextResponse.json({
      success: true,
      data: leaderboard
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