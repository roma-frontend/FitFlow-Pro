// convex/faceProfiles.js
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Создание Face ID профиля
export const create = mutation({
  args: {
    userId: v.id("users"),
    faceDescriptor: v.array(v.number()),
    confidence: v.number(),
    registeredAt: v.number(),
    isActive: v.boolean(),
    metadata: v.optional(v.object({
      registrationMethod: v.string(),
      userAgent: v.optional(v.string())
    }))
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("faceProfiles", args);
  }
});

// Получение профиля по пользователю
export const getByUserId = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("faceProfiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .first();
  }
});

// Получение всех активных профилей
export const listActive = query({
  args: {},
  handler: async (ctx, args) => {
    return await ctx.db
      .query("faceProfiles")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();
  }
});

// Обновление времени последнего использования
export const updateLastUsed = mutation({
  args: {
    profileId: v.id("faceProfiles"),
    timestamp: v.number()
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.profileId, {
      lastUsed: args.timestamp
    });
  }
});

// Удаление Face ID профиля
export const deactivate = mutation({
  args: { profileId: v.id("faceProfiles") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.profileId, { isActive: false });
  }
});
