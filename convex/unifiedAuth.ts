// convex/unifiedAuth.ts
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// 🔐 АУТЕНТИФИКАЦИЯ ПОЛЬЗОВАТЕЛЕЙ
export const authenticateUser = mutation({
  args: {
    email: v.string(),
    password: v.string(),
    userType: v.union(v.literal("staff"), v.literal("member")),
    deviceInfo: v.optional(v.string()),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    let user: any = null;

    // Поиск пользователя в соответствующей таблице
    if (args.userType === "staff") {
      user = await ctx.db
        .query("staff")
        .filter((q) => q.eq(q.field("email"), args.email))
        .first();
    } else {
      user = await ctx.db
        .query("members")
        .filter((q) => q.eq(q.field("email"), args.email))
        .first();
    }

    // Логирование попытки входа в accessLogs
    const logEntry = {
      userId: user?._id ? (user._id as string as Id<"users">) : undefined,
      success: false,
      timestamp: now,
      deviceInfo: args.deviceInfo,
      ipAddress: args.ipAddress,
    };

    if (!user) {
      await ctx.db.insert("accessLogs", logEntry);
      return { success: false, error: "Неверные учетные данные" };
    }

    if (!user.isActive) {
      await ctx.db.insert("accessLogs", logEntry);
      return { success: false, error: "Аккаунт деактивирован" };
    }

    // Проверка пароля
    if (user.password !== args.password) {
      await ctx.db.insert("accessLogs", logEntry);
      return { success: false, error: "Неверные учетные данные" };
    }

    // Успешная аутентификация
    logEntry.success = true;
    logEntry.userId = user._id as string as Id<"users">;
    await ctx.db.insert("accessLogs", logEntry);

    // Обновляем время последнего входа
    await ctx.db.patch(user._id, {
      lastLoginAt: now,
      updatedAt: now,
    });

    return {
      success: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role || args.userType,
        userType: args.userType,
      },
    };
  },
});

// 🔐 СОЗДАНИЕ СЕССИИ
export const createSession = mutation({
  args: {
    userId: v.string(),
    userType: v.union(v.literal("staff"), v.literal("member")),
    deviceInfo: v.optional(v.string()),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const sessionToken = generateSessionToken();

    const sessionId = await ctx.db.insert("sessions", {
      userId: args.userId as Id<"users">,
      duration: 7 * 24 * 60 * 60 * 1000, // 7 дней в миллисекундах
      pageViews: 0,
      pages: [],
      userAgent: args.userAgent,
      ipAddress: args.ipAddress,
    });

    return {
      success: true,
      sessionToken,
      sessionId,
    };
  },
});

// 🔄 СБРОС ПАРОЛЯ - ЗАПРОС
export const requestPasswordReset = mutation({
  args: {
    email: v.string(),
    userType: v.union(v.literal("staff"), v.literal("member")),
    ipAddress: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    let user: any = null;

    // Поиск пользователя
    if (args.userType === "staff") {
      user = await ctx.db
        .query("staff")
        .filter((q) => q.eq(q.field("email"), args.email))
        .first();
    } else {
      user = await ctx.db
        .query("members")
        .filter((q) => q.eq(q.field("email"), args.email))
        .first();
    }

    if (!user) {
      return { success: true, message: "Если email существует, инструкции отправлены" };
    }

    // Создаем токен сброса
    const resetToken = generateResetToken();
    const expiresAt = now + (60 * 60 * 1000); // 1 час

    // Обновляем пользователя
    await ctx.db.patch(user._id, {
      resetPasswordToken: resetToken,
      resetPasswordExpires: expiresAt,
      resetPasswordRequestedAt: now,
      updatedAt: now,
    });

    // Логируем в passwordResetLogs
    await ctx.db.insert("passwordResetLogs", {
      userId: user._id as string,
      userType: args.userType,
      email: args.email,
      action: "requested",
      ipAddress: args.ipAddress,
      timestamp: now,
    });

    return {
      success: true,
      message: "Инструкции по сбросу пароля отправлены на email",
      token: resetToken, // В продакшене отправляйте по email
    };
  },
});

// 🔄 СБРОС ПАРОЛЯ - ПОДТВЕРЖДЕНИЕ
export const resetPassword = mutation({
  args: {
    token: v.string(),
    newPassword: v.string(),
    ipAddress: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Ищем пользователя с этим токеном в staff
    let user: any = await ctx.db
      .query("staff")
      .filter((q) => q.eq(q.field("resetPasswordToken"), args.token))
      .filter((q) => q.gt(q.field("resetPasswordExpires"), now))
      .first();

    let userType: "staff" | "member" = "staff";

    // Если не найден в staff, ищем в members
    if (!user) {
      user = await ctx.db
        .query("members")
        .filter((q) => q.eq(q.field("resetPasswordToken"), args.token))
        .filter((q) => q.gt(q.field("resetPasswordExpires"), now))
        .first();
      userType = "member";
    }

    if (!user) {
      return { success: false, error: "Недействительный или истекший токен" };
    }

    // Обновляем пароль
    await ctx.db.patch(user._id, {
      password: args.newPassword,
      passwordChangedAt: now,
      resetPasswordToken: undefined,
      resetPasswordExpires: undefined,
      updatedAt: now,
    });

    // Логируем успешный сброс
    await ctx.db.insert("passwordResetLogs", {
      userId: user._id as string,
      userType: userType,
      email: user.email,
      action: "completed",
      ipAddress: args.ipAddress,
      timestamp: now,
    });

    return { success: true, message: "Пароль успешно изменен" };
  },
});

// 🔍 ПОИСК ПОЛЬЗОВАТЕЛЯ
export const findUser = query({
  args: {
    email: v.string(),
    userType: v.optional(v.union(v.literal("staff"), v.literal("member"))),
  },
  handler: async (ctx, args) => {
    let users = [];

    if (!args.userType || args.userType === "staff") {
      const staff = await ctx.db
        .query("staff")
        .filter((q) => q.eq(q.field("email"), args.email))
        .first();
      
      if (staff) {
        users.push({
          id: staff._id,
          email: staff.email,
          name: staff.name,
          role: staff.role,
          userType: "staff" as const,
          isActive: staff.isActive,
          lastLoginAt: staff.lastLoginAt,
        });
      }
    }

    if (!args.userType || args.userType === "member") {
      const member = await ctx.db
        .query("members")
        .filter((q) => q.eq(q.field("email"), args.email))
        .first();
      
      if (member) {
        users.push({
          id: member._id,
          email: member.email,
          name: member.name,
          role: "member" as const,
          userType: "member" as const,
          isActive: member.isActive,
          lastLoginAt: member.lastLoginAt,
        });
      }
    }

    return users;
  },
});

// 🔄 ИЗМЕНЕНИЕ ПАРОЛЯ
export const changePassword = mutation({
  args: {
    userId: v.string(),
    userType: v.union(v.literal("staff"), v.literal("member")),
    currentPassword: v.string(),
    newPassword: v.string(),
    ipAddress: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    let user: any = null;

    // Находим пользователя
    if (args.userType === "staff") {
      user = await ctx.db.get(args.userId as Id<"staff">);
    } else {
      user = await ctx.db.get(args.userId as Id<"members">);
    }

    if (!user) {
      return { success: false, error: "Пользователь не найден" };
    }

    // Проверяем текущий пароль
    if (user.password !== args.currentPassword) {
      return { success: false, error: "Неверный текущий пароль" };
    }

    // Обновляем пароль
    await ctx.db.patch(user._id, {
      password: args.newPassword,
      passwordChangedAt: now,
      updatedAt: now,
    });

    return { success: true, message: "Пароль успешно изменен" };
  },
});

// 📊 ПОЛУЧЕНИЕ ЛОГОВ ДОСТУПА
export const getAccessLogs = query({
  args: {
    userId: v.optional(v.string()), // Изменено на string
    success: v.optional(v.boolean()),
    limit: v.optional(v.number()),
    hoursBack: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("accessLogs");

    if (args.userId) {
      query = query.filter((q) => q.eq(q.field("userId"), args.userId as Id<"users">));
    }

    if (args.success !== undefined) {
      query = query.filter((q) => q.eq(q.field("success"), args.success));
    }

    if (args.hoursBack) {
      const fromDate = Date.now() - (args.hoursBack * 60 * 60 * 1000);
      query = query.filter((q) => q.gte(q.field("timestamp"), fromDate));
    }

    const logs = await query
      .order("desc")
      .take(args.limit || 100);

    return logs;
  },
});

// 📊 ПОЛУЧЕНИЕ ЛОГОВ СБРОСА ПАРОЛЕЙ
export const getPasswordResetLogs = query({
  args: {
    userId: v.optional(v.string()),
    userType: v.optional(v.union(v.literal("staff"), v.literal("member"))),
    action: v.optional(v.union(v.literal("requested"), v.literal("completed"), v.literal("failed"), v.literal("expired"))),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("passwordResetLogs");

    if (args.userId) {
      query = query.filter((q) => q.eq(q.field("userId"), args.userId));
    }

    if (args.userType) {
      query = query.filter((q) => q.eq(q.field("userType"), args.userType));
    }

    if (args.action) {
      query = query.filter((q) => q.eq(q.field("action"), args.action));
    }

    const logs = await query
      .order("desc")
      .take(args.limit || 50);

    return logs;
  },
});

// 📊 ПРОСТАЯ СТАТИСТИКА
export const getSimpleStats = query({
  args: {
    hours: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const hoursBack = args.hours || 24;
    const fromDate = Date.now() - (hoursBack * 60 * 60 * 1000);

    // Получаем логи доступа за период
    const accessLogs = await ctx.db
      .query("accessLogs")
      .filter((q) => q.gte(q.field("timestamp"), fromDate))
      .collect();

    const successful = accessLogs.filter(log => log.success);
    const failed = accessLogs.filter(log => !log.success);

    // Получаем логи сброса паролей
    const resetLogs = await ctx.db
      .query("passwordResetLogs")
      .filter((q) => q.gte(q.field("timestamp"), fromDate))
      .collect();

    // Активные пользователи (staff)
    const activeStaff = await ctx.db
      .query("staff")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    // Активные пользователи (members)
    const activeMembers = await ctx.db
      .query("members")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    return {
      period: `${hoursBack} часов`,
      totalAttempts: accessLogs.length,
      successfulLogins: successful.length,
      failedLogins: failed.length,
      passwordResets: resetLogs.length,
      activeStaff: activeStaff.length,
      activeMembers: activeMembers.length,
      successRate: accessLogs.length > 0 
        ? Math.round((successful.length / accessLogs.length) * 100) 
        : 0,
    };
  },
});

// 🔧 ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
function generateSessionToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

function generateResetToken(): string {
  return Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
}

// 📝 СОЗДАНИЕ УВЕДОМЛЕНИЯ
export const createNotification = mutation({
    args: {
      title: v.string(),
      message: v.string(),
      type: v.union(
        v.literal("info"),
        v.literal("warning"),
        v.literal("error"),
        v.literal("success"),
        v.literal("system")
      ),
      recipientId: v.string(),
      recipientType: v.union(
        v.literal("user"),
        v.literal("super-admin"),
        v.literal("admin"),
        v.literal("manager"),
        v.literal("trainer"),
        v.literal("member")
      ),
      priority: v.optional(v.union(
        v.literal("low"),
        v.literal("normal"),
        v.literal("high"),
        v.literal("urgent")
      )),
      relatedId: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
      const notificationId = await ctx.db.insert("notifications", {
        title: args.title,
        message: args.message,
        type: args.type,
        recipientId: args.recipientId,
        recipientType: args.recipientType,
        priority: args.priority || "normal",
        relatedId: args.relatedId,
        isRead: false,
        createdAt: Date.now(),
      });
  
      return { success: true, notificationId };
    },
  });
  
  // 📬 ПОЛУЧЕНИЕ УВЕДОМЛЕНИЙ ПОЛЬЗОВАТЕЛЯ
  export const getUserNotifications = query({
    args: {
      recipientId: v.string(),
      isRead: v.optional(v.boolean()),
      type: v.optional(v.union(
        v.literal("info"),
        v.literal("warning"),
        v.literal("error"),
        v.literal("success"),
        v.literal("system")
      )),
      limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
      let query = ctx.db
        .query("notifications")
        .filter((q) => q.eq(q.field("recipientId"), args.recipientId));
  
      if (args.isRead !== undefined) {
        query = query.filter((q) => q.eq(q.field("isRead"), args.isRead));
      }
  
      if (args.type) {
        query = query.filter((q) => q.eq(q.field("type"), args.type));
      }
  
      const notifications = await query
        .order("desc")
        .take(args.limit || 50);
  
      return notifications;
    },
  });
  
  // ✅ ОТМЕТКА УВЕДОМЛЕНИЯ КАК ПРОЧИТАННОГО
  export const markNotificationAsRead = mutation({
    args: {
      notificationId: v.id("notifications"),
    },
    handler: async (ctx, args) => {
      await ctx.db.patch(args.notificationId, {
        isRead: true,
        readAt: Date.now(),
      });
  
      return { success: true };
    },
  });
  
  // ✅ ОТМЕТКА ВСЕХ УВЕДОМЛЕНИЙ КАК ПРОЧИТАННЫХ
  export const markAllNotificationsAsRead = mutation({
    args: {
      recipientId: v.string(),
    },
    handler: async (ctx, args) => {
      const unreadNotifications = await ctx.db
        .query("notifications")
        .filter((q) => q.eq(q.field("recipientId"), args.recipientId))
        .filter((q) => q.eq(q.field("isRead"), false))
        .collect();
  
      const now = Date.now();
      for (const notification of unreadNotifications) {
        await ctx.db.patch(notification._id, {
          isRead: true,
          readAt: now,
        });
      }
  
      return { 
        success: true, 
        markedCount: unreadNotifications.length 
      };
    },
  });
  
  // 🗑️ УДАЛЕНИЕ УВЕДОМЛЕНИЯ
  export const deleteNotification = mutation({
    args: {
      notificationId: v.id("notifications"),
    },
    handler: async (ctx, args) => {
      await ctx.db.delete(args.notificationId);
      return { success: true };
    },
  });
  
  // 📊 ПОЛУЧЕНИЕ СТАТИСТИКИ УВЕДОМЛЕНИЙ
  export const getNotificationStats = query({
    args: {
      recipientId: v.string(),
    },
    handler: async (ctx, args) => {
      const allNotifications = await ctx.db
        .query("notifications")
        .filter((q) => q.eq(q.field("recipientId"), args.recipientId))
        .collect();
  
      const unread = allNotifications.filter(n => !n.isRead);
      const byType = {
        info: allNotifications.filter(n => n.type === "info").length,
        warning: allNotifications.filter(n => n.type === "warning").length,
        error: allNotifications.filter(n => n.type === "error").length,
        success: allNotifications.filter(n => n.type === "success").length,
        system: allNotifications.filter(n => n.type === "system").length,
      };
  
      const byPriority = {
        low: allNotifications.filter(n => n.priority === "low").length,
        normal: allNotifications.filter(n => n.priority === "normal").length,
        high: allNotifications.filter(n => n.priority === "high").length,
        urgent: allNotifications.filter(n => n.priority === "urgent").length,
      };
  
      return {
        total: allNotifications.length,
        unread: unread.length,
        read: allNotifications.length - unread.length,
        byType,
        byPriority,
      };
    },
  });
  
  // 🔍 ПРОВЕРКА ВАЛИДНОСТИ ТОКЕНА СБРОСА
  export const validateResetToken = query({
    args: {
      token: v.string(),
    },
    handler: async (ctx, args) => {
      const now = Date.now();
  
      // Ищем в staff
      const staffUser = await ctx.db
        .query("staff")
        .filter((q) => q.eq(q.field("resetPasswordToken"), args.token))
        .filter((q) => q.gt(q.field("resetPasswordExpires"), now))
        .first();
  
      if (staffUser) {
        return {
          valid: true,
          userType: "staff" as const,
          email: staffUser.email,
          expiresAt: staffUser.resetPasswordExpires,
        };
      }
  
      // Ищем в members
      const memberUser = await ctx.db
        .query("members")
        .filter((q) => q.eq(q.field("resetPasswordToken"), args.token))
        .filter((q) => q.gt(q.field("resetPasswordExpires"), now))
        .first();
  
      if (memberUser) {
        return {
          valid: true,
          userType: "member" as const,
          email: memberUser.email,
          expiresAt: memberUser.resetPasswordExpires,
        };
      }
  
      return { valid: false, error: "Недействительный или истекший токен" };
    },
  });
  
  // 🧹 ОЧИСТКА СТАРЫХ ДАННЫХ
  export const cleanupOldData = mutation({
    args: {
      logsOlderThanDays: v.optional(v.number()),
      notificationsOlderThanDays: v.optional(v.number()),
      resetLogsOlderThanDays: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
      const now = Date.now();
      const results = {
        accessLogs: 0,
        notifications: 0,
        resetLogs: 0,
      };
  
      // Очистка логов доступа
      if (args.logsOlderThanDays) {
        const logsCutoff = now - (args.logsOlderThanDays * 24 * 60 * 60 * 1000);
        const oldLogs = await ctx.db
          .query("accessLogs")
          .filter((q) => q.lt(q.field("timestamp"), logsCutoff))
          .collect();
  
        for (const log of oldLogs) {
          await ctx.db.delete(log._id);
          results.accessLogs++;
        }
      }
  
      // Очистка старых уведомлений
      if (args.notificationsOlderThanDays) {
        const notificationsCutoff = now - (args.notificationsOlderThanDays * 24 * 60 * 60 * 1000);
        const oldNotifications = await ctx.db
          .query("notifications")
          .filter((q) => q.eq(q.field("isRead"), true))
          .filter((q) => q.lt(q.field("createdAt"), notificationsCutoff))
          .collect();
  
        for (const notification of oldNotifications) {
          await ctx.db.delete(notification._id);
          results.notifications++;
        }
      }
  
      // Очистка логов сброса паролей
      if (args.resetLogsOlderThanDays) {
        const resetLogsCutoff = now - (args.resetLogsOlderThanDays * 24 * 60 * 60 * 1000);
        const oldResetLogs = await ctx.db
          .query("passwordResetLogs")
          .filter((q) => q.lt(q.field("timestamp"), resetLogsCutoff))
          .collect();
  
        for (const resetLog of oldResetLogs) {
          await ctx.db.delete(resetLog._id);
          results.resetLogs++;
        }
      }
  
      return { success: true, results };
    },
  });
  
  // 📈 ПОЛУЧЕНИЕ АКТИВНОСТИ ПОЛЬЗОВАТЕЛЕЙ
  export const getUserActivity = query({
    args: {
      userType: v.optional(v.union(v.literal("staff"), v.literal("member"))),
      days: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
      const daysBack = args.days || 7;
      const fromDate = Date.now() - (daysBack * 24 * 60 * 60 * 1000);
  
      // Получаем логи доступа
      const logs = await ctx.db
        .query("accessLogs")
        .filter((q) => q.gte(q.field("timestamp"), fromDate))
        .filter((q) => q.eq(q.field("success"), true))
        .collect();
  
      // Группируем по дням
      const dailyActivity: Record<string, number> = {};
  
      for (let i = 0; i < daysBack; i++) {
        const date = new Date(Date.now() - (i * 24 * 60 * 60 * 1000));
        const dateKey = date.toISOString().split('T')[0];
        dailyActivity[dateKey] = 0;
      }
  
      // Подсчитываем активность
      logs.forEach(log => {
        const date = new Date(log.timestamp).toISOString().split('T')[0];
        if (dailyActivity[date] !== undefined) {
          dailyActivity[date]++;
        }
      });
  
      return {
        period: `${daysBack} дней`,
        dailyActivity,
        totalLogins: logs.length,
      };
    },
  });
  
  // 🔒 ДЕАКТИВАЦИЯ ПОЛЬЗОВАТЕЛЯ
  export const deactivateUser = mutation({
    args: {
      userId: v.string(),
      userType: v.union(v.literal("staff"), v.literal("member")),
      reason: v.optional(v.string()),
      deactivatedBy: v.string(),
    },
    handler: async (ctx, args) => {
      const now = Date.now();
  
      // Деактивируем пользователя
      if (args.userType === "staff") {
        await ctx.db.patch(args.userId as Id<"staff">, {
          isActive: false,
          updatedAt: now,
        });
      } else {
        await ctx.db.patch(args.userId as Id<"members">, {
          isActive: false,
          updatedAt: now,
        });
      }
  
      // Создаем уведомление
      await ctx.db.insert("notifications", {
        title: "Аккаунт деактивирован",
        message: `Ваш аккаунт был деактивирован. Причина: ${args.reason || "Не указана"}`,
        type: "warning",
        recipientId: args.userId,
        recipientType: args.userType === "staff" ? "admin" : "member",
        priority: "high",
        isRead: false,
        createdAt: now,
      });
  
      return { success: true };
    },
  });
  
  // 🔓 АКТИВАЦИЯ ПОЛЬЗОВАТЕЛЯ
  export const activateUser = mutation({
    args: {
      userId: v.string(),
      userType: v.union(v.literal("staff"), v.literal("member")),
      activatedBy: v.string(),
    },
    handler: async (ctx, args) => {
      const now = Date.now();
  
      // Активируем пользователя
      if (args.userType === "staff") {
        await ctx.db.patch(args.userId as Id<"staff">, {
          isActive: true,
          updatedAt: now,
        });
      } else {
        await ctx.db.patch(args.userId as Id<"members">, {
          isActive: true,
          updatedAt: now,
        });
      }
  
      // Создаем уведомление
      await ctx.db.insert("notifications", {
        title: "Аккаунт активирован",
        message: "Ваш аккаунт был активирован. Добро пожаловать обратно!",
        type: "success",
        recipientId: args.userId,
        recipientType: args.userType === "staff" ? "admin" : "member",
        priority: "normal",
        isRead: false,
        createdAt: now,
      });
  
      return { success: true };
    },
  });
  
  // 🔍 ПОЛУЧЕНИЕ ИНФОРМАЦИИ О ПОЛЬЗОВАТЕЛЕ
  export const getUserInfo = query({
    args: {
      userId: v.string(),
      userType: v.union(v.literal("staff"), v.literal("member")),
    },
    handler: async (ctx, args) => {
      let user: any = null;
  
      if (args.userType === "staff") {
        user = await ctx.db.get(args.userId as Id<"staff">);
      } else {
        user = await ctx.db.get(args.userId as Id<"members">);
      }
  
      if (!user) {
        return null;
      }
  
      // Получаем последние логи доступа
      const recentLogs = await ctx.db
        .query("accessLogs")
        .filter((q) => q.eq(q.field("userId"), args.userId as Id<"users">))
        .order("desc")
        .take(5);
  
      // Получаем непрочитанные уведомления
      const unreadNotifications = await ctx.db
        .query("notifications")
        .filter((q) => q.eq(q.field("recipientId"), args.userId))
        .filter((q) => q.eq(q.field("isRead"), false))
        .collect();
  
      return {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role || args.userType,
          userType: args.userType,
          isActive: user.isActive,
          lastLoginAt: user.lastLoginAt,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          passwordChangedAt: user.passwordChangedAt,
        },
        recentActivity: recentLogs,
        unreadNotifications: unreadNotifications.length,
      };
    },
  });
  
  // 📊 ПОЛУЧЕНИЕ ДАШБОРДА БЕЗОПАСНОСТИ
  export const getSecurityDashboard = query({
    args: {
      hours: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
      const hoursBack = args.hours || 24;
      const fromDate = Date.now() - (hoursBack * 60 * 60 * 1000);
  
      // Получаем логи доступа
      const accessLogs = await ctx.db
        .query("accessLogs")
        .filter((q) => q.gte(q.field("timestamp"), fromDate))
        .collect();
  
      // Получаем логи сброса паролей
      const resetLogs = await ctx.db
        .query("passwordResetLogs")
        .filter((q) => q.gte(q.field("timestamp"), fromDate))
        .collect();
  
      // Анализируем данные
      const successful = accessLogs.filter(log => log.success);
      const failed = accessLogs.filter(log => !log.success);
  
      // Группируем неудачные попытки по IP
      const failedByIp: Record<string, number> = {};
      failed.forEach(log => {
        if (log.ipAddress) {
          failedByIp[log.ipAddress] = (failedByIp[log.ipAddress] || 0) + 1;
        }
      });
  
      // Топ IP с неудачными попытками
      const suspiciousIps = Object.entries(failedByIp)
        .filter(([_, count]) => count >= 3) // 3+ неудачных попыток
        .map(([ip, count]) => ({ ip, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
  
      // Активность по часам
      const hourlyActivity: Record<number, { successful: number; failed: number }> = {};
      for (let i = 0; i < 24; i++) {
        hourlyActivity[i] = { successful: 0, failed: 0 };
      }
  
      accessLogs.forEach(log => {
        const hour = new Date(log.timestamp).getHours();
        if (log.success) {
          hourlyActivity[hour].successful++;
        } else {
          hourlyActivity[hour].failed++;
        }
      });
  
      return {
        period: `${hoursBack} часов`,
        overview: {
          totalAttempts: accessLogs.length,
          successfulLogins: successful.length,
          failedAttempts: failed.length,
          passwordResets: resetLogs.length,
          suspiciousIps: suspiciousIps.length,
          successRate: accessLogs.length > 0 
            ? Math.round((successful.length / accessLogs.length) * 100) 
            : 0,
        },
        trends: {
          hourlyActivity,
          suspiciousIps,
        },
        alerts: suspiciousIps.length > 0 ? [
          {
            type: "suspicious_activity",
            message: `Обнаружено ${suspiciousIps.length} подозрительных IP адресов`,
            severity: "medium",
            timestamp: Date.now(),
          }
        ] : [],
      };
    },
  });
  
  // 🔐 ПРОВЕРКА СЕССИИ
  export const validateSession = query({
    args: {
      sessionToken: v.string(),
    },
    handler: async (ctx, args) => {
      // Простая проверка - в реальности нужно хранить сессии в БД
      if (!args.sessionToken || args.sessionToken.length < 10) {
        return { valid: false, error: "Недействительная сессия" };
      }
  
      return { 
        valid: true, 
        message: "Сессия действительна",
        expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 дней
      };
    },
  });
  
  // 🚪 ВЫХОД ИЗ СИСТЕМЫ
  export const logout = mutation({
    args: {
      userId: v.string(),
      sessionToken: v.optional(v.string()),
      ipAddress: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
      const now = Date.now();
  
      // Логируем выход
      await ctx.db.insert("accessLogs", {
        userId: args.userId as Id<"users">,
        success: true,
        timestamp: now,
        ipAddress: args.ipAddress,
        deviceInfo: "logout",
      });
  
      return { success: true, message: "Успешный выход из системы" };
    },
  });
  
  // 📧 ОТПРАВКА УВЕДОМЛЕНИЯ ПО EMAIL (заглушка)
  export const sendEmailNotification = mutation({
    args: {
      to: v.string(),
      subject: v.string(),
      message: v.string(),
      type: v.union(
        v.literal("password_reset"),
        v.literal("account_locked"),
        v.literal("suspicious_activity"),
        v.literal("welcome")
      ),
    },
    handler: async (ctx, args) => {
      // В реальном приложении здесь была бы интеграция с email сервисом
      console.log(`Email отправлен на ${args.to}: ${args.subject}`);
      
      return { 
        success: true, 
        message: "Email отправлен",
        emailId: `email_${Date.now()}` 
      };
    },
  });
  
  // 🔄 ОБНОВЛЕНИЕ ПРОФИЛЯ ПОЛЬЗОВАТЕЛЯ
  export const updateUserProfile = mutation({
    args: {
      userId: v.string(),
      userType: v.union(v.literal("staff"), v.literal("member")),
      updates: v.object({
        name: v.optional(v.string()),
        phone: v.optional(v.string()),
        // Добавьте другие поля по необходимости
      }),
    },
    handler: async (ctx, args) => {
      const now = Date.now();
  
      if (args.userType === "staff") {
        await ctx.db.patch(args.userId as Id<"staff">, {
          ...args.updates,
          updatedAt: now,
        });
      } else {
        await ctx.db.patch(args.userId as Id<"members">, {
          ...args.updates,
          updatedAt: now,
        });
      }
  
      return { success: true, message: "Профиль обновлен" };
    },
  });
  
  // 📊 ЭКСПОРТ ЛОГОВ БЕЗОПАСНОСТИ
  export const exportSecurityLogs = query({
    args: {
      fromDate: v.number(),
      toDate: v.number(),
      logType: v.optional(v.union(
        v.literal("access"),
        v.literal("password_reset"),
        v.literal("all")
      )),
    },
    handler: async (ctx, args) => {
      const logType = args.logType || "all";
      const exportData: any[] = [];
  
      if (logType === "access" || logType === "all") {
        const accessLogs = await ctx.db
          .query("accessLogs")
          .filter((q) => q.gte(q.field("timestamp"), args.fromDate))
          .filter((q) => q.lte(q.field("timestamp"), args.toDate))
          .collect();
  
        exportData.push(...accessLogs.map(log => ({
          type: "access",
          ...log,
        })));
      }
  
      if (logType === "password_reset" || logType === "all") {
        const resetLogs = await ctx.db
          .query("passwordResetLogs")
          .filter((q) => q.gte(q.field("timestamp"), args.fromDate))
          .filter((q) => q.lte(q.field("timestamp"), args.toDate))
          .collect();
  
        exportData.push(...resetLogs.map(log => ({
          type: "password_reset",
          ...log,
        })));
      }
  
      return {
        success: true,
        data: exportData.sort((a, b) => b.timestamp - a.timestamp),
        count: exportData.length,
        period: {
          from: args.fromDate,
          to: args.toDate,
        },
      };
    },
  });
  
  // 🔍 ПОИСК В ЛОГАХ
  export const searchLogs = query({
    args: {
      query: v.string(),
      logType: v.union(v.literal("access"), v.literal("password_reset")),
      limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
      const limit = args.limit || 100;
      const searchQuery = args.query.toLowerCase();
  
      if (args.logType === "access") {
        const logs = await ctx.db
          .query("accessLogs")
          .order("desc")
          .take(1000); // Берем больше для поиска
  
        const filtered = logs.filter(log => 
          log.ipAddress?.toLowerCase().includes(searchQuery) ||
          log.deviceInfo?.toLowerCase().includes(searchQuery) ||
          log.userId?.toLowerCase().includes(searchQuery)
        ).slice(0, limit);
  
        return { success: true, results: filtered, count: filtered.length };
      }
  
      if (args.logType === "password_reset") {
        const logs = await ctx.db
          .query("passwordResetLogs")
          .order("desc")
          .take(1000);
  
        const filtered = logs.filter(log => 
          log.email?.toLowerCase().includes(searchQuery) ||
          log.userId?.toLowerCase().includes(searchQuery) ||
          log.ipAddress?.toLowerCase().includes(searchQuery)
        ).slice(0, limit);
  
        return { success: true, results: filtered, count: filtered.length };
      }
  
      return { success: false, error: "Неподдерживаемый тип лога" };
    },
  });
  
  