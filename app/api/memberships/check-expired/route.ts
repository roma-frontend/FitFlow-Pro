// app/api/memberships/check-expired/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from "convex/browser";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST() {
  try {
    console.log("🔄 API: Проверка истекших абонементов");
    
    const result = await convex.mutation("memberships:checkExpiredMemberships");
    
    console.log("✅ API: Проверка завершена:", result);
    
    return NextResponse.json({ 
      success: true, 
      data: result,
      message: `Деактивировано абонементов: ${result.deactivatedCount}`
    });
  } catch (error) {
    console.error("❌ API: Ошибка проверки истекших абонементов:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Ошибка проверки'
      },
      { status: 500 }
    );
  }
}