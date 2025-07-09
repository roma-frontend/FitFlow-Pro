// app/api/bonuses/[id]/use/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from "convex/browser";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log("🔄 API POST: Начало использования бонуса");
    
    const body = await request.json();
    console.log("📦 API POST: Получены данные:", body);
    console.log("🎯 API POST: ID бонуса:", params.id);
    
    // Валидация данных
    if (!body.userId) {
      throw new Error("Отсутствует обязательное поле: userId");
    }
    
    if (!params.id) {
      throw new Error("Отсутствует ID бонуса");
    }
    
    console.log("📞 API POST: Вызываем Convex mutation для использования бонуса");
    
    const result = await convex.mutation("bonuses:useBonus", {
      userId: body.userId,
      bonusId: params.id,
      context: body.context || {},
      metadata: body.metadata || {}
    });

    console.log("✅ API POST: Бонус успешно использован:", result);
    
    return NextResponse.json({ 
      success: true, 
      data: result,
      message: 'Бонус успешно использован'
    });
  } catch (error) {
    console.error("❌ API POST: Ошибка:", error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Ошибка использования бонуса'
      },
      { status: 400 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log("🔄 API GET: Начало получения информации о бонусе");
    
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      throw new Error("Отсутствует обязательный параметр: userId");
    }
    
    if (!params.id) {
      throw new Error("Отсутствует ID бонуса");
    }
    
    console.log("📞 API GET: Получаем информацию о бонусе:", params.id);
    
    const bonus = await convex.query("bonuses:getBonusDetails", {
      userId,
      bonusId: params.id
    });

    console.log("✅ API GET: Получена информация о бонусе:", bonus ? 'да' : 'нет');
    
    return NextResponse.json({ 
      success: true, 
      data: bonus || null,
      message: bonus ? 'Информация о бонусе получена' : 'Бонус не найден'
    });
  } catch (error) {
    console.error("❌ API GET: Ошибка:", error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Ошибка получения информации о бонусе',
        data: null
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log("🔄 API DELETE: Начало отмены использования бонуса");
    
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      throw new Error("Отсутствует обязательный параметр: userId");
    }
    
    if (!params.id) {
      throw new Error("Отсутствует ID бонуса");
    }
    
    console.log("📞 API DELETE: Вызываем Convex mutation для отмены использования бонуса");
    
    const result = await convex.mutation("bonuses:cancelBonusUsage", {
      userId,
      bonusId: params.id
    });

    console.log("✅ API DELETE: Использование бонуса отменено:", result);
    
    return NextResponse.json({ 
      success: true, 
      data: result,
      message: 'Использование бонуса успешно отменено'
    });
  } catch (error) {
    console.error("❌ API DELETE: Ошибка:", error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Ошибка отмены использования бонуса'
      },
      { status: 400 }
    );
  }
}