// app/api/member/notifications/route.ts (новый файл)
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

    // Получаем уведомления участника
    const notifications = await convex.query("notifications:getByRecipient", { 
      recipientId: memberId,
      recipientType: "member"
    });

    return NextResponse.json({
      success: true,
      notifications: notifications || []
    });

  } catch (error) {
    console.error('Ошибка получения уведомлений:', error);
    return NextResponse.json(
      { error: 'Ошибка получения уведомлений' },
      { status: 500 }
    );
  }
}
