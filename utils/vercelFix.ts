import { NextRequest, NextResponse } from "next/server";

// utils/vercelFix.ts
export class VercelStabilityUtils {
  // 🔧 УСТОЙЧИВОЕ ЧТЕНИЕ COOKIES С ДВУМЯ МЕТОДАМИ
  static getCookieValue(request: NextRequest, name: string): string | undefined {
    try {
      // Метод 1: Стандартное чтение
      const cookie = request.cookies.get(name)?.value;
      if (cookie) return cookie;

      // Метод 2: Из заголовков (fallback для Edge Runtime)
      const cookieHeader = request.headers.get('cookie');
      if (cookieHeader) {
        const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
          const [key, value] = cookie.trim().split('=');
          if (key && value) {
            try {
              acc[key] = decodeURIComponent(value);
            } catch {
              acc[key] = value;
            }
          }
          return acc;
        }, {} as Record<string, string>);

        return cookies[name];
      }

      return undefined;
    } catch (error) {
      console.error(`Error reading cookie ${name}:`, error);
      return undefined;
    }
  }

  // 🚨 ЗАЩИТА ОТ PREFETCH ПРОБЛЕМ
  static isPrefetchRequest(request: NextRequest): boolean {
    const purpose = request.headers.get('purpose');
    const prefetch = request.headers.get('next-router-prefetch');
    const userAgent = request.headers.get('user-agent');
    
    return !!(
      purpose === 'prefetch' || 
      prefetch || 
      userAgent?.includes('prefetch')
    );
  }

  // ⏰ УВЕЛИЧЕННОЕ ВРЕМЯ КЭШИРОВАНИЯ ДЛЯ VERCEL
  static readonly CACHE_TTL = 5 * 60 * 1000; // 5 минут вместо 1

  // 🔒 ДОПОЛНИТЕЛЬНЫЕ ЗАГОЛОВКИ ДЛЯ УСТОЙЧИВОСТИ
  static addStabilityHeaders(response: NextResponse): NextResponse {
    response.headers.set('X-Middleware-Cache', 'MISS');
    response.headers.set('Vary', 'Cookie, Authorization');
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    
    if (process.env.NODE_ENV === 'production') {
      response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }
    
    return response;
  }
}
