// app/api/auth/face-register/route.ts - ИСПРАВЛЕННАЯ ВЕРСИЯ с детальным логированием
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/simple-auth';
import { faceIdStorage } from '@/lib/face-id-storage';
import { jwtVerify } from 'jose';

interface FaceRegisterRequest {
  descriptor: number[];
  confidence: number;
  sessionToken?: string;
  metadata?: {
    source?: string;
    timestamp?: number;
  };
}

// Функция для получения информации об устройстве
function getDeviceInfo(request: NextRequest) {
  const userAgent = request.headers.get('user-agent') || 'Unknown';
  const platform = request.headers.get('sec-ch-ua-platform') || 'Unknown';

  // Определяем разрешение экрана из User-Agent (приблизительно)
  let screenResolution = '1920x1080'; // По умолчанию

  if (userAgent.includes('Mobile')) {
    screenResolution = '390x844'; // iPhone 13
  } else if (userAgent.includes('iPad')) {
    screenResolution = '1024x768';
  }

  return {
    userAgent,
    platform: platform.replace(/"/g, ''),
    screenResolution
  };
}

export async function POST(request: NextRequest) {
  console.log('📸 Face Register API: начало регистрации Face ID');

  try {
    const body: FaceRegisterRequest = await request.json();
    const { descriptor, confidence, sessionToken, metadata } = body;

    console.log('📸 Face Register: получены данные:', {
      hasDescriptor: !!descriptor,
      descriptorLength: descriptor?.length,
      confidence,
      hasSessionToken: !!sessionToken,
      metadata
    });

    // ✅ Валидация данных
    if (!descriptor || descriptor.length < 128) {
      return NextResponse.json({
        success: false,
        message: 'Недостаточно данных лица для регистрации. Требуется дескриптор из 128 значений.'
      }, { status: 400 });
    }

    if (confidence < 70) {
      return NextResponse.json({
        success: false,
        message: 'Качество изображения слишком низкое для регистрации Face ID'
      }, { status: 400 });
    }

    // ✅ Проверяем JWT_SECRET
    const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-change-in-production';
    console.log('🔐 JWT_SECRET статус:', {
      isSet: !!process.env.JWT_SECRET,
      usingFallback: !process.env.JWT_SECRET,
      envMode: process.env.NODE_ENV
    });

    // ✅ Получаем текущего пользователя
    let currentUser = null;
    let userSession = null;

    // Получаем токен из cookies или параметра
    const authToken = request.cookies.get('auth_token')?.value;
    const sessionId = request.cookies.get('session_id')?.value;
    const sessionIdDebug = request.cookies.get('session_id_debug')?.value;
    const userRole = request.cookies.get('user_role')?.value;
    const token = authToken || sessionId || sessionToken || sessionIdDebug;

    console.log('🍪 Проверяем авторизацию:', {
      hasAuthToken: !!authToken,
      hasSessionId: !!sessionId,
      hasSessionToken: !!sessionToken,
      hasSessionIdDebug: !!sessionIdDebug,
      userRole,
      usingToken: token ? token.substring(0, 20) + '...' : 'none'
    });

    if (!token) {
      return NextResponse.json({
        success: false,
        message: 'Необходимо войти в систему для регистрации Face ID',
        debug: {
          cookies: request.cookies.getAll().map(c => c.name)
        }
      }, { status: 401 });
    }

    // ✅ НОВОЕ: Детальная проверка JWT токена
    console.log('🔍 Проверяем JWT токен напрямую...');
    try {
      const secret = new TextEncoder().encode(JWT_SECRET);

      const { payload } = await jwtVerify(token, secret);
      console.log('✅ JWT payload:', {
        userId: payload.userId,
        userRole: payload.userRole,
        userEmail: payload.userEmail,
        hasSessionData: !!payload.sessionData,
        exp: payload.exp,
        iat: payload.iat
      });
    } catch (jwtError) {
      console.error('❌ JWT проверка провалилась:', jwtError);
      console.log('🔍 Детали ошибки:', {
        errorName: jwtError instanceof Error ? jwtError.name : 'Unknown',
        errorMessage: jwtError instanceof Error ? jwtError.message : String(jwtError),
        tokenLength: token.length,
        tokenStart: token.substring(0, 20) + '...'
      });
    }

    // Проверяем сессию
    console.log('🔍 Проверяем сессию через getSession...');
    userSession = await getSession(token);

    if (!userSession || !userSession.user) {
      console.log('❌ Сессия не найдена или недействительна');
      console.log('🔍 Детали проверки сессии:', {
        hasSession: !!userSession,
        hasUser: userSession ? !!userSession.user : false,
        tokenType: authToken ? 'auth_token' : sessionId ? 'session_id' : 'session_token'
      });

      return NextResponse.json({
        success: false,
        message: 'Сессия истекла. Пожалуйста, войдите заново.',
        debug: {
          hasJwtSecret: !!process.env.JWT_SECRET,
          tokenType: authToken ? 'auth_token' : sessionId ? 'session_id' : 'session_token',
          userRole: userRole,
          tokenLength: token.length
        }
      }, { status: 401 });
    }

    currentUser = userSession.user;
    console.log('👤 Пользователь найден:', {
      id: currentUser.id,
      email: currentUser.email,
      name: currentUser.name,
      role: currentUser.role
    });

    // ✅ Проверяем, есть ли уже активные Face ID профили у пользователя
    const existingProfiles = await faceIdStorage.getUserProfiles(currentUser.id);
    console.log('🔍 Существующие профили:', existingProfiles.length);

    // Деактивируем старые профили (оставляем только 3 последних)
    if (existingProfiles.length >= 3) {
      // Сортируем по дате создания
      existingProfiles.sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      // Деактивируем все, кроме 2 последних (так как добавим новый)
      for (let i = 2; i < existingProfiles.length; i++) {
        await faceIdStorage.deactivateProfile(existingProfiles[i].id);
        console.log('🗑️ Деактивирован старый профиль:', existingProfiles[i].id);
      }
    }

    // ✅ Получаем информацию об устройстве
    const deviceInfo = getDeviceInfo(request);

    // ✅ Создаем новый Face ID профиль
    const profile = await faceIdStorage.createProfile({
      userId: currentUser.id,
      userEmail: currentUser.email,
      userName: currentUser.name || currentUser.email,
      userRole: currentUser.role,
      descriptor,
      confidence,
      deviceInfo
    });

    console.log('✅ Face ID профиль создан:', profile.id);

    // ✅ Создаем токен для Face ID
    const faceIdToken = faceIdStorage.createFaceIdToken(profile);

    // ✅ Создаем response с установкой cookies
    const response = NextResponse.json({
      success: true,
      message: `Face ID успешно зарегистрирован для ${currentUser.name || currentUser.email}`,
      profileId: profile.id,
      user: {
        id: currentUser.id,
        name: currentUser.name,
        email: currentUser.email,
        role: currentUser.role
      },
      stats: {
        totalProfiles: existingProfiles.length + 1,
        activeProfiles: existingProfiles.filter(p => p.isActive).length + 1
      }
    });

    // ✅ Устанавливаем cookie для Face ID
    response.cookies.set('face_id_registered', faceIdToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 дней
      path: '/'
    });

    // Также сохраняем ID профиля для быстрого доступа
    response.cookies.set('face_id_profile', profile.id, {
      httpOnly: false, // Доступен из JS
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60,
      path: '/'
    });

    console.log('✅ Face ID cookies установлены');

    return response;

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
    console.error('❌ Face Register API: ошибка:', error);
    console.log('🔍 Stack trace:', error instanceof Error ? error.stack : 'No stack trace');

    return NextResponse.json({
      success: false,
      message: 'Внутренняя ошибка сервера при регистрации Face ID',
      error: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
      stack: process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}

// ✅ GET метод для проверки статуса Face ID
export async function GET(request: NextRequest) {
  try {
    // Получаем токен из cookies
    const faceIdToken = request.cookies.get('face_id_registered')?.value;
    const profileId = request.cookies.get('face_id_profile')?.value;

    if (!faceIdToken) {
      return NextResponse.json({
        registered: false,
        message: 'Face ID не зарегистрирован'
      });
    }

    // Проверяем валидность токена
    const profile = await faceIdStorage.validateFaceIdToken(faceIdToken);

    if (!profile) {
      return NextResponse.json({
        registered: false,
        message: 'Face ID токен недействителен или истек'
      });
    }

    // Получаем статистику использования
    const stats = await faceIdStorage.getStats();

    return NextResponse.json({
      registered: true,
      profile: {
        id: profile.id,
        createdAt: profile.createdAt,
        lastUsedAt: profile.lastUsedAt,
        usageCount: profile.usageCount,
        deviceInfo: profile.deviceInfo
      },
      user: {
        id: profile.userId,
        name: profile.userName,
        email: profile.userEmail
      },
      stats
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
    console.error('❌ Face Register GET: ошибка:', error);

    return NextResponse.json({
      registered: false,
      message: 'Ошибка проверки статуса Face ID',
      error: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    }, { status: 500 });
  }
}

// ✅ DELETE метод для удаления Face ID профиля
export async function DELETE(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value ||
      request.cookies.get('session_id')?.value;

    if (!token) {
      return NextResponse.json({
        success: false,
        message: 'Не авторизован'
      }, { status: 401 });
    }

    const session = await getSession(token);
    if (!session || !session.user) {
      return NextResponse.json({
        success: false,
        message: 'Сессия недействительна'
      }, { status: 401 });
    }

    // Деактивируем все Face ID профили пользователя
    const deactivatedCount = await faceIdStorage.deactivateUserProfiles(session.user.id);

    console.log(`🗑️ Деактивировано ${deactivatedCount} Face ID профилей для пользователя ${session.user.id}`);

    // Очищаем cookies
    const response = NextResponse.json({
      success: true,
      message: 'Face ID профили удалены',
      deactivatedCount
    });

    response.cookies.delete('face_id_registered');
    response.cookies.delete('face_id_profile');

    return response;

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
    console.error('❌ Face Register DELETE: ошибка:', error);

    return NextResponse.json({
      success: false,
      message: 'Ошибка при удалении Face ID профиля',
      error: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    }, { status: 500 });
  }
}