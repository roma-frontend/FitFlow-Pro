// app/api/face-id/authenticate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 API: Аутентификация через Face ID...');
    
    const body = await request.json();
    const { faceDescriptor, sessionId } = body;

    if (!faceDescriptor || !Array.isArray(faceDescriptor)) {
      console.log('❌ API: Некорректный дескриптор лица');
      return NextResponse.json({
        success: false,
        error: 'Дескриптор лица не предоставлен'
      }, { status: 400 });
    }

    console.log('🔍 API: Поиск пользователя по дескриптору лица...');

    // Здесь будет реальный поиск в базе данных
    /* 
    const faceIdRecords = await db.faceId.findMany({
      include: {
        user: true
      }
    });

    let matchedUser = null;
    let bestMatch = 0;
    const SIMILARITY_THRESHOLD = 0.6; // Порог схожести

    for (const record of faceIdRecords) {
      const storedDescriptor = JSON.parse(record.descriptor);
      const similarity = calculateSimilarity(faceDescriptor, storedDescriptor);
      
      if (similarity > SIMILARITY_THRESHOLD && similarity > bestMatch) {
        bestMatch = similarity;
        matchedUser = record.user;
      }
    }

    if (!matchedUser) {
      console.log('❌ API: Пользователь не найден по Face ID');
      return NextResponse.json({
        success: false,
        error: 'Пользователь не найден'
      }, { status: 404 });
    }

    // Обновляем время последнего использования
    await db.faceId.updateMany({
      where: { userId: matchedUser.id },
      data: { lastUsed: new Date() }
    });
    */

    // Имитируем поиск пользователя (для демо)
    const mockUser = {
      id: 'user_' + Math.random().toString(36).substr(2, 9),
      name: 'Тестовый Пользователь',
      email: 'test@example.com',
      role: 'member'
    };

    // Создаем токен для найденного пользователя
    const tokenPayload = {
      userId: mockUser.id,
      name: mockUser.name,
      email: mockUser.email,
      role: mockUser.role,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 часа
    };

    const token = createToken(tokenPayload);

    console.log('✅ API: Пользователь найден и аутентифицирован:', mockUser.email);

    // Создаем ответ с установкой cookie
    const response = NextResponse.json({
      success: true,
      message: 'Аутентификация успешна',
      user: mockUser,
      token: token,
      authenticated: true,
    });

    // Устанавливаем cookie с токеном
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 часа
      path: '/',
    });

    // Устанавливаем cookie с ролью
    response.cookies.set('user_role', mockUser.role, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 часа
      path: '/',
    });

    return response;

  } catch (error) {
    console.error('❌ API: Ошибка аутентификации Face ID:', error);
    return NextResponse.json({
      success: false,
      error: 'Ошибка аутентификации'
    }, { status: 500 });
  }
}

// Функция для расчета схожести дескрипторов (euclidean distance)
function calculateSimilarity(desc1: number[], desc2: number[]): number {
  if (desc1.length !== desc2.length) return 0;
  
  let sum = 0;
  for (let i = 0; i < desc1.length; i++) {
    sum += Math.pow(desc1[i] - desc2[i], 2);
  }
  
  const distance = Math.sqrt(sum);
  // Преобразуем расстояние в схожесть (чем меньше расстояние, тем больше схожесть)
  return Math.max(0, 1 - distance);
}
