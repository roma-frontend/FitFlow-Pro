// app/api/memberships/history/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from "convex/browser";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const includeExpired = searchParams.get('includeExpired') === 'true';
    
    if (!userId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'userId обязателен'
        },
        { status: 400 }
      );
    }
    
    const history = await convex.query("memberships:getUserHistory", { 
      userId,
      includeExpired 
    });
    
    return NextResponse.json({ 
      success: true, 
      data: history || [],
      count: history?.length || 0
    });
  } catch (error) {
    console.error("❌ API: Ошибка получения истории:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Ошибка получения истории'
      },
      { status: 500 }
    );
  }
}