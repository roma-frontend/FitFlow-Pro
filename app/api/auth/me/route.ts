// app/api/auth/me/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

// Временное хранилище сессий в памяти для Vercel
// В продакшене используйте Redis или другое внешнее хранилище
const memoryStore = new Map<string, any>();

// Вспомогательная функция для получения cookie
const getCookieValue = (request: NextRequest, name: string): string | undefined => {
  return request.cookies.get(name)?.value;
};

// Функция для получения сессии из памяти (временное решение)
const getSessionFromMemory = (sessionId: string) => {
  const session = memoryStore.get(sessionId);
  if (!session) return null;
  
  // Проверяем, не истекла ли сессия
  if (session.expiresAt && new Date(session.expiresAt) < new Date()) {
    memoryStore.delete(sessionId);
    return null;
  }
  
  return session;
};

export async function GET(request: NextRequest) {
  console.log('🔍 GET /api/auth/me - Vercel-optimized version');
  
  try {
    // Получаем все возможные токены
    const sessionId = getCookieValue(request, 'session_id') || 
                     getCookieValue(request, 'session_id_debug');
    const authToken = getCookieValue(request, 'auth_token');
    const userRoleCookie = getCookieValue(request, 'user_role');
    
    // Также проверяем Authorization header
    const authHeader = request.headers.get('authorization');
    const bearerToken = authHeader?.replace('Bearer ', '');
    
    // Используем токен из cookie или header
    const token = authToken || bearerToken;
    
    console.log('🔑 Auth check:', {
      hasSessionId: !!sessionId,
      hasToken: !!token,
      hasUserRole: !!userRoleCookie,
      isVercel: !!process.env.VERCEL
    });

    // Приоритет 1: JWT токен
    if (token) {
      try {
        const secret = new TextEncoder().encode(
          process.env.JWT_SECRET || process.env.NEXT_PUBLIC_JWT_SECRET || 'your-secret-key'
        );
        
        const { payload } = await jwtVerify(token, secret);
        
        if (payload && payload.userId) {
          console.log('✅ JWT валиден для пользователя:', payload.email);
          
          return NextResponse.json({
            success: true,
            user: {
              id: payload.userId as string,
              name: payload.name as string || 'User',
              email: payload.email as string,
              role: payload.role as string || 'member'
            }
          });
        }
      } catch (jwtError) {
        console.error('❌ JWT validation failed:', jwtError);
        // Продолжаем проверку других методов авторизации
      }
    }

    // Приоритет 2: Сессия в памяти (для Vercel)
    if (sessionId) {
      console.log('🔧 Проверяем сессию в памяти...');
      
      // На Vercel используем память вместо файловой системы
      const sessionData = getSessionFromMemory(sessionId);
      
      if (sessionData && sessionData.user) {
        console.log('✅ Сессия найдена для:', sessionData.user.email);
        
        return NextResponse.json({
          success: true,
          user: {
            id: sessionData.user.id,
            name: sessionData.user.name,
            email: sessionData.user.email,
            role: sessionData.user.role || userRoleCookie || 'member'
          }
        });
      }
    }

    // Приоритет 3: Если есть user_role cookie но нет полных данных
    // Это временное решение для совместимости
    if (userRoleCookie && (sessionId || token)) {
      console.log('⚠️ Используем fallback авторизацию по user_role cookie');
      
      return NextResponse.json({
        success: true,
        user: {
          id: 'temp-' + Date.now(),
          name: 'User',
          email: 'user@example.com',
          role: userRoleCookie
        },
        warning: 'Limited user data available'
      });
    }

    // Если ничего не найдено
    console.log('❌ Авторизация не найдена');
    return NextResponse.json({ 
      success: false, 
      error: 'Не авторизован',
      debug: process.env.NODE_ENV === 'development' ? {
        hasSessionCookie: !!sessionId,
        hasAuthToken: !!token,
        hasUserRole: !!userRoleCookie,
        isVercel: !!process.env.VERCEL
      } : undefined
    }, { status: 401 });
    
  } catch (error) {
    console.error('❌ Критическая ошибка в /api/auth/me:', error);
    
    // Возвращаем более безопасную ошибку в продакшене
    const isDev = process.env.NODE_ENV === 'development';
    
    return NextResponse.json({ 
      success: false, 
      error: 'Внутренняя ошибка сервера',
      debug: isDev ? {
        message: error instanceof Error ? error.message : 'Unknown error',
        type: error instanceof Error ? error.constructor.name : 'Unknown',
        isVercel: !!process.env.VERCEL
      } : undefined
    }, { status: 500 });
  }
}

// Опциональный POST метод для создания сессии (для тестирования)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, email, name, role } = body;
    
    if (!userId || !email) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields' 
      }, { status: 400 });
    }
    
    // Создаем сессию в памяти
    const sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36);
    const sessionData = {
      user: { id: userId, email, name, role },
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 дней
    };
    
    memoryStore.set(sessionId, sessionData);
    
    // Устанавливаем cookie
    const response = NextResponse.json({ 
      success: true, 
      sessionId,
      user: sessionData.user 
    });
    
    response.cookies.set('session_id', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 дней
      path: '/'
    });
    
    if (role) {
      response.cookies.set('user_role', role, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60,
        path: '/'
      });
    }
    
    return response;
  } catch (error) {
    console.error('❌ Ошибка создания сессии:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to create session' 
    }, { status: 500 });
  }
}