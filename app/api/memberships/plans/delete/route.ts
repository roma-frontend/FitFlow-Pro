// app/api/memberships/plans/delete/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from "convex/browser";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log("🔄 API: Удаление плана абонемента:", body.id);
    
    // Валидация
    if (!body.id) {
      throw new Error("ID плана обязателен");
    }
    
    const result = await convex.mutation("memberships:deletePlan", {
      id: body.id
    });
    
    console.log("✅ API: План абонемента удален");
    
    return NextResponse.json({
      success: true,
      data: result,
      message: 'План успешно удален'
    });
  } catch (error) {
    console.error('❌ API: Ошибка удаления плана:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Ошибка удаления плана' 
      },
      { status: 500 }
    );
  }
}