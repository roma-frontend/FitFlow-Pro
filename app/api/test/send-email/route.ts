// app/api/test/send-email/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { sendPasswordResetEmail, sendPasswordChangedNotification } from '@/lib/email';

export async function POST(request: NextRequest) {
  // Только в режиме разработки
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { success: false, error: 'Доступно только в режиме разработки' },
      { status: 403 }
    );
  }

  try {
    const { type, email, userType } = await request.json();

    if (!type || !email || !userType) {
      return NextResponse.json(
        { success: false, error: 'Все поля обязательны' },
        { status: 400 }
      );
    }

    if (type === 'reset') {
      // Тестовое письмо восстановления пароля
      const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=test-token-123&type=${userType}`;
      
      await sendPasswordResetEmail({
        to: email,
        name: 'Тестовый Пользователь',
        resetUrl,
        userType: userType as 'staff' | 'member'
      });

      return NextResponse.json({
        success: true,
        message: 'Тестовое письмо восстановления отправлено'
      });
      
    } else if (type === 'changed') {
      // Тестовое уведомление о смене пароля
      await sendPasswordChangedNotification({
        to: email,
        name: 'Тестовый Пользователь',
        userType: userType as 'staff' | 'member',
        timestamp: new Date()
      });

      return NextResponse.json({
        success: true,
        message: 'Тестовое уведомление о смене пароля отправлено'
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Неверный тип письма' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Ошибка отправки тестового письма:', error);
    return NextResponse.json(
      { success: false, error: 'Не удалось отправить письмо' },
      { status: 500 }
    );
  }
}
