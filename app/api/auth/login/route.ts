// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { authenticate, createSession, getUserByEmail } from '@/lib/simple-auth';
import { ConvexHttpClient } from "convex/browser";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Универсальная функция для создания ответа с куками
function createAuthResponse(user: any, sessionId?: string) {
  console.log('🎯 Создаем ответ авторизации для:', user.email);
  
  // Создаем JWT токен
  const tokenPayload = {
    userId: user.id || user._id,
    email: user.email,
    role: user.role,
    name: user.name
  };
  
  const token = jwt.sign(
    tokenPayload,
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '7d' }
  );
  
  console.log('🎫 JWT токен создан');
  
  // Определяем дашборд для роли
  const dashboardUrls: Record<string, string> = {
    'admin': '/admin',
    'super-admin': '/admin',
    'manager': '/manager-dashboard',
    'trainer': '/trainer-dashboard',
    'client': '/member-dashboard',
    'member': '/member-dashboard',
    'staff': '/staff-dashboard'
  };
  
  const dashboardUrl = dashboardUrls[user.role] || '/dashboard';
  
  const responseData = {
    success: true,
    user: {
      id: user.id || user._id,
      userId: user.id || user._id,
      email: user.email,
      name: user.name,
      role: user.role
    },
    dashboardUrl,
    token, // Включаем токен в ответ для сохранения в localStorage
    timestamp: Date.now()
  };
  
  const response = NextResponse.json(responseData);
  
  // Настройки куки для production и development
  const isProduction = process.env.NODE_ENV === 'production';
  const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax' as const,
    maxAge: 7 * 24 * 60 * 60, // 7 дней
    path: '/'
  };
  
  // Устанавливаем JWT токен
  response.cookies.set('auth_token', token, cookieOptions);
  console.log('🍪 Установлен auth_token');
  
  // Устанавливаем роль (для middleware)
  response.cookies.set('user_role', user.role, {
    ...cookieOptions,
    httpOnly: false // Доступен из JS
  });
  console.log('🍪 Установлен user_role:', user.role);
  
  // Устанавливаем session_id если есть
  if (sessionId) {
    response.cookies.set('session_id', sessionId, cookieOptions);
    
    // Дублируем для отладки в development
    if (!isProduction) {
      response.cookies.set('session_id_debug', sessionId, {
        ...cookieOptions,
        httpOnly: false
      });
    }
    console.log('🍪 Установлен session_id');
  }
  
  // Заголовки для предотвращения кеширования
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');
  
  return response;
}

export async function POST(request: NextRequest) {
  console.log('\n🔐 === НАЧАЛО ПРОЦЕССА ВХОДА ===');
  console.log('🔐 Timestamp:', new Date().toISOString());
  
  try {
    const body = await request.json();
    const { email, password, role } = body;
    
    console.log('📧 Email:', email);
    console.log('👤 Запрошенная роль:', role || 'не указана');
    
    if (!email || !password) {
      console.log('❌ Email или пароль не указаны');
      return NextResponse.json(
        { success: false, error: 'Email и пароль обязательны' },
        { status: 400 }
      );
    }
    
    // Сначала пробуем простую аутентификацию (моковые пользователи)
    console.log('🔍 Проверяем в моковой системе...');
    const session = authenticate(email, password);
    
    if (session) {
      console.log('✅ Найден в моковой системе:', {
        userId: session.user.id,
        userName: session.user.name,
        userRole: session.user.role
      });
      
      // Проверяем соответствие роли если указана
      if (role && session.user.role !== role) {
        // Для staff проверяем, что это административная роль
        const staffRoles = ['admin', 'super-admin', 'manager', 'trainer'];
        if (role === 'staff' && !staffRoles.includes(session.user.role)) {
          console.log('❌ Несоответствие роли');
          return NextResponse.json(
            { success: false, error: 'Неверные учетные данные' },
            { status: 401 }
          );
        }
      }
      
      return createAuthResponse(session.user, session.id);
    }
    
    // Если не найден в моковой системе, проверяем в Convex
    console.log('🔍 Проверяем в Convex...');
    
    try {
      const convexUser = await convex.query("users:getByEmail", { email });
      
      if (convexUser) {
        console.log('👤 Пользователь найден в Convex:', {
          id: convexUser._id,
          role: convexUser.role,
          isActive: convexUser.isActive
        });
        
        if (!convexUser.isActive) {
          console.log('❌ Аккаунт деактивирован');
          return NextResponse.json(
            { success: false, error: 'Аккаунт деактивирован' },
            { status: 401 }
          );
        }
        
        // Проверяем пароль
        const isPasswordValid = await bcrypt.compare(password, convexUser.password);
        console.log('🔐 Результат проверки пароля:', isPasswordValid);
        
        if (!isPasswordValid) {
          console.log('❌ Неверный пароль');
          return NextResponse.json(
            { success: false, error: 'Неверные учетные данные' },
            { status: 401 }
          );
        }
        
        // Проверяем соответствие роли если указана
        if (role && convexUser.role !== role) {
          const staffRoles = ['admin', 'super-admin', 'manager', 'trainer'];
          if (role === 'staff' && !staffRoles.includes(convexUser.role)) {
            console.log('❌ Несоответствие роли');
            return NextResponse.json(
              { success: false, error: 'Неверные учетные данные' },
              { status: 401 }
            );
          }
        }
        
        // Обновляем время последнего входа
        try {
          await convex.mutation("users:updateLastLogin", {
            userId: convexUser._id,
            timestamp: Date.now()
          });
        } catch (updateError) {
          console.log('⚠️ Не удалось обновить время входа:', updateError);
        }
        
        // Создаем сессию в simple-auth
        const sessionId = createSession({
          id: convexUser._id,
          email: convexUser.email,
          role: convexUser.role,
          name: convexUser.name || `${convexUser.firstName} ${convexUser.lastName}`
        });
        
        return createAuthResponse(convexUser, sessionId);
      }
      
    } catch (convexError) {
      console.error('⚠️ Ошибка Convex:', convexError);
      // Продолжаем выполнение
    }
    
    // Пользователь не найден
    console.log('❌ Пользователь не найден');
    return NextResponse.json(
      { success: false, error: 'Неверные учетные данные' },
      { status: 401 }
    );
    
  } catch (error) {
    console.error('💥 Критическая ошибка входа:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Внутренняя ошибка сервера',
        details: process.env.NODE_ENV === 'development' ? error: error instanceof Error ? error.message : undefined
      },
      { status: 500 }
    );
  } finally {
    console.log('🔐 === КОНЕЦ ПРОЦЕССА ВХОДА ===\n');
  }
}