// app/api/auth/member-login/route.ts (обновленная версия)
import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from "convex/browser";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: NextRequest) {
  console.log('🔐 Попытка входа участника');
  
  try {
    const body = await request.json();
    const { email, password } = body;

    console.log('📧 Email участника:', email);

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email и пароль обязательны' },
        { status: 400 }
      );
    }

    // Проверяем JWT_SECRET
    if (!process.env.JWT_SECRET) {
      console.error('❌ JWT_SECRET не установлен!');
      return NextResponse.json(
        { error: 'Ошибка конфигурации сервера' },
        { status: 500 }
      );
    }

    // Ищем пользователя
    console.log('🔍 Поиск пользователя...');
    const user = await convex.query("users:getByEmail", { email });

    if (!user) {
      console.log('❌ Пользователь не найден');
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 401 }
      );
    }

    if (!user.isActive) {
      console.log('❌ Аккаунт деактивирован');
      return NextResponse.json(
        { error: 'Аккаунт деактивирован' },
        { status: 401 }
      );
    }

    // Проверяем что это участник
    if (user.role !== 'member') {
      console.log('❌ Неправильная роль:', user.role);
      return NextResponse.json(
        { error: 'Этот аккаунт не является аккаунтом участника' },
        { status: 403 }
      );
    }

    // Проверяем пароль
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log('❌ Неверный пароль');
      return NextResponse.json(
        { error: 'Неверный пароль' },
        { status: 401 }
      );
    }

    // Обновляем время последнего входа
    try {
      await convex.mutation("users:updateLastLogin", {
        userId: user._id,
        timestamp: Date.now()
      });
    } catch (updateError) {
      console.log('⚠️ Не удалось обновить время входа:', updateError);
    }

    // Создаем JWT токен
    const tokenPayload = {
      userId: user._id,
      email: user.email,
      role: user.role,
      name: user.name
    };

    const token = jwt.sign(
      tokenPayload,
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    // Создаем ответ
    const responseData = {
      success: true,
      user: {
        userId: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      token // Добавляем токен в ответ
    };

    const response = NextResponse.json(responseData);

    // Устанавливаем куки
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: 24 * 60 * 60, // 24 часа
      path: '/'
    };
    
    response.cookies.set('auth_token', token, cookieOptions);
    
    return response;

  } catch (error) {
    console.error('💥 Ошибка входа участника:', error);
    return NextResponse.json(
      { 
        error: 'Внутренняя ошибка сервера',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}