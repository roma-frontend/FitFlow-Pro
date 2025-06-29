// app/api/badge-settings/route.ts (обновленная версия для работы с существующей системой аутентификации)
import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from "convex/browser";
import type { HeaderBadgeSetting } from '@/types/badge';
import type { Id } from "@/convex/_generated/dataModel";
import { getSession } from '@/lib/simple-auth';

// Создаем HTTP клиент для Convex
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Функция для проверки авторизации и получения пользователя
async function getUserFromRequest(request: NextRequest) {
  try {
    // Получаем sessionId из куки
    const sessionId = request.cookies.get('session_id')?.value || 
                     request.cookies.get('session_id_debug')?.value;
    
    if (sessionId) {
      // Проверяем сессию
      const session = await getSession(sessionId);
      if (session) {
        return session.user;
      }
    }
    
    // Если сессии нет, делаем запрос к API для проверки JWT
    const authResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/auth/check`, {
      headers: {
        'Cookie': request.headers.get('cookie') || '',
      }
    });
    
    if (!authResponse.ok) {
      return null;
    }
    
    const authData = await authResponse.json();
    
    if (!authData.authenticated || !authData.user) {
      return null;
    }
    
    return authData.user;
  } catch (error) {
    console.error('Ошибка проверки авторизации:', error);
    return null;
  }
}

// GET - получение badge настроек
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userRole = searchParams.get('userRole');
    const deviceType = searchParams.get('deviceType');
    const activeOnly = searchParams.get('activeOnly') === 'true';

    console.log('🔍 API запрос badge-settings:', { userRole, deviceType, activeOnly });

    let settings;
    if (activeOnly) {
      // Получаем только активные badge
      settings = await convex.query("headerBadges:getActiveBadgeSettings", {
        userRole: userRole || undefined,
        deviceType: deviceType || undefined,
      });
    } else {
      // Получаем все badge
      settings = await convex.query("headerBadges:getAllBadgeSettings", {});
    }

    console.log('✅ Получено badge из Convex:', settings?.length || 0);

    return NextResponse.json({
      success: true,
      data: settings || [],
      total: settings?.length || 0
    });
  } catch (error) {
    console.error('❌ Ошибка получения badge settings:', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка сервера' },
      { status: 500 }
    );
  }
}

// POST - создание новой настройки
export async function POST(request: NextRequest) {
  try {
    // Проверяем авторизацию
    const user = await getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Не авторизован' },
        { status: 401 }
      );
    }
    
    // Проверяем, имеет ли пользователь права на создание badge
    if (user.role !== 'super-admin') {
      return NextResponse.json(
        { success: false, error: 'Недостаточно прав для создания badge' },
        { status: 403 }
      );
    }

    const body = await request.json();

    console.log('📝 Создание нового badge через Convex:', body);

    // Создаем через Convex
    const badgeId = await convex.mutation("headerBadges:createBadgeSetting", body);

    console.log('✅ Создан badge с ID:', badgeId);

    // Получаем созданную настройку
    const allSettings = await convex.query("headerBadges:getAllBadgeSettings", {});
    const newSetting = allSettings.find((s: any) => s._id === badgeId);

    return NextResponse.json({
      success: true,
      data: newSetting,
      message: 'Badge создан успешно'
    });
  } catch (error) {
    console.error('❌ Ошибка создания badge setting:', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка сервера' },
      { status: 500 }
    );
  }
}

// PUT - обновление настройки
export async function PUT(request: NextRequest) {
  try {
    // Проверяем авторизацию
    const user = await getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Не авторизован' },
        { status: 401 }
      );
    }
    
    // Проверяем, имеет ли пользователь права на обновление badge
    if (user.role !== 'super-admin') {
      return NextResponse.json(
        { success: false, error: 'Недостаточно прав для обновления badge' },
        { status: 403 }
      );
    }
    
    const body = await request.json();
    const { id, updates, updatedBy } = body;

    console.log('📝 Обновление badge через Convex:', { id, updates });

    // Обновляем через Convex
    await convex.mutation("headerBadges:updateBadgeSetting", {
      id,
      updates: {
        ...updates,
        updatedBy
      }
    });

    console.log('✅ Badge обновлен');

    return NextResponse.json({
      success: true,
      message: 'Badge обновлен успешно'
    });
  } catch (error) {
    console.error('❌ Ошибка обновления badge setting:', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка сервера' },
      { status: 500 }
    );
  }
}

// DELETE - удаление настройки
export async function DELETE(request: NextRequest) {
  try {
    // Проверяем авторизацию
    const user = await getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Не авторизован' },
        { status: 401 }
      );
    }
    
    // Проверяем, имеет ли пользователь права на удаление badge
    if (user.role !== 'super-admin') {
      return NextResponse.json(
        { success: false, error: 'Недостаточно прав для удаления badge' },
        { status: 403 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID не указан' },
        { status: 400 }
      );
    }

    console.log('🗑️ Удаление badge через Convex:', id);

    // Удаляем через Convex
    await convex.mutation("headerBadges:deleteBadgeSetting", {
      id
    });

    console.log('✅ Badge удален');

    return NextResponse.json({
      success: true,
      message: 'Badge удален успешно'
    });
  } catch (error) {
    console.error('❌ Ошибка удаления badge setting:', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка сервера' },
      { status: 500 }
    );
  }
}
