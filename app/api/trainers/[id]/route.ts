// app/api/trainers/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { withPermissions, type AuthenticatedRequest } from '@/lib/api-middleware';
import { canManageRole } from '@/lib/permissions';
import { mockTrainers, normalizeWorkingHours } from '@/lib/mock-data';

// GET /api/trainers/[id] - Получение конкретного тренера
export const GET = async (
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> => {
  const handler = withPermissions(
    { resource: 'trainers', action: 'read' },
    async (req: AuthenticatedRequest) => {
      try {
        const params = await context.params;
        const { id } = params;
        const { user } = req;

        if (!id) {
          return NextResponse.json(
            { success: false, error: 'ID тренера не указан' },
            { status: 400 }
          );
        }

        console.log(`📋 API: получение тренера ${id}`);

        const trainer = mockTrainers.find(t => t.id === id);
        if (!trainer) {
          return NextResponse.json(
            { success: false, error: 'Тренер не найден' },
            { status: 404 }
          );
        }

        // Проверка прав доступа к конкретному тренеру
        if (user.role === 'trainer' && trainer.id !== user.id) {
          return NextResponse.json(
            { success: false, error: 'Нет доступа к данному тренеру' },
            { status: 403 }
          );
        }

        return NextResponse.json({
          success: true,
          data: trainer
        });

      } catch (error) {
        console.error('💥 API: ошибка получения тренера:', error);
        return NextResponse.json(
          { success: false, error: 'Ошибка получения тренера' },
          { status: 500 }
        );
      }
    }
  );

  return handler(req, { params: {} });
};

// PUT /api/trainers/[id] - Обновление тренера
export const PUT = async (
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> => {
  const handler = withPermissions(
    { resource: 'trainers', action: 'update' },
    async (req: AuthenticatedRequest) => {
      try {
        const params = await context.params;
        const { id } = params;
        const { user } = req;
        const body = await req.json();

        if (!id) {
          return NextResponse.json(
            { success: false, error: 'ID тренера не указан' },
            { status: 400 }
          );
        }

        console.log(`✏️ API: обновление тренера ${id}`);

        const trainerIndex = mockTrainers.findIndex(t => t.id === id);
        if (trainerIndex === -1) {
          return NextResponse.json(
            { success: false, error: 'Тренер не найден' },
            { status: 404 }
          );
        }

        const trainer = mockTrainers[trainerIndex];

        // Проверка прав доступа к объекту
        if (user.role === 'trainer' && trainer.id !== user.id) {
          return NextResponse.json(
            { success: false, error: 'Недостаточно прав для редактирования этого тренера' },
            { status: 403 }
          );
        }

        // Проверка прав на изменение роли
        if (body.role && body.role !== trainer.role) {
          if (!canManageRole(user.role, body.role)) {
            return NextResponse.json(
              { success: false, error: `Недостаточно прав для назначения роли ${body.role}` },
              { status: 403 }
            );
          }
        }

        // Проверка уникальности email при изменении
        if (body.email && body.email !== trainer.email) {
          const existingTrainer = mockTrainers.find(t => t.email === body.email && t.id !== id);
          if (existingTrainer) {
            return NextResponse.json(
              { success: false, error: 'Тренер с таким email уже существует' },
              { status: 409 }
            );
          }
        }

        // Обновление данных (только разрешенные поля)
        const allowedFields = [
          'name', 'email', 'phone', 'specialization', 'experience', 
          'hourlyRate', 'certifications', 'workingHours', 'status'
        ];

        const updateData: any = {};
        for (const field of allowedFields) {
          if (body[field] !== undefined) {
            // Специальная обработка для рабочих часов
            if (field === 'workingHours') {
              updateData[field] = normalizeWorkingHours(body[field]);
            } else {
              updateData[field] = body[field];
            }
          }
        }

        // Добавляем метаданные обновления
        const updatedTrainer = {
          ...trainer,
          ...updateData,
          id, // ID не должен изменяться
          updatedAt: new Date().toISOString(),
          updatedBy: user.id
        };

        mockTrainers[trainerIndex] = updatedTrainer;

        console.log(`✅ API: тренер обновлен - ${updatedTrainer.name}`);

        return NextResponse.json({
          success: true,
          data: updatedTrainer,
          message: 'Тренер успешно обновлен'
        });

      } catch (error) {
        console.error('💥 API: ошибка обновления тренера:', error);
        return NextResponse.json(
          { success: false, error: 'Ошибка обновления тренера' },
          { status: 500 }
        );
      }
    }
  );

  return handler(req, { params: {} });
};

// DELETE /api/trainers/[id] - Удаление тренера
export const DELETE = async (
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> => {
  const handler = withPermissions(
    { resource: 'trainers', action: 'delete' },
    async (req: AuthenticatedRequest) => {
      try {
        const params = await context.params;
        const { id } = params;
        const { user } = req;

        if (!id) {
          return NextResponse.json(
            { success: false, error: 'ID тренера не указан' },
            { status: 400 }
          );
        }

        console.log(`🗑️ API: удаление тренера ${id}`);

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

        // Проверка активных клиентов
        if (trainer.activeClients > 0) {
          return NextResponse.json(
            { success: false, error: 'Нельзя удалить тренера с активными клиентами' },
            { status: 400 }
          );
        }

        // Мягкое удаление (изменение статуса на неактивный)
        const deletedTrainer = {
          ...trainer,
          status: 'inactive' as const,
          updatedAt: new Date().toISOString(),
          updatedBy: user.id
        };

        mockTrainers[trainerIndex] = deletedTrainer;

        console.log(`✅ API: тренер удален - ${trainer.name}`);

        return NextResponse.json({
          success: true,
          message: 'Тренер успешно удален'
        });

      } catch (error) {
        console.error('💥 API: ошибка удаления тренера:', error);
        return NextResponse.json(
          { success: false, error: 'Ошибка удаления тренера' },
          { status: 500 }
        );
      }
    }
  );

  return handler(req, { params: {} });
};

// PATCH /api/trainers/[id] - Частичное обновление тренера
export const PATCH = async (
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> => {
  const handler = withPermissions(
    { resource: 'trainers', action: 'update' },
    async (req: AuthenticatedRequest) => {
      try {
        const params = await context.params;
        const { id } = params;
        const { user } = req;
        const body = await req.json();

        if (!id) {
          return NextResponse.json(
            { success: false, error: 'ID тренера не указан' },
            { status: 400 }
          );
        }

        console.log(`🔧 API: частичное обновление тренера ${id}`);

        const trainerIndex = mockTrainers.findIndex(t => t.id === id);
        if (trainerIndex === -1) {
          return NextResponse.json(
            { success: false, error: 'Тренер не найден' },
            { status: 404 }
          );
        }

        const trainer = mockTrainers[trainerIndex];

        // Проверка прав доступа к объекту
        if (user.role === 'trainer' && trainer.id !== user.id) {
          return NextResponse.json(
            { success: false, error: 'Недостаточно прав для редактирования этого тренера' },
            { status: 403 }
          );
        }

        // Специальные операции
        if (body.action) {
          switch (body.action) {
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

            case 'updateRating':
              if (typeof body.rating === 'number' && body.rating >= 0 && body.rating <= 5) {
                trainer.rating = body.rating;
              } else {
                return NextResponse.json(
                  { success: false, error: 'Некорректное значение рейтинга (должно быть от 0 до 5)' },
                  { status: 400 }
                );
              }
              break;

            case 'updateStats':
              if (typeof body.activeClients === 'number' && body.activeClients >= 0) {
                trainer.activeClients = body.activeClients;
              }
              if (typeof body.totalSessions === 'number' && body.totalSessions >= 0) {
                trainer.totalSessions = body.totalSessions;
              }
              break;

            case 'updateWorkingHours':
              if (body.workingHours) {
                trainer.workingHours = normalizeWorkingHours(body.workingHours);
              } else {
                return NextResponse.json(
                  { success: false, error: 'Рабочие часы не указаны' },
                  { status: 400 }
                );
              }
              break;

            case 'addCertification':
              if (typeof body.certification === 'string' && body.certification.trim()) {
                if (!trainer.certifications.includes(body.certification)) {
                  trainer.certifications.push(body.certification);
                }
              } else {
                return NextResponse.json(
                  { success: false, error: 'Некорректное название сертификата' },
                  { status: 400 }
                );
              }
              break;

            case 'removeCertification':
              if (typeof body.certification === 'string') {
                trainer.certifications = trainer.certifications.filter(
                  cert => cert !== body.certification
                );
              } else {
                return NextResponse.json(
                  { success: false, error: 'Некорректное название сертификата' },
                  { status: 400 }
                );
              }
              break;

            case 'updateSpecialization':
              if (Array.isArray(body.specialization)) {
                trainer.specialization = body.specialization.filter(
                  (spec: string) => typeof spec === 'string' && spec.trim()
                );
              } else {
                return NextResponse.json(
                  { success: false, error: 'Специализация должна быть массивом строк' },
                  { status: 400 }
                );
              }
              break;

            default:
              return NextResponse.json(
                { success: false, error: 'Неизвестное действие' },
                { status: 400 }
              );
          }

          trainer.updatedAt = new Date().toISOString();
          trainer.updatedBy = user.id;

          mockTrainers[trainerIndex] = trainer;

          return NextResponse.json({
            success: true,
            data: trainer,
            message: `Действие "${body.action}" выполнено успешно`
          });
        }

        return NextResponse.json(
          { success: false, error: 'Действие не указано' },
          { status: 400 }
        );

      } catch (error) {
        console.error('💥 API: ошибка частичного обновления тренера:', error);
        return NextResponse.json(
          { success: false, error: 'Ошибка обновления тренера' },
          { status: 500 }
        );
      }
    }
  );

  return handler(req, { params: {} });
};
