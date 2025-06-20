import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getAll = query({
  handler: async (ctx) => {
    return await ctx.db.query("accessLogs")
      .order("desc")
      .collect();
  },
});

export const getByUserId = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("accessLogs")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .order("desc")
      .collect();
  },
});

export const create = mutation({
  args: {
    userId: v.optional(v.id("users")),
    success: v.boolean(),
    photoUrl: v.optional(v.string()),
    ipAddress: v.optional(v.string()),
    deviceInfo: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
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
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    return await ctx.db
      .query("accessLogs")
      .order("desc")
      .take(limit);
  },
});

export const getSuccessfulLogins = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("accessLogs")
      .filter((q) => q.eq(q.field("success"), true))
      .order("desc")
      .collect();
  },
});

export const getFailedAttempts = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("accessLogs")
      .filter((q) => q.eq(q.field("success"), false))
      .order("desc")
      .collect();
  },
});
