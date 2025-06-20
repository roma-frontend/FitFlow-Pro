// app/api/auth/face-login/route.ts - ТОЛЬКО РЕАЛЬНЫЕ ПОЛЬЗОВАТЕЛИ
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  try {
    console.log('👤 Face Login: начало входа через Face ID');

    const body = await request.json();
    const { descriptor, confidence } = body;

    // Базовая валидация
    if (!descriptor || descriptor.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Недостаточно данных лица для входа'
      }, { status: 400 });
    }

    if (confidence < 60) {
      return NextResponse.json({
        success: false,
        message: 'Качество распознавания слишком низкое'
      }, { status: 400 });
    }

    // ✅ ПРОВЕРЯЕМ есть ли СОХРАНЕННЫЙ Face ID профиль
    // В реальной системе это была бы проверка БД
    // Для демо проверяем localStorage через специальный cookie
    
    const faceIdToken = request.cookies.get('face_id_registered')?.value;
    
    if (!faceIdToken) {
      console.log('❌ Face ID профиль не зарегистрирован');
      return NextResponse.json({
        success: false,
        message: 'Face ID профиль не найден. Сначала войдите обычным способом и зарегистрируйте Face ID в дашборде.'
      }, { status: 404 });
    }

    // ✅ ПОЛУЧАЕМ ДАННЫЕ ЗАРЕГИСТРИРОВАННОГО ПОЛЬЗОВАТЕЛЯ
    let registeredUser = null;
    
    try {
      if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET не установлен');
      }
      
      registeredUser = jwt.verify(faceIdToken, process.env.JWT_SECRET) as any;
      console.log('👤 Найден зарегистрированный Face ID для:', registeredUser.name);
      
    } catch (error) {
      console.log('❌ Неверный Face ID токен');
      return NextResponse.json({
        success: false,
        message: 'Face ID регистрация устарела. Пожалуйста, зарегистрируйте Face ID заново.'
      }, { status: 401 });
    }

    // ✅ СОЗДАЕМ НОВЫЙ ТОКЕН ДЛЯ ВХОДА
    const newToken = jwt.sign({
      userId: registeredUser.userId,
      email: registeredUser.email,
      role: registeredUser.role,
      name: registeredUser.name
    }, process.env.JWT_SECRET, {
      expiresIn: '24h'
    });

    // Создаем response с токеном
    const response = NextResponse.json({
      success: true,
      message: `Добро пожаловать, ${registeredUser.name}!`,
      user: {
        id: registeredUser.userId,
        name: registeredUser.name,
        email: registeredUser.email,
        role: registeredUser.role
      },
      authMethod: "face_recognition"
    });

    // ✅ УСТАНАВЛИВАЕМ COOKIE ДЛЯ АВТОРИЗАЦИИ
    const cookieOptions = [
      `auth_token=${newToken}`,
      'HttpOnly',
      'Path=/',
      `Max-Age=${24 * 60 * 60}`,
      'SameSite=Lax'
    ];

    if (process.env.NODE_ENV === 'production') {
      cookieOptions.push('Secure');
    }

    response.headers.set('Set-Cookie', cookieOptions.join('; '));

    console.log('✅ Face ID вход успешен для:', registeredUser.name);
    return response;

  } catch (error) {
    console.error('❌ Face Login: ошибка:', error);
    return NextResponse.json({
      success: false,
      message: 'Ошибка сервера при входе через Face ID'
    }, { status: 500 });
  }
}
