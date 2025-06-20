// app/api/auth/login/route.ts - ИСПРАВЛЕННАЯ версия с JWT токеном
import { NextRequest, NextResponse } from 'next/server';
import { validatePassword } from '@/lib/users-db';
import { createSession, getSession } from '@/lib/simple-auth';
import { createToken } from '@/lib/jwt-auth'; // Импортируем функцию создания токена

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({
        success: false,
        error: 'Email и пароль обязательны'
      }, { status: 400 });
    }

    console.log(`🔐 Попытка входа: ${email}`);

    // Проверяем пользователя в базе данных
    const user = await validatePassword(email, password);
    
    if (!user) {
      console.log(`❌ Неверные данные для входа: ${email}`);
      return NextResponse.json({
        success: false,
        error: 'Неверный email или пароль'
      }, { status: 401 });
    }

    if (!user.isActive) {
      console.log(`❌ Пользователь неактивен: ${email}`);
      return NextResponse.json({
        success: false,
        error: 'Аккаунт деактивирован'
      }, { status: 401 });
    }

    // Создаем сессию
    console.log('🔧 Создаем сессию для пользователя:', {
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.name
    });

    const sessionId = createSession({
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.name
    });

    console.log(`✅ Сессия создана с ID: ${sessionId.substring(0, 20)}...`);

    // 🔧 СОЗДАЕМ JWT ТОКЕН
    let token: string;
    try {
      token = createToken({
        userId: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      });
      console.log(`🎫 JWT токен создан для ${user.email}`);
    } catch (tokenError) {
      console.error('❌ Ошибка создания JWT токена:', tokenError);
      // Даже если токен не создался, продолжаем с сессией
      token = '';
    }

    // Проверяем, что сессия действительно сохранилась
    const testSession = getSession(sessionId);
    console.log('🧪 Тестовая проверка созданной сессии:', testSession ? 'найдена' : 'НЕ НАЙДЕНА');

    console.log(`✅ Успешный вход: ${user.email} (${user.role})`);

    const response = NextResponse.json({
      success: true,
      message: 'Авторизация успешна',
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.name
      },
      // 🔧 ДОБАВЛЯЕМ ТОКЕН В ОТВЕТ
      token: token || undefined
    });

    // Устанавливаем cookies для сессии
    response.cookies.set('session_id', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 дней
      path: '/'
    });

    response.cookies.set('session_id_debug', sessionId, {
      maxAge: 7 * 24 * 60 * 60, // 7 дней для отладки
      path: '/'
    });

    // 🔧 ДОБАВЛЯЕМ COOKIE ДЛЯ JWT ТОКЕНА
    if (token) {
      response.cookies.set('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60, // 7 дней
        path: '/'
      });
      console.log('🍪 JWT токен установлен в куки');
    }

    console.log('🍪 Все куки установлены в ответе');

    return response;

  } catch (error) {
    console.error('❌ КРИТИЧЕСКАЯ ошибка авторизации:', error);
    console.error('❌ Стек ошибки:', error instanceof Error ? error.stack : 'Нет стека');
    return NextResponse.json({
      success: false,
      error: 'Внутренняя ошибка сервера'
    }, { status: 500 });
  }
}