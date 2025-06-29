// app/api/auth/create-admin-direct/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from "convex/browser";
import bcrypt from 'bcryptjs';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    console.log("🆕 Создание администратора:", { name, email });

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Все поля обязательны' },
        { status: 400 }
      );
    }

    // Проверяем, существует ли пользователь
    const users = await convex.query("users:getAll");
    const existingUser = users.find((u: any) => u.email?.toLowerCase() === email.toLowerCase());

    if (existingUser) {
      console.log("⚠️ Пользователь уже существует, обновляем роль");
      
      // Обновляем существующего пользователя
      await convex.mutation("users:updateRole", {
        userId: existingUser._id,
        role: "admin"
      });

      return NextResponse.json({
        success: true,
        message: 'Существующий пользователь назначен администратором',
        userId: existingUser._id,
        action: 'updated'
      });
    }

    // Хешируем пароль
    const hashedPassword = await bcrypt.hash(password, 12);

    // Создаем нового пользователя
    const userId = await convex.mutation("users:create", {
      name,
      email,
      password: hashedPassword,
      role: "admin",
      createdAt: Date.now(),
    });

    console.log("✅ Новый администратор создан:", userId);

    return NextResponse.json({
      success: true,
      message: 'Администратор успешно создан',
      userId,
      action: 'created'
    });

  } catch (error) {
    console.error('❌ Ошибка создания администратора:', error);
    return NextResponse.json(
      { error: 'Ошибка создания: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}
