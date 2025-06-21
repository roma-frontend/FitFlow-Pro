// app/api/admin/users/route.ts - Исправленная версия для Next.js 15

import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from "convex/browser";
import { cookies } from 'next/headers';

// Инициализация Convex клиента
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Функция для создания стандартного error response
function createErrorResponse(message: string, status: number = 500, details?: any) {
  console.error(`❌ API Error (${status}):`, message, details);
  
  const response = NextResponse.json({
    success: false,
    error: message,
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === 'development' && details && { details })
  }, { status });

  return addNoCacheHeaders(response);
}

// Функция для добавления заголовков против кэширования
function addNoCacheHeaders(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', 
    process.env.NODE_ENV === 'production' 
      ? 'https://yourdomain.com' 
      : '*'
  );
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');
  response.headers.set('Surrogate-Control', 'no-store');
  response.headers.set('Vercel-CDN-Cache-Control', 'no-store');
  
  // CORS заголовки
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  return response;
}

// Улучшенная функция для получения сессии
async function getSessionFromRequest(request: NextRequest) {
  try {
    // В Next.js 15 cookies() возвращает Promise
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('session_id')?.value;
    const sessionIdDebug = cookieStore.get('session_id_debug')?.value;
    const authToken = cookieStore.get('auth_token')?.value;
    
    console.log('🔍 Проверка аутентификации:', {
      hasSessionId: !!sessionId,
      hasSessionIdDebug: !!sessionIdDebug,
      hasAuthToken: !!authToken,
      headers: Object.fromEntries(request.headers.entries())
    });

    // Проверяем Authorization header
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      console.log('📋 Найден Bearer token в заголовке');
      
      try {
        // Пытаемся получить пользователя из Convex по токену
        const userByToken = await convex.query("users:getUserBySessionToken", { 
          token 
        }).catch(() => null);
        
        if (userByToken) {
          return {
            user: {
              id: userByToken._id,
              email: userByToken.email,
              role: userByToken.role,
              name: userByToken.name
            }
          };
        }
      } catch (error) {
        console.log('⚠️ Ошибка проверки Bearer token:', error);
      }
    }

    // Проверяем JWT токен
    if (authToken) {
      try {
        const { jwtVerify } = await import('jose');
        const secret = new TextEncoder().encode(
          process.env.JWT_SECRET || 'your-secret-key'
        );
        
        const { payload } = await jwtVerify(authToken, secret);
        
        if (payload && payload.userId && payload.email && payload.role) {
          console.log('✅ JWT токен валиден:', payload.role);
          return {
            user: {
              id: payload.userId as string,
              email: payload.email as string,
              role: payload.role as string,
              name: payload.name as string || payload.email as string
            }
          };
        }
      } catch (jwtError) {
        console.log('⚠️ JWT validation failed:', jwtError);
      }
    }

    // Проверяем сессию в Convex
    if (sessionId || sessionIdDebug) {
      const activeSessionId = sessionId || sessionIdDebug;
      console.log('🔄 Проверяем сессию в Convex:', activeSessionId);
      
      try {
        // Получаем пользователя по session ID из Convex
        const userBySession = await convex.query("users:getUserBySessionId", { 
          sessionId: activeSessionId 
        }).catch(() => null);
        
        if (userBySession) {
          console.log('✅ Пользователь найден по сессии');
          return {
            user: {
              id: userBySession._id,
              email: userBySession.email,
              role: userBySession.role,
              name: userBySession.name
            }
          };
        }
      } catch (error) {
        console.log('⚠️ Ошибка проверки сессии в Convex:', error);
      }
    }

    // Для production environment - проверяем альтернативные методы
    if (process.env.NODE_ENV === 'production') {
      // Проверяем X-User-Data header (может быть установлен middleware)
      const userDataHeader = request.headers.get('x-user-data');
      if (userDataHeader) {
        try {
          const userData = JSON.parse(decodeURIComponent(userDataHeader));
          if (userData && userData.id && userData.email && userData.role) {
            console.log('✅ Пользователь из X-User-Data header');
            return { user: userData };
          }
        } catch (error) {
          console.log('⚠️ Ошибка парсинга X-User-Data:', error);
        }
      }

      // В production для демо/тестирования можно временно вернуть тестового пользователя
      // ВАЖНО: Убрать в реальном production!
      if (process.env.ALLOW_DEMO_AUTH === 'true') {
        console.log('⚠️ Используется DEMO режим аутентификации');
        return {
          user: {
            id: 'demo-admin-id',
            email: 'admin@demo.com',
            role: 'admin',
            name: 'Demo Admin'
          }
        };
      }
    }

    console.log('❌ Не удалось аутентифицировать пользователя');
    return null;
  } catch (error) {
    console.error('💥 Ошибка получения сессии:', error);
    return null;
  }
}

// OPTIONS для CORS
export async function OPTIONS(request: NextRequest) {
  console.log('🔄 OPTIONS request received');
  const response = new NextResponse(null, { status: 200 });
  return addNoCacheHeaders(response);
}

// GET - Получить всех пользователей
export async function GET(request: NextRequest) {
  console.log('\n🔍 === API /admin/users GET START ===');
  
  try {
    // Проверяем инициализацию Convex
    if (!convex) {
      return createErrorResponse('Convex client not initialized', 500);
    }

    // Получаем сессию из request
    const session = await getSessionFromRequest(request);
    if (!session || !session.user) {
      return createErrorResponse('Unauthorized', 401);
    }

    console.log('✅ Пользователь авторизован:', session.user.role);

    const { searchParams } = new URL(request.url);
    const roleFilter = searchParams.get('role');
    
    console.log('📋 Параметры запроса:', { roleFilter });

    // Получаем данные из Convex с обработкой ошибок
    let usersFromConvex = [];
    let trainersFromConvex = [];

    try {
      [usersFromConvex, trainersFromConvex] = await Promise.all([
        convex.query("users:getAll").catch(err => {
          console.warn('⚠️ Ошибка получения пользователей:', err);
          return [];
        }),
        convex.query("users:getTrainers").catch(err => {
          console.warn('⚠️ Ошибка получения тренеров:', err);
          return [];
        })
      ]);
    } catch (convexError) {
      console.error('💥 Ошибка Convex:', convexError);
      return createErrorResponse('Database connection error', 503, convexError);
    }
    
    console.log('📋 Данные получены:', {
      users: usersFromConvex.length,
      trainers: trainersFromConvex.length
    });
    
    // Объединяем пользователей с безопасной обработкой
    const allUsers = [
      ...usersFromConvex.map((user: any) => ({
        id: user._id || user.id || 'unknown',
        email: user.email || 'unknown@example.com',
        role: user.role || 'user',
        name: user.name || user.email || 'Unknown User',
        createdAt: user.createdAt ? new Date(user.createdAt).toISOString() : new Date().toISOString(),
        isActive: user.isActive ?? true,
        photoUrl: user.photoUrl || null,
        lastLogin: user.lastLogin ? new Date(user.lastLogin).toISOString() : null,
        source: 'users' as const
      })),
      ...trainersFromConvex
        .filter((trainer: any) => trainer && trainer.source === 'trainers')
        .map((trainer: any) => ({
          id: trainer.id || 'unknown',
          email: trainer.email || 'unknown@example.com',
          role: trainer.role || 'trainer',
          name: trainer.name || trainer.email || 'Unknown Trainer',
          createdAt: new Date().toISOString(),
          isActive: true,
          photoUrl: trainer.photoUri || null,
          lastLogin: null,
          source: 'trainers' as const
        }))
    ];
    
    // Фильтруем по роли пользователя
    let filteredUsers = allUsers;
    
    if (session.user.role === 'admin') {
      filteredUsers = allUsers.filter((user: any) => 
        !['super-admin'].includes(user.role)
      );
    } else if (session.user.role === 'manager') {
      filteredUsers = allUsers.filter((user: any) => 
        !['super-admin', 'admin'].includes(user.role)
      );
    }

    // Дополнительная фильтрация
    if (roleFilter === 'trainers') {
      filteredUsers = filteredUsers.filter((user: any) => 
        ['trainer', 'admin', 'super-admin'].includes(user.role)
      );
    }

    const safeUsers = filteredUsers.map((user: any) => {
      const { source, ...userWithoutSource } = user;
      return userWithoutSource;
    });

    console.log('✅ Возвращаем пользователей:', safeUsers.length);

    const response = NextResponse.json({
      success: true,
      users: safeUsers,
      canCreate: ['super-admin', 'admin'].includes(session.user.role),
      userRole: session.user.role,
      meta: {
        total: safeUsers.length,
        filtered: filteredUsers.length,
        roleFilter,
        timestamp: new Date().toISOString()
      },
      trainers: roleFilter === 'trainers' ? safeUsers : undefined
    });

    return addNoCacheHeaders(response);

  } catch (error) {
    return createErrorResponse('Ошибка получения пользователей', 500, error);
  }
}

// POST - Создать пользователя
export async function POST(request: NextRequest) {
  console.log('\n🚀 === API /admin/users POST START ===');
  
  try {
    if (!convex) {
      return createErrorResponse('Convex client not initialized', 500);
    }

    const session = await getSessionFromRequest(request);
    if (!session || !['super-admin', 'admin'].includes(session.user.role)) {
      return createErrorResponse('Недостаточно прав', 403);
    }

    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      return createErrorResponse('Неверный формат JSON', 400, parseError);
    }

    const { email, password, role, name, isActive, photoUrl } = body;

    // Валидация
    if (!email || !password || !role || !name) {
      return createErrorResponse('Обязательные поля не заполнены', 400, {
        required: ['email', 'password', 'role', 'name'],
        received: { email: !!email, password: !!password, role: !!role, name: !!name }
      });
    }

    // Создаем пользователя через Convex
    const newUserId = await convex.mutation("users:create", {
      email,
      password,
      name,
      role,
      isActive: isActive !== undefined ? isActive : true,
      createdAt: Date.now(),
      createdBy: session.user.email,
      photoUrl: photoUrl || undefined
    });

    console.log('✅ Пользователь создан с ID:', newUserId);

    const response = NextResponse.json({
      success: true,
      message: 'Пользователь создан успешно',
      user: {
        id: newUserId,
        email,
        role,
        name,
        createdAt: new Date().toISOString(),
        isActive: isActive !== undefined ? isActive : true,
        photoUrl: photoUrl || null
      }
    }, { status: 201 });

    return addNoCacheHeaders(response);

  } catch (error) {
    const isUserExists = error instanceof Error && error.message.includes('already exists');
    return createErrorResponse(
      isUserExists ? 'Пользователь с таким email уже существует' : 'Ошибка создания пользователя',
      isUserExists ? 409 : 500,
      error
    );
  }
}

// PUT - Обновить пользователя
export async function PUT(request: NextRequest) {
  console.log('\n🔄 === API /admin/users PUT START ===');
  
  try {
    if (!convex) {
      return createErrorResponse('Convex client not initialized', 500);
    }

    const session = await getSessionFromRequest(request);
    if (!session || !['super-admin', 'admin', 'manager'].includes(session.user.role)) {
      return createErrorResponse('Недостаточно прав', 403);
    }

    // Получаем ID из тела запроса
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      return createErrorResponse('Неверный формат JSON', 400, parseError);
    }

    const { id: userId, updates } = body;

    // Проверяем ID из тела запроса
    if (!userId) {
      return createErrorResponse('ID пользователя обязателен в теле запроса', 400, {
        expected: 'Ожидается поле "id" в JSON теле запроса',
        received: body
      });
    }

    console.log('📍 ID пользователя для обновления:', userId);

    // Валидируем updates
    if (!updates || typeof updates !== 'object') {
      return createErrorResponse('Поле "updates" обязательно', 400, {
        expected: 'Ожидается поле "updates" с объектом изменений',
        received: { updates }
      });
    }

    // Обновляем пользователя через Convex
    await convex.mutation("users:updateUserOrTrainer", {
      userId,
      updates: {
        ...updates,
        updatedAt: Date.now(),
        updatedBy: session.user.email
      }
    });

    console.log('✅ Пользователь обновлен');

    const response = NextResponse.json({
      success: true,
      message: 'Пользователь обновлен успешно',
      user: {
        id: userId,
        ...updates,
        updatedAt: new Date().toISOString()
      }
    });

    return addNoCacheHeaders(response);

  } catch (error) {
    return createErrorResponse('Ошибка обновления пользователя', 500, error);
  }
}

// DELETE - Удалить пользователя
export async function DELETE(request: NextRequest) {
  console.log('\n🗑️ === API /admin/users DELETE START ===');
  
  try {
    if (!convex) {
      return createErrorResponse('Convex client not initialized', 500);
    }

    const session = await getSessionFromRequest(request);
    if (!session || !['super-admin', 'admin'].includes(session.user.role)) {
      return createErrorResponse('Недостаточно прав', 403);
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');
    
    if (!userId) {
      return createErrorResponse('ID пользователя обязателен', 400);
    }

    // Проверяем, что пользователь не удаляет сам себя
    if (userId === session.user.id) {
      return createErrorResponse('Нельзя удалить собственный аккаунт', 400);
    }

    // Удаляем пользователя через Convex
    const result = await convex.mutation("users:deleteUser", {
      userId
    });

    console.log('✅ Пользователь удален');

    const response = NextResponse.json({
      success: true,
      message: 'Пользователь удален успешно',
      deletedUser: result.deletedUser
    });

    return addNoCacheHeaders(response);

  } catch (error) {
    return createErrorResponse('Ошибка удаления пользователя', 500, error);
  }
}