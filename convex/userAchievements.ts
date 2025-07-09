// convex/userAchievements.ts
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Получение достижений пользователя
export const getUserAchievements = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const userId = identity.subject;

    const achievements = await ctx.db
      .query("userAchievements")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();

    return achievements;
  },
});

// Получение достижений по категориям
export const getAchievementsByCategory = query({
  args: { category: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const userId = identity.subject;

    let query = ctx.db
      .query("userAchievements")
      .withIndex("by_user", (q) => q.eq("userId", userId));

    if (args.category) {
      query = query.filter((q) => q.eq(q.field("category"), args.category));
    }

    const achievements = await query.order("desc").collect();

    return achievements;
  },
});

// Получение статистики достижений
export const getAchievementStats = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const userId = identity.subject;

    const achievements = await ctx.db
      .query("userAchievements")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const categories = achievements.reduce((acc, achievement) => {
      acc[achievement.category] = (acc[achievement.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const recentAchievements = achievements
      .sort((a, b) => b.unlockedAt - a.unlockedAt)
      .slice(0, 5);

    return {
      totalAchievements: achievements.length,
      categoriesStats: categories,
      recentAchievements,
    };
  },
});

// convex/userBonuses.ts
// Получение бонусов пользователя
export const getUserBonuses = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const userId = identity.subject;

    const bonuses = await ctx.db
      .query("userBonuses")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();

    const now = Date.now();
    
    return bonuses.map(bonus => ({
      ...bonus,
      isExpired: bonus.expiresAt < now,
      isActive: !bonus.isUsed && bonus.expiresAt > now,
    }));
  },
});

// Использование бонуса
export const useBonus = mutation({
  args: { bonusId: v.id("userBonuses") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const userId = identity.subject;
    const bonus = await ctx.db.get(args.bonusId);

    if (!bonus || bonus.userId !== userId) {
      throw new Error("Bonus not found or access denied");
    }

    if (bonus.isUsed) {
      throw new Error("Bonus already used");
    }

    if (bonus.expiresAt < Date.now()) {
      throw new Error("Bonus expired");
    }

    await ctx.db.patch(args.bonusId, {
      isUsed: true,
    });

    return {
      success: true,
      message: "Бонус успешно использован",
    };
  },
});

// Получение активных бонусов
export const getActiveBonuses = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const userId = identity.subject;
    const now = Date.now();

    const activeBonuses = await ctx.db
      .query("userBonuses")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => 
        q.and(
          q.eq(q.field("isUsed"), false),
          q.gt(q.field("expiresAt"), now)
        )
      )
      .collect();

    return activeBonuses;
  },
});