// app/api/products/[id]/route.ts (исправленная версия для Next.js 15)
import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from "convex/browser";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Ожидаем разрешения Promise для получения параметров
    const { id } = await params;
    const body = await request.json();
    
    console.log("🔄 API: Обновление продукта:", id, body);

    // Используем строку вместо api.products.update
    const result = await convex.mutation("products:update", {
      id: id,
      name: body.name,
      description: body.description,
      category: body.category,
      price: body.price,
      inStock: body.inStock,
      isPopular: body.isPopular || false,
      nutrition: body.nutrition
    });

    console.log("✅ API: Продукт обновлен:", result);
    
    return NextResponse.json({ 
      success: true, 
      data: result,
      message: 'Продукт успешно обновлен'
    });
  } catch (error) {
    console.error("❌ API: Ошибка обновления продукта:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Ошибка обновления продукта'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Ожидаем разрешения Promise для получения параметров
    const { id } = await params;
    console.log("🔄 API: Удаление продукта:", id);

    // Используем строку вместо api.products.remove
    const result = await convex.mutation("products:remove", {
      id: id
    });

    console.log("✅ API: Продукт удален:", result);
    
    return NextResponse.json({ 
      success: true, 
      data: result,
      message: 'Продукт успешно удален'
    });
  } catch (error) {
    console.error("❌ API: Ошибка удаления продукта:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Ошибка удаления продукта'
      },
      { status: 500 }
    );
  }
}

// Опционально: добавьте GET метод для получения конкретного продукта
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    console.log("🔄 API: Получение продукта:", id);

    const result = await convex.query("products:getById", { id });

    if (!result) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Продукт не найден' 
        },
        { status: 404 }
      );
    }

    console.log("✅ API: Продукт получен:", result);
    
    return NextResponse.json({ 
      success: true, 
      data: result 
    });
  } catch (error) {
    console.error("❌ API: Ошибка получения продукта:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Ошибка получения продукта' 
      },
      { status: 500 }
    );
  }
}
