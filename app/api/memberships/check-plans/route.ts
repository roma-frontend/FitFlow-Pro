// app/api/memberships/check-plans/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from "convex/browser";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET(request: NextRequest) {
  try {
    console.log("🔄 API: Проверка планов абонементов");
    
    const result = await convex.mutation("seedMembershipPlans:checkPlans");
    
    console.log("✅ API: Найдено планов:", result.count);
    
    return NextResponse.json({ 
      success: true, 
      ...result
    });
  } catch (error) {
    console.error("❌ API: Ошибка проверки планов:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Ошибка проверки планов'
      },
      { status: 500 }
    );
  }
}