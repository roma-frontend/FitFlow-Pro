// app/api/clients/[id]/sessions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { withPermissions, AuthenticatedRequest } from '@/lib/api-middleware';
import { mockClients, mockSessions, mockTrainers, Session } from '@/lib/mock-data';

// GET /api/clients/[id]/sessions - Получение сессий клиента
export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  return withPermissions(
    { resource: 'clients', action: 'read' },
    async (authenticatedReq: AuthenticatedRequest) => {
      try {
        const { id } = await context.params;
        const { user } = authenticatedReq;
        const url = new URL(req.url);
        
        const page = parseInt(url.searchParams.get('page') || '1');
        const limit = parseInt(url.searchParams.get('limit') || '10');
        const status = url.searchParams.get('status');
        const dateFrom = url.searchParams.get('dateFrom');
        const dateTo = url.searchParams.get('dateTo');

        console.log(`📅 API: получение сессий клиента ${id}`);

        const client = mockClients.find(c => c.id === id);
        if (!client) {
          return NextResponse.json(
            { success: false, error: 'Клиент не найден' },
            { status: 404 }
          );
        }

        // Проверка прав доступа
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

        // Фильтрация сессий
        let clientSessions = mockSessions.filter((s: Session) => s.clientId === id);

        if (status) {
          clientSessions = clientSessions.filter((s: Session) => s.status === status);
        }

        if (dateFrom) {
          clientSessions = clientSessions.filter((s: Session) => s.date >= dateFrom);
        }

        if (dateTo) {
          clientSessions = clientSessions.filter((s: Session) => s.date <= dateTo);
        }

        // Сортировка по дате (новые сначала)
        clientSessions.sort((a: Session, b: Session) => 
          new Date(`${b.date}T${b.startTime}`).getTime() - new Date(`${a.date}T${a.startTime}`).getTime()
        );

        // Пагинация
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedSessions = clientSessions.slice(startIndex, endIndex);

        // Добавление информации о тренере
        const enrichedSessions = paginatedSessions.map((session: Session) => {
          const trainer = mockTrainers.find(t => t.id === session.trainerId);
          const startTime = new Date(`${session.date}T${session.startTime}`);
          const endTime = new Date(`${session.date}T${session.endTime}`);
          const duration = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));

          return {
            ...session,
            trainerName: trainer?.name || 'Неизвестный тренер',
            duration,
            dateTime: `${session.date}T${session.startTime}`
          };
        });

        return NextResponse.json({
          success: true,
          data: enrichedSessions,
          pagination: {
            page,
            limit,
            total: clientSessions.length,
            pages: Math.ceil(clientSessions.length / limit)
          },
          stats: {
            total: clientSessions.length,
            completed: clientSessions.filter((s: Session) => s.status === 'completed').length,
            scheduled: clientSessions.filter((s: Session) => s.status === 'scheduled').length,
            cancelled: clientSessions.filter((s: Session) => s.status === 'cancelled').length,
            noShow: clientSessions.filter((s: Session) => s.status === 'no-show').length
          }
        });

      } catch (error) {
        console.error('💥 API: ошибка получения сессий клиента:', error);
        return NextResponse.json(
          { success: false, error: 'Ошибка получения сессий клиента' },
          { status: 500 }
        );
      }
    }
  )(req);
}
