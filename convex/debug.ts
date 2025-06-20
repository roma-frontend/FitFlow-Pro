// convex/test.ts (улучшенная версия)
import { mutation, query } from "./_generated/server";
import bcrypt from 'bcryptjs'; // Если хотите хешировать пароль

export const ping = query({
  handler: async (ctx) => {
    return "pong";
  },
});

export const createTestAdmin = mutation({
  handler: async (ctx) => {
    // Проверяем, что тестовый админ еще не существует
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", "test@example.com"))
      .first();

    if (existingUser) {
      throw new Error("Тестовый админ уже существует");
    }

    const userId = await ctx.db.insert("users", {
      email: "test@example.com",
      password: "test123", // В реальном проекте нужно хешировать
      name: "Test Admin",
      role: "admin",
      isActive: true,
      createdAt: Date.now(),
      photoUrl: "https://example.com/photo.jpg",
      faceDescriptor: [0, 0, 0],
    });
    
    return userId;
  },
});

// Дополнительная функция для создания тестового супер-админа
export const createTestSuperAdmin = mutation({
  handler: async (ctx) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", "super@example.com"))
      .first();

    if (existingUser) {
      throw new Error("Тестовый супер-админ уже существует");
    }

    const userId = await ctx.db.insert("users", {
      email: "super@example.com",
      password: "super123",
      name: "Test Super Admin",
      role: "super-admin",
      isActive: true,
      createdAt: Date.now(),
    });
    
    return userId;
  },
});

// Функция для очистки тестовых данных
export const clearTestUsers = mutation({
  handler: async (ctx) => {
    const testEmails = ["test@example.com", "super@example.com"];
    
    for (const email of testEmails) {
      const user = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", email))
        .first();
      
      if (user) {
        await ctx.db.delete(user._id);
      }
    }
    
    return { message: "Тестовые пользователи удалены" };
  },
});
