// app/api/products/route.ts (с детальной отладкой)
import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from "convex/browser";

console.log("🔗 Convex URL при загрузке модуля:", process.env.NEXT_PUBLIC_CONVEX_URL);

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET() {
  try {
    console.log("🔄 API GET: Получение всех продуктов");
    console.log("🔗 API GET: Используется Convex URL:", process.env.NEXT_PUBLIC_CONVEX_URL);
    
    const products = await convex.query("products:getAll");
    console.log("✅ API GET: Получено продуктов:", products?.length || 0);
    console.log("📦 API GET: Данные продуктов:", products);
    
    return NextResponse.json({ 
      success: true, 
      data: products || [],
      count: products?.length || 0
    });
  } catch (error) {
    console.error("❌ API GET: Ошибка получения продуктов:", error);
    console.error("❌ API GET: Стек ошибки:", error instanceof Error ? error.stack : 'Нет стека');
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Ошибка получения продуктов',
        data: []
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("🔄 API POST: Создание продукта:", body);
    console.log("🔗 API POST: Используется Convex URL:", process.env.NEXT_PUBLIC_CONVEX_URL);

    // Проверяем, что у нас есть все необходимые данные
    if (!body.name || !body.description || !body.category || typeof body.price !== 'number') {
      throw new Error('Отсутствуют обязательные поля');
    }

    console.log("📝 API POST: Вызываем Convex мутацию products:create");
    
    const result = await convex.mutation("products:create", {
      name: body.name,
      description: body.description,
      category: body.category,
      price: body.price,
      inStock: body.inStock || 0,
      minStock: body.minStock || 10,
      isPopular: body.isPopular || false,
      nutrition: body.nutrition || undefined
    });

    console.log("✅ API POST: Продукт создан с результатом:", result);
    console.log("🆔 API POST: Тип результата:", typeof result);
    
    return NextResponse.json({ 
      success: true, 
      data: result,
      message: 'Продукт успешно создан'
    });
  } catch (error) {
    console.error("❌ API POST: Ошибка создания продукта:", error);
    console.error("❌ API POST: Стек ошибки:", error instanceof Error ? error.stack : 'Нет стека');
    console.error("❌ API POST: Детали ошибки:", {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      cause: error instanceof Error ? error.cause : 'No cause'
    });
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Ошибка создания продукта',
        details: error instanceof Error ? error.stack : 'Нет деталей'
      },
      { status: 500 }
    );
  }
}
