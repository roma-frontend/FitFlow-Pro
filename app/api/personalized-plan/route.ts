// app/api/personalized-plan/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from "convex/browser";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET(request: NextRequest) {
  try {
    console.log("🔄 API GET: Начало получения персонализированного плана");
    
    // Получаем параметры из query
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const planId = searchParams.get('planId');
    const analysisId = searchParams.get('analysisId');
    
    if (!userId) {
      throw new Error("Отсутствует обязательный параметр: userId");
    }
    
    console.log("📞 API GET: Получаем персонализированный план для пользователя:", userId);
    
    const plan = await convex.query("personalizedPlan:get", {
      userId,
      planId: planId || undefined,
      analysisId: analysisId || undefined
    });
    
    console.log("✅ API GET: Получен персонализированный план:", plan ? "найден" : "не найден");
    
    return NextResponse.json({ 
      success: true, 
      data: plan || null
    });
  } catch (error) {
    console.error("❌ API GET: Ошибка:", error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Ошибка получения персонализированного плана',
        data: null
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("🔄 API POST: Начало создания персонализированного плана");
    
    const body = await request.json();
    console.log("📦 API POST: Получены данные:", body);
    
    // Валидация данных
    if (!body.userId || !body.analysisId) {
      throw new Error("Отсутствуют обязательные поля: userId, analysisId");
    }
    
    console.log("📞 API POST: Вызываем Convex mutation");
    
    const result = await convex.mutation("personalizedPlan:create", {
      userId: body.userId,
      analysisId: body.analysisId,
      workoutPlan: body.workoutPlan,
      nutritionPlan: body.nutritionPlan,
      goals: body.goals,
      recommendations: body.recommendations,
      duration: body.duration,
      difficulty: body.difficulty,
      notes: body.notes
    });
    
    console.log("✅ API POST: Персонализированный план создан:", result);
    
    return NextResponse.json({ 
      success: true, 
      data: result,
      message: 'Персонализированный план успешно создан'
    });
  } catch (error) {
    console.error("❌ API POST: Ошибка:", error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Ошибка создания персонализированного плана'
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log("🔄 API PUT: Начало обновления персонализированного плана");
    
    const body = await request.json();
    console.log("📦 API PUT: Получены данные:", body);
    
    // Валидация данных
    if (!body.userId || !body.planId) {
      throw new Error("Отсутствуют обязательные поля: userId, planId");
    }
    
    console.log("📞 API PUT: Вызываем Convex mutation");
    
    const result = await convex.mutation("personalizedPlan:update", {
      userId: body.userId,
      planId: body.planId,
      workoutPlan: body.workoutPlan,
      nutritionPlan: body.nutritionPlan,
      goals: body.goals,
      recommendations: body.recommendations,
      duration: body.duration,
      difficulty: body.difficulty,
      notes: body.notes
    });
    
    console.log("✅ API PUT: Персонализированный план обновлен:", result);
    
    return NextResponse.json({ 
      success: true, 
      data: result,
      message: 'Персонализированный план успешно обновлен'
    });
  } catch (error) {
    console.error("❌ API PUT: Ошибка:", error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Ошибка обновления персонализированного плана'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    console.log("🔄 API DELETE: Начало удаления персонализированного плана");
    
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const planId = searchParams.get('planId');
    
    // Валидация данных
    if (!userId || !planId) {
      throw new Error("Отсутствуют обязательные параметры: userId, planId");
    }
    
    console.log("📞 API DELETE: Вызываем Convex mutation");
    
    const result = await convex.mutation("personalizedPlan:delete", {
      userId,
      planId
    });
    
    console.log("✅ API DELETE: Персонализированный план удален:", result);
    
    return NextResponse.json({ 
      success: true, 
      data: result,
      message: 'Персонализированный план успешно удален'
    });
  } catch (error) {
    console.error("❌ API DELETE: Ошибка:", error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Ошибка удаления персонализированного плана'
      },
      { status: 500 }
    );
  }
}