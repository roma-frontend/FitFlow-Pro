import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/simple-auth';

export async function GET(request: NextRequest) {
  console.log('🔍 API: проверка сессии');
  
  try {
    const sessionId = request.cookies.get('session_id')?.value || 
                     request.cookies.get('session_id_debug')?.value ||
                     request.cookies.get('auth_token')?.value;

    console.log('📝 Session ID из cookies:', sessionId ? 'найден' : 'отсутствует');

    if (!sessionId) {
      console.log('❌ Нет session ID в cookies');
      return NextResponse.json({ 
        success: false, 
        error: 'Нет сессии' 
      });
    }

    // ✅ ИСПРАВЛЕНИЕ: Используем await для асинхронной функции getSession
    const session = await getSession(sessionId);
    console.log('👤 Данные сессии:', session ? 'найдена' : 'не найдена');

    if (!session) {
      console.log('❌ Сессия недействительна или истекла');
      return NextResponse.json({ 
        success: false, 
        error: 'Сессия недействительна' 
      });
    }

    console.log('✅ Сессия действительна для пользователя:', session.user.name);
    console.log('📋 Роль пользователя:', session.user.role);
    console.log('📧 Email пользователя:', session.user.email);
    
    return NextResponse.json({ 
      success: true, 
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: session.user.role,
        avatar: session.user.avatar,
        avatarUrl: session.user.avatarUrl,
        isVerified: session.user.isVerified,
        rating: session.user.rating
      },
      session: {
        id: session.id,
        createdAt: session.createdAt,
        expiresAt: session.expiresAt,
        lastAccessed: session.lastAccessed
      }
    });

  } catch (error) {
    console.error('💥 Ошибка проверки сессии:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Ошибка проверки сессии',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    }, { status: 500 });
  }
}