// app/api/badge-debug/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from "convex/browser";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Отладка badge API');

    // Проверяем соединение с Convex
    const allSettings = await convex.query("headerBadges:getAllBadgeSettings", {});
    const stats = await convex.query("headerBadges:getBadgeStats", {});

    // Создаем тестовый badge для /about
    const testBadgeId = await convex.mutation("headerBadges:createBadgeSetting", {
      navigationItemHref: "/about",
      badgeVariant: "matrix",
      badgeText: "TEST",
      badgeEnabled: true,
      priority: 1,
      targetRoles: [],
      targetDevices: [],
      conditions: {
        requireAuth: false,
        minUserLevel: 0,
        showOnlyOnce: false,
        hideAfterClick: false,
      },
      createdBy: "debug-api"
    });

    // Получаем обновленный список
    const updatedSettings = await convex.query("headerBadges:getAllBadgeSettings", {});

    return NextResponse.json({
      success: true,
      message: 'Отладка badge API успешна',
      data: {
        initialBadgeCount: allSettings?.length || 0,
        testBadgeId,
        updatedBadgeCount: updatedSettings?.length || 0,
        stats
      }
    });
  } catch (error) {
    console.error('❌ Ошибка отладки badge API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Ошибка отладки badge API',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
