// app/api/analytics/summary/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { mockSessions, mockTrainers, mockClients } from '@/lib/mock-data';

// Типы для пользователя
interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'trainer' | 'client' | 'manager';
}

// Функция для получения аутентифицированного пользователя
async function getAuthenticatedUser(request: NextRequest): Promise<User | null> {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '') || 
                  request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return null;
    }

    return {
      id: 'user-1',
      name: 'Администратор',
      email: 'admin@example.com',
      role: 'admin'
    };
  } catch (error) {
    console.error('Ошибка аутентификации:', error);
    return null;
  }
}

// Функция проверки прав
function hasPermission(user: User, resource: string, action: string): boolean {
  if (user.role === 'admin') {
    return true;
  }
  
  if (user.role === 'manager' && resource === 'analytics') {
    return true;
  }
  
  if (user.role === 'trainer' && resource === 'analytics' && action === 'read') {
    return true;
  }
  
  return false;
}

// Функция для проверки, является ли пользователь персоналом
function isStaff(userRole: string): boolean {
  return userRole === 'admin' || userRole === 'manager';
}

// GET /api/analytics/summary - Получение сводной статистики
export async function GET(request: NextRequest) {
  try {
    console.log('📈 API: получение сводной статистики');

    // Проверка аутентификации и прав
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Не авторизован' },
        { status: 401 }
      );
    }

    if (!hasPermission(user, 'analytics', 'read')) {
      return NextResponse.json(
        { success: false, error: 'Недостаточно прав' },
        { status: 403 }
      );
    }

    const now = new Date();

    // Фильтрация данных по правам доступа
    let sessions = [...mockSessions];
    let trainers = [...mockTrainers];
    let clients = [...mockClients];

    if (user.role === 'trainer') {
      sessions = sessions.filter(s => s.trainerId === user.id);
      trainers = trainers.filter(t => t.id === user.id);
      clients = clients.filter(c => c.trainerId === user.id);
    }

    // Временные периоды
    const today = now.toISOString().split('T')[0];
    const thisWeekStart = new Date(now);
    thisWeekStart.setDate(now.getDate() - now.getDay());
    thisWeekStart.setHours(0, 0, 0, 0);

    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisYearStart = new Date(now.getFullYear(), 0, 1);

    // Функция для фильтрации сессий по периоду
    const getSessionsInPeriod = (startDate: Date, endDate?: Date) => {
      return sessions.filter(session => {
        const sessionDate = new Date(`${session.date}T${session.startTime}`);
        return sessionDate >= startDate && (!endDate || sessionDate <= endDate);
      });
    };

    // Статистика по периодам
    const todaySessions = sessions.filter(s => s.date === today);
    const weekSessions = getSessionsInPeriod(thisWeekStart);
    const monthSessions = getSessionsInPeriod(thisMonthStart);
    const yearSessions = getSessionsInPeriod(thisYearStart);

    // Функция для расчета метрик периода
    const calculatePeriodMetrics = (periodSessions: typeof sessions) => {
      const completed = periodSessions.filter(s => s.status === 'completed');
      const cancelled = periodSessions.filter(s => s.status === 'cancelled');
      const scheduled = periodSessions.filter(s => s.status === 'scheduled');
      
      return {
        total: periodSessions.length,
        completed: completed.length,
        cancelled: cancelled.length,
        scheduled: scheduled.length,
        revenue: completed.length * 2000,
        uniqueClients: new Set(periodSessions.map(s => s.clientId)).size,
        completionRate: periodSessions.length > 0 ? Math.round((completed.length / periodSessions.length) * 100) : 0
      };
    };

    // Метрики по периодам
    const metrics = {
      today: calculatePeriodMetrics(todaySessions),
      week: calculatePeriodMetrics(weekSessions),
      month: calculatePeriodMetrics(monthSessions),
      year: calculatePeriodMetrics(yearSessions)
    };

    // Общая статистика
    const totalClients = clients.length;
    const activeClients = clients.filter(c => c.status === 'active').length;
    const totalTrainers = trainers.length;
    const activeTrainers = trainers.filter(t => t.status === 'active').length;

    // Средние показатели
    const avgSessionsPerTrainer = totalTrainers > 0 ? Math.round(yearSessions.length / totalTrainers) : 0;
    const avgClientsPerTrainer = totalTrainers > 0 ? Math.round(totalClients / totalTrainers) : 0;
    const avgRevenuePerSession = 2000;

    // Топ показатели (только для персонала)
    let topPerformers = null;
    if (isStaff(user.role) && user.role !== 'trainer') {
      const trainerPerformance = trainers.map(trainer => {
        const trainerSessions = monthSessions.filter(s => s.trainerId === trainer.id);
        const completed = trainerSessions.filter(s => s.status === 'completed');
        
        return {
          id: trainer.id,
          name: trainer.name,
          sessions: completed.length,
          revenue: completed.length * 2000,
          clients: new Set(trainerSessions.map(s => s.clientId)).size,
          rating: trainer.rating || 0
        };
      });

      topPerformers = {
        byRevenue: [...trainerPerformance].sort((a, b) => b.revenue - a.revenue).slice(0, 3),
        bySessions: [...trainerPerformance].sort((a, b) => b.sessions - a.sessions).slice(0, 3),
        byRating: [...trainerPerformance].sort((a, b) => b.rating - a.rating).slice(0, 3)
      };
    }

    // Тренды (сравнение с предыдущими периодами)
    const prevMonthStart = new Date(thisMonthStart);
    prevMonthStart.setMonth(prevMonthStart.getMonth() - 1);
    const prevMonthSessions = getSessionsInPeriod(prevMonthStart, thisMonthStart);
    const prevMonthMetrics = calculatePeriodMetrics(prevMonthSessions);

    const trends = {
      sessions: prevMonthMetrics.total > 0 
        ? Math.round(((metrics.month.total - prevMonthMetrics.total) / prevMonthMetrics.total) * 100)
        : 0,
      revenue: prevMonthMetrics.revenue > 0
        ? Math.round(((metrics.month.revenue - prevMonthMetrics.revenue) / prevMonthMetrics.revenue) * 100)
        : 0,
      clients: prevMonthMetrics.uniqueClients > 0
        ? Math.round(((metrics.month.uniqueClients - prevMonthMetrics.uniqueClients) / prevMonthMetrics.uniqueClients) * 100)
        : 0
    };

    // Распределение по типам сессий
    const sessionTypes = {
      personal: monthSessions.filter(s => s.type === 'personal').length,
      group: monthSessions.filter(s => s.type === 'group').length,
      consultation: monthSessions.filter(s => s.type === 'consultation').length
    };

    // Распределение по статусам
    const sessionStatuses = {
      completed: monthSessions.filter(s => s.status === 'completed').length,
      scheduled: monthSessions.filter(s => s.status === 'scheduled').length,
      cancelled: monthSessions.filter(s => s.status === 'cancelled').length,
      'no-show': monthSessions.filter(s => s.status === 'no-show').length
    };

    const summary = {
      overview: {
        totalClients,
        activeClients,
        totalTrainers,
        activeTrainers,
        avgSessionsPerTrainer,
        avgClientsPerTrainer,
        avgRevenuePerSession
      },
      metrics,
      trends,
      distribution: {
        sessionTypes,
        sessionStatuses
      },
      topPerformers,
      generatedAt: now.toISOString(),
      userRole: user.role,
      scope: user.role === 'trainer' ? 'personal' : 'global'
    };

    console.log(`✅ API: сводная статистика сформирована для ${user.role}`);

    return NextResponse.json({
      success: true,
      data: summary
    });

  } catch (error: any) {
    console.error('💥 API: ошибка получения сводной статистики:', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка получения сводной статистики' },
      { status: 500 }
    );
  }
}
