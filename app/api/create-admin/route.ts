// app/api/create-admin/route.ts (новый файл)
import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from "convex/browser";
import bcrypt from 'bcryptjs';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    // Проверяем, существует ли уже админ
    const existingAdmin = await convex.query("users:getByEmail", { email });
    if (existingAdmin) {
      return NextResponse.json(
        { error: 'Пользователь с таким email уже существует' },
        { status: 400 }
      );
    }

    // Хешируем пароль
    const hashedPassword = await bcrypt.hash(password, 12);

    // Создаем администратора
    const userId = await convex.mutation("users:create", {
      email,
      password: hashedPassword,
      name: name || 'Администратор',
      role: 'admin',
      isActive: true,
      createdAt: Date.now()
    });

    return NextResponse.json({
      success: true,
      message: 'Администратор создан успешно',
      userId
    });

  } catch (error) {
    console.error('Ошибка создания администратора:', error);
    return NextResponse.json(
      { error: 'Ошибка создания администратора' },
      { status: 500 }
    );
  }
}
