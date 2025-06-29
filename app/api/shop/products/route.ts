// app/api/shop/products/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log("🔄 API GET: Начало обработки");
    
    // Проверяем переменные окружения
    if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
      throw new Error("NEXT_PUBLIC_CONVEX_URL не установлен");
    }
    
    console.log("🔗 API GET: Convex URL:", process.env.NEXT_PUBLIC_CONVEX_URL);
    
    // Динамический импорт Convex
    const { ConvexHttpClient } = await import("convex/browser");
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);
    
    console.log("📞 API GET: Вызываем Convex query");
    const products = await convex.query("products:getAll");
    
    console.log("✅ API GET: Получено продуктов:", products?.length || 0);
    
    return NextResponse.json({ 
      success: true, 
      data: products || [],
      count: products?.length || 0
    });
  } catch (error) {
    console.error("❌ API GET: Ошибка:", error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Ошибка получения продуктов',
        data: [],
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
