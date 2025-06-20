import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

// 🚀 PRODUCTION OPTIMIZATION
const isDev = process.env.NODE_ENV === 'development';
const isVercel = process.env.VERCEL === '1';

// 🔧 PERFORMANCE: Увеличенный кэш для стабильности на Vercel
const routeCache = new Map<string, { type: string; role?: string; timestamp: number }>();
const roleCache = new Map<string, { role: string; timestamp: number }>();
const CACHE_TTL = isVercel ? 300000 : 60000;

// 🎯 ИСПРАВЛЕННАЯ РОЛЬ-БАЗИРОВАННАЯ КОНФИГУРАЦИЯ
const ROLE_CONFIG = {
  // Иерархия ролей (чем меньше число, тем выше уровень доступа)
  hierarchy: {
    'super-admin': 0,
    'admin': 1,
    'manager': 2,
    'trainer': 3,
    'member': 4,
    'guest': 5
  },

  // Автоматическое определение дашбордов по ролям
  dashboards: {
    'super-admin': '/admin',
    'admin': '/admin',
    'manager': '/manager-dashboard',
    'trainer': '/trainer-dashboard',
    'member': '/member-dashboard',
    'guest': '/'
  },

  // 🔧 РАСШИРЕННЫЕ паттерны маршрутов для каждой роли
  routePatterns: {
    'super-admin': [
      /^\/admin(\/.*)?$/,          // Это ДОЛЖНО покрывать /admin/users
      /^\/manager-dashboard(\/.*)?$/,
      /^\/trainer-dashboard(\/.*)?$/,
      /^\/member-dashboard(\/.*)?$/,
      /^\/system(\/.*)?$/,
      /^\/debug(\/.*)?$/,
      /^\/staff-(.*)?$/,
      /^\/manage-(.*)?$/,
      /^\/training-(.*)?$/,
      /^\/users(\/.*)?$/,          // 🔧 ДОБАВЬТЕ ЭТО для прямого доступа к /users
      /^\/admin\/users(\/.*)?$/    // 🔧 И ЭТО для явного доступа к /admin/users
    ],
    'admin': [
      /^\/admin(\/.*)?$/,
      /^\/manager-dashboard(\/.*)?$/,
      /^\/trainer-dashboard(\/.*)?$/,
      /^\/member-dashboard(\/.*)?$/,
      /^\/staff-(.*)?$/,
      /^\/manage-(.*)?$/,
      /^\/training-(.*)?$/,
      /^\/users(\/.*)?$/,          // 🔧 ДОБАВЬТЕ ЭТО
      /^\/admin\/users(\/.*)?$/    // 🔧 И ЭТО
    ],
  }
};

// 🚨 КРИТИЧЕСКАЯ ЗАЩИТА ОТ CVE-2025-29927 + Vercel проблем
const SECURITY_CHECK = (request: NextRequest): NextResponse | null => {
  const getClientIP = (request: NextRequest): string => {
    const forwarded = request.headers.get('x-forwarded-for');
    const realIP = request.headers.get('x-real-ip');
    const cfIP = request.headers.get('cf-connecting-ip');
    const vercelIP = request.headers.get('x-vercel-forwarded-for');

    if (vercelIP) return vercelIP.split(',')[0].trim();
    if (forwarded) return forwarded.split(',')[0].trim();
    if (realIP) return realIP;
    if (cfIP) return cfIP;
    return 'unknown';
  };

  // 🛡️ ЗАЩИТА ОТ PREFETCH ПРОБЛЕМ VERCEL
  const purpose = request.headers.get('purpose');
  const nextRouterPrefetch = request.headers.get('next-router-prefetch');
  const nextRouterState = request.headers.get('next-router-state-tree');

  if (purpose === 'prefetch' || nextRouterPrefetch || nextRouterState) {
    if (isDev) {
      console.log('🔄 БЛОКИРОВКА PREFETCH запроса:', request.nextUrl.pathname);
    }
    return new NextResponse('Prefetch blocked', { status: 204 });
  }

  const subrequestHeader = request.headers.get('x-middleware-subrequest');
  if (subrequestHeader) {
    const clientIP = getClientIP(request);

    if (isDev || process.env.DEBUG_SECURITY === 'true') {
      console.log('🚨 ЗАБЛОКИРОВАН EXPLOIT CVE-2025-29927:', {
        ip: clientIP,
        path: request.nextUrl.pathname,
        timestamp: new Date().toISOString(),
        userAgent: request.headers.get('user-agent')?.substring(0, 100)
      });
    }

    return new NextResponse('Forbidden: Security violation detected', {
      status: 403,
      headers: {
        'X-Security-Block': 'CVE-2025-29927-Protection',
        'X-Blocked-IP': clientIP,
        'Cache-Control': 'no-store'
      }
    });
  }

  return null;
};

// 🔐 УСТОЙЧИВОЕ ЧТЕНИЕ COOKIES для Vercel Edge Runtime
const getCookieValue = (request: NextRequest, cookieName: string): string | undefined => {
  try {
    // Метод 1: Стандартное чтение (работает в большинстве случаев)
    const cookieValue = request.cookies.get(cookieName)?.value;
    if (cookieValue) {
      return decodeURIComponent(cookieValue);
    }
  } catch (error) {
    if (isDev) {
      console.warn(`⚠️ Ошибка чтения cookie ${cookieName} методом 1:`, error);
    }
  }

  try {
    // Метод 2: Чтение из заголовков (fallback для Edge Runtime)
    const cookieHeader = request.headers.get('cookie');
    if (cookieHeader) {
      const cookies = cookieHeader.split(';');
      for (const cookie of cookies) {
        const [key, value] = cookie.trim().split('=');
        if (key === cookieName && value) {
          return decodeURIComponent(value);
        }
      }
    }
  } catch (error) {
    if (isDev) {
      console.warn(`⚠️ Ошибка чтения cookie ${cookieName} методом 2:`, error);
    }
  }

  return undefined;
};

// 🎯 ИСПРАВЛЕННОЕ ИЗВЛЕЧЕНИЕ РОЛИ ИЗ JWT ТОКЕНА
const extractUserRole = async (request: NextRequest): Promise<string | null> => {
  const pathname = request.nextUrl.pathname;
  
  try {
    // Пытаемся получить токен из разных источников
    let token: string | undefined;

    // 1. Из auth_token cookie
    token = getCookieValue(request, 'auth_token');

    // 2. Из user_role cookie как fallback
    if (!token) {
      const userRole = getCookieValue(request, 'user_role');
      if (userRole) {
        console.log(`👤 Роль из cookie для ${pathname}: ${userRole}`);
        return userRole;
      }
    }

    // 3. Из Authorization header
    if (!token) {
      const authHeader = request.headers.get('authorization');
      if (authHeader?.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      if (isDev) {
        console.log(`🔍 Токен не найден для ${pathname}`);
      }
      return null;
    }

    // Декодируем JWT
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || process.env.NEXT_PUBLIC_JWT_SECRET || 'your-secret-key'
    );

    const { payload } = await jwtVerify(token, secret);
    const role = payload.role as string || 'member';

    if (isDev) {
      console.log(`👤 Роль пользователя для ${pathname}: ${role}`);
    }

    // Сохраняем роль в cookie для быстрого доступа
    const response = NextResponse.next();
    response.cookies.set('user_role', role, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 часа
      path: '/'
    });

    return role;

  } catch (error) {
    if (isDev) {
      console.error(`💥 Ошибка извлечения роли для ${pathname}:`, error);
    }
    return null;
  }
};

// 🚀 ИСПРАВЛЕННАЯ ПРОВЕРКА ДОСТУПА К МАРШРУТУ
const checkRouteAccess = (pathname: string, userRole: string): boolean => {
  const roleLevel = ROLE_CONFIG.hierarchy[userRole as keyof typeof ROLE_CONFIG.hierarchy];

  if (roleLevel === undefined) {
    console.log(`❌ Неизвестная роль: ${userRole}`);
    return false;
  }

  // 🔧 СПЕЦИАЛЬНАЯ ПРОВЕРКА для /admin/* маршрутов
  if (pathname.startsWith('/admin/') && ['admin', 'super-admin'].includes(userRole)) {
    console.log(`✅ Админ доступ разрешен к ${pathname}`);
    return true;
  }

  // Проверяем паттерны маршрутов для роли пользователя и всех ролей выше
  for (const [role, level] of Object.entries(ROLE_CONFIG.hierarchy)) {
    if (level <= roleLevel) {
      const patterns = ROLE_CONFIG.routePatterns[role as keyof typeof ROLE_CONFIG.routePatterns];
      if (patterns) {
        for (const pattern of patterns) {
          if (pattern.test(pathname)) {
            console.log(`✅ Доступ разрешен для ${userRole} к ${pathname} через роль ${role}`);
            return true;
          }
        }
      }
    }
  }

  console.log(`❌ Доступ запрещен для ${userRole} к ${pathname}`);
  return false;
};

const getRouteType = (pathname: string, userRole?: string): { type: string; role?: string } => {
  const cacheKey = `${pathname}:${userRole || 'anonymous'}`;
  let result = { type: 'protected', role: userRole };

  // 🔧 СПЕЦИАЛЬНАЯ ОБРАБОТКА ГЛАВНОЙ СТРАНИЦЫ
  if (pathname === '/') {
    result = { type: 'public', role: userRole };
  }
  // 🔧 ОСТАЛЬНЫЕ ПУБЛИЧНЫЕ МАРШРУТЫ (точные совпадения)
  else {
    const publicRoutes = new Set([
      '/member-login', '/staff-login', '/register', '/demo', '/setup',
      '/setup-demo-data', '/setup-users', '/create-admin', '/init-super-admin',
      '/unauthorized', '/reset-password', '/forgot-password', '/about',
      '/trainers', '/programs', '/consultation', '/trial-class', '/offline',
      '/test-page', '/test-login', '/test-users', '/debug-auth', '/test-cookies',
      '/create-test-user', '/admin-login', '/clear-cookies', '/make-admin',
      '/create-real-admin', '/debug-dashboard', '/debug-password', '/test-auth-flow',
      '/fix-password', '/demo-smart-login', '/test-qr-codes', '/final-debug',
      '/quick-test', '/test-shop', '/debug-auth-status', '/test-calendar-sync',
      '/password-reset-success', '/mobile-scanner', '/test-camera', '/auth/face-auth'
    ]);

    if (publicRoutes.has(pathname)) {
      result = { type: 'public', role: userRole };
    }
    // 🔧 ПУБЛИЧНЫЕ ПРЕФИКСЫ
    else if (pathname.startsWith('/trainer/') ||
      pathname.startsWith('/programs/') ||
      pathname.startsWith('/book-')) {
      result = { type: 'public', role: userRole };
    }
    // 🔧 LOGIN СТРАНИЦЫ
    else if (pathname === '/member-login' || pathname === '/staff-login' || pathname === '/login') {
      result = { type: 'login', role: userRole };
    }
    // 🔧 STAFF МАРШРУТЫ (динамическое определение по роли)
    else if (userRole && checkRouteAccess(pathname, userRole)) {
      result = { type: 'staff', role: userRole };
    }
    // 🔧 MEMBER МАРШРУТЫ
    else if (pathname.startsWith('/member-dashboard') ||
      pathname.startsWith('/member-') ||
      pathname.startsWith('/my-') ||
      pathname.startsWith('/profile') ||
      pathname.startsWith('/bookings') ||
      pathname.startsWith('/group-classes') ||
      pathname.startsWith('/qr-code') ||
      pathname.startsWith('/setup-face-recognition')) {
      result = { type: 'member', role: userRole };
    }
    // 🔧 SHOP МАРШРУТЫ
    else if (pathname.startsWith('/shop')) {
      result = { type: 'shop', role: userRole };
    }
  }

  // Кэшируем результат
  if (routeCache.size > 1000) {
    routeCache.clear();
  }
  routeCache.set(cacheKey, {
    type: result.type,
    role: result.role,
    timestamp: Date.now()
  });

  return result;
};

// 🔐 УЛУЧШЕННАЯ ПРОВЕРКА АВТОРИЗАЦИИ
const checkAuthentication = async (request: NextRequest): Promise<boolean> => {
  try {
    // Получаем токены устойчивым способом
    const sessionId = getCookieValue(request, 'session_id');
    const sessionIdDebug = getCookieValue(request, 'session_id_debug');
    const authToken = getCookieValue(request, 'auth_token');

    // Быстрая проверка наличия токенов
    if (!sessionId && !sessionIdDebug && !authToken) {
      return false;
    }

    // Приоритет 1: JWT токен (если есть)
    if (authToken) {
      try {
        const secret = new TextEncoder().encode(
          process.env.JWT_SECRET || process.env.NEXT_PUBLIC_JWT_SECRET || 'your-secret-key'
        );

        const { payload } = await jwtVerify(authToken, secret);
        const isValid = !!(payload && payload.userId && payload.email && payload.role);
        if (isValid) return true;
      } catch (error) {
        if (isDev) {
          console.error('💥 Ошибка валидации JWT:', error);
        }
      }
    }

    // Приоритет 2: Сессии (простая проверка наличия)
    if (sessionId || sessionIdDebug) {
      return true;
    }

    return false;

  } catch (error) {
    if (isDev) {
      console.error('💥 Middleware: ошибка проверки авторизации:', error);
    }
    return false;
  }
};

// 📊 УСЛОВНОЕ логирование для production
const log = (message: string, data?: any) => {
  if (isDev || process.env.DEBUG_MIDDLEWARE === 'true') {
    console.log(message, data || '');
  }
};

// 🚀 ГЛАВНАЯ функция middleware
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 🚨 ПРОВЕРКА БЕЗОПАСНОСТИ (всегда первая)
  const securityBlock = SECURITY_CHECK(request);
  if (securityBlock) return securityBlock;

  // ⚡ БЫСТРЫЙ выход для служебных файлов
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/static/') ||
    pathname.includes('.') ||
    pathname.startsWith('/api/')
  ) {
    return NextResponse.next();
  }

  log(`🔍 Middleware: ${pathname}`);

  // 🎯 ИЗВЛЕКАЕМ РОЛЬ ПОЛЬЗОВАТЕЛЯ
  const userRole = await extractUserRole(request);
  log(`👤 User role: ${userRole || 'anonymous'}`);

  // 🎯 ОПРЕДЕЛЯЕМ тип маршрута с учетом роли
  const { type: routeType } = getRouteType(pathname, userRole || undefined);
  log(`📍 Route type: ${routeType}`);

  // 🔧 ИСПРАВЛЕНИЕ: НЕ редиректим с главной страницы
  if (pathname === '/' && routeType === 'public') {
    const response = NextResponse.next();
    
    // Добавляем заголовки для предотвращения кэширования
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    response.headers.set('X-Middleware-Cache', 'MISS');
    
    return response;
  }

  // ✅ ПУБЛИЧНЫЕ маршруты - пропускаем БЕЗ проверки авторизации
  if (routeType === 'public') {
    log(`✅ Public route allowed`);
    return NextResponse.next();
  }

  // 🔐 ПРОВЕРЯЕМ АВТОРИЗАЦИЮ
  const hasAuth = await checkAuthentication(request);

  // 🔄 ПЕРЕНАПРАВЛЕНИЕ с login страниц для авторизованных пользователей
  if (routeType === 'login' && hasAuth && userRole) {
    const dashboardUrl = ROLE_CONFIG.dashboards[userRole as keyof typeof ROLE_CONFIG.dashboards] || '/';
    log(`↗️ Redirecting from login page to ${dashboardUrl}`);
    const response = NextResponse.redirect(new URL(dashboardUrl, request.url));
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    response.headers.set('X-Middleware-Cache', 'MISS');
    return response;
  }

  // 🔒 ЗАЩИЩЕННЫЕ маршруты требуют авторизации
  if (!hasAuth) {
    let loginUrl = '/';

    switch (routeType) {
      case 'member':
        loginUrl = '/member-login';
        break;
      case 'staff':
      case 'shop':
        loginUrl = '/staff-login';
        break;
      default:
        loginUrl = '/';
    }

    log(`❌ No auth, redirecting to ${loginUrl}`);
    const response = NextResponse.redirect(
      new URL(loginUrl + '?redirect=' + encodeURIComponent(pathname), request.url)
    );
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    response.headers.set('X-Middleware-Cache', 'MISS');
    return response;
  }

  // 🎯 ПРОВЕРЯЕМ ДОСТУП К STAFF МАРШРУТАМ
  if (routeType === 'staff' && userRole) {
    const hasAccess = checkRouteAccess(pathname, userRole);

    if (!hasAccess) {
      const dashboardUrl = ROLE_CONFIG.dashboards[userRole as keyof typeof ROLE_CONFIG.dashboards] || '/unauthorized';
      log(`❌ Access denied for role ${userRole} to ${pathname}, redirecting to ${dashboardUrl}`);
      const response = NextResponse.redirect(new URL(dashboardUrl, request.url));
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
      response.headers.set('X-Middleware-Cache', 'MISS');
      response.headers.set('X-Access-Denied', 'true');
      return response;
    }
  }

  log(`✅ Access granted for role ${userRole}`);
  const response = NextResponse.next();

  // 🔧 СОХРАНЯЕМ РОЛЬ В ЗАГОЛОВКЕ для быстрого доступа
  if (userRole) {
    response.headers.set('X-User-Role', userRole);
  }

  // 🔧 СПЕЦИАЛЬНЫЕ ЗАГОЛОВКИ для staff маршрутов в production
  if (isVercel && (routeType === 'staff' || routeType === 'member')) {
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('X-Middleware-Cache', 'MISS');
    response.headers.set('Vary', 'Cookie, Authorization');
  }

  return response;
}

// 🎯 КОНФИГУРАЦИЯ для Vercel с правильным matcher
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
