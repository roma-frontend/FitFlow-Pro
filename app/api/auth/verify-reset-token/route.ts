// app/api/auth/verify-reset-token/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: NextRequest) {
  try {
    const { token, userType } = await request.json();

    if (!token || !userType) {
      return NextResponse.json(
        { success: false, error: 'Токен и тип пользователя обязательны' },
        { status: 400 }
      );
    }

    // Используем строковый путь для Convex
    const result = await convex.query("auth:verifyResetToken", {
      token,
      userType: userType as "staff" | "member"
    });

    return NextResponse.json(result);

  } catch (error) {
    console.error('Ошибка проверки токена:', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка проверки токена' },
      { status: 500 }
    );
  }
}
