// app/api/users/route.ts
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

// GET /api/users - Получение списка пользователей
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
      const type = url.searchParams.get('type'); // 'trainer', 'client', 'all'
      const sortBy = url.searchParams.get('sortBy') || 'name';
      const sortOrder = url.searchParams.get('sortOrder') || 'asc';

      console.log('📋 Параметры запроса:', { page, limit, role, search, status, type, sortBy, sortOrder });

      // Получаем данные из Convex
      let allUsers: any[] = [];

      try {
        // Параллельно получаем данные из разных таблиц
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

      // Фильтрация по роли текущего пользователя
      if (user.role === 'trainer') {
        // Тренеры видят только своих клиентов и себя
        allUsers = allUsers.filter(u => 
          (u.type === 'trainer' && u.id === user.id) ||
          (u.type === 'client' && u.trainerId === user.id) ||
          (u.type === 'user' && u.id === user.id)
        );
      } else if (user.role === 'manager') {
        // Менеджеры не видят администраторов
        allUsers = allUsers.filter(u => {
          if (u.type === 'trainer' || u.type === 'user') {
            return u.role !== 'admin' && u.role !== 'super-admin';
          }
          return true; // Клиенты не имеют роли admin
        });
      }

      // Фильтрация по роли
      if (role && role !== 'all') {
        allUsers = allUsers.filter(u => 
          (u.type === 'trainer' || u.type === 'user') && u.role === role
        );
      }

      // Фильтрация по статусу
      if (status && status !== 'all') {
        allUsers = allUsers.filter(u => u.status === status);
      }

      // Поиск
      if (search) {
        const searchLower = search.toLowerCase();
        allUsers = allUsers.filter(u =>
          u.name.toLowerCase().includes(searchLower) ||
          u.email.toLowerCase().includes(searchLower) ||
          (u.type === 'trainer' && u.specialization && 
           u.specialization.some((spec: string) => spec.toLowerCase().includes(searchLower)))
        );
      }

      // Сортировка
      allUsers.sort((a, b) => {
        let aValue: any = a[sortBy as keyof typeof a];
        let bValue: any = b[sortBy as keyof typeof b];

        // Обработка undefined значений
        if (aValue === undefined) aValue = '';
        if (bValue === undefined) bValue = '';

        // Специальная обработка для числовых полей
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
        }

        // Для строковых полей
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
          return sortOrder === 'asc' 
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }

        // Для дат
        if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
          const aDate = new Date(aValue || 0).getTime();
          const bDate = new Date(bValue || 0).getTime();
          return sortOrder === 'asc' ? aDate - bDate : bDate - aDate;
        }

        return 0;
      });

      // Пагинация
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedUsers = allUsers.slice(startIndex, endIndex);

      // Статистика
      const stats = {
        total: allUsers.length,
        trainers: allUsers.filter(u => u.type === 'trainer').length,
        clients: allUsers.filter(u => u.type === 'client').length,
        users: allUsers.filter(u => u.type === 'user').length,
        active: allUsers.filter(u => u.status === 'active').length,
        inactive: allUsers.filter(u => u.status === 'inactive').length,
        suspended: allUsers.filter(u => u.status === 'suspended').length
      };

      console.log('✅ Возвращаем пользователей:', paginatedUsers.length, 'из', allUsers.length);

      return NextResponse.json({
        success: true,
        data: paginatedUsers,
        pagination: {
          page,
          limit,
          total: allUsers.length,
          pages: Math.ceil(allUsers.length / limit),
          hasMore: endIndex < allUsers.length
        },
        filters: {
          role,
          search,
          status,
          type,
          sortBy,
          sortOrder
        },
        stats,
        meta: {
          timestamp: new Date().toISOString(),
          userRole: user.role,
          canCreate: ['super-admin', 'admin', 'manager'].includes(user.role)
        }
      });

    } catch (error) {
      console.error('💥 API: ошибка получения пользователей:', error);
      return createErrorResponse('Ошибка получения списка пользователей', 500, error);
    }
  });

  return handler(req, { params: {} });
};

// POST /api/users - Создание нового пользователя
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

      // Валидация email формата
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(body.email)) {
        return createErrorResponse('Некорректный формат email', 400);
      }

      // Валидация данных
      const validation = validateUserCreationData(body, user.role);
      if (!validation.isValid) {
        return createErrorResponse('Ошибки валидации', 400, validation.errors);
      }

      // Проверка уникальности email через Convex
      try {
        const existingUser = await convex.query("users:getUserByEmail", { email: body.email.toLowerCase() });
        if (existingUser) {
          return createErrorResponse('Пользователь с таким email уже существует', 409);
        }
      } catch (emailCheckError) {
        console.warn('⚠️ Ошибка проверки email:', emailCheckError);
      }

      // Создание пользователя в зависимости от типа
      let newUserId: string;
      let userData: any;

      if (body.type === 'trainer') {
        // Проверка прав на создание роли
        const targetRole = body.role || 'trainer';
        if (!canManageRole(user.role, targetRole)) {
          return createErrorResponse(`Недостаточно прав для создания роли ${targetRole}`, 403);
        }

        userData = {
          name: body.name.trim(),
          email: body.email.toLowerCase().trim(),
          role: targetRole,
          status: body.status || 'active',
          phone: body.phone || '',
          specialization: Array.isArray(body.specialization) 
            ? body.specialization.filter((spec: string) => spec && spec.trim())
            : [],
          experience: typeof body.experience === 'number' ? Math.max(0, body.experience) : 0,
          rating: 0,
          activeClients: 0,
          totalSessions: 0,
          hourlyRate: typeof body.hourlyRate === 'number' ? Math.max(0, body.hourlyRate) : 1500,
          certifications: Array.isArray(body.certifications) 
            ? body.certifications.filter((cert: string) => cert && cert.trim())
            : [],
          workingHours: body.workingHours || {},
          bio: body.bio || '',
          avatar: body.avatar || '',
          createdAt: Date.now(),
          createdBy: user.id
        };

        newUserId = await convex.mutation("users:createTrainer", userData);

      } else if (body.type === 'client') {
        // Проверка существования тренера если указан
        if (body.trainerId) {
          try {
            const trainer = await convex.query("users:getTrainerById", { id: body.trainerId });
            if (!trainer || trainer.status !== 'active') {
              return createErrorResponse('Указанный тренер не найден или неактивен', 400);
            }

            // Проверка прав на назначение тренера
            if (user.role === 'trainer' && trainer.id !== user.id) {
              return createErrorResponse('Можно назначать только себя в качестве тренера', 403);
            }
          } catch (trainerCheckError) {
            return createErrorResponse('Ошибка проверки тренера', 400);
          }
        }

        // Валидация типа членства
        const validMembershipTypes = ['basic', 'premium', 'vip'];
        if (body.membershipType && !validMembershipTypes.includes(body.membershipType)) {
          return createErrorResponse('Некорректный тип членства', 400);
        }

        userData = {
          name: body.name.trim(),
          email: body.email.toLowerCase().trim(),
          phone: body.phone || '',
          status: body.status || 'active',
          trainerId: body.trainerId || undefined,
          membershipType: body.membershipType || 'basic',
          joinDate: body.joinDate || new Date().toISOString().split('T')[0],
          totalSessions: 0,
          notes: body.notes || '',
          emergencyContact: body.emergencyContact || '',
          medicalInfo: body.medicalInfo || '',
          goals: Array.isArray(body.goals) ? body.goals : [],
          createdAt: Date.now(),
          createdBy: user.id
        };

        newUserId = await convex.mutation("users:createClient", userData);

        // Обновляем счетчик активных клиентов у тренера
        if (userData.trainerId && userData.status === 'active') {
          try {
            await convex.mutation("users:incrementTrainerClients", { 
              trainerId: userData.trainerId 
            });
          } catch (incrementError) {
            console.warn('⚠️ Ошибка обновления счетчика клиентов:', incrementError);
          }
        }

      } else if (body.type === 'user') {
        // Проверка прав на создание роли
        const targetRole = body.role || 'user';
        if (!canManageRole(user.role, targetRole)) {
          return createErrorResponse(`Недостаточно прав для создания роли ${targetRole}`, 403);
        }

        userData = {
          name: body.name.trim(),
          email: body.email.toLowerCase().trim(),
          role: targetRole,
          phone: body.phone || '',
          status: body.status || 'active',
          isVerified: body.isVerified || false,
          photoUrl: body.photoUrl || body.avatar || '',
          createdAt: Date.now(),
          createdBy: user.id
        };

        // Если указан пароль, добавляем его
        if (body.password) {
          userData.password = body.password;
        }

        newUserId = await convex.mutation("users:create", userData);

      } else {
        return createErrorResponse('Неизвестный тип пользователя. Допустимые значения: trainer, client, user', 400);
      }

      console.log(`✅ API: ${body.type} создан с ID: ${newUserId}`);

      const responseData = normalizeUser({ ...userData, _id: newUserId }, body.type);

      return NextResponse.json({
        success: true,
        data: responseData,
        message: `${body.type === 'trainer' ? 'Тренер' : body.type === 'client' ? 'Клиент' : 'Пользователь'} успешно создан`
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
  });

  return handler(req, { params: {} });
};

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
      if (updateData.role && updateData.role !== currentUser.role) {
        if (!canManageRole(user.role, updateData.role)) {
          return createErrorResponse(`Недостаточно прав для назначения роли ${updateData.role}`, 403);
        }
      }

      // Проверка уникальности email
      if (updateData.email && updateData.email !== currentUser.email) {
        try {
          const existingUser = await convex.query("users:getUserByEmail", { 
            email: updateData.email.toLowerCase() 
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
        ...updateData,
        email: updateData.email ? updateData.email.toLowerCase().trim() : undefined,
        name: updateData.name ? updateData.name.trim() : undefined,
        updatedAt: Date.now(),
        updatedBy: user.id
      };

      // Специфичная валидация для каждого типа
      if (type === 'trainer') {
        if (updateData.experience !== undefined && (isNaN(updateData.experience) || updateData.experience < 0)) {
          return createErrorResponse('Опыт работы должен быть положительным числом', 400);
        }
        if (updateData.hourlyRate !== undefined && (isNaN(updateData.hourlyRate) || updateData.hourlyRate < 0)) {
          return createErrorResponse('Почасовая ставка должна быть положительным числом', 400);
        }
        if (updateData.specialization && Array.isArray(updateData.specialization)) {
          normalizedUpdateData.specialization = updateData.specialization.filter((spec: string) => spec && spec.trim());
        }
        if (updateData.certifications && Array.isArray(updateData.certifications)) {
          normalizedUpdateData.certifications = updateData.certifications.filter((cert: string) => cert && cert.trim());
        }
      } else if (type === 'client') {
        // Проверка существования тренера если указан
        if (updateData.trainerId && updateData.trainerId !== currentUser.trainerId) {
          try {
            const trainer = await convex.query("users:getTrainerById", { id: updateData.trainerId });
            if (!trainer || trainer.status !== 'active') {
              return createErrorResponse('Указанный тренер не найден или неактивен', 400);
            }
            if (user.role === 'trainer' && trainer.id !== user.id) {
              return createErrorResponse('Можно назначать только себя в качестве тренера', 403);
            }
          } catch (trainerCheckError) {
            return createErrorResponse('Ошибка проверки тренера', 400);
          }
        }

        if (updateData.membershipType) {
          const validMembershipTypes = ['basic', 'premium', 'vip'];
          if (!validMembershipTypes.includes(updateData.membershipType)) {
            return createErrorResponse('Некорректный тип членства', 400);
          }
        }

        if (updateData.goals && Array.isArray(updateData.goals)) {
          normalizedUpdateData.goals = updateData.goals.filter((goal: string) => goal && goal.trim());
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
        } else if (type === 'client') {
          await convex.mutation("users:updateClient", { 
            id, 
            updates: normalizedUpdateData 
          });
          
          // Обновляем счетчики активных клиентов у тренеров при изменении тренера или статуса
          const oldTrainerId = currentUser.trainerId;
          const newTrainerId = normalizedUpdateData.trainerId;
          const oldStatus = currentUser.status;
          const newStatus = normalizedUpdateData.status || oldStatus;

          if (oldTrainerId !== newTrainerId || oldStatus !== newStatus) {
            try {
              // Уменьшаем у старого тренера
              if (oldTrainerId && oldStatus === 'active') {
                await convex.mutation("users:decrementTrainerClients", { 
                  trainerId: oldTrainerId 
                });
              }
              // Увеличиваем у нового тренера
              if (newTrainerId && newStatus === 'active') {
                await convex.mutation("users:incrementTrainerClients", { 
                  trainerId: newTrainerId 
                });
              }
            } catch (counterError) {
              console.warn('⚠️ Ошибка обновления счетчиков клиентов:', counterError);
            }
          }
        } else {
          await convex.mutation("users:updateUser", { 
            id, 
            updates: normalizedUpdateData 
          });
        }

        // Получаем обновленные данные
        if (type === 'trainer') {
          updatedUser = await convex.query("users:getTrainerById", { id });
        } else if (type === 'client') {
          updatedUser = await convex.query("users:getClientById", { id });
        } else {
          updatedUser = await convex.query("users:getUserById", { id });
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

      if (type === 'trainer') {
        // Проверка активных клиентов (если не принудительное удаление)
        if (!force && currentUser.activeClients > 0) {
          return createErrorResponse(
            'Нельзя удалить тренера с активными клиентами. Используйте параметр force=true для принудительного удаления',
            400,
            { activeClients: currentUser.activeClients }
          );
        }

        try {
          if (force) {
            // Принудительное удаление - переназначаем клиентов
            const trainerClients = await convex.query("users:getClientsByTrainer", { 
              trainerId: currentUser._id || currentUser.id 
            });

            // Убираем тренера у всех клиентов
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

            // Полное удаление тренера
            await convex.mutation("users:deleteTrainer", { id });

            console.log(`✅ API: тренер принудительно удален - ${currentUser.name}, переназначено ${trainerClients.length} клиентов`);

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
        } catch (deleteError) {
          console.error('💥 Ошибка удаления тренера:', deleteError);
          return createErrorResponse('Ошибка удаления тренера', 500, deleteError);
        }

      } else if (type === 'client') {
        try {
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
        } catch (deleteError) {
          console.error('💥 Ошибка удаления клиента:', deleteError);
          return createErrorResponse('Ошибка удаления клиента', 500, deleteError);
        }

      } else if (type === 'user') {
        try {
          if (force) {
            // Полное удаление
            await convex.mutation("users:deleteUser", { id });

            console.log(`✅ API: пользователь удален - ${currentUser.name}`);

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
        } catch (deleteError) {
          console.error('💥 Ошибка удаления пользователя:', deleteError);
          return createErrorResponse('Ошибка удаления пользователя', 500, deleteError);
        }

      } else {
        return createErrorResponse('Неизвестный тип пользователя', 400);
      }

    } catch (error) {
      console.error('💥 API: ошибка удаления пользователя:', error);
      return createErrorResponse('Ошибка удаления пользователя', 500, error);
    }
  });

  return handler(req, { params: {} });
};

// PATCH /api/users - Частичное обновление пользователя (смена статуса, назначение тренера и т.д.)
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

      // Проверка прав доступа
      if (user.role === 'trainer') {
        if (type === 'trainer' && currentUser._id !== user.id && currentUser.id !== user.id) {
          return createErrorResponse('Недостаточно прав для редактирования этого тренера', 403);
        }
        if (type === 'client' && currentUser.trainerId !== user.id) {
          return createErrorResponse('Недостаточно прав для редактирования этого клиента', 403);
        }
        if (type === 'user' && currentUser._id !== user.id && currentUser.id !== user.id) {
          return createErrorResponse('Недостаточно прав для редактирования этого пользователя', 403);
        }
      }

      let updateData: any = {
        updatedAt: Date.now(),
        updatedBy: user.id
      };

      if (type === 'trainer') {
        switch (action) {
          case 'activate':
            if (!['admin', 'manager', 'super-admin'].includes(user.role)) {
              return createErrorResponse('Недостаточно прав для активации тренера', 403);
            }
            updateData.status = 'active';
            break;

          case 'suspend':
            if (!['admin', 'manager', 'super-admin'].includes(user.role)) {
              return createErrorResponse('Недостаточно прав для приостановки тренера', 403);
            }
            updateData.status = 'suspended';
            break;

          case 'deactivate':
            if (!['admin', 'manager', 'super-admin'].includes(user.role)) {
              return createErrorResponse('Недостаточно прав для деактивации тренера', 403);
            }
            updateData.status = 'inactive';
            break;

          case 'updateRating':
            if (typeof actionData.rating === 'number' && actionData.rating >= 0 && actionData.rating <= 5) {
              updateData.rating = Math.round(actionData.rating * 10) / 10;
            } else {
              return createErrorResponse('Некорректное значение рейтинга (должно быть от 0 до 5)', 400);
            }
            break;

          case 'updateStats':
            if (typeof actionData.activeClients === 'number' && actionData.activeClients >= 0) {
              updateData.activeClients = actionData.activeClients;
            }
            if (typeof actionData.totalSessions === 'number' && actionData.totalSessions >= 0) {
              updateData.totalSessions = actionData.totalSessions;
            }
            break;

          case 'updateHourlyRate':
            if (typeof actionData.hourlyRate === 'number' && actionData.hourlyRate >= 0) {
              updateData.hourlyRate = actionData.hourlyRate;
            } else {
              return createErrorResponse('Некорректная почасовая ставка', 400);
            }
            break;

          case 'updateSpecializations':
            if (Array.isArray(actionData.specialization)) {
              updateData.specialization = actionData.specialization.filter((spec: string) => spec && spec.trim());
            } else {
              return createErrorResponse('Специализации должны быть массивом строк', 400);
            }
            break;

          case 'updateCertifications':
            if (Array.isArray(actionData.certifications)) {
              updateData.certifications = actionData.certifications.filter((cert: string) => cert && cert.trim());
            } else {
              return createErrorResponse('Сертификаты должны быть массивом строк', 400);
            }
            break;

          case 'updateWorkingHours':
            if (actionData.workingHours && typeof actionData.workingHours === 'object') {
              updateData.workingHours = actionData.workingHours;
            } else {
              return createErrorResponse('Рабочие часы не указаны или имеют неверный формат', 400);
            }
            break;

          case 'changeRole':
            if (!actionData.newRole) {
              return createErrorResponse('Новая роль обязательна', 400);
            }
            if (!canManageRole(user.role, actionData.newRole)) {
              return createErrorResponse(`Недостаточно прав для назначения роли ${actionData.newRole}`, 403);
            }
            updateData.role = actionData.newRole;
            break;

          case 'updateProfile':
            if (actionData.bio !== undefined) updateData.bio = actionData.bio || '';
            if (actionData.avatar !== undefined) updateData.avatar = actionData.avatar || '';
            if (actionData.phone !== undefined) updateData.phone = actionData.phone || '';
            if (actionData.name !== undefined) updateData.name = actionData.name?.trim() || currentUser.name;
            break;

          case 'resetPassword':
            // В реальном приложении здесь была бы логика сброса пароля
            console.log(`🔑 Сброс пароля для тренера ${currentUser.name}`);
            // Можно добавить мутацию для сброса пароля
            try {
              await convex.mutation("users:resetTrainerPassword", { id });
            } catch (resetError) {
              console.warn('⚠️ Ошибка сброса пароля:', resetError);
            }
            break;

          default:
            return createErrorResponse('Неизвестное действие для тренера', 400);
        }

        try {
          await convex.mutation("users:updateTrainer", { id, updates: updateData });
          const updatedTrainer = await convex.query("users:getTrainerById", { id });
          
          console.log(`✅ API: действие "${action}" выполнено для тренера ${updatedTrainer.name}`);

          return NextResponse.json({
            success: true,
            data: normalizeUser(updatedTrainer, 'trainer'),
            message: `Действие "${action}" выполнено успешно`
          });
        } catch (updateError) {
          console.error('💥 Ошибка обновления тренера:', updateError);
          return createErrorResponse('Ошибка обновления тренера', 500, updateError);
        }

      } else if (type === 'client') {
        const oldStatus = currentUser.status;
        const oldTrainerId = currentUser.trainerId;

        switch (action) {
          case 'activate':
            updateData.status = 'active';
            break;

          case 'suspend':
            updateData.status = 'suspended';
            break;

          case 'deactivate':
            updateData.status = 'inactive';
            break;

          case 'assignTrainer':
            if (actionData.trainerId) {
              try {
                const trainer = await convex.query("users:getTrainerById", { id: actionData.trainerId });
                if (!trainer || trainer.status !== 'active') {
                  return createErrorResponse('Указанный тренер не найден или неактивен', 400);
                }

                if (user.role === 'trainer' && trainer._id !== user.id && trainer.id !== user.id) {
                  return createErrorResponse('Можно назначать только себя в качестве тренера', 403);
                }

                updateData.trainerId = actionData.trainerId;
              } catch (trainerError) {
                return createErrorResponse('Ошибка проверки тренера', 400, trainerError);
              }
            } else {
              updateData.trainerId = undefined;
            }
            break;

          case 'updateMembership':
            const validMembershipTypes = ['basic', 'premium', 'vip'];
            if (validMembershipTypes.includes(actionData.membershipType)) {
              updateData.membershipType = actionData.membershipType;
            } else {
              return createErrorResponse('Некорректный тип членства', 400);
            }
            break;

          case 'updateStats':
            if (typeof actionData.totalSessions === 'number' && actionData.totalSessions >= 0) {
              updateData.totalSessions = actionData.totalSessions;
            }
            break;

          case 'updateGoals':
            if (Array.isArray(actionData.goals)) {
              updateData.goals = actionData.goals.filter((goal: string) => goal && goal.trim());
            } else {
              return createErrorResponse('Цели должны быть массивом строк', 400);
            }
            break;

          case 'updateNotes':
            updateData.notes = actionData.notes || '';
            break;

          case 'updateEmergencyContact':
            updateData.emergencyContact = actionData.emergencyContact || '';
            break;

          case 'updateMedicalInfo':
            updateData.medicalInfo = actionData.medicalInfo || '';
            break;

          case 'updateProfile':
            if (actionData.phone !== undefined) updateData.phone = actionData.phone || '';
            if (actionData.emergencyContact !== undefined) updateData.emergencyContact = actionData.emergencyContact || '';
            if (actionData.name !== undefined) updateData.name = actionData.name?.trim() || currentUser.name;
            break;

          case 'resetPassword':
            console.log(`🔑 Сброс пароля для клиента ${currentUser.name}`);
            try {
              await convex.mutation("users:resetClientPassword", { id });
            } catch (resetError) {
              console.warn('⚠️ Ошибка сброса пароля:', resetError);
            }
            break;

          default:
            return createErrorResponse('Неизвестное действие для клиента', 400);
        }

        try {
          await convex.mutation("users:updateClient", { id, updates: updateData });

          // Обновляем счетчики активных клиентов у тренеров при изменении статуса или тренера
          const newStatus = updateData.status || oldStatus;
          const newTrainerId = updateData.trainerId !== undefined ? updateData.trainerId : oldTrainerId;

          if (oldStatus !== newStatus || oldTrainerId !== newTrainerId) {
            try {
              // Уменьшаем у старого тренера
              if (oldTrainerId && oldStatus === 'active') {
                await convex.mutation("users:decrementTrainerClients", { 
                  trainerId: oldTrainerId 
                });
              }
              // Увеличиваем у нового тренера
              if (newTrainerId && newStatus === 'active') {
                await convex.mutation("users:incrementTrainerClients", { 
                  trainerId: newTrainerId 
                });
              }
            } catch (counterError) {
              console.warn('⚠️ Ошибка обновления счетчиков клиентов:', counterError);
            }
          }

          const updatedClient = await convex.query("users:getClientById", { id });

          console.log(`✅ API: действие "${action}" выполнено для клиента ${updatedClient.name}`);

          return NextResponse.json({
            success: true,
            data: normalizeUser(updatedClient, 'client'),
            message: `Действие "${action}" выполнено успешно`
          });
        } catch (updateError) {
          console.error('💥 Ошибка обновления клиента:', updateError);
          return createErrorResponse('Ошибка обновления клиента', 500, updateError);
        }

      } else if (type === 'user') {
        switch (action) {
          case 'activate':
            if (!['admin', 'manager', 'super-admin'].includes(user.role)) {
              return createErrorResponse('Недостаточно прав для активации пользователя', 403);
            }
            updateData.status = 'active';
            break;

          case 'suspend':
            if (!['admin', 'manager', 'super-admin'].includes(user.role)) {
              return createErrorResponse('Недостаточно прав для приостановки пользователя', 403);
            }
            updateData.status = 'suspended';
            break;

          case 'deactivate':
            if (!['admin', 'manager', 'super-admin'].includes(user.role)) {
              return createErrorResponse('Недостаточно прав для деактивации пользователя', 403);
            }
            updateData.status = 'inactive';
            break;

          case 'changeRole':
            if (!actionData.newRole) {
              return createErrorResponse('Новая роль обязательна', 400);
            }
            if (!canManageRole(user.role, actionData.newRole)) {
              return createErrorResponse(`Недостаточно прав для назначения роли ${actionData.newRole}`, 403);
            }
            updateData.role = actionData.newRole;
            break;

          case 'verify':
            if (!['admin', 'manager', 'super-admin'].includes(user.role)) {
              return createErrorResponse('Недостаточно прав для верификации пользователя', 403);
            }
            updateData.isVerified = true;
            break;

          case 'unverify':
            if (!['admin', 'manager', 'super-admin'].includes(user.role)) {
              return createErrorResponse('Недостаточно прав для отмены верификации пользователя', 403);
            }
            updateData.isVerified = false;
            break;

          case 'updateProfile':
            if (actionData.phone !== undefined) updateData.phone = actionData.phone || '';
            if (actionData.photoUrl !== undefined) updateData.photoUrl = actionData.photoUrl || '';
            if (actionData.name !== undefined) updateData.name = actionData.name?.trim() || currentUser.name;
            break;

          case 'resetPassword':
            console.log(`🔑 Сброс пароля для пользователя ${currentUser.name}`);
            try {
              await convex.mutation("users:resetUserPassword", { id });
            } catch (resetError) {
              console.warn('⚠️ Ошибка сброса пароля:', resetError);
            }
            break;

          default:
            return createErrorResponse('Неизвестное действие для пользователя', 400);
        }

        try {
          await convex.mutation("users:updateUser", { id, updates: updateData });
          const updatedUser = await convex.query("users:getUserById", { id });

          console.log(`✅ API: действие "${action}" выполнено для пользователя ${updatedUser.name}`);

          return NextResponse.json({
            success: true,
            data: normalizeUser(updatedUser, 'user'),
            message: `Действие "${action}" выполнено успешно`
          });
        } catch (updateError) {
          console.error('💥 Ошибка обновления пользователя:', updateError);
          return createErrorResponse('Ошибка обновления пользователя', 500, updateError);
        }

      } else {
        return createErrorResponse('Неизвестный тип пользователя', 400);
      }

    } catch (error) {
      console.error('💥 API: ошибка частичного обновления пользователя:', error);
      return createErrorResponse('Ошибка обновления пользователя', 500, error);
    }
  });

  return handler(req, { params: {} });
};

