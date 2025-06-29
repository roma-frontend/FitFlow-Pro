// app/api/admin/users/[id]/route.ts - ИСПРАВЛЕННАЯ ВЕРСИЯ ДЛЯ JWT
import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from "convex/browser";
import { getSession, debugSessionAccess } from '@/lib/simple-auth';
import { z } from 'zod';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Схемы валидации
const updateUserSchema = z.object({
  name: z.string().min(1, 'Имя обязательно').max(100, 'Имя слишком длинное').optional(),
  email: z.string().email('Неверный формат email').optional(),
  role: z.enum(['user', 'admin', 'manager', 'super-admin', 'trainer', 'client', 'member']).optional(),
  isActive: z.boolean().optional(),
  // Исправление: разрешаем пустые строки и null для photoUrl
  photoUrl: z.union([
    z.string().url('Неверный URL фото'),
    z.string().length(0),
    z.null(),
    z.undefined()
  ]).optional(),
  password: z.string().min(6, 'Пароль должен содержать минимум 6 символов').optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: 'Необходимо указать хотя бы одно поле для обновления'
});

// Интерфейсы
interface AuditLogData {
  action: string;
  entityType: string;
  entityId: string;
  performedBy: string;
  ip?: string;
  userAgent?: string;
  sessionId?: string;
  oldValues?: any;
  newValues?: any;
  changedFields?: string[];
  metadata?: any;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  success?: boolean;
  errorMessage?: string;
}

// Утилиты аудита
async function logAuditEvent(data: AuditLogData) {
  try {
    const auditLogId = await convex.mutation("auditLogs:createAuditLog", data);
    console.log('✅ Audit log created:', auditLogId);
    return auditLogId;
  } catch (error) {
    console.error('❌ Failed to create audit log:', error);
  }
}

function getChangedFields(oldValues: any, newValues: any): string[] {
  const changedFields: string[] = [];
  Object.keys(newValues).forEach(key => {
    if (oldValues[key] !== newValues[key]) {
      changedFields.push(key);
    }
  });
  return changedFields;
}

function determineSeverity(action: string, changedFields: string[]): 'low' | 'medium' | 'high' | 'critical' {
  if (action.includes('delete')) return 'critical';
  if (action.includes('role') || changedFields.includes('role')) return 'high';
  if (action.includes('password') || changedFields.includes('password')) return 'high';
  if (action.includes('email') || changedFields.includes('email')) return 'medium';
  return 'low';
}

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }
  
  return 'unknown';
}

// ✅ ИСПРАВЛЕННАЯ функция авторизации для JWT
async function checkAuthorization(request: NextRequest) {
  // Проверяем все возможные места хранения JWT токена
  const sessionId = request.cookies.get('session_id')?.value;
  const authToken = request.cookies.get('auth_token')?.value;
  const sessionIdDebug = request.cookies.get('session_id_debug')?.value;
  
  // Используем первый доступный токен
  const sessionToken = sessionId || authToken || sessionIdDebug;
  
  console.log('🔍 checkAuthorization: проверка JWT токена...', {
    hasSessionId: !!sessionId,
    hasAuthToken: !!authToken,
    hasSessionIdDebug: !!sessionIdDebug,
    tokenPreview: sessionToken?.substring(0, 20) + '...' || 'none'
  });
  
  if (!sessionToken) {
    console.log('❌ checkAuthorization: JWT токен отсутствует');
    return { 
      error: NextResponse.json({ 
        success: false, 
        error: 'Не авторизован - JWT токен отсутствует' 
      }, { status: 401 }),
      sessionData: null
    };
  }

  try {
    // ✅ ИСПРАВЛЕНИЕ: Используем await для getSession
    const sessionData = await getSession(sessionToken);
    
    if (!sessionData) {
      console.log('❌ checkAuthorization: JWT токен недействителен');
      
      // Дополнительная отладка в development
      if (process.env.NODE_ENV === 'development') {
        await debugSessionAccess(sessionToken);
      }
      
      return { 
        error: NextResponse.json({ 
          success: false, 
          error: 'Не авторизован - JWT токен недействителен' 
        }, { status: 401 }),
        sessionData: null
      };
    }
    
    console.log('✅ checkAuthorization: JWT токен валиден, пользователь:', {
      id: sessionData.user.id,
      email: sessionData.user.email,
      role: sessionData.user.role
    });

    return { error: null, sessionData };
    
  } catch (error) {
    console.error('💥 checkAuthorization: ошибка проверки JWT:', error);
    
    return { 
      error: NextResponse.json({ 
        success: false, 
        error: 'Ошибка проверки авторизации',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      }, { status: 500 }),
      sessionData: null
    };
  }
}

function checkPermissions(userRole: string, requiredRoles: string[]) {
  return requiredRoles.includes(userRole);
}

// ==================== PUT - ОБНОВЛЕНИЕ ПОЛЬЗОВАТЕЛЯ ====================
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  console.log('🎯 PUT /api/admin/users/[id] - НАЧАЛО обработки');
  
  const { id } = await params;
  let sessionToken: string | undefined;
  let sessionData: any = null;
  
  try {
    console.log('📍 ID пользователя для обновления:', id);

    // Валидация ID
    if (!id || typeof id !== 'string' || id.trim() === '') {
      await logAuditEvent({
        action: 'user.update.failed',
        entityType: 'user',
        entityId: id || 'unknown',
        performedBy: 'unknown',
        ip: getClientIP(request),
        userAgent: request.headers.get('user-agent') || 'unknown',
        sessionId: 'unknown',
        metadata: {
          endpoint: '/api/admin/users/[id]',
          method: 'PUT',
          reason: 'Invalid user ID',
        },
        severity: 'medium',
        success: false,
        errorMessage: 'Неверный ID пользователя',
      });

      return NextResponse.json({
        success: false,
        error: 'Неверный ID пользователя'
      }, { status: 400 });
    }

    // Получаем JWT токен
    const sessionId = request.cookies.get('session_id')?.value;
    const authToken = request.cookies.get('auth_token')?.value;
    const sessionIdDebug = request.cookies.get('session_id_debug')?.value;
    sessionToken = sessionId || authToken || sessionIdDebug;

    // ✅ ИСПРАВЛЕНИЕ: Проверка авторизации с JWT
    const { error: authError, sessionData: authSessionData } = await checkAuthorization(request);
    sessionData = authSessionData;
    
    if (authError) {
      await logAuditEvent({
        action: 'user.update.unauthorized',
        entityType: 'user',
        entityId: id,
        performedBy: 'unknown',
        ip: getClientIP(request),
        userAgent: request.headers.get('user-agent') || 'unknown',
        sessionId: sessionToken || 'unknown',
        metadata: {
          endpoint: '/api/admin/users/[id]',
          method: 'PUT',
          reason: 'JWT token invalid or expired',
        },
        severity: 'high',
        success: false,
        errorMessage: 'JWT токен недействителен',
      });
      return authError;
    }

    console.log('✅ PUT: JWT авторизация пройдена, пользователь:', {
      userId: sessionData!.user.id,
      name: sessionData!.user.name,
      role: sessionData!.user.role
    });
    
    // Проверка прав доступа
    if (!checkPermissions(sessionData!.user.role, ['super-admin', 'admin', 'manager'])) {
      console.log('❌ PUT: Недостаточно прав, роль:', sessionData!.user.role);
      
      await logAuditEvent({
        action: 'user.update.forbidden',
        entityType: 'user',
        entityId: id,
        performedBy: sessionData!.user.id,
        ip: getClientIP(request),
        userAgent: request.headers.get('user-agent') || 'unknown',
        sessionId: sessionToken || 'unknown',
        metadata: {
          endpoint: '/api/admin/users/[id]',
          method: 'PUT',
          userRole: sessionData!.user.role,
          reason: 'Insufficient permissions',
        },
        severity: 'high',
        success: false,
        errorMessage: `Недостаточно прав (роль: ${sessionData!.user.role})`,
      });

      return NextResponse.json({ 
        success: false, 
        error: `Недостаточно прав (роль: ${sessionData!.user.role})` 
      }, { status: 403 });
    }

    // Парсинг и валидация тела запроса
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.log('❌ PUT: Ошибка парсинга JSON:', parseError);
      
      await logAuditEvent({
        action: 'user.update.failed',
        entityType: 'user',
        entityId: id,
        performedBy: sessionData!.user.id,
        ip: getClientIP(request),
        userAgent: request.headers.get('user-agent') || 'unknown',
        sessionId: sessionToken || 'unknown',
        metadata: {
          endpoint: '/api/admin/users/[id]',
          method: 'PUT',
          reason: 'JSON parsing error',
          error: parseError instanceof Error ? parseError.message : 'Unknown parsing error',
        },
        severity: 'medium',
        success: false,
        errorMessage: 'Неверный формат JSON',
      });

      return NextResponse.json({
        success: false,
        error: 'Неверный формат JSON'
      }, { status: 400 });
    }

    // Валидация данных с помощью Zod
    const validationResult = updateUserSchema.safeParse(body);
    
    if (!validationResult.success) {
      console.log('❌ PUT: Ошибка валидации:', validationResult.error.errors);
      
      await logAuditEvent({
        action: 'user.update.validation_failed',
        entityType: 'user',
        entityId: id,
        performedBy: sessionData!.user.id,
        ip: getClientIP(request),
        userAgent: request.headers.get('user-agent') || 'unknown',
        sessionId: sessionToken || 'unknown',
        metadata: {
          endpoint: '/api/admin/users/[id]',
          method: 'PUT',
          validationErrors: validationResult.error.errors,
          submittedData: body,
        },
        severity: 'medium',
        success: false,
        errorMessage: 'Ошибка валидации данных',
      });

      return NextResponse.json({
        success: false,
        error: 'Ошибка валидации',
        details: validationResult.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      }, { status: 400 });
    }

    const validatedData = validationResult.data;
    console.log('📝 PUT: Валидированные данные:', validatedData);

    // Получаем текущего пользователя из Convex
    console.log('🔍 PUT: Получаем данные пользователя из Convex...');
    const currentUser = await convex.query("users:getUserById", { 
      userId: id as any 
    });

    if (!currentUser) {
      console.log('❌ PUT: Пользователь не найден в Convex');
      
      await logAuditEvent({
        action: 'user.update.not_found',
        entityType: 'user',
        entityId: id,
        performedBy: sessionData!.user.id,
        ip: getClientIP(request),
        userAgent: request.headers.get('user-agent') || 'unknown',
        sessionId: sessionToken || 'unknown',
        metadata: {
          endpoint: '/api/admin/users/[id]',
          method: 'PUT',
          reason: 'User not found in database',
        },
        severity: 'medium',
        success: false,
        errorMessage: 'Пользователь не найден',
      });

      return NextResponse.json({ 
        success: false, 
        error: 'Пользователь не найден' 
      }, { status: 404 });
    }

    console.log('👤 PUT: Данные обновляемого пользователя:', {
      id: currentUser._id,
      name: currentUser.name,
      role: currentUser.role,
      email: currentUser.email
    });

    // Бизнес-логика проверок
    const businessLogicChecks = [
      {
        condition: validatedData.role && validatedData.role !== currentUser.role,
        checks: [
          {
            condition: currentUser.role === 'super-admin',
            error: 'Нельзя изменить роль супер-админа'
          },
          {
            condition: validatedData.role === 'admin' && sessionData!.user.role !== 'super-admin',
            error: 'Только супер-админ может назначать админов'
          },
          {
            condition: validatedData.role === 'super-admin',
            error: 'Нельзя назначить роль супер-админа'
          }
        ]
      },
      {
        condition: id === sessionData!.user.id && validatedData.isActive === false,
        checks: [
          {
            condition: true,
            error: 'Нельзя деактивировать самого себя'
          }
        ]
      }
    ];

    // Выполняем проверки
    for (const check of businessLogicChecks) {
      if (check.condition) {
        for (const subCheck of check.checks || []) {
          if (subCheck.condition) {
            console.log('❌ PUT: Бизнес-логика:', subCheck.error);
            
            await logAuditEvent({
              action: 'user.update.business_rule_violation',
              entityType: 'user',
              entityId: id,
              performedBy: sessionData!.user.id,
              ip: getClientIP(request),
              userAgent: request.headers.get('user-agent') || 'unknown',
              sessionId: sessionToken || 'unknown',
              metadata: {
                endpoint: '/api/admin/users/[id]',
                method: 'PUT',
                businessRule: subCheck.error,
                attemptedChanges: validatedData,
                currentUserData: {
                  role: currentUser.role,
                  isActive: currentUser.isActive,
                },
              },
              severity: 'high',
              success: false,
              errorMessage: subCheck.error,
            });

            return NextResponse.json({
              success: false,
              error: subCheck.error
            }, { status: 403 });
          }
        }
      }
    }

    // Проверка уникальности email
    if (validatedData.email && validatedData.email !== currentUser.email) {
      console.log('🔍 PUT: Проверяем уникальность email...');
      const emailExists = await convex.query("users:checkEmailExists", {
        email: validatedData.email,
        excludeUserId: id as any
      });
      
      if (emailExists) {
        console.log('❌ PUT: Email уже используется');
        
        await logAuditEvent({
          action: 'user.update.email_conflict',
          entityType: 'user',
          entityId: id,
          performedBy: sessionData!.user.id,
          ip: getClientIP(request),
          userAgent: request.headers.get('user-agent') || 'unknown',
          sessionId: sessionToken || 'unknown',
          metadata: {
            endpoint: '/api/admin/users/[id]',
            method: 'PUT',
            conflictingEmail: validatedData.email,
            reason: 'Email already in use',
          },
          severity: 'medium',
          success: false,
          errorMessage: 'Email уже используется',
        });

        return NextResponse.json({
          success: false,
          error: 'Email уже используется другим пользователем'
        }, { status: 409 });
      }
    }

    // Подготавливаем обновления
    const updates: any = {};
    Object.entries(validatedData).forEach(([key, value]) => {
      if (value !== undefined) {
        if (key === 'password' && typeof value === 'string' && value.trim()) {
          updates[key] = value;
        } else if (key !== 'password') {
          updates[key] = value;
        }
      }
    });

    const changedFields = getChangedFields(currentUser, updates);
    const severity = determineSeverity('user.update', changedFields);
    
    const oldValues = {
      name: currentUser.name,
      email: currentUser.email,
      role: currentUser.role,
      isActive: currentUser.isActive,
      photoUrl: currentUser.photoUrl,
    };

    console.log('📝 PUT: Финальные обновления:', updates);

    // Обновляем пользователя через Convex
    console.log('💾 PUT: Обновляем пользователя через Convex...');
    const updatedUser = await convex.mutation("users:updateUser", {
      userId: id as any,
      updates
    });

    console.log('✅ PUT: Пользователь успешно обновлен в Convex');

    // Успешный аудит
    await logAuditEvent({
      action: 'user.update',
      entityType: 'user',
      entityId: id,
      performedBy: sessionData!.user.id,
      ip: getClientIP(request),
      userAgent: request.headers.get('user-agent') || 'unknown',
      sessionId: sessionToken || 'unknown',
      oldValues,
      newValues: updates,
      changedFields,
      metadata: {
        endpoint: '/api/admin/users/[id]',
        method: 'PUT',
        timestamp: new Date().toISOString(),
        updatedBy: {
          id: sessionData!.user.id,
          name: sessionData!.user.name,
          role: sessionData!.user.role,
        },
        targetUser: {
          id: currentUser._id,
          name: currentUser.name,
          email: currentUser.email,
        },
      },
      severity,
      success: true,
    });

    console.log('✅ PUT: Пользователь успешно обновлен и залогирован в аудит');

    return NextResponse.json({
      success: true,
      message: 'Пользователь обновлен успешно',
      user: updatedUser
    });

  } catch (error) {
    console.error('❌ PUT: КРИТИЧЕСКАЯ ошибка:', error);
    console.error('❌ PUT: Стек ошибки:', error instanceof Error ? error.stack : 'Нет стека');

    // Аудит ошибки
    await logAuditEvent({
      action: 'user.update.error',
      entityType: 'user',
      entityId: id,
      performedBy: sessionData?.user?.id || 'unknown',
      ip: getClientIP(request),
      userAgent: request.headers.get('user-agent') || 'unknown',
      sessionId: sessionToken || 'unknown',
      metadata: {
        endpoint: '/api/admin/users/[id]',
        method: 'PUT',
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString(),
      },
      severity: 'critical',
      success: false,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
    });
    
    return NextResponse.json({
      success: false,
      error: process.env.NODE_ENV === 'development' 
        ? (error instanceof Error ? error.message : 'Неизвестная ошибка')
        : 'Внутренняя ошибка сервера'
    }, { status: 500 });
  }
}

// ==================== GET - ПОЛУЧЕНИЕ ПОЛЬЗОВАТЕЛЯ ====================
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  let sessionToken: string | undefined;
  let sessionData: any = null;
  
  try {
    console.log('🔍 GET /api/admin/users/[id] - получение пользователя:', id);
    
    // Валидация ID
    if (!id || typeof id !== 'string' || id.trim() === '') {
      await logAuditEvent({
        action: 'user.read.failed',
        entityType: 'user',
        entityId: id || 'unknown',
        performedBy: 'unknown',
        ip: getClientIP(request),
        userAgent: request.headers.get('user-agent') || 'unknown',
        sessionId: 'unknown',
        metadata: {
          endpoint: '/api/admin/users/[id]',
          method: 'GET',
          reason: 'Invalid user ID',
        },
        severity: 'low',
        success: false,
        errorMessage: 'Неверный ID пользователя',
      });

      return NextResponse.json({
        success: false,
        error: 'Неверный ID пользователя'
      }, { status: 400 });
    }

    // Получаем JWT токен
    const sessionId = request.cookies.get('session_id')?.value;
    const authToken = request.cookies.get('auth_token')?.value;
    const sessionIdDebug = request.cookies.get('session_id_debug')?.value;
    sessionToken = sessionId || authToken || sessionIdDebug;

    // ✅ ИСПРАВЛЕНИЕ: Проверка авторизации с JWT
    const { error: authError, sessionData: authSessionData } = await checkAuthorization(request);
    sessionData = authSessionData;
    
    if (authError) {
      await logAuditEvent({
        action: 'user.read.unauthorized',
        entityType: 'user',
        entityId: id,
        performedBy: 'unknown',
        ip: getClientIP(request),
        userAgent: request.headers.get('user-agent') || 'unknown',
        sessionId: sessionToken || 'unknown',
        metadata: {
          endpoint: '/api/admin/users/[id]',
          method: 'GET',
          reason: 'JWT token invalid or expired',
        },
        severity: 'medium',
        success: false,
        errorMessage: 'JWT токен недействителен',
      });
      return authError;
    }
    
    // Проверка прав доступа
    if (!checkPermissions(sessionData!.user.role, ['super-admin', 'admin', 'manager'])) {
      await logAuditEvent({
        action: 'user.read.forbidden',
        entityType: 'user',
        entityId: id,
        performedBy: sessionData!.user.id,
        ip: getClientIP(request),
        userAgent: request.headers.get('user-agent') || 'unknown',
        sessionId: sessionToken || 'unknown',
        metadata: {
          endpoint: '/api/admin/users/[id]',
          method: 'GET',
          userRole: sessionData!.user.role,
          reason: 'Insufficient permissions',
        },
        severity: 'medium',
        success: false,
        errorMessage: 'Недостаточно прав',
      });

      return NextResponse.json({ 
        success: false, 
        error: 'Недостаточно прав' 
      }, { status: 403 });
    }

    const user = await convex.query("users:getUserById", { 
      userId: id as any 
    });

    if (!user) {
      await logAuditEvent({
        action: 'user.read.not_found',
        entityType: 'user',
        entityId: id,
        performedBy: sessionData!.user.id,
        ip: getClientIP(request),
        userAgent: request.headers.get('user-agent') || 'unknown',
        sessionId: sessionToken || 'unknown',
        metadata: {
          endpoint: '/api/admin/users/[id]',
          method: 'GET',
          reason: 'User not found in database',
        },
        severity: 'low',
        success: false,
        errorMessage: 'Пользователь не найден',
      });

      return NextResponse.json({ 
        success: false, 
        error: 'Пользователь не найден' 
      }, { status: 404 });
    }

    console.log('✅ GET: Пользователь найден:', user.name);

    // Успешный аудит чтения
    await logAuditEvent({
      action: 'user.read',
      entityType: 'user',
      entityId: id,
      performedBy: sessionData!.user.id,
      ip: getClientIP(request),
      userAgent: request.headers.get('user-agent') || 'unknown',
      sessionId: sessionToken || 'unknown',
      metadata: {
        endpoint: '/api/admin/users/[id]',
        method: 'GET',
        timestamp: new Date().toISOString(),
        accessedBy: {
          id: sessionData!.user.id,
          name: sessionData!.user.name,
          role: sessionData!.user.role,
        },
        accessedUser: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      severity: 'low',
      success: true,
    });

    // Убираем пароль из ответа
    const { password, ...safeUser } = user;

    return NextResponse.json({
      success: true,
      user: safeUser
    });

  } catch (error) {
    console.error('❌ GET: Ошибка получения пользователя:', error);
    
    await logAuditEvent({
      action: 'user.read.error',
      entityType: 'user',
      entityId: id,
      performedBy: sessionData?.user?.id || 'unknown',
      ip: getClientIP(request),
      userAgent: request.headers.get('user-agent') || 'unknown',
      sessionId: sessionToken || 'unknown',
      metadata: {
        endpoint: '/api/admin/users/[id]',
        method: 'GET',
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      },
      severity: 'high',
      success: false,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
    });

    return NextResponse.json({
      success: false,
      error: 'Ошибка получения пользователя'
    }, { status: 500 });
  }
}

// ==================== DELETE - УДАЛЕНИЕ ПОЛЬЗОВАТЕЛЯ ====================
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  let sessionToken: string | undefined;
  let sessionData: any = null;
  
  try {
    console.log('🗑️ DELETE /api/admin/users/[id] - удаление пользователя:', id);
    
    // Валидация ID
    if (!id || typeof id !== 'string' || id.trim() === '') {
      await logAuditEvent({
        action: 'user.delete.failed',
        entityType: 'user',
        entityId: id || 'unknown',
        performedBy: 'unknown',
        ip: getClientIP(request),
        userAgent: request.headers.get('user-agent') || 'unknown',
        sessionId: 'unknown',
        metadata: {
          endpoint: '/api/admin/users/[id]',
          method: 'DELETE',
          reason: 'Invalid user ID',
        },
        severity: 'medium',
        success: false,
        errorMessage: 'Неверный ID пользователя',
      });

      return NextResponse.json({
        success: false,
        error: 'Неверный ID пользователя'
      }, { status: 400 });
    }

    // Получаем JWT токен
    const sessionId = request.cookies.get('session_id')?.value;
    const authToken = request.cookies.get('auth_token')?.value;
    const sessionIdDebug = request.cookies.get('session_id_debug')?.value;
    sessionToken = sessionId || authToken || sessionIdDebug;

    // ✅ ИСПРАВЛЕНИЕ: Проверка авторизации с JWT
    const { error: authError, sessionData: authSessionData } = await checkAuthorization(request);
    sessionData = authSessionData;
    
    if (authError) {
      await logAuditEvent({
        action: 'user.delete.unauthorized',
        entityType: 'user',
        entityId: id,
        performedBy: 'unknown',
        ip: getClientIP(request),
        userAgent: request.headers.get('user-agent') || 'unknown',
        sessionId: sessionToken || 'unknown',
        metadata: {
          endpoint: '/api/admin/users/[id]',
          method: 'DELETE',
          reason: 'JWT token invalid or expired',
        },
        severity: 'high',
        success: false,
        errorMessage: 'JWT токен недействителен',
      });
      return authError;
    }
    
    // Проверка прав доступа (только супер-админ и админ могут удалять)
    if (!checkPermissions(sessionData!.user.role, ['super-admin', 'admin'])) {
      await logAuditEvent({
        action: 'user.delete.forbidden',
        entityType: 'user',
        entityId: id,
        performedBy: sessionData!.user.id,
        ip: getClientIP(request),
        userAgent: request.headers.get('user-agent') || 'unknown',
        sessionId: sessionToken || 'unknown',
        metadata: {
          endpoint: '/api/admin/users/[id]',
          method: 'DELETE',
          userRole: sessionData!.user.role,
          reason: 'Insufficient permissions for deletion',
        },
        severity: 'high',
        success: false,
        errorMessage: 'Недостаточно прав для удаления',
      });

      return NextResponse.json({ 
        success: false, 
        error: 'Недостаточно прав для удаления' 
      }, { status: 403 });
    }

    const user = await convex.query("users:getUserById", { 
      userId: id as any 
    });

    if (!user) {
      await logAuditEvent({
        action: 'user.delete.not_found',
        entityType: 'user',
        entityId: id,
        performedBy: sessionData!.user.id,
        ip: getClientIP(request),
        userAgent: request.headers.get('user-agent') || 'unknown',
        sessionId: sessionToken || 'unknown',
        metadata: {
          endpoint: '/api/admin/users/[id]',
          method: 'DELETE',
          reason: 'User not found in database',
        },
        severity: 'medium',
        success: false,
        errorMessage: 'Пользователь не найден',
      });

      return NextResponse.json({ 
        success: false, 
        error: 'Пользователь не найден' 
      }, { status: 404 });
    }

    // Бизнес-логика проверок для удаления
    if (user.role === 'super-admin') {
      await logAuditEvent({
        action: 'user.delete.super_admin_protection',
        entityType: 'user',
        entityId: id,
        performedBy: sessionData!.user.id,
        ip: getClientIP(request),
        userAgent: request.headers.get('user-agent') || 'unknown',
        sessionId: sessionToken || 'unknown',
        metadata: {
          endpoint: '/api/admin/users/[id]',
          method: 'DELETE',
          reason: 'Attempted to delete super-admin',
          targetUser: {
            name: user.name,
            email: user.email,
            role: user.role,
          },
        },
        severity: 'critical',
        success: false,
        errorMessage: 'Нельзя удалить супер-админа',
      });

      return NextResponse.json({ 
        success: false,
        error: 'Нельзя удалить супер-админа' 
      }, { status: 403 });
    }

    if (id === sessionData!.user.id) {
      await logAuditEvent({
        action: 'user.delete.self_deletion_attempt',
        entityType: 'user',
        entityId: id,
        performedBy: sessionData!.user.id,
        ip: getClientIP(request),
        userAgent: request.headers.get('user-agent') || 'unknown',
        sessionId: sessionToken || 'unknown',
        metadata: {
          endpoint: '/api/admin/users/[id]',
          method: 'DELETE',
          reason: 'Attempted self-deletion',
        },
        severity: 'high',
        success: false,
        errorMessage: 'Нельзя удалить самого себя',
      });

      return NextResponse.json({ 
        success: false,
        error: 'Нельзя удалить самого себя' 
      }, { status: 403 });
    }

    // Удаляем пользователя
    await convex.mutation("users:deleteUser", {
      id: id as any
    });

    console.log('✅ DELETE: Пользователь удален:', user.name);

    // Успешный аудит удаления
    await logAuditEvent({
      action: 'user.delete',
      entityType: 'user',
      entityId: id,
      performedBy: sessionData!.user.id,
      ip: getClientIP(request),
      userAgent: request.headers.get('user-agent') || 'unknown',
      sessionId: sessionToken || 'unknown',
      oldValues: {
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        photoUrl: user.photoUrl,
      },
      metadata: {
        endpoint: '/api/admin/users/[id]',
        method: 'DELETE',
        timestamp: new Date().toISOString(),
        deletedBy: {
          id: sessionData!.user.id,
          name: sessionData!.user.name,
          role: sessionData!.user.role,
        },
        deletedUser: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
        },
      },
      severity: 'critical',
      success: true,
    });

    return NextResponse.json({
      success: true,
      message: 'Пользователь удален успешно'
    });

  } catch (error) {
    console.error('❌ DELETE: Ошибка удаления пользователя:', error);
    
    // Аудит ошибки удаления
    await logAuditEvent({
      action: 'user.delete.error',
      entityType: 'user',
      entityId: id,
      performedBy: sessionData?.user?.id || 'unknown',
      ip: getClientIP(request),
      userAgent: request.headers.get('user-agent') || 'unknown',
      sessionId: sessionToken || 'unknown',
      metadata: {
        endpoint: '/api/admin/users/[id]',
        method: 'DELETE',
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString(),
      },
      severity: 'critical',
      success: false,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
    });

    return NextResponse.json({
      success: false,
      error: 'Ошибка удаления пользователя'
    }, { status: 500 });
  }
}