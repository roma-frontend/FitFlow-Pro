// convex/accessLogs.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import type { QueryCtx, MutationCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

export const getAll = query({
  handler: async (ctx) => {
    return await ctx.db.query("accessLogs")
      .order("desc")
      .collect();
  },
});

export const getByUserId = query({
  args: { userId: v.optional(v.id("users")) }, // Делаем опциональным
  handler: async (ctx, args) => {
    if (!args.userId) {
      console.log("⚠️ getByUserId вызван без userId");
      return [];
    }

    try {
      return await ctx.db
        .query("accessLogs")
        .filter((q) => q.eq(q.field("userId"), args.userId))
        .order("desc")
        .collect();
    } catch (error) {
      console.error("❌ Ошибка в getByUserId:", error);
      return [];
    }
  },
});


export const getByUserIdSafe = query({
  args: { userId: v.string() }, // Принимаем строку
  handler: async (ctx, args) => {
    if (!args.userId || args.userId.trim() === '') {
      console.log("⚠️ getByUserIdSafe: пустой userId");
      return [];
    }

    try {
      if (args.userId.length < 10) {
        console.log("⚠️ getByUserIdSafe: невалидный формат ID");
        return [];
      }

      return await ctx.db
        .query("accessLogs")
        .filter((q) => q.eq(q.field("userId"), args.userId))
        .order("desc")
        .collect();
    } catch (error) {
      console.error("❌ Ошибка в getByUserIdSafe:", error);
      return [];
    }
  },
});

export const create = mutation({
  args: {
    userId: v.id("users"),
    success: v.boolean(),
    photoUrl: v.optional(v.string()),
    ipAddress: v.optional(v.string()),
    deviceInfo: v.optional(v.string()),
  },
  handler: async (
    ctx: MutationCtx, 
    args: {
      userId: Id<"users">;
      success: boolean;
      photoUrl?: string;
      ipAddress?: string;
      deviceInfo?: string;
    }
  ) => {
    const logId = await ctx.db.insert("accessLogs", {
      userId: args.userId,
      success: args.success,
      photoUrl: args.photoUrl,
      ipAddress: args.ipAddress,
      deviceInfo: args.deviceInfo,
      timestamp: Date.now(),
    });
    return logId;
  },
});

export const getRecentLogs = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx: QueryCtx, args: { limit?: number }) => {
    const limit = args.limit || 50;
    return await ctx.db
      .query("accessLogs")
      .order("desc")
      .take(limit);
  },
});

export const getSuccessfulLogins = query({
  handler: async (ctx: QueryCtx) => {
    return await ctx.db
      .query("accessLogs")
      .filter((q) => q.eq(q.field("success"), true))
      .order("desc")
      .collect();
  },
});

export const getFailedAttempts = query({
  handler: async (ctx: QueryCtx) => {
    return await ctx.db
      .query("accessLogs")
      .filter((q) => q.eq(q.field("success"), false))
      .order("desc")
      .collect();
  },
});
