// app/api/auth/save-face-descriptor/route.ts (новый файл)
import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from "convex/browser";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: NextRequest) {
  try {
    console.log('💾 Сохранение дескриптора лица');

    const body = await request.json();
    const { userId, faceDescriptor } = body;

    if (!userId || !faceDescriptor) {
      return NextResponse.json(
        { error: 'Недостаточно данных' },
        { status: 400 }
      );
    }

    // Сохраняем дескриптор лица в базу данных
    await convex.mutation("users:saveFaceDescriptor", {
      userId,
      faceDescriptor
    });

    console.log('✅ Дескриптор лица сохранен для пользователя:', userId);

    return NextResponse.json({
      success: true,
      message: 'Дескриптор лица сохранен успешно'
    });

  } catch (error) {
    console.error('💥 Ошибка сохранения дескриптора:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
