// convex/notificationTemplates.ts (полная версия)
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Получение списка шаблонов
export const list = query({
  args: {
    isActive: v.optional(v.boolean()),
    type: v.optional(v.union(
      v.literal("email"),
      v.literal("sms"),
      v.literal("push"),
      v.literal("in-app")
    )),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let templatesQuery = ctx.db.query("notificationTemplates");
    
    if (args.isActive !== undefined) {
      templatesQuery = templatesQuery.filter((q) => 
        q.eq(q.field("isActive"), args.isActive)
      );
    }
    
    if (args.type) {
      templatesQuery = templatesQuery.filter((q) => 
        q.eq(q.field("type"), args.type)
      );
    }
    
    if (args.category) {
      templatesQuery = templatesQuery.filter((q) => 
        q.eq(q.field("category"), args.category)
      );
    }
    
    const templates = await templatesQuery
      .order("desc")
      .collect();
    
    return templates;
  },
});

// Создание шаблона
export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    type: v.union(
      v.literal("email"),
      v.literal("sms"),
      v.literal("push"),
      v.literal("in-app")
    ),
    subject: v.string(),
    content: v.string(),
    variables: v.array(v.string()),
    createdBy: v.id("users"),
    category: v.optional(v.string()),
    priority: v.union(
      v.literal("low"),
      v.literal("normal"),
      v.literal("high"),
      v.literal("urgent")
    ),
  },
  handler: async (ctx, args) => {
    const templateId = await ctx.db.insert("notificationTemplates", {
      name: args.name,
      description: args.description,
      type: args.type,
      subject: args.subject,
      content: args.content,
      variables: args.variables,
      isActive: true,
      createdBy: args.createdBy,
      category: args.category,
      priority: args.priority,
    });
    
    return templateId;
  },
});

// Обновление шаблона
export const update = mutation({
  args: {
    id: v.id("notificationTemplates"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    subject: v.optional(v.string()),
    content: v.optional(v.string()),
    variables: v.optional(v.array(v.string())),
    isActive: v.optional(v.boolean()),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    
    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined)
    );
    
    await ctx.db.patch(id, cleanUpdates);
    return { success: true };
  },
});

// Удаление шаблона
export const remove = mutation({
  args: { id: v.id("notificationTemplates") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return { success: true };
  },
});

// Получение шаблона по ID
export const getById = query({
  args: { id: v.id("notificationTemplates") },
  handler: async (ctx, args) => {
    const template = await ctx.db.get(args.id);
    return template;
  },
});

// Клонирование шаблона
export const clone = mutation({
  args: {
    id: v.id("notificationTemplates"),
    newName: v.string(),
    createdBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    const originalTemplate = await ctx.db.get(args.id);
    if (!originalTemplate) {
      throw new Error("Шаблон не найден");
    }
    
    const clonedTemplateId = await ctx.db.insert("notificationTemplates", {
      name: args.newName,
      description: `Копия: ${originalTemplate.description || ""}`,
      type: originalTemplate.type,
      subject: originalTemplate.subject,
      content: originalTemplate.content,
      variables: originalTemplate.variables,
      isActive: false, // Клон создается неактивным
      createdBy: args.createdBy,
      category: originalTemplate.category,
      priority: originalTemplate.priority,
      settings: originalTemplate.settings,
    });
    
    return clonedTemplateId;
  },
});
