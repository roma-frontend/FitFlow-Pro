// app/api/products/[id]/restore/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from "convex/browser";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Ожидаем разрешения Promise для получения параметров
    const { id } = await params;
    console.log("🔄 API: Восстановление продукта:", id);

    const result = await convex.mutation("products:restore", {
      id: id
    });

    console.log("✅ API: Продукт восстановлен:", result);
    
    return NextResponse.json({ 
      success: true, 
      data: result,
      message: 'Продукт успешно восстановлен'
    });
  } catch (error) {
    console.error("❌ API: Ошибка восстановления продукта:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Ошибка восстановления продукта' 
      },
      { status: 500 }
    );
  }
}
