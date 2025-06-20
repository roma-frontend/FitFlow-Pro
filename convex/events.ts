// convex/events.ts
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

// Получить все события
export const getAll = query({
  args: {},
  handler: async (ctx) => {
    console.log("=== getAll events called ===");
    const events = await ctx.db.query("events").collect();
    console.log(`Found ${events.length} events in database`);
    
    // Отладка первых событий
    if (events.length > 0) {
      console.log("First event:", events[0]);
    }
    
    return events;
  },
});

// Получить событие по ID
export const getById = query({
  args: { id: v.id("events") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Получить события по тренеру
export const getByTrainer = query({
  args: { trainerId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("events")
      .withIndex("by_trainer", (q) => q.eq("trainerId", args.trainerId))
      .collect();
  },
});

// Получить события по клиенту
export const getByClient = query({
  args: { clientId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("events")
      .withIndex("by_client", (q) => q.eq("clientId", args.clientId))
      .collect();
  },
});

// Получить события по статусу
export const getByStatus = query({
  args: { status: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("events")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .collect();
  },
});

// Получить предстоящие события
export const getUpcoming = query({
  args: {},
  handler: async (ctx) => {
    const now = new Date().toISOString();
    return await ctx.db
      .query("events")
      .withIndex("by_start_time")
      .filter((q) => q.gte(q.field("startTime"), now))
      .collect();
  },
});

// Получить события в диапазоне дат
export const getByDateRange = query({
  args: {
    startDate: v.string(),
    endDate: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("events")
      .withIndex("by_start_time")
      .filter((q) => 
        q.and(
          q.gte(q.field("startTime"), args.startDate),
          q.lte(q.field("startTime"), args.endDate)
        )
      )
      .collect();
  },
});

// Получить статистику тренера
export const getTrainerStats = query({
  args: { trainerId: v.string() },
  handler: async (ctx, args) => {
    const events = await ctx.db
      .query("events")
      .withIndex("by_trainer", (q) => q.eq("trainerId", args.trainerId))
      .collect();

    const total = events.length;
    const completed = events.filter(e => e.status === "completed").length;
    const cancelled = events.filter(e => e.status === "cancelled").length;
    const scheduled = events.filter(e => e.status === "scheduled").length;
    const confirmed = events.filter(e => e.status === "confirmed").length;
    const noShow = events.filter(e => e.status === "no-show").length;

    // Подсчет рейтинга
    const ratedEvents = events.filter(e => e.clientRating && e.clientRating > 0);
    const averageRating = ratedEvents.length > 0 
      ? ratedEvents.reduce((sum, e) => sum + (e.clientRating || 0), 0) / ratedEvents.length 
      : 0;

    // Подсчет дохода
    const totalRevenue = events
      .filter(e => e.status === "completed" && e.price)
      .reduce((sum, e) => sum + (e.price || 0), 0);

    return {
      trainerId: args.trainerId,
      total,
      completed,
      cancelled,
      scheduled,
      confirmed,
      noShow,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      cancellationRate: total > 0 ? Math.round((cancelled / total) * 100) : 0,
      noShowRate: total > 0 ? Math.round((noShow / total) * 100) : 0,
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews: ratedEvents.length,
      totalRevenue,
    };
  },
});

// Создать событие
export const create = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    type: v.string(),
    startTime: v.string(),
    endTime: v.string(),
    trainerId: v.string(),
    trainerName: v.string(),
    clientId: v.optional(v.string()),
    clientName: v.optional(v.string()),
    status: v.optional(v.string()),
    location: v.optional(v.string()),
    createdBy: v.string(),
    price: v.optional(v.number()),
    duration: v.optional(v.number()),
    notes: v.optional(v.string()),
    goals: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const eventId = await ctx.db.insert("events", {
      title: args.title,
      description: args.description,
      type: args.type,
      startTime: args.startTime,
      endTime: args.endTime,
      trainerId: args.trainerId,
      trainerName: args.trainerName,
      clientId: args.clientId,
      clientName: args.clientName,
      status: args.status || "scheduled",
      location: args.location,
      createdBy: args.createdBy,
      price: args.price,
      duration: args.duration,
      notes: args.notes,
      goals: args.goals,
    });

    // Обновляем статистику тренера
    await updateTrainerActivity(ctx, args.trainerId);

    return eventId;
  },
});

// Обновить событие
export const update = mutation({
  args: {
    id: v.id("events"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    type: v.optional(v.string()),
    startTime: v.optional(v.string()),
    endTime: v.optional(v.string()),
    trainerId: v.optional(v.string()),
    trainerName: v.optional(v.string()),
    clientId: v.optional(v.string()),
    clientName: v.optional(v.string()),
    status: v.optional(v.string()),
    location: v.optional(v.string()),
    price: v.optional(v.number()),
    duration: v.optional(v.number()),
    notes: v.optional(v.string()),
    goals: v.optional(v.array(v.string())),
    clientRating: v.optional(v.number()),
    clientReview: v.optional(v.string()),
    trainerNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    
    const event = await ctx.db.get(id);
    if (!event) {
      throw new Error("Event not found");
    }

    await ctx.db.patch(id, updates);

    // Если изменился тренер, обновляем статистику
    if (updates.trainerId && updates.trainerId !== event.trainerId) {
      await updateTrainerActivity(ctx, updates.trainerId);
      await updateTrainerActivity(ctx, event.trainerId); // Обновляем старого тренера
    } else {
      await updateTrainerActivity(ctx, event.trainerId);
    }

    return id;
  },
});

// Обновить статус события
export const updateStatus = mutation({
  args: {
    id: v.id("events"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.id);
    if (!event) {
      throw new Error("Event not found");
    }

    await ctx.db.patch(args.id, {
      status: args.status,
    });

    // Обновляем статистику тренера
    await updateTrainerActivity(ctx, event.trainerId);

    return args.id;
  },
});

// Добавить отзыв к событию
export const addReview = mutation({
  args: {
    id: v.id("events"),
    clientRating: v.number(),
    clientReview: v.optional(v.string()),
    trainerNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...reviewData } = args;
    
    const event = await ctx.db.get(id);
    if (!event) {
      throw new Error("Event not found");
    }

    await ctx.db.patch(id, reviewData);

    // Обновляем статистику тренера (включая рейтинг)
    await updateTrainerActivity(ctx, event.trainerId);

    return id;
  },
});

// Удалить событие
export const delete_ = mutation({
  args: { id: v.id("events") },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.id);
    if (!event) {
      throw new Error("Event not found");
    }

    await ctx.db.delete(args.id);

    // Обновляем статистику тренера
    await updateTrainerActivity(ctx, event.trainerId);

    return args.id;
  },
});

// Получить события тренера на определенную дату
export const getTrainerEventsByDate = query({
  args: {
    trainerId: v.string(),
    date: v.string(), // YYYY-MM-DD
  },
  handler: async (ctx, args) => {
    const startOfDay = `${args.date}T00:00:00.000Z`;
    const endOfDay = `${args.date}T23:59:59.999Z`;

    return await ctx.db
      .query("events")
      .withIndex("by_trainer", (q) => q.eq("trainerId", args.trainerId))
      .filter((q) => 
        q.and(
          q.gte(q.field("startTime"), startOfDay),
          q.lte(q.field("startTime"), endOfDay)
        )
      )
      .collect();
  },
});

// Получить события на сегодня
export const getTodayEvents = query({
  args: {},
  handler: async (ctx) => {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString();

    return await ctx.db
      .query("events")
      .withIndex("by_start_time")
      .filter((q) => 
        q.and(
          q.gte(q.field("startTime"), startOfDay),
          q.lt(q.field("startTime"), endOfDay)
        )
      )
      .collect();
  },
});

// Вспомогательная функция для обновления активности тренера
async function updateTrainerActivity(ctx: any, trainerId: string) {
  try {
    // Получаем тренера
    const trainer = await ctx.db
      .query("trainers")
      .filter((q: any) => q.eq(q.field("email"), trainerId)) // Предполагаем, что trainerId это email
      .first();

    if (!trainer) {
      // Если тренер не найден по email, ищем по другим полям или создаем запись
      console.log(`Trainer with ID ${trainerId} not found`);
      return;
    }

    // Получаем все события тренера
    const events = await ctx.db
      .query("events")
      .withIndex("by_trainer", (q: any) => q.eq("trainerId", trainerId))
      .collect();

    const totalWorkouts = events.length;
    const completedWorkouts = events.filter((e: any) => e.status === "completed").length;

    // Обновляем статистику тренера
    await ctx.db.patch(trainer._id, {
      totalWorkouts,
      lastActivity: new Date().toISOString(),
      updatedAt: Date.now(),
    });

  } catch (error) {
    console.error("Error updating trainer activity:", error);
    // Не прерываем выполнение основной операции
  }
}
