// app/api/memberships/plans/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from "convex/browser";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET() {
  try {
    console.log("🔄 API: Получение планов абонементов");
    
    const plans = await convex.query("memberships:getPlans");
    
    console.log("✅ API: Получено планов:", plans?.length || 0);
    
    return NextResponse.json({ 
      success: true, 
      data: plans || [],
      count: plans?.length || 0
    });
  } catch (error) {
    console.error("❌ API: Ошибка получения планов:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Ошибка получения планов',
        data: []
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Валидация
    if (!body.name || !body.type || !body.duration || !body.price) {
      throw new Error("Отсутствуют обязательные поля");
    }
    
    const planId = await convex.mutation("memberships:createPlan", body);
    
    return NextResponse.json({
      success: true,
      data: planId,
      message: 'План успешно создан'
    });
  } catch (error) {
    console.error('Ошибка создания плана:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Ошибка создания плана' 
      },
      { status: 500 }
    );
  }
}