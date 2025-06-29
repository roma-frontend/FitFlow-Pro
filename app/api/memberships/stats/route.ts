// app/api/memberships/stats/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from "convex/browser";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET() {
  try {
    console.log("🔄 API: Получение статистики абонементов");
    
    const stats = await convex.query("memberships:getStats");
    
    console.log("✅ API: Статистика получена");
    
    return NextResponse.json({ 
      success: true, 
      data: stats
    });
  } catch (error) {
    console.error("❌ API: Ошибка получения статистики:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Ошибка получения статистики'
      },
      { status: 500 }
    );
  }
}