// app/api/auth/face-login/route.ts - Полноценный вход через Face ID
import { NextRequest, NextResponse } from 'next/server';
import { createSession } from '@/lib/simple-auth';
import { faceIdStorage } from '@/lib/face-id-storage';
import jwt from 'jsonwebtoken';
import { UserRole } from '@/lib/permissions';

interface FaceLoginRequest {
  descriptor: number[];
  confidence: number;
  faceFingerprint?: string;
  metadata?: {
    source?: string;
    timestamp?: number;
  };
}

// Порог схожести для Face ID (0.6 = 60% схожести)
const SIMILARITY_THRESHOLD = parseFloat(process.env.FACE_ID_THRESHOLD || '0.6');

// Минимальная уверенность для входа
const MIN_CONFIDENCE = 60;

export async function POST(request: NextRequest) {
  console.log('👤 Face Login: начало входа через Face ID');
  const startTime = Date.now();

  try {
    const body: FaceLoginRequest = await request.json();
    const { descriptor, confidence, faceFingerprint, metadata } = body;

    console.log('👤 Face Login: получены данные:', {
      hasDescriptor: !!descriptor,
      descriptorLength: descriptor?.length,
      confidence,
      hasFaceFingerprint: !!faceFingerprint,
      metadata
    });

    // ✅ Базовая валидация
    if (!descriptor || descriptor.length < 128) {
      return NextResponse.json({
        success: false,
        message: 'Недостаточно данных лица для входа'
      }, { status: 400 });
    }

    if (confidence < MIN_CONFIDENCE) {
      return NextResponse.json({
        success: false,
        message: `Качество распознавания слишком низкое (${confidence}%). Минимум ${MIN_CONFIDENCE}%`
      }, { status: 400 });
    }

    // ✅ Поиск соответствующего Face ID профиля по дескриптору
    console.log('🔍 Поиск Face ID профиля по дескриптору...');
    
    const match = await faceIdStorage.findByDescriptor(descriptor, SIMILARITY_THRESHOLD);
    
    if (!match) {
      console.log('❌ Face ID профиль не найден (схожесть ниже порога)');
      
      // Логируем для отладки
      const stats = await faceIdStorage.getStats();
      console.log('📊 Статистика Face ID:', stats);
      
      return NextResponse.json({
        success: false,
        message: 'Face ID не распознан. Убедитесь, что вы зарегистрировали Face ID в системе.',
        debug: process.env.NODE_ENV === 'development' ? {
          threshold: SIMILARITY_THRESHOLD,
          totalProfiles: stats.totalProfiles,
          activeProfiles: stats.activeProfiles
        } : undefined
      }, { status: 404 });
    }

    const { profile, similarity } = match;
    
    console.log('✅ Face ID профиль найден:', {
      profileId: profile.id,
      userId: profile.userId,
      userName: profile.userName,
      similarity: `${(similarity * 100).toFixed(1)}%`,
      confidence: `${confidence}%`
    });

    // ✅ Дополнительная проверка качества совпадения
    const combinedScore = (similarity + confidence / 100) / 2;
    if (combinedScore < 0.65) { // 65% комбинированный порог
      console.log('⚠️ Низкий комбинированный score:', combinedScore);
      return NextResponse.json({
        success: false,
        message: 'Недостаточная уверенность в распознавании. Попробуйте улучшить освещение.'
      }, { status: 400 });
    }

    // ✅ Обновляем статистику использования
    await faceIdStorage.updateUsageStats(profile.id);

    // ✅ Создаем сессию для пользователя
    console.log('🔐 Создаем сессию для пользователя:', profile.userId);
    
    const sessionToken = await createSession({
      id: profile.userId,
      email: profile.userEmail,
      role: profile.userRole as UserRole,
      name: profile.userName,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // ✅ Создаем новый Face ID токен
    const faceIdToken = faceIdStorage.createFaceIdToken(profile);

    // ✅ Определяем URL дашборда по роли
    const dashboardUrls: Record<string, string> = {
      'admin': '/admin',
      'super-admin': '/admin',
      'manager': '/manager-dashboard',
      'trainer': '/trainer-dashboard',
      'client': '/member-dashboard',
      'member': '/member-dashboard',
    };

    const dashboardUrl = dashboardUrls[profile.userRole] || '/member-dashboard';

    // ✅ Создаем response
    const response = NextResponse.json({
      success: true,
      message: `Добро пожаловать, ${profile.userName}!`,
      user: {
        id: profile.userId,
        name: profile.userName,
        email: profile.userEmail,
        role: profile.userRole as UserRole
      },
      authMethod: "face_recognition",
      dashboardUrl,
      metrics: {
        similarity: Math.round(similarity * 100),
        confidence: Math.round(confidence),
        combinedScore: Math.round(combinedScore * 100),
        processingTime: Date.now() - startTime
      }
    });

    // ✅ Устанавливаем cookies для авторизации
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: 24 * 60 * 60, // 24 часа
      path: '/'
    };

    // JWT токен для авторизации
    response.cookies.set('auth_token', sessionToken, cookieOptions);
    response.cookies.set('session_id', sessionToken, cookieOptions);
    
    // Роль пользователя (не httpOnly для доступа из JS)
    response.cookies.set('user_role', profile.userRole, {
      ...cookieOptions,
      httpOnly: false
    });

    // Обновляем Face ID токен
    response.cookies.set('face_id_registered', faceIdToken, {
      ...cookieOptions,
      maxAge: 30 * 24 * 60 * 60 // 30 дней
    });

    // ID профиля
    response.cookies.set('face_id_profile', profile.id, {
      ...cookieOptions,
      httpOnly: false,
      maxAge: 30 * 24 * 60 * 60
    });

    console.log('✅ Face ID вход успешен для:', profile.userName);
    console.log('⏱️ Время обработки:', Date.now() - startTime, 'ms');
    
    return response;

  } catch (error) {
    console.error('❌ Face Login: ошибка:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Ошибка сервера при входе через Face ID',
      error: process.env.NODE_ENV === 'development' ? 
        (error instanceof Error ? error.message : String(error)) : undefined
    }, { status: 500 });
  }
}

// ✅ GET метод для проверки возможности Face ID входа
export async function GET(request: NextRequest) {
  try {
    const stats = await faceIdStorage.getStats();
    
    return NextResponse.json({
      enabled: true,
      message: 'Face ID login endpoint',
      requirements: {
        descriptorLength: 128,
        minConfidence: MIN_CONFIDENCE,
        similarityThreshold: Math.round(SIMILARITY_THRESHOLD * 100)
      },
      stats: {
        totalProfiles: stats.totalProfiles,
        activeProfiles: stats.activeProfiles,
        totalUsers: stats.totalUsers
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Face Login GET: ошибка:', error);
    
    return NextResponse.json({
      enabled: false,
      message: 'Face ID временно недоступен',
      error: process.env.NODE_ENV === 'development' ? 
        (error instanceof Error ? error.message : String(error)) : undefined
    }, { status: 500 });
  }
}