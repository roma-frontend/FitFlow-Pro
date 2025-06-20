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
    console.log('✅ JWT_SECRET установлен');

    // Ищем пользователя в таблице users
    console.log('🔍 Поиск пользователя в таблице users...');
    const user = await convex.query("users:getByEmail", { email });

    if (!user) {
      console.log('❌ Пользователь не найден в users');

      // Проверяем в таблице members для совместимости
      try {
        const member = await convex.query("members:getByEmail", { email });
        if (member) {
          console.log('✅ Найден в members, но нужно создать в users');
          return NextResponse.json(
            { error: 'Пользователь найден в старой системе. Обратитесь к администратору для миграции.' },
            { status: 401 }
          );
        }
      } catch (memberError) {
        console.log('ℹ️ Таблица members недоступна или пуста');
      }

      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 401 }
      );
    }

    console.log('👤 Пользователь найден:', { 
      id: user._id, 
      role: user.role, 
      isActive: user.isActive,
      email: user.email,
      name: user.name
    });

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
        { error: 'Этот аккаунт не является аккаунтом участника. Используйте вход для персонала.' },
        { status: 403 }
      );
    }

    // Проверяем пароль
    console.log('🔐 Проверка пароля...');
    console.log('🔐 Хеш пароля в БД (первые 20 символов):', user.password?.substring(0, 20));
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('🔐 Результат проверки пароля:', isPasswordValid);
    
    if (!isPasswordValid) {
      console.log('❌ Неверный пароль');
      return NextResponse.json(
        { error: 'Неверный пароль' },
        { status: 401 }
      );
    }

    console.log('✅ Пароль верный');

    // Обновляем время последнего входа
    try {
      await convex.mutation("users:updateLastLogin", {
        userId: user._id,
        timestamp: Date.now()
      });
      console.log('✅ Время последнего входа обновлено');
    } catch (updateError) {
      console.log('⚠️ Не удалось обновить время входа:', updateError);
      // Не критично, продолжаем
    }

    // Создаем JWT токен
    console.log('🎫 Создаем JWT токен...');
    const tokenPayload = {
      userId: user._id,
      email: user.email,
      role: user.role,
      name: user.name
    };
    console.log('🎫 Payload токена:', tokenPayload);

    const token = jwt.sign(
      tokenPayload,
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    console.log('✅ JWT токен создан, длина:', token.length);
    console.log('🎫 Токен (первые 30 символов):', token.substring(0, 30));

    // Создаем ответ
    console.log('📤 Создаем ответ...');
    const responseData = {
      success: true,
      user: {
        userId: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    };

    const response = NextResponse.json(responseData);

    // Устанавливаем куки с подробным логированием
    console.log('🍪 Устанавливаем куки...');
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: 24 * 60 * 60, // 24 часа
      path: '/'
    };
    
    console.log('🍪 Настройки куки:', cookieOptions);
    
    response.cookies.set('auth_token', token, cookieOptions);
    
    console.log('✅ Куки установлены');
    console.log('🎉 Вход участника успешен');
    
    // Дополнительная проверка - читаем куки обратно
    const setCookieHeader = response.headers.get('set-cookie');
    console.log('🍪 Set-Cookie заголовок:', setCookieHeader);

    return response;

  } catch (error) {
    console.error('💥 Ошибка входа участника:', error);
    console.error('💥 Stack trace:', error instanceof Error ? error.stack : 'No stack');
    
    return NextResponse.json(
      { 
        error: 'Внутренняя ошибка сервера',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
