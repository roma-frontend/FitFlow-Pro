// convex/badgeAnalytics.ts
import { v } from "convex/values";
import { query } from "./_generated/server";

// Получить общую аналитику badge
export const getBadgeAnalytics = query({
  args: {
    dateFrom: v.optional(v.number()),
    dateTo: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const settings = await ctx.db
      .query("headerBadgeSettings")
      .collect();

    const totalBadges = settings.length;
    const activeBadges = settings.filter(s => s.isActive && s.badgeEnabled).length;
    
    const totalClicks = settings.reduce((sum, s) => sum + (s.analytics?.clicks || 0), 0);
    const totalImpressions = settings.reduce((sum, s) => sum + (s.analytics?.impressions || 0), 0);
    
    const averageCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

    // Топ badge по производительности
    const topPerformingBadges = settings
      .filter(s => s.analytics && s.analytics.impressions > 0)
      .map(s => ({
        href: s.navigationItemHref,
        text: s.badgeText || '',
        clicks: s.analytics!.clicks,
        impressions: s.analytics!.impressions,
        ctr: (s.analytics!.clicks / s.analytics!.impressions) * 100
      }))
      .sort((a, b) => b.ctr - a.ctr)
      .slice(0, 10);

    return {
      totalBadges,
      activeBadges,
      totalClicks,
      totalImpressions,
      averageCTR: Number(averageCTR.toFixed(2)),
      topPerformingBadges
    };
  },
});

// Получить аналитику по временным периодам
export const getBadgeAnalyticsByPeriod = query({
  args: {
    period: v.union(v.literal("day"), v.literal("week"), v.literal("month")),
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    // Здесь можно добавить логику для получения аналитики по периодам
    // Для этого потребуется дополнительная таблица для хранения исторических данных
    return [];
  },
});

// Экспорт аналитики
export const exportBadgeAnalytics = query({
  args: {},
  handler: async (ctx) => {
    const settings = await ctx.db
      .query("headerBadgeSettings")
      .collect();

    return settings.map(setting => ({
      href: setting.navigationItemHref,
      variant: setting.badgeVariant,
      text: setting.badgeText || '',
      enabled: setting.badgeEnabled,
      active: setting.isActive,
      priority: setting.priority,
      impressions: setting.analytics?.impressions || 0,
      clicks: setting.analytics?.clicks || 0,
      ctr: setting.analytics?.impressions ? 
        ((setting.analytics.clicks / setting.analytics.impressions) * 100).toFixed(2) : '0.00',
      targetRoles: setting.targetRoles?.join(', ') || 'Все',
      targetDevices: setting.targetDevices?.join(', ') || 'Все',
      validFrom: setting.validFrom ? new Date(setting.validFrom).toISOString() : '',
      validTo: setting.validTo ? new Date(setting.validTo).toISOString() : '',
      createdAt: new Date(setting.createdAt).toISOString(),
      lastShown: setting.analytics?.lastShown ? 
        new Date(setting.analytics.lastShown).toISOString() : ''
    }));
  },
});
