// app/api/auth/logout/route.ts - ИСПРАВЛЕННАЯ ВЕРСИЯ
import { NextRequest, NextResponse } from 'next/server';
import { logout } from '@/lib/simple-auth';

export async function POST(request: NextRequest) {
  try {
    console.log('🚪 [Logout] Начало процесса выхода');
    
    // Получаем session_id из cookies
    const sessionId = request.cookies.get('session_id')?.value;
    
    if (sessionId) {
      // Удаляем сессию из JWT системы
      const loggedOut = logout(sessionId);
      console.log(`🚪 [Logout] JWT сессия ${sessionId.substring(0, 20)}... ${loggedOut ? 'удалена' : 'не найдена'}`);
    }

    // Создаем ответ с заголовками для предотвращения кэширования
    const response = NextResponse.json({
      success: true,
      message: 'Выход выполнен успешно',
      timestamp: Date.now()
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Surrogate-Control': 'no-store'
      }
    });

    // Очищаем все cookies с правильными параметрами
    const cookieOptions = {
      path: '/',
      expires: new Date(0),
      sameSite: 'lax' as const,
      secure: process.env.NODE_ENV === 'production'
    };

    // Очищаем JWT cookies
    response.cookies.set('session_id', '', cookieOptions);
    response.cookies.set('session_id_debug', '', cookieOptions);
    response.cookies.set('auth_token', '', cookieOptions);
    response.cookies.set('user_role', '', cookieOptions);

    // ВАЖНО: Очищаем NextAuth cookies
    response.cookies.set('next-auth.session-token', '', {
      ...cookieOptions,
      httpOnly: true
    });
    
    response.cookies.set('__Secure-next-auth.session-token', '', {
      ...cookieOptions,
      httpOnly: true,
      secure: true
    });
    
    response.cookies.set('next-auth.callback-url', '', cookieOptions);
    response.cookies.set('__Secure-next-auth.callback-url', '', {
      ...cookieOptions,
      secure: true
    });
    
    // Очищаем CSRF token
    response.cookies.set('next-auth.csrf-token', '', cookieOptions);
    response.cookies.set('__Secure-next-auth.csrf-token', '', {
      ...cookieOptions,
      secure: true
    });

    console.log('✅ [Logout] Все cookies очищены (включая NextAuth)');

    return response;

  } catch (error) {
    console.error('❌ [Logout] Ошибка:', error);
    return NextResponse.json({
      success: false,
      error: 'Ошибка при выходе из системы'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ 
    error: 'Method not allowed' 
  }, { status: 405 });
}