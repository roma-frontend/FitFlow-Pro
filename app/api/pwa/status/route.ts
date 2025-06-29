// app/api/pwa/status/route.ts - API для PWA статуса
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const userAgent = request.headers.get('user-agent') || '';
    const isStandalone = request.headers.get('display-mode') === 'standalone';
    
    // Определяем тип устройства
    const isMobile = /Mobile|Android|iPhone|iPad|Windows Phone/i.test(userAgent);
    const isTablet = /iPad|Android.*Tablet/i.test(userAgent);
    
    // Проверяем поддержку PWA функций
    const supportsPWA = {
      serviceWorker: true, // Предполагаем поддержку в современных браузерах
      notifications: !userAgent.includes('Safari') || userAgent.includes('Chrome'),
      installPrompt: userAgent.includes('Chrome') || userAgent.includes('Edge'),
      offline: true
    };

    return NextResponse.json({
      success: true,
      data: {
        isStandalone,
        isMobile,
        isTablet,
        userAgent,
        supports: supportsPWA,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to get PWA status'
    }, { status: 500 });
  }
}
