// app/api/face-id/register/route.ts
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  try {
    console.log('📝 Face ID Register: начало регистрации Face ID...');

    const body = await request.json();
    const { descriptor, confidence, metadata } = body;

    console.log('📝 Получены данные:', {
      hasDescriptor: !!descriptor,
      descriptorLength: descriptor?.length,
      confidence
    });

    // Валидация данных
    if (!descriptor || descriptor.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Недостаточно данных лица для регистрации'
      }, { status: 400 });
    }

    if (confidence < 75) {
      return NextResponse.json({
        success: false,
        message: 'Качество изображения слишком низкое (требуется минимум 75%)'
      }, { status: 400 });
    }

    // Проверяем авторизацию
    const token = request.cookies.get('auth_token')?.value;
    
    if (!token || !process.env.JWT_SECRET) {
      return NextResponse.json({
        success: false,
        message: 'Необходима авторизация'
      }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    console.log('👤 Регистрируем Face ID для:', decoded.email);

    // ✅ ДЕМО ВЕРСИЯ - просто возвращаем успех без реальной БД
    const fakeProfileId = `face_profile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.log('✅ Face ID профиль создан (демо):', fakeProfileId);

    // ✅ СОЗДАЕМ ТОКЕН ДЛЯ СОХРАНЕНИЯ FACE ID РЕГИСТРАЦИИ
    const faceIdTokenPayload = {
      userId: decoded.userId,
      email: decoded.email,
      name: decoded.name,
      role: decoded.role,
      profileId: fakeProfileId,
      registeredAt: Date.now()
    };

    const faceIdToken = jwt.sign(faceIdTokenPayload, process.env.JWT_SECRET!, {
      expiresIn: '30d' // Face ID токен на 30 дней
    });

    console.log('🔐 Face ID токен создан для:', decoded.name);

    // Создаем response
    const response = NextResponse.json({
      success: true,
      message: 'Face ID успешно зарегистрирован!',
      profileId: fakeProfileId,
      confidence: confidence,
      userId: decoded.userId
    });

    // ✅ УСТАНАВЛИВАЕМ COOKIE ДЛЯ FACE ID РЕГИСТРАЦИИ
    const faceIdCookieOptions = [
      `face_id_registered=${faceIdToken}`,
      'HttpOnly',
      'Path=/',
      `Max-Age=${30 * 24 * 60 * 60}`, // 30 дней
      'SameSite=Lax'
    ];

    if (process.env.NODE_ENV === 'production') {
      faceIdCookieOptions.push('Secure');
    }

    response.headers.set('Set-Cookie', faceIdCookieOptions.join('; '));

    console.log('✅ Face ID регистрация завершена с сохранением токена');

    return response;

  } catch (error) {
    console.error('❌ Face ID Register: ошибка:', error);
    return NextResponse.json({
      success: false,
      message: 'Ошибка при регистрации Face ID',
      error: error instanceof Error ? error.message : 'Неизвестная ошибка'
    }, { status: 500 });
  }
}
