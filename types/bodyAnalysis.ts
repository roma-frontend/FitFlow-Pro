// types/bodyAnalysis.ts

export interface BodyAnalysisResult {
    id: string;
    userId: string;
    date: Date;
    
    // Основные метрики
    bodyType: 'ectomorph' | 'mesomorph' | 'endomorph' | 'mixed';
    estimatedBodyFat: number; // процент жира
    estimatedMuscleMass: number; // процент мышц
    posture: 'good' | 'fair' | 'poor';
    
    // Проблемные зоны
    problemAreas: {
      area: 'живот' | 'бедра' | 'руки' | 'спина' | 'грудь';
      severity: 'low' | 'medium' | 'high';
      recommendation: string;
    }[];
    
    // AI оценка
    fitnessScore: number; // 0-100
    progressPotential: number; // 0-100
    
    // Рекомендации
    recommendations: {
      primaryGoal: string;
      secondaryGoals: string[];
      estimatedTimeToGoal: number; // в неделях
      weeklyTrainingHours: number;
    };
    
    // Визуализация
    currentVisualData: {
      imageUrl: string;
      analyzedImageUrl: string; // с наложенным анализом
      bodyOutlineData: any; // координаты для отрисовки
    };
    
    futureProjections: {
      weeks4: ProjectedResult;
      weeks8: ProjectedResult;
      weeks12: ProjectedResult;
    };
  }
  
  export interface ProjectedResult {
    visualizationUrl?: string;
    estimatedWeight: number;
    estimatedBodyFat: number;
    estimatedMuscleMass: number;
    confidenceLevel: number; // 0-100
  }
  
  export interface BodyGoals {
    type: 'weight_loss' | 'muscle_gain' | 'toning' | 'athletic' | 'health';
    targetWeight?: number;
    targetBodyFat?: number;
    targetDate?: Date;
    specificAreas?: string[];
  }
  
  export interface PersonalizedPlan {
    analysisId: string;
    
    // Подобранный тренер
    recommendedTrainer: {
      id: string;
      name: string;
      specialty: string;
      matchScore: number; // 0-100
      reason: string;
    };
    
    // Программа тренировок
    trainingProgram: {
      id: string;
      name: string;
      duration: number; // недель
      sessionsPerWeek: number;
      focusAreas: string[];
      exercises: Exercise[];
    };
    
    // Питание и добавки
    nutritionPlan: {
      dailyCalories: number;
      macros: {
        protein: number;
        carbs: number;
        fats: number;
      };
      mealPlan?: MealPlan[];
    };
    
    recommendedProducts: {
      productId: string;
      name: string;
      purpose: string;
      timing: string;
      monthlyBudget: number;
      importance: 'essential' | 'recommended' | 'optional';
    }[];
    
    // Абонемент
    membershipRecommendation: {
      type: string;
      reason: string;
      features: string[];
      price: number;
      savings: number;
    };
    
    // Прогнозируемые результаты
    projectedResults: {
      week4: string;
      week8: string;
      week12: string;
      successProbability: number;
    };
  }
  
  export interface Exercise {
    name: string;
    sets: number;
    reps: string;
    restTime: number;
    videoUrl?: string;
    targetMuscles: string[];
  }
  
  export interface MealPlan {
    meal: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    calories: number;
    options: {
      name: string;
      ingredients: string[];
      recipe?: string;
    }[];
  }
  
  export interface ProgressTracking {
    analysisId: string;
    checkpoints: {
      date: Date;
      photoUrl: string;
      weight?: number;
      measurements?: {
        chest?: number;
        waist?: number;
        hips?: number;
        arms?: number;
        thighs?: number;
      };
      aiScore: number;
      comparisonWithProjection: {
        onTrack: boolean;
        deviationPercent: number;
        adjustedProjection?: ProjectedResult;
      };
    }[];
  }