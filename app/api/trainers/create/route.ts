// app/api/trainers/create/route.ts (новый файл)
import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from "convex/browser";
import bcrypt from 'bcryptjs';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password, ...trainerData } = body;

    // Хешируем пароль
    const hashedPassword = await bcrypt.hash(password, 12);

    // Создаем тренера
    const trainerId = await convex.mutation("trainers:create", {
      ...trainerData,
      password: hashedPassword
    });

    return NextResponse.json({
      success: true,
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
