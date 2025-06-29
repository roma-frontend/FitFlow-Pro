// app/api/auth/check/route.ts - ИСПРАВЛЕННАЯ ВЕРСИЯ ДЛЯ JWT с redirect поддержкой
import { NextRequest, NextResponse } from 'next/server';
import { getSession, debugSessionAccess } from '@/lib/simple-auth';

const getDashboardForRole = (role: string): string => {
  // Нормализуем роль
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
};

// 🔧 ФУНКЦИЯ ПРОВЕРКИ ДОСТУПА К МАРШРУТУ
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

export async function GET(request: NextRequest) {
  try {
    console.log('\n🔍 === API AUTH/CHECK START ===');
    console.log('🔍 API auth/check: начинаем проверку JWT токенов');
    console.log('🔍 API auth/check: NODE_ENV:', process.env.NODE_ENV);
    console.log('🔍 API auth/check: VERCEL:', process.env.VERCEL);
    
    // Получаем URL параметры для redirect
    const url = new URL(request.url);
    const redirectParam = url.searchParams.get('redirect');
    
    console.log('🔍 API auth/check: redirect параметр:', redirectParam);
    console.log('🔍 API auth/check: все cookies:', request.cookies.getAll().map(c => ({ 
      name: c.name, 
      hasValue: !!c.value,
      valueLength: c.value?.length || 0,
      valuePreview: c.value?.substring(0, 20) + '...' || 'empty'
    })));
    
    // Получаем JWT токен из куки
    const sessionId = request.cookies.get('session_id')?.value;
    const authToken = request.cookies.get('auth_token')?.value;
    const sessionIdDebug = request.cookies.get('session_id_debug')?.value;
    
    // Используем первый доступный токен
    const jwtToken = sessionId || authToken || sessionIdDebug;
    
    console.log('🔍 API auth/check: session_id найден:', !!sessionId);
    console.log('🔍 API auth/check: auth_token найден:', !!authToken);
    console.log('🔍 API auth/check: session_id_debug найден:', !!sessionIdDebug);
    console.log('🔍 API auth/check: используем JWT токен:', jwtToken?.substring(0, 20) + '...' || 'none');

    if (!jwtToken) {
      console.log('❌ API auth/check: JWT токен не найден');
      const response = NextResponse.json({ 
        authenticated: false,
        user: null,
        debug: 'No JWT token found in cookies',
        system: 'jwt',
        cookiesFound: request.cookies.getAll().map(c => ({ 
          name: c.name, 
          hasValue: !!c.value,
          length: c.value?.length || 0
        })),
        timestamp: new Date().toISOString(),
        redirectUrl: null
      });

      console.log('❌ === API AUTH/CHECK END - NO TOKEN ===\n');
      return response;
    }

    // Проверяем JWT токен через getSession из simple-auth
    console.log('🔍 API auth/check: проверяем JWT токен через getSession...');
    
    try {
      // Используем асинхронную функцию getSession
      const session = await getSession(jwtToken);
      
      if (!session) {
        // Дополнительная отладка
        if (process.env.NODE_ENV === 'development') {
          await debugSessionAccess(jwtToken);
        }
        
        console.log('❌ API auth/check: JWT токен недействителен или истек');
        
        const response = NextResponse.json({ 
          authenticated: false,
          user: null,
          debug: 'JWT token invalid or expired',
          system: 'jwt',
          timestamp: new Date().toISOString(),
          redirectUrl: null
        });
        
        // Удаляем недействительные куки
        response.cookies.delete('session_id');
        response.cookies.delete('auth_token');
        response.cookies.delete('session_id_debug');
        response.cookies.delete('user_role');
        
        console.log('❌ === API AUTH/CHECK END - TOKEN INVALID ===\n');
        return response;
      }

      console.log('✅ API auth/check: JWT токен валиден, пользователь:', {
        id: session.user.id,
        email: session.user.email,
        role: session.user.role,
        name: session.user.name
      });
      
      // 🔧 ОБРАБОТКА REDIRECT ПАРАМЕТРА
      let finalRedirectUrl: string;
      
      if (redirectParam) {
        try {
          const decodedRedirect = decodeURIComponent(redirectParam);
          console.log('🔍 API auth/check: обрабатываем redirect:', decodedRedirect);
          
          // Проверяем, что это внутренний путь
          if (decodedRedirect.startsWith('/') && !decodedRedirect.startsWith('//')) {
            // Проверяем доступ к запрошенному маршруту
            const hasAccess = checkRouteAccess(decodedRedirect, session.user.role);
            
            if (hasAccess) {
              finalRedirectUrl = decodedRedirect;
              console.log('✅ API auth/check: доступ к redirect маршруту разрешен:', finalRedirectUrl);
            } else {
              finalRedirectUrl = getDashboardForRole(session.user.role);
              console.log('❌ API auth/check: нет доступа к redirect маршруту, используем дашборд:', finalRedirectUrl);
            }
          } else {
            finalRedirectUrl = getDashboardForRole(session.user.role);
            console.log('❌ API auth/check: неверный формат redirect, используем дашборд:', finalRedirectUrl);
          }
        } catch (error) {
          finalRedirectUrl = getDashboardForRole(session.user.role);
          console.log('❌ API auth/check: ошибка декодирования redirect, используем дашборд:', finalRedirectUrl);
        }
      } else {
        finalRedirectUrl = getDashboardForRole(session.user.role);
        console.log('🔍 API auth/check: нет redirect параметра, используем дашборд:', finalRedirectUrl);
      }

      const response = NextResponse.json({
        authenticated: true,
        user: {
          id: session.user.id,
          role: session.user.role,
          email: session.user.email,
          name: session.user.name,
          avatar: session.user.avatar,
          avatarUrl: session.user.avatarUrl,
          isVerified: session.user.isVerified,
          rating: session.user.rating
        },
        dashboardUrl: finalRedirectUrl,  // Используем обработанный URL
        redirectUrl: finalRedirectUrl,   // Добавляем явное поле для redirect
        debug: `JWT session valid for ${session.user.email}`,
        system: 'jwt',
        sessionCreated: session.createdAt,
        sessionExpires: session.expiresAt,
        lastAccessed: session.lastAccessed,
        usedCookie: sessionId ? 'session_id' : (authToken ? 'auth_token' : 'session_id_debug'),
        timestamp: new Date().toISOString(),
        requestedRedirect: redirectParam,  // Сохраняем исходный запрос
        finalRedirect: finalRedirectUrl    // И финальный результат
      });

      console.log('✅ === API AUTH/CHECK END - SUCCESS ===\n');
      return response;

    } catch (error) {
      console.error('💥 API auth/check: ошибка при проверке JWT:', error);
      
      const response = NextResponse.json({ 
        authenticated: false,
        user: null,
        debug: `JWT verification error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        system: 'jwt',
        timestamp: new Date().toISOString(),
        stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined,
        redirectUrl: null
      });
      
      // Удаляем недействительные куки
      response.cookies.delete('session_id');
      response.cookies.delete('auth_token');
      response.cookies.delete('session_id_debug');
      response.cookies.delete('user_role');
      
      console.log('💥 === API AUTH/CHECK END - ERROR ===\n');
      return response;
    }

  } catch (error) {
    console.error('💥 API auth/check: критическая ошибка:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    const response = NextResponse.json({ 
      authenticated: false,
      user: null,
      debug: `Critical error: ${errorMessage}`,
      system: 'error',
      timestamp: new Date().toISOString(),
      stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined,
      redirectUrl: null
    });

    console.log('💥 === API AUTH/CHECK END - CRITICAL ERROR ===\n');
    return response;
  }
}