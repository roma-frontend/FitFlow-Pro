// app/api/schedule/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { withPermissions, type AuthenticatedRequest } from '@/lib/api-middleware';
import { mockEvents, mockTrainers, mockClients, type Event } from '@/lib/mock-data';

// GET /api/schedule - Получение расписания
export const GET = async (
  req: NextRequest,
  context: { params: Promise<Record<string, string>> }
): Promise<NextResponse> => {
  const handler = withPermissions(
    { resource: 'schedule', action: 'read' },
    async (req: AuthenticatedRequest) => {
      try {
        console.log('📅 API: получение расписания');
        
        const { user } = req;
        const url = new URL(req.url);
        const startDate = url.searchParams.get('startDate');
        const endDate = url.searchParams.get('endDate');
        const trainerId = url.searchParams.get('trainerId');
        const clientId = url.searchParams.get('clientId');
        const status = url.searchParams.get('status');

        let events = [...mockEvents];

        // Фильтрация по правам доступа
        if (user.role === 'trainer') {
          // Тренеры видят только свои события
          events = events.filter(event => event.trainerId === user.id);
        } else if (user.role === 'client') {
          // Клиенты видят только свои события
          events = events.filter(event => event.clientId === user.id);
        }

        // Фильтрация по тренеру
        if (trainerId && user.role !== 'trainer') {
          events = events.filter(event => event.trainerId === trainerId);
        }

        // Фильтрация по клиенту
        if (clientId) {
          events = events.filter(event => event.clientId === clientId);
        }

        // Фильтрация по статусу
        if (status) {
          events = events.filter(event => event.status === status);
        }

        // Фильтрация по датам
        if (startDate) {
          events = events.filter(event => 
            new Date(event.startTime) >= new Date(startDate)
          );
        }

        if (endDate) {
          events = events.filter(event => 
            new Date(event.startTime) <= new Date(endDate)
          );
        }

        // Добавление дополнительной информации
        const enrichedEvents = events.map(event => {
          const trainer = mockTrainers.find(t => t.id === event.trainerId);
          const client = mockClients.find(c => c.id === event.clientId);
          
          return {
            ...event,
            trainerName: trainer?.name || 'Неизвестный тренер',
            clientName: client?.name || 'Неизвестный клиент',
            trainerPhone: trainer?.phone,
            clientPhone: client?.phone
          };
        });

        return NextResponse.json({
          success: true,
          data: enrichedEvents,
          total: enrichedEvents.length
        });

      } catch (error) {
        console.error('💥 API: ошибка получения расписания:', error);
        return NextResponse.json(
          { success: false, error: 'Ошибка получения расписания' },
          { status: 500 }
        );
      }
    }
  );

  return handler(req, { params: {} });
};

// POST /api/schedule - Создание нового события
export const POST = async (
  req: NextRequest,
  context: { params: Promise<Record<string, string>> }
): Promise<NextResponse> => {
  const handler = withPermissions(
    { resource: 'schedule', action: 'create' },
    async (req: AuthenticatedRequest) => {
      try {
        console.log('➕ API: создание нового события');
        
        const body = await req.json();
        const { user } = req;

        // Валидация данных
        if (!body.title || !body.startTime || !body.endTime || !body.trainerId || !body.clientId) {
          return NextResponse.json(
            { success: false, error: 'Отсутствуют обязательные поля' },
            { status: 400 }
          );
        }

        // Проверка прав на создание события для конкретного тренера
        if (user.role === 'trainer' && body.trainerId !== user.id) {
          return NextResponse.json(
            { success: false, error: 'Нет прав на создание события для другого тренера' },
            { status: 403 }
          );
        }

        // Проверка существования тренера и клиента
        const trainer = mockTrainers.find(t => t.id === body.trainerId);
        const client = mockClients.find(c => c.id === body.clientId);

        if (!trainer) {
          return NextResponse.json(
            { success: false, error: 'Тренер не найден' },
            { status: 404 }
          );
        }

        if (!client) {
          return NextResponse.json(
            { success: false, error: 'Клиент не найден' },
            { status: 404 }
          );
        }

        // Проверка конфликтов времени
        const conflictingEvent = mockEvents.find(event => 
          event.trainerId === body.trainerId &&
          event.status !== 'cancelled' &&
          (
            (new Date(body.startTime) >= new Date(event.startTime) && 
             new Date(body.startTime) < new Date(event.endTime)) ||
            (new Date(body.endTime) > new Date(event.startTime) && 
             new Date(body.endTime) <= new Date(event.endTime)) ||
            (new Date(body.startTime) <= new Date(event.startTime) && 
             new Date(body.endTime) >= new Date(event.endTime))
          )
        );

        if (conflictingEvent) {
          return NextResponse.json(
            { success: false, error: 'Конфликт времени с существующим событием' },
            { status: 409 }
          );
        }

        // Валидация статуса
        const validStatuses: Event['status'][] = ['pending', 'confirmed', 'completed', 'cancelled'];
        const eventStatus: Event['status'] = validStatuses.includes(body.status as Event['status']) 
          ? body.status as Event['status'] 
          : 'pending';

        // Валидация типа
        const validTypes: Event['type'][] = ['training', 'consultation', 'group'];
        const eventType: Event['type'] = validTypes.includes(body.type as Event['type']) 
          ? body.type as Event['type'] 
          : 'training';

        const newEvent: Event = {
          _id: `event_${Date.now()}`,
          title: body.title,
          description: body.description || '',
          startTime: body.startTime,
          endTime: body.endTime,
          trainerId: body.trainerId,
          clientId: body.clientId,
          status: eventStatus,
          type: eventType,
          location: body.location || '',
          notes: body.notes || '',
          createdAt: new Date().toISOString(),
          createdBy: user.id,
          updatedAt: new Date().toISOString()
        };

        mockEvents.push(newEvent);

        console.log(`✅ API: событие создано - ${newEvent.title}`);

        return NextResponse.json({
          success: true,
          data: {
            ...newEvent,
            trainerName: trainer.name,
            clientName: client.name
          },
          message: 'Событие успешно создано'
        });

      } catch (error) {
        console.error('💥 API: ошибка создания события:', error);
        return NextResponse.json(
          { success: false, error: 'Ошибка создания события' },
          { status: 500 }
        );
      }
    }
  );

  return handler(req, { params: {} });
};

// PUT /api/schedule - Массовое обновление событий
export const PUT = async (
  req: NextRequest,
  context: { params: Promise<Record<string, string>> }
): Promise<NextResponse> => {
  const handler = withPermissions(
    { resource: 'schedule', action: 'update' },
    async (req: AuthenticatedRequest) => {
      try {
        console.log('🔄 API: массовое обновление событий');
        
        const body = await req.json();
        const { user } = req;
        const { eventIds, updates } = body;

        if (!eventIds || !Array.isArray(eventIds) || eventIds.length === 0) {
          return NextResponse.json(
            { success: false, error: 'Не указаны ID событий для обновления' },
            { status: 400 }
          );
        }

        if (!updates || typeof updates !== 'object') {
          return NextResponse.json(
            { success: false, error: 'Не указаны данные для обновления' },
            { status: 400 }
          );
        }

        let updatedCount = 0;
        const updatedEvents: Event[] = [];

        for (const eventId of eventIds) {
          const eventIndex = mockEvents.findIndex(event => event._id === eventId);
          
          if (eventIndex === -1) {
            continue; // Пропускаем несуществующие события
          }

          const event = mockEvents[eventIndex];

          // Проверка прав доступа
          if (user.role === 'trainer' && event.trainerId !== user.id) {
            continue; // Пропускаем события других тренеров
          }

          // Валидация обновлений
          const allowedFields = ['status', 'notes', 'location', 'description'];
          const filteredUpdates: Partial<Event> = {};

          for (const field of allowedFields) {
            if (updates[field] !== undefined) {
              if (field === 'status') {
                // Валидация статуса
                const validStatuses: Event['status'][] = ['pending', 'confirmed', 'completed', 'cancelled'];
                if (validStatuses.includes(updates[field] as Event['status'])) {
                  filteredUpdates.status = updates[field] as Event['status'];
                }
              } else {
                (filteredUpdates as any)[field] = updates[field];
              }
            }
          }

          // Обновление события
          const updatedEvent: Event = {
            ...event,
            ...filteredUpdates,
            updatedAt: new Date().toISOString()
          };

          mockEvents[eventIndex] = updatedEvent;
          updatedEvents.push(updatedEvent);
          updatedCount++;
        }

        console.log(`✅ API: обновлено ${updatedCount} событий`);

        return NextResponse.json({
          success: true,
          data: {
            updatedCount,
            updatedEvents
          },
          message: `Обновлено ${updatedCount} событий`
        });

      } catch (error) {
        console.error('💥 API: ошибка массового обновления событий:', error);
        return NextResponse.json(
          { success: false, error: 'Ошибка массового обновления событий' },
          { status: 500 }
        );
      }
    }
  );

  return handler(req, { params: {} });
};

// DELETE /api/schedule - Массовое удаление событий
export const DELETE = async (
  req: NextRequest,
  context: { params: Promise<Record<string, string>> }
): Promise<NextResponse> => {
  const handler = withPermissions(
    { resource: 'schedule', action: 'delete' },
    async (req: AuthenticatedRequest) => {
      try {
        console.log('🗑️ API: массовое удаление событий');
        
        const body = await req.json();
        const { user } = req;
        const { eventIds, softDelete = true } = body;

        if (!eventIds || !Array.isArray(eventIds) || eventIds.length === 0) {
          return NextResponse.json(
            { success: false, error: 'Не указаны ID событий для удаления' },
            { status: 400 }
          );
        }

        let deletedCount = 0;
        const deletedEvents: Event[] = [];

        for (const eventId of eventIds) {
          const eventIndex = mockEvents.findIndex(event => event._id === eventId);
          
          if (eventIndex === -1) {
            continue; // Пропускаем несуществующие события
          }

          const event = mockEvents[eventIndex];

          // Проверка прав доступа
          if (user.role === 'trainer' && event.trainerId !== user.id) {
            continue; // Пропускаем события других тренеров
          }

          // Проверка на удаление завершенных событий
          if (event.status === 'completed' && !softDelete) {
            continue; // Пропускаем завершенные события при жестком удалении
          }

          if (softDelete) {
            // Мягкое удаление (изменение статуса)
            const updatedEvent: Event = {
              ...event,
              status: 'cancelled' as const,
              notes: event.notes ? 
                `${event.notes}\n\nОтменено: ${new Date().toLocaleString()}` : 
                `Отменено: ${new Date().toLocaleString()}`,
              updatedAt: new Date().toISOString()
            };
            mockEvents[eventIndex] = updatedEvent;
            deletedEvents.push(updatedEvent);
          } else {
            // Жесткое удаление
            const deletedEvent = mockEvents.splice(eventIndex, 1)[0];
            deletedEvents.push(deletedEvent);
          }

          deletedCount++;
        }

        console.log(`✅ API: ${softDelete ? 'отменено' : 'удалено'} ${deletedCount} событий`);

        return NextResponse.json({
          success: true,
          data: {
            deletedCount,
            deletedEvents,
            softDelete
          },
          message: `${softDelete ? 'Отменено' : 'Удалено'} ${deletedCount} событий`
        });

      } catch (error) {
        console.error('💥 API: ошибка массового удаления событий:', error);
        return NextResponse.json(
          { success: false, error: 'Ошибка массового удаления событий' },
          { status: 500 }
        );
      }
    }
  );

  return handler(req, { params: {} });
};
