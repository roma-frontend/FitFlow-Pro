// lib/api-middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/simple-auth';
import { hasPermission, canAccessObject, UserRole, Resource, Action } from '@/lib/permissions';
import { User } from '@/lib/simple-auth';

export interface AuthenticatedRequest extends NextRequest {
  user: User;
}

export interface RouteContext {
  params: Record<string, string>;
}

export interface PermissionConfig {
  resource: Resource;
  action: Action;
  requireOwnership?: boolean;
  getOwnerId?: (req: NextRequest) => Promise<string | undefined>;
}

export interface ValidationSchema<T = any> {
  validate: (data: any) => { isValid: boolean; errors: string[]; data?: T };
}

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  keyGenerator?: (req: AuthenticatedRequest) => string;
}

export interface CacheConfig {
  ttl: number; // время жизни кэша в секундах
  key: (req: AuthenticatedRequest) => string;
}

// Хранилище для rate limiting
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Хранилище для кэша
const cacheStore = new Map<string, { data: any; expiry: number }>();

// Middleware для проверки авторизации
export const withAuth = (
  handler: (req: AuthenticatedRequest, context?: { params: any }) => Promise<NextResponse>
) => {
  return async (req: NextRequest, context?: { params: any }): Promise<NextResponse> => {
    try {
      console.log(`🔐 API Middleware: проверка авторизации для ${req.method} ${req.nextUrl.pathname}`);

      // Получаем session ID из cookies
      const sessionId = req.cookies.get('session_id')?.value ||
        req.cookies.get('session_id_debug')?.value;

      if (!sessionId) {
        console.log('❌ API Middleware: session ID не найден');
        return NextResponse.json(
          { success: false, error: 'Не авторизован' },
          { status: 401 }
        );
      }

      // Проверяем сессию
      const session = getSession(sessionId);
      if (!session) {
        console.log('❌ API Middleware: сессия недействительна');
        return NextResponse.json(
          { success: false, error: 'Сессия недействительна' },
          { status: 401 }
        );
      }

      console.log(`✅ API Middleware: пользователь авторизован - ${session.user.email} (${session.user.role})`);

      // Добавляем пользователя в запрос
      const authenticatedReq = req as AuthenticatedRequest;
      authenticatedReq.user = session.user;

      return await handler(authenticatedReq, context);

    } catch (error) {
      console.error('💥 API Middleware: ошибка авторизации:', error);
      return NextResponse.json(
        { success: false, error: 'Ошибка проверки авторизации' },
        { status: 500 }
      );
    }
  };
};

// Middleware для проверки прав доступа
export const withPermissions = (
  config: PermissionConfig,
  handler: (req: AuthenticatedRequest, context?: { params: any }) => Promise<NextResponse>
) => {
  return withAuth(async (req: AuthenticatedRequest, context?: { params: any }): Promise<NextResponse> => {
    try {
      const { resource, action, requireOwnership, getOwnerId } = config;
      const { user } = req;

      console.log(`🛡️ API Middleware: проверка прав ${user.role} -> $${resource}:$${action}`);

      // Проверяем базовые права
      if (!hasPermission(user.role, resource, action)) {
        console.log(`❌ API Middleware: недостаточно прав для $${resource}:$${action}`);
        return NextResponse.json(
          { success: false, error: `Недостаточно прав для выполнения действия ${action} с ресурсом ${resource}` },
          { status: 403 }
        );
      }

      // Проверяем владение объектом если требуется
      if (requireOwnership && getOwnerId) {
        const ownerId = await getOwnerId(req);

        if (!canAccessObject(user.role, user.id, ownerId, resource, action)) {
          console.log(`❌ API Middleware: нет доступа к объекту владельца ${ownerId}`);
          return NextResponse.json(
            { success: false, error: 'Нет доступа к данному объекту' },
            { status: 403 }
          );
        }
      }

      console.log(`✅ API Middleware: права подтверждены для $${resource}:$${action}`);
      return await handler(req, context);

    } catch (error) {
      console.error('💥 API Middleware: ошибка проверки прав:', error);
      return NextResponse.json(
        { success: false, error: 'Ошибка проверки прав доступа' },
        { status: 500 }
      );
    }
  });
};

// Middleware для валидации данных
export const withValidation = <T = any>(
  schema: ValidationSchema<T>,
  handler: (req: AuthenticatedRequest, validatedData: T, context?: { params: any }) => Promise<NextResponse>
) => {
  return withAuth(async (req: AuthenticatedRequest, context?: { params: any }): Promise<NextResponse> => {
    try {
      let data: any;

      if (req.method === 'GET' || req.method === 'DELETE') {
        // Для GET и DELETE берем параметры из URL
        const url = new URL(req.url);
        data = Object.fromEntries(url.searchParams.entries());

        // Добавляем параметры из пути
        if (context?.params) {
          data = { ...data, ...context.params };
        }
      } else {
        // Для POST, PUT, PATCH берем данные из тела запроса
        const body = await req.text();
        if (body) {
          try {
            data = JSON.parse(body);
          } catch {
            return NextResponse.json(
              { success: false, error: 'Некорректный JSON в теле запроса' },
              { status: 400 }
            );
          }
        } else {
          data = {};
        }
      }

      const validation = schema.validate(data);

      if (!validation.isValid) {
        console.log('❌ API Middleware: ошибка валидации:', validation.errors);
        return NextResponse.json(
          {
            success: false,
            error: 'Ошибка валидации данных',
            details: validation.errors
          },
          { status: 400 }
        );
      }

      console.log('✅ API Middleware: данные валидированы');
      return await handler(req, validation.data || data, context);

    } catch (error) {
      console.error('💥 API Middleware: ошибка валидации:', error);
      return NextResponse.json(
        { success: false, error: 'Ошибка обработки данных' },
        { status: 400 }
      );
    }
  });
};

// Middleware для ограничения частоты запросов
export const withRateLimit = (
  config: RateLimitConfig,
  handler: (req: AuthenticatedRequest, context?: { params: any }) => Promise<NextResponse>
) => {
  return withAuth(async (req: AuthenticatedRequest, context?: { params: any }): Promise<NextResponse> => {
    try {
      const { maxRequests, windowMs, keyGenerator } = config;
      const key = keyGenerator ? keyGenerator(req) : `${req.user.id}_${req.method}_${new URL(req.url).pathname}`;
      const now = Date.now();

      const current = rateLimitStore.get(key);

      if (!current || now > current.resetTime) {
        // Новое окно или окно истекло
        rateLimitStore.set(key, {
          count: 1,
          resetTime: now + windowMs
        });
      } else {
        // Увеличиваем счетчик
        current.count++;

        if (current.count > maxRequests) {
          const resetIn = Math.ceil((current.resetTime - now) / 1000);

          console.log(`🚫 API Middleware: превышен лимит запросов для ${key}`);
          return NextResponse.json(
            {
              success: false,
              error: 'Превышен лимит запросов',
              retryAfter: resetIn
            },
            {
              status: 429,
              headers: {
                'Retry-After': resetIn.toString(),
                'X-RateLimit-Limit': maxRequests.toString(),
                'X-RateLimit-Remaining': '0',
                'X-RateLimit-Reset': current.resetTime.toString()
              }
            }
          );
        }

        rateLimitStore.set(key, current);
      }

      const response = await handler(req, context);

      // Добавляем заголовки лимита
      const currentLimit = rateLimitStore.get(key);
      if (currentLimit) {
        response.headers.set('X-RateLimit-Limit', maxRequests.toString());
        response.headers.set('X-RateLimit-Remaining', (maxRequests - currentLimit.count).toString());
        response.headers.set('X-RateLimit-Reset', currentLimit.resetTime.toString());
      }

      return response;

    } catch (error) {
      console.error('💥 API Middleware: ошибка rate limiting:', error);
      return NextResponse.json(
        { success: false, error: 'Ошибка обработки запроса' },
        { status: 500 }
      );
    }
  });
};

// Middleware для кэширования
export const withCache = (
  config: CacheConfig,
  handler: (req: AuthenticatedRequest, context?: { params: any }) => Promise<NextResponse>
) => {
  return withAuth(async (req: AuthenticatedRequest, context?: { params: any }): Promise<NextResponse> => {
    try {
      // Кэшируем только GET запросы
      if (req.method !== 'GET') {
        return await handler(req, context);
      }

      const cacheKey = config.key(req);
      const now = Date.now();

      // Проверяем кэш
      const cached = cacheStore.get(cacheKey);
      if (cached && now < cached.expiry) {
        console.log(`💾 API Middleware: возвращаем из кэша ${cacheKey}`);
        return NextResponse.json(cached.data, {
          headers: {
            'X-Cache': 'HIT',
            'X-Cache-TTL': Math.ceil((cached.expiry - now) / 1000).toString()
          }
        });
      }

      // Выполняем запрос
      const response = await handler(req, context);

      // Кэшируем успешные ответы
      if (response.status === 200) {
        const responseData = await response.json();
        cacheStore.set(cacheKey, {
          data: responseData,
          expiry: now + (config.ttl * 1000)
        });

        console.log(`💾 API Middleware: сохраняем в кэш ${cacheKey}`);

        return NextResponse.json(responseData, {
          headers: {
            'X-Cache': 'MISS',
            'X-Cache-TTL': config.ttl.toString()
          }
        });
      }

      return response;

    } catch (error) {
      console.error('💥 API Middleware: ошибка кэширования:', error);
      return await handler(req, context);
    }
  });
};

// Middleware для логирования
export const withLogging = (
  handler: (req: AuthenticatedRequest, context?: { params: any }) => Promise<NextResponse>
) => {
  return withAuth(async (req: AuthenticatedRequest, context?: { params: any }): Promise<NextResponse> => {
    const startTime = Date.now();
    const { user } = req;
    const method = req.method;
    const url = req.nextUrl.pathname;

    console.log(`📝 API Request: ${method} ${url} by ${user.role} ${user.email}`);

    try {
      const response = await handler(req, context);
      const duration = Date.now() - startTime;

      console.log(`✅ API Response: ${method} ${url} - ${response.status} (${duration}ms)`);

      // Добавляем заголовки для отладки
      response.headers.set('X-Response-Time', `${duration}ms`);
      response.headers.set('X-User-Role', user.role);

      return response;
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`❌ API Error: ${method} ${url} - Error (${duration}ms):`, error);

      return NextResponse.json(
        { success: false, error: 'Внутренняя ошибка сервера' },
        { status: 500 }
      );
    }
  });
};

// Комбинированный middleware
export const withMiddleware = (
  options: {
    permissions?: PermissionConfig;
    validation?: ValidationSchema;
    rateLimit?: RateLimitConfig;
    cache?: CacheConfig;
    logging?: boolean;
  },
  handler: (req: AuthenticatedRequest, validatedData?: any, context?: { params: any }) => Promise<NextResponse>
) => {
  let middlewareHandler = handler;

  // Применяем middleware в обратном порядке (последний применяется первым)

  if (options.cache) {
    const originalHandler = middlewareHandler;
    middlewareHandler = withCache(options.cache, originalHandler);
  }

  if (options.rateLimit) {
    const originalHandler = middlewareHandler;
    middlewareHandler = withRateLimit(options.rateLimit, originalHandler);
  }

  if (options.validation) {
    const originalHandler = middlewareHandler;
    middlewareHandler = withValidation(options.validation, originalHandler as any);
  }

  if (options.permissions) {
    const originalHandler = middlewareHandler;
    middlewareHandler = withPermissions(options.permissions, originalHandler);
  }

  if (options.logging !== false) {
    const originalHandler = middlewareHandler;
    middlewareHandler = withLogging(originalHandler);
  }

  return middlewareHandler;
};

// Готовые middleware для разных ресурсов
export const withUserManagement = (
  handler: (req: AuthenticatedRequest, context?: { params: any }) => Promise<NextResponse>
) => withPermissions({ resource: 'users', action: 'read' }, handler);

export const withUserCreation = (
  handler: (req: AuthenticatedRequest, context?: { params: any }) => Promise<NextResponse>
) => withPermissions({ resource: 'users', action: 'create' }, handler);

export const withUserDeletion = (
  handler: (req: AuthenticatedRequest, context?: { params: any }) => Promise<NextResponse>
) => withPermissions({ resource: 'users', action: 'delete' }, handler);

export const withTrainerManagement = (
  handler: (req: AuthenticatedRequest, context?: { params: any }) => Promise<NextResponse>
) => withPermissions({ resource: 'trainers', action: 'read' }, handler);

export function withScheduleManagement(
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>
) {
  return withPermissions(
    { resource: 'schedule', action: 'read' },
    async (req: AuthenticatedRequest) => {
      console.log(`📅 Schedule access by ${req.user.role}: ${req.user.id}`);

      return await handler(req);
    }
  );
}

export const withAnalyticsAccess = (
  handler: (req: AuthenticatedRequest, context?: { params: any }) => Promise<NextResponse>
) => withPermissions({ resource: 'analytics', action: 'read' }, handler);

export const withSystemAccess = (
  handler: (req: AuthenticatedRequest, context?: { params: any }) => Promise<NextResponse>
) => withPermissions({ resource: 'system', action: 'maintenance' }, handler);

// Middleware для проверки владения тренером
export const withTrainerOwnership = (
  handler: (req: AuthenticatedRequest, context?: { params: any }) => Promise<NextResponse>
) => withPermissions({
  resource: 'trainers',
  action: 'update',
  requireOwnership: true,
  getOwnerId: async (req) => {
    const url = new URL(req.url);
    const trainerId = url.searchParams.get('trainerId') ||
      url.pathname.split('/').filter(Boolean).pop();
    return trainerId || undefined;
  }
}, handler);

// Middleware для проверки владения клиентом
export const withClientOwnership = (
  handler: (req: AuthenticatedRequest, context?: { params: any }) => Promise<NextResponse>
) => withPermissions({
  resource: 'clients',
  action: 'update',
  requireOwnership: true,
  getOwnerId: async (req) => {
    const { mockClients } = await import('@/lib/mock-data');
    const url = new URL(req.url);
    const clientId = url.searchParams.get('clientId') ||
      url.pathname.split('/').filter(Boolean).pop();

    if (!clientId) return undefined;

    const client = mockClients.find((c: any) => c.id === clientId);
    return client?.trainerId;
  }
}, handler);

// Middleware для проверки владения сессией
export const withSessionOwnership = (
  handler: (req: AuthenticatedRequest, context?: { params: any }) => Promise<NextResponse>
) => withPermissions({
  resource: 'schedule',
  action: 'update',
  requireOwnership: true,
  getOwnerId: async (req) => {
    const { mockSessions } = await import('@/lib/mock-data');
    const url = new URL(req.url);
    const sessionId = url.searchParams.get('sessionId') ||
      url.pathname.split('/').filter(Boolean).pop();

    if (!sessionId) return undefined;

    const session = mockSessions.find((s: any) => s.id === sessionId);
    return session?.trainerId;
  }
}, handler);

// Универсальный middleware с динамической проверкой владения
export const withDynamicOwnership = (
  resource: Resource,
  action: Action,
  getOwnerIdFn: (req: NextRequest) => Promise<string | undefined>
) => (
  handler: (req: AuthenticatedRequest, context?: { params: any }) => Promise<NextResponse>
) => withPermissions({
  resource,
  action,
  requireOwnership: true,
  getOwnerId: getOwnerIdFn
}, handler);

// Middleware для проверки роли
export const withRole = (
  allowedRoles: UserRole[],
  handler: (req: AuthenticatedRequest, context?: { params: any }) => Promise<NextResponse>
) => {
  return withAuth(async (req: AuthenticatedRequest, context?: { params: any }): Promise<NextResponse> => {
    const { user } = req;

    if (!allowedRoles.includes(user.role)) {
      console.log(`❌ API Middleware: роль ${user.role} не разрешена. Требуется: ${allowedRoles.join(', ')}`);
      return NextResponse.json(
        { success: false, error: 'Недостаточно прав доступа' },
        { status: 403 }
      );
    }

    return await handler(req, context);
  });
};

// Middleware только для администраторов
export const withAdminOnly = (
  handler: (req: AuthenticatedRequest, context?: { params: any }) => Promise<NextResponse>
) => withRole(['admin'], handler);

// Middleware для администраторов и менеджеров
export const withManagerAccess = (
  handler: (req: AuthenticatedRequest, context?: { params: any }) => Promise<NextResponse>
) => withRole(['admin', 'manager'], handler);

// Middleware для всех ролей кроме клиентов
export const withStaffAccess = (
  handler: (req: AuthenticatedRequest, context?: { params: any }) => Promise<NextResponse>
) => withRole(['admin', 'manager', 'trainer'], handler);

// Middleware для операций с собственным профилем
export const withOwnProfileAccess = (
  handler: (req: AuthenticatedRequest, context?: { params: any }) => Promise<NextResponse>
) => {
  return withAuth(async (req: AuthenticatedRequest, context?: { params: any }): Promise<NextResponse> => {
    const { user } = req;
    const url = new URL(req.url);
    const targetUserId = url.searchParams.get('userId') ||
      context?.params?.id ||
      url.pathname.split('/').filter(Boolean).pop();

    // Разрешаем доступ к собственному профилю или если есть права управления пользователями
    if (targetUserId === user.id || hasPermission(user.role, 'users', 'update')) {
      return await handler(req, context);
    }

    return NextResponse.json(
      { success: false, error: 'Нет доступа к данному профилю' },
      { status: 403 }
    );
  });
};

// Middleware для проверки доступа к тренеру
export const withTrainerAccess = (
  handler: (req: AuthenticatedRequest, context?: { params: any }) => Promise<NextResponse>
) => {
  return withAuth(async (req: AuthenticatedRequest, context?: { params: any }): Promise<NextResponse> => {
    const { user } = req;
    const url = new URL(req.url);
    const targetTrainerId = url.searchParams.get('trainerId') ||
      context?.params?.id ||
      url.pathname.split('/').filter(Boolean).pop();

    // Тренеры могут видеть только свой профиль, менеджеры и админы - все
    if (user.role === 'trainer' && targetTrainerId !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Нет доступа к данному тренеру' },
        { status: 403 }
      );
    }

    if (!hasPermission(user.role, 'trainers', 'read')) {
      return NextResponse.json(
        { success: false, error: 'Недостаточно прав для просмотра тренеров' },
        { status: 403 }
      );
    }

    return await handler(req, context);
  });
};

// Middleware для операций с клиентами
export const withClientAccess = (
  handler: (req: AuthenticatedRequest, context?: { params: any }) => Promise<NextResponse>
) => {
  return withAuth(async (req: AuthenticatedRequest, context?: { params: any }): Promise<NextResponse> => {
    const { user } = req;

    if (!hasPermission(user.role, 'clients', 'read')) {
      return NextResponse.json(
        { success: false, error: 'Недостаточно прав для просмотра клиентов' },
        { status: 403 }
      );
    }

    return await handler(req, context);
  });
};

// Middleware для операций с аналитикой (с поддержкой write)
export const withAnalyticsWrite = (
  handler: (req: AuthenticatedRequest, context?: { params: any }) => Promise<NextResponse>
) => withPermissions({ resource: 'analytics', action: 'update' }, handler);

export const withAnalyticsExport = (
  handler: (req: AuthenticatedRequest, context?: { params: any }) => Promise<NextResponse>
) => withPermissions({ resource: 'analytics', action: 'export' }, handler);

// Утилиты для очистки кэша
export const clearCache = (pattern?: string): void => {
  if (!pattern) {
    cacheStore.clear();
    console.log('💾 Cache: очищен весь кэш');
    return;
  }

  const keysToDelete: string[] = [];
  for (const key of cacheStore.keys()) {
    if (key.includes(pattern)) {
      keysToDelete.push(key);
    }
  }

  keysToDelete.forEach(key => cacheStore.delete(key));
  console.log(`💾 Cache: очищено ${keysToDelete.length} записей по паттерну "${pattern}"`);
};

export const getCacheStats = (): {
  size: number;
  keys: string[];
  hitRate?: number;
} => {
  return {
    size: cacheStore.size,
    keys: Array.from(cacheStore.keys()),
  };
};

// Утилиты для rate limiting
export const clearRateLimit = (pattern?: string): void => {
  if (!pattern) {
    rateLimitStore.clear();
    console.log('🚫 RateLimit: очищены все лимиты');
    return;
  }

  const keysToDelete: string[] = [];
  for (const key of rateLimitStore.keys()) {
    if (key.includes(pattern)) {
      keysToDelete.push(key);
    }
  }

  keysToDelete.forEach(key => rateLimitStore.delete(key));
  console.log(`🚫 RateLimit: очищено ${keysToDelete.length} лимитов по паттерну "${pattern}"`);
};

export const getRateLimitStats = (): {
  activeKeys: number;
  limits: Array<{ key: string; count: number; resetTime: number }>;
} => {
  const now = Date.now();
  const activeLimits: Array<{ key: string; count: number; resetTime: number }> = [];

  for (const [key, value] of rateLimitStore.entries()) {
    if (now < value.resetTime) {
      activeLimits.push({ key, count: value.count, resetTime: value.resetTime });
    }
  }

  return {
    activeKeys: activeLimits.length,
    limits: activeLimits
  };
};

// Middleware для CORS
export const withCORS = (
  options: {
    origin?: string | string[];
    methods?: string[];
    headers?: string[];
    credentials?: boolean;
  } = {},
  handler: (req: AuthenticatedRequest, context?: { params: any }) => Promise<NextResponse>
) => {
  return withAuth(async (req: AuthenticatedRequest, context?: { params: any }): Promise<NextResponse> => {
    const response = await handler(req, context);

    // Устанавливаем CORS заголовки
    const origin = req.headers.get('origin');
    const allowedOrigins = Array.isArray(options.origin) ? options.origin : [options.origin || '*'];

    if (origin && (allowedOrigins.includes('*') || allowedOrigins.includes(origin))) {
      response.headers.set('Access-Control-Allow-Origin', origin);
    }

    response.headers.set('Access-Control-Allow-Methods', (options.methods || ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']).join(', '));
    response.headers.set('Access-Control-Allow-Headers', (options.headers || ['Content-Type', 'Authorization']).join(', '));

    if (options.credentials) {
      response.headers.set('Access-Control-Allow-Credentials', 'true');
    }

    return response;
  });
};

// Middleware для обработки ошибок
export const withErrorHandling = (
  handler: (req: AuthenticatedRequest, context?: { params: any }) => Promise<NextResponse>
) => {
  return withAuth(async (req: AuthenticatedRequest, context?: { params: any }): Promise<NextResponse> => {
    try {
      return await handler(req, context);
    } catch (error: any) {
      console.error('💥 API Error Handler:', error);

      // Определяем тип ошибки и возвращаем соответствующий ответ
      if (error.name === 'ValidationError') {
        return NextResponse.json(
          { success: false, error: 'Ошибка валидации', details: error.message },
          { status: 400 }
        );
      }

      if (error.name === 'UnauthorizedError') {
        return NextResponse.json(
          { success: false, error: 'Не авторизован' },
          { status: 401 }
        );
      }

      if (error.name === 'ForbiddenError') {
        return NextResponse.json(
          { success: false, error: 'Доступ запрещен' },
          { status: 403 }
        );
      }

      if (error.name === 'NotFoundError') {
        return NextResponse.json(
          { success: false, error: 'Ресурс не найден' },
          { status: 404 }
        );
      }

      // Общая ошибка сервера
      return NextResponse.json(
        {
          success: false,
          error: 'Внутренняя ошибка сервера',
          ...(process.env.NODE_ENV === 'development' && typeof error === 'object' && error !== null && 'message' in error ? { details: (error as { message?: string }).message } : {})
        },
        { status: 500 }
      );
    }
  });
};

// Middleware для метрик производительности
export const withMetrics = (
  handler: (req: AuthenticatedRequest, context?: { params: any }) => Promise<NextResponse>
) => {
  return withAuth(async (req: AuthenticatedRequest, context?: { params: any }): Promise<NextResponse> => {
    const startTime = process.hrtime.bigint();
    const startMemory = process.memoryUsage();

    try {
      const response = await handler(req, context);

      const endTime = process.hrtime.bigint();
      const endMemory = process.memoryUsage();

      const duration = Number(endTime - startTime) / 1000000; // в миллисекундах
      const memoryDelta = endMemory.heapUsed - startMemory.heapUsed;

      // Добавляем метрики в заголовки ответа
      response.headers.set('X-Response-Time', `${duration.toFixed(2)}ms`);
      response.headers.set('X-Memory-Delta', `${(memoryDelta / 1024 / 1024).toFixed(2)}MB`);
      response.headers.set('X-Memory-Usage', `${(endMemory.heapUsed / 1024 / 1024).toFixed(2)}MB`);

      // Логируем метрики для мониторинга
      if (duration > 1000) { // Медленные запросы > 1 сек
        console.warn(`⚠️ Slow API: ${req.method} ${req.nextUrl.pathname} took ${duration.toFixed(2)}ms`);
      }

      if (memoryDelta > 10 * 1024 * 1024) { // Большое потребление памяти > 10MB
        console.warn(`⚠️ Memory spike: ${req.method} ${req.nextUrl.pathname} used ${(memoryDelta / 1024 / 1024).toFixed(2)}MB`);
      }

      return response;
    } catch (error) {
      const endTime = process.hrtime.bigint();
      const duration = Number(endTime - startTime) / 1000000;

      console.error(`💥 API Error after ${duration.toFixed(2)}ms:`, error);
      throw error;
    }
  });
};

// Middleware для сжатия ответов (имитация)
export const withCompression = (
  handler: (req: AuthenticatedRequest, context?: { params: any }) => Promise<NextResponse>
) => {
  return withAuth(async (req: AuthenticatedRequest, context?: { params: any }): Promise<NextResponse> => {
    const response = await handler(req, context);

    // Проверяем поддержку сжатия клиентом
    const acceptEncoding = req.headers.get('accept-encoding') || '';

    if (acceptEncoding.includes('gzip')) {
      response.headers.set('Content-Encoding', 'gzip');
      response.headers.set('Vary', 'Accept-Encoding');
    }

    return response;
  });
};

// Middleware для версионирования API
export const withApiVersion = (
  supportedVersions: string[] = ['v1'],
  defaultVersion: string = 'v1',
  handler: (req: AuthenticatedRequest, version: string, context?: { params: any }) => Promise<NextResponse>
) => {
  return withAuth(async (req: AuthenticatedRequest, context?: { params: any }): Promise<NextResponse> => {
    // Получаем версию из заголовка или URL
    const versionFromHeader = req.headers.get('api-version');
    const versionFromUrl = req.nextUrl.pathname.match(/\/api\/(v\d+)\//)?.[1];
    const version = versionFromHeader || versionFromUrl || defaultVersion;

    if (!supportedVersions.includes(version)) {
      return NextResponse.json(
        {
          success: false,
          error: `Неподдерживаемая версия API: ${version}`,
          supportedVersions
        },
        { status: 400 }
      );
    }

    const response = await handler(req, version, context);
    response.headers.set('API-Version', version);

    return response;
  });
};

// Middleware для проверки обслуживания
export const withMaintenanceMode = (
  isMaintenanceMode: () => boolean,
  handler: (req: AuthenticatedRequest, context?: { params: any }) => Promise<NextResponse>
) => {
  return withAuth(async (req: AuthenticatedRequest, context?: { params: any }): Promise<NextResponse> => {
    if (isMaintenanceMode() && req.user.role !== 'admin') {
      return NextResponse.json(
        {
          success: false,
          error: 'Сервис временно недоступен из-за технического обслуживания',
          maintenanceMode: true
        },
        { status: 503 }
      );
    }

    return await handler(req, context);
  });
};

// Специализированные схемы валидации
export const createValidationSchema = <T = any>(rules: {
  [K in keyof T]?: {
    required?: boolean;
    type?: 'string' | 'number' | 'boolean' | 'array' | 'object';
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    pattern?: RegExp;
    enum?: any[];
    custom?: (value: any) => boolean | string;
  };
}): ValidationSchema<T> => {
  return {
    validate: (data: any) => {
      const errors: string[] = [];
      const validatedData: any = {};

      // Определяем тип для правила валидации
      type ValidationRule = {
        required?: boolean;
        type?: 'string' | 'number' | 'boolean' | 'array' | 'object';
        minLength?: number;
        maxLength?: number;
        min?: number;
        max?: number;
        pattern?: RegExp;
        enum?: any[];
        custom?: (value: any) => boolean | string;
      };

      for (const [field, ruleUnknown] of Object.entries(rules)) {
        const rule = ruleUnknown as ValidationRule;
        const value = data[field];

        // Проверка обязательности
        if (rule.required && (value === undefined || value === null || value === '')) {
          errors.push(`Поле ${field} обязательно для заполнения`);
          continue;
        }

        // Если поле не обязательное и пустое, пропускаем остальные проверки
        if (!rule.required && (value === undefined || value === null || value === '')) {
          continue;
        }

        // Проверка типа
        if (rule.type) {
          const actualType = Array.isArray(value) ? 'array' : typeof value;
          if (actualType !== rule.type) {
            errors.push(`Поле ${field} должно быть типа ${rule.type}`);
            continue;
          }
        }

        // Проверка длины строки
        if (rule.type === 'string' && typeof value === 'string') {
          if (rule.minLength && value.length < rule.minLength) {
            errors.push(`Поле ${field} должно содержать минимум ${rule.minLength} символов`);
          }
          if (rule.maxLength && value.length > rule.maxLength) {
            errors.push(`Поле ${field} должно содержать максимум ${rule.maxLength} символов`);
          }
        }

        // Проверка числовых значений
        if (rule.type === 'number' && typeof value === 'number') {
          if (rule.min !== undefined && value < rule.min) {
            errors.push(`Поле ${field} должно быть не менее ${rule.min}`);
          }
          if (rule.max !== undefined && value > rule.max) {
            errors.push(`Поле ${field} должно быть не более ${rule.max}`);
          }
        }

        // Проверка регулярного выражения
        if (rule.pattern && typeof value === 'string') {
          if (!rule.pattern.test(value)) {
            errors.push(`Поле ${field} имеет некорректный формат`);
          }
        }

        // Проверка перечисления
        if (rule.enum && !rule.enum.includes(value)) {
          errors.push(`Поле ${field} должно быть одним из: ${rule.enum.join(', ')}`);
        }

        // Кастомная валидация
        if (rule.custom) {
          const customResult = rule.custom(value);
          if (typeof customResult === 'string') {
            errors.push(customResult);
          } else if (!customResult) {
            errors.push(`Поле ${field} не прошло валидацию`);
          }
        }

        validatedData[field] = value;
      }

      return {
        isValid: errors.length === 0,
        errors,
        data: validatedData as T
      };
    }
  };
};


// Готовые схемы валидации
export const userValidationSchema = createValidationSchema({
  name: { required: true, type: 'string', minLength: 2, maxLength: 50 },
  email: { required: true, type: 'string', pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
  role: { required: true, type: 'string', enum: ['admin', 'manager', 'trainer', 'client'] },
  phone: { type: 'string', pattern: /^\+?[\d\s\-$]{10,}$/ }
});

export const trainerValidationSchema = createValidationSchema({
  name: { required: true, type: 'string', minLength: 2, maxLength: 50 },
  email: { required: true, type: 'string', pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
  phone: { required: true, type: 'string', pattern: /^\+?[\d\s\-$]{10,}$/ },
  specialization: { required: true, type: 'array' },
  experience: { required: true, type: 'number', min: 0, max: 50 },
  hourlyRate: { required: true, type: 'number', min: 500, max: 10000 }
});

export const clientValidationSchema = createValidationSchema({
  name: { required: true, type: 'string', minLength: 2, maxLength: 50 },
  email: { required: true, type: 'string', pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
  phone: { type: 'string', pattern: /^\+?[\d\s\-$]{10,}$/ },
  membershipType: { required: true, type: 'string', enum: ['basic', 'premium', 'vip'] },
  trainerId: { type: 'string' }
});

export const sessionValidationSchema = createValidationSchema({
  trainerId: { required: true, type: 'string' },
  clientId: { required: true, type: 'string' },
  date: { required: true, type: 'string', pattern: /^\d{4}-\d{2}-\d{2}$/ },
  startTime: { required: true, type: 'string', pattern: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ },
  endTime: { required: true, type: 'string', pattern: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ },
  type: { required: true, type: 'string', enum: ['personal', 'group', 'consultation'] },
  status: { type: 'string', enum: ['scheduled', 'completed', 'cancelled', 'no-show'] }
});


// Middleware для аудита действий
export const withAudit = (
  handler: (req: AuthenticatedRequest, context?: { params: any }) => Promise<NextResponse>
) => {
  return withAuth(async (req: AuthenticatedRequest, context?: { params: any }): Promise<NextResponse> => {
    const auditLog = {
      userId: req.user.id,
      userRole: req.user.role,
      action: req.method,
      resource: req.nextUrl.pathname,
      timestamp: new Date().toISOString(),
      ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
      userAgent: req.headers.get('user-agent') || 'unknown'
    };

    try {
      const response = await handler(req, context);

      // Логируем успешные действия
      console.log(`📋 Audit: ${auditLog.userRole} ${auditLog.userId} performed ${auditLog.action} on ${auditLog.resource}`);

      // В реальном приложении здесь было бы сохранение в базу данных аудита
      // await saveAuditLog({ ...auditLog, status: 'success', responseStatus: response.status });

      return response;
    } catch (error) {
      // Логируем неудачные действия
      console.error(`📋 Audit Error: ${auditLog.userRole} ${auditLog.userId} failed ${auditLog.action} on ${auditLog.resource}:`, error);

      // await saveAuditLog({ ...auditLog, status: 'error', error: error.message });

      throw error;
    }
  });
};

// Middleware для проверки IP-адресов
export const withIPWhitelist = (
  allowedIPs: string[] = [],
  handler: (req: AuthenticatedRequest, context?: { params: any }) => Promise<NextResponse>
) => {
  return withAuth(async (req: AuthenticatedRequest, context?: { params: any }): Promise<NextResponse> => {
    if (allowedIPs.length === 0) {
      return await handler(req, context);
    }

    const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0] ||
      req.headers.get('x-real-ip') ||
      'unknown';

    if (!allowedIPs.includes(clientIP) && !allowedIPs.includes('*')) {
      console.log(`🚫 IP blocked: ${clientIP} attempted to access ${req.nextUrl.pathname}`);
      return NextResponse.json(
        { success: false, error: 'Доступ с данного IP-адреса запрещен' },
        { status: 403 }
      );
    }

    return await handler(req, context);
  });
};

// Экспорт утилит для работы с middleware
export const middlewareUtils = {
  clearCache,
  getCacheStats,
  clearRateLimit,
  getRateLimitStats,
  createValidationSchema,

  // Готовые схемы валидации
  schemas: {
    user: userValidationSchema,
    trainer: trainerValidationSchema,
    client: clientValidationSchema,
    session: sessionValidationSchema
  },

  // Готовые конфигурации rate limiting
  rateLimits: {
    strict: { maxRequests: 10, windowMs: 60000 }, // 10 запросов в минуту
    normal: { maxRequests: 100, windowMs: 60000 }, // 100 запросов в минуту
    relaxed: { maxRequests: 1000, windowMs: 60000 } // 1000 запросов в минуту
  },

  // Готовые конфигурации кэширования
  cache: {
    short: { ttl: 60 }, // 1 минута
    medium: { ttl: 300 }, // 5 минут
    long: { ttl: 3600 }, // 1 час

    // Генераторы ключей кэша
    keyGenerators: {
      userBased: (req: AuthenticatedRequest) => `user_${req.user.id}_${req.nextUrl.pathname}`,
      roleBased: (req: AuthenticatedRequest) => `role_${req.user.role}_${req.nextUrl.pathname}`,
      pathBased: (req: AuthenticatedRequest) => `path_${req.nextUrl.pathname}${req.nextUrl.search}`,
      global: (req: AuthenticatedRequest) => `global_${req.nextUrl.pathname}`
    }
  }
};

// Готовые комбинации middleware для типичных сценариев
export const apiMiddlewares = {
  // Базовый middleware для публичных эндпоинтов (только аутентификация)
  public: (handler: (req: AuthenticatedRequest, context?: { params: any }) => Promise<NextResponse>) =>
    withMiddleware(
      { logging: true },
      handler
    ),

  // Middleware для чтения данных (с кэшированием)
  read: (permissions: PermissionConfig, cacheConfig?: CacheConfig) =>
    (handler: (req: AuthenticatedRequest, context?: { params: any }) => Promise<NextResponse>) =>
      withMiddleware(
        {
          permissions,
          cache: cacheConfig || { ttl: 300, key: middlewareUtils.cache.keyGenerators.userBased },
          rateLimit: middlewareUtils.rateLimits.normal,
          logging: true
        },
        handler
      ),

  // Middleware для записи данных (с валидацией)
  write: (permissions: PermissionConfig, validation?: ValidationSchema) =>
    (handler: (req: AuthenticatedRequest, validatedData?: any, context?: { params: any }) => Promise<NextResponse>) =>
      withMiddleware(
        {
          permissions,
          validation,
          rateLimit: middlewareUtils.rateLimits.strict,
          logging: true
        },
        handler
      ),

  // Middleware для административных операций
  admin: (validation?: ValidationSchema) =>
    (handler: (req: AuthenticatedRequest, validatedData?: any, context?: { params: any }) => Promise<NextResponse>) =>
      withMiddleware(
        {
          permissions: { resource: 'system', action: 'maintenance' },
          validation,
          rateLimit: middlewareUtils.rateLimits.strict,
          logging: true
        },
        handler
      ),

  // Middleware для аналитики (с кэшированием и ограничениями)
  analytics: (cacheConfig?: CacheConfig) =>
    (handler: (req: AuthenticatedRequest, context?: { params: any }) => Promise<NextResponse>) =>
      withMiddleware(
        {
          permissions: { resource: 'analytics', action: 'read' },
          cache: cacheConfig || { ttl: 600, key: middlewareUtils.cache.keyGenerators.roleBased },
          rateLimit: middlewareUtils.rateLimits.normal,
          logging: true
        },
        handler
      ),

  // Middleware для экспорта данных
  export: (permissions: PermissionConfig) =>
    (handler: (req: AuthenticatedRequest, context?: { params: any }) => Promise<NextResponse>) =>
      withMiddleware(
        {
          permissions,
          rateLimit: { maxRequests: 5, windowMs: 300000 }, // 5 запросов в 5 минут
          logging: true
        },
        handler
      )
};

// Декораторы для упрощения применения middleware
export const createApiHandler = {
  // Создание обработчика для GET запросов с кэшированием
  get: (
    permissions: PermissionConfig,
    handler: (req: AuthenticatedRequest, context?: { params: any }) => Promise<NextResponse>,
    options?: { cache?: CacheConfig; rateLimit?: RateLimitConfig }
  ) => {
    return withMiddleware(
      {
        permissions,
        cache: options?.cache || { ttl: 300, key: middlewareUtils.cache.keyGenerators.userBased },
        rateLimit: options?.rateLimit || middlewareUtils.rateLimits.normal,
        logging: true
      },
      handler
    );
  },

  // Создание обработчика для POST запросов с валидацией
  post: (
    permissions: PermissionConfig,
    validation: ValidationSchema,
    handler: (req: AuthenticatedRequest, validatedData: any, context?: { params: any }) => Promise<NextResponse>,
    options?: { rateLimit?: RateLimitConfig }
  ) => {
    return withMiddleware(
      {
        permissions,
        validation,
        rateLimit: options?.rateLimit || middlewareUtils.rateLimits.strict,
        logging: true
      },
      handler
    );
  },

  // Создание обработчика для PUT/PATCH запросов
  update: (
    permissions: PermissionConfig,
    validation: ValidationSchema,
    handler: (req: AuthenticatedRequest, validatedData: any, context?: { params: any }) => Promise<NextResponse>
  ) => {
    return withMiddleware(
      {
        permissions,
        validation,
        rateLimit: middlewareUtils.rateLimits.strict,
        logging: true
      },
      handler
    );
  },

  // Создание обработчика для DELETE запросов
  delete: (
    permissions: PermissionConfig,
    handler: (req: AuthenticatedRequest, context?: { params: any }) => Promise<NextResponse>
  ) => {
    return withMiddleware(
      {
        permissions,
        rateLimit: middlewareUtils.rateLimits.strict,
        logging: true
      },
      handler
    );
  }
};

// Утилиты для работы с ошибками
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const createApiError = {
  badRequest: (message: string, details?: any) => new ApiError(400, message, 'BAD_REQUEST', details),
  unauthorized: (message: string = 'Не авторизован') => new ApiError(401, message, 'UNAUTHORIZED'),
  forbidden: (message: string = 'Доступ запрещен') => new ApiError(403, message, 'FORBIDDEN'),
  notFound: (message: string = 'Ресурс не найден') => new ApiError(404, message, 'NOT_FOUND'),
  conflict: (message: string, details?: any) => new ApiError(409, message, 'CONFLICT', details),
  tooManyRequests: (message: string = 'Превышен лимит запросов') => new ApiError(429, message, 'TOO_MANY_REQUESTS'),
  internalError: (message: string = 'Внутренняя ошибка сервера') => new ApiError(500, message, 'INTERNAL_ERROR')
};

// Middleware для обработки ApiError
export const withApiErrorHandling = (
  handler: (req: AuthenticatedRequest, context?: { params: any }) => Promise<NextResponse>
) => {
  return withAuth(async (req: AuthenticatedRequest, context?: { params: any }): Promise<NextResponse> => {
    try {
      return await handler(req, context);
    } catch (error) {
      if (error instanceof ApiError) {
        return NextResponse.json(
          {
            success: false,
            error: error.message,
            code: error.code,
            ...(error.details && { details: error.details })
          },
          { status: error.statusCode }
        );
      }

      // Обработка других типов ошибок
      console.error('💥 Unhandled API Error:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Внутренняя ошибка сервера',
          ...(process.env.NODE_ENV === 'development' && typeof error === 'object' && error !== null && 'message' in error ? { details: (error as { message?: string }).message } : {})
        },
        { status: 500 }
      );
    }
  });
};

// Утилиты для работы с параметрами запроса
export const getRequestParams = (req: NextRequest, context?: { params: any }) => {
  const url = new URL(req.url);
  const searchParams = Object.fromEntries(url.searchParams.entries());
  const pathParams = context?.params || {};

  return {
    query: searchParams,
    params: pathParams,
    all: { ...searchParams, ...pathParams }
  };
};

export const getRequestBody = async <T = any>(req: NextRequest): Promise<T | null> => {
  if (req.method === 'GET' || req.method === 'DELETE') {
    return null;
  }

  try {
    const body = await req.text();
    return body ? JSON.parse(body) : null;
  } catch {
    return null;
  }
};

// Утилиты для работы с заголовками
export const setSecurityHeaders = (response: NextResponse): NextResponse => {
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  return response;
};

// Middleware для безопасности
export const withSecurity = (
  handler: (req: AuthenticatedRequest, context?: { params: any }) => Promise<NextResponse>
) => {
  return withAuth(async (req: AuthenticatedRequest, context?: { params: any }): Promise<NextResponse> => {
    const response = await handler(req, context);
    return setSecurityHeaders(response);
  });
};

// Финальный экспорт всех middleware и утилит
export default {
  // Основные middleware
  withAuth,
  withPermissions,
  withValidation,
  withRateLimit,
  withCache,
  withLogging,
  withMiddleware,

  // Специализированные middleware
  withRole,
  withAdminOnly,
  withManagerAccess,
  withStaffAccess,
  withOwnProfileAccess,
  withTrainerAccess,
  withClientAccess,
  withTrainerOwnership,
  withClientOwnership,
  withSessionOwnership,
  withDynamicOwnership,

  // Готовые комбинации
  apiMiddlewares,
  createApiHandler,

  // Дополнительные middleware
  withCORS,
  withErrorHandling,
  withApiErrorHandling,
  withMetrics,
  withCompression,
  withApiVersion,
  withMaintenanceMode,
  withAudit,
  withIPWhitelist,
  withSecurity,

  // Утилиты
  middlewareUtils,
  createApiError,
  ApiError,
  getRequestParams,
  getRequestBody,
  setSecurityHeaders,

  // Готовые схемы валидации
  userValidationSchema,
  trainerValidationSchema,
  clientValidationSchema,
  sessionValidationSchema,
  createValidationSchema,

  // Готовые middleware для ресурсов
  withUserManagement,
  withUserCreation,
  withUserDeletion,
  withTrainerManagement,
  withScheduleManagement,
  withAnalyticsAccess,
  withAnalyticsWrite,
  withAnalyticsExport,
  withSystemAccess
};


