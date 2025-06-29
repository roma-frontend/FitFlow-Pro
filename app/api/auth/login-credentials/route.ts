// app/api/auth/login-credentials/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from "convex/browser";
import { createToken } from '@/lib/auth';
import bcrypt from 'bcryptjs';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    console.log("🔐 Попытка входа для:", email);
    console.log("📋 Получен пароль длиной:", password?.length);

    if (!email || !password) {
      console.log("❌ Отсутствуют email или пароль");
      return NextResponse.json(
        { error: 'Email и пароль обязательны' },
        { status: 400 }
      );
    }

    // Находим пользователя по email
    const users = await convex.query("users:getAll");
    console.log("👥 Всего пользователей в базе:", users.length);
    console.log("📧 Доступные emails:", users.map((u: any) => u.email));
    
    const user = users.find((u: any) => u.email?.toLowerCase() === email.toLowerCase());

    if (!user) {
      console.log("❌ Пользователь не найден для email:", email);
      return NextResponse.json(
        { error: 'Неверный email или пароль' },
        { status: 401 }
      );
    }

    console.log("✅ Пользователь найден:", {
      name: user.name,
      email: user.email,
      role: user.role,
      hasPassword: !!user.password,
      passwordLength: user.password ? user.password.length : 0,
      passwordStart: user.password ? user.password.substring(0, 10) + "..." : "нет"
    });

    // Проверяем пароль
    let isValidPassword = false;
    
    if (!user.password) {
      console.log("❌ У пользователя нет пароля");
      return NextResponse.json(
        { error: 'Пользователь не может войти по паролю' },
        { status: 401 }
      );
    }

    try {
      isValidPassword = await bcrypt.compare(password, user.password);
      console.log("🔑 Проверка bcrypt:", isValidPassword);
      
      if (!isValidPassword) {
        isValidPassword = password === user.password;
        console.log("🔑 Прямое сравнение:", isValidPassword);
      }
    } catch (bcryptError) {
      console.log("⚠️ Ошибка bcrypt:", bcryptError);
      isValidPassword = password === user.password;
      console.log("🔑 Прямое сравнение после ошибки bcrypt:", isValidPassword);
    }

    if (!isValidPassword) {
      console.log("❌ Неверный пароль");
      console.log("🔍 Отладка пароля:");
      console.log("  - Введенный пароль:", password);
      console.log("  - Сохраненный пароль (первые 20 символов):", user.password.substring(0, 20));
      console.log("  - Длина введенного:", password.length);
      console.log("  - Длина сохраненного:", user.password.length);
      
      return NextResponse.json(
        { error: 'Неверный email или пароль' },
        { status: 401 }
      );
    }

    let userRole = user.role || 'user';
    
    if (email.toLowerCase() === 'romangulanyan@gmail.com') {
      userRole = 'admin';
      console.log("👑 Принудительно устанавливаем роль администратора");
    }

    console.log("🎭 Итоговая роль пользователя:", userRole);

    const token = await createToken({
      userId: user._id,
      name: user.name,
      email: user.email,
      role: userRole,
    });

    console.log("🎫 Токен создан успешно");

    const response = NextResponse.json({
      success: true,
      user: {
        userId: user._id,
        name: user.name,
        email: user.email,
        role: userRole
      }
    });

    response.cookies.set('auth_token', token, {
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 8,
      sameSite: 'strict',
    });

    response.cookies.set('user_role', userRole, {
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 8,
      sameSite: 'strict',
    });

    console.log("🍪 Cookies установлены");

    try {
      await convex.mutation("accessLogs:create", {
        userId: user._id,
        success: true,
        deviceInfo: request.headers.get('user-agent') || undefined,
        ipAddress: request.headers.get('x-forwarded-for')?.split(',')[0] || undefined,
      });
      console.log("📝 Лог успешного входа записан");
    } catch (logError) {
      console.warn('⚠️ Не удалось записать лог успешного входа:', logError);
    }

    console.log("✅ Успешный вход пользователя:", user.name, "с ролью:", userRole);

    return response;

  } catch (error) {
    console.error('❌ Общая ошибка входа:', error);
    return NextResponse.json(
      { error: 'Ошибка сервера при входе: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}
