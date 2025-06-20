// app/api/auth/qr-login/route.ts (новый файл)
import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from "convex/browser";
import jwt from 'jsonwebtoken';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: NextRequest) {
  try {
    console.log('📱 Попытка входа по QR-коду');

    const body = await request.json();
    const { qrData } = body;

    if (!qrData) {
      return NextResponse.json(
        { error: 'QR-код не предоставлен' },
        { status: 400 }
      );
    }

    console.log('🔍 Данные QR-кода:', qrData);

    // Парсим QR-код (ожидаем формат: "fitaccess:user_id" или email)
    let userId = null;
    let userEmail = null;

    if (qrData.startsWith('fitaccess:')) {
      userId = qrData.replace('fitaccess:', '');
    } else if (qrData.includes('@')) {
      userEmail = qrData;
    } else {
      return NextResponse.json(
        { error: 'Неверный формат QR-кода' },
        { status: 400 }
      );
    }

    // Ищем пользователя
    let user;
    if (userId) {
      user = await convex.query("users:getById", { id: userId });
    } else if (userEmail) {
      user = await convex.query("users:getByEmail", { email: userEmail });
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 404 }
      );
    }

    console.log('✅ Пользователь найден по QR-коду:', user.email);

    if (!user.isActive) {
      return NextResponse.json(
        { error: 'Аккаунт деактивирован' },
        { status: 401 }
      );
    }

    // Обновляем время последнего входа
    await convex.mutation("users:updateLastLogin", {
      userId: user._id,
      timestamp: Date.now()
    });

    // Создаем JWT токен
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role,
        name: user.name
      },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    // Создаем ответ с куки
    const response = NextResponse.json({
      success: true,
      user: {
        userId: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      method: 'qr_code'
    });

    // Устанавливаем куки
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60,
      path: '/'
    });

    console.log('🎉 Вход по QR-коду успешен');
    return response;

  } catch (error) {
    console.error('💥 Ошибка входа по QR-коду:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
