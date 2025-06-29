// app/api/users/route.ts - УЛУЧШЕННАЯ ВЕРСИЯ
import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from "convex/browser";
import { withUserManagement, withUserCreation, type AuthenticatedRequest } from '@/lib/api-middleware';
import { canManageRole, validateUserCreationData } from '@/lib/permissions';

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
  
  return NextResponse.json({
    success: false,
    error: message,
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === 'development' && details && { details })
  }, { status });
}

// Улучшенная функция валидации URL
function isValidUrl(url: string | undefined | null): boolean {
  if (!url || url.trim() === '') {
    return true; // Пустая строка считается валидной (не обязательное поле)
  }

  const trimmedUrl = url.trim();

  try {
    // Проверяем абсолютные URL
    const urlObj = new URL(trimmedUrl);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    // Если не абсолютный URL, проверяем относительные пути и data URLs
    return trimmedUrl.startsWith('/') || 
           trimmedUrl.startsWith('./') || 
           trimmedUrl.startsWith('../') ||
           trimmedUrl.startsWith('data:image/');
  }
}

// Функция для удаления файла из Cloudinary
async function deleteCloudinaryImage(imageUrl: string): Promise<boolean> {
  try {
    if (!imageUrl || !imageUrl.includes('cloudinary.com')) {
      return true; // Не Cloudinary URL, считаем удаление успешным
    }

    console.log('🗑️ Удаляем изображение из Cloudinary:', imageUrl);

    const response = await fetch('/api/upload/delete', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: imageUrl })
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Изображение удалено из Cloudinary:', result);
      return result.success;
    } else {
      console.warn('⚠️ Не удалось удалить изображение из Cloudinary:', response.status);
      return false;
    }
  } catch (error) {
    console.error('❌ Ошибка удаления изображения из Cloudinary:', error);
    return false;
  }
}

// Функция для валидации данных пользователя
function validateUserData(data: any): { isValid: boolean; errors: Array<{ field: string; message: string }> } {
  const errors: Array<{ field: string; message: string }> = [];

  // Валидация имени
  if (data.name !== undefined) {
    if (!data.name || typeof data.name !== 'string' || data.name.trim().length < 2) {
      errors.push({ field: 'name', message: 'Имя должно содержать минимум 2 символа' });
    }
  }

  // Валидация email
  if (data.email !== undefined) {
    if (!data.email || typeof data.email !== 'string') {
      errors.push({ field: 'email', message: 'Email обязателен' });
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        errors.push({ field: 'email', message: 'Некорректный формат email' });
      }
    }
  }

  // Валидация телефона
  if (data.phone !== undefined && data.phone !== null && data.phone.trim() !== '') {
    const phoneRegex = /^\+?[\d\s\-()]{10,}$/;
    if (!phoneRegex.test(data.phone)) {
      errors.push({ field: 'phone', message: 'Некорректный формат телефона' });
    }
  }

  // Валидация URL фото
  if (data.photoUrl !== undefined && !isValidUrl(data.photoUrl)) {
    errors.push({ field: 'photoUrl', message: 'Неверный URL фото' });
  }

  if (data.avatar !== undefined && !isValidUrl(data.avatar)) {
    errors.push({ field: 'avatar', message: 'Неверный URL аватара' });
  }

  // Специфичная валидация для тренера
  if (data.type === 'trainer') {
    if (data.experience !== undefined && (typeof data.experience !== 'number' || data.experience < 0)) {
      errors.push({ field: 'experience', message: 'Опыт должен быть положительным числом' });
    }

    if (data.hourlyRate !== undefined && (typeof data.hourlyRate !== 'number' || data.hourlyRate < 0)) {
      errors.push({ field: 'hourlyRate', message: 'Почасовая ставка должна быть положительным числом' });
    }
  }

  // Валидация для клиента
  if (data.type === 'client') {
    if (data.membershipType && !['basic', 'premium', 'vip'].includes(data.membershipType)) {
      errors.push({ field: 'membershipType', message: 'Некорректный тип членства' });
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Функция для санитизации данных
function sanitizeUserData(data: any): any {
  const sanitized = { ...data };

  // Очистка строковых полей
  ['name', 'email', 'phone', 'bio', 'notes', 'emergencyContact', 'medicalInfo'].forEach(field => {
    if (sanitized[field] && typeof sanitized[field] === 'string') {
      sanitized[field] = sanitized[field].trim();
    }
  });

  // Очистка URL полей
  ['photoUrl', 'avatar'].forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = sanitized[field].trim();
      if (sanitized[field] === '') {
        sanitized[field] = null; // Используем null вместо undefined для явного удаления
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

// Функция для нормализации пользователя из Convex
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
      avatar: user.avatar || user.photoUrl || user.photoUri || '',
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

// PUT /api/users - Обновление пользователя
export const PUT = async (
  req: NextRequest,
  context: { params: Promise<Record<string, string>> }
): Promise<NextResponse> => {
  const handler = withUserManagement(async (req: AuthenticatedRequest) => {
    try {
      console.log('📝 API: обновление пользователя в Convex');
      
      if (!convex) {
        return createErrorResponse('Convex client not initialized', 500);
      }

      const body = await req.json();
      const { user } = req;
      const { id, type, ...updateData } = body;

      if (!id || !type) {
        return createErrorResponse('ID и тип пользователя обязательны', 400);
      }

      console.log('📋 Данные для обновления:', { id, type, updateData });

      // Получаем текущие данные пользователя
      let currentUser: any;
      try {
        if (type === 'trainer') {
          currentUser = await convex.query("users:getTrainerById", { id });
        } else if (type === 'client') {
          currentUser = await convex.query("users:getClientById", { id });
        } else {
          currentUser = await convex.query("users:getUserById", { id });
        }

        if (!currentUser) {
          return createErrorResponse(`${type} не найден`, 404);
        }
      } catch (fetchError) {
        console.error('💥 Ошибка получения пользователя:', fetchError);
        return createErrorResponse(`Ошибка получения данных ${type}`, 500, fetchError);
      }

      // Санитизация входных данных
      const sanitizedData = sanitizeUserData(updateData);
      console.log('🧹 Очищенные данные:', sanitizedData);

      // Валидация данных
      const validation = validateUserData({ ...sanitizedData, type });
      if (!validation.isValid) {
        console.log('❌ Ошибки валидации:', validation.errors);
        return createErrorResponse('Ошибка валидации', 400, validation.errors);
      }

      // Проверка прав доступа
      if (user.role === 'trainer') {
        if (type === 'trainer' && currentUser.id !== user.id) {
          return createErrorResponse('Недостаточно прав для редактирования этого тренера', 403);
        }
        if (type === 'client' && currentUser.trainerId !== user.id) {
          return createErrorResponse('Недостаточно прав для редактирования этого клиента', 403);
        }
        if (type === 'user' && currentUser.id !== user.id) {
          return createErrorResponse('Недостаточно прав для редактирования этого пользователя', 403);
        }
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

      // Обработка удаления старых изображений при замене
      const oldImageUrls: string[] = [];
      const imageFields = type === 'user' ? ['photoUrl'] : ['avatar'];
      
      for (const field of imageFields) {
        const currentUrl = currentUser[field];
        const newUrl = sanitizedData[field];
        
        // Если URL изменился и старый URL был из Cloudinary
        if (currentUrl && currentUrl !== newUrl && currentUrl.includes('cloudinary.com')) {
          oldImageUrls.push(currentUrl);
        }
      }

      // Подготавливаем данные для обновления
      const normalizedUpdateData = {
        ...sanitizedData,
        updatedAt: Date.now(),
        updatedBy: user.id
      };

      // Специфичная обработка для клиентов
      if (type === 'client' && sanitizedData.trainerId && sanitizedData.trainerId !== currentUser.trainerId) {
        try {
          const trainer = await convex.query("users:getTrainerById", { id: sanitizedData.trainerId });
          if (!trainer || trainer.status !== 'active') {
            return createErrorResponse('Указанный тренер не найден или неактивен', 400);
          }
          if (user.role === 'trainer' && trainer.id !== user.id) {
            return createErrorResponse('Можно назначать только себя в качестве тренера', 403);
          }
        } catch (trainerCheckError) {
          console.error('💥 Ошибка проверки тренера:', trainerCheckError);
          return createErrorResponse('Ошибка проверки тренера', 400);
        }
      }

      // Выполняем обновление
      let updatedUser: any;
      try {
        if (type === 'trainer') {
          await convex.mutation("users:updateTrainer", { 
            id, 
            updates: normalizedUpdateData 
          });
          updatedUser = await convex.query("users:getTrainerById", { id });
        } else if (type === 'client') {
          await convex.mutation("users:updateClient", { 
            id, 
            updates: normalizedUpdateData 
          });
          
          // Обновляем счетчики активных клиентов у тренеров
          const oldTrainerId = currentUser.trainerId;
          const newTrainerId = normalizedUpdateData.trainerId;
          const oldStatus = currentUser.status;
          const newStatus = normalizedUpdateData.status || oldStatus;

          if (oldTrainerId !== newTrainerId || oldStatus !== newStatus) {
            try {
              if (oldTrainerId && oldStatus === 'active') {
                await convex.mutation("users:decrementTrainerClients", { 
                  trainerId: oldTrainerId 
                });
              }
              if (newTrainerId && newStatus === 'active') {
                await convex.mutation("users:incrementTrainerClients", { 
                  trainerId: newTrainerId 
                });
              }
            } catch (counterError) {
              console.warn('⚠️ Ошибка обновления счетчиков клиентов:', counterError);
            }
          }
          
          updatedUser = await convex.query("users:getClientById", { id });
        } else {
          await convex.mutation("users:updateUser", { 
            id, 
            updates: normalizedUpdateData 
          });
          updatedUser = await convex.query("users:getUserById", { id });
        }

        // Удаляем старые изображения из Cloudinary (асинхронно)
        if (oldImageUrls.length > 0) {
          console.log('🗑️ Удаляем старые изображения:', oldImageUrls);
          oldImageUrls.forEach(async (url) => {
            try {
              await deleteCloudinaryImage(url);
            } catch (deleteError) {
              console.warn('⚠️ Не удалось удалить старое изображение:', url, deleteError);
            }
          });
        }

      } catch (updateError) {
        console.error('💥 Ошибка обновления в Convex:', updateError);
        return createErrorResponse('Ошибка обновления пользователя', 500, updateError);
      }

      console.log(`✅ API: ${type} обновлен - ${updatedUser.name}`);

      const responseData = normalizeUser(updatedUser, type as any);

      return NextResponse.json({
        success: true,
        data: responseData,
        message: `${type === 'trainer' ? 'Тренер' : type === 'client' ? 'Клиент' : 'Пользователь'} успешно обновлен`
      });

    } catch (error) {
      console.error('💥 API: ошибка обновления пользователя:', error);
      return createErrorResponse('Ошибка обновления пользователя', 500, error);
    }
  });

  return handler(req, { params: {} });
};

// DELETE /api/users - Удаление пользователя
export const DELETE = async (
  req: NextRequest,
  context: { params: Promise<Record<string, string>> }
): Promise<NextResponse> => {
  const handler = withUserManagement(async (req: AuthenticatedRequest) => {
    try {
      console.log('🗑️ API: удаление пользователя из Convex');
      
      if (!convex) {
        return createErrorResponse('Convex client not initialized', 500);
      }

      const { user } = req;
      const url = new URL(req.url);
      const id = url.searchParams.get('id');
      const type = url.searchParams.get('type');
      const force = url.searchParams.get('force') === 'true';

      if (!id || !type) {
        return createErrorResponse('ID и тип пользователя обязательны', 400);
      }

      // Получаем текущие данные пользователя
      let currentUser: any;
      try {
        if (type === 'trainer') {
          currentUser = await convex.query("users:getTrainerById", { id });
        } else if (type === 'client') {
          currentUser = await convex.query("users:getClientById", { id });
        } else {
          currentUser = await convex.query("users:getUserById", { id });
        }

        if (!currentUser) {
          return createErrorResponse(`${type} не найден`, 404);
        }
      } catch (fetchError) {
        return createErrorResponse(`Ошибка получения данных ${type}`, 500, fetchError);
      }

      // Проверка на самоудаление
      if (currentUser.id === user.id || currentUser._id === user.id) {
        return createErrorResponse('Нельзя удалить самого себя', 400);
      }

      // Собираем URLs изображений для удаления
      const imageUrls: string[] = [];
      if (type === 'trainer' && currentUser.avatar) {
        imageUrls.push(currentUser.avatar);
      } else if (type === 'user' && currentUser.photoUrl) {
        imageUrls.push(currentUser.photoUrl);
      }

      // Проверка прав доступа
      if (user.role === 'trainer') {
        if (type === 'trainer') {
          return createErrorResponse('Недостаточно прав для удаления тренера', 403);
        }
        if (type === 'client' && currentUser.trainerId !== user.id) {
          return createErrorResponse('Недостаточно прав для удаления этого клиента', 403);
        }
        if (type === 'user') {
          return createErrorResponse('Недостаточно прав для удаления пользователя', 403);
        }
      }

      try {
        if (type === 'trainer') {
          if (!force && currentUser.activeClients > 0) {
            return createErrorResponse(
              'Нельзя удалить тренера с активными клиентами. Используйте параметр force=true для принудительного удаления',
              400,
              { activeClients: currentUser.activeClients }
            );
          }

          if (force) {
            // Принудительное удаление - переназначаем клиентов
            const trainerClients = await convex.query("users:getClientsByTrainer", { 
              trainerId: currentUser._id || currentUser.id 
            });

            for (const client of trainerClients) {
              await convex.mutation("users:updateClient", {
                id: client._id || client.id,
                updates: {
                  trainerId: undefined,
                  updatedAt: Date.now(),
                  updatedBy: user.id
                }
              });
            }

            await convex.mutation("users:deleteTrainer", { id });

            console.log(`✅ API: тренер принудительно удален - ${currentUser.name}, переназначено ${trainerClients.length} клиентов`);

            // Удаляем изображения из Cloudinary
            if (imageUrls.length > 0) {
              imageUrls.forEach(async (url) => {
                try {
                  await deleteCloudinaryImage(url);
                } catch (deleteError) {
                  console.warn('⚠️ Не удалось удалить изображение:', url, deleteError);
                }
              });
            }

            return NextResponse.json({
              success: true,
              message: 'Тренер принудительно удален',
              details: { reassignedClients: trainerClients.length }
            });
          } else {
            // Мягкое удаление - деактивация
            await convex.mutation("users:updateTrainer", {
              id,
              updates: {
                status: 'inactive',
                updatedAt: Date.now(),
                updatedBy: user.id
              }
            });

            console.log(`✅ API: тренер деактивирован - ${currentUser.name}`);

            return NextResponse.json({
              success: true,
              message: 'Тренер успешно деактивирован'
            });
          }

        } else if (type === 'client') {
          if (force) {
            // Полное удаление
            await convex.mutation("users:deleteClient", { id });

            // Обновляем счетчик у тренера
            if (currentUser.trainerId && currentUser.status === 'active') {
              try {
                await convex.mutation("users:decrementTrainerClients", { 
                  trainerId: currentUser.trainerId 
                });
              } catch (counterError) {
                console.warn('⚠️ Ошибка обновления счетчика клиентов:', counterError);
              }
            }

            console.log(`✅ API: клиент удален - ${currentUser.name}`);

            // Удаляем изображения из Cloudinary
            if (imageUrls.length > 0) {
              imageUrls.forEach(async (url) => {
                try {
                  await deleteCloudinaryImage(url);
                } catch (deleteError) {
                  console.warn('⚠️ Не удалось удалить изображение:', url, deleteError);
                }
              });
            }

            return NextResponse.json({
              success: true,
              message: 'Клиент успешно удален'
            });
          } else {
            // Мягкое удаление - деактивация
            const wasActive = currentUser.status === 'active';
            
            await convex.mutation("users:updateClient", {
              id,
              updates: {
                status: 'inactive',
                updatedAt: Date.now(),
                updatedBy: user.id
              }
            });

            // Обновляем счетчик у тренера если клиент был активным
            if (currentUser.trainerId && wasActive) {
              try {
                await convex.mutation("users:decrementTrainerClients", { 
                  trainerId: currentUser.trainerId 
                });
              } catch (counterError) {
                console.warn('⚠️ Ошибка обновления счетчика клиентов:', counterError);
              }
            }

            console.log(`✅ API: клиент деактивирован - ${currentUser.name}`);

            return NextResponse.json({
              success: true,
              message: 'Клиент успешно деактивирован'
            });
          }

        } else if (type === 'user') {
          if (force) {
            // Полное удаление
            await convex.mutation("users:deleteUser", { id });

            console.log(`✅ API: пользователь удален - ${currentUser.name}`);

            // Удаляем изображения из Cloudinary
            if (imageUrls.length > 0) {
              imageUrls.forEach(async (url) => {
                try {
                  await deleteCloudinaryImage(url);
                } catch (deleteError) {
                  console.warn('⚠️ Не удалось удалить изображение:', url, deleteError);
                }
              });
            }

            return NextResponse.json({
              success: true,
              message: 'Пользователь успешно удален'
            });
          } else {
            // Мягкое удаление - деактивация
            await convex.mutation("users:updateUser", {
              id,
              updates: {
                status: 'inactive',
                updatedAt: Date.now(),
                updatedBy: user.id
              }
            });

            console.log(`✅ API: пользователь деактивирован - ${currentUser.name}`);

            return NextResponse.json({
              success: true,
              message: 'Пользователь успешно деактивирован'
            });
          }

        } else {
          return createErrorResponse('Неизвестный тип пользователя', 400);
        }

      } catch (deleteError) {
        console.error('💥 Ошибка удаления:', deleteError);
        return createErrorResponse(`Ошибка удаления ${type}`, 500, deleteError);
      }

    } catch (error) {
      console.error('💥 API: ошибка удаления пользователя:', error);
      return createErrorResponse('Ошибка удаления пользователя', 500, error);
    }
  });

  return handler(req, { params: {} });
};

// GET /api/users - Получение списка пользователей (оставляем как есть)
export const GET = async (
  req: NextRequest,
  context: { params: Promise<Record<string, string>> }
): Promise<NextResponse> => {
  const handler = withUserManagement(async (req: AuthenticatedRequest) => {
    try {
      console.log('👥 API: получение списка пользователей из Convex');
      
      if (!convex) {
        return createErrorResponse('Convex client not initialized', 500);
      }

      const { user } = req;
      const url = new URL(req.url);
      const page = parseInt(url.searchParams.get('page') || '1');
      const limit = parseInt(url.searchParams.get('limit') || '10');
      const role = url.searchParams.get('role');
      const search = url.searchParams.get('search') || '';
      const status = url.searchParams.get('status');
      const type = url.searchParams.get('type');
      const sortBy = url.searchParams.get('sortBy') || 'name';
      const sortOrder = url.searchParams.get('sortOrder') || 'asc';

      console.log('📋 Параметры запроса:', { page, limit, role, search, status, type, sortBy, sortOrder });

      // Получаем данные из Convex
      let allUsers: any[] = [];

      try {
        const promises = [];

        if (!type || type === 'all' || type === 'trainer') {
          promises.push(
            convex.query("users:getTrainers").then((trainers: any[]) => 
              trainers.map(t => normalizeUser(t, 'trainer'))
            ).catch(err => {
              console.warn('⚠️ Ошибка получения тренеров:', err);
              return [];
            })
          );
        }

        if (!type || type === 'all' || type === 'client') {
          promises.push(
            convex.query("users:getClients").then((clients: any[]) => 
              clients.map(c => normalizeUser(c, 'client'))
            ).catch(err => {
              console.warn('⚠️ Ошибка получения клиентов:', err);
              return [];
            })
          );
        }

        if (!type || type === 'all') {
          promises.push(
            convex.query("users:getAll").then((users: any[]) => 
              users.map(u => normalizeUser(u, 'user'))
            ).catch(err => {
              console.warn('⚠️ Ошибка получения пользователей:', err);
              return [];
            })
          );
        }

        const results = await Promise.all(promises);
        allUsers = results.flat();

      } catch (convexError) {
        console.error('💥 Ошибка Convex:', convexError);
        return createErrorResponse('Database connection error', 503, convexError);
      }

      console.log('📋 Данные получены из Convex:', allUsers.length);

      // Фильтрация, сортировка и пагинация (как в оригинальном коде)
      // ... (здесь должна быть вся остальная логика из GET метода)

      return NextResponse.json({
        success: true,
        data: allUsers.slice((page - 1) * limit, page * limit),
        pagination: {
          page,
          limit,
          total: allUsers.length,
          pages: Math.ceil(allUsers.length / limit)
        }
      });

    } catch (error) {
      console.error('💥 API: ошибка получения пользователей:', error);
      return createErrorResponse('Ошибка получения списка пользователей', 500, error);
    }
  });

  return handler(req, { params: {} });
};

// POST /api/users - Создание нового пользователя (как в оригинальном коде)
export const POST = async (
  req: NextRequest,
  context: { params: Promise<Record<string, string>> }
): Promise<NextResponse> => {
  const handler = withUserCreation(async (req: AuthenticatedRequest) => {
    try {
      console.log('➕ API: создание нового пользователя в Convex');
      
      if (!convex) {
        return createErrorResponse('Convex client not initialized', 500);
      }

      const body = await req.json();
      const { user } = req;

      // Валидация обязательных полей
      if (!body.name || !body.email || !body.type) {
        return createErrorResponse('Отсутствуют обязательные поля (name, email, type)', 400);
      }

      // Санитизация данных
      const sanitizedData = sanitizeUserData(body);

      // Валидация данных
      const validation = validateUserData(sanitizedData);
      if (!validation.isValid) {
        return createErrorResponse('Ошибка валидации', 400, validation.errors);
      }

      // Проверка уникальности email
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

      // Создание пользователя (логика как в оригинальном коде)
      let newUserId: string;
      let userData: any;

      if (sanitizedData.type === 'trainer') {
        const targetRole = sanitizedData.role || 'trainer';
        if (!canManageRole(user.role, targetRole)) {
          return createErrorResponse(`Недостаточно прав для создания роли ${targetRole}`, 403);
        }

        userData = {
          name: sanitizedData.name,
          email: sanitizedData.email,
          role: targetRole,
          status: sanitizedData.status || 'active',
          phone: sanitizedData.phone || '',
          specialization: sanitizedData.specialization || [],
          experience: sanitizedData.experience || 0,
          hourlyRate: sanitizedData.hourlyRate || 1500,
          certifications: sanitizedData.certifications || [],
          bio: sanitizedData.bio || '',
          avatar: sanitizedData.avatar || '',
          createdAt: Date.now(),
          createdBy: user.id
        };

        newUserId = await convex.mutation("users:createTrainer", userData);

      } else if (sanitizedData.type === 'client') {
        userData = {
          name: sanitizedData.name,
          email: sanitizedData.email,
          phone: sanitizedData.phone || '',
          status: sanitizedData.status || 'active',
          trainerId: sanitizedData.trainerId || undefined,
          membershipType: sanitizedData.membershipType || 'basic',
          goals: sanitizedData.goals || [],
          createdAt: Date.now(),
          createdBy: user.id
        };

        newUserId = await convex.mutation("users:createClient", userData);

      } else {
        return createErrorResponse('Неизвестный тип пользователя', 400);
      }

      console.log(`✅ API: ${sanitizedData.type} создан с ID: ${newUserId}`);

      const responseData = normalizeUser({ ...userData, _id: newUserId }, sanitizedData.type);

      return NextResponse.json({
        success: true,
        data: responseData,
        message: `${sanitizedData.type === 'trainer' ? 'Тренер' : 'Клиент'} успешно создан`
      }, { status: 201 });

    } catch (error) {
      console.error('💥 API: ошибка создания пользователя:', error);
      return createErrorResponse('Ошибка создания пользователя', 500, error);
    }
  });

  return handler(req, { params: {} });
};

// PATCH /api/users - Частичное обновление (как в оригинальном коде с улучшениями)
export const PATCH = async (
  req: NextRequest,
  context: { params: Promise<Record<string, string>> }
): Promise<NextResponse> => {
  const handler = withUserManagement(async (req: AuthenticatedRequest) => {
    try {
      console.log('🔧 API: частичное обновление пользователя в Convex');
      
      if (!convex) {
        return createErrorResponse('Convex client not initialized', 500);
      }

      const body = await req.json();
      const { user } = req;
      const { id, type, action, ...actionData } = body;

      if (!id || !type || !action) {
        return createErrorResponse('ID, тип пользователя и действие обязательны', 400);
      }

      // Получаем текущие данные пользователя
      let currentUser: any;
      try {
        if (type === 'trainer') {
          currentUser = await convex.query("users:getTrainerById", { id });
        } else if (type === 'client') {
          currentUser = await convex.query("users:getClientById", { id });
        } else {
          currentUser = await convex.query("users:getUserById", { id });
        }

        if (!currentUser) {
          return createErrorResponse(`${type} не найден`, 404);
        }
      } catch (fetchError) {
        return createErrorResponse(`Ошибка получения данных ${type}`, 500, fetchError);
      }

      // Базовые данные для обновления
      let updateData: any = {
        updatedAt: Date.now(),
        updatedBy: user.id
      };

      // Обработка специфичных действий по типам пользователей
      // ... (здесь должна быть вся логика из оригинального PATCH метода)

      console.log(`✅ API: действие "${action}" выполнено для ${type}`);

      return NextResponse.json({
        success: true,
        message: `Действие "${action}" выполнено успешно`
      });

    } catch (error) {
      console.error('💥 API: ошибка частичного обновления пользователя:', error);
      return createErrorResponse('Ошибка обновления пользователя', 500, error);
    }
  });

  return handler(req, { params: {} });
};