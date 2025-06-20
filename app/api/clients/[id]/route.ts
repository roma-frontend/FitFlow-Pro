// app/api/clients/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { withPermissions, AuthenticatedRequest } from '@/lib/api-middleware';
import { mockClients, mockTrainers, mockSessions, Client, Session } from '@/lib/mock-data';

// GET /api/clients/[id] - Получение конкретного клиента
export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  return withPermissions(
    { resource: 'clients', action: 'read' },
    async (authenticatedReq: AuthenticatedRequest) => {
      try {
        const { id } = await context.params;
        const { user } = authenticatedReq;

        console.log(`👤 API: получение клиента ${id}`);

        const client = mockClients.find((c: Client) => c.id === id);
        if (!client) {
          return NextResponse.json(
            { success: false, error: 'Клиент не найден' },
            { status: 404 }
          );
        }

        // Остальной код остается без изменений...
        // Проверка прав доступа к конкретному клиенту
        if (user.role === 'trainer' && client.trainerId !== user.id) {
          return NextResponse.json(
            { success: false, error: 'Нет доступа к данному клиенту' },
            { status: 403 }
          );
        }

        if (user.role === 'client' && client.id !== user.id) {
          return NextResponse.json(
            { success: false, error: 'Нет доступа к данному клиенту' },
            { status: 403 }
          );
        }

        // Добавление дополнительной информации
        const trainer = mockTrainers.find((t: any) => t.id === client.trainerId);
        const clientSessions = mockSessions.filter((s: Session) => s.clientId === client.id);
        const completedSessions = clientSessions.filter((s: Session) => s.status === 'completed');
        const upcomingSessions = clientSessions.filter((s: Session) => 
          s.status === 'scheduled' && new Date(`${s.date}T${s.startTime}`) > new Date()
        );

        // Получение последнего визита
        const lastVisit = completedSessions.length > 0 
          ? completedSessions
              .sort((a: Session, b: Session) => 
                new Date(`${b.date}T${b.startTime}`).getTime() - new Date(`${a.date}T${a.startTime}`).getTime()
              )[0]
          : null;

        // История сессий (последние 10)
        const sessionHistory = completedSessions
          .sort((a: Session, b: Session) => 
            new Date(`${b.date}T${b.startTime}`).getTime() - new Date(`${a.date}T${a.startTime}`).getTime()
          )
          .slice(0, 10)
          .map((session: Session) => {
            const startTime = new Date(`${session.date}T${session.startTime}`);
            const endTime = new Date(`${session.date}T${session.endTime}`);
            const duration = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));

            return {
              id: session.id,
              date: session.date,
              startTime: session.startTime,
              endTime: session.endTime,
              type: session.type,
              duration,
              notes: (session as any).notes || ''
            };
          });

        const enrichedClient = {
          ...client,
          trainerName: trainer?.name || null,
          trainerPhone: trainer?.phone || null,
          trainerEmail: trainer?.email || null,
          totalSessions: completedSessions.length,
          upcomingSessions: upcomingSessions.length,
          lastVisit: lastVisit ? `${lastVisit.date}T${lastVisit.startTime}` : null,
          sessionHistory,
          stats: {
            totalSessions: clientSessions.length,
            completedSessions: completedSessions.length,
            scheduledSessions: clientSessions.filter((s: Session) => s.status === 'scheduled').length,
            cancelledSessions: clientSessions.filter((s: Session) => s.status === 'cancelled').length,
            noShowSessions: clientSessions.filter((s: Session) => (s as any).status === 'no-show').length
          }
        };

        return NextResponse.json({
          success: true,
          data: enrichedClient
        });

      } catch (error) {
        console.error('💥 API: ошибка получения клиента:', error);
        return NextResponse.json(
          { success: false, error: 'Ошибка получения клиента' },
          { status: 500 }
        );
      }
    }
  )(req);
}

// PUT /api/clients/[id] - Обновление клиента
export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  return withPermissions(
    { 
      resource: 'clients', 
      action: 'update',
      requireOwnership: true,
      getOwnerId: async (req) => {
        const url = new URL(req.url);
        const clientId = url.pathname.split('/').pop();
        const client = mockClients.find((c: Client) => c.id === clientId);
        return client?.trainerId; // Владелец клиента - его тренер
      }
    },
    async (authenticatedReq: AuthenticatedRequest) => {
      try {
        const { id } = await context.params;
        const { user } = authenticatedReq;
        const body = await req.json();

        console.log(`✏️ API: обновление клиента ${id}`);

        // Остальной код остается без изменений...
        const clientIndex = mockClients.findIndex((c: Client) => c.id === id);
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
            { success: false, error: 'Недостаточно прав для редактирования этого клиента' },
            { status: 403 }
          );
        }

        // Проверка уникальности email при изменении
        if (body.email && body.email !== client.email) {
          const existingClient = [...mockTrainers, ...mockClients].find((u: any) => u.email === body.email);
          if (existingClient) {
            return NextResponse.json(
              { success: false, error: 'Пользователь с таким email уже существует' },
              { status: 409 }
            );
          }
        }

        // Проверка изменения тренера
        if (body.trainerId && body.trainerId !== client.trainerId) {
          // Проверка существования нового тренера
          const newTrainer = mockTrainers.find((t: any) => t.id === body.trainerId);
          if (!newTrainer) {
            return NextResponse.json(
              { success: false, error: 'Новый тренер не найден' },
              { status: 404 }
            );
          }

          // Тренеры не могут передавать клиентов другим тренерам
          if (user.role === 'trainer') {
            return NextResponse.json(
              { success: false, error: 'Нет прав на изменение тренера' },
              { status: 403 }
            );
          }

          // Обновление счетчиков активных клиентов
          if (client.trainerId) {
            const oldTrainerIndex = mockTrainers.findIndex((t: any) => t.id === client.trainerId);
            if (oldTrainerIndex !== -1 && client.status === 'active') {
              (mockTrainers[oldTrainerIndex] as any).activeClients = Math.max(0, 
                (mockTrainers[oldTrainerIndex] as any).activeClients - 1
              );
            }
          }

          const newTrainerIndex = mockTrainers.findIndex((t: any) => t.id === body.trainerId);
          if (newTrainerIndex !== -1 && (body.status || client.status) === 'active') {
            (mockTrainers[newTrainerIndex] as any).activeClients += 1;
          }
        }

        // Валидация типа членства
        if (body.membershipType && !['basic', 'premium', 'vip'].includes(body.membershipType)) {
          return NextResponse.json(
            { success: false, error: 'Некорректный тип членства' },
            { status: 400 }
          );
        }

        // Валидация статуса
        if (body.status && !['active', 'inactive', 'suspended'].includes(body.status)) {
          return NextResponse.json(
            { success: false, error: 'Некорректный статус' },
            { status: 400 }
          );
        }

        // Обновление данных клиента (только разрешенные поля)
        const allowedFields = [
          'name', 'email', 'phone', 'status', 'trainerId', 'membershipType'
        ];

        const updateData: Partial<Client> = {};
        for (const field of allowedFields) {
          if (body[field] !== undefined) {
            (updateData as any)[field] = body[field];
          }
        }

        const updatedClient: Client = {
          ...client,
          ...updateData,
          id, // ID не должен изменяться
          updatedAt: new Date().toISOString(),
          updatedBy: user.id
        };

        mockClients[clientIndex] = updatedClient;

        // Добавление информации о тренере для ответа
        const trainer = mockTrainers.find((t: any) => t.id === updatedClient.trainerId);

        console.log(`✅ API: клиент обновлен - ${updatedClient.name}`);

        return NextResponse.json({
          success: true,
          data: {
            ...updatedClient,
            trainerName: trainer?.name || null
          },
          message: 'Клиент успешно обновлен'
        });

      } catch (error) {
        console.error('💥 API: ошибка обновления клиента:', error);
        return NextResponse.json(
          { success: false, error: 'Ошибка обновления клиента' },
          { status: 500 }
        );
      }
    }
  )(req);
}

// DELETE /api/clients/[id] - Удаление клиента
export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  return withPermissions(
    { resource: 'clients', action: 'delete' },
    async (authenticatedReq: AuthenticatedRequest) => {
      try {
        const { id } = await context.params;
        const { user } = authenticatedReq;

        console.log(`🗑️ API: удаление клиента ${id}`);

        // Остальной код остается без изменений...
        const clientIndex = mockClients.findIndex((c: Client) => c.id === id);
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

        // Проверка активных сессий
        const activeSessions = mockSessions.filter((s: Session) => 
          s.clientId === id && 
          s.status === 'scheduled' && 
          new Date(`${s.date}T${s.startTime}`) > new Date()
        );

        if (activeSessions.length > 0) {
          return NextResponse.json(
            { success: false, error: 'Нельзя удалить клиента с активными сессиями' },
            { status: 400 }
          );
        }

        // Мягкое удаление (изменение статуса)
        const deletedClient: Client = {
          ...client,
          status: 'inactive' as any,
          updatedAt: new Date().toISOString(),
          updatedBy: user.id
        };

        mockClients[clientIndex] = deletedClient;

        // Обновление счетчика активных клиентов у тренера
        if (client.trainerId && client.status === 'active') {
          const trainerIndex = mockTrainers.findIndex((t: any) => t.id === client.trainerId);
          if (trainerIndex !== -1) {
            (mockTrainers[trainerIndex] as any).activeClients = Math.max(0, 
              (mockTrainers[trainerIndex] as any).activeClients - 1
            );
          }
        }

        console.log(`✅ API: клиент удален - ${client.name}`);

        return NextResponse.json({
          success: true,
          message: 'Клиент успешно удален'
        });

      } catch (error) {
        console.error('💥 API: ошибка удаления клиента:', error);
        return NextResponse.json(
          { success: false, error: 'Ошибка удаления клиента' },
          { status: 500 }
        );
      }
    }
  )(req);
}

// PATCH /api/clients/[id] - Частичное обновление клиента
export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  return withPermissions(
    { resource: 'clients', action: 'update' },
    async (authenticatedReq: AuthenticatedRequest) => {
      try {
        const { id } = await context.params;
        const { user } = authenticatedReq;
        const body = await req.json();

        console.log(`🔧 API: частичное обновление клиента ${id}`);

        // Остальной код остается без изменений...
        const clientIndex = mockClients.findIndex((c: Client) => c.id === id);
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
            { success: false, error: 'Недостаточно прав для редактирования этого клиента' },
            { status: 403 }
          );
        }

        // Специальные операции
        if (body.action) {
          switch (body.action) {
            case 'activate':
              if (user.role !== 'admin' && user.role !== 'manager') {
                return NextResponse.json(
                  { success: false, error: 'Недостаточно прав для активации клиента' },
                  { status: 403 }
                );
              }
              (client as any).status = 'active';
              
              // Увеличиваем счетчик активных клиентов у тренера
              if (client.trainerId) {
                const trainerIndex = mockTrainers.findIndex((t: any) => t.id === client.trainerId);
                if (trainerIndex !== -1) {
                  (mockTrainers[trainerIndex] as any).activeClients += 1;
                }
              }
              break;

            case 'suspend':
              if (user.role !== 'admin' && user.role !== 'manager') {
                return NextResponse.json(
                  { success: false, error: 'Недостаточно прав для приостановки клиента' },
                  { status: 403 }
                );
              }
              (client as any).status = 'suspended';
              
              // Уменьшаем счетчик активных клиентов у тренера
              if (client.trainerId) {
                const trainerIndex = mockTrainers.findIndex((t: any) => t.id === client.trainerId);
                if (trainerIndex !== -1) {
                  (mockTrainers[trainerIndex] as any).activeClients = Math.max(0, 
                    (mockTrainers[trainerIndex] as any).activeClients - 1
                  );
                }
              }
              break;

            case 'assignTrainer':
              if (!body.trainerId) {
                return NextResponse.json(
                  { success: false, error: 'ID тренера не указан' },
                  { status: 400 }
                );
              }

              const newTrainer = mockTrainers.find((t: any) => t.id === body.trainerId);
              if (!newTrainer) {
                return NextResponse.json(
                  { success: false, error: 'Тренер не найден' },
                  { status: 404 }
                );
              }

              // Тренеры не могут назначать клиентов другим тренерам
              if (user.role === 'trainer' && body.trainerId !== user.id) {
                return NextResponse.json(
                  { success: false, error: 'Нет прав на назначение другого тренера' },
                  { status: 403 }
                );
              }

              // Обновляем счетчики
              if (client.trainerId && client.status === 'active') {
                const oldTrainerIndex = mockTrainers.findIndex((t: any) => t.id === client.trainerId);
                if (oldTrainerIndex !== -1) {
                  (mockTrainers[oldTrainerIndex] as any).activeClients = Math.max(0, 
                    (mockTrainers[oldTrainerIndex] as any).activeClients - 1
                  );
                }
              }

              if (client.status === 'active') {
                const newTrainerIndex = mockTrainers.findIndex((t: any) => t.id === body.trainerId);
                if (newTrainerIndex !== -1) {
                  (mockTrainers[newTrainerIndex] as any).activeClients += 1;
                }
              }

              (client as any).trainerId = body.trainerId;
              break;

            case 'unassignTrainer':
              if (user.role === 'trainer' && client.trainerId !== user.id) {
                return NextResponse.json(
                  { success: false, error: 'Нет прав на отмену назначения' },
                  { status: 403 }
                );
              }

              // Уменьшаем счетчик у текущего тренера
              if (client.trainerId && client.status === 'active') {
                const trainerIndex = mockTrainers.findIndex((t: any) => t.id === client.trainerId);
                if (trainerIndex !== -1) {
                  (mockTrainers[trainerIndex] as any).activeClients = Math.max(0, 
                    (mockTrainers[trainerIndex] as any).activeClients - 1
                  );
                }
              }

              (client as any).trainerId = undefined;
              break;

            case 'updateMembership':
              if (!body.membershipType || !['basic', 'premium', 'vip'].includes(body.membershipType)) {
                return NextResponse.json(
                  { success: false, error: 'Некорректный тип членства' },
                  { status: 400 }
                );
              }
              (client as any).membershipType = body.membershipType;
              break;

            case 'updateStats':
              if (typeof body.totalSessions === 'number' && body.totalSessions >= 0) {
                (client as any).totalSessions = body.totalSessions;
              }
              break;

            case 'addNote':
              // В реальном приложении заметки хранились бы отдельно
              console.log(`📝 Добавлена заметка для клиента ${client.id}: ${body.note}`);
              break;

            default:
              return NextResponse.json(
                { success: false, error: 'Неизвестное действие' },
                { status: 400 }
              );
          }

          (client as any).updatedAt = new Date().toISOString();
          (client as any).updatedBy = user.id;
          mockClients[clientIndex] = client;

          // Добавляем информацию о тренере для ответа
          const trainer = mockTrainers.find((t: any) => t.id === client.trainerId);

          return NextResponse.json({
            success: true,
            data: {
              ...client,
              trainerName: trainer?.name || null
            },
            message: `Действие "${body.action}" выполнено успешно`
          });
        }

        return NextResponse.json(
          { success: false, error: 'Действие не указано' },
          { status: 400 }
        );

      } catch (error) {
        console.error('💥 API: ошибка частичного обновления клиента:', error);
        return NextResponse.json(
          { success: false, error: 'Ошибка обновления клиента' },
          { status: 500 }
        );
      }
    }
  )(req);
}

