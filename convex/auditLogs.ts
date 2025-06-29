// convex/auditLogs.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Создание записи аудита
export const createAuditLog = mutation({
  args: {
    action: v.string(),
    entityType: v.string(),
    entityId: v.string(),
    performedBy: v.string(),
    ip: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    sessionId: v.optional(v.string()),
    oldValues: v.optional(v.any()),
    newValues: v.optional(v.any()),
    changedFields: v.optional(v.array(v.string())),
    metadata: v.optional(v.any()),
    severity: v.optional(v.string()),
    success: v.optional(v.boolean()),
    errorMessage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const auditLogId = await ctx.db.insert("auditLogs", {
      ...args,
      performedAt: Date.now(),
      severity: args.severity || "medium",
      success: args.success ?? true,
    });
    
    return auditLogId;
  },
});

// ✅ ИСПРАВЛЕННАЯ функция получения логов аудита
export const getAuditLogs = query({
  args: {
    entityType: v.optional(v.string()),
    entityId: v.optional(v.string()),
    performedBy: v.optional(v.string()),
    action: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // ✅ Приоритет 1: Индекс по сущности (entityType + entityId)
    if (args.entityType && args.entityId) {
      return await ctx.db
        .query("auditLogs")
        .withIndex("by_entity", q => 
          q.eq("entityType", args.entityType!)  // ✅ Non-null assertion
           .eq("entityId", args.entityId!)      // ✅ Non-null assertion
        )
        .order("desc")
        .take(args.limit || 100);
    }
    
    // ✅ Приоритет 2: Индекс по пользователю
    if (args.performedBy) {
      let query = ctx.db
        .query("auditLogs")
        .withIndex("by_user", q => q.eq("performedBy", args.performedBy!)); // ✅ Non-null assertion
      
      // Дополнительные фильтры с проверками
      if (args.entityType) {
        query = query.filter(q => q.eq(q.field("entityType"), args.entityType!)); // ✅ Non-null assertion
      }
      if (args.action) {
        query = query.filter(q => q.eq(q.field("action"), args.action!)); // ✅ Non-null assertion
      }
      
      return await query.order("desc").take(args.limit || 100);
    }
    
    // ✅ Приоритет 3: Индекс по действию
    if (args.action) {
      let query = ctx.db
        .query("auditLogs")
        .withIndex("by_action", q => q.eq("action", args.action!)); // ✅ Non-null assertion
      
      // Дополнительные фильтры
      if (args.entityType) {
        query = query.filter(q => q.eq(q.field("entityType"), args.entityType!)); // ✅ Non-null assertion
      }
      
      return await query.order("desc").take(args.limit || 100);
    }
    
    // ✅ Приоритет 4: Индекс только по типу сущности
    if (args.entityType) {
      return await ctx.db
        .query("auditLogs")
        .withIndex("by_entityType", q => q.eq("entityType", args.entityType!)) // ✅ Non-null assertion
        .order("desc")
        .take(args.limit || 100);
    }
    
    // ✅ Fallback: полное сканирование
    return await ctx.db
      .query("auditLogs")
      .order("desc")
      .take(args.limit || 100);
  },
});

// ✅ ИСПРАВЛЕННАЯ функция получения статистики аудита
export const getAuditStats = query({
  args: {
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // ✅ Используем полное сканирование для статистики
    const logs = await ctx.db
      .query("auditLogs")
      .collect();
    
    const filtered = logs.filter(log => {
      if (args.startDate && log.performedAt < args.startDate) return false;
      if (args.endDate && log.performedAt > args.endDate) return false;
      return true;
    });
    
    const stats = {
      total: filtered.length,
      byAction: {} as Record<string, number>,
      bySeverity: {} as Record<string, number>,
      byUser: {} as Record<string, number>,
      failures: filtered.filter(log => !log.success).length,
    };
    
    filtered.forEach(log => {
      stats.byAction[log.action] = (stats.byAction[log.action] || 0) + 1;
      stats.bySeverity[log.severity || "medium"] = (stats.bySeverity[log.severity || "medium"] || 0) + 1;
      stats.byUser[log.performedBy] = (stats.byUser[log.performedBy] || 0) + 1;
    });
    
    return stats;
  },
});

// ✅ Функция для получения логов по временному диапазону (с индексом)
export const getAuditLogsByDateRange = query({
  args: {
    startDate: v.number(),
    endDate: v.number(),
    entityType: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("auditLogs")
      .withIndex("by_timestamp", q => 
        q.gte("performedAt", args.startDate).lte("performedAt", args.endDate)
      );
    
    if (args.entityType) {
      query = query.filter(q => q.eq(q.field("entityType"), args.entityType!)); // ✅ Non-null assertion
    }
    
    return await query
      .order("desc")
      .take(args.limit || 100);
  },
});

// ✅ Функция для получения последних действий пользователя
export const getUserRecentActions = query({
  args: {
    performedBy: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("auditLogs")
      .withIndex("by_user", q => q.eq("performedBy", args.performedBy))
      .order("desc")
      .take(args.limit || 50);
  },
});

// ✅ Функция для получения критических событий
export const getCriticalEvents = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("auditLogs")
      .filter(q => 
        q.or(
          q.eq(q.field("severity"), "critical"),
          q.eq(q.field("severity"), "high"),
          q.eq(q.field("success"), false)
        )
      )
      .order("desc")
      .take(args.limit || 100);
  },
});
