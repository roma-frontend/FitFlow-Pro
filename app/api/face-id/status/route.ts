// app/api/face-id/status/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from "convex/browser";
import jwt from 'jsonwebtoken';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Face ID Status: проверяем статус Face ID...');

    // Получаем токен из cookies
    const token = request.cookies.get('auth_token')?.value;

    if (!token || !process.env.JWT_SECRET) {
      return NextResponse.json({
        success: false,
        message: 'Не авторизован',
        isEnabled: false
      }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    console.log('👤 Проверяем Face ID для пользователя:', decoded.email);

    // Ищем Face ID профиль пользователя
    const faceProfile = await convex.query("faceProfiles:getByUserId", {
      userId: decoded.userId
    });

    if (!faceProfile || !faceProfile.isActive) {
      console.log('❌ Face ID профиль не найден или неактивен');
      return NextResponse.json({
        success: true,
        isEnabled: false,
        message: 'Face ID не настроен (демо версия)'
      });
    }

    console.log('✅ Face ID профиль найден:', {
      profileId: faceProfile._id,
      registeredAt: faceProfile.registeredAt,
      lastUsed: faceProfile.lastUsed
    });

    return NextResponse.json({
      success: true,
      isEnabled: true,
      dateRegistered: new Date(faceProfile.registeredAt).toISOString(),
      lastUsed: faceProfile.lastUsed ? new Date(faceProfile.lastUsed).toISOString() : undefined,
      deviceCount: 1,
      confidence: faceProfile.confidence || 0
    });

  } catch (error) {
    console.error('❌ Face ID Status: ошибка:', error);
    return NextResponse.json({
      success: false,
      message: 'Ошибка проверки статуса Face ID',
      isEnabled: false
    }, { status: 500 });
  }
}
