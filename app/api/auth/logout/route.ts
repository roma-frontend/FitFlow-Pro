// app/api/auth/logout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { logout } from '@/lib/simple-auth';

export async function POST(request: NextRequest) {
  try {
    console.log('🚪 [Logout] Начало процесса выхода');
    
    // Получаем session_id из cookies
    const sessionId = request.cookies.get('session_id')?.value;
    
    if (sessionId) {
      // Удаляем сессию
      const loggedOut = logout(sessionId);
      console.log(`🚪 [Logout] Сессия ${sessionId.substring(0, 20)}... ${loggedOut ? 'удалена' : 'не найдена'}`);
    }

    // Создаем ответ с заголовками для предотвращения кэширования
    const response = NextResponse.json({
      success: true,
      message: 'Выход выполнен успешно',
      timestamp: Date.now() // Добавляем timestamp для уникальности
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

    response.cookies.set('session_id', '', cookieOptions);
    response.cookies.set('session_id_debug', '', cookieOptions);
    response.cookies.set('auth_token', '', cookieOptions);
    response.cookies.set('user_role', '', cookieOptions);

    console.log('✅ [Logout] Все cookies очищены');

    return response;

  } catch (error) {
    console.error('❌ [Logout] Ошибка:', error);
    return NextResponse.json({
      success: false,
      error: 'Ошибка при выходе из системы'
    }, { status: 500 });
  }
}

// Добавляем GET метод для отладки
export async function GET() {
  return NextResponse.json({ 
    error: 'Method not allowed' 
  }, { status: 405 });
}