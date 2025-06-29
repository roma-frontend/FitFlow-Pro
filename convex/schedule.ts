// convex/schedule.ts (обновленная версия)
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Получить все события расписания
export const getEvents = query({
  args: {
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
    trainerId: v.optional(v.id("users")),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    console.log("Запрос событий с фильтрами:", args);
    
    let eventsQuery = ctx.db.query("schedule_events");

    // Фильтрация по дате
    if (args.startDate && args.endDate) {
      eventsQuery = eventsQuery.filter((q) =>
        q.and(
          q.gte(q.field("startTime"), args.startDate!),
          q.lte(q.field("startTime"), args.endDate!)
        )
      );
    }

    // Фильтрация по тренеру
    if (args.trainerId) {
      eventsQuery = eventsQuery.filter((q) =>
        q.eq(q.field("trainerId"), args.trainerId!)
      );
    }

    // Фильтрация по статусу
    if (args.status) {
      eventsQuery = eventsQuery.filter((q) =>
        q.eq(q.field("status"), args.status!)
      );
    }

    const events = await eventsQuery.collect();
    console.log("Найдено событий в базе:", events.length);

    // Получаем информацию о тренерах и клиентах
    const enrichedEvents = await Promise.all(
      events.map(async (event) => {
        const trainer = await ctx.db.get(event.trainerId);
        const client = event.clientId ? await ctx.db.get(event.clientId) : null;

        return {
          _id: event._id,
          title: event.title,
          description: event.description,
          type: event.type,
          startTime: event.startTime,
          endTime: event.endTime,
          trainerId: event.trainerId,
          trainerName: trainer?.name || "Неизвестный тренер",
          clientId: event.clientId,
          clientName: client?.name || undefined,
          status: event.status,
          location: event.location,
          notes: event.notes,
          createdAt: event.createdAt,
          createdBy: event.createdBy,
          updatedAt: event.updatedAt,
        };
      })
    );

    console.log("Обогащенные события:", enrichedEvents.length);
    return enrichedEvents;
  },
});

// Создать новое событие
export const createEvent = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    type: v.union(
      v.literal("training"),
      v.literal("consultation"),
      v.literal("group"),
      v.literal("meeting"),
      v.literal("break"),
      v.literal("other")
    ),
    startTime: v.string(),
    endTime: v.string(),
    trainerId: v.id("users"),
    clientId: v.optional(v.id("users")),
    location: v.optional(v.string()),
    notes: v.optional(v.string()),
    recurring: v.optional(v.object({
      pattern: v.union(v.literal("daily"), v.literal("weekly"), v.literal("monthly")),
      interval: v.number(),
      endDate: v.optional(v.string()),
      daysOfWeek: v.optional(v.array(v.number())),
    })),
  },
  handler: async (ctx, args) => {
    console.log("Создание события в Convex:", args);

    // Валидация времени
    const startTime = new Date(args.startTime);
    const endTime = new Date(args.endTime);

    if (endTime <= startTime) {
      throw new Error("Время окончания должно быть позже времени начала");
    }

    // Проверка существования тренера
    const trainer = await ctx.db.get(args.trainerId);
    if (!trainer) {
      throw new Error("Тренер не найден");
    }

    // Проверка существования клиента (если указан)
    if (args.clientId) {
      const client = await ctx.db.get(args.clientId);
      if (!client) {
        throw new Error("Клиент не найден");
      }
    }

    // Проверка конфликтов расписания
    const conflicts = await ctx.db
      .query("schedule_events")
      .filter((q) =>
        q.and(
          q.eq(q.field("trainerId"), args.trainerId),
          q.neq(q.field("status"), "cancelled"),
          q.or(
            q.and(
              q.lte(q.field("startTime"), args.startTime),
              q.gt(q.field("endTime"), args.startTime)
            ),
            q.and(
              q.lt(q.field("startTime"), args.endTime),
              q.gte(q.field("endTime"), args.endTime)
            )
          )
        )
      )
      .collect();

    if (conflicts.length > 0) {
      console.warn("Конфликт расписания:", conflicts);
      throw new Error("Конфликт расписания с существующим событием");
    }

    const eventId = await ctx.db.insert("schedule_events", {
      title: args.title,
      description: args.description,
      type: args.type,
      startTime: args.startTime,
      endTime: args.endTime,
      trainerId: args.trainerId,
      clientId: args.clientId,
      location: args.location,
      notes: args.notes,
      status: "scheduled",
      recurring: args.recurring,
      createdAt: new Date().toISOString(),
      createdBy: "current-user", // TODO: получать из контекста аутентификации
    });

    console.log("Событие создано с ID:", eventId);
    return { success: true, id: eventId };
  },
});

// Обновить событие
export const updateEvent = mutation({
  args: {
    eventId: v.id("schedule_events"),
    updates: v.object({
      title: v.optional(v.string()),
      description: v.optional(v.string()),
      type: v.optional(v.union(
        v.literal("training"),
        v.literal("consultation"),
        v.literal("group"),
        v.literal("meeting"),
        v.literal("break"),
        v.literal("other")
      )),
      startTime: v.optional(v.string()),
      endTime: v.optional(v.string()),
      trainerId: v.optional(v.id("users")),
      clientId: v.optional(v.id("users")),
      location: v.optional(v.string()),
      notes: v.optional(v.string()),
      status: v.optional(v.union(
        v.literal("scheduled"),
        v.literal("confirmed"),
        v.literal("completed"),
        v.literal("cancelled"),
        v.literal("no-show")
      )),
    }),
  },
  handler: async (ctx, args) => {
    console.log("Обновление события:", args.eventId, args.updates);
    
    const event = await ctx.db.get(args.eventId);
    if (!event) {
      throw new Error("Событие не найдено");
    }

    // Валидация времени (если обновляется)
    if (args.updates.startTime && args.updates.endTime) {
      const startTime = new Date(args.updates.startTime);
      const endTime = new Date(args.updates.endTime);

      if (endTime <= startTime) {
        throw new Error("Время окончания должно быть позже времени начала");
      }
    }

    // Фильтруем undefined значения
    const filteredUpdates: any = {};
    Object.entries(args.updates).forEach(([key, value]) => {
      if (value !== undefined) {
        filteredUpdates[key] = value;
      }
    });

    if (Object.keys(filteredUpdates).length > 0) {
      filteredUpdates.updatedAt = new Date().toISOString();
      await ctx.db.patch(args.eventId, filteredUpdates);
    }

    console.log("Событие обновлено");
    return { success: true, id: args.eventId };
  },
});

// Удалить событие
export const deleteEvent = mutation({
  args: { eventId: v.id("schedule_events") },
  handler: async (ctx, args) => {
    console.log("Удаление события:", args.eventId);
    
    const event = await ctx.db.get(args.eventId);
    if (!event) {
      throw new Error("Событие не найдено");
    }

    await ctx.db.delete(args.eventId);
    console.log("Событие удалено");
    return { success: true };
  },
});

// Изменить статус события
export const updateEventStatus = mutation({
  args: {
    eventId: v.id("schedule_events"),
    status: v.union(
      v.literal("scheduled"),
      v.literal("confirmed"),
      v.literal("completed"),
      v.literal("cancelled"),
      v.literal("no-show")
    ),
  },
  handler: async (ctx, args) => {
    console.log("Обновление статуса события:", args.eventId, args.status);
    
    const event = await ctx.db.get(args.eventId);
    if (!event) {
      throw new Error("Событие не найдено");
    }

    await ctx.db.patch(args.eventId, {
      status: args.status,
      updatedAt: new Date().toISOString(),
    });

    console.log("Статус события обновлен");
    return { success: true, id: args.eventId };
  },
});

// Получить тренеров
export const getTrainers = query({
  handler: async (ctx) => {
    console.log("=== Получение тренеров из users ===");
    
    const trainers = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("role"), "trainer"))
      .collect();

    console.log("Найдено тренеров:", trainers.length);
    trainers.forEach((trainer, index) => {
      console.log(`${index + 1}. ${trainer.name} (${trainer.role}) - ID: ${trainer._id}`);
    });

    return trainers;
  },
});

// Получить клиентов
export const getClients = query({
  handler: async (ctx) => {
    const clients = await ctx.db
      .query("users")
      .filter((q) => q.neq(q.field("role"), "trainer")) // Все кроме тренеров
      .collect();

    console.log("Найдено клиентов:", clients.length);
    return clients;
  },
});
// Получить статистику расписания
export const getScheduleStats = query({
  args: {
    period: v.optional(v.string()),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    console.log("Запрос статистики расписания:", args);
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Получаем все события
    const allEvents = await ctx.db.query("schedule_events").collect();
    console.log("Всего событий для статистики:", allEvents.length);
    
    // События за сегодня
    const todayEvents = allEvents.filter(event => {
      const eventDate = new Date(event.startTime);
      return eventDate.toDateString() === today.toDateString();
    });

    // Предстоящие события
    const upcomingEvents = allEvents.filter(event => {
      const eventDate = new Date(event.startTime);
      return eventDate > now && event.status !== "cancelled";
    });

    // Завершенные события
    const completedEvents = allEvents.filter(event => event.status === "completed");

    // Отмененные события
    const cancelledEvents = allEvents.filter(event => event.status === "cancelled");

    // Ожидающие подтверждения
    const pendingConfirmation = allEvents.filter(event => event.status === "scheduled");

    // Просроченные события
    const overdueEvents = allEvents.filter(event => {
      const eventEnd = new Date(event.endTime);
      return eventEnd < now && event.status === "confirmed";
    });

    // Статистика по тренерам
    const trainers = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("role"), "trainer"))
      .collect();

    const byTrainer = trainers.map(trainer => ({
      trainerId: trainer._id,
      trainerName: trainer.name,
      eventCount: allEvents.filter(event => event.trainerId === trainer._id).length,
    }));

    // Статистика по типам
    const byType = {
      training: allEvents.filter(e => e.type === "training").length,
      consultation: allEvents.filter(e => e.type === "consultation").length,
      group: allEvents.filter(e => e.type === "group").length,
      meeting: allEvents.filter(e => e.type === "meeting").length,
      break: allEvents.filter(e => e.type === "break").length,
      other: allEvents.filter(e => e.type === "other").length,
    };

    // Статистика по статусам
    const byStatus = {
      scheduled: allEvents.filter(e => e.status === "scheduled").length,
      confirmed: allEvents.filter(e => e.status === "confirmed").length,
      completed: allEvents.filter(e => e.status === "completed").length,
      cancelled: allEvents.filter(e => e.status === "cancelled").length,
      "no-show": allEvents.filter(e => e.status === "no-show").length,
    };

    // Загруженные часы (примерная оценка)
    const busyHours = Array.from({ length: 12 }, (_, i) => {
      const hour = i + 8; // 8:00 - 19:00
      const eventCount = allEvents.filter(event => {
        const eventHour = new Date(event.startTime).getHours();
        return eventHour === hour;
      }).length;

      return { hour, eventCount };
    });

    // Коэффициент загрузки (примерный расчет)
    const totalPossibleSlots = trainers.length * 12 * 7; // тренеры * часы * дни недели
        const bookedSlots = upcomingEvents.length + todayEvents.length;
    const utilizationRate = totalPossibleSlots > 0 
      ? Math.round((bookedSlots / totalPossibleSlots) * 100) 
      : 0;

    // Средняя продолжительность
    const durations = allEvents.map(event => {
      const start = new Date(event.startTime);
      const end = new Date(event.endTime);
      return (end.getTime() - start.getTime()) / (1000 * 60); // в минутах
    });
    const averageDuration = durations.length > 0 
      ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
      : 60;

    const stats = {
      totalEvents: allEvents.length,
      todayEvents: todayEvents.length,
      upcomingEvents: upcomingEvents.length,
      completedEvents: completedEvents.length,
      cancelledEvents: cancelledEvents.length,
      pendingConfirmation: pendingConfirmation.length,
      overdueEvents: overdueEvents.length,
      byTrainer,
      byType,
      byStatus,
      utilizationRate,
      averageDuration,
      busyHours,
    };

    console.log("Статистика сформирована:", {
      totalEvents: stats.totalEvents,
      todayEvents: stats.todayEvents,
      trainersCount: trainers.length,
    });

    return stats;
  },
});

