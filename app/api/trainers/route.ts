// app/api/trainers/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { withTrainerManagement, withPermissions, type AuthenticatedRequest } from '@/lib/api-middleware';
import { canManageRole } from '@/lib/permissions';
import { mockTrainers } from '@/lib/mock-data';

// GET /api/trainers - Получение списка тренеров
export const GET = async (
  req: NextRequest,
  context: { params: Promise<Record<string, string>> }
): Promise<NextResponse> => {
  const handler = withTrainerManagement(async (req: AuthenticatedRequest) => {
    try {
      console.log('📋 API: получение списка тренеров');
      
      const { user } = req;
      const url = new URL(req.url);
      const page = parseInt(url.searchParams.get('page') || '1');
      const limit = parseInt(url.searchParams.get('limit') || '10');
      const search = url.searchParams.get('search') || '';
      const status = url.searchParams.get('status');
      const specialization = url.searchParams.get('specialization');
      const sortBy = url.searchParams.get('sortBy') || 'name';
      const sortOrder = url.searchParams.get('sortOrder') || 'asc';

      // Фильтрация по правам доступа
      let trainers = mockTrainers;
      
      // Тренеры видят только себя
      if (user.role === 'trainer') {
        trainers = trainers.filter(trainer => trainer.id === user.id);
      }
      
      // Поиск
      if (search) {
        trainers = trainers.filter(trainer =>
          trainer.name.toLowerCase().includes(search.toLowerCase()) ||
          trainer.email.toLowerCase().includes(search.toLowerCase()) ||
          trainer.specialization.some(spec => 
            spec.toLowerCase().includes(search.toLowerCase())
          )
        );
      }

      // Фильтрация по статусу
      if (status && status !== 'all') {
        trainers = trainers.filter(trainer => trainer.status === status);
      }

      // Фильтрация по специализации
      if (specialization && specialization !== 'all') {
        trainers = trainers.filter(trainer => 
          trainer.specialization.includes(specialization)
        );
      }

      // Сортировка
      trainers.sort((a, b) => {
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
          if (sortOrder === 'asc') {
            return aValue.localeCompare(bValue);
          } else {
            return bValue.localeCompare(aValue);
          }
        }

        return 0;
      });

      // Пагинация
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedTrainers = trainers.slice(startIndex, endIndex);

      // Статистика для фильтров
      const stats = {
        total: mockTrainers.length,
        active: mockTrainers.filter(t => t.status === 'active').length,
        inactive: mockTrainers.filter(t => t.status === 'inactive').length,
        suspended: mockTrainers.filter(t => t.status === 'suspended').length,
        specializations: [...new Set(mockTrainers.flatMap(t => t.specialization))],
        averageRating: mockTrainers.reduce((sum, t) => sum + t.rating, 0) / mockTrainers.length
      };

      return NextResponse.json({
        success: true,
        data: paginatedTrainers,
        pagination: {
          page,
          limit,
          total: trainers.length,
          pages: Math.ceil(trainers.length / limit),
          hasMore: endIndex < trainers.length
        },
        filters: {
          search,
          status,
          specialization,
          sortBy,
          sortOrder
        },
        stats
      });

    } catch (error) {
      console.error('💥 API: ошибка получения тренеров:', error);
      return NextResponse.json(
        { success: false, error: 'Ошибка получения списка тренеров' },
        { status: 500 }
      );
    }
  });

  return handler(req, { params: {} });
};

// POST /api/trainers - Создание нового тренера
export const POST = async (
  req: NextRequest,
  context: { params: Promise<Record<string, string>> }
): Promise<NextResponse> => {
  const handler = withPermissions(
    { resource: 'trainers', action: 'create' },
    async (req: AuthenticatedRequest) => {
      try {
        console.log('➕ API: создание нового тренера');
        
        const body = await req.json();
        const { user } = req;

        // Валидация данных
        if (!body.name || !body.email) {
          return NextResponse.json(
            { success: false, error: 'Отсутствуют обязательные поля (name, email)' },
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

        // Проверка прав на создание роли
        const targetRole = body.role || 'trainer';
        if (!canManageRole(user.role, targetRole)) {
          return NextResponse.json(
            { success: false, error: `Недостаточно прав для создания роли ${targetRole}` },
            { status: 403 }
          );
        }

        // Проверка уникальности email
        const existingTrainer = mockTrainers.find(t => t.email.toLowerCase() === body.email.toLowerCase());
        if (existingTrainer) {
          return NextResponse.json(
            { success: false, error: 'Тренер с таким email уже существует' },
            { status: 409 }
          );
        }

        // Валидация числовых полей
        if (body.experience !== undefined && (isNaN(body.experience) || body.experience < 0)) {
          return NextResponse.json(
            { success: false, error: 'Опыт работы должен быть положительным числом' },
            { status: 400 }
          );
        }

        if (body.hourlyRate !== undefined && (isNaN(body.hourlyRate) || body.hourlyRate < 0)) {
          return NextResponse.json(
            { success: false, error: 'Почасовая ставка должна быть положительным числом' },
            { status: 400 }
          );
        }

        // Создание нового тренера со всеми обязательными полями
        const newTrainer = {
          id: `trainer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: body.name.trim(),
          email: body.email.toLowerCase().trim(),
          role: targetRole,
          status: body.status || 'active',
          phone: body.phone || '',
          specialization: Array.isArray(body.specialization) 
            ? body.specialization.filter((spec: string) => spec && spec.trim())
            : [],
          experience: typeof body.experience === 'number' ? body.experience : 0,
          rating: 0,
          activeClients: 0,
          totalSessions: 0,
          hourlyRate: typeof body.hourlyRate === 'number' ? body.hourlyRate : 1500,
          certifications: Array.isArray(body.certifications) 
            ? body.certifications.filter((cert: string) => cert && cert.trim())
            : [],
          workingHours: body.workingHours || {
            monday: { start: '09:00', end: '18:00', available: true },
            tuesday: { start: '09:00', end: '18:00', available: true },
            wednesday: { start: '09:00', end: '18:00', available: true },
            thursday: { start: '09:00', end: '18:00', available: true },
            friday: { start: '09:00', end: '18:00', available: true },
            saturday: { start: '10:00', end: '16:00', available: true },
            sunday: { start: '10:00', end: '16:00', available: false }
          },
          bio: body.bio || '',
          avatar: body.avatar || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: user.id
        };

        // Добавление в массив
        mockTrainers.push(newTrainer);

        console.log(`✅ API: тренер создан - ${newTrainer.name} (${newTrainer.email})`);

        return NextResponse.json({
          success: true,
          data: newTrainer,
          message: 'Тренер успешно создан'
        });

      } catch (error) {
        console.error('💥 API: ошибка создания тренера:', error);
        return NextResponse.json(
          { success: false, error: 'Ошибка создания тренера' },
          { status: 500 }
        );
      }
    }
  );

  return handler(req, { params: {} });
};

// PUT /api/trainers - Массовое обновление тренеров
export const PUT = async (
  req: NextRequest,
  context: { params: Promise<Record<string, string>> }
): Promise<NextResponse> => {
  const handler = withPermissions(
    { resource: 'trainers', action: 'update' },
    async (req: AuthenticatedRequest) => {
      try {
        console.log('📝 API: массовое обновление тренеров');
        
        const body = await req.json();
        const { user } = req;
        const { trainers, action } = body;

        if (!Array.isArray(trainers) || trainers.length === 0) {
          return NextResponse.json(
            { success: false, error: 'Список тренеров не указан или пуст' },
            { status: 400 }
          );
        }

        const results = {
          updated: 0,
          failed: 0,
          errors: [] as string[]
        };

        for (const trainerUpdate of trainers) {
          try {
            const { id, ...updateData } = trainerUpdate;

            if (!id) {
              results.failed++;
              results.errors.push('ID тренера не указан');
              continue;
            }

            const trainerIndex = mockTrainers.findIndex(t => t.id === id);
            if (trainerIndex === -1) {
              results.failed++;
              results.errors.push(`Тренер с ID ${id} не найден`);
              continue;
            }

            const trainer = mockTrainers[trainerIndex];

            // Проверка прав доступа
            if (user.role === 'trainer' && trainer.id !== user.id) {
              results.failed++;
              results.errors.push(`Недостаточно прав для редактирования тренера ${trainer.name}`);
              continue;
            }

            // Специальные действия
            if (action) {
              switch (action) {
                case 'activate':
                  if (user.role === 'admin' || user.role === 'manager') {
                    trainer.status = 'active';
                  } else {
                    results.failed++;
                    results.errors.push(`Недостаточно прав для активации тренера ${trainer.name}`);
                    continue;
                  }
                  break;

                case 'suspend':
                  if (user.role === 'admin' || user.role === 'manager') {
                    trainer.status = 'suspended';
                  } else {
                    results.failed++;
                    results.errors.push(`Недостаточно прав для приостановки тренера ${trainer.name}`);
                    continue;
                  }
                  break;

                case 'deactivate':
                  if (user.role === 'admin' || user.role === 'manager') {
                    trainer.status = 'inactive';
                  } else {
                    results.failed++;
                    results.errors.push(`Недостаточно прав для деактивации тренера ${trainer.name}`);
                    continue;
                  }
                  break;

                default:
                  // Обычное обновление данных
                  Object.assign(trainer, updateData);
                  break;
              }
            } else {
              // Обычное обновление данных
              Object.assign(trainer, updateData);
            }

            trainer.updatedAt = new Date().toISOString();
            trainer.updatedBy = user.id;

            mockTrainers[trainerIndex] = trainer;
            results.updated++;

          } catch (error) {
            results.failed++;
            results.errors.push(`Ошибка обновления тренера: ${error}`);
          }
        }

        console.log(`✅ API: массовое обновление завершено - ${results.updated} успешно, ${results.failed} ошибок`);

        return NextResponse.json({
          success: results.failed === 0,
          data: results,
          message: `Обновлено ${results.updated} тренеров${results.failed > 0 ? `, ${results.failed} ошибок` : ''}`
        });

      } catch (error) {
        console.error('💥 API: ошибка массового обновления тренеров:', error);
        return NextResponse.json(
          { success: false, error: 'Ошибка массового обновления тренеров' },
          { status: 500 }
        );
      }
    }
  );

  return handler(req, { params: {} });
};

// DELETE /api/trainers - Массовое удаление тренеров
export const DELETE = async (
  req: NextRequest,
  context: { params: Promise<Record<string, string>> }
): Promise<NextResponse> => {
  const handler = withPermissions(
    { resource: 'trainers', action: 'delete' },
    async (req: AuthenticatedRequest) => {
      try {
        console.log('🗑️ API: массовое удаление тренеров');
        
        const body = await req.json();
        const { user } = req;
        const { ids, force = false } = body;

        if (!Array.isArray(ids) || ids.length === 0) {
          return NextResponse.json(
                        { success: false, error: 'Список ID тренеров не указан или пуст' },
            { status: 400 }
          );
        }

        const results = {
          deleted: 0,
          failed: 0,
          errors: [] as string[]
        };

        for (const id of ids) {
          try {
            const trainerIndex = mockTrainers.findIndex(t => t.id === id);
            if (trainerIndex === -1) {
              results.failed++;
              results.errors.push(`Тренер с ID ${id} не найден`);
              continue;
            }

            const trainer = mockTrainers[trainerIndex];

            // Проверка на самоудаление
            if (trainer.id === user.id) {
              results.failed++;
              results.errors.push('Нельзя удалить самого себя');
              continue;
            }

            // Проверка активных клиентов (если не принудительное удаление)
            if (!force && trainer.activeClients > 0) {
              results.failed++;
              results.errors.push(`Тренер ${trainer.name} имеет активных клиентов`);
              continue;
            }

            // Проверка прав на удаление
            if (user.role !== 'admin' && user.role !== 'manager') {
              results.failed++;
              results.errors.push(`Недостаточно прав для удаления тренера ${trainer.name}`);
              continue;
            }

            // Мягкое удаление (изменение статуса)
            if (!force) {
              trainer.status = 'inactive';
              trainer.updatedAt = new Date().toISOString();
              trainer.updatedBy = user.id;
              mockTrainers[trainerIndex] = trainer;
            } else {
              // Полное удаление
              mockTrainers.splice(trainerIndex, 1);
            }

            results.deleted++;

          } catch (error) {
            results.failed++;
            results.errors.push(`Ошибка удаления тренера с ID ${id}: ${error}`);
          }
        }

        console.log(`✅ API: массовое удаление завершено - ${results.deleted} удалено, ${results.failed} ошибок`);

        return NextResponse.json({
          success: results.failed === 0,
          data: results,
          message: `${force ? 'Удалено' : 'Деактивировано'} ${results.deleted} тренеров${results.failed > 0 ? `, ${results.failed} ошибок` : ''}`
        });

      } catch (error) {
        console.error('💥 API: ошибка массового удаления тренеров:', error);
        return NextResponse.json(
          { success: false, error: 'Ошибка массового удаления тренеров' },
          { status: 500 }
        );
      }
    }
  );

  return handler(req, { params: {} });
};

// PATCH /api/trainers - Частичное обновление нескольких тренеров
export const PATCH = async (
  req: NextRequest,
  context: { params: Promise<Record<string, string>> }
): Promise<NextResponse> => {
  const handler = withPermissions(
    { resource: 'trainers', action: 'update' },
    async (req: AuthenticatedRequest) => {
      try {
        console.log('🔧 API: частичное обновление тренеров');
        
        const body = await req.json();
        const { user } = req;
        const { operation, data } = body;

        if (!operation) {
          return NextResponse.json(
            { success: false, error: 'Операция не указана' },
            { status: 400 }
          );
        }

        let results = {
          processed: 0,
          failed: 0,
          errors: [] as string[]
        };

        switch (operation) {
          case 'bulk-status-update':
            results = await bulkStatusUpdate(data, user);
            break;

          case 'bulk-specialization-update':
            results = await bulkSpecializationUpdate(data, user);
            break;

          case 'bulk-rate-update':
            results = await bulkRateUpdate(data, user);
            break;

          case 'bulk-working-hours-update':
            results = await bulkWorkingHoursUpdate(data, user);
            break;

          case 'recalculate-stats':
            results = await recalculateTrainerStats(data, user);
            break;

          default:
            return NextResponse.json(
              { success: false, error: 'Неизвестная операция' },
              { status: 400 }
            );
        }

        return NextResponse.json({
          success: results.failed === 0,
          data: results,
          message: `Операция "${operation}" выполнена: ${results.processed} успешно${results.failed > 0 ? `, ${results.failed} ошибок` : ''}`
        });

      } catch (error) {
        console.error('💥 API: ошибка частичного обновления тренеров:', error);
        return NextResponse.json(
          { success: false, error: 'Ошибка частичного обновления тренеров' },
          { status: 500 }
        );
      }
    }
  );

  return handler(req, { params: {} });
};

// Вспомогательные функции для массовых операций

async function bulkStatusUpdate(data: any, user: any) {
  const { trainerIds, status } = data;
  const results = { processed: 0, failed: 0, errors: [] as string[] };

  if (!Array.isArray(trainerIds) || !status) {
    results.failed++;
    results.errors.push('Некорректные данные для обновления статуса');
    return results;
  }

  const validStatuses = ['active', 'inactive', 'suspended'];
  if (!validStatuses.includes(status)) {
    results.failed++;
    results.errors.push('Некорректный статус');
    return results;
  }

  for (const id of trainerIds) {
    const trainerIndex = mockTrainers.findIndex(t => t.id === id);
    if (trainerIndex === -1) {
      results.failed++;
      results.errors.push(`Тренер с ID ${id} не найден`);
      continue;
    }

    const trainer = mockTrainers[trainerIndex];

    // Проверка прав
    if (user.role === 'trainer' && trainer.id !== user.id) {
      results.failed++;
      results.errors.push(`Недостаточно прав для изменения статуса тренера ${trainer.name}`);
      continue;
    }

    trainer.status = status;
    trainer.updatedAt = new Date().toISOString();
    trainer.updatedBy = user.id;

    mockTrainers[trainerIndex] = trainer;
    results.processed++;
  }

  return results;
}

async function bulkSpecializationUpdate(data: any, user: any) {
  const { trainerIds, specialization, action = 'replace' } = data;
  const results = { processed: 0, failed: 0, errors: [] as string[] };

  if (!Array.isArray(trainerIds) || !Array.isArray(specialization)) {
    results.failed++;
    results.errors.push('Некорректные данные для обновления специализации');
    return results;
  }

  for (const id of trainerIds) {
    const trainerIndex = mockTrainers.findIndex(t => t.id === id);
    if (trainerIndex === -1) {
      results.failed++;
      results.errors.push(`Тренер с ID ${id} не найден`);
      continue;
    }

    const trainer = mockTrainers[trainerIndex];

    // Проверка прав
    if (user.role === 'trainer' && trainer.id !== user.id) {
      results.failed++;
      results.errors.push(`Недостаточно прав для изменения специализации тренера ${trainer.name}`);
      continue;
    }

    switch (action) {
      case 'replace':
        trainer.specialization = [...specialization];
        break;
      case 'add':
        trainer.specialization = [...new Set([...trainer.specialization, ...specialization])];
        break;
      case 'remove':
        trainer.specialization = trainer.specialization.filter(spec => !specialization.includes(spec));
        break;
    }

    trainer.updatedAt = new Date().toISOString();
    trainer.updatedBy = user.id;

    mockTrainers[trainerIndex] = trainer;
    results.processed++;
  }

  return results;
}

async function bulkRateUpdate(data: any, user: any) {
  const { trainerIds, hourlyRate, adjustmentType = 'set' } = data;
  const results = { processed: 0, failed: 0, errors: [] as string[] };

  if (!Array.isArray(trainerIds) || typeof hourlyRate !== 'number' || hourlyRate < 0) {
    results.failed++;
    results.errors.push('Некорректные данные для обновления ставки');
    return results;
  }

  for (const id of trainerIds) {
    const trainerIndex = mockTrainers.findIndex(t => t.id === id);
    if (trainerIndex === -1) {
      results.failed++;
      results.errors.push(`Тренер с ID ${id} не найден`);
      continue;
    }

    const trainer = mockTrainers[trainerIndex];

    // Проверка прав
    if (user.role === 'trainer' && trainer.id !== user.id) {
      results.failed++;
      results.errors.push(`Недостаточно прав для изменения ставки тренера ${trainer.name}`);
      continue;
    }

    switch (adjustmentType) {
      case 'set':
        trainer.hourlyRate = hourlyRate;
        break;
      case 'increase':
        trainer.hourlyRate += hourlyRate;
        break;
      case 'decrease':
        trainer.hourlyRate = Math.max(0, trainer.hourlyRate - hourlyRate);
        break;
      case 'percentage':
        trainer.hourlyRate = Math.round(trainer.hourlyRate * (1 + hourlyRate / 100));
        break;
    }

    trainer.updatedAt = new Date().toISOString();
    trainer.updatedBy = user.id;

    mockTrainers[trainerIndex] = trainer;
    results.processed++;
  }

  return results;
}

async function bulkWorkingHoursUpdate(data: any, user: any) {
  const { trainerIds, workingHours } = data;
  const results = { processed: 0, failed: 0, errors: [] as string[] };

  if (!Array.isArray(trainerIds) || !workingHours) {
    results.failed++;
    results.errors.push('Некорректные данные для обновления рабочих часов');
    return results;
  }

  for (const id of trainerIds) {
    const trainerIndex = mockTrainers.findIndex(t => t.id === id);
    if (trainerIndex === -1) {
      results.failed++;
      results.errors.push(`Тренер с ID ${id} не найден`);
      continue;
    }

    const trainer = mockTrainers[trainerIndex];

    // Проверка прав
    if (user.role === 'trainer' && trainer.id !== user.id) {
      results.failed++;
      results.errors.push(`Недостаточно прав для изменения рабочих часов тренера ${trainer.name}`);
      continue;
    }

    trainer.workingHours = { ...trainer.workingHours, ...workingHours };
    trainer.updatedAt = new Date().toISOString();
    trainer.updatedBy = user.id;

    mockTrainers[trainerIndex] = trainer;
    results.processed++;
  }

  return results;
}

async function recalculateTrainerStats(data: any, user: any) {
  const { trainerIds } = data;
  const results = { processed: 0, failed: 0, errors: [] as string[] };

  const targetIds = Array.isArray(trainerIds) ? trainerIds : mockTrainers.map(t => t.id);

  for (const id of targetIds) {
    const trainerIndex = mockTrainers.findIndex(t => t.id === id);
    if (trainerIndex === -1) {
      results.failed++;
      results.errors.push(`Тренер с ID ${id} не найден`);
      continue;
    }

    const trainer = mockTrainers[trainerIndex];

    // Имитация пересчета статистики
    // В реальном приложении здесь были бы запросы к БД
    trainer.totalSessions = Math.floor(Math.random() * 100) + trainer.totalSessions;
    trainer.rating = Math.round((Math.random() * 2 + 3) * 10) / 10; // 3.0 - 5.0
    trainer.activeClients = Math.floor(Math.random() * 20) + 5;

    trainer.updatedAt = new Date().toISOString();
    trainer.updatedBy = user.id;

    mockTrainers[trainerIndex] = trainer;
    results.processed++;
  }

  return results;
}

