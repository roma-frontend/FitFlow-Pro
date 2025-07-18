// app/api/auth/face-register/route.ts - ИСПРАВЛЕННАЯ ВЕРСИЯ с Convex
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/simple-auth';
import { faceIdStorage } from '@/lib/face-id-storage';
import { ConvexHttpClient } from "convex/browser";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

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

  let screenResolution = '1920x1080';
  if (userAgent.includes('Mobile')) {
    screenResolution = '390x844';
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

    // ✅ Получаем текущего пользователя
    const authToken = request.cookies.get('auth_token')?.value;
    const sessionId = request.cookies.get('session_id')?.value;
    const sessionIdDebug = request.cookies.get('session_id_debug')?.value;
    const token = authToken || sessionId || sessionToken || sessionIdDebug;

    if (!token) {
      return NextResponse.json({
        success: false,
        message: 'Необходимо войти в систему для регистрации Face ID'
      }, { status: 401 });
    }

    const userSession = await getSession(token);
    if (!userSession || !userSession.user) {
      return NextResponse.json({
        success: false,
        message: 'Сессия истекла. Пожалуйста, войдите заново.'
      }, { status: 401 });
    }

    const currentUser = userSession.user;
    console.log('👤 Пользователь найден:', {
      id: currentUser.id,
      email: currentUser.email,
      name: currentUser.name,
      role: currentUser.role
    });

    // ✅ Проверяем существующие профили в Convex
    const existingProfiles = await convex.query("faceProfiles:getByUserId", {
      userId: currentUser.id,
      userType: "user"
    });

    if (existingProfiles) {
      console.log('🔍 Найден существующий профиль, обновляем...');
      
      // Обновляем существующий профиль
      await convex.mutation("faceProfiles:updateFaceDescriptor", {
        profileId: existingProfiles._id,
        faceDescriptor: descriptor,
        confidence: confidence
      });

      console.log('✅ Face ID профиль обновлен');
    } else {
      // ✅ Создаем новый Face ID профиль в Convex
      console.log('📝 Создаем новый Face ID профиль в Convex...');
      
      const deviceInfo = getDeviceInfo(request);
      
      const convexProfileId = await convex.mutation("faceProfiles:create", {
        userId: currentUser.id,
        faceDescriptor: descriptor,
        confidence: confidence,
        registeredAt: Date.now(),
        isActive: true,
        metadata: {
          registrationMethod: metadata?.source || 'web_app',
          userAgent: deviceInfo.userAgent,
          deviceInfo: JSON.stringify(deviceInfo)
        }
      });

      console.log('✅ Face ID профиль создан в Convex:', convexProfileId);
    }

    // ✅ Также сохраняем в локальное хранилище для быстрого доступа
    const profile = await faceIdStorage.createProfile({
      userId: currentUser.id,
      userEmail: currentUser.email,
      userName: currentUser.name || currentUser.email,
      userRole: currentUser.role,
      descriptor,
      confidence,
      deviceInfo: getDeviceInfo(request)
    });

    console.log('✅ Face ID профиль создан локально:', profile.id);

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

    response.cookies.set('face_id_profile', profile.id, {
      httpOnly: false,
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

    return NextResponse.json({
      success: false,
      message: 'Внутренняя ошибка сервера при регистрации Face ID',
      error: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    }, { status: 500 });
  }
}

// ✅ GET метод для проверки статуса Face ID
export async function GET(request: NextRequest) {
  try {
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

    // Проверяем профиль в Convex
    const convexProfile = await convex.query("faceProfiles:getByUserId", {
      userId: profile.userId,
      userType: "user"
    });

    const stats = await faceIdStorage.getStats();

    return NextResponse.json({
      registered: true,
      profile: {
        id: profile.id,
        createdAt: profile.createdAt,
        lastUsedAt: profile.lastUsedAt,
        usageCount: profile.usageCount,
        deviceInfo: profile.deviceInfo,
        hasConvexProfile: !!convexProfile
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

    // Деактивируем профиль в Convex
    const convexProfile = await convex.query("faceProfiles:getByUserId", {
      userId: session.user.id,
      userType: "user"
    });

    if (convexProfile) {
      await convex.mutation("faceProfiles:deactivate", {
        profileId: convexProfile._id
      });
      console.log('✅ Face ID профиль деактивирован в Convex');
    }

    // Деактивируем локальные профили
    const deactivatedCount = await faceIdStorage.deactivateUserProfiles(session.user.id);

    console.log(`🗑️ Деактивировано ${deactivatedCount} Face ID профилей для пользователя ${session.user.id}`);

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