// app/api/profile/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from "convex/browser";
import { getSession } from '@/lib/simple-auth';

// Инициализация Convex клиента
let convex: ConvexHttpClient;
try {
  if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
    throw new Error('NEXT_PUBLIC_CONVEX_URL is not defined');
  }
  convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);
} catch (error) {
  console.error('❌ Ошибка инициализации Convex:', error);
}

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

// Функция для получения сессии из cookies
async function getSessionFromRequest(request: NextRequest) {
  try {
    const sessionId = request.cookies.get('session_id')?.value || 
                      request.cookies.get('session_id_debug')?.value;
    const authToken = request.cookies.get('auth_token')?.value;
    
    console.log('🔍 Проверка аутентификации:', {
      hasSessionId: !!sessionId,
      hasAuthToken: !!authToken
    });

    // Сначала проверяем session_id через simple-auth
    if (sessionId) {
      const session = getSession(sessionId);
      if (session) {
        console.log('✅ Сессия найдена через simple-auth:', session.user.email);
        return session;
      }
    }

    // Если есть JWT токен, пытаемся его декодировать
    if (authToken) {
      try {
        const { jwtVerify } = await import('jose');
        const secret = new TextEncoder().encode(
          process.env.JWT_SECRET || process.env.NEXT_PUBLIC_JWT_SECRET || 'your-secret-key'
        );
        
        const { payload } = await jwtVerify(authToken, secret);
        
        if (payload && payload.userId && payload.email && payload.role) {
          console.log('✅ JWT токен валиден:', payload.email);
          return {
            user: {
              id: payload.userId as string,
              email: payload.email as string,
              role: payload.role as string,
              name: payload.name as string || payload.email as string,
              avatar: payload.avatar as string || undefined
            }
          };
        }
      } catch (jwtError) {
        console.log('⚠️ JWT validation failed:', jwtError);
      }
    }

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

// GET - Получить профиль текущего пользователя
export async function GET(request: NextRequest) {
  console.log('\n👤 === API /profile GET START ===');
  
  try {
    if (!convex) {
      return createErrorResponse('Convex client not initialized', 500);
    }

    // Получаем сессию
    const session = await getSessionFromRequest(request);
    if (!session || !session.user) {
      return createErrorResponse('Unauthorized', 401);
    }

    console.log('✅ Пользователь авторизован:', session.user.email);

    // Получаем полные данные пользователя из Convex
    let userData;
    try {
      // Пытаемся получить пользователя по email
      userData = await convex.query("users:getUserByEmail", {
        email: session.user.email
      });

      // Если не нашли, пробуем по ID
      if (!userData && session.user.id) {
        userData = await convex.query("users:getUserById", {
          userId: session.user.id
        });
      }
    } catch (convexError) {
      console.error('💥 Ошибка получения пользователя из Convex:', convexError);
      // Возвращаем данные из сессии как fallback
      userData = null;
    }

    // Если данных нет в Convex, используем данные из сессии
    const profileData = userData ? {
      id: userData._id || userData.id || session.user.id,
      email: userData.email || session.user.email,
      name: userData.name || session.user.name,
      role: userData.role || session.user.role,
      avatar: userData.avatar || userData.photoUrl || session.user.avatar,
      phone: userData.phone || null,
      isVerified: userData.isVerified ?? true,
      isActive: userData.isActive ?? true,
      // Дополнительные поля для участников
      ...(session.user.role === 'member' && {
        membershipType: userData.membershipType || 'basic',
        membershipExpiry: userData.membershipExpiry || null,
        totalWorkouts: userData.totalWorkouts || 0,
        lastWorkout: userData.lastWorkout || null
      })
    } : {
      // Fallback на данные из сессии
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      role: session.user.role,
      avatar: session.user.avatar,
      isActive: true
    };

    console.log('✅ Возвращаем профиль пользователя');

    const response = NextResponse.json({
      success: true,
      user: profileData,
      timestamp: new Date().toISOString()
    });

    return addNoCacheHeaders(response);

  } catch (error) {
    return createErrorResponse('Ошибка получения профиля', 500, error);
  }
}

// PUT - Обновить профиль текущего пользователя
export async function PUT(request: NextRequest) {
  console.log('\n✏️ === API /profile PUT START ===');
  
  try {
    if (!convex) {
      return createErrorResponse('Convex client not initialized', 500);
    }

    // Получаем сессию
    const session = await getSessionFromRequest(request);
    if (!session || !session.user) {
      return createErrorResponse('Unauthorized', 401);
    }

    console.log('✅ Пользователь авторизован:', session.user.email);

    // Получаем данные для обновления
    let updates;
    try {
      const body = await request.json();
      updates = body.updates || body;
    } catch (parseError) {
      return createErrorResponse('Неверный формат JSON', 400, parseError);
    }

    // Валидация обновляемых полей
    const allowedFields = ['name', 'phone', 'avatar', 'avatarUrl', 'bio', 'birthDate', 'location'];
    const updateFields: any = {};

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        updateFields[field] = updates[field];
      }
    }

    // Обработка avatarUrl -> avatar
    if (updateFields.avatarUrl && !updateFields.avatar) {
      updateFields.avatar = updateFields.avatarUrl;
      delete updateFields.avatarUrl;
    }

    if (Object.keys(updateFields).length === 0) {
      return createErrorResponse('Нет полей для обновления', 400);
    }

    console.log('📝 Обновляем поля:', Object.keys(updateFields));

    // Обновляем через Convex
    try {
      await convex.mutation("users:updateProfile", {
        userId: session.user.id,
        email: session.user.email, // Fallback на email если нет ID
        updates: {
          ...updateFields,
          updatedAt: Date.now()
        }
      });

      console.log('✅ Профиль обновлен в Convex');
    } catch (convexError) {
      console.error('💥 Ошибка обновления в Convex:', convexError);
      
      // Если ошибка связана с отсутствием пользователя в Convex,
      // обновляем только сессию (для super-admin из simple-auth)
      if (session.user.role === 'super-admin') {
        console.log('🔄 Обновляем данные super-admin в сессии');
        // Здесь можно добавить логику обновления сессии
      } else {
        throw convexError;
      }
    }

    const response = NextResponse.json({
      success: true,
      message: 'Профиль успешно обновлен',
      updates: updateFields,
      timestamp: new Date().toISOString()
    });

    return addNoCacheHeaders(response);

  } catch (error) {
    return createErrorResponse('Ошибка обновления профиля', 500, error);
  }
}

// POST - Специальные действия профиля (смена пароля, загрузка аватара и т.д.)
export async function POST(request: NextRequest) {
  console.log('\n🔧 === API /profile POST START ===');
  
  try {
    if (!convex) {
      return createErrorResponse('Convex client not initialized', 500);
    }

    // Получаем сессию
    const session = await getSessionFromRequest(request);
    if (!session || !session.user) {
      return createErrorResponse('Unauthorized', 401);
    }

    // Получаем действие и данные
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      return createErrorResponse('Неверный формат JSON', 400, parseError);
    }

    const { action, ...data } = body;

    if (!action) {
      return createErrorResponse('Действие не указано', 400);
    }

    console.log('🎯 Действие:', action);

    switch (action) {
      case 'change-password': {
        const { currentPassword, newPassword } = data;
        
        if (!currentPassword || !newPassword) {
          return createErrorResponse('Текущий и новый пароль обязательны', 400);
        }

        if (newPassword.length < 6) {
          return createErrorResponse('Новый пароль должен быть не менее 6 символов', 400);
        }

        // Меняем пароль через Convex
        const result = await convex.mutation("users:changePassword", {
          userId: session.user.id,
          email: session.user.email,
          currentPassword,
          newPassword
        });

        if (!result.success) {
          return createErrorResponse(result.error || 'Неверный текущий пароль', 400);
        }

        const response = NextResponse.json({
          success: true,
          message: 'Пароль успешно изменен'
        });

        return addNoCacheHeaders(response);
      }

      case 'verify-email': {
        // Отправка письма для верификации
        await convex.mutation("users:sendVerificationEmail", {
          userId: session.user.id,
          email: session.user.email
        });

        const response = NextResponse.json({
          success: true,
          message: 'Письмо для подтверждения отправлено'
        });

        return addNoCacheHeaders(response);
      }

      case 'update-preferences': {
        const { preferences } = data;
        
        if (!preferences || typeof preferences !== 'object') {
          return createErrorResponse('Настройки должны быть объектом', 400);
        }

        // Обновляем настройки через Convex
        await convex.mutation("users:updatePreferences", {
          userId: session.user.id,
          preferences: {
            ...preferences,
            updatedAt: Date.now()
          }
        });

        const response = NextResponse.json({
          success: true,
          message: 'Настройки обновлены',
          preferences
        });

        return addNoCacheHeaders(response);
      }

      default:
        return createErrorResponse(`Неизвестное действие: ${action}`, 400);
    }

  } catch (error) {
    return createErrorResponse('Ошибка выполнения действия', 500, error);
  }
}

// DELETE - Удалить аккаунт (soft delete)
export async function DELETE(request: NextRequest) {
  console.log('\n🗑️ === API /profile DELETE START ===');
  
  try {
    if (!convex) {
      return createErrorResponse('Convex client not initialized', 500);
    }

    // Получаем сессию
    const session = await getSessionFromRequest(request);
    if (!session || !session.user) {
      return createErrorResponse('Unauthorized', 401);
    }

    console.log('⚠️ Запрос на удаление аккаунта:', session.user.email);

    // Получаем подтверждение
    const { searchParams } = new URL(request.url);
    const confirm = searchParams.get('confirm');
    
    if (confirm !== 'true') {
      return createErrorResponse('Требуется подтверждение удаления', 400, {
        hint: 'Добавьте ?confirm=true к запросу'
      });
    }

    // Soft delete через Convex
    await convex.mutation("users:deactivateAccount", {
      userId: session.user.id,
      email: session.user.email,
      reason: 'User requested deletion'
    });

    console.log('✅ Аккаунт деактивирован');

    // Очищаем куки
    const response = NextResponse.json({
      success: true,
      message: 'Аккаунт успешно деактивирован'
    });

    // Удаляем куки авторизации
    response.cookies.delete('session_id');
    response.cookies.delete('session_id_debug');
    response.cookies.delete('auth_token');

    return addNoCacheHeaders(response);

  } catch (error) {
    return createErrorResponse('Ошибка удаления аккаунта', 500, error);
  }
}