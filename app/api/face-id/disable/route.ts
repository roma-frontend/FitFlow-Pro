// app/api/face-id/disable/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from "convex/browser";
import jwt from 'jsonwebtoken';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: NextRequest) {
  try {
    console.log('🔒 Face ID Disable: отключаем Face ID...');

    // Проверяем авторизацию
    const token = request.cookies.get('auth_token')?.value;
    
    if (!token || !process.env.JWT_SECRET) {
      return NextResponse.json({
        success: false,
        message: 'Необходима авторизация'
      }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    console.log('👤 Отключаем Face ID для:', decoded.email);

    // Ищем активный Face ID профиль
    const faceProfile = await convex.query("faceProfiles:getByUserId", { 
      userId: decoded.userId 
    });

    if (!faceProfile || !faceProfile.isActive) {
      return NextResponse.json({
        success: false,
        message: 'Face ID профиль не найден или уже отключен'
      }, { status: 404 });
    }

    // Деактивируем профиль
    await convex.mutation("faceProfiles:deactivate", {
      profileId: faceProfile._id
    });

    console.log('✅ Face ID профиль отключен:', faceProfile._id);

    return NextResponse.json({
      success: true,
      message: 'Face ID успешно отключен'
    });

  } catch (error) {
    console.error('❌ Face ID Disable: ошибка:', error);
    return NextResponse.json({
      success: false,
      message: 'Ошибка при отключении Face ID'
    }, { status: 500 });
  }
}
