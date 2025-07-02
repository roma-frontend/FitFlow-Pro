// app/api/auth/check/route.ts - ИСПРАВЛЕННАЯ ВЕРСИЯ
import { NextRequest, NextResponse } from 'next/server';
import { getSession, debugSessionAccess } from '@/lib/simple-auth';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Define UserRole type (add this if it doesn't exist in your types)
type UserRole = 'member' | 'client' | 'admin' | 'super-admin' | 'manager' | 'trainer' | 'staff';

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
    role: UserRole;
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
  token?: string;
}

// Type guard to validate UserRole
function isValidUserRole(role: string): role is UserRole {
  const validRoles: UserRole[] = ['member', 'client', 'admin', 'super-admin', 'manager', 'trainer', 'staff'];
  return validRoles.includes(role as UserRole);
}

// Function to normalize role to valid UserRole
function normalizeRole(role: string | undefined): UserRole {
  if (!role) return 'member';
  
  const normalizedRole = role.replace(/_/g, '-').toLowerCase();
  
  if (isValidUserRole(normalizedRole)) {
    return normalizedRole;
  }
  
  // Fallback mapping for edge cases
  switch (normalizedRole) {
    case 'superadmin':
    case 'super_admin':
      return 'super-admin';
    case 'user':
      return 'member';
    default:
      return 'member';
  }
}

function normalizeUser(user: any, source: 'nextauth' | 'jwt') {
  return {
    id: user.id || '',
    role: normalizeRole(user.role),
    email: user.email || null,
    name: user.name || null,
    avatar: source === 'nextauth' ? (user.image || user.avatar || null) : (user.avatar || null),
    avatarUrl: source === 'nextauth' ? (user.image || user.avatarUrl || null) : (user.avatarUrl || null),
    isVerified: user.isVerified || false,
    rating: user.rating || 0
  };
}

function getDashboardForRole(role: UserRole): string {
  switch (role) {
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

const checkRouteAccess = (pathname: string, userRole: UserRole): boolean => {
  if (pathname.startsWith('/trainer/')) return true;
  if (pathname.startsWith('/admin/')) return ['admin', 'super-admin'].includes(userRole);
  if (pathname.startsWith('/manager-')) return ['manager', 'admin', 'super-admin'].includes(userRole);
  if (pathname.startsWith('/trainer-')) return ['trainer', 'manager', 'admin', 'super-admin'].includes(userRole);
  if (pathname.startsWith('/member-') || pathname.startsWith('/my-') || pathname.startsWith('/profile') || pathname.startsWith('/bookings')) {
    return ['member', 'client', 'trainer', 'manager', 'admin', 'super-admin'].includes(userRole);
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
        role: (nextAuthSession.user as ExtendedUser).role,
        name: nextAuthSession.user.name
      });

      const user = nextAuthSession.user as ExtendedUser;
      const normalizedUser = normalizeUser(user, 'nextauth');
      const redirectUrl = calculateRedirectUrl(redirectParam, normalizedUser.role);

      // Создаем JWT токен для совместимости с вашей системой
      const { createSession } = await import('@/lib/simple-auth');
      const jwtToken = await createSession({
        id: user.id,
        email: user.email || '',
        role: user.role || 'member',
        name: user.name || '',
        avatar: user.image || user.avatar,
        avatarUrl: user.image || user.avatarUrl,
        isVerified: true,
        rating: user.rating || 0,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // Устанавливаем JWT токен в cookies для совместимости
      const response = NextResponse.json<AuthResponse>({
        authenticated: true,
        user: normalizedUser,
        dashboardUrl: redirectUrl,
        redirectUrl: redirectUrl,
        system: 'next-auth',
        timestamp: new Date().toISOString(),
        token: jwtToken // Добавляем токен в ответ
      });

      // Устанавливаем JWT cookies для совместимости с вашей системой
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax' as const,
        maxAge: 7 * 24 * 60 * 60,
        path: '/'
      };

      response.cookies.set('session_id', jwtToken, cookieOptions);
      response.cookies.set('auth_token', jwtToken, cookieOptions);
      response.cookies.set('user_role', normalizedUser.role, {
        ...cookieOptions,
        httpOnly: false
      });

      return response;
    }

    console.log('❌ NextAuth сессия не найдена, проверяем JWT...');

    // СТРАТЕГИЯ 2: Проверяем JWT токены (ваша существующая логика)
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
      timestamp: new Date().toISOString(),
      token: jwtToken // Добавляем токен в ответ
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
function calculateRedirectUrl(redirectParam: string | null, userRole: UserRole): string {
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
  
  // Также удаляем NextAuth cookies
  response.cookies.delete('next-auth.session-token');
  response.cookies.delete('__Secure-next-auth.session-token');
  response.cookies.delete('next-auth.callback-url');
  response.cookies.delete('__Secure-next-auth.callback-url');
}