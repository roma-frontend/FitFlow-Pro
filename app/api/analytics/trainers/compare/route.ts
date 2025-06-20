// app/api/analytics/trainers/compare/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { withPermissions, AuthenticatedRequest } from '@/lib/api-middleware';
import { mockSessions, mockTrainers, mockClients } from '@/lib/mock-data';
import { isManager, isAdmin } from '@/lib/permissions';

// Интерфейсы для типизации
interface TrainerComparisonMetrics {
  id: string;
  name: string;
  specialization: string[];
  rating: number;
  totalSessions: number;
  completedSessions: number;
  cancelledSessions: number;
  revenue: number;
  uniqueClients: number;
  activeClients: number;
  completionRate: number;
  cancellationRate: number;
  avgSessionsPerDay: number;
  sessionTypes: {
    personal: number;
    group: number;
    consultation: number;
  };
}

interface ComparisonInsight {
  type: string;
  title: string;
  description: string;
  trainers: string[];
}

interface ComparisonRankings {
  bySessions: TrainerComparisonMetrics[];
  byRevenue: TrainerComparisonMetrics[];
  byEfficiency: TrainerComparisonMetrics[];
  byClients: TrainerComparisonMetrics[];
  byRating: TrainerComparisonMetrics[];
}

interface ComparisonAverages {
  sessions: number;
  revenue: number;
  completionRate: number;
  clients: number;
  rating: number;
}

// POST /api/analytics/trainers/compare - Сравнение тренеров
export async function POST(req: NextRequest) {
  return withPermissions(
    { resource: 'analytics', action: 'read' },
    async (authenticatedReq: AuthenticatedRequest) => {
      try {
        console.log('🔄 API: сравнение тренеров');

        const { user } = authenticatedReq;
        const body = await req.json();
        const { trainerIds, period = 'month', metrics = ['sessions', 'revenue', 'efficiency'] } = body;

        // Проверка прав доступа
        if (!isManager(user.role) && !isAdmin(user.role)) {
          return NextResponse.json(
            { success: false, error: 'Недостаточно прав для сравнения тренеров' },
            { status: 403 }
          );
        }

        // Валидация входных данных
        if (!trainerIds || !Array.isArray(trainerIds) || trainerIds.length < 2) {
          return NextResponse.json(
            { success: false, error: 'Необходимо выбрать минимум 2 тренеров для сравнения' },
            { status: 400 }
          );
        }

        if (trainerIds.length > 5) {
          return NextResponse.json(
            { success: false, error: 'Максимальное количество тренеров для сравнения - 5' },
            { status: 400 }
          );
        }

        // Проверка валидности ID тренеров
        const invalidIds = trainerIds.filter((id: any) => typeof id !== 'string' || id.trim() === '');
        if (invalidIds.length > 0) {
          return NextResponse.json(
            { success: false, error: 'Некорректные ID тренеров' },
            { status: 400 }
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

        // Получение данных тренеров
        const trainersData: TrainerComparisonMetrics[] = [];
        
        for (const trainerId of trainerIds) {
          const trainer = mockTrainers.find((t: any) => t.id === trainerId);
          if (!trainer) {
            return NextResponse.json(
              { success: false, error: `Тренер с ID ${trainerId} не найден` },
              { status: 404 }
            );
          }

          // Проверка, что это действительно тренер
          if (trainer.role !== 'trainer') {
            return NextResponse.json(
              { success: false, error: `Пользователь ${trainer.name} не является тренером` },
              { status: 400 }
            );
          }

          const trainerSessions = mockSessions.filter((s: any) => s.trainerId === trainerId);
          const trainerClients = mockClients.filter((c: any) => c.trainerId === trainerId);
          
          const periodSessions = trainerSessions.filter((session: any) => {
            const sessionDate = new Date(`${session.date}T${session.startTime}`);
            return sessionDate >= startDate && sessionDate <= now;
          });

          const completedSessions = periodSessions.filter((s: any) => s.status === 'completed');
          const cancelledSessions = periodSessions.filter((s: any) => s.status === 'cancelled');
          
          // Расчет дней в периоде
          const daysDiff = Math.max(1, Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
          
          const trainerMetrics: TrainerComparisonMetrics = {
            id: trainer.id,
            name: trainer.name,
            specialization: Array.isArray(trainer.specialization) ? trainer.specialization : [],
            rating: trainer.rating || 0,
            totalSessions: periodSessions.length,
            completedSessions: completedSessions.length,
            cancelledSessions: cancelledSessions.length,
            revenue: completedSessions.length * 2000,
            uniqueClients: new Set(periodSessions.map((s: any) => s.clientId)).size,
            activeClients: trainerClients.filter((c: any) => c.status === 'active').length,
            completionRate: periodSessions.length > 0 ? 
              Math.round((completedSessions.length / periodSessions.length) * 100) : 0,
            cancellationRate: periodSessions.length > 0 ? 
              Math.round((cancelledSessions.length / periodSessions.length) * 100) : 0,
            avgSessionsPerDay: Math.round((completedSessions.length / daysDiff) * 10) / 10,
            sessionTypes: {
              personal: periodSessions.filter((s: any) => s.type === 'personal').length,
              group: periodSessions.filter((s: any) => s.type === 'group').length,
              consultation: periodSessions.filter((s: any) => s.type === 'consultation').length
            }
          };

          trainersData.push(trainerMetrics);
        }

        // Расчет сравнительных показателей
        const rankings: ComparisonRankings = {
          bySessions: [...trainersData].sort((a, b) => b.completedSessions - a.completedSessions),
          byRevenue: [...trainersData].sort((a, b) => b.revenue - a.revenue),
          byEfficiency: [...trainersData].sort((a, b) => b.completionRate - a.completionRate),
          byClients: [...trainersData].sort((a, b) => b.uniqueClients - a.uniqueClients),
          byRating: [...trainersData].sort((a, b) => b.rating - a.rating)
        };

        const averages: ComparisonAverages = {
          sessions: trainersData.length > 0 ? 
            Math.round(trainersData.reduce((sum, t) => sum + t.completedSessions, 0) / trainersData.length) : 0,
          revenue: trainersData.length > 0 ? 
            Math.round(trainersData.reduce((sum, t) => sum + t.revenue, 0) / trainersData.length) : 0,
          completionRate: trainersData.length > 0 ? 
            Math.round(trainersData.reduce((sum, t) => sum + t.completionRate, 0) / trainersData.length) : 0,
          clients: trainersData.length > 0 ? 
            Math.round(trainersData.reduce((sum, t) => sum + t.uniqueClients, 0) / trainersData.length) : 0,
          rating: trainersData.length > 0 ? 
            Math.round(trainersData.reduce((sum, t) => sum + t.rating, 0) / trainersData.length * 10) / 10 : 0
        };

        // Дополнительная статистика
        const additionalStats = {
          totalRevenue: trainersData.reduce((sum, t) => sum + t.revenue, 0),
          totalSessions: trainersData.reduce((sum, t) => sum + t.completedSessions, 0),
          totalClients: trainersData.reduce((sum, t) => sum + t.uniqueClients, 0),
          bestPerformer: rankings.bySessions[0]?.name || 'Нет данных',
          mostEfficient: rankings.byEfficiency[0]?.name || 'Нет данных',
          topRated: rankings.byRating[0]?.name || 'Нет данных',
          sessionTypeDistribution: calculateSessionTypeDistribution(trainersData),
          performanceSpread: calculatePerformanceSpread(trainersData)
        };

        const comparison = {
          period: {
            type: period,
            start: startDate.toISOString(),
            end: now.toISOString()
          },
          trainers: trainersData,
          rankings,
          averages,
          additionalStats,
          insights: generateComparisonInsights(trainersData),
          recommendations: generateComparisonRecommendations(trainersData)
        };

        console.log(`✅ API: сравнение ${trainersData.length} тренеров выполнено`);

        return NextResponse.json({
          success: true,
          data: comparison,
          meta: {
            comparedBy: user.email,
            generatedAt: now.toISOString(),
            trainersCount: trainersData.length,
            period: period,
            requestedMetrics: metrics
          }
        });

      } catch (error: any) {
        console.error('💥 API: ошибка сравнения тренеров:', error);
        return NextResponse.json(
          { success: false, error: 'Ошибка выполнения сравнения тренеров' },
          { status: 500 }
        );
      }
    }
  )(req);
}

// Остальные функции остаются без изменений...
function generateComparisonInsights(trainersData: TrainerComparisonMetrics[]): ComparisonInsight[] {
  const insights: ComparisonInsight[] = [];

  if (trainersData.length === 0) {
    return insights;
  }

  // Топ исполнитель
  const topPerformer = trainersData.reduce((prev, current) => 
    current.completedSessions > prev.completedSessions ? current : prev
  );

  insights.push({
    type: 'success',
    title: 'Лидер по количеству сессий',
    description: `${topPerformer.name} провел ${topPerformer.completedSessions} сессий`,
    trainers: [topPerformer.name]
  });

  // Лучший по эффективности
  const mostEfficient = trainersData.reduce((prev, current) => 
    current.completionRate > prev.completionRate ? current : prev
  );

  if (mostEfficient.completionRate > 90) {
    insights.push({
      type: 'success',
      title: 'Высокая эффективность',
      description: `${mostEfficient.name} показывает отличный процент завершения сессий (${mostEfficient.completionRate}%)`,
      trainers: [mostEfficient.name]
    });
  }

  // Лучший по доходам
  const topEarner = trainersData.reduce((prev, current) => 
    current.revenue > prev.revenue ? current : prev
  );

  insights.push({
    type: 'info',
    title: 'Лидер по доходам',
    description: `${topEarner.name} сгенерировал наибольший доход: ${topEarner.revenue.toLocaleString('ru-RU')} ₽`,
    trainers: [topEarner.name]
  });

  return insights;
}

function calculateSessionTypeDistribution(trainersData: TrainerComparisonMetrics[]): {
  personal: number;
  group: number;
  consultation: number;
  total: number;
} {
  const totals = trainersData.reduce(
    (acc, trainer) => ({
      personal: acc.personal + trainer.sessionTypes.personal,
      group: acc.group + trainer.sessionTypes.group,
      consultation: acc.consultation + trainer.sessionTypes.consultation
    }),
    { personal: 0, group: 0, consultation: 0 }
  );

  const total = totals.personal + totals.group + totals.consultation;

  return {
    ...totals,
    total
  };
}

function calculatePerformanceSpread(trainersData: TrainerComparisonMetrics[]): {
  completionRate: { min: number; max: number; spread: number };
  revenue: { min: number; max: number; spread: number };
  sessions: { min: number; max: number; spread: number };
} {
  if (trainersData.length === 0) {
    return {
      completionRate: { min: 0, max: 0, spread: 0 },
      revenue: { min: 0, max: 0, spread: 0 },
      sessions: { min: 0, max: 0, spread: 0 }
    };
  }

  const completionRates = trainersData.map(t => t.completionRate);
  const revenues = trainersData.map(t => t.revenue);
  const sessions = trainersData.map(t => t.completedSessions);

  return {
    completionRate: {
      min: Math.min(...completionRates),
      max: Math.max(...completionRates),
      spread: Math.max(...completionRates) - Math.min(...completionRates)
    },
    revenue: {
      min: Math.min(...revenues),
      max: Math.max(...revenues),
      spread: Math.max(...revenues) - Math.min(...revenues)
    },
    sessions: {
      min: Math.min(...sessions),
      max: Math.max(...sessions),
      spread: Math.max(...sessions) - Math.min(...sessions)
    }
  };
}

function generateComparisonRecommendations(trainersData: TrainerComparisonMetrics[]): Array<{
  category: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  affectedTrainers: string[];
}> {
  const recommendations: Array<{
    category: string;
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    affectedTrainers: string[];
  }> = [];

  if (trainersData.length === 0) {
    return recommendations;
  }

  // Рекомендации по выравниванию эффективности
  const avgCompletionRate = trainersData.reduce((sum, t) => sum + t.completionRate, 0) / trainersData.length;
  const belowAverage = trainersData.filter(t => t.completionRate < avgCompletionRate - 10);
  
  if (belowAverage.length > 0) {
    recommendations.push({
      category: 'performance',
      title: 'Выравнивание эффективности',
      description: 'Тренеры с эффективностью значительно ниже средней нуждаются в дополнительной поддержке',
      priority: 'high',
      affectedTrainers: belowAverage.map(t => t.name)
    });
  }

  // Рекомендации по обмену опытом
  const topPerformers = trainersData.filter(t => t.completionRate > 90);
  const strugglingTrainers = trainersData.filter(t => t.completionRate < 75);
  
  if (topPerformers.length > 0 && strugglingTrainers.length > 0) {
    recommendations.push({
      category: 'mentoring',
      title: 'Программа наставничества',
      description: 'Организовать обмен опытом между успешными и начинающими тренерами',
      priority: 'medium',
      affectedTrainers: [...topPerformers.map(t => t.name), ...strugglingTrainers.map(t => t.name)]
    });
  }

  // Рекомендации по загрузке
  const avgSessions = trainersData.reduce((sum, t) => sum + t.completedSessions, 0) / trainersData.length;
  const underutilized = trainersData.filter(t => t.completedSessions < avgSessions * 0.7);
  const overutilized = trainersData.filter(t => t.completedSessions > avgSessions * 1.5);

  if (underutilized.length > 0) {
    recommendations.push({
      category: 'utilization',
      title: 'Увеличение загрузки',
      description: 'Тренеры с низкой загрузкой нуждаются в дополнительных клиентах',
      priority: 'medium',
      affectedTrainers: underutilized.map(t => t.name)
    });
  }

  if (overutilized.length > 0) {
    recommendations.push({
      category: 'workload',
      title: 'Балансировка нагрузки',
      description: 'Рассмотрите перераспределение нагрузки для предотвращения выгорания',
      priority: 'medium',
      affectedTrainers: overutilized.map(t => t.name)
    });
  }

  // Рекомендации по развитию услуг
  const limitedServiceTrainers = trainersData.filter(t => {
    const sessionTypeCounts = Object.values(t.sessionTypes) as number[];
    return sessionTypeCounts.filter(count => count > 0).length === 1;
  });

  if (limitedServiceTrainers.length > 0) {
    recommendations.push({
      category: 'diversification',
      title: 'Расширение спектра услуг',
      description: 'Обучение дополнительным типам тренировок для увеличения гибкости',
      priority: 'low',
      affectedTrainers: limitedServiceTrainers.map(t => t.name)
    });
  }

  // Рекомендации по улучшению рейтинга
  const lowRatedTrainers = trainersData.filter(t => t.rating < 4.0);
  if (lowRatedTrainers.length > 0) {
    recommendations.push({
      category: 'quality',
      title: 'Повышение качества сервиса',
      description: 'Работа над улучшением клиентского опыта и повышением рейтинга',
      priority: 'high',
      affectedTrainers: lowRatedTrainers.map(t => t.name)
    });
  }

  // Рекомендации по удержанию клиентов
  const highCancellationTrainers = trainersData.filter(t => t.cancellationRate > 15);
  if (highCancellationTrainers.length > 0) {
    recommendations.push({
      category: 'retention',
      title: 'Снижение отмен',
      description: 'Анализ причин отмен и разработка стратегий удержания клиентов',
      priority: 'high',
      affectedTrainers: highCancellationTrainers.map(t => t.name)
    });
  }

  return recommendations;
}

// Дополнительные утилитарные функции для сравнения
function analyzeSpecializations(trainersData: TrainerComparisonMetrics[]): {
  insights: ComparisonInsight[];
  distribution: Record<string, number>;
} {
  const insights: ComparisonInsight[] = [];
  const specializationCount: Record<string, string[]> = {};

  // Подсчет специализаций
  trainersData.forEach(trainer => {
    trainer.specialization.forEach(spec => {
      if (!specializationCount[spec]) {
        specializationCount[spec] = [];
      }
      specializationCount[spec].push(trainer.name);
    });
  });

  const distribution = Object.fromEntries(
    Object.entries(specializationCount).map(([spec, trainers]) => [spec, trainers.length])
  );

  // Поиск уникальных специализаций
  const uniqueSpecs = Object.entries(specializationCount).filter(([_, trainers]) => trainers.length === 1);
  if (uniqueSpecs.length > 0) {
    uniqueSpecs.forEach(([spec, trainers]) => {
      insights.push({
        type: 'info',
        title: 'Уникальная специализация',
        description: `${trainers[0]} единственный специалист по направлению "${spec}"`,
        trainers: trainers
      });
    });
  }

  // Поиск популярных специализаций
  const popularSpecs = Object.entries(specializationCount).filter(([_, trainers]) => trainers.length > 1);
  if (popularSpecs.length > 0) {
    const mostPopular = popularSpecs.reduce((prev, current) => 
      current[1].length > prev[1].length ? current : prev
    );
    
    insights.push({
      type: 'info',
      title: 'Популярная специализация',
      description: `Направление "${mostPopular[0]}" представлено ${mostPopular[1].length} тренерами`,
      trainers: mostPopular[1]
    });
  }

  return { insights, distribution };
}

function calculateComparisonScore(trainer: TrainerComparisonMetrics, averages: ComparisonAverages): number {
  const weights = {
    sessions: 0.3,
    efficiency: 0.25,
    revenue: 0.2,
    rating: 0.15,
    clients: 0.1
  };

  const scores = {
    sessions: averages.sessions > 0 ? (trainer.completedSessions / averages.sessions) * 100 : 0,
    efficiency: trainer.completionRate,
    revenue: averages.revenue > 0 ? (trainer.revenue / averages.revenue) * 100 : 0,
    rating: (trainer.rating / 5) * 100,
    clients: averages.clients > 0 ? (trainer.uniqueClients / averages.clients) * 100 : 0
  };

  const totalScore = Object.entries(weights).reduce((total, [key, weight]) => {
    return total + (scores[key as keyof typeof scores] * weight);
  }, 0);

  return Math.round(totalScore);
}

function identifyOutliers(trainersData: TrainerComparisonMetrics[]): {
  high: Array<{ trainer: string; metric: string; value: number }>;
  low: Array<{ trainer: string; metric: string; value: number }>;
} {
  const outliers: {
    high: Array<{ trainer: string; metric: string; value: number }>;
    low: Array<{ trainer: string; metric: string; value: number }>;
  } = { 
    high: [], 
    low: [] 
  };

  if (trainersData.length < 3) return outliers;

  const metrics = ['completedSessions', 'revenue', 'completionRate', 'uniqueClients'] as const;

  metrics.forEach(metric => {
    const values = trainersData.map(t => t[metric] as number);
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const stdDev = Math.sqrt(values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length);

    trainersData.forEach(trainer => {
      const value = trainer[metric] as number;
      const zScore = stdDev > 0 ? (value - mean) / stdDev : 0;

      if (zScore > 2) {
        outliers.high.push({
          trainer: trainer.name,
          metric: metric,
          value
        });
      } else if (zScore < -2) {
        outliers.low.push({
          trainer: trainer.name,
          metric: metric,
          value
        });
      }
    });
  });

  return outliers;
}

function generateComparisonSummary(trainersData: TrainerComparisonMetrics[]): {
  winner: string;
  categories: Record<string, string>;
  overallInsight: string;
} {
  if (trainersData.length === 0) {
    return {
      winner: 'Нет данных',
      categories: {},
      overallInsight: 'Недостаточно данных для анализа'
    };
  }

  const categories = {
    'Количество сессий': trainersData.reduce((prev, current) => 
      current.completedSessions > prev.completedSessions ? current : prev
    ).name,
    'Эффективность': trainersData.reduce((prev, current) => 
      current.completionRate > prev.completionRate ? current : prev
    ).name,
    'Доходы': trainersData.reduce((prev, current) => 
      current.revenue > prev.revenue ? current : prev
    ).name,
    'Рейтинг': trainersData.reduce((prev, current) => 
      current.rating > prev.rating ? current : prev
    ).name,
    'Клиентская база': trainersData.reduce((prev, current) =>
      current.uniqueClients > prev.uniqueClients ? current : prev
    ).name
  };

  // Определение общего победителя по количеству категорий
  const winCounts: Record<string, number> = {};
  Object.values(categories).forEach(winner => {
    winCounts[winner] = (winCounts[winner] || 0) + 1;
  });

  const overallWinner = Object.entries(winCounts).reduce((prev, current) => 
    current[1] > prev[1] ? current : prev
  )[0];

  // Генерация общего инсайта
  const winnerCount = winCounts[overallWinner];
  const totalCategories = Object.keys(categories).length;
  
  let overallInsight: string;
  if (winnerCount >= totalCategories * 0.6) {
    overallInsight = `${overallWinner} демонстрирует превосходство в большинстве категорий (${winnerCount} из ${totalCategories})`;
  } else if (winnerCount >= 2) {
    overallInsight = `${overallWinner} лидирует в ${winnerCount} категориях, показывая сильные результаты`;
  } else {
    const topTrainers = Object.entries(winCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([name]) => name);
    overallInsight = `Конкурентная борьба между ${topTrainers.join(' и ')}, каждый силен в разных областях`;
  }

  return {
    winner: overallWinner,
    categories,
    overallInsight
  };
}

function calculateMetricCorrelations(trainersData: TrainerComparisonMetrics[]): Array<{
  metric1: string;
  metric2: string;
  correlation: number;
  strength: 'strong' | 'moderate' | 'weak' | 'none';
}> {
  if (trainersData.length < 3) return [];

  const metrics: Array<{ key: keyof TrainerComparisonMetrics; name: string }> = [
    { key: 'completedSessions', name: 'Количество сессий' },
    { key: 'completionRate', name: 'Процент завершения' },
    { key: 'revenue', name: 'Доходы' },
    { key: 'rating', name: 'Рейтинг' },
    { key: 'uniqueClients', name: 'Уникальные клиенты' },
    { key: 'avgSessionsPerDay', name: 'Сессий в день' }
  ];

  const correlations: Array<{
    metric1: string;
    metric2: string;
    correlation: number;
    strength: 'strong' | 'moderate' | 'weak' | 'none';
  }> = [];

  for (let i = 0; i < metrics.length; i++) {
    for (let j = i + 1; j < metrics.length; j++) {
      const metric1 = metrics[i];
      const metric2 = metrics[j];
      
      const values1 = trainersData.map(t => t[metric1.key] as number);
      const values2 = trainersData.map(t => t[metric2.key] as number);
      
      const correlation = calculatePearsonCorrelation(values1, values2);
      
      let strength: 'strong' | 'moderate' | 'weak' | 'none';
      const absCorr = Math.abs(correlation);
      
      if (absCorr >= 0.7) {
        strength = 'strong';
      } else if (absCorr >= 0.4) {
        strength = 'moderate';
      } else if (absCorr >= 0.2) {
        strength = 'weak';
      } else {
        strength = 'none';
      }

      correlations.push({
        metric1: metric1.name,
        metric2: metric2.name,
        correlation: Math.round(correlation * 100) / 100,
        strength
      });
    }
  }

  return correlations.filter(c => c.strength !== 'none').sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation));
}

// Вспомогательная функция для расчета корреляции Пирсона
function calculatePearsonCorrelation(x: number[], y: number[]): number {
  const n = x.length;
  if (n === 0) return 0;

  const sumX = x.reduce((sum, val) => sum + val, 0);
  const sumY = y.reduce((sum, val) => sum + val, 0);
  const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
  const sumX2 = x.reduce((sum, val) => sum + val * val, 0);
  const sumY2 = y.reduce((sum, val) => sum + val * val, 0);

  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

  return denominator === 0 ? 0 : numerator / denominator;
}

// Функция для создания матрицы сравнения
function createComparisonMatrix(trainersData: TrainerComparisonMetrics[]): {
  headers: string[];
  rows: Array<{
    trainer: string;
    metrics: Array<{
      value: number | string;
      rank: number;
      isLeader: boolean;
    }>;
  }>;
} {
  const headers = [
    'Тренер',
    'Сессии',
    'Эффективность (%)',
    'Доходы (₽)',
    'Рейтинг',
    'Клиенты',
    'Отмены (%)'
  ];

  const metricKeys: Array<keyof TrainerComparisonMetrics> = [
    'completedSessions',
    'completionRate',
    'revenue',
    'rating',
    'uniqueClients',
    'cancellationRate'
  ];

  const rows = trainersData.map(trainer => {
    const metrics = metricKeys.map(key => {
      const value = trainer[key] as number;
      
      // Расчет ранга (для отмен - чем меньше, тем лучше)
      const sortedValues = trainersData
        .map(t => t[key] as number)
        .sort((a, b) => key === 'cancellationRate' ? a - b : b - a);
      
      const rank = sortedValues.indexOf(value) + 1;
      const isLeader = rank === 1;

      let formattedValue: number | string;
      if (key === 'revenue') {
        formattedValue = `${value.toLocaleString('ru-RU')} ₽`;
      } else if (key === 'rating') {
        formattedValue = `${value}⭐`;
      } else {
        formattedValue = value;
      }

      return {
        value: formattedValue,
        rank,
        isLeader
      };
    });

    return {
      trainer: trainer.name,
      metrics
    };
  });

  return { headers, rows };
}

// Функция для генерации рекомендаций по парному сравнению
function generatePairwiseRecommendations(
  trainer1: TrainerComparisonMetrics,
  trainer2: TrainerComparisonMetrics
): Array<{
  category: string;
  recommendation: string;
  beneficiary: string;
  priority: 'high' | 'medium' | 'low';
}> {
  const recommendations: Array<{
    category: string;
    recommendation: string;
    beneficiary: string;
    priority: 'high' | 'medium' | 'low';
  }> = [];

  // Сравнение эффективности
  if (Math.abs(trainer1.completionRate - trainer2.completionRate) > 15) {
    const leader = trainer1.completionRate > trainer2.completionRate ? trainer1 : trainer2;
    const follower = trainer1.completionRate > trainer2.completionRate ? trainer2 : trainer1;
    
    recommendations.push({
      category: 'Эффективность',
      recommendation: `${follower.name} может изучить методы планирования и организации сессий у ${leader.name}`,
      beneficiary: follower.name,
      priority: 'high'
    });
  }

  // Сравнение клиентской базы
  if (Math.abs(trainer1.uniqueClients - trainer2.uniqueClients) > 3) {
    const leader = trainer1.uniqueClients > trainer2.uniqueClients ? trainer1 : trainer2;
    const follower = trainer1.uniqueClients > trainer2.uniqueClients ? trainer2 : trainer1;
    
    recommendations.push({
      category: 'Клиентская база',
      recommendation: `${follower.name} может перенять стратегии привлечения клиентов у ${leader.name}`,
      beneficiary: follower.name,
      priority: 'medium'
    });
  }

  // Сравнение рейтинга
  if (Math.abs(trainer1.rating - trainer2.rating) > 0.5) {
    const leader = trainer1.rating > trainer2.rating ? trainer1 : trainer2;
    const follower = trainer1.rating > trainer2.rating ? trainer2 : trainer1;
    
    recommendations.push({
      category: 'Качество сервиса',
      recommendation: `${follower.name} может улучшить клиентский опыт, изучив подходы ${leader.name}`,
      beneficiary: follower.name,
      priority: 'medium'
    });
  }

  // Сравнение разнообразия услуг
  const trainer1Types = Object.values(trainer1.sessionTypes).filter(count => count > 0).length;
  const trainer2Types = Object.values(trainer2.sessionTypes).filter(count => count > 0).length;
  
  if (Math.abs(trainer1Types - trainer2Types) > 0) {
    const leader = trainer1Types > trainer2Types ? trainer1 : trainer2;
    const follower = trainer1Types > trainer2Types ? trainer2 : trainer1;
    
    recommendations.push({
      category: 'Диверсификация',
      recommendation: `${follower.name} может расширить спектр услуг, изучив опыт ${leader.name}`,
      beneficiary: follower.name,
      priority: 'low'
    });
  }

  return recommendations;
}

// Функция для расчета индекса конкурентоспособности
function calculateCompetitivenessIndex(trainer: TrainerComparisonMetrics, allTrainers: TrainerComparisonMetrics[]): {
  index: number;
  rank: number;
  percentile: number;
  strengths: string[];
  weaknesses: string[];
} {
  const metrics = [
    { key: 'completedSessions', weight: 0.25, name: 'Количество сессий' },
    { key: 'completionRate', weight: 0.25, name: 'Эффективность' },
    { key: 'revenue', weight: 0.2, name: 'Доходы' },
    { key: 'rating', weight: 0.15, name: 'Рейтинг' },
    { key: 'uniqueClients', weight: 0.15, name: 'Клиентская база' }
  ];

  let totalScore = 0;
  const strengths: string[] = [];
  const weaknesses: string[] = [];

  metrics.forEach(metric => {
    const trainerValue = trainer[metric.key as keyof TrainerComparisonMetrics] as number;
    const allValues = allTrainers.map(t => t[metric.key as keyof TrainerComparisonMetrics] as number);
    const maxValue = Math.max(...allValues);
    const minValue = Math.min(...allValues);
    
    // Нормализация значения к шкале 0-100
    const normalizedValue = maxValue > minValue ? 
      ((trainerValue - minValue) / (maxValue - minValue)) * 100 : 50;
    
    totalScore += normalizedValue * metric.weight;

    // Определение сильных и слабых сторон
    const percentileInMetric = (allValues.filter(v => v <= trainerValue).length / allValues.length) * 100;
    
    if (percentileInMetric >= 75) {
      strengths.push(metric.name);
    } else if (percentileInMetric <= 25) {
      weaknesses.push(metric.name);
    }
  });

  // Расчет ранга
  const allScores = allTrainers.map(t => {
    let score = 0;
    metrics.forEach(metric => {
      const value = t[metric.key as keyof TrainerComparisonMetrics] as number;
      const allValues = allTrainers.map(tr => tr[metric.key as keyof TrainerComparisonMetrics] as number);
      const maxValue = Math.max(...allValues);
      const minValue = Math.min(...allValues);
      const normalizedValue = maxValue > minValue ? 
        ((value - minValue) / (maxValue - minValue)) * 100 : 50;
      score += normalizedValue * metric.weight;
    });
    return score;
  });
  
  const rank = allScores.filter(score => score > totalScore).length + 1;
  
  // Расчет процентиля
  const percentile = ((allTrainers.length - rank + 1) / allTrainers.length) * 100;

  return {
    index: Math.round(totalScore),
    rank,
    percentile: Math.round(percentile),
    strengths,
    weaknesses
  };
}

// Функция для анализа трендов в сравнении
function analyzeTrends(currentData: TrainerComparisonMetrics[], previousData?: TrainerComparisonMetrics[]): {
  trends: Array<{
    trainer: string;
    metric: string;
    change: number;
    trend: 'improving' | 'declining' | 'stable';
  }>;
  summary: {
    improving: number;
    declining: number;
    stable: number;
  };
} {
  if (!previousData || previousData.length === 0) {
    return {
      trends: [],
      summary: { improving: 0, declining: 0, stable: 0 }
    };
  }

  const trends: Array<{
    trainer: string;
    metric: string;
    change: number;
    trend: 'improving' | 'declining' | 'stable';
  }> = [];

  const metrics = ['completedSessions', 'completionRate', 'revenue', 'rating', 'uniqueClients'] as const;

  currentData.forEach(currentTrainer => {
    const previousTrainer = previousData.find(t => t.id === currentTrainer.id);
    if (!previousTrainer) return;

    metrics.forEach(metric => {
      const currentValue = currentTrainer[metric] as number;
      const previousValue = previousTrainer[metric] as number;
      
      if (previousValue === 0) return;
      
      const change = ((currentValue - previousValue) / previousValue) * 100;
      
      let trend: 'improving' | 'declining' | 'stable';
      if (change > 5) {
        trend = 'improving';
      } else if (change < -5) {
        trend = 'declining';
      } else {
        trend = 'stable';
      }

      trends.push({
        trainer: currentTrainer.name,
        metric,
        change: Math.round(change * 10) / 10,
        trend
      });
    });
  });

  const summary = {
    improving: trends.filter(t => t.trend === 'improving').length,
    declining: trends.filter(t => t.trend === 'declining').length,
    stable: trends.filter(t => t.trend === 'stable').length
  };

  return { trends, summary };
}

