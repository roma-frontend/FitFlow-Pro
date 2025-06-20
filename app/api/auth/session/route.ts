import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/simple-auth';

export async function GET(request: NextRequest) {
  console.log('🔍 API: проверка сессии');
  
  try {
    const sessionId = request.cookies.get('session_id')?.value || 
                     request.cookies.get('session_id_debug')?.value;

    console.log('📝 Session ID из cookies:', sessionId);

    if (!sessionId) {
      console.log('❌ Нет session ID в cookies');
      return NextResponse.json({ 
        success: false, 
        error: 'Нет сессии' 
      });
    }

    const session = getSession(sessionId);
    console.log('👤 Данные сессии:', session ? 'найдена' : 'не найдена');

    if (!session) {
      console.log('❌ Сессия недействительна или истекла');
      return NextResponse.json({ 
        success: false, 
        error: 'Сессия недействительна' 
      });
    }

    console.log('✅ Сессия действительна для пользователя:', session.user.name);
    return NextResponse.json({ 
      success: true, 
      user: session.user 
    });

  } catch (error) {
    console.error('💥 Ошибка проверки сессии:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Ошибка проверки сессии' 
    }, { status: 500 });
  }
}
