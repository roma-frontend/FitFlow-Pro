// app/api/memberships/current/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from "convex/browser";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET(request: NextRequest) {
  try {
    console.log("🔄 API: Получение текущего абонемента");
    
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'userId обязателен'
        },
        { status: 400 }
      );
    }
    
    const membership = await convex.query("memberships:getCurrentMembership", { userId });
    
    console.log("✅ API: Текущий абонемент:", membership ? "найден" : "не найден");
    
    return NextResponse.json({ 
      success: true, 
      data: membership
    });
  } catch (error) {
    console.error("❌ API: Ошибка получения текущего абонемента:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Ошибка получения текущего абонемента'
      },
      { status: 500 }
    );
  }
}