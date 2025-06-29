// convex/bookings.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Существующая функция для members
export const create = mutation({
  args: {
    memberId: v.id("members"),
    trainerId: v.id("trainers"),
    startTime: v.number(),
    endTime: v.number(),
    duration: v.number(),
    workoutType: v.string(),
    price: v.number(),
    notes: v.optional(v.string()),
    status: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  },
  handler: async (ctx, args) => {
    console.log('Convex bookings: создаем бронирование для member:', args);
    
    const bookingId = await ctx.db.insert("bookings", {
      memberId: args.memberId,
      trainerId: args.trainerId,
      startTime: args.startTime,
      endTime: args.endTime,
      duration: args.duration,
      workoutType: args.workoutType,
      price: args.price,
      notes: args.notes || "",
      status: args.status,
      createdAt: args.createdAt,
      updatedAt: args.updatedAt,
    });
    
    console.log('Convex bookings: бронирование создано с ID:', bookingId);
    return bookingId;
  },
});

// ОБНОВЛЕННАЯ функция для users с поддержкой платежей
export const createForUser = mutation({
  args: {
    userId: v.id("users"),
    trainerId: v.id("trainers"),
    startTime: v.number(),
    endTime: v.number(),
    duration: v.number(),
    workoutType: v.string(),
    price: v.number(),
    notes: v.optional(v.string()),
    status: v.string(),
    paymentMethod: v.optional(v.string()), // Новое поле
    paymentIntentId: v.optional(v.string()), // Новое поле
    paymentStatus: v.optional(v.string()), // Новое поле
    createdAt: v.number(),
    updatedAt: v.number(),
  },
  handler: async (ctx, args) => {
    console.log('Convex bookings: создаем бронирование для user с платежом:', args);
    
    const bookingId = await ctx.db.insert("userBookings", {
      userId: args.userId,
      trainerId: args.trainerId,
      startTime: args.startTime,
      endTime: args.endTime,
      duration: args.duration,
      workoutType: args.workoutType,
      price: args.price,
      notes: args.notes || "",
      status: args.status,
      paymentMethod: args.paymentMethod || "cash",
      paymentIntentId: args.paymentIntentId || undefined,
      paymentStatus: args.paymentStatus || "pending",
      createdAt: args.createdAt,
      updatedAt: args.updatedAt,
    });
    
    console.log('Convex bookings: бронирование пользователя создано с ID:', bookingId);
    return bookingId;
  },
});

export const updateTrainerBookingPayment = mutation({
  args: {
    paymentIntentId: v.string(),
    paymentStatus: v.string(),
    status: v.string(),
    paymentId: v.optional(v.string()),
    paidAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    console.log('Convex bookings: обновляем статус платежа trainer booking по paymentIntentId:', args);
    
    // Ищем бронирование по paymentIntentId
    const booking = await ctx.db.query("userBookings")
      .filter((q) => q.eq(q.field("paymentIntentId"), args.paymentIntentId))
      .first();
    
    if (!booking) {
      console.error('Convex bookings: бронирование не найдено для paymentIntentId:', args.paymentIntentId);
      throw new Error(`Бронирование с paymentIntentId ${args.paymentIntentId} не найдено`);
    }
    
    console.log('Convex bookings: найдено бронирование для обновления:', booking._id);
    
    // Обновляем статус
    const { paymentIntentId, ...updateData } = args;
    
    await ctx.db.patch(booking._id, {
      ...updateData,
      updatedAt: Date.now(),
    });
    
    const updatedBooking = await ctx.db.get(booking._id);
    console.log('Convex bookings: статус платежа trainer booking обновлен:', updatedBooking);
    
    return updatedBooking;
  },
});

// НОВАЯ функция для обновления статуса платежа
export const updatePaymentStatus = mutation({
  args: {
    bookingId: v.id("userBookings"),
    paymentStatus: v.string(),
    status: v.string(),
    paymentId: v.optional(v.string()),
    paidAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    console.log('Convex bookings: обновляем статус платежа:', args);
    
    const { bookingId, ...updateData } = args;
    
    await ctx.db.patch(bookingId, {
      ...updateData,
      updatedAt: Date.now(),
    });
    
    const updatedBooking = await ctx.db.get(bookingId);
    console.log('Convex bookings: статус платежа обновлен:', updatedBooking);
    
    return updatedBooking;
  },
});

// Функция для получения бронирований пользователя
export const getByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    console.log('Convex bookings: ищем бронирования для user:', args.userId);
    
    const bookings = await ctx.db.query("userBookings")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .order("desc")
      .collect();
    
    console.log('Convex bookings: найдено бронирований пользователя:', bookings.length);
    return bookings;
  },
});

// Получение всех бронирований пользователей
export const getAllUserBookings = query({
  handler: async (ctx) => {
    console.log('Convex bookings: получаем все бронирования пользователей');
    const bookings = await ctx.db.query("userBookings").collect();
    console.log('Convex bookings: найдено бронирований пользователей:', bookings.length);
    return bookings;
  },
});

// НОВАЯ функция для получения бронирования по ID
export const getUserBookingById = query({
  args: { id: v.id("userBookings") },
  handler: async (ctx, args) => {
    console.log('Convex bookings: получаем бронирование по ID:', args.id);
    return await ctx.db.get(args.id);
  },
});

// НОВАЯ функция для отмены бронирования
export const cancelUserBooking = mutation({
  args: {
    bookingId: v.id("userBookings"),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    console.log('Convex bookings: отменяем бронирование:', args.bookingId);
    
    const booking = await ctx.db.get(args.bookingId);
    
    if (!booking) {
      throw new Error("Бронирование не найдено");
    }
    
    // Проверяем, можно ли отменить (например, за 24 часа до начала)
    const now = Date.now();
    const hoursBeforeStart = (booking.startTime - now) / (1000 * 60 * 60);
    
    if (hoursBeforeStart < 24) {
      console.log('Convex bookings: отмена невозможна - менее 24 часов до начала');
      throw new Error("Отмена возможна не позднее чем за 24 часа до начала");
    }
    
    await ctx.db.patch(args.bookingId, {
      status: "cancelled",
      cancelReason: args.reason,
      cancelledAt: now,
      updatedAt: now,
    });
    
    console.log('Convex bookings: бронирование отменено');
    return await ctx.db.get(args.bookingId);
  },
});

// НОВАЯ функция для получения предстоящих бронирований
export const getUpcomingUserBookings = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    console.log('Convex bookings: получаем предстоящие бронирования для user:', args.userId);
    
    const now = Date.now();
    
    const bookings = await ctx.db.query("userBookings")
      .filter((q) => 
        q.and(
          q.eq(q.field("userId"), args.userId),
          q.gt(q.field("startTime"), now),
          q.neq(q.field("status"), "cancelled")
        )
      )
      .order("asc")
      .collect();
    
    console.log('Convex bookings: найдено предстоящих бронирований:', bookings.length);
    return bookings;
  },
});

// НОВАЯ функция для получения истории бронирований
export const getUserBookingHistory = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    console.log('Convex bookings: получаем историю бронирований для user:', args.userId);
    
    const now = Date.now();
    
    const bookings = await ctx.db.query("userBookings")
      .filter((q) => 
        q.and(
          q.eq(q.field("userId"), args.userId),
          q.lt(q.field("endTime"), now)
        )
      )
      .order("desc")
      .collect();
    
    console.log('Convex bookings: найдено прошедших бронирований:', bookings.length);
    return bookings;
  },
});

// НОВАЯ функция для получения бронирований по статусу платежа
export const getUserBookingsByPaymentStatus = query({
  args: { 
    userId: v.id("users"),
    paymentStatus: v.string()
  },
  handler: async (ctx, args) => {
    console.log('Convex bookings: получаем бронирования по статусу платежа:', args);
    
    const bookings = await ctx.db.query("userBookings")
      .filter((q) => 
        q.and(
          q.eq(q.field("userId"), args.userId),
          q.eq(q.field("paymentStatus"), args.paymentStatus)
        )
      )
      .order("desc")
      .collect();
    
    console.log('Convex bookings: найдено бронирований со статусом', args.paymentStatus, ':', bookings.length);
    return bookings;
  },
});