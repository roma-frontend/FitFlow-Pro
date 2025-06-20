// app/api/auth/staff-register/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from "convex/browser";
import bcrypt from 'bcryptjs';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: NextRequest) {
  console.log('📝 Попытка регистрации персонала');
  
  try {
    const body = await request.json();
    const { email, password, firstName, lastName, role = 'staff' } = body;

    console.log('📧 Данные регистрации:', { email, firstName, lastName, role });

    // Валидация
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Все поля обязательны' },
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
    const newUser = await convex.mutation("users:create", {
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      name: `${firstName} ${lastName}`,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      role: role,
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now()
    });

    console.log('✅ Пользователь создан:', newUser);

    return NextResponse.json({
      success: true,
      message: 'Регистрация успешна',
      user: {
        id: newUser,
        email: email,
        name: `${firstName} ${lastName}`,
        role: role
      }
    });

  } catch (error) {
    console.error('💥 Ошибка регистрации персонала:', error);
    
    return NextResponse.json(
      { 
        error: 'Внутренняя ошибка сервера',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
