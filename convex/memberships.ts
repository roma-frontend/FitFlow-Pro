import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Получить все активные абонементы пользователя
export const getUserMemberships = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    console.log("🔄 Convex Query: Получение абонементов пользователя:", args.userId);

    const memberships = await ctx.db.query("memberships")
      .filter((q) => q.and(
        q.eq(q.field("userId"), args.userId),
        q.eq(q.field("isActive"), true)
      ))
      .order("desc")
      .collect();

    console.log("✅ Convex Query: Найдено активных абонементов:", memberships.length);
    return memberships;
  },
});

// Получить текущий активный абонемент пользователя
export const getCurrentMembership = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    console.log("🔄 Convex Query: Получение текущего абонемента:", args.userId);

    const now = Date.now();

    const membership = await ctx.db.query("memberships")
      .filter((q) => q.and(
        q.eq(q.field("userId"), args.userId),
        q.eq(q.field("isActive"), true),
        q.gt(q.field("expiresAt"), now)
      ))
      .order("desc")
      .first();

    if (membership) {
      // Вычисляем оставшиеся дни
      const remainingDays = Math.max(0, Math.ceil((membership.expiresAt - now) / (1000 * 60 * 60 * 24)));

      console.log("✅ Convex Query: Найден активный абонемент, осталось дней:", remainingDays);

      return {
        ...membership,
        remainingDays,
        status: remainingDays > 0 ? 'active' : 'expired'
      };
    }

    console.log("❌ Convex Query: Активный абонемент не найден");
    return null;
  },
});

// Получить все планы абонементов
export const getPlans = query({
  handler: async (ctx) => {
    console.log("🔄 Convex Query: Получение всех планов абонементов");

    const plans = await ctx.db.query("membershipPlans")
      .filter((q) => q.eq(q.field("isActive"), true))
      .order("asc")
      .collect();

    console.log("✅ Convex Query: Найдено планов:", plans.length);
    return plans;
  },
});

export const createFromOrder = mutation({
  args: {
    orderData: v.object({
      _id: v.id("membershipOrders"),
      userId: v.id("users"),
      planId: v.id("membershipPlans"),
      planType: v.string(),
      planName: v.string(),
      price: v.number(),
      duration: v.number(),
      autoRenew: v.boolean(),
      userEmail: v.string(),
      userName: v.string(),
      userPhone: v.optional(v.string()),
      paymentIntentId: v.string(),
      paymentId: v.string(),
      paidAt: v.number(),
    }),
    paymentIntentId: v.string(),
  },
  handler: async (ctx, args) => {
    // Очищаем orderData от лишних полей
    const src = args.orderData as any;
    const orderData = {
      _id: src._id,
      userId: src.userId,
      planId: src.planId,
      planType: src.planType,
      planName: src.planName,
      price: src.price,
      duration: src.duration,
      autoRenew: src.autoRenew,
      userEmail: src.userEmail,
      userName: src.userName,
      userPhone: src.userPhone,
      paymentIntentId: src.paymentIntentId,
      paymentId: src.paymentId,
      paidAt: src.paidAt,
    };

    // Проверяем, нет ли уже активного абонемента для этого пользователя
    const existingMembership = await ctx.db
      .query("memberships")
      .filter((q) =>
        q.and(
          q.eq(q.field("userId"), orderData.userId),
          q.eq(q.field("status"), "active")
        )
      )
      .unique();

    // Если есть активный абонемент, деактивируем его
    if (existingMembership) {
      await ctx.db.patch(existingMembership._id, {
        status: "replaced",
        updatedAt: Date.now(),
      });
    }

    // Вычисляем даты
    const startDate = Date.now();
    const expiresAt = startDate + (orderData.duration * 24 * 60 * 60 * 1000);
    const remainingDays = Math.ceil((expiresAt - startDate) / (24 * 60 * 60 * 1000));

    // Создаем новый активный абонемент
    const membershipData = {
      userId: orderData.userId,
      planId: orderData.planId,
      type: orderData.planType,
      status: "active" as const,
      startDate,
      expiresAt,
      remainingDays,
      price: orderData.price,
      autoRenew: orderData.autoRenew,
      isActive: true,
      paymentIntentId: orderData.paymentIntentId,
      paymentId: orderData.paymentId,
      paidAt: orderData.paidAt,
      orderId: orderData._id,
      userEmail: orderData.userEmail,
      userName: orderData.userName,
      userPhone: orderData.userPhone,
      usageStats: {
        visitsThisMonth: 0,
        totalVisits: 0,
        favoriteTime: "Не определено",
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const membershipId = await ctx.db.insert("memberships", membershipData);
    return await ctx.db.get(membershipId);
  },
});

// Получить план по ID
export const getPlanById = query({
  args: {
    planId: v.optional(v.id("membershipPlans")),
    id: v.optional(v.id("membershipPlans")),
  },
  handler: async (ctx, args) => {
    const planId = args.planId ?? args.id;
    if (!planId) throw new Error("planId is required");
    return await ctx.db.get(planId);
  },
});

// Создать новый абонемент (покупка)
export const create = mutation({
  args: {
    userId: v.id("users"),
    planId: v.id("membershipPlans"),
    trainerId: v.optional(v.id("trainers")),
    autoRenew: v.optional(v.boolean()),
    paymentIntentId: v.optional(v.string()),
    paymentMethod: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    console.log("🔄 Convex Mutation: Создание абонемента для пользователя:", args.userId);

    // Получаем план
    const plan = await ctx.db.get(args.planId);
    if (!plan) {
      throw new Error("План абонемента не найден");
    }

    // Деактивируем предыдущие абонементы
    const existingMemberships = await ctx.db.query("memberships")
      .filter((q) => q.and(
        q.eq(q.field("userId"), args.userId),
        q.eq(q.field("isActive"), true)
      ))
      .collect();

    for (const membership of existingMemberships) {
      await ctx.db.patch(membership._id, { isActive: false });
    }

    // Создаем новый абонемент
    const now = Date.now();
    const expiresAt = now + (plan.duration * 24 * 60 * 60 * 1000); // duration в днях

    const membershipId = await ctx.db.insert("memberships", {
      userId: args.userId,
      planId: args.planId,
      trainerId: args.trainerId,
      type: plan.type,
      price: plan.price,
      startDate: now,
      expiresAt: expiresAt,
      isActive: true,
      syncVersion: 1,
      lastSyncTime: now,
      isDirty: false,
      autoRenew: args.autoRenew || false,
      paymentIntentId: args.paymentIntentId || undefined,
      status: "active",
      orderId: undefined,
      paymentMethod: args.paymentMethod || undefined,
      // Данные пользователя
      userEmail: "",
      userName: "",
      userPhone: "",
      usageStats: {
        visitsThisMonth: 0,
        totalVisits: 0,
        favoriteTime: "Не определено",
      },
      // Временные метки
      createdAt: now,
      updatedAt: now,
    });

    console.log("✅ Convex Mutation: Абонемент создан с ID:", membershipId);
    return membershipId;
  },
});

// Продлить абонемент
export const renew = mutation({
  args: {
    membershipId: v.id("memberships"),
    planId: v.id("membershipPlans"),
  },
  handler: async (ctx, args) => {
    console.log("🔄 Convex Mutation: Продление абонемента:", args.membershipId);

    const membership = await ctx.db.get(args.membershipId);
    if (!membership) {
      throw new Error("Абонемент не найден");
    }

    const plan = await ctx.db.get(args.planId);
    if (!plan) {
      throw new Error("План абонемента не найден");
    }

    // Вычисляем новую дату окончания
    const now = Date.now();
    const currentExpiry = membership.expiresAt;
    const baseDate = currentExpiry > now ? currentExpiry : now;
    const newExpiresAt = baseDate + (plan.duration * 24 * 60 * 60 * 1000);

    await ctx.db.patch(args.membershipId, {
      isActive: true,
      freezeData: undefined,
      syncVersion: (membership.syncVersion || 0) + 1,
      lastSyncTime: Date.now(),
      isDirty: false
    });

    console.log("✅ Convex Mutation: Абонемент продлен до:", new Date(newExpiresAt));
    return { success: true, newExpiresAt };
  },
});

// Отменить абонемент
export const cancel = mutation({
  args: {
    membershipId: v.id("memberships"),
  },
  handler: async (ctx, args) => {
    console.log("🔄 Convex Mutation: Отмена абонемента:", args.membershipId);

    const membership = await ctx.db.get(args.membershipId);
    if (!membership) {
      throw new Error("Абонемент не найден");
    }

    await ctx.db.patch(args.membershipId, {
      isActive: false,
      status: "cancelled",
      freezeData: undefined,
      syncVersion: (membership.syncVersion || 0) + 1,
      lastSyncTime: Date.now(),
      isDirty: false
    });

    console.log("✅ Convex Mutation: Абонемент отменен");
    return { success: true };
  },
});

export const freeze = mutation({
  args: {
    membershipId: v.id("memberships"),
    freezeDays: v.number(),
  },
  handler: async (ctx, args) => {
    console.log("🔄 Convex Mutation: Заморозка абонемента:", args.membershipId);

    const membership = await ctx.db.get(args.membershipId);
    if (!membership) {
      throw new Error("Абонемент не найден");
    }

    const freezeEndDate = Date.now() + (args.freezeDays * 24 * 60 * 60 * 1000);

    await ctx.db.patch(args.membershipId, {
      isActive: false,
      freezeData: {
        isFreezed: true,
        freezeStartDate: new Date().toISOString(),
        freezeEndDate: new Date(freezeEndDate).toISOString(),
        freezeDays: args.freezeDays,
      },
      syncVersion: (membership.syncVersion || 0) + 1,
      lastSyncTime: Date.now(),
      isDirty: false
    });

    console.log("✅ Convex Mutation: Абонемент заморожен до:", new Date(freezeEndDate));
    return { success: true, freezeEndDate };
  },
});

export const unfreeze = mutation({
  args: {
    membershipId: v.id("memberships"),
  },
  handler: async (ctx, args) => {
    console.log("🔄 Convex Mutation: Разморозка абонемента:", args.membershipId);

    const membership = await ctx.db.get(args.membershipId);
    if (!membership) {
      throw new Error("Абонемент не найден");
    }

    // Проверяем, действительно ли абонемент заморожен
    if (
      !membership.freezeData ||
      !membership.freezeData.freezeEndDate ||
      new Date(membership.freezeData.freezeEndDate) <= new Date()
    ) {
      throw new Error("Абонемент не заморожен или уже разморожен");
    }

    // Удаляем freezeData
    await ctx.db.patch(args.membershipId, {
      isActive: true,
      freezeData: undefined, // вместо null
      syncVersion: (membership.syncVersion || 0) + 1,
      lastSyncTime: Date.now(),
      isDirty: false
    });

    console.log("✅ Convex Mutation: Абонемент разморожен");
    return { success: true };
  }
});

// Получить историю абонементов пользователя
export const getUserHistory = query({
  args: {
    userId: v.id("users"),
    includeExpired: v.optional(v.boolean())
  },
  handler: async (ctx, args) => {
    console.log("🔄 Convex Query: Получение истории абонементов:", args.userId);

    let query = ctx.db.query("memberships")
      .filter((q) => q.eq(q.field("userId"), args.userId));

    if (!args.includeExpired) {
      query = query.filter((q) => q.eq(q.field("isActive"), true));
    }

    const memberships = await query.order("desc").collect();

    console.log("✅ Convex Query: Найдено абонементов в истории:", memberships.length);
    return memberships;
  },
});

// Проверить истекшие абонементы (для cron job)
export const checkExpiredMemberships = mutation({
  handler: async (ctx) => {
    console.log("🔄 Convex Mutation: Проверка истекших абонементов");

    const now = Date.now();

    const expiredMemberships = await ctx.db.query("memberships")
      .filter((q) => q.and(
        q.eq(q.field("isActive"), true),
        q.lt(q.field("expiresAt"), now)
      ))
      .collect();

    let deactivatedCount = 0;

    for (const membership of expiredMemberships) {
      await ctx.db.patch(membership._id, {
        isActive: false,
        syncVersion: (membership.syncVersion || 0) + 1,
        lastSyncTime: now,
        isDirty: false
      });
      deactivatedCount++;
    }

    console.log("✅ Convex Mutation: Деактивировано истекших абонементов:", deactivatedCount);
    return { deactivatedCount };
  },
});

// Получить статистику абонементов
export const getStats = query({
  handler: async (ctx) => {
    console.log("🔄 Convex Query: Получение статистики абонементов");

    const allMemberships = await ctx.db.query("memberships").collect();
    const now = Date.now();

    const stats = {
      total: allMemberships.length,
      active: allMemberships.filter(m => m.isActive && m.expiresAt > now).length,
      expired: allMemberships.filter(m => !m.isActive || m.expiresAt <= now).length,
      basic: allMemberships.filter(m => m.type === 'basic').length,
      premium: allMemberships.filter(m => m.type === 'premium').length,
      vip: allMemberships.filter(m => m.type === 'vip').length,
      unlimited: allMemberships.filter(m => m.type === 'unlimited').length,
    };

    console.log("✅ Convex Query: Статистика получена:", stats);
    return stats;
  },
});

// Обновить абонемент
export const update = mutation({
  args: {
    id: v.id("memberships"),
    type: v.optional(v.string()),
    price: v.optional(v.number()),
    expiresAt: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
    trainerId: v.optional(v.id("trainers")),
  },
  handler: async (ctx, args) => {
    console.log("🔄 Convex: Обновление абонемента:", args.id);

    const { id, ...updateData } = args;

    // Проверяем существование абонемента
    const existingMembership = await ctx.db.get(id);
    if (!existingMembership) {
      throw new Error("Абонемент не найден");
    }

    // Обновляем абонемент
    await ctx.db.patch(id, {
      ...updateData,
      syncVersion: (existingMembership.syncVersion || 0) + 1,
      lastSyncTime: Date.now(),
      isDirty: false
    });

    // Возвращаем обновленный абонемент
    const updatedMembership = await ctx.db.get(id);
    console.log("✅ Convex: Абонемент обновлен:", updatedMembership);

    return updatedMembership;
  },
});

// CRUD операции для планов абонементов
export const createPlan = mutation({
  args: {
    name: v.string(),
    type: v.string(),
    duration: v.number(), // в днях
    price: v.number(),
    description: v.optional(v.string()),
    features: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    console.log("🔄 Convex Mutation: Создание плана абонемента:", args.name);

    const planId = await ctx.db.insert("membershipPlans", {
      ...args,
      isActive: true,
      createdAt: Date.now(),
      syncVersion: 1,
      lastSyncTime: Date.now(),
      isDirty: false
    });

    console.log("✅ Convex Mutation: План создан с ID:", planId);
    return planId;
  },
});

export const updatePlan = mutation({
  args: {
    id: v.id("membershipPlans"),
    name: v.optional(v.string()),
    type: v.optional(v.string()),
    duration: v.optional(v.number()),
    price: v.optional(v.number()),
    description: v.optional(v.string()),
    features: v.optional(v.array(v.string())),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    console.log("🔄 Convex: Обновление плана абонемента:", args.id);

    const { id, ...updateData } = args;

    // Проверяем существование плана
    const existingPlan = await ctx.db.get(id);
    if (!existingPlan) {
      throw new Error("План абонемента не найден");
    }

    // Обновляем план
    await ctx.db.patch(id, {
      ...updateData,
      syncVersion: (existingPlan.syncVersion || 0) + 1,
      lastSyncTime: Date.now(),
      isDirty: false
    });

    const updatedPlan = await ctx.db.get(id);
    console.log("✅ Convex: План обновлен:", updatedPlan);

    return updatedPlan;
  },
});

export const deletePlan = mutation({
  args: { id: v.id("membershipPlans") },
  handler: async (ctx, args) => {
    console.log("🔄 Convex Mutation: Удаление плана абонемента:", args.id);

    // Проверяем, есть ли активные абонементы с этим планом
    const activeMemberships = await ctx.db.query("memberships")
      .filter((q) => q.and(
        q.eq(q.field("type"), args.id),
        q.eq(q.field("isActive"), true)
      ))
      .first();

    if (activeMemberships) {
      throw new Error("Невозможно удалить план с активными абонементами");
    }

    // Мягкое удаление - деактивация
    await ctx.db.patch(args.id, {
      isActive: false,
      syncVersion: 1,
      lastSyncTime: Date.now(),
      isDirty: false
    });

    console.log("✅ Convex Mutation: План деактивирован");
    return { success: true };
  },
});