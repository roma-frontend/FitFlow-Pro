// app/api/auth/logout/route.ts - с очисткой JWT токена
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

    // Создаем ответ
    const response = NextResponse.json({
      success: true,
      message: 'Выход выполнен успешно'
    });

    // Очищаем все cookies
    response.cookies.delete('session_id');
    response.cookies.delete('session_id_debug');
    response.cookies.delete('auth_token');
    response.cookies.delete('user_role');

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