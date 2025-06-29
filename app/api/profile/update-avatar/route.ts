// app/api/profile/update-avatar/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getSession, updateSession } from '@/lib/simple-auth';
import { ConvexHttpClient } from "convex/browser";

// Инициализация Convex клиента
let convex: ConvexHttpClient;
try {
  if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
    throw new Error('NEXT_PUBLIC_CONVEX_URL is not defined');
  }
  convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);
} catch (error) {
  console.error('❌ Ошибка инициализации Convex:', error);
}

export async function POST(request: NextRequest) {
  try {
    console.log('🖼️ POST /api/profile/update-avatar - начало обновления аватара');

    // Проверяем авторизацию
    const sessionId = request.cookies.get('session_id')?.value || 
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

    console.log('📝 Обновляем аватар для пользователя:', sessionData.user.id);

    try {
      // Если есть Convex, обновляем через него
      if (convex) {
        try {
          await convex.mutation("users:updateProfile", {
            userId: sessionData.user.id,
            email: sessionData.user.email,
            updates: {
              avatar: avatarUrl,
              photoUrl: avatarUrl, // Для совместимости с trainers
              updatedAt: Date.now()
            }
          });
          
          console.log('✅ Аватар обновлен в Convex');
        } catch (convexError) {
          console.error('⚠️ Ошибка обновления в Convex:', convexError);
          
          // Для super-admin из simple-auth это нормально
          if (sessionData.user.role !== 'super-admin') {
            throw convexError;
          }
        }
      }

      // Обновляем данные в сессии
      sessionData.user.avatar = avatarUrl;
      if (sessionData.user.avatarUrl) {
        sessionData.user.avatarUrl = avatarUrl;
      }
      updateSession(sessionId, sessionData);
      
      console.log('✅ Сессия обновлена');

      return NextResponse.json({
        success: true,
        message: 'Аватар успешно обновлен',
        avatarUrl: avatarUrl
      });

    } catch (error) {
      console.error('❌ Ошибка обновления аватара:', error);
      return NextResponse.json({
        error: 'Ошибка обновления аватара',
        details: error instanceof Error ? error.message : 'Неизвестная ошибка'
      }, { status: 500 });
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
                      request.cookies.get('session_id_debug')?.value;
                      
    if (!sessionId) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const sessionData = await getSession(sessionId);
    if (!sessionData) {
      return NextResponse.json({ error: 'Сессия недействительна' }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      avatarUrl: sessionData.user.avatar || null
    });

  } catch (error) {
    console.error('❌ Ошибка получения аватара:', error);
    return NextResponse.json({
      error: 'Ошибка получения аватара',
      details: error instanceof Error ? error.message : 'Неизвестная ошибка'
    }, { status: 500 });
  }
}