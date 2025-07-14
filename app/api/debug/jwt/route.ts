// app/api/debug/jwt/route.ts - Отладочный endpoint для JWT
import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { getSession } from '@/lib/simple-auth';

export async function GET(request: NextRequest) {
  try {
    console.log('\n🔍 === JWT DEBUG START ===');
    
    // Получаем все куки
    const cookies = request.cookies.getAll();
    console.log('🍪 Все куки:', cookies.map(c => ({ name: c.name, hasValue: !!c.value })));
    
    // Получаем JWT токены
    const sessionId = request.cookies.get('session_id')?.value;
    const authToken = request.cookies.get('auth_token')?.value;
    const sessionIdDebug = request.cookies.get('session_id_debug')?.value;
    const userRole = request.cookies.get('user_role')?.value;
    
    const jwtToken = sessionId || authToken || sessionIdDebug;
    
    const debugInfo: any = {
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        hasJwtSecret: !!process.env.JWT_SECRET,
        jwtSecretLength: process.env.JWT_SECRET?.length,
        vercelEnv: process.env.VERCEL_ENV,
        isVercel: !!process.env.VERCEL
      },
      cookies: {
        hasSessionId: !!sessionId,
        hasAuthToken: !!authToken,
        hasSessionIdDebug: !!sessionIdDebug,
        userRole: userRole,
        tokenSource: sessionId ? 'session_id' : authToken ? 'auth_token' : sessionIdDebug ? 'session_id_debug' : 'none'
      },
      token: {
        exists: !!jwtToken,
        length: jwtToken?.length,
        preview: jwtToken ? jwtToken.substring(0, 20) + '...' : null
      }
    };
    
    if (!jwtToken) {
      return NextResponse.json({
        ...debugInfo,
        error: 'No JWT token found in cookies'
      });
    }
    
    // Пробуем декодировать токен с разными секретами
    const secrets = [
      { name: 'env', value: process.env.JWT_SECRET },
      { name: 'fallback', value: 'fallback-secret-key-change-in-production' },
      { name: 'test', value: 'your-secret-key-change-in-production-123456789' }
    ];
    
    debugInfo.secretTests = [];
    
    for (const secret of secrets) {
      if (!secret.value) continue;
      
      try {
        const encoded = new TextEncoder().encode(secret.value);
        const { payload } = await jwtVerify(jwtToken, encoded);
        
        debugInfo.secretTests.push({
          name: secret.name,
          success: true,
          payload: {
            hasSessionData: !!payload.sessionData,
            userId: payload.userId,
            userRole: payload.userRole,
            userEmail: payload.userEmail,
            exp: payload.exp,
            iat: payload.iat,
            keys: Object.keys(payload)
          }
        });
        
        // Если успешно, пробуем getSession
        if (secret.name === 'env' || (!process.env.JWT_SECRET && secret.name === 'fallback')) {
          console.log('🔍 Проверяем через getSession...');
          const session = await getSession(jwtToken);
          
          debugInfo.getSessionResult = {
            success: !!session,
            user: session ? {
              id: session.user.id,
              email: session.user.email,
              role: session.user.role,
              name: session.user.name
            } : null
          };
        }
        
      } catch (error) {
        debugInfo.secretTests.push({
          name: secret.name,
          success: false,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }
    
    // Проверяем сырой payload
    try {
      const parts = jwtToken.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
        debugInfo.rawPayload = payload;
      }
    } catch (e) {
      debugInfo.rawPayloadError = 'Failed to decode raw payload';
    }
    
    return NextResponse.json(debugInfo);
    
  } catch (error) {
    console.error('❌ JWT Debug error:', error);
    return NextResponse.json({
      error: 'Debug endpoint error',
      message: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Тест создания токена
    const { createSession } = await import('@/lib/simple-auth');
    
    const testUser = {
      id: 'test-user-123',
      email: 'test@example.com',
      role: 'member' as const,
      name: 'Test User',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    console.log('🔐 Создаем тестовый токен...');
    const token = await createSession(testUser);
    
    console.log('🔍 Проверяем созданный токен...');
    const session = await getSession(token);
    
    return NextResponse.json({
      tokenCreated: true,
      tokenLength: token.length,
      tokenPreview: token.substring(0, 20) + '...',
      sessionValid: !!session,
      session: session ? {
        id: session.id,
        email: session.email,
        userEmail: session.user.email,
        userRole: session.user.role
      } : null,
      environment: {
        hasJwtSecret: !!process.env.JWT_SECRET,
        jwtSecretLength: process.env.JWT_SECRET?.length
      }
    });
    
  } catch (error) {
    console.error('❌ JWT Create test error:', error);
    return NextResponse.json({
      error: 'Create test error',
      message: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}