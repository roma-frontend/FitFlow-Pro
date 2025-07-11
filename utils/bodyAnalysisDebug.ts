// utils/bodyAnalysisDebug.ts
import { BodyAnalysisResult } from '@/types/bodyAnalysis';

// Функция для проверки корректности данных анализа
export function validateAnalysisData(data: any): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Проверяем обязательные поля
  if (!data.userId) errors.push('userId отсутствует');
  if (!data.bodyType) errors.push('bodyType отсутствует');
  
  // Проверяем числовые значения
  if (typeof data.estimatedBodyFat !== 'number' || data.estimatedBodyFat <= 0) {
    errors.push(`estimatedBodyFat некорректно: ${data.estimatedBodyFat}`);
  }
  
  if (typeof data.estimatedMuscleMass !== 'number' || data.estimatedMuscleMass <= 0) {
    errors.push(`estimatedMuscleMass некорректно: ${data.estimatedMuscleMass}`);
  }
  
  if (typeof data.fitnessScore !== 'number' || data.fitnessScore < 0 || data.fitnessScore > 100) {
    errors.push(`fitnessScore некорректно: ${data.fitnessScore}`);
  }
  
  if (typeof data.progressPotential !== 'number' || data.progressPotential < 0 || data.progressPotential > 100) {
    errors.push(`progressPotential некорректно: ${data.progressPotential}`);
  }

  // Проверяем проблемные зоны
  if (!Array.isArray(data.problemAreas)) {
    errors.push('problemAreas должен быть массивом');
  } else {
    data.problemAreas.forEach((area: any, index: number) => {
      if (!area.area || !area.severity || !area.recommendation) {
        errors.push(`problemAreas[${index}] некорректно заполнен`);
      }
    });
  }

  // Проверяем рекомендации
  if (!data.recommendations) {
    errors.push('recommendations отсутствует');
  } else {
    if (!data.recommendations.primaryGoal) errors.push('primaryGoal отсутствует');
    if (!Array.isArray(data.recommendations.secondaryGoals)) errors.push('secondaryGoals должен быть массивом');
    if (typeof data.recommendations.estimatedTimeToGoal !== 'number') {
      errors.push('estimatedTimeToGoal должен быть числом');
    }
    if (typeof data.recommendations.weeklyTrainingHours !== 'number') {
      errors.push('weeklyTrainingHours должен быть числом');
    }
  }

  // Проверяем визуальные данные
  if (!data.currentVisualData) {
    errors.push('currentVisualData отсутствует');
  } else {
    if (!data.currentVisualData.imageUrl && !data.currentVisualData.analyzedImageUrl) {
      warnings.push('Нет URL изображений');
    }
  }

  // Проверяем прогнозы
  if (!data.futureProjections) {
    errors.push('futureProjections отсутствует');
  } else {
    ['weeks4', 'weeks8', 'weeks12'].forEach(period => {
      const projection = data.futureProjections[period];
      if (!projection) {
        errors.push(`futureProjections.${period} отсутствует`);
      } else {
        if (typeof projection.estimatedWeight !== 'number') {
          errors.push(`futureProjections.${period}.estimatedWeight некорректно`);
        }
        if (typeof projection.estimatedBodyFat !== 'number') {
          errors.push(`futureProjections.${period}.estimatedBodyFat некорректно`);
        }
        if (typeof projection.estimatedMuscleMass !== 'number') {
          errors.push(`futureProjections.${period}.estimatedMuscleMass некорректно`);
        }
        if (typeof projection.confidenceLevel !== 'number') {
          errors.push(`futureProjections.${period}.confidenceLevel некорректно`);
        }
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

// Функция для логирования данных анализа
export function logAnalysisData(data: BodyAnalysisResult, stage: string) {
  console.group(`🔍 Body Analysis Debug - ${stage}`);
  
  console.log('📊 Основные метрики:', {
    bodyType: data.bodyType,
    bodyFat: data.estimatedBodyFat,
    muscleMass: data.estimatedMuscleMass,
    fitnessScore: data.fitnessScore,
    progressPotential: data.progressPotential,
    posture: data.posture
  });

  console.log('🎯 Рекомендации:', data.recommendations);
  
  console.log('⚠️ Проблемные зоны:', data.problemAreas);
  
  console.log('📈 Прогнозы:', {
    '4 недели': data.futureProjections?.weeks4,
    '8 недель': data.futureProjections?.weeks8,
    '12 недель': data.futureProjections?.weeks12
  });

  console.log('📐 Метрики тела:', data.bodyMetrics);

  // Валидация
  const validation = validateAnalysisData(data);
  if (!validation.isValid) {
    console.error('❌ Ошибки валидации:', validation.errors);
  }
  if (validation.warnings.length > 0) {
    console.warn('⚠️ Предупреждения:', validation.warnings);
  }

  console.groupEnd();
}

// Функция для создания mock данных для тестирования
export function createMockAnalysisData(): BodyAnalysisResult {
  return {
    _id: 'mock_analysis_123' as any,
    userId: 'test_user',
    date: new Date(),
    bodyType: 'mesomorph',
    estimatedBodyFat: 18.5,
    estimatedMuscleMass: 38.2,
    posture: 'good',
    fitnessScore: 75,
    progressPotential: 85,
    problemAreas: [
      {
        area: 'живот',
        severity: 'medium',
        recommendation: 'Увеличить кардио нагрузки и следить за питанием'
      }
    ],
    recommendations: {
      primaryGoal: 'Снижение процента жира до 15%',
      secondaryGoals: ['Увеличение мышечной массы', 'Улучшение выносливости'],
      estimatedTimeToGoal: 12,
      weeklyTrainingHours: 5
    },
    currentVisualData: {
      imageUrl: '/test-image.jpg',
      analyzedImageUrl: '/test-analyzed.jpg',
      bodyOutlineData: {
        shoulders: { width: 48, height: 20 },
        chest: { width: 42, height: 35 },
        waist: { width: 38, height: 30 },
        hips: { width: 42, height: 35 },
        arms: { width: 15, height: 60 },
        legs: { width: 25, height: 80 }
      }
    },
    futureProjections: {
      weeks4: {
        estimatedWeight: 73.5,
        estimatedBodyFat: 16.5,
        estimatedMuscleMass: 38.8,
        confidenceLevel: 0.85
      },
      weeks8: {
        estimatedWeight: 71.8,
        estimatedBodyFat: 14.5,
        estimatedMuscleMass: 39.5,
        confidenceLevel: 0.75
      },
      weeks12: {
        estimatedWeight: 70.2,
        estimatedBodyFat: 12.5,
        estimatedMuscleMass: 40.2,
        confidenceLevel: 0.65
      }
    },
    bodyMetrics: {
      shoulderWidth: 48,
      waistWidth: 38,
      hipWidth: 42,
      bodyRatio: 0.72
    }
  };
}

// Функция для проверки корректности данных перед отправкой в Convex
export function prepareDataForConvex(data: any): any {
  const prepared = { ...data };

  // Убеждаемся, что все числа - это числа (не строки)
  const numericFields = [
    'estimatedBodyFat',
    'estimatedMuscleMass',
    'fitnessScore',
    'progressPotential'
  ];

  numericFields.forEach(field => {
    if (prepared[field] !== undefined) {
      prepared[field] = Number(prepared[field]);
    }
  });

  // Обрабатываем вложенные объекты
  if (prepared.recommendations) {
    prepared.recommendations.estimatedTimeToGoal = Number(prepared.recommendations.estimatedTimeToGoal);
    prepared.recommendations.weeklyTrainingHours = Number(prepared.recommendations.weeklyTrainingHours);
  }

  // Обрабатываем прогнозы
  if (prepared.futureProjections) {
    ['weeks4', 'weeks8', 'weeks12'].forEach(period => {
      if (prepared.futureProjections[period]) {
        const projection = prepared.futureProjections[period];
        projection.estimatedWeight = Number(projection.estimatedWeight);
        projection.estimatedBodyFat = Number(projection.estimatedBodyFat);
        projection.estimatedMuscleMass = Number(projection.estimatedMuscleMass);
        projection.confidenceLevel = Number(projection.confidenceLevel);
      }
    });
  }

  // Обрабатываем метрики тела
  if (prepared.bodyMetrics) {
    Object.keys(prepared.bodyMetrics).forEach(key => {
      prepared.bodyMetrics[key] = Number(prepared.bodyMetrics[key]);
    });
  }

  return prepared;
}