// convex/admin.ts (расширенная версия)
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const createAdmin = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    password: v.string(),
    photoUrl: v.optional(v.string()),
    faceDescriptor: v.optional(v.array(v.number())),
    createdBy: v.optional(v.id("users")),
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

    // Валидация email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(args.email)) {
      throw new Error("Некорректный формат email");
    }

    // Валидация пароля (если не захеширован)
    if (args.password.length < 6 && !args.password.startsWith('$2')) {
      throw new Error("Пароль должен содержать минимум 6 символов");
    }

    const userId = await ctx.db.insert("users", {
      email: args.email,
      password: args.password,
      name: args.name,
      role: "admin",
      isActive: true,
      createdAt: Date.now(),
      createdBy: args.createdBy,
      photoUrl: args.photoUrl,
      faceDescriptor: args.faceDescriptor || [],
    });
    
    return userId;
  },
});

// Дополнительная функция для создания супер-админа
export const createSuperAdmin = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    // Проверяем, что супер-админ еще не существует
    const existingSuperAdmin = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("role"), "super-admin"))
      .first();

    if (existingSuperAdmin) {
      throw new Error("Супер-администратор уже существует");
    }

    const userId = await ctx.db.insert("users", {
      email: args.email,
      password: args.password,
      name: args.name,
      role: "super-admin",
      isActive: true,
      createdAt: Date.now(),
    });
    
    return userId;
  },
});
