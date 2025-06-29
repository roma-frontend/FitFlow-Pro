// app/api/clients/stats/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { withPermissions, type AuthenticatedRequest } from '@/lib/api-middleware';
import { mockClients, mockSessions, type Client, type Session } from '@/lib/mock-data';

// Экспортируем только HTTP методы
export const GET = async (
  req: NextRequest, 
  context: { params: Promise<Record<string, string>> }
): Promise<NextResponse> => {
  // Определяем все типы и интерфейсы внутри функции
  interface ExtendedClient extends Omit<Client, 'status'> {
    status: 'active' | 'inactive' | 'suspended' | 'trial';
  }

  interface ClientActivityStats {
    clientId: string;
    clientName: string;
    totalSessions: number;
    completedSessions: number;
    lastSession: string | null;
  }

  interface DailyClientStats {
    date: string;
    newClients: number;
    activeClients: number;
    trialClients: number;
  }

  interface ClientStatusStats {
    active: number;
    inactive: number;
    trial: number;
    suspended: number;
  }

  interface MembershipStats {
    basic: number;
    premium: number;
    vip: number;
  }

  interface ClientOverviewStats {
    total: number;
    newThisPeriod: number;
    activeClients: number;
    inactiveClients: number;
    avgSessionsPerClient: number;
  }

  interface ActivityStatsData {
    topActive: ClientActivityStats[];
    inactive: number;
    totalSessions: number;
    completedSessions: number;
  }

  interface TrendsData {
    daily: DailyClientStats[];
    period: string;
    startDate: string;
    endDate: string;
  }

  interface ClientStatsResponse {
    overview: ClientOverviewStats;
    status: ClientStatusStats;
    membership: MembershipStats;
    activity: ActivityStatsData;
    trends: TrendsData;
  }

  // Вспомогательные функции внутри GET
  const getDailyClientStats = (clients: ExtendedClient[], startDate: Date, endDate: Date): DailyClientStats[] => {
    if (!Array.isArray(clients)) {
      console.error('getDailyClientStats: clients is not an array:', clients);
      return [];
    }

    const dailyStats: DailyClientStats[] = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dayStr = currentDate.toISOString().split('T')[0];
      const dayClients = clients.filter((client: ExtendedClient) => 
        client.createdAt.split('T')[0] === dayStr
      );

      dailyStats.push({
        date: dayStr,
        newClients: dayClients.length,
        activeClients: dayClients.filter((c: ExtendedClient) => c.status === 'active').length,
        trialClients: dayClients.filter((c: ExtendedClient) => c.status === 'trial').length
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dailyStats;
  };

  const calculateAdditionalMetrics = (
    clients: ExtendedClient[], 
    sessions: Session[], 
    startDate: Date, 
    endDate: Date
  ) => {
    if (!Array.isArray(clients)) {
      console.error('calculateAdditionalMetrics: clients is not an array:', clients);
      return {
        retention: { rate: 0, byMembership: {} },
        engagement: { averageSessionsPerActiveClient: 0, clientsWithRecentActivity: 0, clientsWithoutRecentActivity: 0 },
        conversion: { trialToActive: 0, trialToActiveRate: 0 },
        churn: { rate: 0, suspendedClients: 0, inactiveClients: 0 },
        revenue: { estimatedMonthlyRevenue: 0, revenueByMembership: {} },
        demographics: { byMembership: {}, averageClientAge: 0, newVsReturning: { new: 0, returning: 0 } }
      };
    }

    if (!Array.isArray(sessions)) {
      console.error('calculateAdditionalMetrics: sessions is not an array:', sessions);
      sessions = [];
    }

    const activeClients = clients.filter(c => c.status === 'active');
    const trialClients = clients.filter(c => c.status === 'trial');
    const suspendedClients = clients.filter(c => c.status === 'suspended');
    const inactiveClients = clients.filter(c => c.status === 'inactive');

    const totalClients = clients.length;
    const retainedClients = activeClients.length;
    const retentionRate = totalClients > 0 ? Math.round((retainedClients / totalClients) * 100) : 0;

    const retentionByMembership: Record<string, number> = {};
    ['basic', 'premium', 'vip'].forEach(membershipType => {
      const membershipClients = clients.filter(c => c.membershipType === membershipType);
      const activeMembershipClients = membershipClients.filter(c => c.status === 'active');
      retentionByMembership[membershipType] = membershipClients.length > 0 
        ? Math.round((activeMembershipClients.length / membershipClients.length) * 100)
        : 0;
    });

    const recentActivityThreshold = new Date();
    recentActivityThreshold.setDate(recentActivityThreshold.getDate() - 30);

    const clientsWithRecentActivity = clients.filter(client => {
      const clientSessions = sessions.filter(s => s.clientId === client.id);
      const recentSessions = clientSessions.filter(s => 
        new Date(`${s.date}T${s.startTime}`) >= recentActivityThreshold
      );
      return recentSessions.length > 0;
    }).length;

    const averageSessionsPerActiveClient = activeClients.length > 0
      ? Math.round((sessions.filter(s => s.status === 'completed').length / activeClients.length) * 100) / 100
      : 0;

    const trialToActiveConversions = clients.filter(c => 
      c.status === 'active' && 
      new Date(c.createdAt) >= startDate &&
      new Date(c.createdAt) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    ).length;

    const trialToActiveRate = trialClients.length > 0 
      ? Math.round((trialToActiveConversions / trialClients.length) * 100)
      : 0;

    const churnedClients = suspendedClients.length + inactiveClients.length;
    const churnRate = totalClients > 0 ? Math.round((churnedClients / totalClients) * 100) : 0;

    const membershipPrices = { basic: 2000, premium: 4000, vip: 8000 };
    const estimatedMonthlyRevenue = activeClients.reduce((total: number, client: ExtendedClient) => {
      const price = membershipPrices[client.membershipType as keyof typeof membershipPrices] || 0;
      return total + price;
    }, 0);

    const revenueByMembership: Record<string, number> = {};
    Object.keys(membershipPrices).forEach(membershipType => {
      const membershipActiveClients = activeClients.filter(c => c.membershipType === membershipType);
      const price = membershipPrices[membershipType as keyof typeof membershipPrices];
      revenueByMembership[membershipType] = membershipActiveClients.length * price;
    });

    const membershipDistribution: Record<string, number> = {};
    ['basic', 'premium', 'vip'].forEach(membershipType => {
      membershipDistribution[membershipType] = clients.filter(c => c.membershipType === membershipType).length;
    });

    const periodStart = new Date(startDate);
    const newClients = clients.filter(c => new Date(c.createdAt) >= periodStart).length;
    const returningClients = clients.length - newClients;

    const now = new Date();
    const averageClientAge = clients.length > 0
      ? Math.round(clients.reduce((sum: number, client: ExtendedClient) => {
          const clientAge = (now.getTime() - new Date(client.createdAt).getTime()) / (1000 * 60 * 60 * 24);
          return sum + clientAge;
        }, 0) / clients.length)
      : 0;

    return {
      retention: {
        rate: retentionRate,
        byMembership: retentionByMembership
      },
      engagement: {
        averageSessionsPerActiveClient,
        clientsWithRecentActivity,
        clientsWithoutRecentActivity: clients.length - clientsWithRecentActivity
      },
      conversion: {
        trialToActive: trialToActiveConversions,
        trialToActiveRate
      },
      churn: {
        rate: churnRate,
        suspendedClients: suspendedClients.length,
        inactiveClients: inactiveClients.length
      },
      revenue: {
        estimatedMonthlyRevenue,
        revenueByMembership
      },
      demographics: {
        byMembership: membershipDistribution,
        averageClientAge,
        newVsReturning: {
          new: newClients,
          returning: returningClients
        }
      }
    };
  };

  // Создаем обработчик внутри экспортируемой функции
  const handler = withPermissions(
    { resource: 'clients', action: 'read' },
    async (req: AuthenticatedRequest) => {
      try {
        console.log('📊 API: получение статистики клиентов');
        
        const { user } = req;
        const url = new URL(req.url);
        const period = url.searchParams.get('period') || 'month';
        const trainerId = url.searchParams.get('trainerId');

        if (!Array.isArray(mockClients)) {
          console.error('mockClients is not an array:', mockClients);
          return NextResponse.json(
            { success: false, error: 'Ошибка данных клиентов' },
            { status: 500 }
          );
        }

        if (!Array.isArray(mockSessions)) {
          console.error('mockSessions is not an array:', mockSessions);
          return NextResponse.json(
            { success: false, error: 'Ошибка данных сессий' },
            { status: 500 }
          );
        }

        let clients: ExtendedClient[] = [...mockClients].map(client => ({
          ...client,
          status: (client.status === 'inactive' && Math.random() > 0.8) ? 'trial' as const : client.status as 'active' | 'inactive' | 'suspended' | 'trial'
        }));
        
        let sessions: Session[] = [...mockSessions];

        if (user.role === 'trainer') {
          clients = clients.filter((client: ExtendedClient) => client.trainerId === user.id);
          sessions = sessions.filter((session: Session) => session.trainerId === user.id);
        } else if (trainerId && (user.role === 'admin' || user.role === 'manager')) {
          clients = clients.filter((client: ExtendedClient) => client.trainerId === trainerId);
          sessions = sessions.filter((session: Session) => session.trainerId === trainerId);
        }

        const now = new Date();
        let startDate: Date;

        switch (period) {
          case 'day':
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            break;
          case 'week':
            const weekStart = new Date(now);
            weekStart.setDate(now.getDate() - now.getDay());
            startDate = weekStart;
            break;
          case 'year':
            startDate = new Date(now.getFullYear(), 0, 1);
            break;
          default:
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        }

        const periodClients = clients.filter((client: ExtendedClient) => 
          new Date(client.createdAt) >= startDate
        );

        const statusStats: ClientStatusStats = {
          active: clients.filter((c: ExtendedClient) => c.status === 'active').length,
          inactive: clients.filter((c: ExtendedClient) => c.status === 'inactive').length,
          trial: clients.filter((c: ExtendedClient) => c.status === 'trial').length,
          suspended: clients.filter((c: ExtendedClient) => c.status === 'suspended').length
        };

        const membershipStats: MembershipStats = {
          basic: clients.filter((c: ExtendedClient) => c.membershipType === 'basic').length,
          premium: clients.filter((c: ExtendedClient) => c.membershipType === 'premium').length,
          vip: clients.filter((c: ExtendedClient) => c.membershipType === 'vip').length
        };

        const activityStats: ClientActivityStats[] = clients.map((client: ExtendedClient) => {
          const clientSessions = sessions.filter((s: Session) => s.clientId === client.id);
          const completedSessions = clientSessions.filter((s: Session) => s.status === 'completed');
          
          return {
            clientId: client.id,
            clientName: client.name,
            totalSessions: clientSessions.length,
            completedSessions: completedSessions.length,
            lastSession: completedSessions.length > 0 
              ? completedSessions
                  .sort((a: Session, b: Session) => 
                    new Date(`${b.date}T${b.startTime}`).getTime() - new Date(`${a.date}T${a.startTime}`).getTime()
                  )[0].date
              : null
          };
        });

        const topActiveClients = activityStats
          .sort((a, b) => b.completedSessions - a.completedSessions)
          .slice(0, 10);

        const inactiveClientsCount = activityStats
          .filter(client => client.completedSessions === 0)
          .length;

        const newClientsCount = periodClients.length;
        const dailyStats = getDailyClientStats(clients, startDate, now);

        const avgSessionsPerClient = clients.length > 0 
          ? Math.round(sessions.length / clients.length * 100) / 100
          : 0;

        const additionalMetrics = calculateAdditionalMetrics(clients, sessions, startDate, now);

        const stats: ClientStatsResponse = {
          overview: {
            total: clients.length,
            newThisPeriod: newClientsCount,
            activeClients: statusStats.active,
            inactiveClients: inactiveClientsCount,
            avgSessionsPerClient
          },
          status: statusStats,
          membership: membershipStats,
          activity: {
                        topActive: topActiveClients,
            inactive: inactiveClientsCount,
            totalSessions: sessions.length,
            completedSessions: sessions.filter((s: Session) => s.status === 'completed').length
          },
          trends: {
            daily: dailyStats,
            period: period,
            startDate: startDate.toISOString(),
            endDate: now.toISOString()
          }
        };

        console.log(`✅ API: статистика для ${clients.length} клиентов получена`);

        return NextResponse.json({
          success: true,
          data: {
            ...stats,
            additional: additionalMetrics
          },
          meta: {
            generatedAt: now.toISOString(),
            requestedBy: user.email,
            period: period,
            trainerId: trainerId || null,
            clientsCount: clients.length
          }
        });

      } catch (error: any) {
        console.error('💥 API: ошибка получения статистики клиентов:', error);
        return NextResponse.json(
          { success: false, error: 'Ошибка получения статистики клиентов' },
          { status: 500 }
        );
      }
    }
  );

  return handler(req, { params: {} });
};

export const POST = async (
  req: NextRequest, 
  context: { params: Promise<Record<string, string>> }
): Promise<NextResponse> => {
  // Определяем типы внутри POST
  interface ExtendedClient extends Omit<Client, 'status'> {
    status: 'active' | 'inactive' | 'suspended' | 'trial';
  }

  // Функции анализа внутри POST
  const analyzeClientSegments = (clients: ExtendedClient[], sessions: Session[]) => {
    const segments = [];
    const insights: Array<{
      type: 'success' | 'warning' | 'info';
      title: string;
      description: string;
      segment: string;
    }> = [];

    if (!Array.isArray(clients)) {
      console.error('analyzeClientSegments: clients is not an array:', clients);
      return { segments: [], insights: [] };
    }

    if (!Array.isArray(sessions)) {
      console.error('analyzeClientSegments: sessions is not an array:', sessions);
      sessions = [];
    }

    const vipClients = clients.filter((c: ExtendedClient) => c.membershipType === 'vip' && c.status === 'active');
    const vipSessions = sessions.filter((s: Session) => vipClients.some((c: ExtendedClient) => c.id === s.clientId));
    
    segments.push({
      name: 'VIP клиенты',
      count: vipClients.length,
      percentage: clients.length > 0 ? Math.round((vipClients.length / clients.length) * 100) : 0,
      characteristics: ['Премиум членство', 'Высокая лояльность', 'Максимальный доход'],
      averageSessions: vipClients.length > 0 ? Math.round(vipSessions.length / vipClients.length * 10) / 10 : 0,
      revenue: vipClients.length * 8000
    });

    const activeUsers = clients.filter((c: ExtendedClient) => {
      const clientSessions = sessions.filter((s: Session) => s.clientId === c.id && s.status === 'completed');
      return clientSessions.length >= 4;
    });
    
    segments.push({
      name: 'Активные пользователи',
      count: activeUsers.length,
      percentage: clients.length > 0 ? Math.round((activeUsers.length / clients.length) * 100) : 0,
      characteristics: ['Регулярные тренировки', 'Высокая вовлеченность'],
      averageSessions: activeUsers.length > 0 ? 
        Math.round(sessions.filter((s: Session) => activeUsers.some((c: ExtendedClient) => c.id === s.clientId)).length / activeUsers.length * 10) / 10 : 0,
      revenue: activeUsers.reduce((sum: number, client: ExtendedClient) => {
        const price = client.membershipType === 'vip' ? 8000 : client.membershipType === 'premium' ? 4000 : 2000;
        return sum + price;
      }, 0)
    });

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newbies = clients.filter((c: ExtendedClient) => new Date(c.createdAt) >= thirtyDaysAgo);
    
    segments.push({
      name: 'Новички',
      count: newbies.length,
      percentage: clients.length > 0 ? Math.round((newbies.length / clients.length) * 100) : 0,
      characteristics: ['Недавняя регистрация', 'Период адаптации'],
      averageSessions: newbies.length > 0 ? 
        Math.round(sessions.filter((s: Session) => newbies.some((c: ExtendedClient) => c.id === s.clientId)).length / newbies.length * 10) / 10 : 0,
      revenue: newbies.reduce((sum: number, client: ExtendedClient) => {
        const price = client.membershipType === 'vip' ? 8000 : client.membershipType === 'premium' ? 4000 : 2000;
        return sum + price;
      }, 0)
    });

    const riskClients = clients.filter((c: ExtendedClient) => {
      const clientSessions = sessions.filter((s: Session) => s.clientId === c.id);
      const recentSessions = clientSessions.filter((s: Session) => {
        const sessionDate = new Date(`${s.date}T${s.startTime}`);
        const twoWeeksAgo = new Date();
        twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
        return sessionDate >= twoWeeksAgo;
      });
      return recentSessions.length === 0 && c.status === 'active';
    });

    segments.push({
      name: 'Группа риска',
      count: riskClients.length,
      percentage: clients.length > 0 ? Math.round((riskClients.length / clients.length) * 100) : 0,
      characteristics: ['Нет активности 2+ недели', 'Риск оттока'],
      averageSessions: 0,
      revenue: riskClients.reduce((sum: number, client: ExtendedClient) => {
        const price = client.membershipType === 'vip' ? 8000 : client.membershipType === 'premium' ? 4000 : 2000;
        return sum + price;
      }, 0)
    });

    const trialClients = clients.filter((c: ExtendedClient) => c.status === 'trial');
    
    segments.push({
      name: 'Пробные клиенты',
      count: trialClients.length,
      percentage: clients.length > 0 ? Math.round((trialClients.length / clients.length) * 100) : 0,
      characteristics: ['Пробный период', 'Потенциал конверсии'],
      averageSessions: trialClients.length > 0 ? 
        Math.round(sessions.filter((s: Session) => trialClients.some((c: ExtendedClient) => c.id === s.clientId)).length / trialClients.length * 10) / 10 : 0,
      revenue: trialClients.length * 1000
    });

    // Генерация инсайтов
    if (vipClients.length > 0) {
      insights.push({
        type: 'success',
        title: 'VIP сегмент',
        description: `${vipClients.length} VIP клиентов приносят ${(vipClients.length * 8000).toLocaleString('ru-RU')} ₽ в месяц`,
        segment: 'VIP клиенты'
      });
    }

    if (riskClients.length > clients.length * 0.2) {
      insights.push({
        type: 'warning',
        title: 'Высокий риск оттока',
        description: `${riskClients.length} клиентов (${Math.round((riskClients.length / clients.length) * 100)}%) не проявляют активность`,
        segment: 'Группа риска'
      });
    }

    if (newbies.length > clients.length * 0.3) {
      insights.push({
        type: 'info',
        title: 'Приток новых клиентов',
        description: `${newbies.length} новых клиентов за последний месяц - хороший показатель роста`,
        segment: 'Новички'
      });
    }

    if (trialClients.length > 0) {
      insights.push({
        type: 'info',
        title: 'Пробные клиенты',
        description: `${trialClients.length} клиентов в пробном периоде - возможность для конверсии`,
        segment: 'Пробные клиенты'
      });
    }

    if (activeUsers.length > clients.length * 0.4) {
      insights.push({
        type: 'success',
        title: 'Высокая активность',
        description: `${Math.round((activeUsers.length / clients.length) * 100)}% клиентов показывают высокую активность`,
        segment: 'Активные пользователи'
      });
    }

    return { segments, insights };
  };

  // Создаем обработчик внутри экспортируемой функции
  const handler = withPermissions(
    { resource: 'analytics', action: 'read' },
    async (req: AuthenticatedRequest) => {
      try {
        const body = await req.json();
        const { type = 'segments', filters = {}, dateRange } = body;

        if (!Array.isArray(mockClients)) {
          console.error('mockClients is not an array:', mockClients);
          return NextResponse.json(
            { success: false, error: 'Ошибка данных клиентов' },
            { status: 500 }
          );
        }

        if (!Array.isArray(mockSessions)) {
          console.error('mockSessions is not an array:', mockSessions);
          return NextResponse.json(
            { success: false, error: 'Ошибка данных сессий' },
            { status: 500 }
          );
        }

        let clients: ExtendedClient[] = [...mockClients].map(client => ({
          ...client,
          status: (client.status === 'inactive' && Math.random() > 0.8) ? 'trial' as const : client.status as 'active' | 'inactive' | 'suspended' | 'trial'
        }));

        let sessions: Session[] = [...mockSessions];

        // Применяем фильтры
        if (filters.membershipType) {
          const membershipTypes = Array.isArray(filters.membershipType) ? filters.membershipType : [filters.membershipType];
          clients = clients.filter((c: ExtendedClient) => membershipTypes.includes(c.membershipType));
        }

        if (filters.status) {
          const statuses = Array.isArray(filters.status) ? filters.status : [filters.status];
          clients = clients.filter((c: ExtendedClient) => statuses.includes(c.status));
        }

        if (filters.trainerId) {
          const trainerIds = Array.isArray(filters.trainerId) ? filters.trainerId : [filters.trainerId];
          clients = clients.filter((c: ExtendedClient) => c.trainerId && trainerIds.includes(c.trainerId));
          sessions = sessions.filter((s: Session) => s.trainerId && trainerIds.includes(s.trainerId));
        }

        if (dateRange?.startDate && dateRange?.endDate) {
          sessions = sessions.filter((s: Session) => 
            s.date >= dateRange.startDate && s.date <= dateRange.endDate
          );
        }

        let result;
        switch (type) {
          case 'segments':
            result = analyzeClientSegments(clients, sessions);
            break;
          default:
            result = analyzeClientSegments(clients, sessions);
        }

        return NextResponse.json({
          success: true,
          data: {
            ...result,
            meta: {
              type,
              clientsAnalyzed: clients.length,
              sessionsAnalyzed: sessions.length,
              appliedFilters: filters,
              dateRange
            }
          }
        });

      } catch (error: any) {
        console.error('💥 API: ошибка анализа клиентов:', error);
        return NextResponse.json(
          { success: false, error: 'Ошибка анализа клиентов' },
          { status: 500 }
        );
      }
    }
  );

  return handler(req, { params: {} });
};

