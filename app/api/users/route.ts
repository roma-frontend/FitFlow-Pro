// app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { mockTrainers, mockClients, type Trainer, type Client, normalizeWorkingHours, createDefaultWorkingHours } from '@/lib/mock-data';
import { withUserManagement, withUserCreation, type AuthenticatedRequest } from '@/lib/api-middleware';
import { canManageRole, validateUserCreationData } from '@/lib/permissions';

// Типы для объединенных пользователей
interface TrainerUser extends Trainer {
  type: 'trainer';
}

interface ClientUser extends Client {
  type: 'client';
}

type CombinedUser = TrainerUser | ClientUser;

// GET /api/users - Получение списка пользователей
export const GET = async (
  req: NextRequest,
  context: { params: Promise<Record<string, string>> }
): Promise<NextResponse> => {
  const handler = withUserManagement(async (req: AuthenticatedRequest) => {
    try {
      console.log('👥 API: получение списка пользователей');
      
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

      // Получение всех пользователей (тренеры + клиенты)
      let allUsers: CombinedUser[] = [];

      // Добавляем тренеров если нужно
      if (!type || type === 'all' || type === 'trainer') {
        allUsers.push(...mockTrainers.map(t => ({ ...t, type: 'trainer' as const })));
      }

      // Добавляем клиентов если нужно
      if (!type || type === 'all' || type === 'client') {
        allUsers.push(...mockClients.map(c => ({ ...c, type: 'client' as const })));
      }

      // Фильтрация по роли текущего пользователя
      if (user.role === 'trainer') {
        // Тренеры видят только своих клиентов и себя
        allUsers = allUsers.filter(u => 
          (u.type === 'trainer' && u.id === user.id) ||
          (u.type === 'client' && 'trainerId' in u && u.trainerId === user.id)
        );
      } else if (user.role === 'manager') {
        // Менеджеры не видят администраторов
        allUsers = allUsers.filter(u => {
          if (u.type === 'trainer') {
            return u.role !== 'admin' && u.role !== 'super-admin';
          }
          return true; // Клиенты не имеют роли admin
        });
      }

      // Фильтрация по роли (только для тренеров)
      if (role && role !== 'all') {
        allUsers = allUsers.filter(u => 
          u.type === 'trainer' && 'role' in u && u.role === role
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
          (u.type === 'trainer' && 'specialization' in u && 
           u.specialization.some((spec: string) => spec.toLowerCase().includes(searchLower)))
        );
      }

      // Сортировка
      allUsers.sort((a, b) => {
        let aValue: any = a[sortBy as keyof typeof a];
        let bValue: any = b[sortBy as keyof typeof b];

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
        active: allUsers.filter(u => u.status === 'active').length,
        inactive: allUsers.filter(u => u.status === 'inactive').length,
        suspended: allUsers.filter(u => u.status === 'suspended').length
      };

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
        stats
      });

    } catch (error) {
      console.error('💥 API: ошибка получения пользователей:', error);
      return NextResponse.json(
        { success: false, error: 'Ошибка получения списка пользователей' },
        { status: 500 }
      );
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
      console.log('➕ API: создание нового пользователя');
      
      const body = await req.json();
      const { user } = req;

      // Валидация обязательных полей
      if (!body.name || !body.email || !body.type) {
        return NextResponse.json(
          { success: false, error: 'Отсутствуют обязательные поля (name, email, type)' },
          { status: 400 }
        );
      }

      // Валидация email формата
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(body.email)) {
        return NextResponse.json(
          { success: false, error: 'Некорректный формат email' },
          { status: 400 }
        );
      }

      // Валидация данных
      const validation = validateUserCreationData(body, user.role);
      if (!validation.isValid) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Ошибки валидации', 
            details: validation.errors 
          },
          { status: 400 }
        );
      }

      // Проверка уникальности email
      const allUsers = [...mockTrainers, ...mockClients];
      const existingUser = allUsers.find(u => u.email.toLowerCase() === body.email.toLowerCase());
      if (existingUser) {
        return NextResponse.json(
          { success: false, error: 'Пользователь с таким email уже существует' },
          { status: 409 }
        );
      }

      // Создание пользователя в зависимости от типа
      if (body.type === 'trainer') {
        // Проверка прав на создание роли
        const targetRole = body.role || 'trainer';
        if (!canManageRole(user.role, targetRole)) {
          return NextResponse.json(
            { success: false, error: `Недостаточно прав для создания роли ${targetRole}` },
            { status: 403 }
          );
        }

        const newTrainer: Trainer = {
          id: `trainer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
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
          workingHours: body.workingHours ? normalizeWorkingHours(body.workingHours) : createDefaultWorkingHours(),
          bio: body.bio || '',
          avatar: body.avatar || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: user.id
        };

        mockTrainers.push(newTrainer);

        console.log(`✅ API: тренер создан - ${newTrainer.name} (${newTrainer.role})`);

        return NextResponse.json({
          success: true,
          data: { ...newTrainer, type: 'trainer' },
          message: 'Тренер успешно создан'
        });

      } else if (body.type === 'client') {
        // Проверка существования тренера если указан
        if (body.trainerId) {
          const trainer = mockTrainers.find(t => t.id === body.trainerId && t.status === 'active');
          if (!trainer) {
            return NextResponse.json(
              { success: false, error: 'Указанный тренер не найден или неактивен' },
              { status: 400 }
            );
          }

          // Проверка прав на назначение тренера
          if (user.role === 'trainer' && trainer.id !== user.id) {
            return NextResponse.json(
              { success: false, error: 'Можно назначать только себя в качестве тренера' },
              { status: 403 }
            );
          }
        }

        // Валидация типа членства
        const validMembershipTypes = ['basic', 'premium', 'vip'];
        if (body.membershipType && !validMembershipTypes.includes(body.membershipType)) {
          return NextResponse.json(
            { success: false, error: 'Некорректный тип членства' },
            { status: 400 }
          );
        }

        const newClient: Client = {
          id: `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
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
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: user.id
        };

        mockClients.push(newClient);

        // Обновляем счетчик активных клиентов у тренера
        if (newClient.trainerId && newClient.status === 'active') {
          const trainerIndex = mockTrainers.findIndex(t => t.id === newClient.trainerId);
          if (trainerIndex !== -1) {
            mockTrainers[trainerIndex].activeClients++;
          }
        }

        console.log(`✅ API: клиент создан - ${newClient.name}`);

        return NextResponse.json({
          success: true,
          data: { ...newClient, type: 'client' },
          message: 'Клиент успешно создан'
        });

      } else {
        return NextResponse.json(
          { success: false, error: 'Неизвестный тип пользователя. Допустимые значения: trainer, client' },
          { status: 400 }
        );
      }

    } catch (error) {
      console.error('💥 API: ошибка создания пользователя:', error);
      return NextResponse.json(
        { success: false, error: 'Ошибка создания пользователя' },
        { status: 500 }
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
      console.log('📝 API: обновление пользователя');
      
      const body = await req.json();
      const { user } = req;
      const { id, type, ...updateData } = body;

      if (!id || !type) {
        return NextResponse.json(
          { success: false, error: 'ID и тип пользователя обязательны' },
          { status: 400 }
        );
      }

      if (type === 'trainer') {
        const trainerIndex = mockTrainers.findIndex(t => t.id === id);
                if (trainerIndex === -1) {
          return NextResponse.json(
            { success: false, error: 'Тренер не найден' },
            { status: 404 }
          );
        }

        const trainer = mockTrainers[trainerIndex];

        // Проверка прав доступа
        if (user.role === 'trainer' && trainer.id !== user.id) {
          return NextResponse.json(
            { success: false, error: 'Недостаточно прав для редактирования этого тренера' },
            { status: 403 }
          );
        }

        // Проверка изменения роли
        if (updateData.role && updateData.role !== trainer.role) {
          if (!canManageRole(user.role, updateData.role)) {
            return NextResponse.json(
              { success: false, error: `Недостаточно прав для назначения роли ${updateData.role}` },
              { status: 403 }
            );
          }
        }

        // Проверка уникальности email
        if (updateData.email && updateData.email !== trainer.email) {
          const existingUser = [...mockTrainers, ...mockClients].find(u => 
            u.email.toLowerCase() === updateData.email.toLowerCase() && u.id !== id
          );
          if (existingUser) {
            return NextResponse.json(
              { success: false, error: 'Пользователь с таким email уже существует' },
              { status: 409 }
            );
          }
        }

        // Валидация числовых полей
        if (updateData.experience !== undefined && (isNaN(updateData.experience) || updateData.experience < 0)) {
          return NextResponse.json(
            { success: false, error: 'Опыт работы должен быть положительным числом' },
            { status: 400 }
          );
        }

        if (updateData.hourlyRate !== undefined && (isNaN(updateData.hourlyRate) || updateData.hourlyRate < 0)) {
          return NextResponse.json(
            { success: false, error: 'Почасовая ставка должна быть положительным числом' },
            { status: 400 }
          );
        }

        const updatedTrainer = {
          ...trainer,
          ...updateData,
          id, // ID не должен изменяться
          email: updateData.email ? updateData.email.toLowerCase().trim() : trainer.email,
          name: updateData.name ? updateData.name.trim() : trainer.name,
          workingHours: updateData.workingHours ? normalizeWorkingHours(updateData.workingHours) : trainer.workingHours,
          specialization: Array.isArray(updateData.specialization) 
            ? updateData.specialization.filter((spec: string) => spec && spec.trim())
            : trainer.specialization,
          certifications: Array.isArray(updateData.certifications)
            ? updateData.certifications.filter((cert: string) => cert && cert.trim())
            : trainer.certifications,
          updatedAt: new Date().toISOString(),
          updatedBy: user.id
        };

        mockTrainers[trainerIndex] = updatedTrainer;

        console.log(`✅ API: тренер обновлен - ${updatedTrainer.name}`);

        return NextResponse.json({
          success: true,
          data: { ...updatedTrainer, type: 'trainer' },
          message: 'Тренер успешно обновлен'
        });

      } else if (type === 'client') {
        const clientIndex = mockClients.findIndex(c => c.id === id);
        if (clientIndex === -1) {
          return NextResponse.json(
            { success: false, error: 'Клиент не найден' },
            { status: 404 }
          );
        }

        const client = mockClients[clientIndex];
        const oldTrainerId = client.trainerId;

        // Проверка прав доступа
        if (user.role === 'trainer' && client.trainerId !== user.id) {
          return NextResponse.json(
            { success: false, error: 'Недостаточно прав для редактирования этого клиента' },
            { status: 403 }
          );
        }

        // Проверка существования тренера если указан
        if (updateData.trainerId && updateData.trainerId !== client.trainerId) {
          const trainer = mockTrainers.find(t => t.id === updateData.trainerId && t.status === 'active');
          if (!trainer) {
            return NextResponse.json(
              { success: false, error: 'Указанный тренер не найден или неактивен' },
              { status: 400 }
            );
          }

          // Проверка прав на назначение тренера
          if (user.role === 'trainer' && trainer.id !== user.id) {
            return NextResponse.json(
              { success: false, error: 'Можно назначать только себя в качестве тренера' },
              { status: 403 }
            );
          }
        }

        // Проверка уникальности email
        if (updateData.email && updateData.email !== client.email) {
          const existingUser = [...mockTrainers, ...mockClients].find(u => 
            u.email.toLowerCase() === updateData.email.toLowerCase() && u.id !== id
          );
          if (existingUser) {
            return NextResponse.json(
              { success: false, error: 'Пользователь с таким email уже существует' },
              { status: 409 }
            );
          }
        }

        // Валидация типа членства
        if (updateData.membershipType) {
          const validMembershipTypes = ['basic', 'premium', 'vip'];
          if (!validMembershipTypes.includes(updateData.membershipType)) {
            return NextResponse.json(
              { success: false, error: 'Некорректный тип членства' },
              { status: 400 }
            );
          }
        }

        const updatedClient = {
          ...client,
          ...updateData,
          id, // ID не должен изменяться
          email: updateData.email ? updateData.email.toLowerCase().trim() : client.email,
          name: updateData.name ? updateData.name.trim() : client.name,
          goals: Array.isArray(updateData.goals) ? updateData.goals : client.goals,
          updatedAt: new Date().toISOString(),
          updatedBy: user.id
        };

        mockClients[clientIndex] = updatedClient;

        // Обновляем счетчики активных клиентов у тренеров
        if (oldTrainerId !== updatedClient.trainerId) {
          // Уменьшаем у старого тренера
          if (oldTrainerId && client.status === 'active') {
            const oldTrainerIndex = mockTrainers.findIndex(t => t.id === oldTrainerId);
            if (oldTrainerIndex !== -1) {
              mockTrainers[oldTrainerIndex].activeClients = Math.max(0, mockTrainers[oldTrainerIndex].activeClients - 1);
            }
          }

          // Увеличиваем у нового тренера
          if (updatedClient.trainerId && updatedClient.status === 'active') {
            const newTrainerIndex = mockTrainers.findIndex(t => t.id === updatedClient.trainerId);
            if (newTrainerIndex !== -1) {
              mockTrainers[newTrainerIndex].activeClients++;
            }
          }
        }

        console.log(`✅ API: клиент обновлен - ${updatedClient.name}`);

        return NextResponse.json({
          success: true,
          data: { ...updatedClient, type: 'client' },
          message: 'Клиент успешно обновлен'
        });

      } else {
        return NextResponse.json(
          { success: false, error: 'Неизвестный тип пользователя' },
          { status: 400 }
        );
      }

    } catch (error) {
      console.error('💥 API: ошибка обновления пользователя:', error);
      return NextResponse.json(
        { success: false, error: 'Ошибка обновления пользователя' },
        { status: 500 }
      );
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
      console.log('🗑️ API: удаление пользователя');
      
      const { user } = req;
      const url = new URL(req.url);
      const id = url.searchParams.get('id');
      const type = url.searchParams.get('type');
      const force = url.searchParams.get('force') === 'true';

      if (!id || !type) {
        return NextResponse.json(
          { success: false, error: 'ID и тип пользователя обязательны' },
          { status: 400 }
        );
      }

      if (type === 'trainer') {
        const trainerIndex = mockTrainers.findIndex(t => t.id === id);
        if (trainerIndex === -1) {
          return NextResponse.json(
            { success: false, error: 'Тренер не найден' },
            { status: 404 }
          );
        }

        const trainer = mockTrainers[trainerIndex];

        // Проверка на самоудаление
        if (trainer.id === user.id) {
          return NextResponse.json(
            { success: false, error: 'Нельзя удалить самого себя' },
            { status: 400 }
          );
        }

        // Проверка прав на удаление
        if (user.role === 'trainer') {
          return NextResponse.json(
            { success: false, error: 'Недостаточно прав для удаления тренера' },
            { status: 403 }
          );
        }

        // Проверка активных клиентов (если не принудительное удаление)
        if (!force && trainer.activeClients > 0) {
          return NextResponse.json(
            { 
              success: false, 
              error: 'Нельзя удалить тренера с активными клиентами. Используйте параметр force=true для принудительного удаления',
              details: { activeClients: trainer.activeClients }
            },
            { status: 400 }
          );
        }

        if (force) {
          // Принудительное удаление - переназначаем клиентов
          const trainerClients = mockClients.filter(c => c.trainerId === trainer.id);
          trainerClients.forEach(client => {
            const clientIndex = mockClients.findIndex(c => c.id === client.id);
            if (clientIndex !== -1) {
              mockClients[clientIndex] = {
                ...client,
                trainerId: undefined,
                updatedAt: new Date().toISOString(),
                updatedBy: user.id
              };
            }
          });

          // Полное удаление тренера
          mockTrainers.splice(trainerIndex, 1);

          console.log(`✅ API: тренер принудительно удален - ${trainer.name}, переназначено ${trainerClients.length} клиентов`);

          return NextResponse.json({
            success: true,
            message: 'Тренер принудительно удален',
            details: { reassignedClients: trainerClients.length }
          });
        } else {
          // Мягкое удаление
          mockTrainers[trainerIndex] = {
            ...trainer,
            status: 'inactive',
            updatedAt: new Date().toISOString(),
            updatedBy: user.id
          };

          console.log(`✅ API: тренер деактивирован - ${trainer.name}`);

          return NextResponse.json({
            success: true,
            message: 'Тренер успешно деактивирован'
          });
        }

      } else if (type === 'client') {
        const clientIndex = mockClients.findIndex(c => c.id === id);
        if (clientIndex === -1) {
          return NextResponse.json(
            { success: false, error: 'Клиент не найден' },
            { status: 404 }
          );
        }

        const client = mockClients[clientIndex];

        // Проверка прав доступа
        if (user.role === 'trainer' && client.trainerId !== user.id) {
          return NextResponse.json(
            { success: false, error: 'Недостаточно прав для удаления этого клиента' },
            { status: 403 }
          );
        }

        if (force) {
          // Полное удаление
          mockClients.splice(clientIndex, 1);

          // Обновляем счетчик у тренера
          if (client.trainerId && client.status === 'active') {
            const trainerIndex = mockTrainers.findIndex(t => t.id === client.trainerId);
            if (trainerIndex !== -1) {
              mockTrainers[trainerIndex].activeClients = Math.max(0, mockTrainers[trainerIndex].activeClients - 1);
            }
          }

          console.log(`✅ API: клиент удален - ${client.name}`);

          return NextResponse.json({
            success: true,
            message: 'Клиент успешно удален'
          });
        } else {
          // Мягкое удаление
          const wasActive = client.status === 'active';
          
          mockClients[clientIndex] = {
            ...client,
            status: 'inactive',
            updatedAt: new Date().toISOString(),
            updatedBy: user.id
          };

          // Обновляем счетчик у тренера если клиент был активным
          if (client.trainerId && wasActive) {
            const trainerIndex = mockTrainers.findIndex(t => t.id === client.trainerId);
            if (trainerIndex !== -1) {
              mockTrainers[trainerIndex].activeClients = Math.max(0, mockTrainers[trainerIndex].activeClients - 1);
            }
          }

          console.log(`✅ API: клиент деактивирован - ${client.name}`);

          return NextResponse.json({
            success: true,
            message: 'Клиент успешно деактивирован'
          });
        }

      } else {
        return NextResponse.json(
          { success: false, error: 'Неизвестный тип пользователя' },
          { status: 400 }
        );
      }

    } catch (error) {
      console.error('💥 API: ошибка удаления пользователя:', error);
      return NextResponse.json(
        { success: false, error: 'Ошибка удаления пользователя' },
        { status: 500 }
      );
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
      console.log('🔧 API: частичное обновление пользователя');
      
      const body = await req.json();
      const { user } = req;
      const { id, type, action, ...actionData } = body;

      if (!id || !type || !action) {
        return NextResponse.json(
          { success: false, error: 'ID, тип пользователя и действие обязательны' },
          { status: 400 }
        );
      }

      if (type === 'trainer') {
        const trainerIndex = mockTrainers.findIndex(t => t.id === id);
        if (trainerIndex === -1) {
          return NextResponse.json(
            { success: false, error: 'Тренер не найден' },
            { status: 404 }
          );
        }

        const trainer = mockTrainers[trainerIndex];

        // Проверка прав доступа
        if (user.role === 'trainer' && trainer.id !== user.id) {
          return NextResponse.json(
            { success: false, error: 'Недостаточно прав для редактирования этого тренера' },
            { status: 403 }
          );
        }

        switch (action) {
          case 'activate':
            if (user.role !== 'admin' && user.role !== 'manager') {
              return NextResponse.json(
                { success: false, error: 'Недостаточно прав для активации тренера' },
                { status: 403 }
              );
            }
            trainer.status = 'active';
            break;

          case 'suspend':
            if (user.role !== 'admin' && user.role !== 'manager') {
              return NextResponse.json(
                { success: false, error: 'Недостаточно прав для приостановки тренера' },
                { status: 403 }
              );
            }
            trainer.status = 'suspended';
            break;

          case 'deactivate':
            if (user.role !== 'admin' && user.role !== 'manager') {
              return NextResponse.json(
                { success: false, error: 'Недостаточно прав для деактивации тренера' },
                { status: 403 }
              );
            }
            trainer.status = 'inactive';
            break;

          case 'updateRating':
            if (typeof actionData.rating === 'number' && actionData.rating >= 0 && actionData.rating <= 5) {
              trainer.rating = Math.round(actionData.rating * 10) / 10; // Округляем до 1 знака
            } else {
              return NextResponse.json(
                { success: false, error: 'Некорректное значение рейтинга (должно быть от 0 до 5)' },
                { status: 400 }
              );
            }
            break;

          case 'updateStats':
            if (typeof actionData.activeClients === 'number' && actionData.activeClients >= 0) {
              trainer.activeClients = actionData.activeClients;
            }
            if (typeof actionData.totalSessions === 'number' && actionData.totalSessions >= 0) {
              trainer.totalSessions = actionData.totalSessions;
            }
            break;

          case 'updateHourlyRate':
            if (typeof actionData.hourlyRate === 'number' && actionData.hourlyRate >= 0) {
              trainer.hourlyRate = actionData.hourlyRate;
            } else {
              return NextResponse.json(
                { success: false, error: 'Некорректная почасовая ставка' },
                { status: 400 }
              );
            }
            break;

          case 'addSpecialization':
            if (typeof actionData.specialization === 'string' && actionData.specialization.trim()) {
              if (!trainer.specialization.includes(actionData.specialization)) {
                trainer.specialization.push(actionData.specialization.trim());
              }
            } else {
              return NextResponse.json(
                { success: false, error: 'Некорректная специализация' },
                { status: 400 }
              );
            }
            break;

          case 'removeSpecialization':
            if (typeof actionData.specialization === 'string') {
              trainer.specialization = trainer.specialization.filter(
                spec => spec !== actionData.specialization
              );
            } else {
              return NextResponse.json(
                { success: false, error: 'Некорректная специализация' },
                { status: 400 }
              );
            }
            break;

          case 'addCertification':
            if (typeof actionData.certification === 'string' && actionData.certification.trim()) {
              if (!trainer.certifications.includes(actionData.certification)) {
                trainer.certifications.push(actionData.certification.trim());
              }
            } else {
              return NextResponse.json(
                { success: false, error: 'Некорректное название сертификата' },
                { status: 400 }
              );
            }
            break;

          case 'removeCertification':
            if (typeof actionData.certification === 'string') {
              trainer.certifications = trainer.certifications.filter(
                cert => cert !== actionData.certification
              );
            } else {
              return NextResponse.json(
                { success: false, error: 'Некорректное название сертификата' },
                { status: 400 }
              );
            }
            break;

          case 'updateWorkingHours':
            if (actionData.workingHours) {
              trainer.workingHours = normalizeWorkingHours(actionData.workingHours);
            } else {
              return NextResponse.json(
                { success: false, error: 'Рабочие часы не указаны' },
                { status: 400 }
              );
            }
            break;

          case 'changeRole':
            if (!actionData.newRole) {
              return NextResponse.json(
                { success: false, error: 'Новая роль обязательна' },
                { status: 400 }
              );
            }
            if (!canManageRole(user.role, actionData.newRole)) {
              return NextResponse.json(
                { success: false, error: `Недостаточно прав для назначения роли ${actionData.newRole}` },
                { status: 403 }
              );
            }
            trainer.role = actionData.newRole;
            break;

          case 'resetPassword':
            // В реальном приложении здесь была бы логика сброса пароля
            console.log(`🔑 Сброс пароля для тренера ${trainer.name}`);
            break;

          case 'updateProfile':
            if (actionData.bio !== undefined) trainer.bio = actionData.bio || '';
            if (actionData.avatar !== undefined) trainer.avatar = actionData.avatar || '';
            if (actionData.phone !== undefined) trainer.phone = actionData.phone || '';
            break;

          default:
            return NextResponse.json(
              { success: false, error: 'Неизвестное действие для тренера' },
              { status: 400 }
            );
        }

        trainer.updatedAt = new Date().toISOString();
        trainer.updatedBy = user.id;
        mockTrainers[trainerIndex] = trainer;

        console.log(`✅ API: действие "${action}" выполнено для тренера ${trainer.name}`);

        return NextResponse.json({
          success: true,
          data: { ...trainer, type: 'trainer' },
          message: `Действие "${action}" выполнено успешно`
        });

      } else if (type === 'client') {
        const clientIndex = mockClients.findIndex(c => c.id === id);
        if (clientIndex === -1) {
          return NextResponse.json(
            { success: false, error: 'Клиент не найден' },
            { status: 404 }
          );
        }

        const client = mockClients[clientIndex];
        const oldStatus = client.status;
        const oldTrainerId = client.trainerId;

        // Проверка прав доступа
        if (user.role === 'trainer' && client.trainerId !== user.id) {
          return NextResponse.json(
            { success: false, error: 'Недостаточно прав для редактирования этого клиента' },
            { status: 403 }
          );
        }

        switch (action) {
          case 'activate':
            client.status = 'active';
            break;

          case 'suspend':
            client.status = 'suspended';
            break;

          case 'deactivate':
            client.status = 'inactive';
            break;

          case 'assignTrainer':
            if (actionData.trainerId) {
              const trainer = mockTrainers.find(t => t.id === actionData.trainerId && t.status === 'active');
              if (!trainer) {
                return NextResponse.json(
                  { success: false, error: 'Указанный тренер не найден или неактивен' },
                  { status: 400 }
                );
              }

              // Проверка прав на назначение тренера
              if (user.role === 'trainer' && trainer.id !== user.id) {
                return NextResponse.json(
                  { success: false, error: 'Можно назначать только себя в качестве тренера' },
                  { status: 403 }
                );
              }

              client.trainerId = actionData.trainerId;
            } else {
              client.trainerId = undefined;
            }
            break;

          case 'updateMembership':
            const validMembershipTypes = ['basic', 'premium', 'vip'];
            if (validMembershipTypes.includes(actionData.membershipType)) {
              client.membershipType = actionData.membershipType;
            } else {
              return NextResponse.json(
                { success: false, error: 'Некорректный тип членства' },
                { status: 400 }
              );
            }
            break;

          case 'updateStats':
            if (typeof actionData.totalSessions === 'number' && actionData.totalSessions >= 0) {
              client.totalSessions = actionData.totalSessions;
            }
            break;

          case 'updateGoals':
            if (Array.isArray(actionData.goals)) {
              client.goals = actionData.goals.filter((goal: string) => goal && goal.trim());
            } else {
              return NextResponse.json(
                { success: false, error: 'Цели должны быть массивом строк' },
                { status: 400 }
              );
            }
            break;

          case 'updateNotes':
            client.notes = actionData.notes || '';
            break;

          case 'updateEmergencyContact':
            client.emergencyContact = actionData.emergencyContact || '';
            break;

          case 'updateMedicalInfo':
            client.medicalInfo = actionData.medicalInfo || '';
            break;

          case 'updateProfile':
            if (actionData.phone !== undefined) client.phone = actionData.phone || '';
            if (actionData.emergencyContact !== undefined) client.emergencyContact = actionData.emergencyContact || '';
            break;

          case 'resetPassword':
            // В реальном приложении здесь была бы логика сброса пароля
            console.log(`🔑 Сброс пароля для клиента ${client.name}`);
            break;

          default:
            return NextResponse.json(
              { success: false, error: 'Неизвестное действие для клиента' },
              { status: 400 }
            );
        }

        client.updatedAt = new Date().toISOString();
        client.updatedBy = user.id;
        mockClients[clientIndex] = client;

        // Обновляем счетчики активных клиентов у тренеров при изменении статуса или тренера
        if (oldStatus !== client.status || oldTrainerId !== client.trainerId) {
          // Уменьшаем у старого тренера
          if (oldTrainerId && oldStatus === 'active') {
            const oldTrainerIndex = mockTrainers.findIndex(t => t.id === oldTrainerId);
            if (oldTrainerIndex !== -1) {
              mockTrainers[oldTrainerIndex].activeClients = Math.max(0, mockTrainers[oldTrainerIndex].activeClients - 1);
            }
          }

          // Увеличиваем у нового тренера
          if (client.trainerId && client.status === 'active') {
            const newTrainerIndex = mockTrainers.findIndex(t => t.id === client.trainerId);
            if (newTrainerIndex !== -1) {
              mockTrainers[newTrainerIndex].activeClients++;
            }
          }
        }

        console.log(`✅ API: действие "${action}" выполнено для клиента ${client.name}`);

        return NextResponse.json({
          success: true,
          data: { ...client, type: 'client' },
          message: `Действие "${action}" выполнено успешно`
        });

      } else {
        return NextResponse.json(
          { success: false, error: 'Неизвестный тип пользователя' },
          { status: 400 }
        );
      }

    } catch (error) {
      console.error('💥 API: ошибка частичного обновления пользователя:', error);
      return NextResponse.json(
        { success: false, error: 'Ошибка обновления пользователя' },
        { status: 500 }
      );
    }
  });

  return handler(req, { params: {} });
};

