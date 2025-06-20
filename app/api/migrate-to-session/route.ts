// app/api/auth/migrate-to-session/route.ts (новый файл для миграции)
import { NextRequest, NextResponse } from 'next/server';
import { createSession } from '@/lib/simple-auth';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  try {
    console.log('API migrate-to-session: начинаем миграцию с JWT на сессии');
    
    const authToken = request.cookies.get('auth_token')?.value;
    
    if (!authToken) {
      return NextResponse.json({
        success: false,
        error: 'JWT токен не найден'
      }, { status: 400 });
    }

    if (!process.env.JWT_SECRET) {
      return NextResponse.json({
        success: false,
        error: 'JWT_SECRET не настроен'
      }, { status: 500 });
    }

    try {
      // Декодируем JWT токен
      const decoded = jwt.verify(authToken, process.env.JWT_SECRET) as any;
      console.log('API migrate-to-session: JWT токен валиден, создаем сессию для:', decoded.email);

      // Создаем новую сессию
      const sessionId = createSession({
        id: decoded.userId,
        email: decoded.email,
        role: decoded.role,
        name: decoded.name
      });

      console.log('API migrate-to-session: сессия создана:', sessionId);

      // Создаем ответ
      const response = NextResponse.json({
        success: true,
        message: 'Миграция на сессии выполнена успешно',
        sessionId: sessionId.substring(0, 20) + '...',
        user: {
          id: decoded.userId,
          email: decoded.email,
          role: decoded.role,
          name: decoded.name
        }
      });

      // Устанавливаем новые cookies с сессией
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax' as const,
        maxAge: 24 * 60 * 60 * 7, // 7 дней
        path: '/'
      };
      
      response.cookies.set('session_id', sessionId, cookieOptions);
      response.cookies.set('session_id_debug', sessionId, {
        ...cookieOptions,
        httpOnly: false
      });

      // Удаляем старый JWT токен
      response.cookies.delete('auth_token');

      console.log('API migrate-to-session: миграция завершена успешно');
      return response;

    } catch (jwtError) {
      console.error('API migrate-to-session: ошибка декодирования JWT:', jwtError);
      
      // JWT токен недействителен, удаляем его
      const response = NextResponse.json({
        success: false,
        error: 'JWT токен недействителен'
      }, { status: 401 });
      
      response.cookies.delete('auth_token');
      return response;
    }

  } catch (error) {
    console.error('API migrate-to-session: ошибка миграции:', error);
    return NextResponse.json({
      success: false,
      error: 'Ошибка миграции на сессии'
    }, { status: 500 });
  }
}
