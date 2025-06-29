// app/api/memberships/[id]/renew/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from "convex/browser";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    console.log("🔄 API: Продление абонемента:", id);

    if (!body.planId) {
      throw new Error("planId обязателен");
    }

    const result = await convex.mutation("memberships:renew", {
      membershipId: id,
      planId: body.planId
    });

    console.log("✅ API: Абонемент продлен");
    
    return NextResponse.json({ 
      success: true, 
      data: result,
      message: 'Абонемент успешно продлен'
    });
  } catch (error) {
    console.error("❌ API: Ошибка продления абонемента:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Ошибка продления абонемента' 
      },
      { status: 500 }
    );
  }
}