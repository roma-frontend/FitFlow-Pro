import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    userId: v.optional(v.string()),
    memberId: v.optional(v.string()),
    
    // ✅ Добавляем все необходимые поля для данных клиента
    customerEmail: v.optional(v.string()),
    memberEmail: v.optional(v.string()),
    customerName: v.optional(v.string()),
    memberName: v.optional(v.string()),
    customerPhone: v.optional(v.string()),
    
    items: v.array(v.object({
      productId: v.union(v.id("products"), v.string()),
      productName: v.string(),
      quantity: v.number(),
      price: v.number(),
      totalPrice: v.number(),
    })),
    totalAmount: v.number(),
    pickupType: v.string(),
    notes: v.optional(v.string()),
    paymentIntentId: v.optional(v.string()),
    paymentMethod: v.optional(v.string()),
    
    status: v.optional(v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("processing"),
      v.literal("ready"),
      v.literal("completed"),
      v.literal("cancelled")
    )),
    paymentStatus: v.optional(v.union(
      v.literal("pending"),
      v.literal("paid"),
      v.literal("failed"),
      v.literal("refunded")
    )),
    orderTime: v.optional(v.number()),
    estimatedReadyTime: v.optional(v.number()),
    completedTime: v.optional(v.number()),
    paidAt: v.optional(v.number()),
    paymentId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    console.log("🛒 Создание заказа с полными данными клиента:", {
      userId: args.userId,
      memberId: args.memberId,
      customerEmail: args.customerEmail,
      memberEmail: args.memberEmail,
      customerName: args.customerName,
      memberName: args.memberName,
      customerPhone: args.customerPhone,
      totalAmount: args.totalAmount,
      itemsCount: args.items.length
    });
    
    // ✅ Валидация обязательных данных
    if (!args.customerEmail && !args.memberEmail) {
      throw new Error("Email клиента обязателен");
    }
    
    if (!args.customerName && !args.memberName) {
      throw new Error("Имя клиента обязательно");
    }
    
    // Устанавливаем значения по умолчанию, если не переданы
    const orderData = {
      ...args,
      status: args.status || "pending",
      paymentStatus: args.paymentStatus || "pending",
      orderTime: args.orderTime || Date.now(),
    };
    
    const orderId = await ctx.db.insert("orders", orderData);
    
    console.log("✅ Заказ создан с полными реальными данными клиента:", orderId);
    
    // Создаем уведомление о заказе
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    
    try {
      // ✅ Определяем recipientId и recipientType корректно
      const recipientId = args.memberId || args.userId || "anonymous";
      const recipientEmail = args.memberEmail || args.customerEmail;
      const recipientName = args.memberName || args.customerName;
      
      // ✅ Используем правильные типы для recipientType
      let recipientType: "user" | "super-admin" | "admin" | "manager" | "trainer" | "member";
      
      if (args.memberId) {
        recipientType = "member";
      } else if (args.userId && args.userId !== "anonymous") {
        recipientType = "user";
      } else {
        recipientType = "user";
      }
      
      await ctx.db.insert("notifications", {
        title: "Заказ принят",
        message: `Ваш заказ №${orderNumber} на сумму ${args.totalAmount} ₽ принят в обработку`,
        type: "order",
        recipientId: recipientId,
        recipientType: recipientType,
        relatedId: orderId,
        priority: "normal",
        isRead: false,
        createdAt: Date.now(),
        metadata: {
          sourceType: "order",
          sourceId: orderId,
          data: {
            orderNumber,
            totalAmount: args.totalAmount,
            customerEmail: recipientEmail,
            customerName: recipientName,
            customerPhone: args.customerPhone,
            isGuest: !args.memberId && (!args.userId || args.userId === "anonymous"),
          }
        }
      });
      
      console.log("✅ Уведомление о заказе создано с реальными данными клиента");
    } catch (notificationError) {
      console.error("❌ Ошибка создания уведомления:", notificationError);
      // Не прерываем создание заказа из-за ошибки уведомления
    }
    
    return orderId;
  },
});

// Остальные функции остаются без изменений...
export const getByPaymentIntentId = query({
  args: { paymentIntentId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("orders")
      .withIndex("by_payment_intent", (q) => q.eq("paymentIntentId", args.paymentIntentId))
      .first();
  },
});

export const updatePaymentStatus = mutation({
  args: {
    paymentIntentId: v.string(),
    status: v.optional(v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("processing"),
      v.literal("ready"),
      v.literal("completed"),
      v.literal("cancelled")
    )),
    paymentStatus: v.union(
      v.literal("pending"),
      v.literal("paid"),
      v.literal("failed"),
      v.literal("refunded")
    ),
    paymentId: v.optional(v.string()),
    paidAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    console.log("💳 Обновление статуса платежа:", args);
    
    const order = await ctx.db
      .query("orders")
      .withIndex("by_payment_intent", (q) => q.eq("paymentIntentId", args.paymentIntentId))
      .first();
    
    if (!order) {
      throw new Error(`Заказ с paymentIntentId ${args.paymentIntentId} не найден`);
    }
    
    console.log("📦 Найден заказ для обновления с реальными данными:", {
      orderId: order._id,
      currentStatus: order.status,
      currentPaymentStatus: order.paymentStatus,
      customerEmail: order.customerEmail || order.memberEmail,
      customerName: order.customerName || order.memberName,
      customerPhone: order.customerPhone
    });
    
    const updateData: any = {
      paymentStatus: args.paymentStatus,
    };
    
    if (args.status) {
      updateData.status = args.status;
    }
    
    if (args.paymentId) {
      updateData.paymentId = args.paymentId;
    }
    
    if (args.paidAt) {
      updateData.paidAt = args.paidAt;
    }
    
    await ctx.db.patch(order._id, updateData);
    
    console.log("✅ Статус заказа обновлен с сохранением реальных данных клиента");
    
    const updatedOrder = await ctx.db.get(order._id);
    return updatedOrder;
  },
});

export const getById = query({
  args: { id: v.id("orders") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getByUser = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.query("orders")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .order("desc")
      .collect();
  },
});

export const getByMember = query({
  args: { memberId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.query("orders")
      .filter((q) => q.eq(q.field("memberId"), args.memberId))
      .order("desc")
      .collect();
  },
});

export const updateStatus = mutation({
  args: {
    orderId: v.id("orders"),
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("processing"),
      v.literal("ready"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
    estimatedReadyTime: v.optional(v.number()),
    completedTime: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    console.log("📝 Обновление статуса заказа:", args);
    
    const updateData: any = {
      status: args.status,
    };
    
    if (args.estimatedReadyTime) {
      updateData.estimatedReadyTime = args.estimatedReadyTime;
    }
    
    if (args.completedTime) {
      updateData.completedTime = args.completedTime;
    }
    
    await ctx.db.patch(args.orderId, updateData);
    
    console.log("✅ Статус заказа обновлен");
    return args.orderId;
  },
});

export const getAll = query({
  args: {
    limit: v.optional(v.number()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("orders");
    
    if (args.status) {
      query = query.filter((q) => q.eq(q.field("status"), args.status));
    }
    
    const orders = await query
      .order("desc")
      .take(args.limit || 100);
    
    return orders;
  },
});

export const getStats = query({
  handler: async (ctx) => {
    const allOrders = await ctx.db.query("orders").collect();
    
    const stats = {
      total: allOrders.length,
      pending: allOrders.filter(o => o.status === "pending").length,
      confirmed: allOrders.filter(o => o.status === "confirmed").length,
      processing: allOrders.filter(o => o.status === "processing").length,
      ready: allOrders.filter(o => o.status === "ready").length,
      completed: allOrders.filter(o => o.status === "completed").length,
      cancelled: allOrders.filter(o => o.status === "cancelled").length,
      totalRevenue: allOrders
        .filter(o => o.paymentStatus === "paid")
        .reduce((sum, o) => sum + o.totalAmount, 0),
    };
    
    return stats;
  },
});

export const getGuestOrders = query({
  args: { 
    customerEmail: v.string(),
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const orders = await ctx.db.query("orders")
      .filter((q) => 
        q.or(
          q.eq(q.field("customerEmail"), args.customerEmail),
          q.eq(q.field("memberEmail"), args.customerEmail)
        )
      )
      .order("desc")
      .take(args.limit || 50);
    
    return orders;
  },
});

export const findOrdersByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const orders = await ctx.db.query("orders")
      .filter((q) => 
        q.or(
          q.eq(q.field("customerEmail"), args.email),
          q.eq(q.field("memberEmail"), args.email)
        )
      )
      .order("desc")
      .collect();
    
    return orders;
  },
});
