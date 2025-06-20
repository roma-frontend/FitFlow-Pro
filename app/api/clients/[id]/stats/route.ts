// app/api/clients/[id]/stats/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { withPermissions, AuthenticatedRequest } from '@/lib/api-middleware';
import { mockClients, mockSessions, mockTrainers, Session } from '@/lib/mock-data';

// GET /api/clients/[id]/stats - Получение статистики клиента
export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  return withPermissions(
    { resource: 'clients', action: 'read' },
    async (authenticatedReq: AuthenticatedRequest) => {
      try {
        const { id } = await context.params;
        const { user } = authenticatedReq;

        console.log(`📊 API: получение статистики клиента ${id}`);

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

        const clientSessions = mockSessions.filter((s: Session) => s.clientId === id);
        const now = new Date();
        const today = now.toISOString().split('T')[0];
        const thisWeekStart = new Date(now.setDate(now.getDate() - now.getDay()));
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

        // Подсчет статистики
        const stats = {
          profile: {
            id: client.id,
            name: client.name,
            membershipType: client.membershipType,
            status: client.status,
            joinDate: client.joinDate,
            trainer: client.trainerId ? {
              id: client.trainerId,
              name: mockTrainers.find(t => t.id === client.trainerId)?.name || 'Неизвестный тренер'
            } : null
          },
          sessions: {
            total: clientSessions.length,
            completed: clientSessions.filter((s: Session) => s.status === 'completed').length,
            scheduled: clientSessions.filter((s: Session) => s.status === 'scheduled').length,
            cancelled: clientSessions.filter((s: Session) => s.status === 'cancelled').length,
            noShow: clientSessions.filter((s: Session) => s.status === 'no-show').length,
            today: clientSessions.filter((s: Session) => s.date === today).length,
            thisWeek: clientSessions.filter((s: Session) => {
              const sessionDate = new Date(s.date);
              return sessionDate >= thisWeekStart;
            }).length,
            thisMonth: clientSessions.filter((s: Session) => {
              const sessionDate = new Date(s.date);
              return sessionDate >= thisMonthStart;
            }).length,
            byType: {
              personal: clientSessions.filter((s: Session) => s.type === 'personal').length,
              group: clientSessions.filter((s: Session) => s.type === 'group').length,
              consultation: clientSessions.filter((s: Session) => s.type === 'consultation').length
            }
          },
          attendance: {
            rate: clientSessions.length > 0 
              ? Math.round((clientSessions.filter((s: Session) => s.status === 'completed').length / clientSessions.length) * 100)
              : 0,
            completionRate: clientSessions.filter((s: Session) => s.status !== 'scheduled').length > 0
              ? Math.round((clientSessions.filter((s: Session) => s.status === 'completed').length / 
                  clientSessions.filter((s: Session) => s.status !== 'scheduled').length) * 100)
              : 0,
            noShowRate: clientSessions.length > 0
              ? Math.round((clientSessions.filter((s: Session) => s.status === 'no-show').length / clientSessions.length) * 100)
              : 0,
            cancellationRate: clientSessions.length > 0
              ? Math.round((clientSessions.filter((s: Session) => s.status === 'cancelled').length / clientSessions.length) * 100)
              : 0
          },
          timeline: {
            firstSession: clientSessions.length > 0 
              ? clientSessions
                  .filter((s: Session) => s.status === 'completed')
                  .sort((a: Session, b: Session) => 
                    new Date(`${a.date}T${a.startTime}`).getTime() - new Date(`${b.date}T${b.startTime}`).getTime()
                  )[0]?.date || null
              : null,
            lastSession: clientSessions.length > 0
              ? clientSessions
                  .filter((s: Session) => s.status === 'completed')
                  .sort((a: Session, b: Session) => 
                    new Date(`${b.date}T${b.startTime}`).getTime() - new Date(`${a.date}T${a.startTime}`).getTime()
                  )[0]?.date || null
              : null,
            nextSession: clientSessions
              .filter((s: Session) => s.status === 'scheduled' && new Date(`${s.date}T${s.startTime}`) > now)
              .sort((a: Session, b: Session) => 
                new Date(`${a.date}T${a.startTime}`).getTime() - new Date(`${b.date}T${b.startTime}`).getTime()
              )[0] || null
          },
          monthlyStats: getMonthlyStats(clientSessions),
          recentActivity: clientSessions
            .filter((s: Session) => s.status === 'completed')
            .sort((a: Session, b: Session) => 
              new Date(`${b.date}T${b.startTime}`).getTime() - new Date(`${a.date}T${a.startTime}`).getTime()
            )
            .slice(0, 5)
            .map((s: Session) => ({
              date: s.date,
              type: s.type,
              duration: Math.round(
                (new Date(`${s.date}T${s.endTime}`).getTime() - new Date(`${s.date}T${s.startTime}`).getTime()) / (1000 * 60)
              ),
              notes: s.notes || ''
            }))
        };

        return NextResponse.json({
          success: true,
          data: stats
        });

      } catch (error) {
        console.error('💥 API: ошибка получения статистики клиента:', error);
        return NextResponse.json(
          { success: false, error: 'Ошибка получения статистики клиента' },
          { status: 500 }
        );
      }
    }
  )(req);
}

// Вспомогательная функция для получения месячной статистики
function getMonthlyStats(sessions: Session[]) {
  const monthlyData: { [key: string]: { completed: number; cancelled: number; noShow: number } } = {};
  
  sessions.forEach((session: Session) => {
    const monthKey = session.date.substring(0, 7); // YYYY-MM
    
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { completed: 0, cancelled: 0, noShow: 0 };
    }
    
    if (session.status === 'completed') {
      monthlyData[monthKey].completed++;
    } else if (session.status === 'cancelled') {
      monthlyData[monthKey].cancelled++;
    } else if (session.status === 'no-show') {
      monthlyData[monthKey].noShow++;
    }
  });
  
  // Сортируем по месяцам и возвращаем последние 12 месяцев
  return Object.entries(monthlyData)
    .sort(([a], [b]) => b.localeCompare(a))
    .slice(0, 12)
    .reverse()
    .map(([month, stats]) => ({
      month,
      ...stats,
      total: stats.completed + stats.cancelled + stats.noShow
    }));
}
