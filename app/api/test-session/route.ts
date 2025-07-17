// app/api/test-session/route.ts - Тестовый endpoint для проверки сессии
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/simple-auth';
import { jwtVerify } from 'jose';

export async function GET(request: NextRequest) {
  console.log('🧪 === ТЕСТ СЕССИИ ===');
  
  try {
    // Получаем все куки
    const cookies = request.cookies.getAll();
    console.log('🍪 Все куки:', cookies.map(c => ({ name: c.name, hasValue: !!c.value })));
    
    // Получаем токены
    const authToken = request.cookies.get('auth_token')?.value;
    const sessionId = request.cookies.get('session_id')?.value;
    const sessionIdDebug = request.cookies.get('session_id_debug')?.value;
    const userRole = request.cookies.get('user_role')?.value;
    
    console.log('🔑 Токены:', {
      hasAuthToken: !!authToken,
      hasSessionId: !!sessionId,
      hasSessionIdDebug: !!sessionIdDebug,
      userRole
    });
    
    const token = authToken || sessionId || sessionIdDebug;
    
    if (!token) {
      return NextResponse.json({
        success: false,
        error: 'Нет токена',
        cookies: cookies.map(c => c.name)
      });
    }
    
    // Пробуем декодировать токен напрямую
    console.log('🔍 Декодируем токен напрямую...');
    try {
      const secret = new TextEncoder().encode(
        process.env.JWT_SECRET || 'fallback-secret-key-change-in-production'
      );
      
      const { payload } = await jwtVerify(token, secret);
      console.log('✅ Токен декодирован:', {
        hasSessionData: !!payload.sessionData,
        hasUserId: !!payload.userId,
        hasUserRole: !!payload.userRole,
        hasRole: !!payload.role,
        hasEmail: !!payload.email,
        keys: Object.keys(payload)
      });
      
      // Если есть данные пользователя, выводим их
      if (payload.userId || payload.sessionData) {
        const userData = payload.sessionData ? 
          (payload.sessionData as any).user : 
          {
            id: payload.userId,
            email: payload.email,
            role: payload.userRole || payload.role,
            name: payload.userName || payload.name
          };
          
        console.log('👤 Данные пользователя из токена:', userData);
      }
    } catch (jwtError) {
      console.error('❌ Ошибка декодирования JWT:', jwtError);
    }
    
    // Пробуем getSession
    console.log('🔍 Проверяем через getSession...');
    const session = await getSession(token);
    
    if (session) {
      console.log('✅ Сессия найдена:', {
        id: session.id,
        userEmail: session.user.email,
        userRole: session.user.role,
        userName: session.user.name
      });
      
      return NextResponse.json({
        success: true,
        message: 'Сессия активна',
        session: {
          id: session.id,
          user: {
            id: session.user.id,
            email: session.user.email,
            role: session.user.role,
            name: session.user.name
          }
        },
        tokenType: authToken ? 'auth_token' : sessionId ? 'session_id' : 'session_id_debug'
      });
    } else {
      console.log('❌ Сессия не найдена через getSession');
      
      return NextResponse.json({
        success: false,
        error: 'Сессия не найдена',
        tokenType: authToken ? 'auth_token' : sessionId ? 'session_id' : 'session_id_debug',
        userRole,
        jwtSecretSet: !!process.env.JWT_SECRET
      });
    }
    
  } catch (error) {
    console.error('💥 Ошибка тестирования сессии:', error);
    return NextResponse.json({
      success: false,
      error: 'Ошибка проверки сессии',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}