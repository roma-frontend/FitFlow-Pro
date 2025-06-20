// app/api/auth/me/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/simple-auth';

export async function GET(request: NextRequest) {
  console.log('🔍 GET /api/auth/me - НАЧАЛО проверки авторизации');
  
  try {
    // 🔧 ПРОБЛЕМА 1: На Vercel cookies могут иметь другие настройки
    const allCookies = request.cookies.getAll();
    console.log('🍪 Все куки в запросе:', allCookies.map(c => ({ name: c.name, hasValue: !!c.value })));
    
    // 🔧 ПРОВЕРЯЕМ разные варианты названий cookies
    let sessionId = request.cookies.get('session_id')?.value;
    
    // Если нет session_id, проверяем другие варианты
    if (!sessionId) {
      sessionId = request.cookies.get('sessionId')?.value;
    }
    if (!sessionId) {
      sessionId = request.cookies.get('session')?.value;
    }
    
    // 🔧 ТАКЖЕ проверяем Authorization header для JWT
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    console.log('🔑 Session ID:', sessionId ? `найден: ${sessionId.substring(0, 20)}...` : 'отсутствует');
    console.log('🎫 JWT Token:', token ? `найден: ${token.substring(0, 20)}...` : 'отсутствует');
    
    if (!sessionId && !token) {
      console.log('❌ Ни Session ID, ни токен не найдены - возвращаем 401');
      return NextResponse.json({ 
        success: false, 
        error: 'Не авторизован',
        debug: {
          hasSessionCookie: false,
          hasAuthHeader: false,
          cookieNames: allCookies.map(c => c.name)
        }
      }, { status: 401 });
    }

    // 🔧 Если есть токен, проверяем его
    if (token && !sessionId) {
      try {
        // Импортируем verify функцию если она есть
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        
        console.log('🎫 JWT декодирован:', decoded);
        
        return NextResponse.json({
          success: true,
          user: {
            id: decoded.userId || decoded.id,
            name: decoded.name,
            email: decoded.email,
            role: decoded.role
          }
        });
      } catch (jwtError) {
        console.error('❌ Ошибка JWT:', jwtError);
      }
    }

    // 🔧 Проверяем сессию если есть sessionId
    if (sessionId) {
      console.log('🔧 Вызываем getSession...');
      
      let sessionData;
      try {
        sessionData = getSession(sessionId);
        console.log('📋 Результат getSession:', sessionData ? 'найдена' : 'не найдена');
      } catch (sessionError) {
        console.error('❌ Ошибка в getSession:', sessionError);
        
        // 🔧 ВАЖНО: На Vercel может не быть доступа к файловой системе
        // Если используется файловое хранилище сессий, оно не будет работать
        return NextResponse.json({ 
          success: false, 
          error: 'Ошибка получения сессии',
          debug: {
            errorMessage: sessionError instanceof Error ? sessionError.message : 'Unknown',
            isVercel: !!process.env.VERCEL,
            nodeEnv: process.env.NODE_ENV
          }
        }, { status: 500 });
      }
      
      if (!sessionData) {
        console.log('❌ Сессия не найдена или истекла');
        return NextResponse.json({ 
          success: false, 
          error: 'Сессия истекла' 
        }, { status: 401 });
      }

      // Проверяем структуру данных сессии
      if (!sessionData.user) {
        console.error('❌ В сессии отсутствуют данные пользователя');
        return NextResponse.json({ 
          success: false, 
          error: 'Некорректная сессия' 
        }, { status: 500 });
      }

      console.log('✅ Сессия валидна для:', sessionData.user.name);
      
      return NextResponse.json({
        success: true,
        user: {
          id: sessionData.user.id,
          name: sessionData.user.name,
          email: sessionData.user.email,
          role: sessionData.user.role
        }
      });
    }
    
  } catch (error) {
    console.error('❌ КРИТИЧЕСКАЯ ошибка в /api/auth/me:', error);
    console.error('❌ Стек ошибки:', error instanceof Error ? error.stack : 'Нет стека');
    
    // 🔧 Более подробная информация об ошибке для отладки
    return NextResponse.json({ 
      success: false, 
      error: 'Внутренняя ошибка сервера',
      debug: {
        message: error instanceof Error ? error.message : 'Unknown',
        type: error instanceof Error ? error.constructor.name : 'Unknown',
        isVercel: !!process.env.VERCEL,
        nodeEnv: process.env.NODE_ENV
      }
    }, { status: 500 });
  }
}