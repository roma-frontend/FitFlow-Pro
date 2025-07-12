// app/api/face-id/manage/route.ts - API для управления Face ID профилями
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/simple-auth';
import { faceIdStorage } from '@/lib/face-id-storage';

// ✅ GET - Получить все Face ID профили текущего пользователя
export async function GET(request: NextRequest) {
  try {
    // Проверяем авторизацию
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

    // Получаем все профили пользователя
    const profiles = await faceIdStorage.getUserProfiles(session.user.id);
    
    // Фильтруем чувствительные данные
    const safeProfiles = profiles.map(profile => ({
      id: profile.id,
      deviceInfo: profile.deviceInfo,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
      lastUsedAt: profile.lastUsedAt,
      usageCount: profile.usageCount,
      isActive: profile.isActive,
      confidence: Math.round(profile.confidence)
    }));

    // Получаем текущий активный профиль из cookie
    const currentProfileId = request.cookies.get('face_id_profile')?.value;
    
    return NextResponse.json({
      success: true,
      profiles: safeProfiles,
      currentProfileId,
      totalProfiles: profiles.length,
      activeProfiles: profiles.filter(p => p.isActive).length,
      maxProfiles: 3 // Максимум профилей на пользователя
    });

  } catch (error) {
    console.error('❌ Face ID Manage GET: ошибка:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Ошибка получения Face ID профилей',
      error: process.env.NODE_ENV === 'development' ? 
        (error instanceof Error ? error.message : String(error)) : undefined
    }, { status: 500 });
  }
}

// ✅ DELETE - Удалить конкретный Face ID профиль
export async function DELETE(request: NextRequest) {
  try {
    // Проверяем авторизацию
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

    // Получаем ID профиля из query параметров
    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get('profileId');
    
    if (!profileId) {
      return NextResponse.json({
        success: false,
        message: 'ID профиля не указан'
      }, { status: 400 });
    }

    // Проверяем, что профиль принадлежит пользователю
    const profile = await faceIdStorage.getProfile(profileId);
    
    if (!profile) {
      return NextResponse.json({
        success: false,
        message: 'Профиль не найден'
      }, { status: 404 });
    }

    if (profile.userId !== session.user.id) {
      return NextResponse.json({
        success: false,
        message: 'Нет доступа к этому профилю'
      }, { status: 403 });
    }

    // Деактивируем профиль
    const success = await faceIdStorage.deactivateProfile(profileId);
    
    if (!success) {
      return NextResponse.json({
        success: false,
        message: 'Не удалось удалить профиль'
      }, { status: 500 });
    }

    console.log('🗑️ Face ID профиль деактивирован:', profileId);

    // Если это был текущий активный профиль, очищаем cookies
    const currentProfileId = request.cookies.get('face_id_profile')?.value;
    const response = NextResponse.json({
      success: true,
      message: 'Face ID профиль удален',
      deletedProfileId: profileId
    });

    if (currentProfileId === profileId) {
      response.cookies.delete('face_id_profile');
      
      // Проверяем, есть ли другие активные профили
      const remainingProfiles = await faceIdStorage.getUserProfiles(session.user.id);
      if (remainingProfiles.length === 0) {
        response.cookies.delete('face_id_registered');
      }
    }

    return response;

  } catch (error) {
    console.error('❌ Face ID Manage DELETE: ошибка:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Ошибка удаления Face ID профиля',
      error: process.env.NODE_ENV === 'development' ? 
        (error instanceof Error ? error.message : String(error)) : undefined
    }, { status: 500 });
  }
}

// ✅ PUT - Обновить Face ID профиль (например, перезаписать дескриптор)
export async function PUT(request: NextRequest) {
  try {
    // Проверяем авторизацию
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

    const body = await request.json();
    const { profileId, descriptor, confidence } = body;

    if (!profileId) {
      return NextResponse.json({
        success: false,
        message: 'ID профиля не указан'
      }, { status: 400 });
    }

    // Проверяем, что профиль принадлежит пользователю
    const profile = await faceIdStorage.getProfile(profileId);
    
    if (!profile) {
      return NextResponse.json({
        success: false,
        message: 'Профиль не найден'
      }, { status: 404 });
    }

    if (profile.userId !== session.user.id) {
      return NextResponse.json({
        success: false,
        message: 'Нет доступа к этому профилю'
      }, { status: 403 });
    }

    // Обновляем профиль
    const updates: any = {};
    
    if (descriptor && descriptor.length === 128) {
      updates.descriptor = descriptor;
    }
    
    if (confidence && confidence >= 70) {
      updates.confidence = confidence;
    }

    const success = await faceIdStorage.updateProfile(profileId, updates);
    
    if (!success) {
      return NextResponse.json({
        success: false,
        message: 'Не удалось обновить профиль'
      }, { status: 500 });
    }

    console.log('✏️ Face ID профиль обновлен:', profileId);

    return NextResponse.json({
      success: true,
      message: 'Face ID профиль обновлен',
      updatedProfileId: profileId,
      updates: Object.keys(updates)
    });

  } catch (error) {
    console.error('❌ Face ID Manage PUT: ошибка:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Ошибка обновления Face ID профиля',
      error: process.env.NODE_ENV === 'development' ? 
        (error instanceof Error ? error.message : String(error)) : undefined
    }, { status: 500 });
  }
}