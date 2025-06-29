// app/api/memberships/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from "convex/browser";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET(request: NextRequest) {
  try {
    console.log("🔄 API GET: Начало обработки запроса абонементов");
    
    // Получаем userId из query params
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      // Если нет userId, возвращаем все планы
      console.log("📞 API GET: Получаем все планы абонементов");
      const plans = await convex.query("memberships:getPlans");
      
      console.log("✅ API GET: Получено планов:", plans?.length || 0);
      
      return NextResponse.json({ 
        success: true, 
        data: plans || [],
        count: plans?.length || 0
      });
    }
    
    // Если есть userId, получаем абонементы пользователя
    console.log("📞 API GET: Получаем абонементы пользователя:", userId);
    const memberships = await convex.query("memberships:getUserMemberships", { userId });
    
    console.log("✅ API GET: Получено абонементов:", memberships?.length || 0);
    
    return NextResponse.json({ 
      success: true, 
      data: memberships || [],
      count: memberships?.length || 0
    });
  } catch (error) {
    console.error("❌ API GET: Ошибка:", error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Ошибка получения абонементов',
        data: []
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("🔄 API POST: Начало создания абонемента");
    
    const body = await request.json();
    console.log("📦 API POST: Получены данные:", body);
    
    // Валидация данных
    if (!body.userId || !body.planId) {
      throw new Error("Отсутствуют обязательные поля: userId, planId");
    }
    
    console.log("📞 API POST: Вызываем Convex mutation");
    
    const result = await convex.mutation("memberships:create", {
      userId: body.userId,
      planId: body.planId,
      trainerId: body.trainerId,
      autoRenew: body.autoRenew || false,
      paymentIntentId: body.paymentIntentId,
      paymentMethod: body.paymentMethod
    });

    console.log("✅ API POST: Абонемент создан:", result);
    
    return NextResponse.json({ 
      success: true, 
      data: result,
      message: 'Абонемент успешно создан'
    });
  } catch (error) {
    console.error("❌ API POST: Ошибка:", error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Ошибка создания абонемента'
      },
      { status: 500 }
    );
  }
}