// app/api/profile/update-avatar/route.ts - ИСПРАВЛЕННАЯ ВЕРСИЯ
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/simple-auth';
import { ConvexHttpClient } from "convex/browser";

// Инициализация Convex клиента
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: NextRequest) {
  try {
    console.log('🖼️ POST /api/profile/update-avatar - начало обновления аватара');

    // Проверяем авторизацию
    const sessionId = request.cookies.get('session_id')?.value || 
                      request.cookies.get('auth_token')?.value ||
                      request.cookies.get('session_id_debug')?.value;
                      
    if (!sessionId) {
      console.log('❌ Нет session_id');
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const sessionData = await getSession(sessionId);
    if (!sessionData) {
      console.log('❌ Сессия недействительна');
      return NextResponse.json({ error: 'Сессия недействительна' }, { status: 401 });
    }

    // Получаем новый URL аватара
    const body = await request.json();
    const { avatarUrl } = body;

    if (!avatarUrl) {
      return NextResponse.json({ error: 'URL аватара не указан' }, { status: 400 });
    }

    // Проверяем что URL от Cloudinary
    if (!avatarUrl.includes('cloudinary.com')) {
      return NextResponse.json({ 
        error: 'Недопустимый источник изображения' 
      }, { status: 400 });
    }

    console.log('📝 Обновляем аватар для пользователя:', {
      userId: sessionData.user.id,
      email: sessionData.user.email,
      role: sessionData.user.role
    });

    try {
      // Обновляем через Convex mutation
      const result = await convex.mutation("users:updateAvatar", {
        userId: sessionData.user.id,
        email: sessionData.user.email,
        avatarUrl: avatarUrl
      });
      
      console.log('✅ Аватар обновлен в Convex:', result);
      
      // Обновляем JWT токен с новыми данными пользователя
      if (sessionData.user.avatar !== avatarUrl || sessionData.user.avatarUrl !== avatarUrl) {
        sessionData.user.avatar = avatarUrl;
        sessionData.user.avatarUrl = avatarUrl;
        
        // Создаем новый JWT токен с обновленными данными
        const { updateSession } = await import('@/lib/simple-auth');
        const newToken = await updateSession(sessionId, sessionData);
        
        if (newToken) {
          // Обновляем куки с новым токеном
          const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax' as const,
            maxAge: 7 * 24 * 60 * 60,
            path: '/'
          };
          
          const response = NextResponse.json({
            success: true,
            message: 'Аватар успешно обновлен',
            avatarUrl: avatarUrl,
            userId: result.userId
          });
          
          response.cookies.set('session_id', newToken, cookieOptions);
          response.cookies.set('auth_token', newToken, cookieOptions);
          
          console.log('✅ JWT токен обновлен с новым аватаром');
          
          return response;
        }
      }
      
      return NextResponse.json({
        success: true,
        message: 'Аватар успешно обновлен',
        avatarUrl: avatarUrl,
        userId: result.userId
      });
      
    } catch (convexError: any) {
      console.error('⚠️ Ошибка обновления в Convex:', convexError);
      
      // Если пользователь не найден в Convex (например, super-admin из simple-auth)
      if (convexError.message?.includes('Пользователь не найден') && sessionData.user.role === 'super-admin') {
        console.log('🔄 Обновляем аватар только в сессии для super-admin');
        
        sessionData.user.avatar = avatarUrl;
        sessionData.user.avatarUrl = avatarUrl;
        
        const { updateSession } = await import('@/lib/simple-auth');
        const newToken = await updateSession(sessionId, sessionData);
        
        if (newToken) {
          const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax' as const,
            maxAge: 7 * 24 * 60 * 60,
            path: '/'
          };
          
          const response = NextResponse.json({
            success: true,
            message: 'Аватар успешно обновлен (локально)',
            avatarUrl: avatarUrl
          });
          
          response.cookies.set('session_id', newToken, cookieOptions);
          response.cookies.set('auth_token', newToken, cookieOptions);
          
          return response;
        }
      }
      
      throw convexError;
    }

  } catch (error) {
    console.error('❌ Общая ошибка обновления аватара:', error);
    return NextResponse.json({
      error: 'Ошибка обновления аватара',
      details: error instanceof Error ? error.message : 'Неизвестная ошибка'
    }, { status: 500 });
  }
}

// GET endpoint для получения текущего аватара
export async function GET(request: NextRequest) {
  try {
    const sessionId = request.cookies.get('session_id')?.value || 
                      request.cookies.get('auth_token')?.value ||
                      request.cookies.get('session_id_debug')?.value;
                      
    if (!sessionId) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const sessionData = await getSession(sessionId);
    if (!sessionData) {
      return NextResponse.json({ error: 'Сессия недействительна' }, { status: 401 });
    }

    // Пытаемся получить актуальные данные из Convex
    try {
      const convexUser = await convex.query("users:getUserByEmail", {
        email: sessionData.user.email
      });
      
      if (convexUser) {
        return NextResponse.json({
          success: true,
          avatarUrl: convexUser.avatar || convexUser.photoUrl || null,
          source: 'convex'
        });
      }
    } catch (convexError) {
      console.log('⚠️ Не удалось получить данные из Convex:', convexError);
    }

    // Fallback на данные из сессии
    return NextResponse.json({
      success: true,
      avatarUrl: sessionData.user.avatar || sessionData.user.avatarUrl || null,
      source: 'session'
    });

  } catch (error) {
    console.error('❌ Ошибка получения аватара:', error);
    return NextResponse.json({
      error: 'Ошибка получения аватара',
      details: error instanceof Error ? error.message : 'Неизвестная ошибка'
    }, { status: 500 });
  }
}