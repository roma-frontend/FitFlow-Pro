// app/api/auth/check/route.ts - ИСПРАВЛЕННАЯ ВЕРСИЯ с правильной логикой
import { NextRequest, NextResponse } from 'next/server';
import { getSession, debugSessionAccess } from '@/lib/simple-auth';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Типы для совместимости
interface ExtendedUser {
  id: string;
  role?: string;
  email?: string | null;
  name?: string | null;
  image?: string | null;
  avatar?: string | null;
  avatarUrl?: string | null;
  isVerified?: boolean;
  rating?: number;
}

interface AuthResponse {
  authenticated: boolean;
  user: {
    id: string;
    role: string;
    email: string | null | undefined;
    name: string | null | undefined;
    avatar: string | null | undefined;
    avatarUrl: string | null | undefined;
    isVerified: boolean;
    rating: number;
  } | null;
  dashboardUrl?: string;
  redirectUrl?: string;
  system: 'next-auth' | 'jwt' | 'error';
  timestamp: string;
  sessionCreated?: string;
  sessionExpires?: string;
  usedCookie?: string;
  debug?: string;
  error?: string;
}

// Функция для нормализации пользователя из разных источников
function normalizeUser(user: any, source: 'nextauth' | 'jwt') {
  return {
    id: user.id || '',
    role: user.role || 'member',
    email: user.email || null,
    name: user.name || null,
    avatar: source === 'nextauth' ? (user.image || user.avatar || null) : (user.avatar || null),
    avatarUrl: source === 'nextauth' ? (user.image || user.avatarUrl || null) : (user.avatarUrl || null),
    isVerified: user.isVerified || false,
    rating: user.rating || 0
  };
}

// Функция для определения дашборда по роли
function getDashboardForRole(role: string): string {
  const normalizedRole = role.replace(/_/g, '-').toLowerCase();
  
  switch (normalizedRole) {
    case 'member':
    case 'client':
      return '/member-dashboard';
    case 'admin':
    case 'super-admin':
      return '/admin';
    case 'manager':
      return '/manager-dashboard';
    case 'trainer':
      return '/trainer-dashboard';
    default:
      return '/staff-dashboard';
  }
}

const checkRouteAccess = (pathname: string, userRole: string): boolean => {
  const normalizedRole = userRole.toLowerCase().replace(/_/g, '-');
  
  if (pathname.startsWith('/trainer/')) return true;
  if (pathname.startsWith('/admin/')) return ['admin', 'super-admin'].includes(normalizedRole);
  if (pathname.startsWith('/manager-')) return ['manager', 'admin', 'super-admin'].includes(normalizedRole);
  if (pathname.startsWith('/trainer-')) return ['trainer', 'manager', 'admin', 'super-admin'].includes(normalizedRole);
  if (pathname.startsWith('/member-') || pathname.startsWith('/my-') || pathname.startsWith('/profile') || pathname.startsWith('/bookings')) {
    return ['member', 'client', 'trainer', 'manager', 'admin', 'super-admin'].includes(normalizedRole);
  }
  if (pathname.startsWith('/shop')) return true;
  
  return true;
};

export async function GET(request: NextRequest) {
  try {
    console.log('\n🔍 === API AUTH/CHECK START ===');
    
    const url = new URL(request.url);
    const redirectParam = url.searchParams.get('redirect');
    
    console.log('🔍 Redirect параметр:', redirectParam);
    console.log('🔍 Cookies:', request.cookies.getAll().map(c => ({ 
      name: c.name, 
      hasValue: !!c.value 
    })));

    // СТРАТЕГИЯ 1: Проверяем NextAuth сессию
    console.log('🔍 Проверяем NextAuth сессию...');
    const nextAuthSession = await getServerSession(authOptions);

    if (nextAuthSession?.user) {
      console.log('✅ NextAuth сессия найдена:', {
        email: nextAuthSession.user.email,
        role: (nextAuthSession.user as ExtendedUser).role
      });

      const user = nextAuthSession.user as ExtendedUser;
      const normalizedUser = normalizeUser(user, 'nextauth');
      const redirectUrl = calculateRedirectUrl(redirectParam, normalizedUser.role);

      return NextResponse.json<AuthResponse>({
        authenticated: true,
        user: normalizedUser,
        dashboardUrl: redirectUrl,
        redirectUrl: redirectUrl,
        system: 'next-auth',
        timestamp: new Date().toISOString()
      });
    }

    console.log('❌ NextAuth сессия не найдена, проверяем JWT...');

    // СТРАТЕГИЯ 2: Проверяем JWT токены
    const sessionId = request.cookies.get('session_id')?.value;
    const authToken = request.cookies.get('auth_token')?.value;
    const sessionIdDebug = request.cookies.get('session_id_debug')?.value;
    
    const jwtToken = sessionId || authToken || sessionIdDebug;
    
    console.log('🔍 JWT токены:', {
      session_id: !!sessionId,
      auth_token: !!authToken,
      session_id_debug: !!sessionIdDebug,
      using: jwtToken?.substring(0, 20) + '...' || 'none'
    });

    if (!jwtToken) {
      console.log('❌ Ни NextAuth, ни JWT токены не найдены');
      return createUnauthenticatedResponse('No authentication found');
    }

    // Проверяем JWT токен
    console.log('🔍 Проверяем JWT токен...');
    const jwtSession = await getSession(jwtToken);
    
    if (!jwtSession) {
      console.log('❌ JWT токен недействителен');
      
      if (process.env.NODE_ENV === 'development') {
        await debugSessionAccess(jwtToken);
      }
      
      const response = createUnauthenticatedResponse('JWT token invalid or expired');
      clearAuthCookies(response);
      return response;
    }

    console.log('✅ JWT токен валиден:', {
      email: jwtSession.user.email,
      role: jwtSession.user.role
    });

    const normalizedUser = normalizeUser(jwtSession.user, 'jwt');
    const redirectUrl = calculateRedirectUrl(redirectParam, normalizedUser.role);

    return NextResponse.json<AuthResponse>({
      authenticated: true,
      user: normalizedUser,
      dashboardUrl: redirectUrl,
      redirectUrl: redirectUrl,
      system: 'jwt',
      sessionCreated: jwtSession.createdAt?.toString() || new Date().toISOString(),
      sessionExpires: jwtSession.expiresAt?.toString() || new Date().toISOString(),
      usedCookie: sessionId ? 'session_id' : (authToken ? 'auth_token' : 'session_id_debug'),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('💥 Критическая ошибка в auth/check:', error);
    return NextResponse.json<AuthResponse>({ 
      authenticated: false,
      user: null,
      error: 'Internal server error',
      system: 'error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// Вспомогательные функции
function calculateRedirectUrl(redirectParam: string | null, userRole: string): string {
  if (redirectParam) {
    try {
      const decodedRedirect = decodeURIComponent(redirectParam);
      
      if (decodedRedirect.startsWith('/') && !decodedRedirect.startsWith('//')) {
        const hasAccess = checkRouteAccess(decodedRedirect, userRole);
        
        if (hasAccess) {
          console.log('✅ Доступ к redirect разрешен:', decodedRedirect);
          return decodedRedirect;
        } else {
          console.log('❌ Нет доступа к redirect, используем дашборд');
        }
      }
    } catch (error) {
      console.log('❌ Ошибка обработки redirect:', error);
    }
  }
  
  return getDashboardForRole(userRole);
}

function createUnauthenticatedResponse(debug: string): NextResponse<AuthResponse> {
  return NextResponse.json<AuthResponse>({ 
    authenticated: false,
    user: null,
    debug: debug,
    system: 'error',
    timestamp: new Date().toISOString()
  });
}

function clearAuthCookies(response: NextResponse): void {
  response.cookies.delete('session_id');
  response.cookies.delete('auth_token');
  response.cookies.delete('session_id_debug');
  response.cookies.delete('user_role');
}