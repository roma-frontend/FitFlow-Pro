import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';

// Создаем HTTP клиент для Convex
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  const userType = searchParams.get('type') as 'staff' | 'member' || 'member';

  if (!token) {
    return NextResponse.json(
      { error: 'Токен подтверждения не найден' },
      { status: 400 }
    );
  }

  try {
    // Используем строковый путь вместо FunctionReference
    const result = await convex.mutation('auth:verifyEmail', { 
      token, 
      userType 
    });

    if (result.success) {
      return NextResponse.json({
        message: 'Email успешно подтвержден!',
        verified: true
      });
    } else {
      return NextResponse.json(
        { error: result.error || 'Недействительный или истекший токен' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { error: 'Ошибка подтверждения email' },
      { status: 500 }
    );
  }
}
