// app/api/auth/face-login/route.ts - ИСПРАВЛЕННАЯ ВЕРСИЯ с Convex
import { NextRequest, NextResponse } from 'next/server';
import { createSession } from '@/lib/simple-auth';
import { faceIdStorage } from '@/lib/face-id-storage';
import { ConvexHttpClient } from "convex/browser";
import { UserRole } from '@/lib/permissions';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

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

    // ✅ Получаем все активные Face ID профили из Convex
    console.log('🔍 Получаем Face ID профили из Convex...');
    
    const allProfiles = await convex.query("faceProfiles:getAllForComparison");
    
    if (!allProfiles || allProfiles.length === 0) {
      console.log('❌ Нет зарегистрированных Face ID профилей');
      
      return NextResponse.json({
        success: false,
        message: 'В системе нет зарегистрированных Face ID профилей',
        debug: process.env.NODE_ENV === 'development' ? {
          threshold: SIMILARITY_THRESHOLD,
          profilesCount: 0
        } : undefined
      }, { status: 404 });
    }

    console.log(`📊 Найдено ${allProfiles.length} активных профилей`);

    // ✅ Поиск соответствующего профиля
    let bestMatch = null;
    let highestSimilarity = 0;

    for (const profile of allProfiles) {
      if (!profile.faceDescriptor || profile.faceDescriptor.length !== descriptor.length) {
        continue;
      }

      // Рассчитываем схожесть
      const similarity = faceIdStorage.calculateSimilarity(descriptor, profile.faceDescriptor);
      
      console.log(`🔍 Проверка профиля ${profile.id}: схожесть ${(similarity * 100).toFixed(1)}%`);

      if (similarity > SIMILARITY_THRESHOLD && similarity > highestSimilarity) {
        highestSimilarity = similarity;
        bestMatch = profile;
      }
    }

    if (!bestMatch) {
      console.log('❌ Face ID не найден (схожесть ниже порога)');
      
      return NextResponse.json({
        success: false,
        message: 'Face ID не распознан. Убедитесь, что вы зарегистрировали Face ID в системе.',
        debug: process.env.NODE_ENV === 'development' ? {
          threshold: SIMILARITY_THRESHOLD,
          checkedProfiles: allProfiles.length,
          maxSimilarity: Math.round(highestSimilarity * 100)
        } : undefined
      }, { status: 404 });
    }

    console.log('✅ Face ID найден:', {
      profileId: bestMatch.id,
      userId: bestMatch.userId,
      userName: bestMatch.name,
      similarity: `${(highestSimilarity * 100).toFixed(1)}%`,
      confidence: `${confidence}%`
    });

    // ✅ Дополнительная проверка качества совпадения
    const combinedScore = (highestSimilarity + confidence / 100) / 2;
    if (combinedScore < 0.65) {
      console.log('⚠️ Низкий комбинированный score:', combinedScore);
      return NextResponse.json({
        success: false,
        message: 'Недостаточная уверенность в распознавании. Попробуйте улучшить освещение.'
      }, { status: 400 });
    }

    // ✅ Обновляем статистику использования в Convex
    await convex.mutation("faceProfiles:updateLastUsed", {
      profileId: bestMatch.id,
      timestamp: Date.now()
    });

    // ✅ Получаем данные пользователя из Convex
    console.log('🔍 Получаем данные пользователя из Convex...');
    
    let userData;
    if (bestMatch.userType === 'trainer') {
      userData = await convex.query("trainers:getById", { trainerId: bestMatch.userId });
    } else {
      userData = await convex.query("users:getById", { userId: bestMatch.userId });
    }

    if (!userData) {
      console.error('❌ Пользователь не найден в базе данных');
      return NextResponse.json({
        success: false,
        message: 'Пользователь не найден в системе'
      }, { status: 404 });
    }

    // ✅ Создаем сессию для пользователя
    console.log('🔐 Создаем сессию для пользователя:', userData._id);
    
    const sessionToken = await createSession({
      id: userData._id,
      email: userData.email,
      role: (userData.role || bestMatch.userType || 'member') as UserRole,
      name: userData.name || bestMatch.name,
      avatar: userData.avatar,
      avatarUrl: userData.avatarUrl,
      isVerified: userData.isVerified || false,
      rating: userData.rating || 0,
      createdAt: new Date(userData.createdAt || Date.now()),
      updatedAt: new Date(userData.updatedAt || Date.now())
    });

    // ✅ Обновляем локальную статистику
    const localProfile = await faceIdStorage.findByDescriptor(descriptor, SIMILARITY_THRESHOLD);
    if (localProfile) {
      await faceIdStorage.updateUsageStats(localProfile.profile.id);
    }

    // ✅ Определяем URL дашборда по роли
    const dashboardUrls: Record<string, string> = {
      'admin': '/admin',
      'super-admin': '/admin',
      'manager': '/manager-dashboard',
      'trainer': '/trainer-dashboard',
      'client': '/member-dashboard',
      'member': '/member-dashboard',
      'staff': '/staff-dashboard'
    };

    const userRole = (userData.role || bestMatch.userType || 'member') as string;
    const dashboardUrl = dashboardUrls[userRole] || '/member-dashboard';

    // ✅ Создаем response
    const response = NextResponse.json({
      success: true,
      message: `Добро пожаловать, ${userData.name || bestMatch.name}!`,
      user: {
        id: userData._id,
        name: userData.name || bestMatch.name,
        email: userData.email || bestMatch.email,
        role: userRole as UserRole
      },
      authMethod: "face_recognition",
      dashboardUrl,
      metrics: {
        similarity: Math.round(highestSimilarity * 100),
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
    response.cookies.set('user_role', userRole, {
      ...cookieOptions,
      httpOnly: false
    });

    // Face ID профиль
    response.cookies.set('face_id_profile', bestMatch.id, {
      ...cookieOptions,
      httpOnly: false,
      maxAge: 30 * 24 * 60 * 60
    });

    console.log('✅ Face ID вход успешен для:', userData.name || bestMatch.name);
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
    // Получаем статистику из Convex
    const stats = await convex.query("faceProfiles:getStats");
    
    return NextResponse.json({
      enabled: true,
      message: 'Face ID login endpoint',
      requirements: {
        descriptorLength: 128,
        minConfidence: MIN_CONFIDENCE,
        similarityThreshold: Math.round(SIMILARITY_THRESHOLD * 100)
      },
      stats: {
        totalProfiles: stats?.total || 0,
        activeProfiles: stats?.active || 0,
        recentlyUsed: stats?.recentlyUsed || 0
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