import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

declare global {
  var cacheCleanupStarted: boolean | undefined;
}

// 🚀 PRODUCTION OPTIMIZATION
const isDev = process.env.NODE_ENV === 'development';
const isVercel = process.env.VERCEL === '1';

// 🔧 ТИПЫ ДЛЯ АВТОРИЗАЦИИ
interface AuthResult {
  authenticated: boolean;
  userRole?: string;
  token?: string;
  userId?: string;
  userEmail?: string;
  userName?: string;
}

// 🔧 ENHANCED CACHING с автоочисткой
const CACHE_TTL = isVercel ? 300000 : 60000; // 5 минут на Vercel, 1 минута локально
const MAX_CACHE_SIZE = 1000;

// 🎯 СОЗДАЕМ КЭШИ ДЛЯ РАЗНЫХ ТИПОВ ДАННЫХ
const authCache = new Map<string, { data: AuthResult; timestamp: number }>();
const roleCache = new Map<string, { hasAccess: boolean; timestamp: number }>();
const jwtCache = new Map<string, { payload: any; timestamp: number }>();

// Очистка кэша
const cleanCache = (cache: Map<any, any>) => {
  if (cache.size > MAX_CACHE_SIZE) {
    const now = Date.now();
    for (const [key, value] of cache.entries()) {
      if (now - value.timestamp > CACHE_TTL) {
        cache.delete(key);
      }
    }
    // Если всё ещё слишком много, очищаем старые записи
    if (cache.size > MAX_CACHE_SIZE) {
      const entries = Array.from(cache.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      const toDelete = entries.slice(0, Math.floor(cache.size / 2));
      toDelete.forEach(([key]) => cache.delete(key));
    }
  }
};

// 🎯 УСИЛЕННАЯ РОЛЬ-БАЗИРОВАННАЯ КОНФИГУРАЦИЯ
const ROLE_CONFIG = {
  // Иерархия ролей (чем меньше число, тем выше уровень доступа)
  hierarchy: {
    'super-admin': 0,
    'admin': 1,
    'manager': 2,
    'trainer': 3,
    'member': 4,
    'client': 4,
    'guest': 5
  } as const,

  // Дашборды по ролям
  dashboards: {
    'super-admin': '/admin',
    'admin': '/admin',
    'manager': '/manager-dashboard',
    'trainer': '/trainer-dashboard',
    'member': '/member-dashboard',
    'client': '/member-dashboard',
    'guest': '/'
  } as const,

  // 🔧 РАСШИРЕННЫЕ паттерны маршрутов
  routePatterns: {
    'super-admin': [
      /^\/admin(\/.*)?$/,
      /^\/manager-dashboard(\/.*)?$/,
      /^\/trainer-dashboard(\/.*)?$/,
      /^\/member-dashboard(\/.*)?$/,
      /^\/system(\/.*)?$/,
      /^\/debug(\/.*)?$/,
      /^\/staff-(.*)?$/,
      /^\/manage-(.*)?$/,
      /^\/training-(.*)?$/,
      /^\/shop(\/.*)?$/,
      /^\/qr-code(\/.*)?$/,
      /^\/memberships(\/.*)?$/,
      /^\/analytics(\/.*)?$/,
      /^\/reports(\/.*)?$/,
      /^\/trainer\/(.*)?$/,
      /^\/trainers(\/.*)?$/
    ],
    'admin': [
      /^\/admin(\/.*)?$/,
      /^\/manager-dashboard(\/.*)?$/,
      /^\/trainer-dashboard(\/.*)?$/,
      /^\/member-dashboard(\/.*)?$/,
      /^\/staff-(.*)?$/,
      /^\/manage-(.*)?$/,
      /^\/training-(.*)?$/,
      /^\/shop(\/.*)?$/,
      /^\/qr-code(\/.*)?$/,
      /^\/memberships(\/.*)?$/,
      /^\/analytics(\/.*)?$/,
      /^\/reports(\/.*)?$/,
      /^\/trainer\/(.*)?$/,  // Доступ к профилям тренеров
      /^\/trainers(\/.*)?$/
    ],
    'manager': [
      /^\/manager-dashboard(\/.*)?$/,
      /^\/trainer-dashboard(\/.*)?$/,
      /^\/member-dashboard(\/.*)?$/,
      /^\/manage-(.*)?$/,
      /^\/training-(.*)?$/,
      /^\/shop(\/.*)?$/,
      /^\/qr-code(\/.*)?$/,
      /^\/memberships(\/.*)?$/,
      /^\/analytics(\/.*)?$/,
      /^\/trainer\/(.*)?$/,  // Доступ к профилям тренеров
      /^\/trainers(\/.*)?$/
    ],
    'trainer': [
      /^\/trainer-dashboard(\/.*)?$/,
      /^\/member-dashboard(\/.*)?$/,
      /^\/training-(.*)?$/,
      /^\/schedule(\/.*)?$/,
      /^\/clients(\/.*)?$/,
      /^\/trainer\/(.*)?$/,  // Доступ к профилям тренеров
      /^\/trainers(\/.*)?$/
    ],
    'member': [
      /^\/member-dashboard(\/.*)?$/,
      /^\/profile(\/.*)?$/,
      /^\/bookings(\/.*)?$/,
      /^\/my-(.*)?$/,
      /^\/shop(\/.*)?$/,
      /^\/qr-code(\/.*)?$/,
      /^\/trainers(\/.*)?$/,
      /^\/trainer\/(.*)?$/,  // Доступ к профилям тренеров
      /^\/qr-code(\/.*)?$/,
      /^\/setup-face-recognition(\/.*)?$/
    ],
    'client': [
      /^\/member-dashboard(\/.*)?$/,
      /^\/profile(\/.*)?$/,
      /^\/bookings(\/.*)?$/,
      /^\/my-(.*)?$/,
      /^\/shop(\/.*)?$/,
      /^\/qr-code(\/.*)?$/,
      /^\/memberships(\/.*)?$/,
      /^\/trainer\/(.*)?$/,  // Доступ к профилям тренеров
      /^\/trainers(\/.*)?$/,
      /^\/qr-code(\/.*)?$/,
      /^\/setup-face-recognition(\/.*)?$/
    ],
    'guest': [
      // Гости имеют очень ограниченный доступ - только к публичным страницам
      /^\/$/,
      /^\/about(\/.*)?$/,
      /^\/contact(\/.*)?$/,
      /^\/programs(\/.*)?$/,
      /^\/trainers(\/.*)?$/,
      /^\/trainer\/(.*)?$/ // Публичный доступ к профилям тренеров
    ]
  } as const
};

// 🔧 ТИП ДЛЯ РОЛЕЙ
type UserRole = keyof typeof ROLE_CONFIG.hierarchy;

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
    // Для /admin/users разрешаем prefetch
    if (request.nextUrl.pathname.startsWith('/admin/users')) {
      console.log('🔄 Разрешаем prefetch для /admin/users');
      return NextResponse.next();
    }

    if (isDev) {
      console.log('🔄 БЛОКИРОВКА PREFETCH запроса:', request.nextUrl.pathname);
    }

    // ИСПРАВЛЕНО: Используем пустой NextResponse для статуса 204
    return new NextResponse(null, {
      status: 204,
      headers: {
        'X-Prefetch-Blocked': 'true'
      }
    });
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

// 🔐 УЛУЧШЕННОЕ чтение cookies для всех сред
const getCookieValue = (request: NextRequest, cookieName: string): string | undefined => {
  try {
    // Метод 1: Стандартное чтение
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
    // Метод 2: Чтение из заголовков
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

// 🔧 ФУНКЦИЯ ПРОВЕРКИ ВАЛИДНОСТИ РОЛИ
const isValidUserRole = (role: string): role is UserRole => {
  return role in ROLE_CONFIG.hierarchy;
};

// 🔧 НОРМАЛИЗАЦИЯ РОЛИ
const normalizeUserRole = (role: string): UserRole => {
  const normalized = role.toLowerCase().replace(/_/g, '-') as UserRole;

  if (isValidUserRole(normalized)) {
    return normalized;
  }

  // Fallback маппинг
  const roleMapping: Record<string, UserRole> = {
    'user': 'member',
    'customer': 'client',
    'employee': 'trainer',
    'superadmin': 'super-admin',
    'super_admin': 'super-admin',
    'admin_user': 'admin'
  };

  if (roleMapping[normalized]) {
    return roleMapping[normalized];
  }

  console.warn(`⚠️ Неизвестная роль: ${role}, используем 'member' по умолчанию`);
  return 'member';
};

// 🎯 МОЩНАЯ ФУНКЦИЯ ПРОВЕРКИ АВТОРИЗАЦИИ с кэшированием
const checkAuthentication = async (request: NextRequest): Promise<AuthResult> => {
  const pathname = request.nextUrl.pathname;

  try {
    // Получаем все возможные токены
    const sessionId = getCookieValue(request, 'session_id');
    const sessionIdDebug = getCookieValue(request, 'session_id_debug');
    const authToken = getCookieValue(request, 'auth_token');
    const userRoleCookie = getCookieValue(request, 'user_role');

    // 🔧 СОЗДАЕМ КЛЮЧ ДЛЯ КЭША
    const cacheKey = `${authToken || 'no-token'}_${sessionId || 'no-session'}_${userRoleCookie || 'no-role'}`;
    
    // 🔧 ПРОВЕРЯЕМ КЭШИ И ОЧИЩАЕМ ИХ
    const now = Date.now();
    const cachedAuth = authCache.get(cacheKey);
    
    if (cachedAuth && (now - cachedAuth.timestamp) < CACHE_TTL) {
      if (isDev) {
        console.log('✅ Cache hit for auth:', cacheKey.substring(0, 20) + '...');
      }
      return cachedAuth.data;
    }

    // 🧹 ОЧИЩАЕМ КЭШИ ПЕРЕД ДОБАВЛЕНИЕМ НОВЫХ ДАННЫХ
    cleanCache(authCache);
    cleanCache(jwtCache);

    // 🔧 ИНИЦИАЛИЗИРУЕМ РЕЗУЛЬТАТ
    let result: AuthResult = {
      authenticated: false,
      userRole: undefined,
      token: undefined
    };

    // Приоритет 1: JWT токен с кэшированием
    if (authToken) {
      // Проверяем кэш JWT
      const cachedJwt = jwtCache.get(authToken);
      
      if (cachedJwt && (now - cachedJwt.timestamp) < CACHE_TTL) {
        if (isDev) {
          console.log('✅ JWT cache hit');
        }
        const payload = cachedJwt.payload;
        const normalizedRole = normalizeUserRole(payload.role as string);
        result = {
          authenticated: true,
          userRole: normalizedRole,
          token: authToken,
          userId: payload.userId as string,
          userEmail: payload.email as string,
          userName: payload.name as string
        };
      } else {
        // Валидируем JWT и кэшируем результат
        try {
          const secret = new TextEncoder().encode(
            process.env.JWT_SECRET || process.env.NEXT_PUBLIC_JWT_SECRET || 'your-secret-key'
          );

          const { payload } = await jwtVerify(authToken, secret);
          if (payload && payload.userId && payload.email && payload.role) {
            // 🔧 КЭШИРУЕМ РЕЗУЛЬТАТ JWT
            jwtCache.set(authToken, {
              payload: payload,
              timestamp: now
            });
            
            const normalizedRole = normalizeUserRole(payload.role as string);
            result = {
              authenticated: true,
              userRole: normalizedRole,
              token: authToken,
              userId: payload.userId as string,
              userEmail: payload.email as string,
              userName: payload.name as string
            };

            console.log('✅ JWT валиден для:', payload.email, 'роль:', normalizedRole);
          }
        } catch (error) {
          if (isDev) {
            console.error('💥 JWT validation error:', error);
          }
        }
      }
    }

    // Приоритет 2: Сессии + роль из cookie
    if (!result.authenticated && (sessionId || sessionIdDebug)) {
      if (userRoleCookie) {
        const normalizedRole = normalizeUserRole(userRoleCookie);
        result = {
          authenticated: true,
          userRole: normalizedRole,
          token: authToken
        };

        console.log('✅ Сессия + роль из cookie:', normalizedRole);
      }
    }

    // Приоритет 3: Только роль из cookie (для совместимости)
    if (!result.authenticated && userRoleCookie && authToken) {
      const normalizedRole = normalizeUserRole(userRoleCookie);
      result = {
        authenticated: true,
        userRole: normalizedRole,
        token: authToken
      };

      console.log('✅ Авторизация по роли из cookie:', normalizedRole);
    }

    // 🔧 КЭШИРУЕМ РЕЗУЛЬТАТ АВТОРИЗАЦИИ
    authCache.set(cacheKey, {
      data: result,
      timestamp: now
    });

    return result;

  } catch (error) {
    if (isDev) {
      console.error('💥 Middleware: ошибка проверки авторизации:', error);
    }
    return { authenticated: false, userRole: undefined, token: undefined };
  }
};

// 🚀 ДИНАМИЧЕСКАЯ ПРОВЕРКА ДОСТУПА К МАРШРУТУ с кэшированием
const checkRouteAccess = (pathname: string, userRole: string): boolean => {
  // 🔧 СОЗДАЕМ КЛЮЧ ДЛЯ КЭША ДОСТУПА
  const accessCacheKey = `${pathname}_${userRole}`;
  const now = Date.now();
  
  // 🔧 ПРОВЕРЯЕМ КЭШИ ДОСТУПА
  const cachedAccess = roleCache.get(accessCacheKey);
  
  if (cachedAccess && (now - cachedAccess.timestamp) < CACHE_TTL) {
    if (isDev) {
      console.log('✅ Route access cache hit:', accessCacheKey);
    }
    return cachedAccess.hasAccess;
  }

  // 🧹 ОЧИЩАЕМ КЭШИ ДОСТУПА
  cleanCache(roleCache);

  // Специальный дебаг для /admin/users
  if (pathname === '/admin/users' || pathname.startsWith('/admin/users/')) {
    console.log('🔍 DEBUG /admin/users:', {
      pathname,
      userRole,
      isValidRole: isValidUserRole(userRole),
      roleLevel: ROLE_CONFIG.hierarchy[userRole as UserRole]
    });
  }

  // Проверяем валидность роли
  if (!isValidUserRole(userRole)) {
    console.log(`❌ Неизвестная роль: ${userRole}`);
    return false;
  }

  let hasAccess = false;

  // СНАЧАЛА проверяем специальные правила для конкретных путей
  if (pathname.startsWith('/admin/')) {
    hasAccess = ['admin', 'super-admin'].includes(userRole);
    if (pathname.startsWith('/admin/users')) {
      console.log('🔍 /admin/users access check:', { userRole, hasAccess });
    }
  } else if (pathname.startsWith('/manager-') && ['manager', 'admin', 'super-admin'].includes(userRole)) {
    hasAccess = true;
  } else if (pathname.startsWith('/trainer-') && ['trainer', 'manager', 'admin', 'super-admin'].includes(userRole)) {
    hasAccess = true;
  } else if (pathname.startsWith('/member-') && ['member', 'client', 'trainer', 'manager', 'admin', 'super-admin'].includes(userRole)) {
    hasAccess = true;
  } else {
    const roleLevel = ROLE_CONFIG.hierarchy[userRole];

    // ПОТОМ проверяем паттерны для роли и всех ролей выше
    for (const [role, level] of Object.entries(ROLE_CONFIG.hierarchy)) {
      if (level <= roleLevel) {
        const typedRole = role as UserRole;
        const patterns = ROLE_CONFIG.routePatterns[typedRole];
        if (patterns) {
          for (const pattern of patterns) {
            if (pattern.test(pathname)) {
              hasAccess = true;
              break;
            }
          }
          if (hasAccess) break;
        }
      }
    }
  }

  // 🔧 КЭШИРУЕМ РЕЗУЛЬТАТ ПРОВЕРКИ ДОСТУПА
  roleCache.set(accessCacheKey, {
    hasAccess: hasAccess,
    timestamp: now
  });

  return hasAccess;
};

// 🔧 ФУНКЦИЯ ОЧИСТКИ ВСЕХ КЭШЕЙ (для использования при необходимости)
const clearAllCaches = () => {
  authCache.clear();
  roleCache.clear();
  jwtCache.clear();
  console.log('🧹 Все кэши очищены');
};

// Best practice solution - using a module-level variable instead of global
let cacheCleanupStarted = false;


// 🔧 ПЕРИОДИЧЕСКАЯ ОЧИСТКА КЭШЕЙ (опционально)
const startCacheCleanupJob = () => {
  if (!cacheCleanupStarted) {
    cacheCleanupStarted = true;
    
    setInterval(() => {
      if (isDev) {
        console.log('🧹 Периодическая очистка кэшей...');
      }
      cleanCache(authCache);
      cleanCache(roleCache);
      cleanCache(jwtCache);
    }, CACHE_TTL);
  }
};

// 🎯 УЛУЧШЕННОЕ ОПРЕДЕЛЕНИЕ ТИПА МАРШРУТА
const getRouteType = (pathname: string, userRole?: string): { type: string; needsAuth: boolean } => {
  let routeType = 'protected';
  let needsAuth = true;

  // 🔧 ГЛАВНАЯ СТРАНИЦА - особая логика
  if (pathname === '/') {
    routeType = userRole && userRole !== 'guest' ? 'home_authenticated' : 'public';
    needsAuth = false;
  }
  // 🔧 ПУБЛИЧНЫЕ МАРШРУТЫ
  else {
    const publicRoutes = new Set([
      '/member-login', '/staff-login', '/register', '/demo', '/setup',
      '/setup-demo-data', '/setup-users', '/create-admin', '/init-super-admin',
      '/unauthorized', '/reset-password', '/forgot-password', '/about',
      '/trainers', '/programs', '/consultation', '/trial-class', '/offline',
      '/test-page', '/test-login', '/test-users', '/debug-auth', '/test-cookies',
      '/create-test-user', '/admin-login', '/clear-cookies', '/make-admin',
      '/create-real-admin', '/debug-dashboard', '/debug-password',
      '/fix-password', '/demo-smart-login', '/test-qr-codes',
      '/password-reset-success', '/mobile-scanner', '/auth/face-auth', '/body-analyze',
    ]);

    if (publicRoutes.has(pathname)) {
      routeType = 'public';
      needsAuth = false;
    }
    // ПУБЛИЧНЫЕ ПРЕФИКСЫ
    else if (pathname.startsWith('/programs/') ||
      pathname.startsWith('/book-')) {
      routeType = 'public';
      needsAuth = false;
    }
    // 🔧 СПЕЦИАЛЬНАЯ ОБРАБОТКА ДЛЯ ПРОФИЛЕЙ ТРЕНЕРОВ
    else if (pathname.startsWith('/trainer/')) {
      routeType = 'trainer_profile';
      needsAuth = true;  // Требует авторизации
    }
    // LOGIN СТРАНИЦЫ
    else if (pathname === '/member-login' || pathname === '/staff-login' || pathname === '/login') {
      routeType = 'login';
      needsAuth = false;
    }
    // ЗАЩИЩЕННЫЕ МАРШРУТЫ
    else {
      needsAuth = true;

      if (pathname.startsWith('/admin')) {
        routeType = 'admin';
      } else if (pathname.startsWith('/manager-')) {
        routeType = 'manager';
      } else if (pathname.startsWith('/trainer-')) {
        routeType = 'trainer';
      } else if (pathname.startsWith('/member-')) {
        routeType = 'member';
      } else if (pathname.startsWith('/shop')) {
        routeType = 'shop';
      } else if (pathname.startsWith('/qr-code')) {
        routeType = 'qr-code';
      } else if (pathname.startsWith('/memberships')) {
        routeType = 'memberships';
      } else {
        routeType = 'protected';
      }
    }
  }

  return { type: routeType, needsAuth };
};

// 🔧 СОЗДАНИЕ ЗАЩИЩЕННОГО RESPONSE с сохранением состояния
const createAuthenticatedResponse = (
  request: NextRequest,
  authResult: AuthResult
): NextResponse => {
  const response = NextResponse.next();

  // Устанавливаем заголовки для авторизованного пользователя
  response.headers.set('X-User-Role', authResult.userRole || '');
  response.headers.set('X-Authenticated', 'true');

  if (authResult.userId) {
    response.headers.set('X-User-Id', authResult.userId);
  }

  // 🔧 ВАЖНО: Обновляем user_role cookie если нужно
  const currentUserRole = getCookieValue(request, 'user_role');
  if (authResult.userRole && currentUserRole !== authResult.userRole) {
    response.cookies.set('user_role', authResult.userRole, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 дней
      path: '/'
    });
  }

  // Усиленные заголовки для Vercel и админских маршрутов
  if (isVercel || request.nextUrl.pathname.startsWith('/admin')) {
    response.headers.set('Cache-Control', 'private, no-store, no-cache, must-revalidate, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('X-Middleware-Cache', 'MISS');
    response.headers.set('Vary', 'Cookie, Authorization');
    response.headers.set('X-Vercel-Cache', 'MISS');
    response.headers.set('CDN-Cache-Control', 'no-store');
  }

  return response;
};

// 📊 УСЛОВНОЕ логирование
const log = (message: string, data?: any) => {
  if (isDev || process.env.DEBUG_MIDDLEWARE === 'true') {
    console.log(message, data || '');
  }
};

export async function middleware(request: NextRequest) {

  const { pathname } = request.nextUrl;

  // 🚨 ПРОВЕРКА БЕЗОПАСНОСТИ (всегда первая)
  const securityBlock = SECURITY_CHECK(request);
  if (securityBlock) return securityBlock;

  if (pathname === '/trainers' || pathname === '/programs') {
    console.log(`⚡ Fast-track public route: ${pathname}`);

    // Проверяем авторизацию для сохранения состояния пользователя
    const authResult = await checkAuthentication(request);

    if (authResult.authenticated) {
      // Для авторизованных пользователей сохраняем их состояние
      return createAuthenticatedResponse(request, authResult);
    }

    // Для неавторизованных просто пропускаем
    const response = NextResponse.next();
    response.headers.set('Cache-Control', 'public, max-age=60, s-maxage=60');
    return response;
  }

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

  // 🔐 ПРОВЕРЯЕМ АВТОРИЗАЦИЮ
  const authResult = await checkAuthentication(request);
  log(`👤 Auth status: ${authResult.authenticated}, Role: ${authResult.userRole || 'none'}`);

  // 🎯 ОПРЕДЕЛЯЕМ тип маршрута
  const { type: routeType, needsAuth } = getRouteType(pathname, authResult.userRole);
  log(`📍 Route type: ${routeType}, Needs auth: ${needsAuth}`);

  // 🔧 ОСОБАЯ ОБРАБОТКА ГЛАВНОЙ СТРАНИЦЫ ДЛЯ АВТОРИЗОВАННЫХ ПОЛЬЗОВАТЕЛЕЙ
  if (pathname === '/' && authResult.authenticated && authResult.userRole) {
    log(`🏠 Authenticated user on home page, preserving auth state`);
    return createAuthenticatedResponse(request, authResult);
  }

  // ✅ ПУБЛИЧНЫЕ маршруты
  if (routeType === 'public' && !needsAuth) {
    log(`✅ Public route allowed`);
    // Даже для публичных маршрутов сохраняем состояние авторизации
    if (authResult.authenticated) {
      return createAuthenticatedResponse(request, authResult);
    }
    return NextResponse.next();
  }

  // 🔄 ПЕРЕНАПРАВЛЕНИЕ с login страниц для авторизованных пользователей
  if ((routeType === 'login' || pathname.includes('login')) && authResult.authenticated && authResult.userRole) {
    // 🔧 ПРОВЕРЯЕМ REDIRECT ПАРАМЕТР
    const redirectParam = request.nextUrl.searchParams.get('redirect');

    let redirectUrl: string;

    if (redirectParam) {
      // Декодируем и валидируем redirect URL
      try {
        const decodedRedirect = decodeURIComponent(redirectParam);
        // Проверяем, что это внутренний путь (начинается с /)
        if (decodedRedirect.startsWith('/') && !decodedRedirect.startsWith('//')) {
          // Проверяем доступ к запрошенному маршруту
          const hasAccess = checkRouteAccess(decodedRedirect, authResult.userRole);
          if (hasAccess) {
            redirectUrl = decodedRedirect;
            log(`↗️ Redirecting to requested page: ${redirectUrl}`);
          } else {
            // Нет доступа к запрошенной странице - идем на дашборд
            redirectUrl = ROLE_CONFIG.dashboards[authResult.userRole as UserRole] || '/';
            log(`↗️ No access to ${decodedRedirect}, redirecting to dashboard: ${redirectUrl}`);
          }
        } else {
          // Неверный формат redirect - идем на дашборд
          redirectUrl = ROLE_CONFIG.dashboards[authResult.userRole as UserRole] || '/';
          log(`↗️ Invalid redirect format, redirecting to dashboard: ${redirectUrl}`);
        }
      } catch (error) {
        // Ошибка декодирования - идем на дашборд
        redirectUrl = ROLE_CONFIG.dashboards[authResult.userRole as UserRole] || '/';
        log(`↗️ Redirect decode error, redirecting to dashboard: ${redirectUrl}`);
      }
    } else {
      // Нет redirect параметра - идем на дашборд
      redirectUrl = ROLE_CONFIG.dashboards[authResult.userRole as UserRole] || '/';
      log(`↗️ No redirect param, redirecting to dashboard: ${redirectUrl}`);
    }

    const response = NextResponse.redirect(new URL(redirectUrl, request.url));
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    response.headers.set('X-Middleware-Cache', 'MISS');
    return response;
  }

  // 🔒 ЗАЩИЩЕННЫЕ маршруты требуют авторизации
  if (needsAuth && !authResult.authenticated) {
    let loginUrl = '/';

    // Определяем правильную страницу входа
    if (pathname.startsWith('/member-') ||
      pathname.startsWith('/my-') ||
      pathname.startsWith('/profile') ||
      pathname.startsWith('/bookings') ||
      pathname.startsWith('/trainer/')) {
      loginUrl = '/member-login';
    } else if (pathname.startsWith('/admin') ||
      pathname.startsWith('/manager-') ||
      pathname.startsWith('/trainer-') ||
      pathname.startsWith('/staff-') ||
      pathname.startsWith('/memberships') ||
      pathname.startsWith('/qr-code') ||
      pathname.startsWith('/shop')) {
      loginUrl = '/staff-login';
    } else {
      loginUrl = '/member-login';
    }

    log(`❌ No auth for protected route, redirecting to ${loginUrl}`);

    // 🔧 ДОБАВЛЯЕМ REDIRECT ПАРАМЕТР
    const redirectUrl = `${loginUrl}?redirect=${encodeURIComponent(pathname)}`;

    const response = NextResponse.redirect(new URL(redirectUrl, request.url));
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    response.headers.set('X-Middleware-Cache', 'MISS');
    return response;
  }

  // 🎯 ПРОВЕРЯЕМ ДОСТУП К КОНКРЕТНЫМ МАРШРУТАМ
  if (authResult.authenticated && authResult.userRole && needsAuth) {
    const hasAccess = checkRouteAccess(pathname, authResult.userRole);

    if (!hasAccess) {
      const dashboardUrl = ROLE_CONFIG.dashboards[authResult.userRole as UserRole] || '/unauthorized';
      log(`❌ Access denied for role ${authResult.userRole} to ${pathname}, redirecting to ${dashboardUrl}`);

      const response = NextResponse.redirect(new URL(dashboardUrl, request.url));
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
      response.headers.set('X-Middleware-Cache', 'MISS');
      response.headers.set('X-Access-Denied', 'true');
      response.headers.set('X-User-Role', authResult.userRole);
      return response;
    }
  }

  log(`✅ Access granted for role ${authResult.userRole}`);

  // Создаем правильный response для авторизованного пользователя
  return authResult.authenticated
    ? createAuthenticatedResponse(request, authResult)
    : NextResponse.next();
}

// 🎯 КОНФИГУРАЦИЯ для Vercel
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};

if (process.env.NODE_ENV === 'production' || process.env.ENABLE_CACHE_CLEANUP === 'true') {
  startCacheCleanupJob();
  clearAllCaches();
}