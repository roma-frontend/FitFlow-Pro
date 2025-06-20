// app/api/auth/debug-password/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from "convex/browser";
import bcrypt from 'bcryptjs';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

interface PasswordDebugResults {
  inputPassword: string;
  storedPassword: string;
  storedPasswordLength: number;
  bcryptCheck?: boolean;
  bcryptError?: string;
  directCheck?: boolean;
  newHash?: string;
  newHashCheck?: boolean;
  hashError?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    console.log("🔍 Отладка пароля для:", email);

    // Находим пользователя
    const users = await convex.query("users:getAll");
    const user = users.find((u: any) => u.email?.toLowerCase() === email.toLowerCase());

    if (!user) {
      return NextResponse.json({
        error: "Пользователь не найден",
        availableEmails: users.map((u: any) => u.email)
      });
    }

    console.log("👤 Найден пользователь:", {
      name: user.name,
      email: user.email,
      role: user.role,
      hasPassword: !!user.password,
      passwordLength: user.password ? user.password.length : 0,
      passwordStart: user.password ? user.password.substring(0, 10) : "нет"
    });

    // Тестируем разные варианты проверки пароля
    const results: PasswordDebugResults = {
      inputPassword: password,
      storedPassword: user.password ? user.password.substring(0, 20) + "..." : "нет",
      storedPasswordLength: user.password ? user.password.length : 0,
    };

    if (user.password) {
      try {
        // Проверяем хешированный пароль
        const bcryptResult = await bcrypt.compare(password, user.password);
        results.bcryptCheck = bcryptResult;
        console.log("🔑 bcrypt проверка:", bcryptResult);
      } catch (bcryptError) {
        const errorMessage = bcryptError instanceof Error ? bcryptError.message : 'Unknown bcrypt error';
        results.bcryptError = errorMessage;
        console.log("❌ Ошибка bcrypt:", bcryptError);
      }

      // Проверяем прямое сравнение
      const directCheck = password === user.password;
      results.directCheck = directCheck;
      console.log("🔑 Прямое сравнение:", directCheck);

      // Создаем новый хеш для сравнения
      try {
        const newHash = await bcrypt.hash(password, 12);
        results.newHash = newHash.substring(0, 20) + "...";
        
        const newHashCheck = await bcrypt.compare(password, newHash);
        results.newHashCheck = newHashCheck;
        console.log("🔑 Новый хеш работает:", newHashCheck);
      } catch (hashError) {
        const errorMessage = hashError instanceof Error ? hashError.message : 'Unknown hash error';
        results.hashError = errorMessage;
      }
    }

    return NextResponse.json({
      success: true,
      user: {
        name: user.name,
        email: user.email,
        role: user.role
      },
      passwordDebug: results
    });

  } catch (error) {
    console.error('Ошибка отладки:', error);
    return NextResponse.json(
      { error: 'Ошибка: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}
