// app/api/auth/forgot-password/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';
import { sendPasswordResetEmail } from '@/lib/email';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: NextRequest) {
  try {
    const { email, userType } = await request.json();

    if (!email || !userType) {
      return NextResponse.json(
        { success: false, error: 'Email и тип пользователя обязательны' },
        { status: 400 }
      );
    }

    // Правильный синтаксис для Convex - используем строковый путь
    const result = await convex.mutation("auth:requestPasswordReset", {
      email: email.toLowerCase(),
      userType: userType as "staff" | "member"
    });

    if (result.success && result.resetToken) {
      // Отправляем email только если пользователь найден
      const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${result.resetToken}&type=${userType}`;
      
      await sendPasswordResetEmail({
        to: result.userEmail!,
        name: result.userName!,
        resetUrl,
        userType: userType as "staff" | "member"
      });

      console.log(`Password reset requested for ${userType}: ${email}`);
    }

    return NextResponse.json({
      success: true,
      message: 'Если пользователь существует, письмо будет отправлено'
    });

  } catch (error) {
    console.error('Ошибка восстановления пароля:', error);
    return NextResponse.json(
      { success: false, error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
