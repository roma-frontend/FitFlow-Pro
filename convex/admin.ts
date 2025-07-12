// convex/admin.ts (расширенная версия с удалением)
import { mutation, query } from "./_generated/server";
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

// Получить информацию о супер-админе
export const getSuperAdmin = query({
  handler: async (ctx) => {
    console.log("🔄 Convex Query: Получение супер-админа");

    const superAdmin = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("role"), "super-admin"))
      .first();

    if (!superAdmin) {
      console.log("❌ Convex Query: Супер-админ не найден");
      return null;
    }

    console.log("✅ Convex Query: Супер-админ найден:", superAdmin.email);
    return superAdmin;
  },
});

// Получить всех супер-админов (на случай если их несколько)
export const getAllSuperAdmins = query({
  handler: async (ctx) => {
    console.log("🔄 Convex Query: Получение всех супер-админов");

    const superAdmins = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("role"), "super-admin"))
      .collect();

    console.log("✅ Convex Query: Найдено супер-админов:", superAdmins.length);
    return superAdmins;
  },
});

// Мягкое удаление супер-админа (деактивация)
export const deactivateSuperAdmin = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    console.log("🔄 Convex Mutation: Деактивация супер-админа:", args.userId);

    // Проверяем, что пользователь существует и является супер-админом
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("Пользователь не найден");
    }

    if (user.role !== "super-admin") {
      throw new Error("Пользователь не является супер-администратором");
    }

    // Проверяем, что остается хотя бы один активный супер-админ
    const activeSuperAdmins = await ctx.db
      .query("users")
      .filter((q) => q.and(
        q.eq(q.field("role"), "super-admin"),
        q.eq(q.field("isActive"), true)
      ))
      .collect();

    if (activeSuperAdmins.length <= 1) {
      throw new Error("Нельзя деактивировать последнего супер-администратора");
    }

    // Деактивируем супер-админа
    await ctx.db.patch(args.userId, {
      isActive: false,
      updatedAt: Date.now(),
    });

    console.log("✅ Convex Mutation: Супер-админ деактивирован");
    return { success: true };
  },
});

// Физическое удаление супер-админа (ОПАСНО!)
export const deleteSuperAdmin = mutation({
  args: {
    userId: v.id("users"),
    confirmationCode: v.string(), // Код подтверждения для безопасности
  },
  handler: async (ctx, args) => {
    console.log("🔄 Convex Mutation: Физическое удаление супер-админа:", args.userId);

    // Проверяем код подтверждения
    if (args.confirmationCode !== "DELETE_SUPER_ADMIN_CONFIRMED") {
      throw new Error("Неверный код подтверждения");
    }

    // Проверяем, что пользователь существует и является супер-админом
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("Пользователь не найден");
    }

    if (user.role !== "super-admin") {
      throw new Error("Пользователь не является супер-администратором");
    }

    // Проверяем, что остается хотя бы один супер-админ
    const allSuperAdmins = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("role"), "super-admin"))
      .collect();

    if (allSuperAdmins.length <= 1) {
      throw new Error("Нельзя удалить последнего супер-администратора");
    }

    // Физически удаляем супер-админа
    await ctx.db.delete(args.userId);

    console.log("✅ Convex Mutation: Супер-админ физически удален");
    return { success: true };
  },
});

// Удаление супер-админа по email
export const deleteSuperAdminByEmail = mutation({
  args: {
    email: v.string(),
    confirmationCode: v.string(),
  },
  handler: async (ctx, args) => {
    console.log("🔄 Convex Mutation: Удаление супер-админа по email:", args.email);

    // Проверяем код подтверждения
    if (args.confirmationCode !== "DELETE_SUPER_ADMIN_CONFIRMED") {
      throw new Error("Неверный код подтверждения");
    }

    // Находим супер-админа по email
    const superAdmin = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!superAdmin) {
      throw new Error("Супер-админ с таким email не найден");
    }

    if (superAdmin.role !== "super-admin") {
      throw new Error("Пользователь не является супер-администратором");
    }

    // Проверяем, что остается хотя бы один супер-админ
    const allSuperAdmins = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("role"), "super-admin"))
      .collect();

    if (allSuperAdmins.length <= 1) {
      throw new Error("Нельзя удалить последнего супер-администратора");
    }

    // Физически удаляем супер-админа
    await ctx.db.delete(superAdmin._id);

    console.log("✅ Convex Mutation: Супер-админ удален по email");
    return { success: true };
  },
});

// Восстановление супер-админа
export const restoreSuperAdmin = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    console.log("🔄 Convex Mutation: Восстановление супер-админа:", args.userId);

    // Проверяем, что пользователь существует
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("Пользователь не найден");
    }

    if (user.role !== "super-admin") {
      throw new Error("Пользователь не является супер-администратором");
    }

    // Восстанавливаем супер-админа
    await ctx.db.patch(args.userId, {
      isActive: true,
      updatedAt: Date.now(),
    });

    console.log("✅ Convex Mutation: Супер-админ восстановлен");
    return { success: true };
  },
});

// Смена роли супер-админа на обычного админа
export const demoteSuperAdmin = mutation({
  args: {
    userId: v.id("users"),
    confirmationCode: v.string(),
  },
  handler: async (ctx, args) => {
    console.log("🔄 Convex Mutation: Понижение супер-админа:", args.userId);

    // Проверяем код подтверждения
    if (args.confirmationCode !== "DEMOTE_SUPER_ADMIN_CONFIRMED") {
      throw new Error("Неверный код подтверждения");
    }

    // Проверяем, что пользователь существует
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("Пользователь не найден");
    }

    if (user.role !== "super-admin") {
      throw new Error("Пользователь не является супер-администратором");
    }

    // Проверяем, что остается хотя бы один супер-админ
    const allSuperAdmins = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("role"), "super-admin"))
      .collect();

    if (allSuperAdmins.length <= 1) {
      throw new Error("Нельзя понизить последнего супер-администратора");
    }

    // Понижаем до обычного админа
    await ctx.db.patch(args.userId, {
      role: "admin",
      updatedAt: Date.now(),
    });

    console.log("✅ Convex Mutation: Супер-админ понижен до обычного админа");
    return { success: true };
  },
});