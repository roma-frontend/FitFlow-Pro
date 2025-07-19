// app/api/memberships/plans/update/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from "convex/browser";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log("🔄 API: Обновление плана абонемента:", body.id);
    
    // Валидация
    if (!body.id) {
      throw new Error("ID плана обязателен");
    }
    
    // Подготавливаем данные для обновления
    const updateData: any = {};
    
    if (body.name !== undefined) updateData.name = body.name;
    if (body.type !== undefined) updateData.type = body.type;
    if (body.duration !== undefined) updateData.duration = body.duration;
    if (body.price !== undefined) updateData.price = body.price;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.features !== undefined) updateData.features = body.features;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;
    
    const result = await convex.mutation("memberships:updatePlan", {
      id: body.id,
      ...updateData
    });
    
    console.log("✅ API: План абонемента обновлен");
    
    return NextResponse.json({
      success: true,
      data: result,
      message: 'План успешно обновлен'
    });
  } catch (error) {
    console.error('❌ API: Ошибка обновления плана:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Ошибка обновления плана' 
      },
      { status: 500 }
    );
  }
}