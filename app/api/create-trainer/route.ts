// app/api/create-trainer/route.ts (новый файл)
import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from "convex/browser";
import bcrypt from 'bcryptjs';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

        // Проверяем, существует ли уже пользователь
    const existingUser = await convex.query("users:getByEmail", { email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'Пользователь с таким email уже существует' },
        { status: 400 }
      );
    }

    // Хешируем пароль
    const hashedPassword = await bcrypt.hash(password, 12);

    // Создаем пользователя-тренера
    const userId = await convex.mutation("users:create", {
      email,
      password: hashedPassword,
      name: name || 'Тренер',
      role: 'trainer',
      isActive: true,
      createdAt: Date.now()
    });

    // Создаем запись в таблице тренеров
    const trainerId = await convex.mutation("trainers:create", {
      name: name || 'Тренер',
      email,
      phone: '',
      password: hashedPassword,
      bio: '',
      specializations: ['Персональные тренировки'],
      experience: 1,
      hourlyRate: 2000,
      workingHours: {
        monday: { start: "09:00", end: "18:00" },
        tuesday: { start: "09:00", end: "18:00" },
        wednesday: { start: "09:00", end: "18:00" },
        thursday: { start: "09:00", end: "18:00" },
        friday: { start: "09:00", end: "18:00" }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Тренер создан успешно',
      userId,
      trainerId
    });

  } catch (error) {
    console.error('Ошибка создания тренера:', error);
    return NextResponse.json(
      { error: 'Ошибка создания тренера' },
      { status: 500 }
    );
  }
}

    
