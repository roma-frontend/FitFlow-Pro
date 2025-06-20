// lib/universal-auth.ts
import { NextRequest } from 'next/server';
import { getSession } from '@/lib/simple-auth';
import jwt from 'jsonwebtoken';

interface User {
  id: string;
  email: string;
  role: string;
  name?: string;
}

interface AuthResult {
  authenticated: boolean;
  user: User | null;
  system: 'sessions' | 'jwt' | 'none';
  error?: string;
}

export function getAuthFromRequest(request: NextRequest): AuthResult {
  try {
    console.log('🔍 universal-auth: начинаем проверку авторизации');
    
    // Сначала проверяем сессии (приоритет)
    const sessionId = request.cookies.get('session_id')?.value;
    const sessionIdDebug = request.cookies.get('session_id_debug')?.value;
    const finalSessionId = sessionId || sessionIdDebug;
    
    console.log('🍪 universal-auth: session_id найден:', !!sessionId);
    console.log('🍪 universal-auth: session_id_debug найден:', !!sessionIdDebug);

    // Проверяем сессию если есть
    if (finalSessionId) {
      const session = getSession(finalSessionId);
      console.log('👤 universal-auth: сессия найдена:', !!session);

      if (session) {
        console.log('✅ universal-auth: авторизация через сессию успешна');
        return {
          authenticated: true,
          user: {
            id: session.user.id,
            email: session.user.email,
            role: session.user.role,
            name: session.user.name
          },
          system: 'sessions'
        };
      }
    }

    // Если сессии нет, проверяем JWT токен
    const authToken = request.cookies.get('auth_token')?.value;
    console.log('🔑 universal-auth: auth_token найден:', !!authToken);
    
    if (authToken) {
      try {
        if (!process.env.JWT_SECRET) {
          console.error('❌ universal-auth: JWT_SECRET не установлен');
          return {
            authenticated: false,
            user: null,
            system: 'none',
            error: 'JWT_SECRET not configured'
          };
        }

        console.log('🔍 universal-auth: проверяем JWT токен...');
        const decoded = jwt.verify(authToken, process.env.JWT_SECRET) as any;
        console.log('✅ universal-auth: авторизация через JWT успешна');

        return {
          authenticated: true,
          user: {
            id: decoded.userId,
            email: decoded.email,
            role: decoded.role,
            name: decoded.name
          },
          system: 'jwt'
        };

      } catch (jwtError) {
        console.error('❌ universal-auth: ошибка проверки JWT:', jwtError);
        return {
          authenticated: false,
          user: null,
          system: 'none',
          error: `JWT verification failed: ${jwtError instanceof Error ? jwtError.message : 'Unknown error'}`
        };
      }
    }

    // Ни сессии, ни JWT токена нет
    console.log('❌ universal-auth: ни сессии, ни JWT токена не найдено');
    return {
      authenticated: false,
      user: null,
      system: 'none',
      error: 'No valid session_id or auth_token found'
    };

  } catch (error) {
    console.error('❌ universal-auth: критическая ошибка:', error);
    return {
      authenticated: false,
      user: null,
      system: 'none',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Вспомогательная функция для проверки роли
export function requireRole(auth: AuthResult, allowedRoles: string[]): boolean {
  if (!auth.authenticated || !auth.user) {
    return false;
  }
  
  return allowedRoles.includes(auth.user.role);
}

// Вспомогательная функция для создания ответа об ошибке авторизации
export function createAuthErrorResponse(auth: AuthResult, requiredRoles?: string[]) {
  if (!auth.authenticated) {
    return {
      success: false,
      error: 'Необходима авторизация',
      debug: {
        system: auth.system,
        error: auth.error
      }
    };
  }
  
  if (requiredRoles && !requireRole(auth, requiredRoles)) {
    return {
      success: false,
      error: 'Доступ запрещен',
      debug: {
        userRole: auth.user?.role,
        requiredRoles,
        system: auth.system
      }
    };
  }
  
  return null;
}
