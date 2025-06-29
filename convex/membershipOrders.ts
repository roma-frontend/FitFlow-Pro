// convex/membershipOrders.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Создание заказа абонемента
export const create = mutation({
  args: {
    userId: v.string(),
    planId: v.id("membershipPlans"),
    planType: v.string(),
    planName: v.string(),
    price: v.number(),
    duration: v.number(),
    autoRenew: v.boolean(),
    paymentIntentId: v.string(),
    paymentMethod: v.string(),
    status: v.string(),
    
    // Данные клиента
    userEmail: v.string(),
    userName: v.string(),
    userPhone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    console.log("📦 Creating membership order:", args);

    const orderData = {
      userId: args.userId,
      planId: args.planId,
      planType: args.planType,
      planName: args.planName,
      price: args.price,
      duration: args.duration,
      autoRenew: args.autoRenew,
      
      // Платежные данные
      paymentIntentId: args.paymentIntentId,
      paymentMethod: args.paymentMethod,
      paymentStatus: 'pending',
      status: args.status,
      
      // Данные клиента
      userEmail: args.userEmail,
      userName: args.userName,
      userPhone: args.userPhone,
      
      // Временные метки
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const orderId = await ctx.db.insert("membershipOrders", orderData);
    
    console.log("✅ Membership order created:", orderId);
    return orderId;
  },
});

// Обновление статуса платежа заказа
export const updatePaymentStatus = mutation({
  args: {
    paymentIntentId: v.string(),
    status: v.string(),
    paymentStatus: v.string(),
    paymentId: v.string(),
    paidAt: v.number(),
  },
  handler: async (ctx, args) => {
    console.log("💳 Updating membership order payment status:", args);

    // Находим заказ по paymentIntentId
    const order = await ctx.db
      .query("membershipOrders")
      .filter((q) => q.eq(q.field("paymentIntentId"), args.paymentIntentId))
      .unique();

    if (!order) {
      throw new Error(`Заказ с paymentIntentId ${args.paymentIntentId} не найден`);
    }

    // Обновляем данные заказа
    const updateData = {
      status: args.status,
      paymentStatus: args.paymentStatus,
      paymentId: args.paymentId,
      paidAt: args.paidAt,
      updatedAt: Date.now(),
    };

    await ctx.db.patch(order._id, updateData);

    // Возвращаем обновленный заказ
    const updatedOrder = await ctx.db.get(order._id);
    
    console.log("✅ Membership order payment updated:", updatedOrder?._id);
    return updatedOrder;
  },
});

// Получение заказа по ID
export const getById = query({
  args: { orderId: v.id("membershipOrders") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.orderId);
  },
});

// Получение заказов пользователя
export const getUserOrders = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("membershipOrders")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .order("desc")
      .collect();
  },
});

// Получение заказа по paymentIntentId
export const getByPaymentIntentId = query({
  args: { paymentIntentId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("membershipOrders")
      .filter((q) => q.eq(q.field("paymentIntentId"), args.paymentIntentId))
      .unique();
  },
});