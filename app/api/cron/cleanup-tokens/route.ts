// app/api/auth/cleanup-tokens/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: NextRequest) {
  try {
    // Используем строковый путь для Convex
    const result = await convex.mutation("auth:cleanupExpiredTokens", {});
    
    console.log(`Manual cleanup completed: ${result.cleanedCount} tokens removed`);
    
    return NextResponse.json(result);

  } catch (error) {
    console.error('Cleanup error:', error);
    return NextResponse.json(
      { error: 'Cleanup failed' },
      { status: 500 }
    );
  }
}
