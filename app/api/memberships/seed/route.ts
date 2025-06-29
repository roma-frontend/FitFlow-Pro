// app/api/memberships/seed/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from "convex/browser";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: NextRequest) {
  try {
    console.log("🔄 API: Начинаем инициализацию планов абонементов");
    
    const result = await convex.mutation("seedMembershipPlans:seedPlans");
    
    console.log("✅ API: Результат:", result);
    
    return NextResponse.json({ 
      success: true, 
      ...result
    });
  } catch (error) {
    console.error("❌ API: Ошибка инициализации планов:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Ошибка инициализации планов'
      },
      { status: 500 }
    );
  }
}