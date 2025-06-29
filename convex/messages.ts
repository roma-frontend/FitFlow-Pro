// convex/messages.ts (исправленная версия с правильными типами)
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Получение списка сообщений
export const list = query({
  args: {
    userId: v.optional(v.id("users")),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    if (args.userId) {
      // Получаем отправленные сообщения
      const sentMessages = await ctx.db
        .query("messages")
        .withIndex("by_sender", (q) => q.eq("senderId", args.userId!))
        .order("desc")
        .take(args.limit || 50);

      // Получаем все сообщения для фильтрации полученных
      const allMessages = await ctx.db
        .query("messages")
        .order("desc")
        .take(1000);

      const receivedMessages = allMessages.filter(msg =>
        msg.recipientIds.includes(args.userId!)
      );

      // Объединяем и убираем дубликаты
      const combinedMessages = [...sentMessages, ...receivedMessages];
      const uniqueMessages = combinedMessages.filter((msg, index, self) =>
        index === self.findIndex(m => m._id === msg._id)
      );

      return uniqueMessages
        .sort((a, b) => b._creationTime - a._creationTime)
        .slice(0, args.limit || 50);
    } else {
      const messages = await ctx.db
        .query("messages")
        .order("desc")
        .take(args.limit || 50);

      return messages;
    }
  },
});

// Получение количества непрочитанных сообщений
export const getUnreadCount = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const allMessages = await ctx.db
      .query("messages")
      .collect();

    const userMessages = allMessages.filter(msg =>
      msg.recipientIds.includes(args.userId)
    );

    const unreadCount = userMessages.filter(msg => {
      const readAt = msg.readAt || {};
      return !readAt[args.userId];
    }).length;

    return unreadCount;
  },
});

// Получение непрочитанных сообщений
export const getUnreadMessages = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const allMessages = await ctx.db
      .query("messages")
      .order("desc")
      .collect();

    const userMessages = allMessages.filter(msg =>
      msg.recipientIds.includes(args.userId)
    );

    const unreadMessages = userMessages.filter(msg => {
      const readAt = msg.readAt || {};
      return !readAt[args.userId];
    });

    return unreadMessages;
  },
});

// Поиск сообщений
export const search = query({
  args: {
    searchTerm: v.string(),
    userId: v.optional(v.id("users")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const allMessages = await ctx.db
      .query("messages")
      .collect();

    let filteredMessages = allMessages;

    // Фильтрация по пользователю
    if (args.userId) {
      const userId = args.userId;
      filteredMessages = allMessages.filter(msg =>
        msg.senderId === userId || msg.recipientIds.includes(userId)
      );
    }

    // Фильтрация по поисковому запросу
    const searchLower = args.searchTerm.toLowerCase();
    const searchResults = filteredMessages.filter(msg =>
      msg.content.toLowerCase().includes(searchLower) ||
      msg.subject?.toLowerCase().includes(searchLower) ||
      msg.senderName.toLowerCase().includes(searchLower)
    );

    return searchResults
      .sort((a, b) => b._creationTime - a._creationTime)
      .slice(0, args.limit || 50);
  },
});

// Получение сообщений по группе
export const getByGroup = query({
  args: { groupId: v.id("messageGroups") },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_group", (q) => q.eq("groupId", args.groupId))
      .order("desc")
      .collect();

    return messages;
  },
});

// Получение сообщений по типу
export const getByType = query({
  args: {
    type: v.union(
      v.literal("direct"),
      v.literal("group"),
      v.literal("announcement"),
      v.literal("notification")
    ),
    userId: v.optional(v.id("users")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_type", (q) => q.eq("type", args.type))
      .order("desc")
      .take(args.limit || 100);

    if (args.userId) {
      const userId = args.userId;
      return messages.filter(msg =>
        msg.senderId === userId || msg.recipientIds.includes(userId)
      );
    }

    return messages;
  },
});

// Получение архивных сообщений
export const getArchived = query({
  args: {
    userId: v.optional(v.id("users")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const archivedMessages = await ctx.db
      .query("messages")
      .withIndex("by_archived", (q) => q.eq("isArchived", true))
      .order("desc")
      .take(args.limit || 100);

    if (args.userId) {
      const userId = args.userId;
      return archivedMessages.filter(msg =>
        msg.senderId === userId || msg.recipientIds.includes(userId)
      );
    }

    return archivedMessages;
  },
});

// Получение сообщений по приоритету
export const getByPriority = query({
  args: {
    priority: v.union(
      v.literal("low"),
      v.literal("normal"),
      v.literal("high"),
      v.literal("urgent")
    ),
    userId: v.optional(v.id("users")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_priority", (q) => q.eq("priority", args.priority))
      .order("desc")
      .take(args.limit || 100);

    if (args.userId) {
      const userId = args.userId;
      return messages.filter(msg =>
        msg.senderId === userId || msg.recipientIds.includes(userId)
      );
    }

    return messages;
  },
});

// Получение сообщений по статусу
export const getByStatus = query({
  args: {
    status: v.union(
      v.literal("draft"),
      v.literal("sent"),
      v.literal("delivered"),
      v.literal("read")
    ),
    userId: v.optional(v.id("users")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .order("desc")
      .take(args.limit || 100);

    if (args.userId) {
      const userId = args.userId;
      return messages.filter(msg =>
        msg.senderId === userId || msg.recipientIds.includes(userId)
      );
    }

    return messages;
  },
});

// Получение сообщений по типу и статусу (используем составной индекс)
export const getByTypeAndStatus = query({
  args: {
    type: v.union(
      v.literal("direct"),
      v.literal("group"),
      v.literal("announcement"),
      v.literal("notification")
    ),
    status: v.union(
      v.literal("draft"),
      v.literal("sent"),
      v.literal("delivered"),
      v.literal("read")
    ),
    userId: v.optional(v.id("users")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("type_status", (q) =>
        q.eq("type", args.type).eq("status", args.status)
      )
      .order("desc")
      .take(args.limit || 100);

    if (args.userId) {
      const userId = args.userId;
      return messages.filter(msg =>
        msg.senderId === userId || msg.recipientIds.includes(userId)
      );
    }

    return messages;
  },
});

// Получение сообщений по отправителю и типу (используем составной индекс)
export const getBySenderAndType = query({
  args: {
    senderId: v.id("users"),
    type: v.union(
      v.literal("direct"),
      v.literal("group"),
      v.literal("announcement"),
      v.literal("notification")
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("sender_type", (q) =>
        q.eq("senderId", args.senderId).eq("type", args.type)
      )
      .order("desc")
      .take(args.limit || 100);

    return messages;
  },
});

// Отправка сообщения
export const send = mutation({
  args: {
    type: v.union(
      v.literal("direct"),
      v.literal("group"),
      v.literal("announcement"),
      v.literal("notification")
    ),
    subject: v.optional(v.string()),
    content: v.string(),
    senderId: v.id("users"),
    senderName: v.string(),
    recipientIds: v.array(v.id("users")),
    recipientNames: v.array(v.string()),
    groupId: v.optional(v.id("messageGroups")),
    priority: v.union(
      v.literal("low"),
      v.literal("normal"),
      v.literal("high"),
      v.literal("urgent")
    ),
    scheduledAt: v.optional(v.number()),
    templateId: v.optional(v.id("notificationTemplates")),
  },
  handler: async (ctx, args) => {
    const messageId = await ctx.db.insert("messages", {
      type: args.type,
      subject: args.subject,
      content: args.content,
      senderId: args.senderId,
      senderName: args.senderName,
      recipientIds: args.recipientIds,
      recipientNames: args.recipientNames,
      groupId: args.groupId,
      priority: args.priority,
      status: "sent",
      readAt: {},
      isArchived: false,
      scheduledAt: args.scheduledAt,
      metadata: args.templateId ? {
        templateInfo: {
          templateId: args.templateId,
          templateName: "Template",
          variables: {},
          batchId: `batch_${Date.now()}`
        }
      } : undefined,
    });

    return messageId;
  },
});

// Отметка сообщения как прочитанное
export const markAsRead = mutation({
  args: {
    messageId: v.id("messages"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const message = await ctx.db.get(args.messageId);
    if (!message) {
      throw new Error("Сообщение не найдено");
    }

    const readAt = message.readAt || {};
    readAt[args.userId] = new Date().toISOString();

    await ctx.db.patch(args.messageId, {
      readAt,
      status: "read",
    });

    return { success: true };
  },
});

// Архивирование сообщения
export const archive = mutation({
  args: { messageId: v.id("messages") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.messageId, {
      isArchived: true,
    });

    return { success: true };
  },
});

// Удаление сообщения
export const remove = mutation({
  args: { messageId: v.id("messages") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.messageId);
    return { success: true };
  },
});

// Массовое архивирование
export const bulkArchive = mutation({
  args: { messageIds: v.array(v.id("messages")) },
  handler: async (ctx, args) => {
    for (const messageId of args.messageIds) {
      await ctx.db.patch(messageId, {
        isArchived: true,
      });
    }

    return { success: true, count: args.messageIds.length };
  },
});

// Массовое удаление
export const bulkDelete = mutation({
  args: { messageIds: v.array(v.id("messages")) },
  handler: async (ctx, args) => {
    for (const messageId of args.messageIds) {
      await ctx.db.delete(messageId);
    }

    return { success: true, count: args.messageIds.length };
  },
});

// Массовая отметка как прочитанное
export const bulkMarkAsRead = mutation({
  args: {
    messageIds: v.array(v.id("messages")),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    for (const messageId of args.messageIds) {
      const message = await ctx.db.get(messageId);
      if (message) {
        const readAt = message.readAt || {};
        readAt[args.userId] = new Date().toISOString();

        await ctx.db.patch(messageId, {
          readAt,
          status: "read",
        });
      }
    }

    return { success: true, count: args.messageIds.length };
  },
});

// Получение статистики сообщений
export const getStats = query({
  args: { userId: v.optional(v.id("users")) },
  handler: async (ctx, args) => {
    const allMessages = await ctx.db.query("messages").collect();

    let userMessages = allMessages;
    if (args.userId) {
      const userId = args.userId;
      userMessages = allMessages.filter(msg =>
        msg.senderId === userId || msg.recipientIds.includes(userId)
      );
    }

    const stats = {
      total: userMessages.length,
      unread: userMessages.filter(msg => {
        if (!args.userId) return false;
        const userId = args.userId;
        const readAt = msg.readAt || {};
        return msg.recipientIds.includes(userId) && !readAt[userId];
      }).length,
      archived: userMessages.filter(msg => msg.isArchived).length,
      byType: {
        direct: userMessages.filter(msg => msg.type === "direct").length,
        group: userMessages.filter(msg => msg.type === "group").length,
        announcement: userMessages.filter(msg => msg.type === "announcement").length,
        notification: userMessages.filter(msg => msg.type === "notification").length,
      },
      byPriority: {
        low: userMessages.filter(msg => msg.priority === "low").length,
        normal: userMessages.filter(msg => msg.priority === "normal").length,
        high: userMessages.filter(msg => msg.priority === "high").length,
        urgent: userMessages.filter(msg => msg.priority === "urgent").length,
      },
      byStatus: {
        draft: userMessages.filter(msg => msg.status === "draft").length,
        sent: userMessages.filter(msg => msg.status === "sent").length,
        delivered: userMessages.filter(msg => msg.status === "delivered").length,
        read: userMessages.filter(msg => msg.status === "read").length,
      },
    };

    return stats;
  },
});

// Получение сообщений для конкретного пользователя
export const getUserMessages = query({
  args: {
    userId: v.id("users"),
    limit: v.optional(v.number()),
    includeArchived: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const sentMessages = await ctx.db
      .query("messages")
      .withIndex("by_sender", (q) => q.eq("senderId", args.userId))
      .order("desc")
      .take(args.limit || 100);

    const allMessages = await ctx.db
      .query("messages")
      .order("desc")
      .take(1000);

    const receivedMessages = allMessages.filter(msg =>
      msg.recipientIds.includes(args.userId)
    );

    const combinedMessages = [...sentMessages, ...receivedMessages];

    const uniqueMessages = combinedMessages.filter((msg, index, self) =>
      index === self.findIndex(m => m._id === msg._id)
    );

    let filteredMessages = uniqueMessages;
    if (!args.includeArchived) {
      filteredMessages = uniqueMessages.filter(msg => !msg.isArchived);
    }

    return filteredMessages
      .sort((a, b) => b._creationTime - a._creationTime)
      .slice(0, args.limit || 50);
  },
});

// Получение последних сообщений пользователя (оптимизированная версия)
export const getRecentMessages = query({
  args: {
    userId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Получаем отправленные сообщения
    const sentMessages = await ctx.db
      .query("messages")
      .withIndex("by_sender", (q) => q.eq("senderId", args.userId))
      .order("desc")
      .take(args.limit || 20);

    // Получаем полученные сообщения (используем фильтрацию)
    const allRecentMessages = await ctx.db
      .query("messages")
      .order("desc")
      .take(200); // Берем больше для фильтрации

    const receivedMessages = allRecentMessages
      .filter(msg => msg.recipientIds.includes(args.userId))
      .slice(0, args.limit || 20);

    // Объединяем и сортируем
    const combinedMessages = [...sentMessages, ...receivedMessages];
    const uniqueMessages = combinedMessages.filter((msg, index, self) =>
      index === self.findIndex(m => m._id === msg._id)
    );

    return uniqueMessages
      .sort((a, b) => b._creationTime - a._creationTime)
      .slice(0, args.limit || 20);
  },
});

// Получение сообщений по нескольким критериям
export const getFilteredMessages = query({
  args: {
    userId: v.optional(v.id("users")),
    type: v.optional(v.union(
      v.literal("direct"),
      v.literal("group"),
      v.literal("announcement"),
      v.literal("notification")
    )),
    status: v.optional(v.union(
      v.literal("draft"),
      v.literal("sent"),
      v.literal("delivered"),
      v.literal("read")
    )),
    priority: v.optional(v.union(
      v.literal("low"),
      v.literal("normal"),
      v.literal("high"),
      v.literal("urgent")
    )),
    isArchived: v.optional(v.boolean()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let messages;

    // Используем индексы когда возможно
    if (args.type && args.status) {
      // Используем составной индекс
      messages = await ctx.db
        .query("messages")
        .withIndex("type_status", (q) =>
          q.eq("type", args.type!).eq("status", args.status!)
        )
        .order("desc")
        .take(args.limit || 100);
    } else if (args.type) {
      messages = await ctx.db
        .query("messages")
        .withIndex("by_type", (q) => q.eq("type", args.type!))
        .order("desc")
        .take(args.limit || 100);
    } else if (args.status) {
      messages = await ctx.db
        .query("messages")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .order("desc")
        .take(args.limit || 100);
    } else if (args.priority) {
      messages = await ctx.db
        .query("messages")
        .withIndex("by_priority", (q) => q.eq("priority", args.priority!))
        .order("desc")
        .take(args.limit || 100);
    } else if (args.isArchived !== undefined) {
      messages = await ctx.db
        .query("messages")
        .withIndex("by_archived", (q) => q.eq("isArchived", args.isArchived!))
        .order("desc")
        .take(args.limit || 100);
    } else {
      messages = await ctx.db
        .query("messages")
        .order("desc")
        .take(args.limit || 100);
    }

    // Применяем дополнительные фильтры
    if (args.priority && !args.type && !args.status) {
      messages = messages.filter(msg => msg.priority === args.priority);
    }

    if (args.isArchived !== undefined && !args.type && !args.status && !args.priority) {
      messages = messages.filter(msg => msg.isArchived === args.isArchived);
    }

    // Фильтрация по пользователю
    if (args.userId) {
      const userId = args.userId;
      messages = messages.filter(msg =>
        msg.senderId === userId || msg.recipientIds.includes(userId)
      );
    }

    return messages;
  },
});

// Получение сообщения по ID
export const getById = query({
  args: { messageId: v.id("messages") },
  handler: async (ctx, args) => {
    const message = await ctx.db.get(args.messageId);
    return message;
  },
});

// Обновление сообщения
export const update = mutation({
  args: {
    messageId: v.id("messages"),
    subject: v.optional(v.string()),
    content: v.optional(v.string()),
    priority: v.optional(v.union(
      v.literal("low"),
      v.literal("normal"),
      v.literal("high"),
      v.literal("urgent")
    )),
    status: v.optional(v.union(
      v.literal("draft"),
      v.literal("sent"),
      v.literal("delivered"),
      v.literal("read")
    )),
  },
  handler: async (ctx, args) => {
    const { messageId, ...updates } = args;

    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined)
    );

    await ctx.db.patch(messageId, cleanUpdates);
    return { success: true };
  },
});

// Получение сообщений с пагинацией
export const getPaginated = query({
  args: {
    userId: v.optional(v.id("users")),
    cursor: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;

    let queryBuilder = ctx.db.query("messages");

    if (args.cursor) {
      // Реализация курсора для пагинации
      queryBuilder = queryBuilder.filter((q) => q.lt(q.field("_creationTime"), args.cursor!));
    }

    let messages = await queryBuilder.order("desc").take(limit + 1);

    // Фильтрация по пользователю
    if (args.userId) {
      const userId = args.userId;
      messages = messages.filter(msg =>
        msg.senderId === userId || msg.recipientIds.includes(userId)
      );
    }

    const hasMore = messages.length > limit;
    if (hasMore) {
      messages = messages.slice(0, limit);
    }

    const nextCursor = hasMore && messages.length > 0
      ? messages[messages.length - 1]._creationTime
      : null;

    return {
      messages,
      nextCursor,
      hasMore,
    };
  },
});

// Отметка всех сообщений как прочитанные
export const markAllAsRead = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const allMessages = await ctx.db.query("messages").collect();

    const userMessages = allMessages.filter(msg =>
      msg.recipientIds.includes(args.userId)
    );

    let updatedCount = 0;

    for (const message of userMessages) {
      const readAt = message.readAt || {};
      if (!readAt[args.userId]) {
        readAt[args.userId] = new Date().toISOString();

        await ctx.db.patch(message._id, {
          readAt,
          status: "read",
        });

        updatedCount++;
      }
    }

    return { success: true, updatedCount };
  },
});

// Создание черновика из сообщения (исправлен тип)
export const createDraftFromMessage = mutation({
  args: {
    messageId: v.id("messages"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const message = await ctx.db.get(args.messageId);
    if (!message) {
      throw new Error("Сообщение не найдено");
    }

    // Определяем тип для черновика (исключаем notification)
    let draftType: "direct" | "group" | "announcement";
    if (message.type === "notification") {
      draftType = "direct"; // Преобразуем notification в direct
    } else {
      draftType = message.type;
    }

    const draftId = await ctx.db.insert("drafts", {
      type: draftType,
      subject: message.subject ? `Re: ${message.subject}` : undefined,
      content: `\n\n--- Исходное сообщение ---\n${message.content}`,
      recipientIds: [message.senderId], // Отвечаем отправителю
      groupId: message.groupId,
      priority: message.priority,
      createdBy: args.userId,
      templateId: message.metadata?.templateInfo?.templateId as any,
      lastModified: Date.now(),
    });

    return draftId;
  },
});

// Пересылка сообщения (исправлены метаданные)
export const forwardMessage = mutation({
  args: {
    messageId: v.id("messages"),
    recipientIds: v.array(v.id("users")),
    recipientNames: v.array(v.string()),
    senderId: v.id("users"),
    senderName: v.string(),
    additionalContent: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const originalMessage = await ctx.db.get(args.messageId);
    if (!originalMessage) {
      throw new Error("Сообщение не найдено");
    }

    let forwardedContent = `--- Пересланное сообщение ---\nОт: ${originalMessage.senderName}\nТема: ${originalMessage.subject || "Без темы"}\n\n${originalMessage.content}`;

    if (args.additionalContent) {
      forwardedContent = `${args.additionalContent}\n\n${forwardedContent}`;
    }

    const messageId = await ctx.db.insert("messages", {
      type: "direct",
      subject: originalMessage.subject ? `Fwd: ${originalMessage.subject}` : "Пересланное сообщение",
      content: forwardedContent,
      senderId: args.senderId,
      senderName: args.senderName,
      recipientIds: args.recipientIds,
      recipientNames: args.recipientNames,
      priority: originalMessage.priority,
      status: "sent",
      readAt: {},
      isArchived: false,
      metadata: {
        tags: originalMessage.metadata?.tags ? [...originalMessage.metadata.tags, "forwarded"] : ["forwarded"],
        templateInfo: originalMessage.metadata?.templateInfo,
      },
    });

    return messageId;
  },
});

// Получение статистики по периоду
export const getStatsByPeriod = query({
  args: {
    userId: v.optional(v.id("users")),
    startDate: v.number(),
    endDate: v.number(),
  },
  handler: async (ctx, args) => {
    const allMessages = await ctx.db.query("messages").collect();

    // Фильтруем по периоду
    const periodMessages = allMessages.filter(msg =>
      msg._creationTime >= args.startDate && msg._creationTime <= args.endDate
    );

    let userMessages = periodMessages;
    if (args.userId) {
      const userId = args.userId;
      userMessages = periodMessages.filter(msg =>
        msg.senderId === userId || msg.recipientIds.includes(userId)
      );
    }

    const stats = {
      total: userMessages.length,
      sent: userMessages.filter(msg => args.userId && msg.senderId === args.userId).length,
      received: userMessages.filter(msg => args.userId && msg.recipientIds.includes(args.userId)).length,
      byType: {
        direct: userMessages.filter(msg => msg.type === "direct").length,
        group: userMessages.filter(msg => msg.type === "group").length,
        announcement: userMessages.filter(msg => msg.type === "announcement").length,
        notification: userMessages.filter(msg => msg.type === "notification").length,
      },
      byPriority: {
        low: userMessages.filter(msg => msg.priority === "low").length,
        normal: userMessages.filter(msg => msg.priority === "normal").length,
        high: userMessages.filter(msg => msg.priority === "high").length,
        urgent: userMessages.filter(msg => msg.priority === "urgent").length,
      },
      dailyStats: {} as Record<string, number>,
    };

    // Группируем по дням
    userMessages.forEach(msg => {
      const date = new Date(msg._creationTime).toISOString().split('T')[0];
      stats.dailyStats[date] = (stats.dailyStats[date] || 0) + 1;
    });

    return stats;
  },
});

// Поиск сообщений с расширенными фильтрами
export const advancedSearch = query({
  args: {
    searchTerm: v.optional(v.string()),
    userId: v.optional(v.id("users")),
    senderId: v.optional(v.id("users")),
    type: v.optional(v.union(
      v.literal("direct"),
      v.literal("group"),
      v.literal("announcement"),
      v.literal("notification")
    )),
    priority: v.optional(v.union(
      v.literal("low"),
      v.literal("normal"),
      v.literal("high"),
      v.literal("urgent")
    )),
    status: v.optional(v.union(
      v.literal("draft"),
      v.literal("sent"),
      v.literal("delivered"),
      v.literal("read")
    )),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    isArchived: v.optional(v.boolean()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let messages;

    // Начинаем с наиболее специфичного индекса
    if (args.senderId) {
      messages = await ctx.db
        .query("messages")
        .withIndex("by_sender", (q) => q.eq("senderId", args.senderId!))
        .order("desc")
        .take(1000);
    } else if (args.type && args.status) {
      messages = await ctx.db
        .query("messages")
        .withIndex("type_status", (q) =>
          q.eq("type", args.type!).eq("status", args.status!)
        )
        .order("desc")
        .take(1000);
    } else if (args.type) {
      messages = await ctx.db
        .query("messages")
        .withIndex("by_type", (q) => q.eq("type", args.type!))
        .order("desc")
        .take(1000);
    } else if (args.status) {
      messages = await ctx.db
        .query("messages")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .order("desc")
        .take(1000);
    } else if (args.priority) {
      messages = await ctx.db
        .query("messages")
        .withIndex("by_priority", (q) => q.eq("priority", args.priority!))
        .order("desc")
        .take(1000);
    } else if (args.isArchived !== undefined) {
      messages = await ctx.db
        .query("messages")
        .withIndex("by_archived", (q) => q.eq("isArchived", args.isArchived!))
        .order("desc")
        .take(1000);
    } else {
      messages = await ctx.db
        .query("messages")
        .order("desc")
        .take(1000);
    }

    // Применяем фильтры
    let filteredMessages = messages;

    // Фильтр по пользователю
    if (args.userId) {
      const userId = args.userId;
      filteredMessages = filteredMessages.filter(msg =>
        msg.senderId === userId || msg.recipientIds.includes(userId)
      );
    }

    // Фильтр по поисковому запросу
    if (args.searchTerm) {
      const searchLower = args.searchTerm.toLowerCase();
      filteredMessages = filteredMessages.filter(msg =>
        msg.content.toLowerCase().includes(searchLower) ||
        msg.subject?.toLowerCase().includes(searchLower) ||
        msg.senderName.toLowerCase().includes(searchLower)
      );
    }

    // Фильтр по дате
    if (args.startDate) {
      filteredMessages = filteredMessages.filter(msg =>
        msg._creationTime >= args.startDate!
      );
    }

    if (args.endDate) {
      filteredMessages = filteredMessages.filter(msg =>
        msg._creationTime <= args.endDate!
      );
    }

    // Дополнительные фильтры (если не использовались в индексе)
    if (args.priority && !args.type && !args.status) {
      filteredMessages = filteredMessages.filter(msg => msg.priority === args.priority);
    }

    if (args.isArchived !== undefined && !args.type && !args.status && !args.priority) {
      filteredMessages = filteredMessages.filter(msg => msg.isArchived === args.isArchived);
    }

    return filteredMessages
      .sort((a, b) => b._creationTime - a._creationTime)
      .slice(0, args.limit || 50);
  },
});

// Получение диалогов (группировка сообщений по участникам)
export const getConversations = query({
  args: {
    userId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Получаем все сообщения пользователя
    const sentMessages = await ctx.db
      .query("messages")
      .withIndex("by_sender", (q) => q.eq("senderId", args.userId))
      .order("desc")
      .take(500);

    const allMessages = await ctx.db
      .query("messages")
      .order("desc")
      .take(1000);

    const receivedMessages = allMessages.filter(msg =>
      msg.recipientIds.includes(args.userId)
    );

    const allUserMessages = [...sentMessages, ...receivedMessages];

    // Группируем по участникам диалога
    const conversationsMap = new Map();

    for (const message of allUserMessages) {
      let conversationKey;

      if (message.type === "direct") {
        // Для прямых сообщений ключ - это другой участник
        const otherParticipant = message.senderId === args.userId
          ? message.recipientIds[0]
          : message.senderId;
        conversationKey = otherParticipant;
      } else if (message.type === "group" && message.groupId) {
        // Для групповых сообщений ключ - это ID группы
        conversationKey = `group_${message.groupId}`;
      } else {
        // Для остальных типов группируем по типу
        conversationKey = `${message.type}_general`;
      }

      if (!conversationsMap.has(conversationKey)) {
        conversationsMap.set(conversationKey, {
          key: conversationKey,
          type: message.type,
          lastMessage: message,
          messageCount: 0,
          unreadCount: 0,
          participants: message.type === "direct"
            ? [message.senderId, ...message.recipientIds]
            : message.recipientIds,
          groupId: message.groupId,
        });
      }

      const conversation = conversationsMap.get(conversationKey);
      conversation.messageCount++;

      // Обновляем последнее сообщение если это сообщение новее
      if (message._creationTime > conversation.lastMessage._creationTime) {
        conversation.lastMessage = message;
      }

      // Считаем непрочитанные
      if (message.recipientIds.includes(args.userId)) {
        const readAt = message.readAt || {};
        if (!readAt[args.userId]) {
          conversation.unreadCount++;
        }
      }
    }

    // Преобразуем в массив и сортируем по времени последнего сообщения
    const conversations = Array.from(conversationsMap.values())
      .sort((a, b) => b.lastMessage._creationTime - a.lastMessage._creationTime)
      .slice(0, args.limit || 50);

    return conversations;
  },
});

// Получение сообщений конкретного диалога
export const getConversationMessages = query({
  args: {
    userId: v.id("users"),
    otherUserId: v.optional(v.id("users")),
    groupId: v.optional(v.id("messageGroups")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    if (args.groupId) {
      // Получаем сообщения группы
      return await ctx.db
        .query("messages")
        .withIndex("by_group", (q) => q.eq("groupId", args.groupId!))
        .order("desc")
        .take(args.limit || 50);
    } else if (args.otherUserId) {
      // Получаем сообщения диалога между двумя пользователями
      const allMessages = await ctx.db
        .query("messages")
        .withIndex("by_type", (q) => q.eq("type", "direct"))
        .order("desc")
        .take(1000);

      const conversationMessages = allMessages.filter(msg =>
        (msg.senderId === args.userId && msg.recipientIds.includes(args.otherUserId!)) ||
        (msg.senderId === args.otherUserId && msg.recipientIds.includes(args.userId))
      );

      return conversationMessages
        .sort((a, b) => b._creationTime - a._creationTime)
        .slice(0, args.limit || 50);
    } else {
      throw new Error("Необходимо указать либо otherUserId, либо groupId");
    }
  },
});

// Получение треда сообщений (связанных сообщений)
export const getMessageThread = query({
  args: {
    messageId: v.id("messages"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const originalMessage = await ctx.db.get(args.messageId);
    if (!originalMessage) {
      throw new Error("Сообщение не найдено");
    }

    // Проверяем доступ пользователя к сообщению
    const hasAccess = originalMessage.senderId === args.userId ||
      originalMessage.recipientIds.includes(args.userId);

    if (!hasAccess) {
      throw new Error("Нет доступа к сообщению");
    }

    const allMessages = await ctx.db.query("messages").collect();

    // Ищем связанные сообщения по теме или участникам
    const threadMessages = allMessages.filter(msg => {
      // Проверяем доступ к каждому сообщению
      const userHasAccess = msg.senderId === args.userId ||
        msg.recipientIds.includes(args.userId);

      if (!userHasAccess) return false;

      // Связываем по теме (Re: или Fwd:)
      if (msg.subject && originalMessage.subject) {
        const cleanSubject = originalMessage.subject.replace(/^(Re:|Fwd:)\s*/i, '');
        const msgCleanSubject = msg.subject.replace(/^(Re:|Fwd:)\s*/i, '');
        if (cleanSubject === msgCleanSubject) return true;
      }

      // Связываем по участникам (для прямых сообщений)
      if (originalMessage.type === "direct" && msg.type === "direct") {
        const originalParticipants = [originalMessage.senderId, ...originalMessage.recipientIds].sort();
        const msgParticipants = [msg.senderId, ...msg.recipientIds].sort();

        if (originalParticipants.length === msgParticipants.length &&
          originalParticipants.every((id, index) => id === msgParticipants[index])) {
          return true;
        }
      }

      // Связываем по группе
      if (originalMessage.groupId && msg.groupId === originalMessage.groupId) {
        return true;
      }

      return false;
    });

    return threadMessages
      .sort((a, b) => a._creationTime - b._creationTime);
  },
});

// Экспорт сообщений пользователя
export const exportUserMessages = query({
  args: {
    userId: v.id("users"),
    format: v.union(v.literal("json"), v.literal("csv")),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const allMessages = await ctx.db.query("messages").collect();

    let userMessages = allMessages.filter(msg =>
      msg.senderId === args.userId || msg.recipientIds.includes(args.userId)
    );

    // Фильтр по дате
    if (args.startDate) {
      userMessages = userMessages.filter(msg => msg._creationTime >= args.startDate!);
    }

    if (args.endDate) {
      userMessages = userMessages.filter(msg => msg._creationTime <= args.endDate!);
    }

    // Сортируем по дате
    userMessages.sort((a, b) => a._creationTime - b._creationTime);

    if (args.format === "json") {
      return {
        format: "json",
        data: userMessages,
        count: userMessages.length,
      };
    } else {
      // Преобразуем в CSV формат
      const csvHeaders = [
        "Дата",
        "Тип",
        "Тема",
        "Отправитель",
        "Получатели",
        "Приоритет",
        "Статус",
        "Содержание"
      ];

      const csvRows = userMessages.map(msg => [
        new Date(msg._creationTime).toISOString(),
        msg.type,
        msg.subject || "",
        msg.senderName,
        msg.recipientNames.join("; "),
        msg.priority,
        msg.status,
        msg.content.replace(/\n/g, " ").replace(/"/g, '""')
      ]);

      return {
        format: "csv",
        headers: csvHeaders,
        rows: csvRows,
        count: userMessages.length,
      };
    }
  },
});

// Получение сообщений по шаблону
export const getByTemplate = query({
  args: {
    templateId: v.id("notificationTemplates"),
    userId: v.optional(v.id("users")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const allMessages = await ctx.db.query("messages").collect();

    let templateMessages = allMessages.filter(msg =>
      msg.metadata?.templateInfo?.templateId === args.templateId
    );

    // Фильтрация по пользователю
    if (args.userId) {
      const userId = args.userId;
      templateMessages = templateMessages.filter(msg =>
        msg.senderId === userId || msg.recipientIds.includes(userId)
      );
    }

    return templateMessages
      .sort((a, b) => b._creationTime - a._creationTime)
      .slice(0, args.limit || 50);
  },
});

// Получение сообщений по тегам
export const getByTags = query({
  args: {
    tags: v.array(v.string()),
    userId: v.optional(v.id("users")),
    matchAll: v.optional(v.boolean()), // true = все теги должны совпадать, false = любой тег
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const allMessages = await ctx.db.query("messages").collect();

    let taggedMessages = allMessages.filter(msg => {
      const messageTags = msg.metadata?.tags || [];

      if (args.matchAll) {
        // Все указанные теги должны присутствовать
        return args.tags.every(tag => messageTags.includes(tag));
      } else {
        // Хотя бы один тег должен совпадать
        return args.tags.some(tag => messageTags.includes(tag));
      }
    });

    // Фильтрация по пользователю
    if (args.userId) {
      const userId = args.userId;
      taggedMessages = taggedMessages.filter(msg =>
        msg.senderId === userId || msg.recipientIds.includes(userId)
      );
    }

    return taggedMessages
      .sort((a, b) => b._creationTime - a._creationTime)
      .slice(0, args.limit || 50);
  },
});

// Добавление тегов к сообщению
export const addTags = mutation({
  args: {
    messageId: v.id("messages"),
    tags: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const message = await ctx.db.get(args.messageId);
    if (!message) {
      throw new Error("Сообщение не найдено");
    }

    const currentMetadata = message.metadata || {};
    const currentTags = currentMetadata.tags || [];

    // Добавляем новые теги, избегая дубликатов
    const newTags = [...new Set([...currentTags, ...args.tags])];

    await ctx.db.patch(args.messageId, {
      metadata: {
        ...currentMetadata,
        tags: newTags,
      },
    });

    return { success: true, tags: newTags };
  },
});

// Удаление тегов из сообщения
export const removeTags = mutation({
  args: {
    messageId: v.id("messages"),
    tags: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const message = await ctx.db.get(args.messageId);
    if (!message) {
      throw new Error("Сообщение не найдено");
    }

    const currentMetadata = message.metadata || {};
    const currentTags = currentMetadata.tags || [];

    // Удаляем указанные теги
    const newTags = currentTags.filter(tag => !args.tags.includes(tag));

    await ctx.db.patch(args.messageId, {
      metadata: {
        ...currentMetadata,
        tags: newTags,
      },
    });

    return { success: true, tags: newTags };
  },
});

// Получение популярных тегов
export const getPopularTags = query({
  args: {
    userId: v.optional(v.id("users")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const allMessages = await ctx.db.query("messages").collect();

    let userMessages = allMessages;
    if (args.userId) {
      const userId = args.userId;
      userMessages = allMessages.filter(msg =>
        msg.senderId === userId || msg.recipientIds.includes(userId)
      );
    }

    // Собираем все теги и считаем их частоту
    const tagCounts = new Map<string, number>();

    userMessages.forEach(msg => {
      const tags = msg.metadata?.tags || [];
      tags.forEach(tag => {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      });
    });

    // Преобразуем в массив и сортируем по частоте
    const popularTags = Array.from(tagCounts.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, args.limit || 20);

    return popularTags;
  },
});

// Планирование отправки сообщения
export const scheduleMessage = mutation({
  args: {
    type: v.union(
      v.literal("direct"),
      v.literal("group"),
      v.literal("announcement"),
      v.literal("notification")
    ),
    subject: v.optional(v.string()),
    content: v.string(),
    senderId: v.id("users"),
    senderName: v.string(),
    recipientIds: v.array(v.id("users")),
    recipientNames: v.array(v.string()),
    groupId: v.optional(v.id("messageGroups")),
    priority: v.union(
      v.literal("low"),
      v.literal("normal"),
      v.literal("high"),
      v.literal("urgent")
    ),
    scheduledAt: v.number(),
    templateId: v.optional(v.id("notificationTemplates")),
  },
  handler: async (ctx, args) => {
    const messageId = await ctx.db.insert("messages", {
      type: args.type,
      subject: args.subject,
      content: args.content,
      senderId: args.senderId,
      senderName: args.senderName,
      recipientIds: args.recipientIds,
      recipientNames: args.recipientNames,
      groupId: args.groupId,
      priority: args.priority,
      status: "draft", // Запланированные сообщения начинают как черновики
      readAt: {},
      isArchived: false,
      scheduledAt: args.scheduledAt,
      metadata: args.templateId ? {
        templateInfo: {
          templateId: args.templateId,
          templateName: "Template",
          variables: {},
          batchId: `batch_${Date.now()}`
        }
      } : undefined,
    });

    return messageId;
  },
});

// Получение запланированных сообщений
export const getScheduledMessages = query({
  args: {
    userId: v.optional(v.id("users")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const allMessages = await ctx.db.query("messages").collect();

    let scheduledMessages = allMessages.filter(msg =>
      msg.scheduledAt && msg.scheduledAt > Date.now() && msg.status === "draft"
    );

    // Фильтрация по пользователю
    if (args.userId) {
      const userId = args.userId;
      scheduledMessages = scheduledMessages.filter(msg =>
        msg.senderId === userId
      );
    }

    return scheduledMessages
      .sort((a, b) => a.scheduledAt! - b.scheduledAt!)
      .slice(0, args.limit || 50);
  },
});

// Отмена запланированного сообщения
export const cancelScheduledMessage = mutation({
  args: {
    messageId: v.id("messages"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const message = await ctx.db.get(args.messageId);
    if (!message) {
      throw new Error("Сообщение не найдено");
    }

    if (message.senderId !== args.userId) {
      throw new Error("Нет прав для отмены этого сообщения");
    }

    if (!message.scheduledAt || message.status !== "draft") {
      throw new Error("Сообщение не является запланированным");
    }

    await ctx.db.delete(args.messageId);
    return { success: true };
  },
});

// Отправка запланированного сообщения (для системного использования)
export const sendScheduledMessage = mutation({
  args: {
    messageId: v.id("messages"),
  },
  handler: async (ctx, args) => {
    const message = await ctx.db.get(args.messageId);
    if (!message) {
      throw new Error("Сообщение не найдено");
    }

    if (!message.scheduledAt || message.status !== "draft") {
      throw new Error("Сообщение не является запланированным");
    }

    if (message.scheduledAt > Date.now()) {
      throw new Error("Время отправки еще не наступило");
    }

    await ctx.db.patch(args.messageId, {
      status: "sent",
      scheduledAt: undefined, // Убираем планирование после отправки
    });

    return { success: true };
  },
});

// Получение сообщений, требующих внимания (высокий приоритет + непрочитанные)
export const getAttentionRequired = query({
  args: {
    userId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const allMessages = await ctx.db.query("messages").collect();

    const userMessages = allMessages.filter(msg =>
      msg.recipientIds.includes(args.userId)
    );

    const attentionMessages = userMessages.filter(msg => {
      const readAt = msg.readAt || {};
      const isUnread = !readAt[args.userId];
      const isHighPriority = msg.priority === "high" || msg.priority === "urgent";

      return isUnread && isHighPriority;
    });

    return attentionMessages
      .sort((a, b) => {
        // Сначала urgent, потом high, потом по времени
        if (a.priority === "urgent" && b.priority !== "urgent") return -1;
        if (b.priority === "urgent" && a.priority !== "urgent") return 1;
        return b._creationTime - a._creationTime;
      })
      .slice(0, args.limit || 20);
  },
});

// Получение сводной информации о сообщениях
export const getSummary = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const allMessages = await ctx.db.query("messages").collect();

    const userMessages = allMessages.filter(msg =>
      msg.senderId === args.userId || msg.recipientIds.includes(args.userId)
    );

    const sentMessages = userMessages.filter(msg => msg.senderId === args.userId);
    const receivedMessages = userMessages.filter(msg => msg.recipientIds.includes(args.userId));

    const unreadMessages = receivedMessages.filter(msg => {
      const readAt = msg.readAt || {};
      return !readAt[args.userId];
    });

    const urgentMessages = receivedMessages.filter(msg => {
      const readAt = msg.readAt || {};
      return msg.priority === "urgent" && !readAt[args.userId];
    });

    const recentMessages = userMessages
      .filter(msg => msg._creationTime > Date.now() - (7 * 24 * 60 * 60 * 1000))
      .sort((a, b) => b._creationTime - a._creationTime)
      .slice(0, 5);

    return {
      total: userMessages.length,
      sent: sentMessages.length,
      received: receivedMessages.length,
      unread: unreadMessages.length,
      urgent: urgentMessages.length,
      archived: userMessages.filter(msg => msg.isArchived).length,
      recentActivity: recentMessages,
      lastActivity: userMessages.length > 0
        ? Math.max(...userMessages.map(msg => msg._creationTime))
        : null,
    };
  },
});

// Поиск по содержимому с выделением
export const searchWithHighlight = query({
  args: {
    searchTerm: v.string(),
    userId: v.optional(v.id("users")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const allMessages = await ctx.db.query("messages").collect();

    let filteredMessages = allMessages;

    // Фильтрация по пользователю
    if (args.userId) {
      const userId = args.userId;
      filteredMessages = allMessages.filter(msg =>
        msg.senderId === userId || msg.recipientIds.includes(userId)
      );
    }

    const searchLower = args.searchTerm.toLowerCase();
    const searchResults = filteredMessages.filter(msg =>
      msg.content.toLowerCase().includes(searchLower) ||
      msg.subject?.toLowerCase().includes(searchLower) ||
      msg.senderName.toLowerCase().includes(searchLower)
    );

    // Добавляем выделение найденного текста
    const resultsWithHighlight = searchResults.map(msg => {
      const highlightText = (text: string) => {
        const regex = new RegExp(`(${args.searchTerm})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
      };

      return {
        ...msg,
        highlightedContent: highlightText(msg.content),
        highlightedSubject: msg.subject ? highlightText(msg.subject) : undefined,
        highlightedSender: highlightText(msg.senderName),
      };
    });

    return resultsWithHighlight
      .sort((a, b) => b._creationTime - a._creationTime)
      .slice(0, args.limit || 50);
  },
});

// Получение статистики активности пользователя
export const getUserActivity = query({
  args: {
    userId: v.id("users"),
    days: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const days = args.days || 30;
    const startDate = Date.now() - (days * 24 * 60 * 60 * 1000);

    const allMessages = await ctx.db.query("messages").collect();

    const userMessages = allMessages.filter(msg =>
      (msg.senderId === args.userId || msg.recipientIds.includes(args.userId)) &&
      msg._creationTime >= startDate
    );

    const sentMessages = userMessages.filter(msg => msg.senderId === args.userId);
    const receivedMessages = userMessages.filter(msg => msg.recipientIds.includes(args.userId));

    // Группируем по дням
    const dailyActivity = new Map<string, { sent: number; received: number; read: number }>();

    for (let i = 0; i < days; i++) {
      const date = new Date(startDate + (i * 24 * 60 * 60 * 1000));
      const dateStr = date.toISOString().split('T')[0];
      dailyActivity.set(dateStr, { sent: 0, received: 0, read: 0 });
    }

    sentMessages.forEach(msg => {
      const dateStr = new Date(msg._creationTime).toISOString().split('T')[0];
      const activity = dailyActivity.get(dateStr);
      if (activity) {
        activity.sent++;
      }
    });

    receivedMessages.forEach(msg => {
      const dateStr = new Date(msg._creationTime).toISOString().split('T')[0];
      const activity = dailyActivity.get(dateStr);
      if (activity) {
        activity.received++;
      }

      // Проверяем, прочитано ли сообщение
      const readAt = msg.readAt || {};
      if (readAt[args.userId]) {
        // Преобразуем строку обратно в дату для вычислений
        const readDateStr = new Date(readAt[args.userId]).toISOString().split('T')[0];
        const readActivity = dailyActivity.get(readDateStr);
        if (readActivity) {
          readActivity.read++;
        }
      }
    });

    const activityArray = Array.from(dailyActivity.entries()).map(([date, stats]) => ({
      date,
      ...stats,
    }));

    return {
      period: {
        days,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date().toISOString(),
      },
      totals: {
        sent: sentMessages.length,
        received: receivedMessages.length,
        read: receivedMessages.filter(msg => {
          const readAt = msg.readAt || {};
          return readAt[args.userId];
        }).length,
      },
      dailyActivity: activityArray,
      averages: {
        sentPerDay: sentMessages.length / days,
        receivedPerDay: receivedMessages.length / days,
        readPerDay: receivedMessages.filter(msg => {
          const readAt = msg.readAt || {};
          return readAt[args.userId];
        }).length / days,
      },
    };
  },
});

// Получение топ корреспондентов
export const getTopCorrespondents = query({
  args: {
    userId: v.id("users"),
    limit: v.optional(v.number()),
    days: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const days = args.days || 30;
    const startDate = Date.now() - (days * 24 * 60 * 60 * 1000);

    const allMessages = await ctx.db.query("messages").collect();

    const userMessages = allMessages.filter(msg =>
      (msg.senderId === args.userId || msg.recipientIds.includes(args.userId)) &&
      msg._creationTime >= startDate
    );

    const correspondents = new Map<string, {
      userId: string;
      name: string;
      sent: number;
      received: number;
      total: number;
      lastContact: number;
    }>();

    userMessages.forEach(msg => {
      if (msg.senderId === args.userId) {
        // Сообщения, отправленные пользователем
        msg.recipientIds.forEach((recipientId, index) => {
          const recipientName = msg.recipientNames[index] || "Unknown";

          if (!correspondents.has(recipientId)) {
            correspondents.set(recipientId, {
              userId: recipientId,
              name: recipientName,
              sent: 0,
              received: 0,
              total: 0,
              lastContact: msg._creationTime,
            });
          }

          const correspondent = correspondents.get(recipientId)!;
          correspondent.sent++;
          correspondent.total++;
          correspondent.lastContact = Math.max(correspondent.lastContact, msg._creationTime);
        });
      } else if (msg.recipientIds.includes(args.userId)) {
        // Сообщения, полученные пользователем
        const senderId = msg.senderId;
        const senderName = msg.senderName;

        if (!correspondents.has(senderId)) {
          correspondents.set(senderId, {
            userId: senderId,
            name: senderName,
            sent: 0,
            received: 0,
            total: 0,
            lastContact: msg._creationTime,
          });
        }

        const correspondent = correspondents.get(senderId)!;
        correspondent.received++;
        correspondent.total++;
        correspondent.lastContact = Math.max(correspondent.lastContact, msg._creationTime);
      }
    });

    const topCorrespondents = Array.from(correspondents.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, args.limit || 10)
      .map(correspondent => ({
        ...correspondent,
        lastContactFormatted: new Date(correspondent.lastContact).toISOString(),
      }));

    return topCorrespondents;
  },
});

// Получение статистики по времени отправки
export const getTimeStats = query({
  args: {
    userId: v.optional(v.id("users")),
    days: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const days = args.days || 30;
    const startDate = Date.now() - (days * 24 * 60 * 60 * 1000);

    const allMessages = await ctx.db.query("messages").collect();

    let userMessages = allMessages.filter(msg => msg._creationTime >= startDate);

    if (args.userId) {
      const userId = args.userId;
      userMessages = userMessages.filter(msg =>
        msg.senderId === userId || msg.recipientIds.includes(userId)
      );
    }

    // Статистика по часам
    const hourlyStats = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      count: 0,
      percentage: 0,
    }));

    // Статистика по дням недели
    const weeklyStats = Array.from({ length: 7 }, (_, day) => ({
      day,
      dayName: ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'][day],
      count: 0,
      percentage: 0,
    }));

    userMessages.forEach(msg => {
      const date = new Date(msg._creationTime);
      const hour = date.getHours();
      const dayOfWeek = date.getDay();

      hourlyStats[hour].count++;
      weeklyStats[dayOfWeek].count++;
    });

    // Вычисляем проценты
    const totalMessages = userMessages.length;

    hourlyStats.forEach(stat => {
      stat.percentage = totalMessages > 0 ? (stat.count / totalMessages) * 100 : 0;
    });

    weeklyStats.forEach(stat => {
      stat.percentage = totalMessages > 0 ? (stat.count / totalMessages) * 100 : 0;
    });

    // Находим пиковые времена
    const peakHour = hourlyStats.reduce((max, current) =>
      current.count > max.count ? current : max
    );

    const peakDay = weeklyStats.reduce((max, current) =>
      current.count > max.count ? current : max
    );

    return {
      period: {
        days,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date().toISOString(),
        totalMessages,
      },
      hourlyDistribution: hourlyStats,
      weeklyDistribution: weeklyStats,
      peaks: {
        hour: peakHour,
        day: peakDay,
      },
      insights: {
        mostActiveHour: `${peakHour.hour}:00`,
        mostActiveDay: peakDay.dayName,
        averagePerHour: totalMessages / 24,
        averagePerDay: totalMessages / 7,
      },
    };
  },
});

// Получение трендов сообщений
export const getMessageTrends = query({
  args: {
    userId: v.optional(v.id("users")),
    days: v.optional(v.number()),
    groupBy: v.optional(v.union(
      v.literal("day"),
      v.literal("week"),
      v.literal("month")
    )),
  },
  handler: async (ctx, args) => {
    const days = args.days || 30;
    const groupBy = args.groupBy || "day";
    const startDate = Date.now() - (days * 24 * 60 * 60 * 1000);

    const allMessages = await ctx.db.query("messages").collect();

    let userMessages = allMessages.filter(msg => msg._creationTime >= startDate);

    if (args.userId) {
      const userId = args.userId;
      userMessages = userMessages.filter(msg =>
        msg.senderId === userId || msg.recipientIds.includes(userId)
      );
    }

    // Группируем сообщения по периодам
    const trends = new Map<string, {
      period: string;
      total: number;
      sent: number;
      received: number;
      byType: Record<string, number>;
      byPriority: Record<string, number>;
    }>();

    userMessages.forEach(msg => {
      const date = new Date(msg._creationTime);
      let periodKey: string;

      switch (groupBy) {
        case "week":
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          periodKey = weekStart.toISOString().split('T')[0];
          break;
        case "month":
          periodKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
        default: // day
          periodKey = date.toISOString().split('T')[0];
          break;
      }

      if (!trends.has(periodKey)) {
        trends.set(periodKey, {
          period: periodKey,
          total: 0,
          sent: 0,
          received: 0,
          byType: {},
          byPriority: {},
        });
      }

      const trend = trends.get(periodKey)!;
      trend.total++;

      if (args.userId) {
        if (msg.senderId === args.userId) {
          trend.sent++;
        } else if (msg.recipientIds.includes(args.userId)) {
          trend.received++;
        }
      }

      // Группируем по типу
      trend.byType[msg.type] = (trend.byType[msg.type] || 0) + 1;

      // Группируем по приоритету
      trend.byPriority[msg.priority] = (trend.byPriority[msg.priority] || 0) + 1;
    });

    const trendArray = Array.from(trends.values())
      .sort((a, b) => a.period.localeCompare(b.period));

    // Вычисляем изменения
    const trendsWithChanges = trendArray.map((trend, index) => {
      const previousTrend = index > 0 ? trendArray[index - 1] : null;
      const change = previousTrend ? trend.total - previousTrend.total : 0;
      const changePercent = previousTrend && previousTrend.total > 0
        ? ((change / previousTrend.total) * 100)
        : 0;

      return {
        ...trend,
        change,
        changePercent: Math.round(changePercent * 100) / 100,
      };
    });

    return {
      period: {
        days,
        groupBy,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date().toISOString(),
      },
      trends: trendsWithChanges,
      summary: {
        totalPeriods: trendsWithChanges.length,
        averagePerPeriod: trendsWithChanges.length > 0
          ? trendsWithChanges.reduce((sum, t) => sum + t.total, 0) / trendsWithChanges.length
          : 0,
        maxInPeriod: trendsWithChanges.length > 0
          ? Math.max(...trendsWithChanges.map(t => t.total))
          : 0,
        minInPeriod: trendsWithChanges.length > 0
          ? Math.min(...trendsWithChanges.map(t => t.total))
          : 0,
      },
    };
  },
});

// Получение быстрых действий для сообщений
export const getQuickActions = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const allMessages = await ctx.db.query("messages").collect();

    const userMessages = allMessages.filter(msg =>
      msg.senderId === args.userId || msg.recipientIds.includes(args.userId)
    );

    const unreadMessages = userMessages.filter(msg => {
      const readAt = msg.readAt || {};
      return msg.recipientIds.includes(args.userId) && !readAt[args.userId];
    });

    const urgentUnread = unreadMessages.filter(msg => msg.priority === "urgent");
    const highPriorityUnread = unreadMessages.filter(msg => msg.priority === "high");

    const recentMessages = userMessages
      .filter(msg => msg._creationTime > Date.now() - (24 * 60 * 60 * 1000))
      .sort((a, b) => b._creationTime - a._creationTime);

    const scheduledMessages = userMessages.filter(msg =>
      msg.scheduledAt && msg.scheduledAt > Date.now() && msg.status === "draft"
    );

    return {
      unreadCount: unreadMessages.length,
      urgentCount: urgentUnread.length,
      highPriorityCount: highPriorityUnread.length,
      recentCount: recentMessages.length,
      scheduledCount: scheduledMessages.length,
      actions: [
        {
          id: "mark_all_read",
          label: "Отметить все как прочитанные",
          count: unreadMessages.length,
          enabled: unreadMessages.length > 0,
        },
        {
          id: "view_urgent",
          label: "Просмотреть срочные",
          count: urgentUnread.length,
          enabled: urgentUnread.length > 0,
        },
        {
          id: "view_high_priority",
          label: "Просмотреть важные",
          count: highPriorityUnread.length,
          enabled: highPriorityUnread.length > 0,
        },
        {
          id: "view_recent",
          label: "Последние сообщения",
          count: recentMessages.length,
          enabled: recentMessages.length > 0,
        },
        {
          id: "view_scheduled",
          label: "Запланированные сообщения",
          count: scheduledMessages.length,
          enabled: scheduledMessages.length > 0,
        },
        {
          id: "archive_old",
          label: "Архивировать старые",
          count: userMessages.filter(msg =>
            !msg.isArchived &&
            msg._creationTime < Date.now() - (30 * 24 * 60 * 60 * 1000)
          ).length,
          enabled: userMessages.filter(msg =>
            !msg.isArchived &&
            msg._creationTime < Date.now() - (30 * 24 * 60 * 60 * 1000)
          ).length > 0,
        },
      ],
    };
  },
});

// Получение предложений для улучшения
export const getSuggestions = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const allMessages = await ctx.db.query("messages").collect();

    const userMessages = allMessages.filter(msg =>
      msg.senderId === args.userId || msg.recipientIds.includes(args.userId)
    );

    const sentMessages = userMessages.filter(msg => msg.senderId === args.userId);
    const receivedMessages = userMessages.filter(msg => msg.recipientIds.includes(args.userId));

    const unreadMessages = receivedMessages.filter(msg => {
      const readAt = msg.readAt || {};
      return !readAt[args.userId];
    });

    const suggestions = [];

    // Анализ непрочитанных сообщений
    if (unreadMessages.length > 10) {
      suggestions.push({
        type: "productivity",
        priority: "high",
        title: "Много непрочитанных сообщений",
        description: `У вас ${unreadMessages.length} непрочитанных сообщений. Рекомендуем настроить фильтры или уведомления.`,
        action: "setup_filters",
      });
    }

    // Анализ времени отклика
    const responseTimeAnalysis = receivedMessages.map(msg => {
      const readAt = msg.readAt || {};
      if (readAt[args.userId]) {
        // Преобразуем строку в дату и вычисляем разность
        return new Date(readAt[args.userId]).getTime() - msg._creationTime;
      }
      return null;
    }).filter(time => time !== null) as number[];

    // Анализ использования приоритетов
    const priorityUsage = sentMessages.reduce((acc, msg) => {
      acc[msg.priority] = (acc[msg.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const urgentPercent = sentMessages.length > 0 ? (priorityUsage.urgent || 0) / sentMessages.length * 100 : 0;

    if (urgentPercent > 30) {
      suggestions.push({
        type: "communication",
        priority: "medium",
        title: "Частое использование срочного приоритета",
        description: `${Math.round(urgentPercent)}% ваших сообщений помечены как срочные. Рекомендуем более избирательно использовать приоритеты.`,
        action: "review_priorities",
      });
    }

    // Анализ архивирования
    const archivedCount = userMessages.filter(msg => msg.isArchived).length;
    const archiveRate = userMessages.length > 0 ? (archivedCount / userMessages.length) * 100 : 0;

    if (archiveRate < 20 && userMessages.length > 50) {
      suggestions.push({
        type: "organization",
        priority: "low",
        title: "Низкий уровень архивирования",
        description: `Только ${Math.round(archiveRate)}% сообщений архивированы. Регулярное архивирование поможет поддерживать порядок.`,
        action: "setup_auto_archive",
      });
    }

    // Анализ использования тегов
    const messagesWithTags = userMessages.filter(msg =>
      msg.metadata?.tags && msg.metadata.tags.length > 0
    );
    const tagUsageRate = userMessages.length > 0 ? (messagesWithTags.length / userMessages.length) * 100 : 0;

    if (tagUsageRate < 10 && userMessages.length > 20) {
      suggestions.push({
        type: "organization",
        priority: "low",
        title: "Мало используете теги",
        description: `Только ${Math.round(tagUsageRate)}% сообщений имеют теги. Теги помогают лучше организовать и находить сообщения.`,
        action: "start_using_tags",
      });
    }

    // Анализ групповых сообщений
    const groupMessages = sentMessages.filter(msg => msg.type === "group");
    const directMessages = sentMessages.filter(msg => msg.type === "direct");

    if (groupMessages.length > directMessages.length * 2) {
      suggestions.push({
        type: "communication",
        priority: "low",
        title: "Много групповых сообщений",
        description: "Вы часто используете групповые сообщения. Убедитесь, что все получатели действительно нуждаются в этой информации.",
        action: "review_group_usage",
      });
    }

    return {
      totalSuggestions: suggestions.length,
      suggestions: suggestions.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority as keyof typeof priorityOrder] - priorityOrder[a.priority as keyof typeof priorityOrder];
      }),
      stats: {
        totalMessages: userMessages.length,
        unreadCount: unreadMessages.length,
        archiveRate: Math.round(archiveRate),
        tagUsageRate: Math.round(tagUsageRate),
        avgResponseTimeHours: responseTimeAnalysis.length > 0
          ? Math.round((responseTimeAnalysis.reduce((sum, time) => sum + time, 0) / responseTimeAnalysis.length) / (1000 * 60 * 60))
          : 0,
      },
    };
  },
});

// Получение метрик производительности
export const getPerformanceMetrics = query({
  args: {
    userId: v.optional(v.id("users")),
    days: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const days = args.days || 7;
    const startDate = Date.now() - (days * 24 * 60 * 60 * 1000);

    const allMessages = await ctx.db.query("messages").collect();

    let userMessages = allMessages.filter(msg => msg._creationTime >= startDate);

    if (args.userId) {
      const userId = args.userId;
      userMessages = userMessages.filter(msg =>
        msg.senderId === userId || msg.recipientIds.includes(userId)
      );
    }

    const sentMessages = userMessages.filter(msg =>
      args.userId ? msg.senderId === args.userId : true
    );

    const receivedMessages = userMessages.filter(msg =>
      args.userId ? msg.recipientIds.includes(args.userId) : true
    );

    // Метрики отклика
    const responseMetrics = receivedMessages.map(msg => {
      const readAt = msg.readAt || {};
      const userId = args.userId;

      if (userId && readAt[userId]) {
        return {
          messageId: msg._id,
          responseTime: new Date(readAt[userId]).getTime() - msg._creationTime, // Преобразуем строку в число
          priority: msg.priority,
          type: msg.type,
        };
      }
      return null;
    }).filter(Boolean) as Array<{
      messageId: string;
      responseTime: number;
      priority: string;
      type: string;
    }>;

    // Метрики эффективности отправки
    const sendingMetrics = sentMessages.map(msg => {
      const totalRecipients = msg.recipientIds.length;
      const readCount = Object.keys(msg.readAt || {}).length;
      const readRate = totalRecipients > 0 ? (readCount / totalRecipients) * 100 : 0;

      return {
        messageId: msg._id,
        recipients: totalRecipients,
        reads: readCount,
        readRate,
        priority: msg.priority,
        type: msg.type,
      };
    });

    // Вычисляем агрегированные метрики
    const avgResponseTime = responseMetrics.length > 0
      ? responseMetrics.reduce((sum, m) => sum + m.responseTime, 0) / responseMetrics.length
      : 0;

    const avgReadRate = sendingMetrics.length > 0
      ? sendingMetrics.reduce((sum, m) => sum + m.readRate, 0) / sendingMetrics.length
      : 0;

    // Метрики по приоритетам
    const priorityMetrics = ['urgent', 'high', 'normal', 'low'].map(priority => {
      const priorityResponses = responseMetrics.filter(m => m.priority === priority);
      const prioritySending = sendingMetrics.filter(m => m.priority === priority);

      return {
        priority,
        avgResponseTime: priorityResponses.length > 0
          ? priorityResponses.reduce((sum, m) => sum + m.responseTime, 0) / priorityResponses.length
          : 0,
        avgReadRate: prioritySending.length > 0
          ? prioritySending.reduce((sum, m) => sum + m.readRate, 0) / prioritySending.length
          : 0,
        messageCount: prioritySending.length,
      };
    });

    // Метрики по типам
    const typeMetrics = ['direct', 'group', 'announcement', 'notification'].map(type => {
      const typeResponses = responseMetrics.filter(m => m.type === type);
      const typeSending = sendingMetrics.filter(m => m.type === type);

      return {
        type,
        avgResponseTime: typeResponses.length > 0
          ? typeResponses.reduce((sum, m) => sum + m.responseTime, 0) / typeResponses.length
          : 0,
        avgReadRate: typeSending.length > 0
          ? typeSending.reduce((sum, m) => sum + m.readRate, 0) / typeSending.length
          : 0,
        messageCount: typeSending.length,
      };
    });

    return {
      period: {
        days,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date().toISOString(),
      },
      overall: {
        totalMessages: userMessages.length,
        sentMessages: sentMessages.length,
        receivedMessages: receivedMessages.length,
        avgResponseTimeMs: Math.round(avgResponseTime),
        avgResponseTimeFormatted: formatDuration(avgResponseTime),
        avgReadRate: Math.round(avgReadRate * 100) / 100,
        responseRate: receivedMessages.length > 0
          ? (responseMetrics.length / receivedMessages.length) * 100
          : 0,
      },
      byPriority: priorityMetrics.map(m => ({
        ...m,
        avgResponseTimeFormatted: formatDuration(m.avgResponseTime),
        avgReadRate: Math.round(m.avgReadRate * 100) / 100,
      })),
      byType: typeMetrics.map(m => ({
        ...m,
        avgResponseTimeFormatted: formatDuration(m.avgResponseTime),
        avgReadRate: Math.round(m.avgReadRate * 100) / 100,
      })),
      trends: {
        improving: avgResponseTime < 4 * 60 * 60 * 1000 && avgReadRate > 70,
        needsAttention: avgResponseTime > 24 * 60 * 60 * 1000 || avgReadRate < 50,
      },
    };
  },
});

// Функция для форматирования длительности (вспомогательная)
function formatDuration(milliseconds: number): string {
  if (milliseconds < 1000) return `${Math.round(milliseconds)}мс`;

  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}д ${hours % 24}ч`;
  if (hours > 0) return `${hours}ч ${minutes % 60}м`;
  if (minutes > 0) return `${minutes}м ${seconds % 60}с`;
  return `${seconds}с`;
}





