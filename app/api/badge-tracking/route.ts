// app/api/badge-tracking/route.ts (исправленная версия)
import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from "convex/browser";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { badgeId, action, userId } = body;

    console.log('📊 Отслеживание badge:', { badgeId, action, userId });

    if (action === 'click') {
      await convex.mutation("headerBadges:trackBadgeClick", {
        badgeId,
        userId
      });
    } else if (action === 'impression') {
      await convex.mutation("headerBadges:trackBadgeImpression", {
        badgeId
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Событие отслежено'
    });
  } catch (error) {
    console.error('❌ Ошибка отслеживания badge:', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка сервера' },
      { status: 500 }
    );
  }
}
