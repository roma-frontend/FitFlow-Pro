// app/api/members/create/route.ts (новый файл)
import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from "convex/browser";
import bcrypt from 'bcryptjs';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password, ...memberData } = body;

    // Хешируем пароль
    const hashedPassword = await bcrypt.hash(password, 12);

    // Создаем участника
    const memberId = await convex.mutation("members:create", {
      ...memberData,
      password: hashedPassword,
      role: "member",
      createdAt: Date.now()
    });

    return NextResponse.json({
      success: true,
      memberId
    });

  } catch (error) {
    console.error('Ошибка создания участника:', error);
    return NextResponse.json(
      { error: 'Ошибка создания участника' },
      { status: 500 }
    );
  }
}
