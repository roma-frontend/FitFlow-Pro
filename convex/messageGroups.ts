// convex/messageGroups.ts (полная версия)
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Получение списка групп
export const list = query({
  args: {
    includeInactive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let groupsQuery = ctx.db.query("messageGroups");
    
    if (!args.includeInactive) {
      groupsQuery = groupsQuery.filter((q) => q.eq(q.field("isActive"), true));
    }
    
    const groups = await groupsQuery
      .order("desc")
      .collect();
    
    return groups;
  },
});

// Создание группы
export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    memberIds: v.array(v.id("users")),
    memberNames: v.array(v.string()),
    createdBy: v.id("users"),
    groupType: v.union(
      v.literal("manual"),
      v.literal("auto"),
      v.literal("role-based")
    ),
    rules: v.optional(v.object({
      roles: v.optional(v.array(v.string())),
      departments: v.optional(v.array(v.string())),
      conditions: v.optional(v.array(v.string())),
    })),
  },
  handler: async (ctx, args) => {
    const groupId = await ctx.db.insert("messageGroups", {
      name: args.name,
      description: args.description,
      memberIds: args.memberIds,
      memberNames: args.memberNames,
      createdBy: args.createdBy,
      isActive: true,
      groupType: args.groupType,
      rules: args.rules,
    });
    
    return groupId;
  },
});

// Обновление группы
export const update = mutation({
  args: {
    id: v.id("messageGroups"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    memberIds: v.optional(v.array(v.id("users"))),
    memberNames: v.optional(v.array(v.string())),
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

// Удаление группы (деактивация)
export const remove = mutation({
  args: { id: v.id("messageGroups") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      isActive: false,
    });
    
    return { success: true };
  },
});

// Получение участников группы
export const getMembers = query({
  args: { groupId: v.id("messageGroups") },
  handler: async (ctx, args) => {
    const group = await ctx.db.get(args.groupId);
    if (!group) {
      throw new Error("Группа не найдена");
    }
    
    return {
      memberIds: group.memberIds,
      memberNames: group.memberNames,
    };
  },
});

// Добавление участника в группу
export const addMember = mutation({
  args: {
    groupId: v.id("messageGroups"),
    userId: v.id("users"),
    userName: v.string(),
  },
  handler: async (ctx, args) => {
    const group = await ctx.db.get(args.groupId);
    if (!group) {
      throw new Error("Группа не найдена");
    }
    
    if (group.memberIds.includes(args.userId)) {
      throw new Error("Пользователь уже является участником группы");
    }
    
    await ctx.db.patch(args.groupId, {
      memberIds: [...group.memberIds, args.userId],
      memberNames: [...group.memberNames, args.userName],
    });
    
    return { success: true };
  },
});

// Удаление участника из группы
export const removeMember = mutation({
  args: {
    groupId: v.id("messageGroups"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const group = await ctx.db.get(args.groupId);
    if (!group) {
      throw new Error("Группа не найдена");
    }
    
    const memberIndex = group.memberIds.indexOf(args.userId);
    if (memberIndex === -1) {
      throw new Error("Пользователь не является участником группы");
    }
    
    const newMemberIds = group.memberIds.filter(id => id !== args.userId);
    const newMemberNames = group.memberNames.filter((_, index) => index !== memberIndex);
    
    await ctx.db.patch(args.groupId, {
      memberIds: newMemberIds,
      memberNames: newMemberNames,
    });
    
    return { success: true };
  },
});
