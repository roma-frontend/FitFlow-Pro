// convex/notifications.ts (исправленная версия)
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getByRecipient = query({
  args: {
    recipientId: v.string(),
    recipientType: v.union(
      v.literal("user"),
      v.literal("member"),
      v.literal("trainer"),
      v.literal("admin")
    )
  },
  handler: async (ctx, args) => {
    return await ctx.db.query("notifications")
      .filter((q) => q.and(
        q.eq(q.field("recipientId"), args.recipientId),
        q.eq(q.field("recipientType"), args.recipientType)
      ))
      .order("desc")
      .collect();
  },
});

export const create = mutation({
  args: {
    recipientId: v.string(),
    recipientType: v.union(
      v.literal("user"),
      v.literal("member"),
      v.literal("trainer"),
      v.literal("admin")
    ),
    title: v.string(),
    message: v.string(),
    type: v.union(
      v.literal("info"),
      v.literal("warning"),
      v.literal("error"),
      v.literal("success"),
      v.literal("order"),
      v.literal("payment"),
      v.literal("membership"),
      v.literal("training"),
      v.literal("system")
    ),
    priority: v.optional(v.union(
      v.literal("low"),
      v.literal("normal"),
      v.literal("high"),
      v.literal("urgent")
    )),
    isImportant: v.optional(v.boolean()),
    isRead: v.optional(v.boolean()), // ✅ Добавляем это поле
    relatedId: v.optional(v.string()),
    actionUrl: v.optional(v.string()),
    createdAt: v.optional(v.number()),
    readAt: v.optional(v.number()), // ✅ Добавляем и это поле
    metadata: v.optional(v.object({
      sourceId: v.optional(v.string()),
      sourceType: v.optional(v.string()),
      data: v.optional(v.any()),
    })),
  },
  handler: async (ctx, args) => {
    console.log("🔔 Создание уведомления:", args);

    const notificationId = await ctx.db.insert("notifications", {
      ...args,
      isRead: args.isRead || false, // ✅ Используем переданное значение или false по умолчанию
      priority: args.priority || "normal",
      createdAt: args.createdAt || Date.now(),
    });

    console.log("✅ Уведомление создано:", notificationId);
    return notificationId;
  },
});

export const markAsRead = mutation({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.notificationId, {
      isRead: true,
      readAt: Date.now(),
    });
    return args.notificationId;
  },
});

// Дополнительные полезные функции
export const getUnreadCount = query({
  args: {
    recipientId: v.string(),
    recipientType: v.union(
      v.literal("user"),
      v.literal("member"),
      v.literal("trainer"),
      v.literal("admin")
    )
  },
  handler: async (ctx, args) => {
    const unreadNotifications = await ctx.db.query("notifications")
      .filter((q) => q.and(
        q.eq(q.field("recipientId"), args.recipientId),
        q.eq(q.field("recipientType"), args.recipientType),
        q.eq(q.field("isRead"), false)
      ))
      .collect();

    return unreadNotifications.length;
  },
});

export const markAllAsRead = mutation({
  args: {
    recipientId: v.string(),
    recipientType: v.union(
      v.literal("user"),
      v.literal("member"),
      v.literal("trainer"),
      v.literal("admin")
    )
  },
  handler: async (ctx, args) => {
    const unreadNotifications = await ctx.db.query("notifications")
      .filter((q) => q.and(
        q.eq(q.field("recipientId"), args.recipientId),
        q.eq(q.field("recipientType"), args.recipientType),
        q.eq(q.field("isRead"), false)
      ))
      .collect();

    const updatePromises = unreadNotifications.map(notification =>
      ctx.db.patch(notification._id, {
        isRead: true,
        readAt: Date.now(),
      })
    );

    await Promise.all(updatePromises);
    return unreadNotifications.length;
  },
});

// Получить последние уведомления
export const getRecent = query({
  args: {
    recipientId: v.string(),
    recipientType: v.union(
      v.literal("user"),
      v.literal("member"),
      v.literal("trainer"),
      v.literal("admin")
    ),
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    return await ctx.db.query("notifications")
      .filter((q) => q.and(
        q.eq(q.field("recipientId"), args.recipientId),
        q.eq(q.field("recipientType"), args.recipientType)
      ))
      .order("desc")
      .take(args.limit || 10);
  },
});

// Удалить уведомление
export const remove = mutation({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.notificationId);
    return args.notificationId;
  },
});
