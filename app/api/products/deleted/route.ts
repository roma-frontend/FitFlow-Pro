// app/api/products/deleted/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from "convex/browser";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET(request: NextRequest) {
  try {
    console.log("🔄 API: Получение удаленных продуктов");

    const deletedProducts = await convex.query("products:getDeleted");

    console.log("✅ API: Удаленные продукты получены:", deletedProducts?.length || 0);
    
    return NextResponse.json({ 
      success: true, 
      data: deletedProducts || [],
      message: `Найдено ${deletedProducts?.length || 0} удаленных продуктов`
    });
  } catch (error) {
    console.error("❌ API: Ошибка получения удаленных продуктов:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Ошибка получения удаленных продуктов',
        data: []
      },
      { status: 500 }
    );
  }
}
