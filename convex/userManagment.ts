// convex/userManagement.ts (исправленная версия)
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getAll = query({
  handler: async (ctx) => {
    return await ctx.db.query("users").collect();
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    email: v.string(), // Убираем optional, делаем обязательным
    password: v.string(), // Добавляем обязательное поле
    role: v.optional(v.string()), // Добавляем роль
    photoUrl: v.optional(v.string()), // Делаем optional
    faceDescriptor: v.optional(v.array(v.number())), // Делаем optional
  },
  handler: async (ctx, args) => {
    const userId = await ctx.db.insert("users", {
      email: args.email,
      password: args.password,
      name: args.name,
      role: args.role || "member", // По умолчанию "member"
      isActive: true, // Добавляем обязательное поле
      createdAt: Date.now(),
      photoUrl: args.photoUrl,
      faceDescriptor: args.faceDescriptor || [],
    });
    return userId;
  },
});

export const getAllFaceDescriptors = query({
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    return users
      .filter(user => user.faceDescriptor && user.faceDescriptor.length > 0)
      .map(user => ({
        id: user._id,
        name: user.name,
        faceDescriptor: user.faceDescriptor
      }));
  },
});

// Исправляем функцию удаления пользователя
export const deleteUser = mutation({
  args: { id: v.id("users") }, // Используем правильный тип ID
  handler: async (ctx, args) => {
    try {
      const user = await ctx.db.get(args.id);
      
      if (!user) {
        throw new Error("Пользователь не найден");
      }
      
      await ctx.db.delete(args.id);
      
      return { success: true, deletedUser: user };
    } catch (error) {
      console.error("Ошибка удаления пользователя:", error);
      throw error;
    }
  },
});

// Исправляем функцию создания администратора
export const createAdmin = mutation({
  args: {
    name: v.string(),
    email: v.string(), // Убираем optional
    password: v.string(), // Добавляем пароль
    photoUrl: v.optional(v.string()), // Делаем optional
    faceDescriptor: v.optional(v.array(v.number())), // Делаем optional
  },
  handler: async (ctx, args) => {
    // Проверяем, что пользователь с таким email не существует
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existingUser) {
      throw new Error("Пользователь с таким email уже существует");
    }

    const userId = await ctx.db.insert("users", {
      email: args.email,
      password: args.password,
      name: args.name,
      role: "admin",
      isActive: true,
      createdAt: Date.now(),
      photoUrl: args.photoUrl,
      faceDescriptor: args.faceDescriptor || [],
    });
    return userId;
  },
});

// Дополнительные функции для управления пользователями
export const updateUser = mutation({
  args: {
    id: v.id("users"),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    role: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
    photoUrl: v.optional(v.string()),
    faceDescriptor: v.optional(v.array(v.number())),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    
    // Удаляем undefined значения
    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined)
    );
    
    if (Object.keys(cleanUpdates).length === 0) {
      throw new Error("Нет данных для обновления");
    }
    
    await ctx.db.patch(id, cleanUpdates);
    return id;
  },
});

export const getUserById = query({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
  },
});

export const getUsersByRole = query({
  args: { role: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("role", args.role))
      .collect();
  },
});

export const getActiveUsers = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
  },
});
