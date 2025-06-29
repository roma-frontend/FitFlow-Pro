// convex/workouts.ts (адаптированная версия под вашу реальную схему)
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Получение всех тренировок
export const getAll = query({
    args: {
        limit: v.optional(v.number()),
        offset: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const workouts = await ctx.db
            .query("workouts")
            .order("desc")
            .take(args.limit || 100);

        return workouts;
    },
});

// Получение тренировок по тренеру
export const getByTrainer = query({
    args: {
        trainerId: v.id("trainers"),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const workouts = await ctx.db
            .query("workouts")
            .filter((q) => q.eq(q.field("trainerId"), args.trainerId))
            .order("desc")
            .take(args.limit || 100);

        return workouts;
    },
});

// Получение тренировок по пользователю
export const getByUser = query({
    args: {
        userId: v.id("users"),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const workouts = await ctx.db
            .query("workouts")
            .filter((q) => q.eq(q.field("userId"), args.userId))
            .order("desc")
            .take(args.limit || 100);

        return workouts;
    },
});

// Получение тренировок по дате (используем _creationTime)
export const getByDate = query({
    args: {
        date: v.string(), // Формат: YYYY-MM-DD
        trainerId: v.optional(v.id("trainers")),
    },
    handler: async (ctx, args) => {
        const targetDate = new Date(args.date);
        const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0)).getTime();
        const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999)).getTime();

        let workouts = await ctx.db.query("workouts").collect();

        // Фильтруем по дате (используем только _creationTime)
        workouts = workouts.filter(workout => {
            return workout._creationTime >= startOfDay && workout._creationTime <= endOfDay;
        });

        // Фильтруем по тренеру если указан
        if (args.trainerId) {
            workouts = workouts.filter(w => w.trainerId === args.trainerId);
        }

        // Сортируем по времени
        return workouts.sort((a, b) => a._creationTime - b._creationTime);
    },
});

// Создание тренировки (только с доступными полями)
export const create = mutation({
    args: {
        trainerId: v.id("trainers"),
        userId: v.id("users"),
        type: v.string(),
        duration: v.optional(v.number()),
        price: v.optional(v.number()),
        status: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const workoutId = await ctx.db.insert("workouts", {
            trainerId: args.trainerId,
            userId: args.userId,
            type: args.type,
            duration: args.duration || 60,
            price: args.price || 0,
            status: args.status || "scheduled",
        });

        return workoutId;
    },
});

// Обновление тренировки (только доступные поля)
export const update = mutation({
    args: {
        workoutId: v.id("workouts"),
        type: v.optional(v.string()),
        duration: v.optional(v.number()),
        price: v.optional(v.number()),
        status: v.optional(v.union(
            v.literal("scheduled"),
            v.literal("in-progress"),
            v.literal("completed"),
            v.literal("cancelled"),
            v.literal("missed")
        )),
    },
    handler: async (ctx, args) => {
        const { workoutId, ...updates } = args;

        // Фильтруем undefined значения
        const cleanUpdates: any = {};
        Object.entries(updates).forEach(([key, value]) => {
            if (value !== undefined) {
                cleanUpdates[key] = value;
            }
        });

        await ctx.db.patch(workoutId, cleanUpdates);
        return { success: true };
    },
});

// Отметка тренировки как завершенной
export const markCompleted = mutation({
    args: {
        workoutId: v.id("workouts"),
        // Убираем exercises и notes, так как их нет в схеме
        actualDuration: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const updates: any = {
            status: "completed",
        };

        if (args.actualDuration) {
            updates.duration = args.actualDuration;
        }

        await ctx.db.patch(args.workoutId, updates);
        return { success: true };
    },
});

// Получение статистики тренировок
export const getStats = query({
    args: {
        trainerId: v.optional(v.id("trainers")),
        userId: v.optional(v.id("users")),
        startDate: v.optional(v.string()),
        endDate: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        let workouts = await ctx.db.query("workouts").collect();

        // Фильтрация по тренеру
        if (args.trainerId) {
            workouts = workouts.filter(w => w.trainerId === args.trainerId);
        }

        // Фильтрация по пользователю
        if (args.userId) {
            workouts = workouts.filter(w => w.userId === args.userId);
        }

        // Фильтрация по датам (используем _creationTime)
        if (args.startDate) {
            const startTimestamp = new Date(args.startDate).getTime();
            workouts = workouts.filter(w => w._creationTime >= startTimestamp);
        }

        if (args.endDate) {
            const endTimestamp = new Date(args.endDate + "T23:59:59.999Z").getTime();
            workouts = workouts.filter(w => w._creationTime <= endTimestamp);
        }

        const stats = {
            total: workouts.length,
            completed: workouts.filter(w => w.status === "completed").length,
            scheduled: workouts.filter(w => w.status === "scheduled").length,
            cancelled: workouts.filter(w => w.status === "cancelled").length,
            missed: workouts.filter(w => w.status === "missed").length,
            inProgress: workouts.filter(w => w.status === "in-progress").length,
            byType: {} as Record<string, number>,
            totalDuration: workouts.reduce((sum, w) => sum + (w.duration || 0), 0),
            totalRevenue: workouts
                .filter(w => w.status === "completed")
                .reduce((sum, w) => sum + (w.price || 0), 0),
            averageDuration: 0,
            averagePrice: 0,
        };

        // Статистика по типам
        workouts.forEach(workout => {
            const type = workout.type || 'unknown';
            stats.byType[type] = (stats.byType[type] || 0) + 1;
        });

        // Средние значения
        if (stats.completed > 0) {
            const completedWorkouts = workouts.filter(w => w.status === "completed");
            stats.averageDuration = completedWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0) / completedWorkouts.length;
            stats.averagePrice = completedWorkouts.reduce((sum, w) => sum + (w.price || 0), 0) / completedWorkouts.length;
        }

        return stats;
    },
});

// Получение расписания на неделю
export const getWeeklySchedule = query({
    args: {
        weekStart: v.string(),
        trainerId: v.optional(v.id("trainers")),
    },
    handler: async (ctx, args) => {
        const startDate = new Date(args.weekStart);
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
        endDate.setHours(23, 59, 59, 999);

        const startTimestamp = startDate.getTime();
        const endTimestamp = endDate.getTime();

        let workouts = await ctx.db.query("workouts").collect();

        // Фильтруем по неделе (используем _creationTime)
        workouts = workouts.filter(w => {
            return w._creationTime >= startTimestamp && w._creationTime <= endTimestamp;
        });

        // Фильтруем по тренеру
        if (args.trainerId) {
            workouts = workouts.filter(w => w.trainerId === args.trainerId);
        }

        // Группируем по дням
        const schedule: Record<string, any[]> = {};

        for (let i = 0; i < 7; i++) {
            const currentDate = new Date(startDate);
            currentDate.setDate(startDate.getDate() + i);
            const dateStr = currentDate.toISOString().split('T')[0];

            const dayStart = new Date(currentDate).setHours(0, 0, 0, 0);
            const dayEnd = new Date(currentDate).setHours(23, 59, 59, 999);

            schedule[dateStr] = workouts
                .filter(w => w._creationTime >= dayStart && w._creationTime <= dayEnd)
                .sort((a, b) => a._creationTime - b._creationTime);
        }

        return schedule;
    },
});

// Получение тренировок на сегодня
export const getTodayWorkouts = query({
    args: {
        trainerId: v.optional(v.id("trainers")),
    },
    handler: async (ctx, args) => {
        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0)).getTime();
        const endOfDay = new Date(today.setHours(23, 59, 59, 999)).getTime();

        let workouts = await ctx.db.query("workouts").collect();

        // Фильтруем по сегодняшней дате
        workouts = workouts.filter(w => {
            return w._creationTime >= startOfDay && w._creationTime <= endOfDay;
        });

        // Фильтруем по тренеру если указан
        if (args.trainerId) {
            workouts = workouts.filter(w => w.trainerId === args.trainerId);
        }

        // Сортируем по времени
        return workouts.sort((a, b) => a._creationTime - b._creationTime);
    },
});

// Получение тренировки по ID
export const getById = query({
    args: { workoutId: v.id("workouts") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.workoutId);
    },
});

// Отмена тренировки
export const cancel = mutation({
    args: {
        workoutId: v.id("workouts"),
        reason: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.workoutId, {
            status: "cancelled",
        });
        return { success: true };
    },
});

// Перенос тренировки (упрощенная версия)
export const reschedule = mutation({
    args: {
        workoutId: v.id("workouts"),
        reason: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const workout = await ctx.db.get(args.workoutId);
        if (!workout) {
            throw new Error("Тренировка не найдена");
        }

        // Просто обновляем статус, так как нет полей для времени
        await ctx.db.patch(args.workoutId, {
            status: "scheduled",
        });

        return { success: true };
    },
});

// Начать тренировку
export const startWorkout = mutation({
    args: {
        workoutId: v.id("workouts"),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.workoutId, {
            status: "in-progress",
        });
        return { success: true };
    },
});

// Получение статистики по месяцам
export const getMonthlyStats = query({
    args: {
        year: v.number(),
        trainerId: v.optional(v.id("trainers")),
    },
    handler: async (ctx, args) => {
        let workouts = await ctx.db.query("workouts").collect();

        // Фильтруем по тренеру
        if (args.trainerId) {
            workouts = workouts.filter(w => w.trainerId === args.trainerId);
        }

        // Фильтруем по году и группируем по месяцам
        const monthlyStats = Array.from({ length: 12 }, (_, month) => {
            const monthStart = new Date(args.year, month, 1).getTime();
            const monthEnd = new Date(args.year, month + 1, 0, 23, 59, 59, 999).getTime();

            const monthWorkouts = workouts.filter(w => {
                return w._creationTime >= monthStart && w._creationTime <= monthEnd;
            });

            return {
                month: month + 1,
                monthName: new Date(args.year, month).toLocaleString('ru-RU', { month: 'long' }),
                total: monthWorkouts.length,
                completed: monthWorkouts.filter(w => w.status === "completed").length,
                cancelled: monthWorkouts.filter(w => w.status === "cancelled").length,
                revenue: monthWorkouts
                    .filter(w => w.status === "completed")
                    .reduce((sum, w) => sum + (w.price || 0), 0),
                totalDuration: monthWorkouts
                    .filter(w => w.status === "completed")
                    .reduce((sum, w) => sum + (w.duration || 0), 0),
            };
        });

        return monthlyStats;
    },
});

export const search = query({
    args: {
        query: v.string(),
        trainerId: v.optional(v.id("trainers")),
        status: v.optional(v.string()),
        type: v.optional(v.string()),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        let workouts = await ctx.db.query("workouts").collect();

        // Фильтруем по тренеру
        if (args.trainerId) {
            workouts = workouts.filter(w => w.trainerId === args.trainerId);
        }

        // Фильтруем по статусу
        if (args.status) {
            workouts = workouts.filter(w => w.status === args.status);
        }

        // Фильтруем по типу
        if (args.type) {
            workouts = workouts.filter(w => w.type === args.type);
        }

        // Поиск по тексту (только в типе, так как других текстовых полей нет)
        if (args.query) {
            const searchQuery = args.query.toLowerCase();
            workouts = workouts.filter(w => 
                w.type?.toLowerCase().includes(searchQuery)
            );
        }

        // Сортируем по дате (новые сначала)
        workouts.sort((a, b) => b._creationTime - a._creationTime);

        return workouts.slice(0, args.limit || 50);
    },
});

// Удаление тренировки
export const remove = mutation({
    args: { workoutId: v.id("workouts") },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.workoutId);
        return { success: true };
    },
});

// Получение активных тренировок
export const getActiveWorkouts = query({
    args: {
        trainerId: v.optional(v.id("trainers")),
        userId: v.optional(v.id("users")),
    },
    handler: async (ctx, args) => {
        let workouts = await ctx.db.query("workouts").collect();

        // Фильтруем только активные статусы
        workouts = workouts.filter(w => 
            w.status === "scheduled" || w.status === "in-progress"
        );

        // Фильтруем по тренеру
        if (args.trainerId) {
            workouts = workouts.filter(w => w.trainerId === args.trainerId);
        }

        // Фильтруем по пользователю
        if (args.userId) {
            workouts = workouts.filter(w => w.userId === args.userId);
        }

        return workouts.sort((a, b) => a._creationTime - b._creationTime);
    },
});

// Получение завершенных тренировок
export const getCompletedWorkouts = query({
    args: {
        trainerId: v.optional(v.id("trainers")),
        userId: v.optional(v.id("users")),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        let workouts = await ctx.db.query("workouts").collect();

        // Фильтруем только завершенные
        workouts = workouts.filter(w => w.status === "completed");

        // Фильтруем по тренеру
        if (args.trainerId) {
            workouts = workouts.filter(w => w.trainerId === args.trainerId);
        }

        // Фильтруем по пользователю
        if (args.userId) {
            workouts = workouts.filter(w => w.userId === args.userId);
        }

        // Сортируем по дате (новые сначала)
        workouts.sort((a, b) => b._creationTime - a._creationTime);

        return workouts.slice(0, args.limit || 50);
    },
});

// Получение статистики тренера
export const getTrainerStats = query({
    args: {
        trainerId: v.id("trainers"),
        period: v.optional(v.union(
            v.literal("week"),
            v.literal("month"),
            v.literal("year"),
            v.literal("all")
        )),
    },
    handler: async (ctx, args) => {
        let workouts = await ctx.db.query("workouts").collect();

        // Фильтруем по тренеру
        workouts = workouts.filter(w => w.trainerId === args.trainerId);

        // Фильтруем по периоду
        if (args.period && args.period !== "all") {
            const now = Date.now();
            let startTime = 0;

            switch (args.period) {
                case "week":
                    startTime = now - (7 * 24 * 60 * 60 * 1000);
                    break;
                case "month":
                    startTime = now - (30 * 24 * 60 * 60 * 1000);
                    break;
                case "year":
                    startTime = now - (365 * 24 * 60 * 60 * 1000);
                    break;
            }

            workouts = workouts.filter(w => w._creationTime >= startTime);
        }

        const stats = {
            total: workouts.length,
            completed: workouts.filter(w => w.status === "completed").length,
            scheduled: workouts.filter(w => w.status === "scheduled").length,
            cancelled: workouts.filter(w => w.status === "cancelled").length,
            inProgress: workouts.filter(w => w.status === "in-progress").length,
            totalRevenue: workouts
                .filter(w => w.status === "completed")
                .reduce((sum, w) => sum + (w.price || 0), 0),
            totalDuration: workouts
                .filter(w => w.status === "completed")
                .reduce((sum, w) => sum + (w.duration || 0), 0),
            averagePrice: 0,
            averageDuration: 0,
            completionRate: 0,
            byType: {} as Record<string, number>,
        };

        // Вычисляем средние значения
        const completedWorkouts = workouts.filter(w => w.status === "completed");
        if (completedWorkouts.length > 0) {
            stats.averagePrice = stats.totalRevenue / completedWorkouts.length;
            stats.averageDuration = stats.totalDuration / completedWorkouts.length;
        }

        // Вычисляем процент завершения
        if (stats.total > 0) {
            stats.completionRate = Math.round((stats.completed / stats.total) * 100);
        }

        // Статистика по типам
        workouts.forEach(workout => {
            const type = workout.type || 'unknown';
            stats.byType[type] = (stats.byType[type] || 0) + 1;
        });

        return stats;
    },
});

// Массовое обновление статуса тренировок
export const bulkUpdateStatus = mutation({
    args: {
        workoutIds: v.array(v.id("workouts")),
        status: v.union(
            v.literal("scheduled"),
            v.literal("in-progress"),
            v.literal("completed"),
            v.literal("cancelled"),
            v.literal("missed")
        ),
    },
    handler: async (ctx, args) => {
        const results = [];

        for (const workoutId of args.workoutIds) {
            try {
                await ctx.db.patch(workoutId, {
                    status: args.status,
                });
                results.push({ workoutId, success: true });
            } catch (error) {
                results.push({ workoutId, success: false, error: String(error) });
            }
        }

        return {
            success: true,
            results,
            updated: results.filter(r => r.success).length,
            failed: results.filter(r => !r.success).length,
        };
    },
});

// Получение тренировок за последние N дней
export const getRecentWorkouts = query({
    args: {
        days: v.number(),
        trainerId: v.optional(v.id("trainers")),
        userId: v.optional(v.id("users")),
        status: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const cutoffTime = Date.now() - (args.days * 24 * 60 * 60 * 1000);
        
        let workouts = await ctx.db.query("workouts").collect();

        // Фильтруем по дате
        workouts = workouts.filter(w => w._creationTime >= cutoffTime);

        // Фильтруем по тренеру
        if (args.trainerId) {
            workouts = workouts.filter(w => w.trainerId === args.trainerId);
        }

        // Фильтруем по пользователю
        if (args.userId) {
            workouts = workouts.filter(w => w.userId === args.userId);
        }

        // Фильтруем по статусу
        if (args.status) {
            workouts = workouts.filter(w => w.status === args.status);
        }

        return workouts.sort((a, b) => b._creationTime - a._creationTime);
    },
});

// Получение количества тренировок по дням недели
export const getWorkoutsByDayOfWeek = query({
    args: {
        trainerId: v.optional(v.id("trainers")),
        weeks: v.optional(v.number()), // Количество недель назад для анализа
    },
    handler: async (ctx, args) => {
        const weeksBack = args.weeks || 4; // По умолчанию 4 недели
        const cutoffTime = Date.now() - (weeksBack * 7 * 24 * 60 * 60 * 1000);
        
        let workouts = await ctx.db.query("workouts").collect();

        // Фильтруем по дате
        workouts = workouts.filter(w => w._creationTime >= cutoffTime);

        // Фильтруем по тренеру
        if (args.trainerId) {
            workouts = workouts.filter(w => w.trainerId === args.trainerId);
        }

        // Группируем по дням недели
        const dayStats = {
            Monday: 0,
            Tuesday: 0,
            Wednesday: 0,
            Thursday: 0,
            Friday: 0,
            Saturday: 0,
            Sunday: 0,
        };

        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

        workouts.forEach(workout => {
            const date = new Date(workout._creationTime);
            const dayName = dayNames[date.getDay()];
            dayStats[dayName as keyof typeof dayStats]++;
        });

        return dayStats;
    },
});