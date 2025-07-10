// convex/bodyAnalysis.ts - версия для кастомной аутентификации

import { mutation, query, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

// Сохранение анализа тела с явной передачей userId
export const saveBodyAnalysis = mutation({
  args: {
    userId: v.string(), // Передаем userId явно
    bodyType: v.union(
      v.literal("ectomorph"),
      v.literal("mesomorph"),
      v.literal("endomorph"),
      v.literal("mixed")
    ),
    estimatedBodyFat: v.number(),
    estimatedMuscleMass: v.number(),
    posture: v.union(v.literal("good"), v.literal("fair"), v.literal("poor")),
    fitnessScore: v.number(),
    progressPotential: v.number(),
    problemAreas: v.array(
      v.object({
        area: v.union(
          v.literal("живот"),
          v.literal("бедра"),
          v.literal("руки"),
          v.literal("спина"),
          v.literal("грудь")
        ),
        severity: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
        recommendation: v.string(),
      })
    ),
    recommendations: v.object({
      primaryGoal: v.string(),
      secondaryGoals: v.array(v.string()),
      estimatedTimeToGoal: v.number(),
      weeklyTrainingHours: v.number(),
    }),
    currentVisualData: v.object({
      imageUrl: v.string(),
      analyzedImageUrl: v.string(),
      bodyOutlineData: v.optional(v.any())
    }),
    futureProjections: v.object({
      weeks4: v.object({
        estimatedWeight: v.number(),
        estimatedBodyFat: v.number(),
        estimatedMuscleMass: v.number(),
        confidenceLevel: v.number(),
      }),
      weeks8: v.object({
        estimatedWeight: v.number(),
        estimatedBodyFat: v.number(),
        estimatedMuscleMass: v.number(),
        confidenceLevel: v.number(),
      }),
      weeks12: v.object({
        estimatedWeight: v.number(),
        estimatedBodyFat: v.number(),
        estimatedMuscleMass: v.number(),
        confidenceLevel: v.number(),
      }),
    }),
  },
  handler: async (ctx, args) => {
    try {
      // Для кастомной аутентификации просто проверяем, что userId передан
      if (!args.userId) {
        throw new Error("Unauthorized - userId is required");
      }

      const now = Date.now();

      // Сохраняем в базу данных
      const analysisData = {
        ...args,
        createdAt: now,
        updatedAt: now,
      };

      console.log("Saving body analysis for user:", args.userId);

      const analysisId = await ctx.db.insert("bodyAnalyses", analysisData);

      // Запускаем проверку достижений
      await ctx.scheduler.runAfter(0, internal.bodyAnalysis.checkAndAwardAchievements, {
        userId: args.userId,
        achievementType: "first_analysis",
      });

      return {
        success: true,
        analysisId,
        message: "Analysis saved successfully"
      };

    } catch (error) {
      console.error("Error in saveBodyAnalysis:", error);
      throw error;
    }
  },
});

// Получение текущего анализа - с передачей userId
export const getCurrentAnalysis = query({
  args: {
    userId: v.string(), // Передаем userId явно
  },
  handler: async (ctx, args) => {
    try {
      if (!args.userId) {
        throw new Error("userId is required");
      }

      const analysis = await ctx.db
        .query("bodyAnalyses")
        .withIndex("by_user", (q) => q.eq("userId", args.userId))
        .order("desc")
        .first();

      if (!analysis) {
        return null;
      }

      // Получаем связанные чекпоинты
      const checkpoints = await ctx.db
        .query("progressCheckpoints")
        .withIndex("by_analysis", (q) => q.eq("analysisId", analysis._id))
        .order("asc")
        .collect();

      return {
        ...analysis,
        checkpoints,
      };
    } catch (error) {
      console.error("Error in getCurrentAnalysis:", error);
      throw error;
    }
  },
});

// Получение чекпоинтов прогресса
export const getProgressCheckpoints = query({
  args: {
    userId: v.string(), // Передаем userId явно
  },
  handler: async (ctx, args) => {
    try {
      if (!args.userId) {
        throw new Error("userId is required");
      }

      const checkpoints = await ctx.db
        .query("progressCheckpoints")
        .withIndex("by_user", (q) => q.eq("userId", args.userId))
        .order("asc")
        .collect();

      // Вычисляем streak
      const streak = calculateStreak(checkpoints);

      // Вычисляем следующую дату чекпоинта
      const lastCheckpoint = checkpoints[checkpoints.length - 1];
      const nextCheckpointDate = lastCheckpoint
        ? new Date(lastCheckpoint.createdAt + 7 * 24 * 60 * 60 * 1000)
        : new Date();

      return {
        checkpoints,
        streak,
        nextCheckpointDate,
      };
    } catch (error) {
      console.error("Error in getProgressCheckpoints:", error);
      throw error;
    }
  },
});

// Обновление прогресса
export const updateProgress = mutation({
  args: {
    userId: v.string(), // Передаем userId явно
    photoUrl: v.string(),
    originalAnalysisId: v.id("bodyAnalyses"),
    newAnalysisData: v.object({
      bodyType: v.union(
        v.literal("ectomorph"),
        v.literal("mesomorph"),
        v.literal("endomorph"),
        v.literal("mixed")
      ),
      estimatedBodyFat: v.number(),
      estimatedMuscleMass: v.number(),
      posture: v.union(v.literal("good"), v.literal("fair"), v.literal("poor")),
      fitnessScore: v.number(),
      progressPotential: v.number(),
      problemAreas: v.array(
        v.object({
          area: v.union(
            v.literal("живот"),
            v.literal("бедра"),
            v.literal("руки"),
            v.literal("спина"),
            v.literal("грудь")
          ),
          severity: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
          recommendation: v.string(),
        })
      ),
      recommendations: v.object({
        primaryGoal: v.string(),
        secondaryGoals: v.array(v.string()),
        estimatedTimeToGoal: v.number(),
        weeklyTrainingHours: v.number(),
      }),
      currentVisualData: v.object({
        imageUrl: v.string(),
        analyzedImageUrl: v.optional(v.string()),
        bodyOutlineData: v.optional(v.any()),
      }),
      futureProjections: v.object({
        weeks4: v.object({
          estimatedWeight: v.number(),
          estimatedBodyFat: v.number(),
          estimatedMuscleMass: v.number(),
          confidenceLevel: v.number(),
        }),
        weeks8: v.object({
          estimatedWeight: v.number(),
          estimatedBodyFat: v.number(),
          estimatedMuscleMass: v.number(),
          confidenceLevel: v.number(),
        }),
        weeks12: v.object({
          estimatedWeight: v.number(),
          estimatedBodyFat: v.number(),
          estimatedMuscleMass: v.number(),
          confidenceLevel: v.number(),
        }),
      }),
    }),
    weight: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    try {
      if (!args.userId) {
        throw new Error("userId is required");
      }

      // Получаем оригинальный анализ
      const originalAnalysis = await ctx.db.get(args.originalAnalysisId);
      if (!originalAnalysis) {
        throw new Error("Original analysis not found");
      }

      // Проверяем, что анализ принадлежит текущему пользователю
      if (originalAnalysis.userId !== args.userId) {
        throw new Error("Unauthorized - Analysis belongs to another user");
      }

      // Сравниваем анализы
      const comparison = compareAnalyses(originalAnalysis, args.newAnalysisData);

      // Создаем новый чекпоинт
      const checkpointId = await ctx.db.insert("progressCheckpoints", {
        userId: args.userId,
        analysisId: args.originalAnalysisId,
        weight: args.weight || comparison.currentWeight,
        bodyFat: args.newAnalysisData.estimatedBodyFat,
        muscleMass: args.newAnalysisData.estimatedMuscleMass,
        photoUrl: args.photoUrl,
        aiScore: calculateProgressScore(comparison),
        achievements: comparison.achievements,
        comparisonWithProjection: {
          onTrack: comparison.onTrack,
          deviationPercent: comparison.progressPercentage,
        },
        createdAt: Date.now(),
      });

      // Проверяем достижения
      await ctx.scheduler.runAfter(0, internal.bodyAnalysis.checkProgressAchievements, {
        userId: args.userId,
        comparison,
      });

      // Обновляем лидерборд
      await ctx.scheduler.runAfter(0, internal.bodyAnalysis.updateLeaderboard, {
        userId: args.userId,
        comparison,
        analysisId: args.originalAnalysisId,
      });

      // Генерируем мотивационное сообщение
      const motivationalMessage = generateMotivationalMessage(comparison);

      return {
        checkpointId,
        comparison,
        motivationalMessage,
        newAnalysis: args.newAnalysisData,
      };
    } catch (error) {
      console.error("Error in updateProgress:", error);
      throw error;
    }
  },
});

// Получение лидерборда трансформаций
export const getTransformationLeaderboard = query({
  args: {
    userId: v.optional(v.string()), // userId опциональный для лидерборда
  },
  handler: async (ctx, args) => {
    try {
      // Получаем топ трансформаций
      const leaderboard = await ctx.db
        .query("transformationLeaderboard")
        .withIndex("score_active", (q) => q.eq("isActive", true))
        .order("desc")
        .take(100);

      let userRank = 0;
      let userEntry = null;

      // Если передан userId, находим позицию пользователя
      if (args.userId) {
        userEntry = await ctx.db
          .query("transformationLeaderboard")
          .withIndex("user_active", (q) => q.eq("userId", args.userId).eq("isActive", true))
          .first();

        if (userEntry) {
          const betterEntries = await ctx.db
            .query("transformationLeaderboard")
            .withIndex("score_active", (q) => q.eq("isActive", true))
            .filter((q) => q.gt(q.field("score"), userEntry.score))
            .collect();
          userRank = betterEntries.length + 1;
        }
      }

      // Форматируем данные
      const formattedLeaderboard = leaderboard.map((entry, index) => ({
        id: entry._id,
        name: entry.userName || "Анонимный пользователь",
        imageUrl: entry.userImageUrl,
        result: `${entry.weightLost}кг за ${entry.weeks} недель`,
        duration: `${entry.weeks} недель`,
        score: entry.score,
        isCurrentUser: args.userId ? entry.userId === args.userId : false,
      }));

      return {
        leaderboard: formattedLeaderboard,
        userRank,
      };
    } catch (error) {
      console.error("Error in getTransformationLeaderboard:", error);
      throw error;
    }
  },
});

// Сохранение персонализированного плана
export const savePersonalizedPlan = mutation({
  args: {
    userId: v.string(), // Передаем userId явно
    analysisId: v.id("bodyAnalyses"),
    recommendedTrainer: v.object({
      id: v.string(),
      name: v.string(),
      specialty: v.string(),
      matchScore: v.number(),
      reason: v.string(),
    }),
    trainingProgram: v.object({
      id: v.string(),
      name: v.string(),
      duration: v.number(),
      sessionsPerWeek: v.number(),
      focusAreas: v.array(v.string()),
    }),
    nutritionPlan: v.object({
      dailyCalories: v.number(),
      macros: v.object({
        protein: v.number(),
        carbs: v.number(),
        fats: v.number(),
      }),
    }),
    recommendedProducts: v.array(
      v.object({
        productId: v.string(),
        name: v.string(),
        purpose: v.string(),
        timing: v.string(),
        monthlyBudget: v.number(),
        importance: v.union(
          v.literal("essential"),
          v.literal("recommended"),
          v.literal("optional")
        ),
      })
    ),
    membershipRecommendation: v.object({
      type: v.string(),
      reason: v.string(),
      features: v.array(v.string()),
      price: v.number(),
      savings: v.number(),
    }),
    projectedResults: v.object({
      week4: v.string(),
      week8: v.string(),
      week12: v.string(),
      successProbability: v.number(),
    }),
  },
  handler: async (ctx, args) => {
    try {
      if (!args.userId) {
        throw new Error("userId is required");
      }

      const now = Date.now();

      // Проверяем, что анализ принадлежит текущему пользователю
      const analysis = await ctx.db.get(args.analysisId);
      if (!analysis) {
        throw new Error("Analysis not found");
      }

      if (analysis.userId !== args.userId) {
        throw new Error("Unauthorized - Analysis belongs to another user");
      }

      const planId = await ctx.db.insert("personalizedPlans", {
        userId: args.userId,
        analysisId: args.analysisId,
        recommendedTrainer: args.recommendedTrainer,
        trainingProgram: args.trainingProgram,
        nutritionPlan: args.nutritionPlan,
        recommendedProducts: args.recommendedProducts,
        membershipRecommendation: args.membershipRecommendation,
        projectedResults: args.projectedResults,
        createdAt: now,
      });

      return {
        success: true,
        planId,
      };
    } catch (error) {
      console.error("Error in savePersonalizedPlan:", error);
      throw error;
    }
  },
});

// Получение персонализированного плана
export const getPersonalizedPlan = query({
  args: {
    userId: v.string(), // Передаем userId явно
    analysisId: v.id("bodyAnalyses"),
  },
  handler: async (ctx, args) => {
    try {
      if (!args.userId) {
        throw new Error("userId is required");
      }

      // Проверяем, что анализ принадлежит текущему пользователю
      const analysis = await ctx.db.get(args.analysisId);
      if (!analysis) {
        throw new Error("Analysis not found");
      }

      if (analysis.userId !== args.userId) {
        throw new Error("Unauthorized - Analysis belongs to another user");
      }

      const plan = await ctx.db
        .query("personalizedPlans")
        .withIndex("by_analysis", (q) => q.eq("analysisId", args.analysisId))
        .first();

      return plan;
    } catch (error) {
      console.error("Error in getPersonalizedPlan:", error);
      throw error;
    }
  },
});

// Внутренние функции (internal) - остаются без изменений
export const checkAndAwardAchievements = internalMutation({
  args: {
    userId: v.string(),
    achievementType: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Проверяем, есть ли уже такое достижение
    const existingAchievement = await ctx.db
      .query("userAchievements")
      .withIndex("user_achievement", (q) =>
        q.eq("userId", args.userId).eq("achievementId", args.achievementType)
      )
      .first();

    if (!existingAchievement) {
      const achievementData = getAchievementData(args.achievementType);

      // Создаем достижение
      await ctx.db.insert("userAchievements", {
        userId: args.userId,
        achievementId: args.achievementType,
        title: achievementData.title,
        description: achievementData.description,
        category: "analysis",
        unlockedAt: now,
        reward: achievementData.reward,
      });

      // Начисляем бонусы
      if (args.achievementType === "first_analysis" && achievementData.reward) {
        await ctx.db.insert("userBonuses", {
          userId: args.userId,
          type: "discount",
          value: "10%",
          description: "Скидка на первый месяц за первый анализ",
          isUsed: false,
          expiresAt: now + 30 * 24 * 60 * 60 * 1000, // 30 дней
          createdAt: now,
        });
      }
    }
  },
});

export const checkProgressAchievements = internalMutation({
  args: {
    userId: v.string(),
    comparison: v.any(),
  },
  handler: async (ctx, args) => {
    const { comparison } = args;
    const achievements = comparison.achievements || [];

    for (const achievement of achievements) {
      await ctx.scheduler.runAfter(0, internal.bodyAnalysis.checkAndAwardAchievements, {
        userId: args.userId,
        achievementType: achievement,
      });
    }
  },
});

export const updateLeaderboard = internalMutation({
  args: {
    userId: v.string(),
    comparison: v.any(),
    analysisId: v.id("bodyAnalyses"),
  },
  handler: async (ctx, args) => {
    const { comparison } = args;
    const now = Date.now();

    // Получаем информацию о пользователе из другой таблицы
    const userEntry: { name?: string; photoUrl?: string } | null = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), args.userId))
      .first();

    const userName = userEntry?.name || "Анонимный пользователь";
    const userImageUrl = userEntry?.photoUrl;

    // Проверяем существующую запись в лидерборде
    const existingEntry = await ctx.db
      .query("transformationLeaderboard")
      .withIndex("user_active", (q) => q.eq("userId", args.userId).eq("isActive", true))
      .first();

    const score = calculateProgressScore(comparison);
    const weightLost = comparison.weightLost || 0;
    const bodyFatLost = comparison.bodyFatChange || 0;
    const muscleMassGained = comparison.muscleGained || 0;

    if (existingEntry) {
      // Обновляем существующую запись
      await ctx.db.patch(existingEntry._id, {
        currentWeight: comparison.currentWeight,
        weightLost,
        bodyFatLost,
        muscleMassGained,
        score,
        updatedAt: now,
      });
    } else {
      // Создаем новую запись
      await ctx.db.insert("transformationLeaderboard", {
        userId: args.userId,
        userName,
        userImageUrl,
        analysisId: args.analysisId,
        startWeight: comparison.startWeight || 75, // Mock значение
        currentWeight: comparison.currentWeight,
        weightLost,
        bodyFatLost,
        muscleMassGained,
        weeks: Math.ceil((now - (comparison.startDate || now)) / (7 * 24 * 60 * 60 * 1000)),
        score,
        isActive: true,
        isPublic: true,
        createdAt: now,
        updatedAt: now,
      });
    }
  },
});

// Вспомогательные функции - остаются без изменений
function calculateStreak(checkpoints: any[]): number {
  if (checkpoints.length === 0) return 0;

  let streak = 1;
  const now = Date.now();
  const oneWeek = 7 * 24 * 60 * 60 * 1000;

  for (let i = checkpoints.length - 1; i > 0; i--) {
    const diff = checkpoints[i].createdAt - checkpoints[i - 1].createdAt;
    if (diff <= oneWeek * 1.5) {
      // Даем немного свободы (1.5 недели)
      streak++;
    } else {
      break;
    }
  }

  // Проверяем, не пропустил ли последний чекпоинт
  const lastCheckpoint = checkpoints[checkpoints.length - 1];
  if (now - lastCheckpoint.createdAt > oneWeek * 1.5) {
    return 0; // Streak сброшен
  }

  return streak;
}

function compareAnalyses(original: any, current: any): any {
  const weightLost = Math.round((original.estimatedBodyFat - current.estimatedBodyFat) * 0.7 * 10) / 10;
  const muscleGained = current.estimatedMuscleMass - original.estimatedMuscleMass;
  const fitnessImprovement = current.fitnessScore - original.fitnessScore;

  const achievements = [];
  if (weightLost >= 5) achievements.push("5kg_lost");
  if (weightLost >= 10) achievements.push("10kg_lost");
  if (muscleGained >= 2) achievements.push("muscle_builder");
  if (fitnessImprovement >= 20) achievements.push("fitness_improver");

  return {
    weightLost,
    muscleGained,
    fitnessImprovement,
    bodyFatChange: original.estimatedBodyFat - current.estimatedBodyFat,
    currentWeight: 75 - weightLost, // Mock weight
    achievements,
    onTrack: weightLost >= (original.futureProjections?.weeks12?.estimatedWeight || 0) * 0.3,
    progressPercentage: Math.round((weightLost / Math.abs(original.futureProjections?.weeks12?.estimatedWeight || 1)) * 100),
  };
}

function calculateProgressScore(comparison: any): number {
  let score = 50; // Базовый балл

  score += comparison.weightLost * 5;
  score += comparison.muscleGained * 10;
  score += comparison.fitnessImprovement;

  if (comparison.onTrack) score += 20;

  return Math.min(100, Math.round(score));
}

function generateMotivationalMessage(comparison: any): string {
  if (comparison.progressPercentage >= 80) {
    return "Невероятно! Вы почти у цели! 🎯";
  } else if (comparison.progressPercentage >= 50) {
    return "Отличный прогресс! Вы на полпути к цели! 💪";
  } else if (comparison.progressPercentage >= 25) {
    return "Хорошее начало! Продолжайте в том же духе! 🚀";
  } else if (comparison.onTrack) {
    return "Вы на правильном пути! Каждый шаг важен! 👏";
  } else {
    return "Не сдавайтесь! Успех требует времени! 💪";
  }
}

function getAchievementData(achievementType: string): {
  title: string;
  description: string;
  reward?: { type: "discount" | "product" | "session" | "badge"; value: string };
} {
  const achievements: Record<string, any> = {
    first_analysis: {
      title: "Первый шаг",
      description: "Поздравляем с первым анализом тела!",
      reward: { type: "discount", value: "10% на первый месяц" },
    },
    "5kg_lost": {
      title: "Минус 5 кг",
      description: "Отличная работа! Вы потеряли 5 кг!",
      reward: { type: "product", value: "Бесплатный шейкер" },
    },
    "10kg_lost": {
      title: "Минус 10 кг",
      description: "Невероятно! Вы потеряли 10 кг!",
      reward: { type: "session", value: "3 бесплатные тренировки" },
    },
    muscle_builder: {
      title: "Строитель мышц",
      description: "Вы набрали мышечную массу!",
      reward: { type: "badge", value: "VIP статус на месяц" },
    },
    fitness_improver: {
      title: "Улучшитель формы",
      description: "Ваша физическая форма значительно улучшилась!",
      reward: { type: "discount", value: "50% на следующий анализ" },
    },
  };

  return achievements[achievementType] || {
    title: "Достижение",
    description: "Описание достижения",
  };
}