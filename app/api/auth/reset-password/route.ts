// app/api/auth/reset-password/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';
import { sendPasswordChangedNotification } from '@/lib/email';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: NextRequest) {
  try {
    const { token, password, userType } = await request.json();

    if (!token || !password || !userType) {
      return NextResponse.json(
        { success: false, error: 'Все поля обязательны' },
        { status: 400 }
      );
    }

    // Проверяем силу пароля
    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Пароль должен содержать минимум 6 символов' },
        { status: 400 }
      );
    }

    // Используем строковый путь для Convex
    const result = await convex.mutation("auth:resetPassword", {
      token,
      newPassword: password,
      userType: userType as "staff" | "member"
    });

    if (result.success && result.userEmail && result.userName) {
      // Отправляем уведомление о смене пароля
      try {
        await sendPasswordChangedNotification({
          to: result.userEmail,
          name: result.userName,
          userType: userType as "staff" | "member",
          timestamp: new Date()
        });
        
        console.log(`Password change notification sent to: ${result.userEmail}`);
      } catch (emailError) {
        console.error('Ошибка отправки уведомления:', emailError);
      }

      console.log(`Password reset completed for ${userType}: ${result.userEmail}`);
      
      return NextResponse.json({
        success: true,
        message: 'Пароль успешно изменен',
        redirectUrl: `/password-reset-success?type=${userType}`,
        userType
      });
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error('Ошибка сброса пароля:', error);
    return NextResponse.json(
      { success: false, error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
