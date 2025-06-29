// app/api/auth/login/route.ts - ИСПРАВЛЕННАЯ ВЕРСИЯ ДЛЯ JWT
import { NextRequest, NextResponse } from 'next/server';
import {  createSession, type User, authenticateSync } from '@/lib/simple-auth';
import { ConvexHttpClient } from "convex/browser";
import bcrypt from 'bcryptjs';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);


const checkRouteAccess = (pathname: string, userRole: string): boolean => {
  const normalizedRole = userRole.toLowerCase().replace(/_/g, '-');
  
  // Профили тренеров доступны всем авторизованным пользователям
  if (pathname.startsWith('/trainer/')) {
    return true;
  }
  
  // Админские маршруты
  if (pathname.startsWith('/admin/')) {
    return ['admin', 'super-admin'].includes(normalizedRole);
  }
  
  // Менеджерские маршруты
  if (pathname.startsWith('/manager-')) {
    return ['manager', 'admin', 'super-admin'].includes(normalizedRole);
  }
  
  // Тренерские маршруты
  if (pathname.startsWith('/trainer-')) {
    return ['trainer', 'manager', 'admin', 'super-admin'].includes(normalizedRole);
  }
  
  // Клиентские маршруты
  if (pathname.startsWith('/member-') || pathname.startsWith('/my-') || pathname.startsWith('/profile') || pathname.startsWith('/bookings')) {
    return ['member', 'client', 'trainer', 'manager', 'admin', 'super-admin'].includes(normalizedRole);
  }
  
  // Магазин доступен всем
  if (pathname.startsWith('/shop')) {
    return true;
  }
  
  // По умолчанию разрешаем доступ
  return true;
};

// Универсальная функция для создания ответа с куками
async function createAuthResponse(user: any, sessionToken?: string, redirectUrl?: string) {
  console.log('🎯 Создаем ответ авторизации для:', user.email);
  
  // ✅ ИСПРАВЛЕНИЕ: Используем переданный sessionToken если есть, иначе создаем новый
  let token = sessionToken;
  
  if (!token) {
    // Создаем JWT токен через simple-auth для консистентности
    const fullUser: User = {
      id: user.id || user._id,
      email: user.email,
      role: user.role,
      name: user.name,
      avatar: user.avatar,
      avatarUrl: user.avatarUrl,
      isVerified: user.isVerified || false,
      rating: user.rating || 0,
      createdAt: user.createdAt || new Date(),
      updatedAt: user.updatedAt || new Date()
    };
    
    token = await createSession(fullUser);
    console.log('🎫 Новый JWT токен создан через createSession');
  } else {
    console.log('🎫 Используем переданный JWT токен');
  }
  
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
  
  const defaultDashboardUrl = dashboardUrls[user.role] || '/dashboard';
  
  // 🔧 ОБРАБАТЫВАЕМ REDIRECT URL
  let finalRedirectUrl = defaultDashboardUrl;
  
  if (redirectUrl) {
    try {
      const decodedRedirect = decodeURIComponent(redirectUrl);
      console.log('🔍 Обрабатываем redirect:', decodedRedirect);
      
      // Проверяем, что это внутренний путь
      if (decodedRedirect.startsWith('/') && !decodedRedirect.startsWith('//')) {
        // Проверяем доступ к запрошенному маршруту
        const hasAccess = checkRouteAccess(decodedRedirect, user.role);
        
        if (hasAccess) {
          finalRedirectUrl = decodedRedirect;
          console.log('✅ Доступ к redirect маршруту разрешен:', finalRedirectUrl);
        } else {
          console.log('❌ Нет доступа к redirect маршруту, используем дашборд:', defaultDashboardUrl);
        }
      } else {
        console.log('❌ Неверный формат redirect, используем дашборд:', defaultDashboardUrl);
      }
    } catch (error) {
      console.log('❌ Ошибка декодирования redirect, используем дашборд:', defaultDashboardUrl);
    }
  }
  
  const responseData = {
    success: true,
    user: {
      id: user.id || user._id,
      userId: user.id || user._id,
      email: user.email,
      name: user.name,
      role: user.role
    },
    dashboardUrl: finalRedirectUrl,  // Используем обработанный URL
    redirectUrl: finalRedirectUrl,   // Добавляем явное поле для redirect
    token, // Включаем токен в ответ для сохранения в localStorage
    timestamp: Date.now(),
    requestedRedirect: redirectUrl,  // Сохраняем исходный запрос
    finalRedirect: finalRedirectUrl  // И финальный результат
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
  
  // ✅ ИСПРАВЛЕНИЕ: Устанавливаем JWT токен в session_id cookie
  response.cookies.set('session_id', token, cookieOptions);
  console.log('🍪 Установлен session_id с JWT токеном');
  
  // Дублируем в auth_token для совместимости
  response.cookies.set('auth_token', token, cookieOptions);
  console.log('🍪 Установлен auth_token (дубликат)');
  
  // Устанавливаем роль (для middleware)
  response.cookies.set('user_role', user.role, {
    ...cookieOptions,
    httpOnly: false // Доступен из JS
  });
  console.log('🍪 Установлен user_role:', user.role);
  
  // Дублируем для отладки в development
  if (!isProduction) {
    response.cookies.set('session_id_debug', token, {
      ...cookieOptions,
      httpOnly: false
    });
  }
  
  // Заголовки для предотвращения кеширования
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');
  
  return response;
}

// Функция для создания полного объекта User из данных Convex
function createUserFromConvex(convexUser: any): User {
  const now = new Date();
  
  return {
    id: convexUser._id,
    email: convexUser.email,
    role: convexUser.role,
    name: convexUser.name || `${convexUser.firstName || ''} ${convexUser.lastName || ''}`.trim() || convexUser.email,
    avatar: convexUser.avatar || convexUser.photoUrl || undefined,
    avatarUrl: convexUser.avatarUrl || convexUser.photoUrl || undefined,
    isVerified: convexUser.isVerified || false,
    rating: convexUser.rating || undefined,
    createdAt: convexUser.createdAt ? new Date(convexUser.createdAt) : now,
    updatedAt: convexUser.updatedAt ? new Date(convexUser.updatedAt) : now
  };
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
    
    // ✅ ИСПРАВЛЕНИЕ: Используем синхронную версию для совместимости
    console.log('🔍 Проверяем в моковой системе...');
    const session = authenticateSync(email, password);
    
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
      
      // ✅ ИСПРАВЛЕНИЕ: Создаем JWT токен через createSession для консистентности
      const jwtToken = await createSession(session.user);
      return await createAuthResponse(session.user, jwtToken);
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
        
        // Создаем полный объект User для сессии
        const fullUser = createUserFromConvex(convexUser);
        
        // ✅ ИСПРАВЛЕНИЕ: Создаем JWT токен через createSession для консистентности
        const jwtToken = await createSession(fullUser);
        
        console.log('✅ JWT токен создан для Convex пользователя через createSession');
        
        return await createAuthResponse({
          id: convexUser._id,
          email: convexUser.email,
          role: convexUser.role,
          name: fullUser.name
        }, jwtToken);
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
        details: process.env.NODE_ENV === 'development' ? error : error instanceof Error ? error.message : undefined
      },
      { status: 500 }
    );
  } finally {
    console.log('🔐 === КОНЕЦ ПРОЦЕССА ВХОДА ===\n');
  }
}