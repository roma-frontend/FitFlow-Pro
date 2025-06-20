// convex/drafts.ts (финальная исправленная версия)
import { Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Получение черновиков пользователя
export const list = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const drafts = await ctx.db
      .query("drafts")
      .withIndex("by_creator", (q) => q.eq("createdBy", args.userId))
      .order("desc")
      .collect();

    return drafts;
  },
});

// Получение черновика по ID
export const getById = query({
  args: { draftId: v.id("drafts") },
  handler: async (ctx, args) => {
    const draft = await ctx.db.get(args.draftId);
    return draft;
  },
});

// Создание черновика
export const create = mutation({
  args: {
    type: v.union(
      v.literal("direct"),
      v.literal("group"),
      v.literal("announcement")
    ),
    subject: v.optional(v.string()),
    content: v.string(),
    recipientIds: v.array(v.id("users")),
    groupId: v.optional(v.id("messageGroups")),
    priority: v.union(
      v.literal("low"),
      v.literal("normal"),
      v.literal("high"),
      v.literal("urgent")
    ),
    createdBy: v.id("users"),
    scheduledAt: v.optional(v.number()),
    templateId: v.optional(v.id("notificationTemplates")),
  },
  handler: async (ctx, args) => {
    const draftId = await ctx.db.insert("drafts", {
      type: args.type,
      subject: args.subject,
      content: args.content,
      recipientIds: args.recipientIds,
      groupId: args.groupId,
      priority: args.priority,
      createdBy: args.createdBy,
      scheduledAt: args.scheduledAt,
      templateId: args.templateId,
      lastModified: Date.now(),
    });
    return draftId;
  },
});

// Обновление черновика
export const update = mutation({
  args: {
    id: v.id("drafts"),
    subject: v.optional(v.string()),
    content: v.optional(v.string()),
    recipientIds: v.optional(v.array(v.id("users"))),
    groupId: v.optional(v.id("messageGroups")),
    priority: v.optional(v.union(
      v.literal("low"),
      v.literal("normal"),
      v.literal("high"),
      v.literal("urgent")
    )),
    scheduledAt: v.optional(v.number()),
    templateId: v.optional(v.id("notificationTemplates")),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;

    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined)
    );

    // Добавляем время последнего изменения
    cleanUpdates.lastModified = Date.now();

    await ctx.db.patch(id, cleanUpdates);
    return { success: true };
  },
});

// Удаление черновика
export const remove = mutation({
  args: { id: v.id("drafts") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return { success: true };
  },
});

// Отправка черновика как сообщения
export const sendDraft = mutation({
  args: {
    draftId: v.id("drafts"),
    senderName: v.string(),
    recipientNames: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const draft = await ctx.db.get(args.draftId);
    if (!draft) {
      throw new Error("Черновик не найден");
    }

    let templateName = "";
    if (draft.templateId) {
      const template = await ctx.db.get(draft.templateId);
      templateName = template?.name || "";
    }

    const messageId = await ctx.db.insert("messages", {
      type: draft.type,
      subject: draft.subject,
      content: draft.content,
      senderId: draft.createdBy,
      senderName: args.senderName,
      recipientIds: draft.recipientIds,
      recipientNames: args.recipientNames,
      groupId: draft.groupId,
      priority: draft.priority,
      status: "sent",
      readAt: {},
      isArchived: false,
      scheduledAt: draft.scheduledAt,
      metadata: draft.templateId
        ? {
          templateInfo: {
            templateId: draft.templateId,
            templateName,
            variables: {},
            batchId: "",
          }
        }
        : undefined,
    });

    await ctx.db.delete(args.draftId);

    return messageId;
  },
});

// Получение черновиков по типу
export const getByType = query({
  args: {
    userId: v.id("users"),
    type: v.union(
      v.literal("direct"),
      v.literal("group"),
      v.literal("announcement")
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const drafts = await ctx.db
      .query("drafts")
      .withIndex("creator_type", (q) =>
        q.eq("createdBy", args.userId).eq("type", args.type)
      )
      .order("desc")
      .take(args.limit || 50);

    return drafts;
  },
});

// Автосохранение черновика
export const autoSave = mutation({
  args: {
    draftId: v.optional(v.id("drafts")),
    type: v.union(
      v.literal("direct"),
      v.literal("group"),
      v.literal("announcement")
    ),
    subject: v.optional(v.string()),
    content: v.string(),
    recipientIds: v.array(v.id("users")),
    groupId: v.optional(v.id("messageGroups")),
    priority: v.union(
      v.literal("low"),
      v.literal("normal"),
      v.literal("high"),
      v.literal("urgent")
    ),
    createdBy: v.id("users"),
    scheduledAt: v.optional(v.number()),
    templateId: v.optional(v.id("notificationTemplates")),
  },
  handler: async (ctx, args) => {
    const { draftId, ...draftData } = args;

    if (draftId) {
      // Обновляем существующий черновик
      await ctx.db.patch(draftId, {
        ...draftData,
        lastModified: Date.now(),
      });
      return { draftId, isNew: false };
    } else {
      // Создаем новый черновик
      const newDraftId = await ctx.db.insert("drafts", {
        ...draftData,
        lastModified: Date.now(),
      });
      return { draftId: newDraftId, isNew: true };
    }
  },
});

// Поиск черновиков
export const search = query({
  args: {
    userId: v.id("users"),
    searchTerm: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const allDrafts = await ctx.db
      .query("drafts")
      .withIndex("by_creator", (q) => q.eq("createdBy", args.userId))
      .collect();

    const searchLower = args.searchTerm.toLowerCase();
    const filteredDrafts = allDrafts.filter(draft =>
      draft.content.toLowerCase().includes(searchLower) ||
      draft.subject?.toLowerCase().includes(searchLower)
    );

    return filteredDrafts
      .sort((a, b) => (b.lastModified || 0) - (a.lastModified || 0))
      .slice(0, args.limit || 20);
  },
});

// Получение запланированных черновиков
export const getScheduled = query({
  args: {
    userId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const allDrafts = await ctx.db
      .query("drafts")
      .withIndex("by_creator", (q) => q.eq("createdBy", args.userId))
      .collect();

    const scheduledDrafts = allDrafts.filter(draft =>
      draft.scheduledAt && draft.scheduledAt > Date.now()
    );

    return scheduledDrafts
      .sort((a, b) => (a.scheduledAt || 0) - (b.scheduledAt || 0))
      .slice(0, args.limit || 50);
  },
});

// Массовое удаление черновиков
export const bulkDelete = mutation({
  args: {
    draftIds: v.array(v.id("drafts")),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    let deletedCount = 0;

    for (const draftId of args.draftIds) {
      const draft = await ctx.db.get(draftId);
      if (draft && draft.createdBy === args.userId) {
        await ctx.db.delete(draftId);
        deletedCount++;
      }
    }

    return { success: true, deletedCount };
  },
});

// Создание черновика из шаблона (исправлена ошибка с типами)
export const createFromTemplate = mutation({
  args: {
    templateId: v.id("notificationTemplates"),
    userId: v.id("users"),
    recipientIds: v.array(v.id("users")),
    groupId: v.optional(v.id("messageGroups")),
    variables: v.optional(v.record(v.string(), v.string())),
  },
  handler: async (ctx, args) => {
    const template = await ctx.db.get(args.templateId);
    if (!template) {
      throw new Error("Шаблон не найден");
    }

    if (!template.isActive) {
      throw new Error("Шаблон неактивен");
    }

    // Подставляем переменные в контент
    let content = template.content;
    let subject = template.subject;

    if (args.variables) {
      for (const [key, value] of Object.entries(args.variables)) {
        const placeholder = `{{${key}}}`;
        content = content.replace(new RegExp(placeholder, 'g'), value);
        subject = subject.replace(new RegExp(placeholder, 'g'), value);
      }
    }

    // Определяем тип черновика на основе типа шаблона
    let draftType: "direct" | "group" | "announcement";
    if (template.type === "email" || template.type === "sms" || template.type === "push") {
      draftType = args.groupId ? "group" : "direct";
    } else {
      draftType = "announcement";
    }

    const draftId = await ctx.db.insert("drafts", {
      type: draftType,
      subject,
      content,
      recipientIds: args.recipientIds,
      groupId: args.groupId,
      priority: template.priority,
      createdBy: args.userId,
      templateId: args.templateId,
      lastModified: Date.now(),
    });

    return draftId;
  },
});

// Валидация черновика перед отправкой (исправлена проверка получателей)
export const validateDraft = query({
  args: { draftId: v.id("drafts") },
  handler: async (ctx, args) => {
    const draft = await ctx.db.get(args.draftId);
    if (!draft) {
      throw new Error("Черновик не найден");
    }

    const errors: string[] = [];
    const warnings: string[] = [];

    // Проверка обязательных полей
    if (!draft.content.trim()) {
      errors.push("Содержание сообщения не может быть пустым");
    }

    if (draft.recipientIds.length === 0) {
      errors.push("Необходимо указать хотя бы одного получателя");
    }

    if (draft.type === "group" && !draft.groupId) {
      errors.push("Для группового сообщения необходимо указать группу");
    }

    // Проверка длины контента
    if (draft.content.length > 10000) {
      warnings.push("Сообщение очень длинное, рекомендуется сократить");
    }

    // Проверка планирования
    if (draft.scheduledAt && draft.scheduledAt <= Date.now()) {
      errors.push("Время планирования должно быть в будущем");
    }

    // Проверка получателей (исправлена обработка undefined)
    const recipientChecks = await Promise.all(
      draft.recipientIds.map(async (id) => {
        try {
          const user = await ctx.db.get(id);
          return { user, id };
        } catch (error) {
          return { user: null, id };
        }
      })
    );

    const invalidRecipients = recipientChecks
      .filter(({ user }) => !user)
      .map(({ id }) => id);

    if (invalidRecipients.length > 0) {
      errors.push(`Некоторые получатели не найдены: ${invalidRecipients.join(", ")}`);
    }

    const inactiveRecipients = recipientChecks
      .filter(({ user }) => user && !user.isActive)
      .length;

    if (inactiveRecipients > 0) {
      warnings.push(`${inactiveRecipients} получателей неактивны`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      recipientCount: draft.recipientIds.length,
      contentLength: draft.content.length,
    };
  },
});

// Конвертация черновика в шаблон (исправлена проверка на undefined)
export const convertToTemplate = mutation({
  args: {
    draftId: v.id("drafts"),
    templateName: v.string(),
    templateDescription: v.optional(v.string()),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const draft = await ctx.db.get(args.draftId);
    if (!draft) {
      throw new Error("Черновик не найден");
    }

    if (draft.createdBy !== args.userId) {
      throw new Error("Нет прав для конвертации этого черновика");
    }

    // Определяем тип шаблона на основе типа черновика
    let templateType: "email" | "sms" | "push" | "in-app";
    switch (draft.type) {
      case "direct":
        templateType = "email";
        break;
      case "group":
        templateType = "in-app";
        break;
      case "announcement":
        templateType = "push";
        break;
      default:
        templateType = "email";
    }

    const templateId = await ctx.db.insert("notificationTemplates", {
      name: args.templateName,
      description: args.templateDescription,
      type: templateType,
      subject: draft.subject || args.templateName,
      content: draft.content,
      priority: draft.priority,
      isActive: true,
      createdBy: args.userId,
      variables: [],
    });

    return templateId;
  },
});

// Получение черновиков с пагинацией (исправлена проверка на undefined)
export const getPaginated = query({
  args: {
    userId: v.id("users"),
    cursor: v.optional(v.number()),
    limit: v.optional(v.number()),
    type: v.optional(v.union(
      v.literal("direct"),
      v.literal("group"),
      v.literal("announcement")
    )),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;

    let drafts;

    if (args.type) {
      // Проверяем, что type не undefined перед использованием
      const draftType = args.type;
      let queryBuilder = ctx.db
        .query("drafts")
        .withIndex("creator_type", (q) =>
          q.eq("createdBy", args.userId).eq("type", draftType)
        );

      if (args.cursor) {
        queryBuilder = queryBuilder.filter((q) =>
          q.lt(q.field("_creationTime"), args.cursor!)
        );
      }

      drafts = await queryBuilder.order("desc").take(limit + 1);
    } else {
      let queryBuilder = ctx.db
        .query("drafts")
        .withIndex("by_creator", (q) => q.eq("createdBy", args.userId));

      if (args.cursor) {
        queryBuilder = queryBuilder.filter((q) =>
          q.lt(q.field("_creationTime"), args.cursor!)
        );
      }

      drafts = await queryBuilder.order("desc").take(limit + 1);
    }

    const hasMore = drafts.length > limit;
    const items = hasMore ? drafts.slice(0, limit) : drafts;

    const nextCursor = hasMore && items.length > 0
      ? items[items.length - 1]._creationTime
      : null;

    return {
      drafts: items,
      nextCursor,
      hasMore,
    };
  },
});

// Получение черновиков с фильтрацией (исправлена проверка на undefined)
export const getFiltered = query({
  args: {
    userId: v.id("users"),
    type: v.optional(v.union(
      v.literal("direct"),
      v.literal("group"),
      v.literal("announcement")
    )),
    priority: v.optional(v.union(
      v.literal("low"),
      v.literal("normal"),
      v.literal("high"),
      v.literal("urgent")
    )),
    hasSchedule: v.optional(v.boolean()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let drafts;

    if (args.type) {
      // Проверяем, что type не undefined
      const draftType = args.type;
      drafts = await ctx.db
        .query("drafts")
        .withIndex("creator_type", (q) =>
          q.eq("createdBy", args.userId).eq("type", draftType)
        )
        .order("desc")
        .collect();
    } else {
      drafts = await ctx.db
        .query("drafts")
        .withIndex("by_creator", (q) => q.eq("createdBy", args.userId))
        .order("desc")
        .collect();
    }

    // Применяем дополнительные фильтры
    let filteredDrafts = drafts;

    if (args.priority) {
      const priorityFilter = args.priority;
      filteredDrafts = filteredDrafts.filter(draft =>
        draft.priority === priorityFilter
      );
    }

    if (args.hasSchedule !== undefined) {
      const scheduleFilter = args.hasSchedule;
      if (scheduleFilter) {
        filteredDrafts = filteredDrafts.filter(draft =>
          draft.scheduledAt && draft.scheduledAt > Date.now()
        );
      } else {
        filteredDrafts = filteredDrafts.filter(draft =>
          !draft.scheduledAt || draft.scheduledAt <= Date.now()
        );
      }
    }

    return filteredDrafts.slice(0, args.limit || 50);
  },
});

// Получение количества черновиков пользователя (исправлена проверка на undefined)
export const getCount = query({
  args: {
    userId: v.id("users"),
    type: v.optional(v.union(
      v.literal("direct"),
      v.literal("group"),
      v.literal("announcement")
    )),
    scheduled: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let drafts;

    if (args.type) {
      // Проверяем, что type не undefined
      const draftType = args.type;
      drafts = await ctx.db
        .query("drafts")
        .withIndex("creator_type", (q) =>
          q.eq("createdBy", args.userId).eq("type", draftType)
        )
        .collect();
    } else {
      drafts = await ctx.db
        .query("drafts")
        .withIndex("by_creator", (q) => q.eq("createdBy", args.userId))
        .collect();
    }

    if (args.scheduled !== undefined) {
      const now = Date.now();
      const scheduledFilter = args.scheduled;
      if (scheduledFilter) {
        drafts = drafts.filter(draft =>
          draft.scheduledAt && draft.scheduledAt > now
        );
      } else {
        drafts = drafts.filter(draft =>
          !draft.scheduledAt || draft.scheduledAt <= now
        );
      }
    }

    return drafts.length;
  },
});

// Получение черновиков по шаблону (исправлена проверка на undefined)
export const getByTemplate = query({
  args: {
    userId: v.id("users"),
    templateId: v.id("notificationTemplates"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const allDrafts = await ctx.db
      .query("drafts")
      .withIndex("by_creator", (q) => q.eq("createdBy", args.userId))
      .collect();

    const templateDrafts = allDrafts.filter(draft =>
      draft.templateId === args.templateId
    );

    return templateDrafts
      .sort((a, b) => (b.lastModified || 0) - (a.lastModified || 0))
      .slice(0, args.limit || 50);
  },
});

// Массовое планирование черновиков (исправлена проверка владельца)
export const bulkSchedule = mutation({
  args: {
    draftIds: v.array(v.id("drafts")),
    scheduledAt: v.number(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    if (args.scheduledAt <= Date.now()) {
      throw new Error("Время планирования должно быть в будущем");
    }

    let scheduledCount = 0;
    const errors: string[] = [];

    for (const draftId of args.draftIds) {
      try {
        const draft = await ctx.db.get(draftId);
        if (!draft) {
          errors.push(`Черновик ${draftId} не найден`);
          continue;
        }

        if (draft.createdBy !== args.userId) {
          errors.push(`Нет прав для планирования черновика ${draftId}`);
          continue;
        }

        await ctx.db.patch(draftId, {
          scheduledAt: args.scheduledAt,
          lastModified: Date.now(),
        });
        scheduledCount++;
      } catch (error) {
        errors.push(`Ошибка при планировании черновика ${draftId}: ${error}`);
      }
    }

    return {
      success: true,
      scheduledCount,
      errors: errors.length > 0 ? errors : undefined
    };
  },
});

// Массовая отмена планирования (исправлена проверка владельца)
export const bulkUnschedule = mutation({
  args: {
    draftIds: v.array(v.id("drafts")),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    let unscheduledCount = 0;
    const errors: string[] = [];

    for (const draftId of args.draftIds) {
      try {
        const draft = await ctx.db.get(draftId);
        if (!draft) {
          errors.push(`Черновик ${draftId} не найден`);
          continue;
        }

        if (draft.createdBy !== args.userId) {
          errors.push(`Нет прав для отмены планирования черновика ${draftId}`);
          continue;
        }

        await ctx.db.patch(draftId, {
          scheduledAt: undefined,
          lastModified: Date.now(),
        });
        unscheduledCount++;
      } catch (error) {
        errors.push(`Ошибка при отмене планирования черновика ${draftId}: ${error}`);
      }
    }

    return {
      success: true,
      unscheduledCount,
      errors: errors.length > 0 ? errors : undefined
    };
  },
});

// Получение черновиков с истекшим планированием (исправлена проверка пользователя)
export const getExpiredScheduled = query({
  args: {
    userId: v.optional(v.id("users")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let allDrafts;

    if (args.userId) {
      // Проверяем, что userId не undefined
      const userIdFilter = args.userId;
      allDrafts = await ctx.db
        .query("drafts")
        .withIndex("by_creator", (q) => q.eq("createdBy", userIdFilter))
        .collect();
    } else {
      allDrafts = await ctx.db.query("drafts").collect();
    }

    const now = Date.now();
    const expiredDrafts = allDrafts.filter(draft =>
      draft.scheduledAt && draft.scheduledAt <= now
    );

    return expiredDrafts
      .sort((a, b) => (a.scheduledAt || 0) - (b.scheduledAt || 0))
      .slice(0, args.limit || 50);
  },
});

// Копирование черновика в новый (исправлена проверка владельца)
export const copy = mutation({
  args: {
    sourceDraftId: v.id("drafts"),
    userId: v.id("users"),
    newRecipientIds: v.optional(v.array(v.id("users"))),
    newGroupId: v.optional(v.id("messageGroups")),
  },
  handler: async (ctx, args) => {
    const sourceDraft = await ctx.db.get(args.sourceDraftId);
    if (!sourceDraft) {
      throw new Error("Исходный черновик не найден");
    }

    if (sourceDraft.createdBy !== args.userId) {
      throw new Error("Нет прав для копирования этого черновика");
    }

    const newDraftId = await ctx.db.insert("drafts", {
      type: sourceDraft.type,
      subject: sourceDraft.subject,
      content: sourceDraft.content,
      recipientIds: args.newRecipientIds || sourceDraft.recipientIds,
      groupId: args.newGroupId || sourceDraft.groupId,
      priority: sourceDraft.priority,
      createdBy: args.userId,
      templateId: sourceDraft.templateId,
      lastModified: Date.now(),
    });

    return newDraftId;
  },
});

// Дублирование черновика (исправлена проверка владельца)
export const duplicate = mutation({
  args: {
    draftId: v.id("drafts"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const originalDraft = await ctx.db.get(args.draftId);
    if (!originalDraft) {
      throw new Error("Черновик не найден");
    }

    if (originalDraft.createdBy !== args.userId) {
      throw new Error("Нет прав для дублирования этого черновика");
    }

    const newDraftId = await ctx.db.insert("drafts", {
      type: originalDraft.type,
      subject: originalDraft.subject ? `Копия: ${originalDraft.subject}` : undefined,
      content: originalDraft.content,
      recipientIds: originalDraft.recipientIds,
      groupId: originalDraft.groupId,
      priority: originalDraft.priority,
      createdBy: args.userId,
      scheduledAt: originalDraft.scheduledAt,
      templateId: originalDraft.templateId,
      lastModified: Date.now(),
    });

    return newDraftId;
  },
});

// Планирование отправки черновика (исправлена проверка владельца)
export const scheduleDraft = mutation({
  args: {
    draftId: v.id("drafts"),
    scheduledAt: v.number(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const draft = await ctx.db.get(args.draftId);
    if (!draft) {
      throw new Error("Черновик не найден");
    }

    if (draft.createdBy !== args.userId) {
      throw new Error("Нет прав для изменения этого черновика");
    }

    if (args.scheduledAt <= Date.now()) {
      throw new Error("Время планирования должно быть в будущем");
    }

    await ctx.db.patch(args.draftId, {
      scheduledAt: args.scheduledAt,
      lastModified: Date.now(),
    });

    return { success: true };
  },
});

// Отмена планирования черновика (исправлена проверка владельца)
export const unscheduleDraft = mutation({
  args: {
    draftId: v.id("drafts"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const draft = await ctx.db.get(args.draftId);
    if (!draft) {
      throw new Error("Черновик не найден");
    }

    if (draft.createdBy !== args.userId) {
      throw new Error("Нет прав для изменения этого черновика");
    }

    await ctx.db.patch(args.draftId, {
      scheduledAt: undefined,
      lastModified: Date.now(),
    });

    return { success: true };
  },
});

// Очистка старых черновиков (исправлена проверка владельца)
export const cleanupOld = mutation({
  args: {
    userId: v.id("users"),
    olderThanDays: v.number(),
    excludeScheduled: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const cutoffTime = Date.now() - (args.olderThanDays * 24 * 60 * 60 * 1000);

    const allDrafts = await ctx.db
      .query("drafts")
      .withIndex("by_creator", (q) => q.eq("createdBy", args.userId))
      .collect();

    let deletedCount = 0;
    const errors: string[] = [];

    for (const draft of allDrafts) {
      try {
        const isOld = draft._creationTime < cutoffTime;
        const isScheduled = draft.scheduledAt && draft.scheduledAt > Date.now();

        if (isOld && (!args.excludeScheduled || !isScheduled)) {
          await ctx.db.delete(draft._id);
          deletedCount++;
        }
      } catch (error) {
        errors.push(`Ошибка при удалении черновика ${draft._id}: ${error}`);
      }
    }

    return {
      success: true,
      deletedCount,
      errors: errors.length > 0 ? errors : undefined
    };
  },
});

// Восстановление черновика из сообщения (исправлена проверка доступа)
export const restoreFromMessage = mutation({
  args: {
    messageId: v.id("messages"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const message = await ctx.db.get(args.messageId);
    if (!message) {
      throw new Error("Сообщение не найдено");
    }

    const hasAccess = message.senderId === args.userId ||
      message.recipientIds.includes(args.userId);

    if (!hasAccess) {
      throw new Error("Нет доступа к сообщению");
    }

    let draftType: "direct" | "group" | "announcement";
    if (message.type === "notification") {
      draftType = "direct";
    } else {
      draftType = message.type;
    }

    const draftId = await ctx.db.insert("drafts", {
      type: draftType,
      subject: message.subject,
      content: message.content,
      recipientIds: message.recipientIds,
      groupId: message.groupId,
      priority: message.priority,
      createdBy: args.userId,
      templateId: message.metadata?.templateInfo?.templateId as Id<"notificationTemplates"> | undefined,

      lastModified: Date.now(),
    });

    return draftId;
  },
});

// Получение черновиков с улучшенной обработкой ошибок
export const getWithErrorHandling = query({
  args: {
    userId: v.id("users"),
    includeInvalid: v.optional(v.boolean()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    try {
      const allDrafts = await ctx.db
        .query("drafts")
        .withIndex("by_creator", (q) => q.eq("createdBy", args.userId))
        .order("desc")
        .take(args.limit || 50);

      if (!args.includeInvalid) {
        return allDrafts;
      }

      // Добавляем информацию о валидности каждого черновика
      const draftsWithValidation = await Promise.all(
        allDrafts.map(async (draft) => {
          const errors: string[] = [];

          if (!draft.content.trim()) {
            errors.push("Пустое содержание");
          }

          if (draft.recipientIds.length === 0) {
            errors.push("Нет получателей");
          }

          if (draft.type === "group" && !draft.groupId) {
            errors.push("Не указана группа");
          }

          if (draft.scheduledAt && draft.scheduledAt <= Date.now()) {
            errors.push("Некорректное время планирования");
          }

          return {
            ...draft,
            isValid: errors.length === 0,
            validationErrors: errors,
          };
        })
      );

      return draftsWithValidation;
    } catch (error) {
      throw new Error(`Ошибка при получении черновиков: ${error}`);
    }
  },
});

// Безопасное обновление черновика с проверками
export const safeUpdate = mutation({
  args: {
    id: v.id("drafts"),
    userId: v.id("users"),
    subject: v.optional(v.string()),
    content: v.optional(v.string()),
    recipientIds: v.optional(v.array(v.id("users"))),
    groupId: v.optional(v.id("messageGroups")),
    priority: v.optional(v.union(
      v.literal("low"),
      v.literal("normal"),
      v.literal("high"),
      v.literal("urgent")
    )),
    scheduledAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, userId, ...updates } = args;

    // Проверяем существование черновика
    const draft = await ctx.db.get(id);
    if (!draft) {
      throw new Error("Черновик не найден");
    }

    // Проверяем права доступа
    if (draft.createdBy !== userId) {
      throw new Error("Нет прав для изменения этого черновика");
    }

    // Валидируем обновления
    if (updates.scheduledAt && updates.scheduledAt <= Date.now()) {
      throw new Error("Время планирования должно быть в будущем");
    }

    if (updates.content !== undefined && !updates.content.trim()) {
      throw new Error("Содержание не может быть пустым");
    }

    if (updates.recipientIds && updates.recipientIds.length === 0) {
      throw new Error("Необходимо указать хотя бы одного получателя");
    }

    // Проверяем существование получателей
    if (updates.recipientIds) {
      const recipientChecks = await Promise.all(
        updates.recipientIds.map(async (recipientId) => {
          const user = await ctx.db.get(recipientId);
          return { user, id: recipientId };
        })
      );

      const invalidRecipients = recipientChecks
        .filter(({ user }) => !user)
        .map(({ id }) => id);

      if (invalidRecipients.length > 0) {
        throw new Error(`Получатели не найдены: ${invalidRecipients.join(", ")}`);
      }
    }

    // Применяем обновления
    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined)
    );

    cleanUpdates.lastModified = Date.now();

    await ctx.db.patch(id, cleanUpdates);

    return { success: true, updatedFields: Object.keys(cleanUpdates) };
  },
});
