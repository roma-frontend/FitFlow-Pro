// app/api/analytics/trainers/overview/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { withPermissions, AuthenticatedRequest } from '@/lib/api-middleware';
import { mockSessions, mockTrainers, mockClients } from '@/lib/mock-data';
import { isManager, isAdmin } from '@/lib/permissions';

// Интерфейсы для типизации
interface TrainerOverview {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
  specialization: string[];
  rating: number;
  experience: number;
  joinDate: string;
  totalSessions: number;
  completedSessions: number;
  cancelledSessions: number;
  scheduledSessions: number;
  revenue: number;
  totalClients: number;
  activeClients: number;
  uniqueClientsInPeriod: number;
  completionRate: number;
  cancellationRate: number;
  utilizationRate: number;
  sessionsGrowth: number;
  revenueGrowth: number;
  avgSessionsPerDay: number;
  avgRevenuePerSession: number;
  sessionTypes: {
    personal: number;
    group: number;
    consultation: number;
  };
  lastSessionDate: string | null;
  performanceScore: number;
}

interface PerformanceMetrics {
  completionRate: number;
  utilizationRate: number;
  rating: number;
  clientRetention: number;
  growth: number;
}

interface ManagementInsight {
  type: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  actionRequired: boolean;
  affectedTrainers?: string[];
}

interface OverviewRecommendation {
  category: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  impact: string;
}

// GET /api/analytics/trainers/overview - Обзор всех тренеров
export async function GET(req: NextRequest) {
  return withPermissions(
    { resource: 'analytics', action: 'read' },
    async (authenticatedReq: AuthenticatedRequest) => {
      try {
        console.log('📈 API: получение обзора всех тренеров');

        const { user } = authenticatedReq;
        const url = new URL(req.url);
        const period = url.searchParams.get('period') || 'month';
        const sortBy = url.searchParams.get('sortBy') || 'sessions';
        const order = url.searchParams.get('order') || 'desc';

        // Проверка прав доступа
        if (!isManager(user.role) && !isAdmin(user.role)) {
          return NextResponse.json(
            { success: false, error: 'Недостаточно прав для просмотра обзора тренеров' },
            { status: 403 }
          );
        }

        // Определение временного периода
        const now = new Date();
        let startDate: Date;

        switch (period) {
          case 'week':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case 'month':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            break;
          case 'quarter':
            startDate = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
            break;
          case 'year':
            startDate = new Date(now.getFullYear(), 0, 1);
            break;
          default:
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        }

        // Получение только активных тренеров
        const activeTrainers = mockTrainers.filter((t: any) => t.status === 'active' && t.role === 'trainer');

        // Расчет метрик для каждого тренера
        const trainersOverview: TrainerOverview[] = activeTrainers.map((trainer: any) => {
          const trainerSessions = mockSessions.filter((s: any) => s.trainerId === trainer.id);
          const trainerClients = mockClients.filter((c: any) => c.trainerId === trainer.id);

          const periodSessions = trainerSessions.filter((session: any) => {
            const sessionDate = new Date(`${session.date}T${session.startTime}`);
            return sessionDate >= startDate;
          });

          const completedSessions = periodSessions.filter((s: any) => s.status === 'completed');
          const cancelledSessions = periodSessions.filter((s: any) => s.status === 'cancelled');
          const scheduledSessions = periodSessions.filter((s: any) => s.status === 'scheduled');

          // Расчет предыдущего периода для роста
          const prevStartDate = new Date(startDate);
          switch (period) {
            case 'week':
              prevStartDate.setDate(prevStartDate.getDate() - 7);
              break;
            case 'month':
              prevStartDate.setMonth(prevStartDate.getMonth() - 1);
              break;
            case 'quarter':
              prevStartDate.setMonth(prevStartDate.getMonth() - 3);
              break;
            case 'year':
              prevStartDate.setFullYear(prevStartDate.getFullYear() - 1);
              break;
          }

          const prevPeriodSessions = trainerSessions.filter((session: any) => {
            const sessionDate = new Date(`${session.date}T${session.startTime}`);
            return sessionDate >= prevStartDate && sessionDate < startDate;
          });

          const prevCompletedSessions = prevPeriodSessions.filter((s: any) => s.status === 'completed');

          // Расчет роста
          const sessionsGrowth = prevCompletedSessions.length > 0
            ? Math.round(((completedSessions.length - prevCompletedSessions.length) / prevCompletedSessions.length) * 100)
            : completedSessions.length > 0 ? 100 : 0;

          const revenueGrowth = prevCompletedSessions.length > 0
            ? Math.round(((completedSessions.length * 2000 - prevCompletedSessions.length * 2000) / (prevCompletedSessions.length * 2000)) * 100)
            : completedSessions.length > 0 ? 100 : 0;

          // Расчет загрузки (процент от максимально возможных сессий)
          const daysDiff = Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
          const maxPossibleSessions = daysDiff * 8; // 8 сессий в день максимум
          const utilizationRate = maxPossibleSessions > 0 ? Math.round((periodSessions.length / maxPossibleSessions) * 100) : 0;

          // Получение последней сессии
          const lastSession = trainerSessions.length > 0
            ? trainerSessions
              .sort((a: any, b: any) => new Date(`${b.date}T${b.startTime}`).getTime() - new Date(`${a.date}T${a.startTime}`).getTime())[0]
            : null;

          return {
            id: trainer.id,
            name: trainer.name,
            email: trainer.email,
            avatar: trainer.avatar || null,
            specialization: Array.isArray(trainer.specialization) ? trainer.specialization : [],
            rating: trainer.rating || 0,
            experience: trainer.experience || 0,
            joinDate: trainer.createdAt || new Date().toISOString(),

            // Основные метрики
            totalSessions: periodSessions.length,
            completedSessions: completedSessions.length,
            cancelledSessions: cancelledSessions.length,
            scheduledSessions: scheduledSessions.length,
            revenue: completedSessions.length * 2000,

            // Клиентские метрики
            totalClients: trainerClients.length,
            activeClients: trainerClients.filter((c: any) => c.status === 'active').length,
            uniqueClientsInPeriod: new Set(periodSessions.map((s: any) => s.clientId)).size,

            // Эффективность
            completionRate: periodSessions.length > 0 ?
              Math.round((completedSessions.length / periodSessions.length) * 100) : 0,
            cancellationRate: periodSessions.length > 0 ?
              Math.round((cancelledSessions.length / periodSessions.length) * 100) : 0,
            utilizationRate: Math.min(utilizationRate, 100),

            // Рост
            sessionsGrowth,
            revenueGrowth,

            // Дополнительные метрики
            avgSessionsPerDay: daysDiff > 0 ?
              Math.round((completedSessions.length / daysDiff) * 10) / 10 : 0,
            avgRevenuePerSession: 2000,

            // Типы сессий
            sessionTypes: {
              personal: periodSessions.filter((s: any) => s.type === 'personal').length,
              group: periodSessions.filter((s: any) => s.type === 'group').length,
              consultation: periodSessions.filter((s: any) => s.type === 'consultation').length
            },

            // Статус активности
            lastSessionDate: lastSession?.date || null,

            // Оценка производительности
            performanceScore: calculatePerformanceScore({
              completionRate: periodSessions.length > 0 ? (completedSessions.length / periodSessions.length) * 100 : 0,
              utilizationRate: Math.min(utilizationRate, 100),
              rating: trainer.rating || 0,
              clientRetention: trainerClients.length > 0 ? (trainerClients.filter((c: any) => c.status === 'active').length / trainerClients.length) * 100 : 0,
              growth: sessionsGrowth
            })
          };
        });

        // Сортировка с правильной типизацией
        const sortedTrainers = [...trainersOverview].sort((a, b) => {
          let aValue: string | number;
          let bValue: string | number;

          switch (sortBy) {
            case 'name':
              aValue = a.name.toLowerCase();
              bValue = b.name.toLowerCase();
              break;
            case 'sessions':
              aValue = a.completedSessions;
              bValue = b.completedSessions;
              break;
            case 'revenue':
              aValue = a.revenue;
              bValue = b.revenue;
              break;
            case 'efficiency':
              aValue = a.completionRate;
              bValue = b.completionRate;
              break;
            case 'rating':
              aValue = a.rating;
              bValue = b.rating;
              break;
            case 'clients':
              aValue = a.uniqueClientsInPeriod;
              bValue = b.uniqueClientsInPeriod;
              break;
            case 'performance':
              aValue = a.performanceScore;
              bValue = b.performanceScore;
              break;
            default:
              aValue = a.completedSessions;
              bValue = b.completedSessions;
          }

          // Правильная обработка сортировки для строк и чисел
          if (typeof aValue === 'string' && typeof bValue === 'string') {
            return order === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
          }

          if (typeof aValue === 'number' && typeof bValue === 'number') {
            return order === 'asc' ? aValue - bValue : bValue - aValue;
          }

          // Fallback для смешанных типов
          return 0;
        });

        // Общая статистика
        const totalStats = {
          totalTrainers: activeTrainers.length,
          totalSessions: trainersOverview.reduce((sum, t) => sum + t.completedSessions, 0),
          totalRevenue: trainersOverview.reduce((sum, t) => sum + t.revenue, 0),
          totalClients: trainersOverview.reduce((sum, t) => sum + t.uniqueClientsInPeriod, 0),
          avgCompletionRate: trainersOverview.length > 0 ?
            Math.round(trainersOverview.reduce((sum, t) => sum + t.completionRate, 0) / trainersOverview.length) : 0,
          avgRating: trainersOverview.length > 0 ?
            Math.round(trainersOverview.reduce((sum, t) => sum + t.rating, 0) / trainersOverview.length * 10) / 10 : 0,
          avgUtilization: trainersOverview.length > 0 ?
            Math.round(trainersOverview.reduce((sum, t) => sum + t.utilizationRate, 0) / trainersOverview.length) : 0
        };

        // Категории производительности
        const performanceCategories = {
          excellent: sortedTrainers.filter(t => t.performanceScore >= 85).length,
          good: sortedTrainers.filter(t => t.performanceScore >= 70 && t.performanceScore < 85).length,
          average: sortedTrainers.filter(t => t.performanceScore >= 50 && t.performanceScore < 70).length,
          needsImprovement: sortedTrainers.filter(t => t.performanceScore < 50).length
        };

        // Топ исполнители
        const topPerformers = {
          bySessions: [...sortedTrainers].sort((a, b) => b.completedSessions - a.completedSessions).slice(0, 3),
          byRevenue: [...sortedTrainers].sort((a, b) => b.revenue - a.revenue).slice(0, 3),
          byEfficiency: [...sortedTrainers].sort((a, b) => b.completionRate - a.completionRate).slice(0, 3),
          byRating: [...sortedTrainers].sort((a, b) => b.rating - a.rating).slice(0, 3),
          byGrowth: [...sortedTrainers].sort((a, b) => b.sessionsGrowth - a.sessionsGrowth).slice(0, 3)
        };

        // Анализ трендов
        const trends = {
          growingTrainers: sortedTrainers.filter(t => t.sessionsGrowth > 10).length,
          decliningTrainers: sortedTrainers.filter(t => t.sessionsGrowth < -10).length,
          stableTrainers: sortedTrainers.filter(t => t.sessionsGrowth >= -10 && t.sessionsGrowth <= 10).length,
          highUtilization: sortedTrainers.filter(t => t.utilizationRate > 70).length,
          lowUtilization: sortedTrainers.filter(t => t.utilizationRate < 30).length
        };

        // Рекомендации для управления
        const managementInsights = generateManagementInsights(sortedTrainers, totalStats);

        const overview = {
          period: {
            type: period,
            start: startDate.toISOString(),
            end: now.toISOString()
          },
          sorting: {
            sortBy,
            order
          },
          totalStats,
          performanceCategories,
          topPerformers,
          trends,
          trainers: sortedTrainers,
          insights: managementInsights,
          recommendations: generateOverviewRecommendations(sortedTrainers, totalStats, trends)
        };

        console.log(`✅ API: обзор ${activeTrainers.length} тренеров сформирован`);

        return NextResponse.json({
          success: true,
          data: overview,
          meta: {
            generatedAt: now.toISOString(),
            requestedBy: user.email,
            trainersCount: activeTrainers.length,
            period: period
          }
        });

      } catch (error: any) {
        console.error('💥 API: ошибка получения обзора тренеров:', error);
        return NextResponse.json(
          { success: false, error: 'Ошибка получения обзора тренеров' },
          { status: 500 }
        );
      }
    }
  )(req);
}

// ВНУТРЕННИЕ ФУНКЦИИ (НЕ ЭКСПОРТИРУЕМЫЕ)

// Функция расчета общего балла производительности
function calculatePerformanceScore(metrics: PerformanceMetrics): number {
  const weights = {
    completionRate: 0.25,    // 25% - качество выполнения
    utilizationRate: 0.20,   // 20% - эффективность использования времени
    rating: 0.20,            // 20% - оценка клиентов
    clientRetention: 0.20,   // 20% - удержание клиентов
    growth: 0.15             // 15% - рост показателей
  };

  // Нормализация метрик к шкале 0-100
  const normalizedMetrics = {
    completionRate: Math.min(metrics.completionRate, 100),
    utilizationRate: Math.min(metrics.utilizationRate, 100),
    rating: (metrics.rating / 5) * 100, // Рейтинг из 5 в проценты
    clientRetention: Math.min(metrics.clientRetention, 100),
    growth: Math.max(0, Math.min((metrics.growth + 50) / 100 * 100, 100)) // Рост от -50% до +50% нормализуется к 0-100
  };

  const score = Object.entries(weights).reduce((total, [key, weight]) => {
    const metricValue = normalizedMetrics[key as keyof typeof normalizedMetrics];
    return total + (metricValue * weight);
  }, 0);

  return Math.round(score);
}

// Функция генерации управленческих инсайтов
function generateManagementInsights(trainers: TrainerOverview[], totalStats: any): ManagementInsight[] {
  const insights: ManagementInsight[] = [];

  // Анализ низкой производительности
  const underperformers = trainers.filter(t => t.performanceScore < 50);
  if (underperformers.length > 0) {
    insights.push({
      type: 'warning',
      title: 'Тренеры с низкой производительностью',
      description: `${underperformers.length} тренер(ов) показывают низкие результаты и нуждаются в поддержке`,
      priority: 'high',
      actionRequired: true,
      affectedTrainers: underperformers.map(t => t.name)
    });
  }

  // Анализ высокой отмены
  const highCancellation = trainers.filter(t => t.cancellationRate > 20);
  if (highCancellation.length > 0) {
    insights.push({
      type: 'warning',
      title: 'Высокий процент отмен',
      description: `${highCancellation.length} тренер(ов) имеют критически высокий процент отмен`,
      priority: 'high',
      actionRequired: true,
      affectedTrainers: highCancellation.map(t => `${t.name} (${t.cancellationRate}%)`)
    });
  }

  // Анализ загрузки
  const lowUtilization = trainers.filter(t => t.utilizationRate < 30);
  if (lowUtilization.length > 0) {
    insights.push({
      type: 'info',
      title: 'Низкая загрузка тренеров',
      description: `${lowUtilization.length} тренер(ов) имеют низкую загрузку (<30%)`,
      priority: 'medium',
      actionRequired: true,
      affectedTrainers: lowUtilization.map(t => `${t.name} (${t.utilizationRate}%)`)
    });
  }

  // Анализ роста
  const decliningTrainers = trainers.filter(t => t.sessionsGrowth < -20);
  if (decliningTrainers.length > 0) {
    insights.push({
      type: 'warning',
      title: 'Снижение активности',
      description: `${decliningTrainers.length} тренер(ов) показывают значительное снижение количества сессий`,
      priority: 'medium',
      actionRequired: true,
      affectedTrainers: decliningTrainers.map(t => `${t.name} (${t.sessionsGrowth}%)`)
    });
  }

  // Позитивные инсайты
  const topPerformers = trainers.filter(t => t.performanceScore >= 85);
  if (topPerformers.length > 0) {
    insights.push({
      type: 'success',
      title: 'Отличные результаты',
      description: `${topPerformers.length} тренер(ов) показывают превосходные результаты`,
      priority: 'low',
      actionRequired: false,
      affectedTrainers: topPerformers.map(t => t.name)
    });
  }

  // Анализ разнообразия услуг
  const limitedServices = trainers.filter(t => {
    const types = Object.values(t.sessionTypes) as number[];
    return types.filter(count => count > 0).length === 1;
  });

  if (limitedServices.length > 0) {
    insights.push({
      type: 'info',
      title: 'Ограниченное разнообразие услуг',
      description: `${limitedServices.length} тренер(ов) предоставляют только один тип сессий`,
      priority: 'low',
      actionRequired: false,
      affectedTrainers: limitedServices.map(t => t.name)
    });
  }

  // Анализ новых тренеров
  const newTrainers = trainers.filter(t => {
    const joinDate = new Date(t.joinDate);
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    return joinDate > threeMonthsAgo;
  });

  if (newTrainers.length > 0) {
    insights.push({
      type: 'info',
      title: 'Новые тренеры',
      description: `${newTrainers.length} тренер(ов) присоединились к команде в последние 3 месяца`,
      priority: 'medium',
      actionRequired: true,
      affectedTrainers: newTrainers.map(t => t.name)
    });
  }

  // Анализ высокого рейтинга
  const highRatedTrainers = trainers.filter(t => t.rating >= 4.5);
  if (highRatedTrainers.length > 0) {
    insights.push({
      type: 'success',
      title: 'Высокие оценки клиентов',
      description: `${highRatedTrainers.length} тренер(ов) имеют отличные оценки от клиентов (≥4.5)`,
      priority: 'low',
      actionRequired: false,
      affectedTrainers: highRatedTrainers.map(t => `${t.name} (${t.rating}⭐)`)
    });
  }

  return insights;
}

// Функция генерации рекомендаций для обзора
function generateOverviewRecommendations(trainers: TrainerOverview[], totalStats: any, trends: any): OverviewRecommendation[] {
  const recommendations: OverviewRecommendation[] = [];

  // Рекомендации по производительности
  if (totalStats.avgCompletionRate < 80) {
    recommendations.push({
      category: 'performance',
      title: 'Улучшение общей эффективности',
      description: 'Средний процент завершения сессий ниже целевого (80%). Рекомендуется провести обучение по планированию и коммуникации с клиентами.',
      priority: 'high',
      impact: 'Повышение общей эффективности команды на 10-15%'
    });
  }

  // Рекомендации по загрузке
  if (trends.lowUtilization > trainers.length * 0.3) {
    recommendations.push({
      category: 'utilization',
      title: 'Оптимизация загрузки тренеров',
      description: 'Более 30% тренеров имеют низкую загрузку. Рассмотрите перераспределение клиентов или маркетинговые активности.',
      priority: 'medium',
      impact: 'Увеличение общего дохода на 20-25%'
    });
  }

  // Рекомендации по росту
  if (trends.decliningTrainers > trends.growingTrainers) {
    recommendations.push({
      category: 'growth',
      title: 'Стимулирование роста',
      description: 'Больше тренеров показывают снижение, чем рост. Необходимо проанализировать причины и внедрить программы мотивации.',
      priority: 'high',
      impact: 'Стабилизация и рост показателей команды'
    });
  }

  // Рекомендации по обучению
  const needTraining = trainers.filter(t => t.rating < 4.0).length;
  if (needTraining > 0) {
    recommendations.push({
      category: 'training',
      title: 'Программа повышения квалификации',
      description: `${needTraining} тренер(ов) имеют рейтинг ниже 4.0. Рекомендуется дополнительное обучение и менторинг.`,
      priority: 'medium',
      impact: 'Повышение качества услуг и удовлетворенности клиентов'
    });
  }

  // Рекомендации по диверсификации
  const singleServiceTrainers = trainers.filter(t => {
    const types = Object.values(t.sessionTypes) as number[];
    return types.filter(count => count > 0).length === 1;
  }).length;

  if (singleServiceTrainers > trainers.length * 0.5) {
    recommendations.push({
      category: 'diversification',
      title: 'Расширение спектра услуг',
      description: 'Более половины тренеров предоставляют только один тип сессий. Рассмотрите обучение дополнительным направлениям.',
      priority: 'low',
      impact: 'Увеличение среднего чека и удержания клиентов'
    });
  }

  // Рекомендации по признанию
  const topPerformers = trainers.filter(t => t.performanceScore >= 85).length;
  if (topPerformers > 0) {
    recommendations.push({
      category: 'recognition',
      title: 'Программа признания достижений',
      description: `${topPerformers} тренер(ов) показывают отличные результаты. Внедрите систему поощрений и обмена опытом.`,
      priority: 'low',
      impact: 'Мотивация команды и распространение лучших практик'
    });
  }

  // Рекомендации по балансу нагрузки
  const overworkedTrainers = trainers.filter(t => t.avgSessionsPerDay > 6).length;
  if (overworkedTrainers > 0) {
    recommendations.push({
      category: 'workload',
      title: 'Балансировка рабочей нагрузки',
      description: `${overworkedTrainers} тренер(ов) имеют очень высокую нагрузку (>6 сессий/день). Рассмотрите перераспределение нагрузки.`,
      priority: 'medium',
      impact: 'Предотвращение выгорания и поддержание качества услуг'
    });
  }

  // Рекомендации по удержанию клиентов
  const lowRetentionTrainers = trainers.filter(t => {
    const retentionRate = t.totalClients > 0 ? (t.activeClients / t.totalClients) * 100 : 0;
    return retentionRate < 70;
  }).length;

  if (lowRetentionTrainers > 0) {
    recommendations.push({
      category: 'retention',
      title: 'Улучшение удержания клиентов',
      description: `${lowRetentionTrainers} тренер(ов) имеют низкий процент удержания клиентов (<70%). Необходимо работать над качеством сервиса.`,
      priority: 'high',
      impact: 'Увеличение LTV клиентов и стабильности доходов'
    });
  }

  // Рекомендации по развитию команды
  if (trainers.length < 5) {
    recommendations.push({
      category: 'expansion',
      title: 'Расширение команды тренеров',
      description: 'Небольшая команда тренеров может ограничивать рост бизнеса. Рассмотрите найм дополнительных специалистов.',
      priority: 'medium',
      impact: 'Увеличение пропускной способности и диверсификация рисков'
    });
  }

  return recommendations;
}

// Утилитарные функции для дополнительной аналитики (НЕ ЭКСПОРТИРУЕМЫЕ)
function calculateTeamEfficiency(
  trainers: TrainerOverview[]): {
    overall: number;
    distribution: { excellent: number; good: number; average: number; poor: number };
  } {
  if (trainers.length === 0) {
    return {
      overall: 0,
      distribution: { excellent: 0, good: 0, average: 0, poor: 0 }
    };
  }

  const overallEfficiency = Math.round(
    trainers.reduce((sum, trainer) => sum + trainer.completionRate, 0) / trainers.length
  );

  const distribution = {
    excellent: trainers.filter(t => t.completionRate >= 90).length,
    good: trainers.filter(t => t.completionRate >= 80 && t.completionRate < 90).length,
    average: trainers.filter(t => t.completionRate >= 70 && t.completionRate < 80).length,
    poor: trainers.filter(t => t.completionRate < 70).length
  };

  return { overall: overallEfficiency, distribution };
}

function calculateRevenueDistribution(trainers: TrainerOverview[]): {
  total: number;
  byTrainer: Array<{ name: string; revenue: number; percentage: number }>;
  topEarners: Array<{ name: string; revenue: number }>;
} {
  const totalRevenue = trainers.reduce((sum, trainer) => sum + trainer.revenue, 0);

  const byTrainer = trainers.map(trainer => ({
    name: trainer.name,
    revenue: trainer.revenue,
    percentage: totalRevenue > 0 ? Math.round((trainer.revenue / totalRevenue) * 100) : 0
  }));

  const topEarners = [...trainers]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 3)
    .map(trainer => ({
      name: trainer.name,
      revenue: trainer.revenue
    }));

  return { total: totalRevenue, byTrainer, topEarners };
}

function calculateCapacityUtilization(trainers: TrainerOverview[]): {
  current: number;
  potential: number;
  utilizationRate: number;
  recommendations: string[];
} {
  const currentSessions = trainers.reduce((sum, trainer) => sum + trainer.completedSessions, 0);
  const potentialSessions = trainers.length * 30 * 6; // 30 дней * 6 сессий в день
  const utilizationRate = potentialSessions > 0 ? Math.round((currentSessions / potentialSessions) * 100) : 0;

  const recommendations: string[] = [];

  if (utilizationRate < 50) {
    recommendations.push('Критически низкая загрузка команды. Необходимы срочные меры по привлечению клиентов.');
  } else if (utilizationRate < 70) {
    recommendations.push('Есть потенциал для увеличения загрузки. Рассмотрите маркетинговые активности.');
  } else if (utilizationRate > 85) {
    recommendations.push('Высокая загрузка. Рассмотрите расширение команды для предотвращения выгорания.');
  }

  return {
    current: currentSessions,
    potential: potentialSessions,
    utilizationRate,
    recommendations
  };
}

function identifyTrainingNeeds(trainers: TrainerOverview[]): Array<{
  category: string;
  trainers: string[];
  priority: 'high' | 'medium' | 'low';
  description: string;
}> {
  const needs: Array<{
    category: string;
    trainers: string[];
    priority: 'high' | 'medium' | 'low';
    description: string;
  }> = [];

  // Низкая эффективность
  const lowEfficiency = trainers.filter(t => t.completionRate < 75);
  if (lowEfficiency.length > 0) {
    needs.push({
      category: 'Планирование и организация',
      trainers: lowEfficiency.map(t => t.name),
      priority: 'high',
      description: 'Обучение навыкам планирования сессий и управления временем'
    });
  }

  // Высокий процент отмен
  const highCancellation = trainers.filter(t => t.cancellationRate > 15);
  if (highCancellation.length > 0) {
    needs.push({
      category: 'Коммуникация с клиентами',
      trainers: highCancellation.map(t => t.name),
      priority: 'high',
      description: 'Развитие навыков удержания клиентов и предотвращения отмен'
    });
  }

  // Низкий рейтинг
  const lowRating = trainers.filter(t => t.rating < 4.0);
  if (lowRating.length > 0) {
    needs.push({
      category: 'Качество сервиса',
      trainers: lowRating.map(t => t.name),
      priority: 'medium',
      description: 'Повышение качества проведения тренировок и клиентского сервиса'
    });
  }

  // Ограниченное разнообразие услуг
  const limitedServices = trainers.filter(t => {
    const types = Object.values(t.sessionTypes) as number[];
    return types.filter(count => count > 0).length === 1;
  });
  if (limitedServices.length > 0) {
    needs.push({
      category: 'Диверсификация услуг',
      trainers: limitedServices.map(t => t.name),
      priority: 'low',
      description: 'Обучение дополнительным направлениям тренировок'
    });
  }

  // Новые тренеры
  const newTrainers = trainers.filter(t => {
    const joinDate = new Date(t.joinDate);
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    return joinDate > sixMonthsAgo;
  });
  if (newTrainers.length > 0) {
    needs.push({
      category: 'Адаптация новых сотрудников',
      trainers: newTrainers.map(t => t.name),
      priority: 'medium',
      description: 'Программа онбординга и менторинга для новых тренеров'
    });
  }

  return needs;
}

function generateBenchmarkComparison(trainers: TrainerOverview[]): {
  metrics: Array<{
    name: string;
    current: number;
    benchmark: number;
    status: 'above' | 'below' | 'meeting';
    gap: number;
  }>;
  overallScore: number;
} {
  // Отраслевые бенчмарки (примерные значения)
  const benchmarks = {
    completionRate: 85,
    utilizationRate: 70,
    rating: 4.2,
    avgSessionsPerDay: 4.5,
    cancellationRate: 10
  };

  const currentMetrics = {
    completionRate: trainers.length > 0 ?
      Math.round(trainers.reduce((sum, t) => sum + t.completionRate, 0) / trainers.length) : 0,
    utilizationRate: trainers.length > 0 ?
      Math.round(trainers.reduce((sum, t) => sum + t.utilizationRate, 0) / trainers.length) : 0,
    rating: trainers.length > 0 ?
      Math.round(trainers.reduce((sum, t) => sum + t.rating, 0) / trainers.length * 10) / 10 : 0,
    avgSessionsPerDay: trainers.length > 0 ?
      Math.round(trainers.reduce((sum, t) => sum + t.avgSessionsPerDay, 0) / trainers.length * 10) / 10 : 0,
    cancellationRate: trainers.length > 0 ?
      Math.round(trainers.reduce((sum, t) => sum + t.cancellationRate, 0) / trainers.length) : 0
  };

  const metrics = Object.entries(benchmarks).map(([key, benchmark]) => {
    const current = currentMetrics[key as keyof typeof currentMetrics];
    const isInverted = key === 'cancellationRate'; // Для этой метрики меньше = лучше

    let status: 'above' | 'below' | 'meeting';
    const gap = isInverted ? benchmark - current : current - benchmark;

    if (Math.abs(gap) <= (benchmark * 0.05)) { // В пределах 5%
      status = 'meeting';
    } else if (gap > 0) {
      status = 'above';
    } else {
      status = 'below';
    }

    return {
      name: key,
      current,
      benchmark,
      status,
      gap: Math.round(gap * 10) / 10
    };
  });

  // Расчет общего балла (процент метрик, которые соответствуют или превышают бенчмарки)
  const meetingOrAbove = metrics.filter(m => m.status === 'meeting' || m.status === 'above').length;
  const overallScore = Math.round((meetingOrAbove / metrics.length) * 100);

  return { metrics, overallScore };
}

function predictFuturePerformance(trainers: TrainerOverview[]): {
  predictions: Array<{
    trainerId: string;
    name: string;
    predictedGrowth: number;
    riskLevel: 'low' | 'medium' | 'high';
    recommendations: string[];
  }>;
  teamForecast: {
    expectedGrowth: number;
    confidenceLevel: number;
    keyRisks: string[];
  };
} {
  const predictions = trainers.map(trainer => {
    // Простая модель прогнозирования на основе текущих трендов
    let predictedGrowth = trainer.sessionsGrowth;
    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    const recommendations: string[] = [];

    // Корректировка прогноза на основе различных факторов
    if (trainer.completionRate < 80) {
      predictedGrowth -= 10;
      riskLevel = 'high';
      recommendations.push('Улучшить планирование сессий');
    }

    if (trainer.cancellationRate > 15) {
      predictedGrowth -= 15;
      riskLevel = 'high';
      recommendations.push('Работать над удержанием клиентов');
    }

    if (trainer.utilizationRate < 50) {
      predictedGrowth -= 20;
      if (riskLevel === 'low') riskLevel = 'medium';
      recommendations.push('Увеличить маркетинговые усилия');
    }

    if (trainer.rating < 4.0) {
      predictedGrowth -= 5;
      if (riskLevel === 'low') riskLevel = 'medium';
      recommendations.push('Повысить качество сервиса');
    }

    // Позитивные факторы
    if (trainer.rating >= 4.5) {
      predictedGrowth += 5;
      recommendations.push('Использовать как наставника для других');
    }

    if (trainer.performanceScore >= 85) {
      predictedGrowth += 10;
      recommendations.push('Рассмотреть повышение нагрузки');
    }

    return {
      trainerId: trainer.id,
      name: trainer.name,
      predictedGrowth: Math.round(predictedGrowth),
      riskLevel,
      recommendations
    };
  });

  // Прогноз для команды в целом
  const avgPredictedGrowth = predictions.length > 0 ?
    Math.round(predictions.reduce((sum, p) => sum + p.predictedGrowth, 0) / predictions.length) : 0;

  const highRiskCount = predictions.filter(p => p.riskLevel === 'high').length;
  const confidenceLevel = Math.max(0, 100 - (highRiskCount / predictions.length) * 50);

  const keyRisks: string[] = [];
  if (highRiskCount > predictions.length * 0.3) {
    keyRisks.push('Высокий процент тренеров в зоне риска');
  }
  if (avgPredictedGrowth < 0) {
    keyRisks.push('Прогнозируется общее снижение показателей');
  }
  if (confidenceLevel < 70) {
    keyRisks.push('Низкая уверенность в прогнозах из-за нестабильности показателей');
  }

  return {
    predictions,
    teamForecast: {
      expectedGrowth: avgPredictedGrowth,
      confidenceLevel: Math.round(confidenceLevel),
      keyRisks
    }
  };
}
