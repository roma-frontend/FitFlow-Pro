// app/api/auth/password-reset-logs/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const userType = url.searchParams.get('userType') as 'staff' | 'member' | undefined;

    // Используем строковый путь для Convex
    const logs = await convex.query("auth:getPasswordResetLogs", {
      limit,
      userType
    });
    
    return NextResponse.json({
      success: true,
      data: logs
    });

  } catch (error) {
    console.error('Error fetching logs:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch logs' },
      { status: 500 }
    );
  }
}
