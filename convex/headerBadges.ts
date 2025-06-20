// convex/headerBadges.ts (исправленная версия)
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";

// ✅ Схемы валидации
const badgeConditionsSchema = v.object({
  requireAuth: v.optional(v.boolean()),
  minUserLevel: v.optional(v.number()),
  showOnlyOnce: v.optional(v.boolean()),
  hideAfterClick: v.optional(v.boolean()),
});

const badgeAnalyticsSchema = v.object({
  impressions: v.number(),
  clicks: v.number(),
  clickedUsers: v.array(v.string()),
  lastShown: v.optional(v.number()),
});

const createBadgeSchema = v.object({
  navigationItemHref: v.string(),
  badgeVariant: v.string(),
  badgeText: v.optional(v.string()),
  badgeEnabled: v.boolean(),
  priority: v.number(),
  validFrom: v.optional(v.number()),
  validTo: v.optional(v.number()),
  targetRoles: v.optional(v.array(v.string())),
  targetDevices: v.optional(v.array(v.string())),
  conditions: v.optional(badgeConditionsSchema),
  createdBy: v.string(),
});

const updateBadgeSchema = v.object({
  navigationItemHref: v.optional(v.string()),
  badgeVariant: v.optional(v.string()),
  badgeText: v.optional(v.string()),
  badgeEnabled: v.optional(v.boolean()),
  priority: v.optional(v.number()),
  validFrom: v.optional(v.number()),
  validTo: v.optional(v.number()),
  targetRoles: v.optional(v.array(v.string())),
  targetDevices: v.optional(v.array(v.string())),
  conditions: v.optional(badgeConditionsSchema),
  updatedBy: v.string(),
});

// ✅ Вспомогательная функция для проверки активности настройки
function isSettingActive(setting: Doc<"headerBadgeSettings">): boolean {
  const now = Date.now();
  
  if (!setting.badgeEnabled) return false;
  if (setting.validFrom && setting.validFrom > now) return false;
  if (setting.validTo && setting.validTo < now) return false;
  
  return true;
}

// ✅ Получение всех настроек для админки
export const getAllBadgeSettings = query({
  args: {},
  handler: async (ctx) => {
    const settings = await ctx.db.query("headerBadgeSettings").collect();
    
    return settings.map((setting: Doc<"headerBadgeSettings">) => ({
      ...setting,
      isActive: isSettingActive(setting),
    }));
  },
});

// ✅ Получение активных настроек для отображения
export const getActiveBadgeSettings = query({
  args: {
    userRole: v.optional(v.string()),
    deviceType: v.optional(v.string()),
  },
  handler: async (ctx, { userRole, deviceType }) => {
    console.log('🔍 Convex: getActiveBadgeSettings', { userRole, deviceType });
    
    const allSettings = await ctx.db.query("headerBadgeSettings").collect();
    const now = Date.now();
    
    const activeSettings = allSettings.filter((setting) => {
      // Базовые проверки
      if (!setting.badgeEnabled) {
        return false;
      }
      
      if (setting.validFrom && setting.validFrom > now) {
        return false;
      }
      
      if (setting.validTo && setting.validTo < now) {
        return false;
      }
      
      // Специальная обработка для super-admin - показываем все badge
      if (userRole === 'super-admin') {
        return true;
      }
      
      // Проверка ролей - если targetRoles пуст, показываем всем
      if (setting.targetRoles && setting.targetRoles.length > 0) {
        // Если роль пользователя не указана, не показываем badge с ограничениями по ролям
        if (!userRole) {
          return false;
        }
        
        // Для остальных ролей проверяем наличие в списке
        if (!setting.targetRoles.includes(userRole)) {
          return false;
        }
      }
      
      // Проверка устройств - если targetDevices пуст, показываем на всех устройствах
      if (setting.targetDevices && setting.targetDevices.length > 0) {
        if (!deviceType || !setting.targetDevices.includes(deviceType)) {
          return false;
        }
      }
      
      return true;
    });
    
    // Сортируем по приоритету
    return activeSettings.sort((a, b) => a.priority - b.priority);
  },
});

// ✅ Получение badge для конкретного пункта навигации (исправлено)
export const getBadgeForNavItem = query({
  args: {
    href: v.string(),
    userRole: v.optional(v.string()),
    deviceType: v.optional(v.string()),
  },
  handler: async (ctx, { href, userRole, deviceType }) => {
    // ✅ Исправлено: используем прямой вызов handler функции
    const allSettings = await ctx.db.query("headerBadgeSettings").collect();
    const now = Date.now();
    
    const activeSettings = allSettings.filter((setting: Doc<"headerBadgeSettings">) => {
      // Базовые проверки
      if (!setting.badgeEnabled) return false;
      if (setting.validFrom && setting.validFrom > now) return false;
      if (setting.validTo && setting.validTo < now) return false;
      
      // Проверка ролей
      if (setting.targetRoles && setting.targetRoles.length > 0) {
        if (!userRole || !setting.targetRoles.includes(userRole)) return false;
      }
      
      // Проверка устройств
      if (setting.targetDevices && setting.targetDevices.length > 0) {
        if (!deviceType || !setting.targetDevices.includes(deviceType)) return false;
      }
      
      return true;
    }).sort((a: Doc<"headerBadgeSettings">, b: Doc<"headerBadgeSettings">) => a.priority - b.priority);

    return activeSettings.find((setting: Doc<"headerBadgeSettings">) => setting.navigationItemHref === href) || null;
  },
});

// ✅ Создание новой настройки
export const createBadgeSetting = mutation({
  args: createBadgeSchema,
  handler: async (ctx, args) => {
    const now = Date.now();
    
    const newSetting = await ctx.db.insert("headerBadgeSettings", {
      ...args,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
    
    return newSetting;
  },
});

// ✅ Обновление настройки
export const updateBadgeSetting = mutation({
  args: {
    id: v.id("headerBadgeSettings"),
    updates: updateBadgeSchema,
  },
  handler: async (ctx, { id, updates }) => {
    const { updatedBy, ...updateData } = updates;
    
    await ctx.db.patch(id, {
      ...updateData,
      updatedBy,
      updatedAt: Date.now(),
    });
    
    return id;
  },
});

// ✅ Удаление настройки
export const deleteBadgeSetting = mutation({
  args: {
    id: v.id("headerBadgeSettings"),
  },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
    return { success: true };
  },
});

// ✅ Отслеживание клика по badge
export const trackBadgeClick = mutation({
  args: {
    badgeId: v.id("headerBadgeSettings"),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, { badgeId, userId }) => {
    const setting = await ctx.db.get(badgeId);
    if (!setting) return;
    
    const analytics = setting.analytics || { impressions: 0, clicks: 0, clickedUsers: [] };
    const clickedUsers = userId && !analytics.clickedUsers.includes(userId)
      ? [...analytics.clickedUsers, userId]
      : analytics.clickedUsers;
    
    await ctx.db.patch(badgeId, {
      analytics: {
        ...analytics,
        clicks: analytics.clicks + 1,
        clickedUsers,
      },
    });
  },
});

// ✅ Отслеживание показа badge
export const trackBadgeImpression = mutation({
  args: {
    badgeId: v.id("headerBadgeSettings"),
  },
  handler: async (ctx, { badgeId }) => {
    const setting = await ctx.db.get(badgeId);
    if (!setting) return;
    
    const analytics = setting.analytics || { impressions: 0, clicks: 0, clickedUsers: [] };
    
    await ctx.db.patch(badgeId, {
      analytics: {
        ...analytics,
        impressions: analytics.impressions + 1,
        lastShown: Date.now(),
      },
    });
  },
});

// ✅ Получение статистики
export const getBadgeStats = query({
  args: {},
  handler: async (ctx) => {
    const allSettings = await ctx.db.query("headerBadgeSettings").collect();
    
    const totalBadges = allSettings.length;
    const activeBadges = allSettings.filter((s: Doc<"headerBadgeSettings">) => s.badgeEnabled && isSettingActive(s)).length;
    const totalClicks = allSettings.reduce((sum: number, s: Doc<"headerBadgeSettings">) => sum + (s.analytics?.clicks || 0), 0);
    const totalImpressions = allSettings.reduce((sum: number, s: Doc<"headerBadgeSettings">) => sum + (s.analytics?.impressions || 0), 0);
    const averageCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
    
    return {
      totalBadges,
      activeBadges,
      totalClicks,
      totalImpressions,
      averageCTR,
    };
  },
});

// ✅ Получение шаблонов badge (дополнительная функция)
export const getBadgeTemplates = query({
  args: {},
  handler: async (ctx) => {
    // Возвращаем предустановленные шаблоны
    return [
      {
        _id: "template-1" as Id<"badgeTemplates">,
        _creationTime: Date.now(),
        name: "Новая функция",
        description: "Для новых возможностей",
        variant: "neural-new",
        defaultText: "NEW",
        category: "feature",
        isSystemTemplate: true,
        usageCount: 0,
        createdBy: "system",
        createdAt: Date.now(),
        presetData: {
          priority: 1,
          targetRoles: [],
          targetDevices: [],
          conditions: {
            requireAuth: false,
            minUserLevel: 0,
            showOnlyOnce: false,
            hideAfterClick: false,
          }
        }
      },
      {
        _id: "template-2" as Id<"badgeTemplates">,
        _creationTime: Date.now(),
        name: "Горячее предложение",
        description: "Для акций и скидок",
        variant: "cosmic",
        defaultText: "HOT",
        category: "promotion",
        isSystemTemplate: true,
        usageCount: 0,
        createdBy: "system",
        createdAt: Date.now(),
        presetData: {
          priority: 2,
          targetRoles: [],
          targetDevices: [],
          conditions: {
            requireAuth: false,
            minUserLevel: 0,
            showOnlyOnce: false,
            hideAfterClick: true,
          }
        }
      },
      {
        _id: "template-3" as Id<"badgeTemplates">,
        _creationTime: Date.now(),
        name: "Премиум функция",
        description: "Только для премиум пользователей",
        variant: "quantum-ai",
        defaultText: "PRO",
        category: "premium",
        isSystemTemplate: true,
        usageCount: 0,
        createdBy: "system",
        createdAt: Date.now(),
        presetData: {
          priority: 1,
          targetRoles: ["admin", "premium"],
          targetDevices: [],
          conditions: {
            requireAuth: true,
            minUserLevel: 5,
            showOnlyOnce: false,
            hideAfterClick: false,
          }
        }
      }
    ];
  },
});
