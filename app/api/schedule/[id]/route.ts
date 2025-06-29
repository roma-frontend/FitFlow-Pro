// app/api/schedule/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { withPermissions, type AuthenticatedRequest } from '@/lib/api-middleware';
import { mockSessions, mockTrainers, mockClients, type Session } from '@/lib/mock-data';

// GET /api/schedule/[id] - Получение конкретной сессии
export const GET = async (
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> => {
  const handler = withPermissions(
    { resource: 'schedule', action: 'read' },
    async (req: AuthenticatedRequest) => {
      try {
        const params = await context.params;
        const { id } = params;
        const { user } = req;

        if (!id) {
          return NextResponse.json(
            { success: false, error: 'ID сессии не указан' },
            { status: 400 }
          );
        }

        console.log(`📅 API: получение сессии ${id}`);

        const session = mockSessions.find((s: Session) => s.id === id);
        if (!session) {
          return NextResponse.json(
            { success: false, error: 'Сессия не найдена' },
            { status: 404 }
          );
        }

        // Проверка прав доступа к конкретной сессии
        if (user.role === 'trainer' && session.trainerId !== user.id) {
          return NextResponse.json(
            { success: false, error: 'Нет доступа к данной сессии' },
            { status: 403 }
          );
        }

        if (user.role === 'client' && session.clientId !== user.id) {
          return NextResponse.json(
            { success: false, error: 'Нет доступа к данной сессии' },
            { status: 403 }
          );
        }

        // Добавление дополнительной информации
        const trainer = mockTrainers.find(t => t.id === session.trainerId);
        const client = mockClients.find(c => c.id === session.clientId);

        const enrichedSession = {
          ...session,
          trainerName: trainer?.name || 'Неизвестный тренер',
          clientName: client?.name || 'Неизвестный клиент',
          trainerPhone: trainer?.phone,
          clientPhone: client?.phone,
          trainerEmail: trainer?.email,
          clientEmail: client?.email
        };

        return NextResponse.json({
          success: true,
          data: enrichedSession
        });

      } catch (error) {
        console.error('💥 API: ошибка получения сессии:', error);
        return NextResponse.json(
          { success: false, error: 'Ошибка получения сессии' },
          { status: 500 }
        );
      }
    }
  );

  return handler(req, { params: {} });
};

// PUT /api/schedule/[id] - Обновление сессии
export const PUT = async (
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> => {
  const handler = withPermissions(
    { 
      resource: 'schedule', 
      action: 'update',
      requireOwnership: true,
      getOwnerId: async (req) => {
        const params = await context.params;
        const sessionId = params.id;
        const session = mockSessions.find((s: Session) => s.id === sessionId);
        return session?.trainerId; // Владелец сессии - тренер
      }
    },
    async (req: AuthenticatedRequest) => {
      try {
        const params = await context.params;
        const { id } = params;
        const { user } = req;
        const body = await req.json();

        if (!id) {
          return NextResponse.json(
            { success: false, error: 'ID сессии не указан' },
            { status: 400 }
          );
        }

        console.log(`✏️ API: обновление сессии ${id}`);

        const sessionIndex = mockSessions.findIndex((s: Session) => s.id === id);
        if (sessionIndex === -1) {
          return NextResponse.json(
            { success: false, error: 'Сессия не найдена' },
            { status: 404 }
          );
        }

        const session = mockSessions[sessionIndex];

        // Проверка прав доступа
        if (user.role === 'trainer' && session.trainerId !== user.id) {
          return NextResponse.json(
            { success: false, error: 'Недостаточно прав для редактирования этой сессии' },
            { status: 403 }
          );
        }

        // Проверка существования тренера и клиента при изменении
        if (body.trainerId && body.trainerId !== session.trainerId) {
          const trainer = mockTrainers.find(t => t.id === body.trainerId);
          if (!trainer) {
            return NextResponse.json(
              { success: false, error: 'Указанный тренер не найден' },
              { status: 400 }
            );
          }
        }

        if (body.clientId && body.clientId !== session.clientId) {
          const client = mockClients.find(c => c.id === body.clientId);
          if (!client) {
            return NextResponse.json(
              { success: false, error: 'Указанный клиент не найден' },
              { status: 400 }
            );
          }
        }

        // Проверка конфликтов времени при изменении времени
        if (body.date || body.startTime || body.endTime) {
          const newDate = body.date || session.date;
          const newStartTime = body.startTime || session.startTime;
          const newEndTime = body.endTime || session.endTime;
          const trainerId = body.trainerId || session.trainerId;

          // Создаем полные даты для сравнения
          const newStartDateTime = new Date(`${newDate}T${newStartTime}`);
          const newEndDateTime = new Date(`${newDate}T${newEndTime}`);

          // Проверяем валидность времени
          if (newStartDateTime >= newEndDateTime) {
            return NextResponse.json(
              { success: false, error: 'Время начала должно быть раньше времени окончания' },
              { status: 400 }
            );
          }

          const conflictingSession = mockSessions.find((s: Session) => 
            s.id !== id &&
            s.trainerId === trainerId &&
            s.status !== 'cancelled' &&
            s.date === newDate &&
            (
              (newStartTime >= s.startTime && newStartTime < s.endTime) ||
              (newEndTime > s.startTime && newEndTime <= s.endTime) ||
              (newStartTime <= s.startTime && newEndTime >= s.endTime)
            )
          );

          if (conflictingSession) {
            return NextResponse.json(
              { success: false, error: 'Конфликт времени с существующей сессией' },
              { status: 409 }
            );
          }
        }

        // Валидация статуса
        const validStatuses = ['scheduled', 'completed', 'cancelled', 'no-show'];
        if (body.status && !validStatuses.includes(body.status)) {
          return NextResponse.json(
            { success: false, error: 'Некорректный статус сессии' },
            { status: 400 }
          );
        }

        // Валидация типа сессии
        const validTypes = ['personal', 'group', 'consultation'];
        if (body.type && !validTypes.includes(body.type)) {
          return NextResponse.json(
            { success: false, error: 'Некорректный тип сессии' },
            { status: 400 }
          );
        }

        // Обновление данных
        const allowedFields = [
          'trainerId', 'clientId', 'date', 'startTime', 'endTime', 
          'status', 'type', 'notes'
        ];

        const updateData: Partial<Session> = {};
        for (const field of allowedFields) {
          if (body[field] !== undefined) {
            updateData[field as keyof Session] = body[field];
          }
        }

        const updatedSession = {
          ...session,
          ...updateData,
          id, // ID не должен изменяться
          createdAt: session.createdAt, // Дата создания не должна изменяться
          createdBy: session.createdBy // Создатель не должен изменяться
        };

        mockSessions[sessionIndex] = updatedSession;

        // Добавление дополнительной информации для ответа
        const trainer = mockTrainers.find(t => t.id === updatedSession.trainerId);
        const client = mockClients.find(c => c.id === updatedSession.clientId);

        console.log(`✅ API: сессия обновлена - ${updatedSession.date} ${updatedSession.startTime}`);

        return NextResponse.json({
          success: true,
          data: {
            ...updatedSession,
            trainerName: trainer?.name || 'Неизвестный тренер',
            clientName: client?.name || 'Неизвестный клиент'
          },
          message: 'Сессия успешно обновлена'
        });

      } catch (error) {
        console.error('💥 API: ошибка обновления сессии:', error);
        return NextResponse.json(
          { success: false, error: 'Ошибка обновления сессии' },
          { status: 500 }
        );
      }
    }
  );

  return handler(req, { params: {} });
};

// DELETE /api/schedule/[id] - Удаление сессии
export const DELETE = async (
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> => {
  const handler = withPermissions(
    { 
      resource: 'schedule', 
      action: 'delete',
      requireOwnership: true,
      getOwnerId: async (req) => {
        const params = await context.params;
        const sessionId = params.id;
        const session = mockSessions.find((s: Session) => s.id === sessionId);
        return session?.trainerId;
      }
    },
    async (req: AuthenticatedRequest) => {
      try {
        const params = await context.params;
        const { id } = params;
        const { user } = req;

        if (!id) {
          return NextResponse.json(
            { success: false, error: 'ID сессии не указан' },
            { status: 400 }
          );
        }

        console.log(`🗑️ API: удаление сессии ${id}`);

        const sessionIndex = mockSessions.findIndex((s: Session) => s.id === id);
        if (sessionIndex === -1) {
          return NextResponse.json(
            { success: false, error: 'Сессия не найдена' },
            { status: 404 }
          );
        }

        const session = mockSessions[sessionIndex];

        // Проверка прав доступа
        if (user.role === 'trainer' && session.trainerId !== user.id) {
          return NextResponse.json(
            { success: false, error: 'Недостаточно прав для удаления этой сессии' },
            { status: 403 }
          );
        }

        // Проверка на удаление завершенной сессии
        if (session.status === 'completed') {
          return NextResponse.json(
            { success: false, error: 'Нельзя удалить завершенную сессию' },
            { status: 400 }
          );
        }

        // Мягкое удаление (изменение статуса на cancelled)
        const cancelledSession = {
          ...session,
          status: 'cancelled' as const,
          notes: session.notes ? `${session.notes}\n\nОтменено: ${new Date().toLocaleString()}` : `Отменено: ${new Date().toLocaleString()}`
        };

        mockSessions[sessionIndex] = cancelledSession;

        console.log(`✅ API: сессия отменена - ${session.date} ${session.startTime}`);

        return NextResponse.json({
          success: true,
          message: 'Сессия успешно отменена'
        });

      } catch (error) {
        console.error('💥 API: ошибка удаления сессии:', error);
        return NextResponse.json(
          { success: false, error: 'Ошибка удаления сессии' },
          { status: 500 }
        );
      }
    }
  );

  return handler(req, { params: {} });
};

// PATCH /api/schedule/[id] - Частичное обновление сессии (смена статуса)
export const PATCH = async (
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> => {
  const handler = withPermissions(
    { resource: 'schedule', action: 'update' },
    async (req: AuthenticatedRequest) => {
      try {
        const params = await context.params;
        const { id } = params;
        const { user } = req;
        const body = await req.json();

        if (!id) {
          return NextResponse.json(
            { success: false, error: 'ID сессии не указан' },
            { status: 400 }
          );
        }

        console.log(`🔧 API: частичное обновление сессии ${id}`);

        const sessionIndex = mockSessions.findIndex((s: Session) => s.id === id);
        if (sessionIndex === -1) {
          return NextResponse.json(
            { success: false, error: 'Сессия не найдена' },
            { status: 404 }
          );
        }

        const session = mockSessions[sessionIndex];

        // Проверка прав доступа
        if (user.role === 'trainer' && session.trainerId !== user.id) {
          return NextResponse.json(
            { success: false, error: 'Недостаточно прав для редактирования этой сессии' },
            { status: 403 }
          );
        }

        // Специальные операции
        if (body.action) {
          switch (body.action) {
            case 'complete':
              if (session.status !== 'scheduled') {
                return NextResponse.json(
                  { success: false, error: 'Можно завершить только запланированную сессию' },
                  { status: 400 }
                );
              }
              session.status = 'completed';
              if (body.notes) {
                session.notes = body.notes;
              }
              break;

            case 'markNoShow':
              if (session.status !== 'scheduled') {
                return NextResponse.json(
                                    { success: false, error: 'Можно отметить неявку только для запланированной сессии' },
                  { status: 400 }
                );
              }
              session.status = 'no-show';
              session.notes = session.notes ? 
                `${session.notes}\n\nКлиент не явился: ${new Date().toLocaleString()}` : 
                `Клиент не явился: ${new Date().toLocaleString()}`;
              break;

            case 'reschedule':
              if (!body.newDate || !body.newStartTime || !body.newEndTime) {
                return NextResponse.json(
                  { success: false, error: 'Для переноса необходимо указать новые дату и время' },
                  { status: 400 }
                );
              }

              // Проверка конфликтов для нового времени
              const conflictingSession = mockSessions.find((s: Session) => 
                s.id !== id &&
                s.trainerId === session.trainerId &&
                s.status !== 'cancelled' &&
                s.date === body.newDate &&
                (
                  (body.newStartTime >= s.startTime && body.newStartTime < s.endTime) ||
                  (body.newEndTime > s.startTime && body.newEndTime <= s.endTime) ||
                  (body.newStartTime <= s.startTime && body.newEndTime >= s.endTime)
                )
              );

              if (conflictingSession) {
                return NextResponse.json(
                  { success: false, error: 'Конфликт времени с существующей сессией' },
                  { status: 409 }
                );
              }

              session.date = body.newDate;
              session.startTime = body.newStartTime;
              session.endTime = body.newEndTime;
              session.notes = session.notes ? 
                `${session.notes}\n\nПеренесено: ${new Date().toLocaleString()}` : 
                `Перенесено: ${new Date().toLocaleString()}`;
              break;

            case 'addNotes':
              if (typeof body.notes === 'string') {
                session.notes = session.notes ? 
                  `${session.notes}\n\n${body.notes}` : 
                  body.notes;
              } else {
                return NextResponse.json(
                  { success: false, error: 'Заметки должны быть строкой' },
                  { status: 400 }
                );
              }
              break;

            case 'changeType':
              const validTypes = ['personal', 'group', 'consultation'];
              if (!validTypes.includes(body.newType)) {
                return NextResponse.json(
                  { success: false, error: 'Некорректный тип сессии' },
                  { status: 400 }
                );
              }
              session.type = body.newType;
              break;

            default:
              return NextResponse.json(
                { success: false, error: 'Неизвестное действие' },
                { status: 400 }
              );
          }

          mockSessions[sessionIndex] = session;

          // Добавление дополнительной информации для ответа
          const trainer = mockTrainers.find(t => t.id === session.trainerId);
          const client = mockClients.find(c => c.id === session.clientId);

          return NextResponse.json({
            success: true,
            data: {
              ...session,
              trainerName: trainer?.name || 'Неизвестный тренер',
              clientName: client?.name || 'Неизвестный клиент'
            },
            message: `Действие "${body.action}" выполнено успешно`
          });
        }

        return NextResponse.json(
          { success: false, error: 'Действие не указано' },
          { status: 400 }
        );

      } catch (error) {
        console.error('💥 API: ошибка частичного обновления сессии:', error);
        return NextResponse.json(
          { success: false, error: 'Ошибка обновления сессии' },
          { status: 500 }
        );
      }
    }
  );

  return handler(req, { params: {} });
};

