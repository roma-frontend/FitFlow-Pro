// app/api/products/route.ts (версия с обработкой ошибок)
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

export async function POST(request: NextRequest) {
  try {
    console.log("🔄 API POST: Начало обработки");
    
    if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
      throw new Error("NEXT_PUBLIC_CONVEX_URL не установлен");
    }
    
    const body = await request.json();
    console.log("📦 API POST: Получены данные:", body);
    
    // Валидация данных
    if (!body.name || !body.description || !body.category) {
      throw new Error("Отсутствуют обязательные поля: name, description, category");
    }
    
    if (typeof body.price !== 'number' || body.price <= 0) {
      throw new Error("Цена должна быть положительным числом");
    }
    
    console.log("🔗 API POST: Convex URL:", process.env.NEXT_PUBLIC_CONVEX_URL);
    
    const { ConvexHttpClient } = await import("convex/browser");
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);
    
    console.log("📞 API POST: Вызываем Convex mutation");
    
    const result = await convex.mutation("products:create", {
      name: body.name,
      description: body.description,
      category: body.category,
      price: body.price,
      inStock: body.inStock || 0,
      minStock: body.minStock || 10,
      isPopular: body.isPopular || false,
      imageUrl: body.imageUrl, // ✅ Добавляем imageUrl
      nutrition: body.nutrition
    });

    console.log("✅ API POST: Продукт создан:", result);
    
    return NextResponse.json({ 
      success: true, 
      data: result,
      message: 'Продукт успешно создан'
    });
  } catch (error) {
    console.error("❌ API POST: Ошибка:", error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Ошибка создания продукта',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
