// convex/bookings.ts (добавьте новую функцию)
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

// НОВАЯ функция для users
export const createForUser = mutation({
  args: {
    userId: v.id("users"), // Используем users вместо members
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
    console.log('Convex bookings: создаем бронирование для user:', args);
    
    // Создаем бронирование с userId вместо memberId
    const bookingId = await ctx.db.insert("userBookings", { // Используем отдельную таблицу
      userId: args.userId,
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
    
    console.log('Convex bookings: бронирование пользователя создано с ID:', bookingId);
    return bookingId;
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


export const getAllUserBookings = query({
  handler: async (ctx) => {
    console.log('Convex bookings: получаем все бронирования пользователей');
    const bookings = await ctx.db.query("userBookings").collect();
    console.log('Convex bookings: найдено бронирований пользователей:', bookings.length);
    return bookings;
  },
});