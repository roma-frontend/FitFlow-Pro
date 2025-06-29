// app/api/memberships/[id]/cancel/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from "convex/browser";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log("🔄 API: Отмена абонемента:", id);

    const result = await convex.mutation("memberships:cancel", {
      membershipId: id
    });

    console.log("✅ API: Абонемент отменен");
    
    return NextResponse.json({ 
      success: true, 
      data: result,
      message: 'Абонемент успешно отменен'
    });
  } catch (error) {
    console.error("❌ API: Ошибка отмены абонемента:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Ошибка отмены абонемента' 
      },
      { status: 500 }
    );
  }
}