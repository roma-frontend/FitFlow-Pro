// app/api/admin/users/route.ts - ПОЛНОСТЬЮ ИСПРАВЛЕННАЯ ВЕРСИЯ

import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from "convex/browser";
import { getSession, debugSessionAccess } from '@/lib/simple-auth';
import { canManageRole } from '@/lib/permissions';

// Инициализация Convex клиента
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Функция валидации URL
function isValidUrl(url: string | null | undefined): boolean {
  // Пустое значение валидно
  if (!url || url.trim() === '') {
    return true;
  }

  const trimmedUrl = url.trim();

  try {
    // Проверяем абсолютные URL
    const urlObj = new URL(trimmedUrl);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    // Проверяем относительные пути и data URLs
    return trimmedUrl.startsWith('/') || 
           trimmedUrl.startsWith('./') || 
           trimmedUrl.startsWith('../') ||
           trimmedUrl.startsWith('data:image/') ||
           trimmedUrl.startsWith('blob:');
  }
}

// Функция санитизации данных
function sanitizeUserData(data: any): any {
  const sanitized = { ...data };

  // Очистка строковых полей
  ['name', 'email', 'phone', 'bio', 'notes', 'emergencyContact', 'medicalInfo'].forEach(field => {
    if (sanitized[field] && typeof sanitized[field] === 'string') {
      sanitized[field] = sanitized[field].trim();
    }
  });

  // Очистка URL полей с правильной обработкой пустых значений
  ['photoUrl', 'avatar', 'avatarUrl'].forEach(field => {
    if (sanitized[field] !== undefined) {
      if (typeof sanitized[field] === 'string') {
        sanitized[field] = sanitized[field].trim();
        // Преобразуем пустую строку в null
        if (sanitized[field] === '') {
          sanitized[field] = null;
        }
      } else if (sanitized[field] === '') {
        sanitized[field] = null;
      }
    }
  });

  // Очистка email
  if (sanitized.email) {
    sanitized.email = sanitized.email.toLowerCase();
  }

  // Очистка массивов
  ['specialization', 'certifications', 'goals'].forEach(field => {
    if (Array.isArray(sanitized[field])) {
      sanitized[field] = sanitized[field]
        .filter((item: any) => typeof item === 'string' && item.trim())
        .map((item: string) => item.trim());
    }
  });

  return sanitized;
}

// Функция валидации данных пользователя
function validateUserCreationData(
  data: any,
  creatorRole: string | undefined
): {
  isValid: boolean;
  errors: Array<{ field: string; message: string }>;
} {
  const errors: Array<{ field: string; message: string }> = [];

  // Базовая валидация (только для создания нового пользователя)
  if (data.name !== undefined && (!data.name || typeof data.name !== 'string' || data.name.trim().length < 2)) {
    errors.push({ field: 'name', message: 'Имя должно содержать минимум 2 символа' });
  }

  if (data.email !== undefined && (!data.email || typeof data.email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))) {
    errors.push({ field: 'email', message: 'Некорректный email адрес' });
  }

  // Валидация photoUrl - исправлено для правильной обработки пустых значений
  if (data.photoUrl !== undefined && data.photoUrl !== null && data.photoUrl !== '' && !isValidUrl(data.photoUrl)) {
    errors.push({ field: 'photoUrl', message: 'Неверный URL фото' });
  }

  // Валидация avatar - исправлено для правильной обработки пустых значений
  if (data.avatar !== undefined && data.avatar !== null && data.avatar !== '' && !isValidUrl(data.avatar)) {
    errors.push({ field: 'avatar', message: 'Неверный URL аватара' });
  }

  // Валидация avatarUrl - исправлено для правильной обработки пустых значений
  if (data.avatarUrl !== undefined && data.avatarUrl !== null && data.avatarUrl !== '' && !isValidUrl(data.avatarUrl)) {
    errors.push({ field: 'avatarUrl', message: 'Неверный URL аватара' });
  }

  // Валидация телефона если указан
  if (data.phone && typeof data.phone === 'string' && data.phone.trim() !== '' && !/^\+?[\d\s\-()]{10,}$/.test(data.phone)) {
    errors.push({ field: 'phone', message: 'Некорректный формат телефона' });
  }

  // Валидация роли
  if (data.role !== undefined) {
    const validRoles = ['user', 'admin', 'manager', 'super-admin', 'trainer', 'client', 'member'];
    if (!validRoles.includes(data.role)) {
      errors.push({ field: 'role', message: `Недопустимая роль. Разрешены: ${validRoles.join(', ')}` });
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Функция нормализации пользователя
function normalizeUser(user: any, type: 'trainer' | 'client' | 'user') {
  const baseUser = {
    id: user._id || user.id,
    name: user.name || user.email || 'Unknown User',
    email: user.email || 'unknown@example.com',
    phone: user.phone || '',
    status: user.status || (user.isActive !== false ? 'active' : 'inactive'),
    createdAt: user.createdAt ? new Date(user.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: user.updatedAt ? new Date(user.updatedAt).toISOString() : new Date().toISOString(),
    type
  };

  if (type === 'trainer') {
    return {
      ...baseUser,
      role: user.role || 'trainer',
      specialization: user.specialization || [],
      experience: user.experience || 0,
      rating: user.rating || 0,
      activeClients: user.activeClients || 0,
      totalSessions: user.totalSessions || 0,
      hourlyRate: user.hourlyRate || 1500,
      certifications: user.certifications || [],
      workingHours: user.workingHours || {},
      bio: user.bio || '',
      avatar: user.avatar || user.photoUrl || '',
      createdBy: user.createdBy
    };
  } else if (type === 'client') {
    return {
      ...baseUser,
      trainerId: user.trainerId,
      membershipType: user.membershipType || 'basic',
      joinDate: user.joinDate || baseUser.createdAt.split('T')[0],
      totalSessions: user.totalSessions || 0,
      notes: user.notes || '',
      emergencyContact: user.emergencyContact || '',
      medicalInfo: user.medicalInfo || '',
      goals: user.goals || [],
      createdBy: user.createdBy
    };
  } else {
    return {
      ...baseUser,
      role: user.role || 'user',
      isVerified: user.isVerified || false,
      lastLogin: user.lastLogin ? new Date(user.lastLogin).toISOString() : null,
      photoUrl: user.photoUrl || user.avatar || ''
    };
  }
}

// Middleware для проверки прав управления пользователями
function withUserManagement(handler: (req: any) => Promise<NextResponse>) {
  return async (req: NextRequest) => {
    const session = await getSessionFromRequest(req);
    if (!session || !['super-admin', 'admin', 'manager'].includes(session.user.role)) {
      return createErrorResponse('Недостаточно прав', 403);
    }
    return handler({ ...req, user: session.user });
  };
}

// Middleware для проверки прав создания пользователей
function withUserCreation(handler: (req: any) => Promise<NextResponse>) {
  return async (req: NextRequest) => {
    const session = await getSessionFromRequest(req);
    if (!session || !['super-admin', 'admin'].includes(session.user.role)) {
      return createErrorResponse('Недостаточно прав для создания пользователей', 403);
    }
    return handler({ ...req, user: session.user });
  };
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
  response.headers.set('Access-Control-Allow-Origin', 
    process.env.NODE_ENV === 'production' 
      ? process.env.ALLOWED_ORIGIN || '*'
      : '*'
  );
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');
  response.headers.set('Surrogate-Control', 'no-store');
  response.headers.set('Vercel-CDN-Cache-Control', 'no-store');
  
  // CORS заголовки
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  return response;
}

// Функция для получения сессии с использованием simple-auth
async function getSessionFromRequest(request: NextRequest) {
  try {
    // Получаем JWT токен из куки
    const sessionId = request.cookies.get('session_id')?.value;
    const authToken = request.cookies.get('auth_token')?.value;
    const sessionIdDebug = request.cookies.get('session_id_debug')?.value;
    
    // Используем первый доступный токен
    const jwtToken = sessionId || authToken || sessionIdDebug;
    
    console.log('🔍 Проверка аутентификации:', {
      hasSessionId: !!sessionId,
      hasAuthToken: !!authToken,
      hasSessionIdDebug: !!sessionIdDebug,
      tokenPreview: jwtToken?.substring(0, 20) + '...' || 'none'
    });

    if (!jwtToken) {
      console.log('❌ JWT токен не найден в куки');
      return null;
    }

    // Используем getSession из simple-auth для проверки JWT
    const session = await getSession(jwtToken);
    
    if (!session) {
      console.log('❌ JWT токен недействителен или истек');
      
      // Дополнительная отладка в development
      if (process.env.NODE_ENV === 'development') {
        await debugSessionAccess(jwtToken);
      }
      
      return null;
    }

    console.log('✅ JWT токен валиден, пользователь:', {
      id: session.user.id,
      email: session.user.email,
      role: session.user.role,
      name: session.user.name
    });

    return {
      user: {
        id: session.user.id,
        email: session.user.email,
        role: session.user.role,
        name: session.user.name
      }
    };

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

    // Проверяем права доступа
    if (!['super-admin', 'admin', 'manager'].includes(session.user.role)) {
      return createErrorResponse('Недостаточно прав', 403);
    }

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
export const POST = async (req: NextRequest): Promise<NextResponse> => {
  return withUserCreation(async (req: any) => {
    try {
      console.log('➕ API: создание нового пользователя в Convex');
      
      if (!convex) {
        return createErrorResponse('Convex client not initialized', 500);
      }

      const body = await req.json();
      const { user } = req;

      // Валидация обязательных полей
      if (!body.name || !body.email) {
        return createErrorResponse('Отсутствуют обязательные поля (name, email)', 400);
      }

      // Санитизация данных перед валидацией
      const sanitizedData = sanitizeUserData(body);
      console.log('🧹 Санитизированные данные:', { ...sanitizedData, password: '***' });

      // Валидация данных
      const validation = validateUserCreationData(sanitizedData, user.role);
      if (!validation.isValid) {
        console.log('❌ Ошибки валидации:', validation.errors);
        return createErrorResponse('Ошибка валидации', 400, validation.errors);
      }

      // Проверка уникальности email через Convex
      try {
        const existingUser = await convex.query("users:getUserByEmail", { 
          email: sanitizedData.email 
        });
        if (existingUser) {
          return createErrorResponse('Пользователь с таким email уже существует', 409);
        }
      } catch (emailCheckError) {
        console.warn('⚠️ Ошибка проверки email:', emailCheckError);
      }

      // Определяем тип пользователя на основе роли
      const userType = sanitizedData.role === 'trainer' ? 'trainer' : 'user';

      // Создание пользователя
      let newUserId: string;
      let userData: any;

      if (userType === 'trainer') {
        // Проверка прав на создание роли
        if (!canManageRole(user.role, sanitizedData.role)) {
          return createErrorResponse(`Недостаточно прав для создания роли ${sanitizedData.role}`, 403);
        }

        userData = {
          name: sanitizedData.name,
          email: sanitizedData.email,
          role: sanitizedData.role || 'trainer',
          status: 'active',
          phone: sanitizedData.phone || '',
          specialization: sanitizedData.specializations || [],
          experience: sanitizedData.experience || 0,
          rating: 0,
          activeClients: 0,
          totalSessions: 0,
          hourlyRate: sanitizedData.hourlyRate || 1500,
          certifications: sanitizedData.certifications || [],
          workingHours: {},
          bio: sanitizedData.bio || '',
          avatar: sanitizedData.photoUrl || null,
          createdAt: Date.now(),
          createdBy: user.id
        };

        newUserId = await convex.mutation("users:createTrainer", userData);

      } else {
        // Создание обычного пользователя
        userData = {
          name: sanitizedData.name,
          email: sanitizedData.email,
          role: sanitizedData.role || 'user',
          phone: sanitizedData.phone || '',
          isActive: sanitizedData.isActive ?? true,
          photoUrl: sanitizedData.photoUrl || null,
          createdAt: Date.now(),
          createdBy: user.id
        };

        // Если указан пароль, добавляем его
        if (sanitizedData.password) {
          userData.password = sanitizedData.password;
        }

        newUserId = await convex.mutation("users:create", userData);
      }

      console.log(`✅ API: ${userType} создан с ID: ${newUserId}`);

      const responseData = normalizeUser({ ...userData, _id: newUserId }, userType);

      return NextResponse.json({
        success: true,
        data: responseData,
        message: `${userType === 'trainer' ? 'Тренер' : 'Пользователь'} успешно создан`
      }, { status: 201 });

    } catch (error) {
      console.error('💥 API: ошибка создания пользователя:', error);
      const isUserExists = error instanceof Error && error.message.includes('already exists');
      return createErrorResponse(
        isUserExists ? 'Пользователь с таким email уже существует' : 'Ошибка создания пользователя',
        isUserExists ? 409 : 500,
        error
      );
    }
  })(req);
};

// PUT - Обновить пользователя
export const PUT = async (req: NextRequest): Promise<NextResponse> => {
  return withUserManagement(async (req: any) => {
    try {
      console.log('📝 API: обновление пользователя в Convex');
      
      if (!convex) {
        return createErrorResponse('Convex client not initialized', 500);
      }

      const body = await req.json();
      const { user } = req;
      const { id, type, ...updateData } = body;

      if (!id) {
        return createErrorResponse('ID пользователя обязателен', 400);
      }

      console.log('📋 Данные для обновления:', { id, type, updateData });

      // Санитизация входных данных
      const sanitizedData = sanitizeUserData(updateData);
      console.log('🧹 Очищенные данные:', sanitizedData);

      // Валидация данных
      const validation = validateUserCreationData(sanitizedData, user.role);
      if (!validation.isValid) {
        console.log('❌ Ошибки валидации:', validation.errors);
        return createErrorResponse('Ошибка валидации', 400, validation.errors);
      }

      // Получаем текущие данные пользователя
      let currentUser: any;
      try {
        currentUser = await convex.query("users:getUserById", { id });
        if (!currentUser) {
          return createErrorResponse('Пользователь не найден', 404);
        }
      } catch (fetchError) {
        console.error('💥 Ошибка получения пользователя:', fetchError);
        return createErrorResponse('Ошибка получения данных пользователя', 500, fetchError);
      }

      // Проверка прав доступа
      if (user.role === 'manager' && ['super-admin', 'admin'].includes(currentUser.role)) {
        return createErrorResponse('Недостаточно прав для редактирования этого пользователя', 403);
      }

      // Проверка изменения роли
      if (sanitizedData.role && sanitizedData.role !== currentUser.role) {
        if (!canManageRole(user.role, sanitizedData.role)) {
          return createErrorResponse(`Недостаточно прав для назначения роли ${sanitizedData.role}`, 403);
        }
      }

      // Проверка уникальности email
      if (sanitizedData.email && sanitizedData.email !== currentUser.email) {
        try {
          const existingUser = await convex.query("users:getUserByEmail", { 
            email: sanitizedData.email 
          });
          if (existingUser && existingUser._id !== id) {
            return createErrorResponse('Пользователь с таким email уже существует', 409);
          }
        } catch (emailCheckError) {
          console.warn('⚠️ Ошибка проверки email:', emailCheckError);
        }
      }

      // Подготавливаем данные для обновления
      const normalizedUpdateData = {
        ...sanitizedData,
        updatedAt: Date.now(),
        updatedBy: user.id
      };

      // Выполняем обновление
      let updatedUser: any;
      try {
        await convex.mutation("users:updateUser", { 
          id, 
          updates: normalizedUpdateData 
        });
        
        updatedUser = await convex.query("users:getUserById", { id });

      } catch (updateError) {
        console.error('💥 Ошибка обновления в Convex:', updateError);
        return createErrorResponse('Ошибка обновления пользователя', 500, updateError);
      }

      console.log(`✅ API: пользователь обновлен - ${updatedUser.name}`);

      const responseData = normalizeUser(updatedUser, 'user');

      return NextResponse.json({
        success: true,
        data: responseData,
        message: 'Пользователь успешно обновлен'
      });

    } catch (error) {
      console.error('💥 API: ошибка обновления пользователя:', error);
      return createErrorResponse('Ошибка обновления пользователя', 500, error);
    }
  })(req);
};

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

    // Получаем данные пользователя
    const user = await convex.query("users:getUserById", { 
      id: userId
    });

    if (!user) {
      return createErrorResponse('Пользователь не найден', 404);
    }

    // Проверка бизнес-логики
    if (user.role === 'super-admin') {
      return createErrorResponse('Нельзя удалить супер-админа', 403);
    }

    // Проверяем, что пользователь не удаляет сам себя
    if (userId === session.user.id) {
      return createErrorResponse('Нельзя удалить собственный аккаунт', 403);
    }

    // Удаляем пользователя через Convex
    const result = await convex.mutation("users:deleteUser", {
      id: userId
    });

    console.log('✅ Пользователь удален');

    const response = NextResponse.json({
      success: true,
      message: 'Пользователь удален успешно',
      deletedUser: result
    });

    return addNoCacheHeaders(response);

  } catch (error) {
    return createErrorResponse('Ошибка удаления пользователя', 500, error);
  }
}