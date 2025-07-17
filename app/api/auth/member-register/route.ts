// app/api/auth/member-register/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from "convex/browser";
import bcrypt from 'bcryptjs';
import { createSession, type User } from '@/lib/simple-auth';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: NextRequest) {
  console.log('📝 Попытка регистрации участника');
  
  try {
    const body = await request.json();
    const { email, password, name, phone } = body;

    console.log('📧 Данные регистрации:', { email, name, phone });

    // Валидация
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, пароль и имя обязательны' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Пароль должен содержать минимум 6 символов' },
        { status: 400 }
      );
    }

    // Проверяем, что пользователь не существует
    console.log('🔍 Проверка существования пользователя...');
    const existingUser = await convex.query("users:getByEmail", { email });

    if (existingUser) {
      console.log('❌ Пользователь уже существует');
      return NextResponse.json(
        { error: 'Пользователь с таким email уже существует' },
        { status: 409 }
      );
    }

    // Хешируем пароль
    console.log('🔐 Хеширование пароля...');
    const hashedPassword = await bcrypt.hash(password, 12);

    // Создаем пользователя
    console.log('👤 Создание пользователя...');
    const newUserId = await convex.mutation("users:create", {
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      name: name.trim(),
      role: 'member', // Всегда member для этого endpoint
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      ...(phone && { phone: phone.trim() })
    });

    console.log('✅ Пользователь создан:', newUserId);

    // Создаем сессию для нового пользователя
    const fullUser: User = {
      id: newUserId,
      email: email.toLowerCase().trim(),
      role: 'member',
      name: name.trim(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const token = await createSession(fullUser);

    const responseData = {
      success: true,
      message: 'Регистрация успешна',
      user: {
        id: newUserId,
        email: email,
        name: name,
        role: 'member'
      },
      token,
      dashboardUrl: '/member-dashboard'
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
    
    // Устанавливаем оба cookie для совместимости
    response.cookies.set('auth_token', token, cookieOptions);
    response.cookies.set('session_id', token, cookieOptions);
    
    // Устанавливаем роль пользователя
    response.cookies.set('user_role', 'member', {
      ...cookieOptions,
      httpOnly: false
    });
    
    // В development добавляем debug cookie
    if (process.env.NODE_ENV === 'development') {
      response.cookies.set('session_id_debug', token, {
        ...cookieOptions,
        httpOnly: false
      });
    }

    return response;

  } catch (error) {
    console.error('💥 Ошибка регистрации участника:', error);
    
    return NextResponse.json(
      { 
        error: 'Внутренняя ошибка сервера',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}