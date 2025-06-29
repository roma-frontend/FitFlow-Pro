// app/api/member/visits/route.ts (новый файл)
import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from "convex/browser";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get('memberId');

    if (!memberId) {
      return NextResponse.json(
        { error: 'memberId обязателен' },
        { status: 400 }
      );
    }

    // Получаем посещения участника за последний месяц
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    const visits = await convex.query("visits:getByMemberSince", { 
      memberId, 
      since: thirtyDaysAgo 
    });

    return NextResponse.json({
      success: true,
            visits: visits || []
    });

  } catch (error) {
    console.error('Ошибка получения посещений:', error);
    return NextResponse.json(
      { error: 'Ошибка получения посещений' },
      { status: 500 }
    );
  }
}

