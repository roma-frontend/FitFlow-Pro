// app/api/auth/fix-jwt/route.ts - Исправление JWT токена
import { NextRequest, NextResponse } from 'next/server';
import { createSession } from '@/lib/simple-auth';
import { jwtVerify } from 'jose';

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 === FIX JWT START ===');
    
    // Получаем текущие куки
    const userRole = request.cookies.get('user_role')?.value;
    const sessionId = request.cookies.get('session_id')?.value;
    const authToken = request.cookies.get('auth_token')?.value;
    
    if (!userRole) {
      return NextResponse.json({
        success: false,
        error: 'Роль пользователя не найдена'
      }, { status: 400 });
    }
    
    console.log('👤 Роль из куки:', userRole);
    
    // Пытаемся получить данные из существующего токена
    let userData = null;
    const existingToken = sessionId || authToken;
    
    if (existingToken) {
      // Пробуем разные секреты
      const secrets = [
        process.env.JWT_SECRET,
        'fallback-secret-key-change-in-production',
        'your-secret-key-change-in-production-123456789'
      ].filter(Boolean);
      
      for (const secret of secrets) {
        try {
          const { payload } = await jwtVerify(existingToken, new TextEncoder().encode(secret!));
          
          if (payload.sessionData && typeof payload.sessionData === 'object') {
            const session = payload.sessionData as any;
            userData = {
              id: session.user?.id || payload.userId,
              email: session.user?.email || payload.userEmail || 'user@example.com',
              name: session.user?.name || payload.userName || 'User',
              role: userRole
            };
            console.log('✅ Данные извлечены из токена:', userData);
            break;
          }
        } catch (e) {
          // Пробуем следующий секрет
        }
      }
    }
    
    // Если не удалось извлечь данные, создаем минимальные
    if (!userData) {
      userData = {
        id: `member-${Date.now()}`,
        email: 'member@example.com',
        name: 'Member User',
        role: userRole
      };
      console.log('⚠️ Создаем данные по умолчанию:', userData);
    }
    
    // Создаем новый JWT токен с правильным секретом
    const newToken = await createSession({
      id: userData.id,
      email: userData.email,
      role: userData.role as any,
      name: userData.name,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    console.log('✅ Новый JWT токен создан');
    
    // Создаем response с новыми куками
    const response = NextResponse.json({
      success: true,
      message: 'JWT токен исправлен',
      user: userData,
      tokenLength: newToken.length
    });
    
    // Устанавливаем исправленные куки
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: 7 * 24 * 60 * 60, // 7 дней
      path: '/'
    };
    
    response.cookies.set('session_id', newToken, cookieOptions);
    response.cookies.set('auth_token', newToken, cookieOptions);
    response.cookies.set('user_role', userRole, {
      ...cookieOptions,
      httpOnly: false
    });
    
    // Для разработки
    if (process.env.NODE_ENV === 'development') {
      response.cookies.set('session_id_debug', newToken, {
        ...cookieOptions,
        httpOnly: false
      });
    }
    
    console.log('🔧 === FIX JWT END ===');
    
    return response;
    
  } catch (error) {
    console.error('❌ Fix JWT error:', error);
    return NextResponse.json({
      success: false,
      error: 'Ошибка исправления JWT',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}