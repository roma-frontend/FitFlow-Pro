// convex/sync.ts - Исправленный файл для управления синхронизацией
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Определяем union типов сущностей согласно схеме
const entityTypeUnion = v.union(
    v.literal("messages"),
    v.literal("users"),
    v.literal("trainers"),
    v.literal("clients"),
    v.literal("events"),
    v.literal("schedule_events"), // Исправлено: было "scheduleEvents"
    v.literal("products"),
    v.literal("orders"),
    v.literal("bookings"),
    v.literal("members"),
    v.literal("staff"),
    v.literal("notifications"),
    v.literal("classes"),
    v.literal("visits"),
    v.literal("purchases"),
    v.literal("workouts"),
    v.literal("memberships"),
    v.literal("global")
);

// Получение статуса синхронизации
export const getSyncStatus = query({
    args: {
        entityType: v.optional(entityTypeUnion),
        userId: v.optional(v.string()) // Изменено на string для гибкости
    },
    handler: async (ctx, args) => {
        let syncLogs;

        try {
            if (args.entityType && args.userId) {
                syncLogs = await ctx.db
                    .query("syncLog")
                    .withIndex("entity_timestamp", (q) =>
                        q.eq("entityType", args.entityType!)
                    )
                    .filter((q) => q.eq(q.field("userId"), args.userId!))
                    .order("desc")
                    .take(100);
            } else if (args.entityType) {
                syncLogs = await ctx.db
                    .query("syncLog")
                    .withIndex("entity_timestamp", (q) =>
                        q.eq("entityType", args.entityType!)
                    )
                    .order("desc")
                    .take(100);
            } else if (args.userId) {
                syncLogs = await ctx.db
                    .query("syncLog")
                    .withIndex("user_timestamp", (q) =>
                        q.eq("userId", args.userId!)
                    )
                    .order("desc")
                    .take(100);
            } else {
                syncLogs = await ctx.db
                    .query("syncLog")
                    .withIndex("by_timestamp")
                    .order("desc")
                    .take(100);
            }

            // Группируем по типу сущности
            const statusByEntity = syncLogs.reduce((acc, log) => {
                if (!acc[log.entityType]) {
                    acc[log.entityType] = {
                        lastSync: 0,
                        pendingChanges: 0,
                        conflicts: 0,
                        totalOperations: 0
                    };
                }

                acc[log.entityType].totalOperations++;

                if (log.timestamp > acc[log.entityType].lastSync) {
                    acc[log.entityType].lastSync = log.timestamp;
                }

                if (log.action === "conflict") {
                    acc[log.entityType].conflicts++;
                }

                return acc;
            }, {} as Record<string, any>);

            return {
                statusByEntity,
                totalLogs: syncLogs.length,
                lastActivity: syncLogs.length > 0 ? syncLogs[0].timestamp : 0
            };
        } catch (error) {
            console.error("Ошибка получения статуса синхронизации:", error);
            return {
                statusByEntity: {},
                totalLogs: 0,
                lastActivity: 0,
                error: error instanceof Error ? error.message : "Неизвестная ошибка"
            };
        }
    }
});

// Логирование операции синхронизации
export const logSyncOperation = mutation({
    args: {
        entityType: entityTypeUnion,
        entityId: v.string(),
        action: v.union(
            v.literal("create"),
            v.literal("update"),
            v.literal("delete"),
            v.literal("conflict"),
            v.literal("sync")
        ),
        userId: v.string(), // Изменено на string
        oldData: v.optional(v.any()),
        newData: v.optional(v.any()),
        conflictResolution: v.optional(v.union(
            v.literal("server"),
            v.literal("client"),
            v.literal("manual")
        )),
        metadata: v.optional(v.record(v.string(), v.any())),
        syncSource: v.optional(v.union(
            v.literal("convex"),
            v.literal("api"),
            v.literal("client")
        )),
        batchId: v.optional(v.string()),
        retryCount: v.optional(v.number()),
        errorMessage: v.optional(v.string())
    },
    handler: async (ctx, args) => {
        try {
            const logId = await ctx.db.insert("syncLog", {
                entityType: args.entityType,
                entityId: args.entityId,
                action: args.action,
                userId: args.userId,
                timestamp: Date.now(),
                oldData: args.oldData,
                newData: args.newData,
                conflictResolution: args.conflictResolution,
                metadata: args.metadata,
                syncSource: args.syncSource,
                batchId: args.batchId,
                retryCount: args.retryCount || 0,
                errorMessage: args.errorMessage
            });

            return { success: true, logId };
        } catch (error) {
            console.error("Ошибка логирования операции синхронизации:", error);
            throw new Error(`Не удалось записать лог синхронизации: ${error instanceof Error ? error.message : "Неизвестная ошибка"}`);
        }
    }
});

// Разрешение конфликта
export const resolveConflict = mutation({
    args: {
        entityType: entityTypeUnion,
        entityId: v.string(),
        resolution: v.union(
            v.literal("server"),
            v.literal("client"),
            v.literal("manual")
        ),
        resolvedData: v.any(),
        userId: v.string() // Изменено на string
    },
    handler: async (ctx, args) => {
        try {
            // Маппинг типов сущностей к именам таблиц
            const tableNameMap: Record<string, string> = {
                "schedule_events": "schedule_events",
                "messages": "messages",
                "users": "users",
                "trainers": "trainers",
                "clients": "clients",
                "events": "events",
                "products": "products",
                "orders": "orders",
                "bookings": "bookings",
                "members": "members",
                "staff": "staff",
                "notifications": "notifications",
                "classes": "classes",
                "visits": "visits",
                "purchases": "purchases",
                "workouts": "workouts",
                "memberships": "memberships"
            };

            const tableName = tableNameMap[args.entityType];
            if (!tableName) {
                throw new Error(`Неизвестный тип сущности: ${args.entityType}`);
            }

            // Получаем текущую запись
            const currentRecord = await ctx.db
                .query(tableName as any)
                .filter((q) => q.eq(q.field("_id"), args.entityId))
                .first();

            if (!currentRecord) {
                throw new Error("Сущность не найдена");
            }

            // Обновляем сущность с разрешенными данными
            await ctx.db.patch(currentRecord._id, {
                ...args.resolvedData,
                _version: (currentRecord._version || 0) + 1,
                _lastSync: Date.now(),
                _isDirty: false
            });

            // Логируем разрешение конфликта
            await ctx.db.insert("syncLog", {
                entityType: args.entityType,
                entityId: args.entityId,
                action: "conflict",
                userId: args.userId,
                timestamp: Date.now(),
                conflictResolution: args.resolution,
                newData: args.resolvedData,
                metadata: { resolved: true, resolvedAt: Date.now() }
            });

            return { success: true, newVersion: (currentRecord._version || 0) + 1 };
        } catch (error) {
            console.error("Ошибка разрешения конфликта:", error);
            throw new Error(`Не удалось разрешить конфликт: ${error instanceof Error ? error.message : "Неизвестная ошибка"}`);
        }
    }
});

// Получение конфликтов для пользователя
export const getConflicts = query({
    args: {
        userId: v.optional(v.string()),
        entityType: v.optional(entityTypeUnion)
    },
    handler: async (ctx, args) => {
        try {
            let conflicts;

            if (args.entityType) {
                conflicts = await ctx.db
                    .query("syncLog")
                    .withIndex("entity_action", (q) =>
                        q.eq("entityType", args.entityType!).eq("action", "conflict")
                    )
                    .order("desc")
                    .take(50);
            } else {
                conflicts = await ctx.db
                    .query("syncLog")
                    .withIndex("by_action", (q) => q.eq("action", "conflict"))
                    .order("desc")
                    .take(50);
            }

            if (args.userId) {
                conflicts = conflicts.filter(conflict => conflict.userId === args.userId);
            }

            // Фильтруем только неразрешенные конфликты
            const unresolvedConflicts = conflicts.filter(conflict =>
                !conflict.metadata?.resolved
            );

            return unresolvedConflicts;
        } catch (error) {
            console.error("Ошибка получения конфликтов:", error);
            return [];
        }
    }
});

// Массовое разрешение конфликтов
export const bulkResolveConflicts = mutation({
    args: {
        conflictIds: v.array(v.id("syncLog")),
        resolution: v.union(
            v.literal("server"),
            v.literal("client"),
            v.literal("manual")
        ),
        userId: v.string()
    },
    handler: async (ctx, args) => {
        const results = [];

        for (const conflictId of args.conflictIds) {
            try {
                const conflict = await ctx.db.get(conflictId);
                if (!conflict) {
                    results.push({ conflictId, success: false, error: "Конфликт не найден" });
                    continue;
                }

                // Отмечаем конфликт как разрешенный
                await ctx.db.patch(conflictId, {
                    conflictResolution: args.resolution,
                    metadata: {
                        ...conflict.metadata,
                        resolved: true,
                        resolvedAt: Date.now(),
                        resolvedBy: args.userId
                    }
                });

                results.push({ conflictId, success: true });
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : "Неизвестная ошибка";
                results.push({ conflictId, success: false, error: errorMessage });
            }
        }

        return { results, totalProcessed: results.length };
    }
});

// Очистка старых логов синхронизации
export const cleanupSyncLogs = mutation({
    args: {
        olderThanDays: v.number(),
        keepConflicts: v.optional(v.boolean())
    },
    handler: async (ctx, args) => {
        try {
            const cutoffTime = Date.now() - (args.olderThanDays * 24 * 60 * 60 * 1000);

            const oldLogs = await ctx.db
                .query("syncLog")
                .withIndex("by_timestamp", (q) => q.lt("timestamp", cutoffTime))
                .collect();

            let deletedCount = 0;

            for (const log of oldLogs) {
                // Если keepConflicts = true, не удаляем неразрешенные конфликты
                if (args.keepConflicts && log.action === "conflict" && !log.metadata?.resolved) {
                    continue;
                }

                await ctx.db.delete(log._id);
                deletedCount++;
            }

            return { success: true, deletedCount, totalFound: oldLogs.length };
        } catch (error) {
            console.error("Ошибка очистки логов синхронизации:", error);
            throw new Error(`Не удалось очистить логи: ${error instanceof Error ? error.message : "Неизвестная ошибка"}`);
        }
    }
});

// Получение метрик синхронизации
export const getSyncMetrics = query({
    args: {
        timeRange: v.optional(v.union(
            v.literal("1h"),
            v.literal("24h"),
            v.literal("7d"),
            v.literal("30d")
        ))
    },
    handler: async (ctx, args) => {
        try {
            const timeRangeMs = {
                "1h": 60 * 60 * 1000,
                "24h": 24 * 60 * 60 * 1000,
                "7d": 7 * 24 * 60 * 60 * 1000,
                "30d": 30 * 24 * 60 * 60 * 1000
            };

            const cutoffTime = args.timeRange
                ? Date.now() - timeRangeMs[args.timeRange]
                : 0;

            const logs = await ctx.db
                .query("syncLog")
                .withIndex("by_timestamp", (q) => q.gte("timestamp", cutoffTime))
                .collect();

            const metrics = {
                totalOperations: logs.length,
                operationsByType: {} as Record<string, number>,
                operationsByEntity: {} as Record<string, number>,
                conflictsCount: 0,
                resolvedConflicts: 0,
                unresolvedConflicts: 0,
                averageOperationsPerHour: 0,
                peakHour: null as string | null,
                operationsByHour: {} as Record<string, number>
            };

            logs.forEach(log => {
                // Подсчет по типу операции
                metrics.operationsByType[log.action] = (metrics.operationsByType[log.action] || 0) + 1;

                // Подсчет по типу сущности
                metrics.operationsByEntity[log.entityType] = (metrics.operationsByEntity[log.entityType] || 0) + 1;

                // Подсчет конфликтов
                if (log.action === "conflict") {
                    metrics.conflictsCount++;
                    if (log.metadata?.resolved) {
                        metrics.resolvedConflicts++;
                    } else {
                        metrics.unresolvedConflicts++;
                    }
                }

                // Подсчет по часам
                const hour = new Date(log.timestamp).getHours().toString().padStart(2, '0');
                metrics.operationsByHour[hour] = (metrics.operationsByHour[hour] || 0) + 1;
            });

            // Вычисляем среднее количество операций в час
            const hoursInRange = args.timeRange
                ? Math.min(timeRangeMs[args.timeRange] / (60 * 60 * 1000), 24)
                : 24;
            metrics.averageOperationsPerHour = hoursInRange > 0 ? metrics.totalOperations / hoursInRange : 0;

            // Находим пиковый час
            let maxOperations = 0;
            Object.entries(metrics.operationsByHour).forEach(([hour, count]) => {
                if (count > maxOperations) {
                    maxOperations = count;
                    metrics.peakHour = `${hour}:00`;
                }
            });

            return metrics;
        } catch (error) {
            console.error("Ошибка получения метрик синхронизации:", error);
            return {
                totalOperations: 0,
                operationsByType: {},
                operationsByEntity: {},
                conflictsCount: 0,
                resolvedConflicts: 0,
                unresolvedConflicts: 0,
                averageOperationsPerHour: 0,
                peakHour: null,
                operationsByHour: {},
                error: error instanceof Error ? error.message : "Неизвестная ошибка"
            };
        }
    }
});

// Принудительная синхронизация сущности
export const forceSyncEntity = mutation({
    args: {
        entityType: entityTypeUnion,
        entityId: v.string(),
        userId: v.string(),
        forceOverwrite: v.optional(v.boolean())
    },
    handler: async (ctx, args) => {
        try {
            // Маппинг типов сущностей к именам таблиц
            const tableNameMap: Record<string, string> = {
                "schedule_events": "schedule_events",
                "messages": "messages",
                "users": "users",
                "trainers": "trainers",
                "clients": "clients",
                "events": "events",
                "products": "products",
                "orders": "orders",
                "bookings": "bookings",
                "members": "members",
                "staff": "staff",
                "notifications": "notifications",
                "classes": "classes",
                "visits": "visits",
                "purchases": "purchases",
                "workouts": "workouts",
                "memberships": "memberships"
            };

            const tableName = tableNameMap[args.entityType];
            if (!tableName) {
                throw new Error(`Неизвестный тип сущности: ${args.entityType}`);
            }

            // Получаем текущую запись
            const currentRecord = await ctx.db
                .query(tableName as any)
                .filter((q) => q.eq(q.field("_id"), args.entityId))
                .first();

            if (!currentRecord) {
                throw new Error("Сущность не найдена");
            }

            // Обновляем метаданные синхронизации
            const newVersion = (currentRecord._version || 0) + 1;
            await ctx.db.patch(currentRecord._id, {
                _version: newVersion,
                _lastSync: Date.now(),
                _isDirty: false
            });

            // Логируем принудительную синхронизацию
            await ctx.db.insert("syncLog", {
                entityType: args.entityType,
                entityId: args.entityId,
                action: "sync",
                userId: args.userId,
                timestamp: Date.now(),
                metadata: {
                    forceSync: true,
                    forceOverwrite: args.forceOverwrite || false,
                    previousVersion: currentRecord._version || 0
                }
            });

            return { success: true, newVersion };
        } catch (error) {
            console.error("Ошибка принудительной синхронизации:", error);
            throw new Error(`Не удалось выполнить принудительную синхронизацию: ${error instanceof Error ? error.message : "Неизвестная ошибка"}`);
        }
    }
});

// Получение истории изменений сущности
export const getEntityHistory = query({
    args: {
        entityType: entityTypeUnion,
        entityId: v.string(),
        limit: v.optional(v.number())
    },
    handler: async (ctx, args) => {
        try {
            const history = await ctx.db
                .query("syncLog")
                .withIndex("by_entity", (q) =>
                    q.eq("entityType", args.entityType).eq("entityId", args.entityId)
                )
                .order("desc")
                .take(args.limit || 50);

            return history.map(log => ({
                _id: log._id,
                timestamp: log.timestamp,
                action: log.action,
                userId: log.userId,
                oldData: log.oldData,
                newData: log.newData,
                conflictResolution: log.conflictResolution,
                metadata: log.metadata,
                syncSource: log.syncSource,
                batchId: log.batchId,
                retryCount: log.retryCount,
                errorMessage: log.errorMessage
            }));
        } catch (error) {
            console.error("Ошибка получения истории сущности:", error);
            return [];
        }
    }
});

// Получение статуса синхронизации по типам сущностей
export const getSyncStatusByEntity = query({
    args: {},
    handler: async (ctx) => {
        try {
            const syncStatuses = await ctx.db
                .query("syncStatus")
                .collect();

            const statusMap: Record<string, any> = {};

            syncStatuses.forEach(status => {
                statusMap[status.entityType] = {
                    lastSyncTime: status.lastSyncTime,
                    totalRecords: status.totalRecords,
                    syncedRecords: status.syncedRecords,
                    pendingRecords: status.pendingRecords,
                    conflictedRecords: status.conflictedRecords,
                    errorCount: status.errorCount,
                    isHealthy: status.isHealthy,
                    lastError: status.lastError,
                    avgSyncTime: status.avgSyncTime,
                    metadata: status.metadata
                };
            });

            return statusMap;
        } catch (error) {
            console.error("Ошибка получения статуса синхронизации по сущностям:", error);
            return {};
        }
    }
});

// Обновление статуса синхронизации
export const updateSyncStatus = mutation({
    args: {
        entityType: entityTypeUnion,
        totalRecords: v.number(),
        syncedRecords: v.number(),
        pendingRecords: v.number(),
        conflictedRecords: v.number(),
        errorCount: v.number(),
        isHealthy: v.boolean(),
        lastError: v.optional(v.string()),
        avgSyncTime: v.optional(v.number()),
        metadata: v.optional(v.record(v.string(), v.any()))
    },
    handler: async (ctx, args) => {
        try {
            const existingStatus = await ctx.db
                .query("syncStatus")
                .withIndex("by_entity", (q) => q.eq("entityType", args.entityType))
                .first();

            const statusData = {
                entityType: args.entityType,
                lastSyncTime: Date.now(),
                totalRecords: args.totalRecords,
                syncedRecords: args.syncedRecords,
                pendingRecords: args.pendingRecords,
                conflictedRecords: args.conflictedRecords,
                errorCount: args.errorCount,
                isHealthy: args.isHealthy,
                lastError: args.lastError,
                avgSyncTime: args.avgSyncTime,
                metadata: args.metadata
            };

            if (existingStatus) {
                await ctx.db.patch(existingStatus._id, statusData);
                return { success: true, updated: true, statusId: existingStatus._id };
            } else {
                const statusId = await ctx.db.insert("syncStatus", statusData);
                return { success: true, updated: false, statusId };
            }
        } catch (error) {
            console.error("Ошибка обновления статуса синхронизации:", error);
            throw new Error(`Не удалось обновить статус синхронизации: ${error instanceof Error ? error.message : "Неизвестная ошибка"}`);
        }
    }
});

// Создание пакета синхронизации
export const createSyncBatch = mutation({
    args: {
        batchId: v.string(),
        entityType: entityTypeUnion,
        operation: v.union(
            v.literal("full_sync"),
            v.literal("incremental_sync"),
            v.literal("conflict_resolution"),
            v.literal("cleanup")
        ),
        totalRecords: v.number(),
        initiatedBy: v.string(),
        metadata: v.optional(v.record(v.string(), v.any()))
    },
    handler: async (ctx, args) => {
        try {
            const batchId = await ctx.db.insert("syncBatches", {
                batchId: args.batchId,
                entityType: args.entityType,
                operation: args.operation,
                status: "pending",
                startedAt: Date.now(),
                totalRecords: args.totalRecords,
                processedRecords: 0,
                successfulRecords: 0,
                failedRecords: 0,
                conflictedRecords: 0,
                initiatedBy: args.initiatedBy,
                metadata: args.metadata
            });

            return { success: true, batchId };
        } catch (error) {
            console.error("Ошибка создания пакета синхронизации:", error);
            throw new Error(`Не удалось создать пакет синхронизации: ${error instanceof Error ? error.message : "Неизвестная ошибка"}`);
        }
    }
});

// Обновление статуса пакета синхронизации
export const updateSyncBatch = mutation({
    args: {
        batchId: v.string(),
        status: v.union(
            v.literal("pending"),
            v.literal("running"),
            v.literal("completed"),
            v.literal("failed"),
            v.literal("cancelled")
        ),
        processedRecords: v.optional(v.number()),
        successfulRecords: v.optional(v.number()),
        failedRecords: v.optional(v.number()),
        conflictedRecords: v.optional(v.number()),
        errors: v.optional(v.array(v.object({
            recordId: v.string(),
            error: v.string(),
            timestamp: v.number()
        }))),
        metadata: v.optional(v.record(v.string(), v.any()))
    },
    handler: async (ctx, args) => {
        try {
            const batch = await ctx.db
                .query("syncBatches")
                .withIndex("by_batch_id", (q) => q.eq("batchId", args.batchId))
                .first();

            if (!batch) {
                throw new Error("Пакет синхронизации не найден");
            }

            const updateData: any = {
                status: args.status
            };

            if (args.processedRecords !== undefined) updateData.processedRecords = args.processedRecords;
            if (args.successfulRecords !== undefined) updateData.successfulRecords = args.successfulRecords;
            if (args.failedRecords !== undefined) updateData.failedRecords = args.failedRecords;
            if (args.conflictedRecords !== undefined) updateData.conflictedRecords = args.conflictedRecords;
            if (args.errors !== undefined) updateData.errors = args.errors;
            if (args.metadata !== undefined) updateData.metadata = { ...batch.metadata, ...args.metadata };

            if (args.status === "completed" || args.status === "failed" || args.status === "cancelled") {
                updateData.completedAt = Date.now();
            }

            await ctx.db.patch(batch._id, updateData);

            return { success: true };
        } catch (error) {
            console.error("Ошибка обновления пакета синхронизации:", error);
            throw new Error(`Не удалось обновить пакет синхронизации: ${error instanceof Error ? error.message : "Неизвестная ошибка"}`);
        }
    }
});

// Получение активных пакетов синхронизации
export const getActiveSyncBatches = query({
    args: {
        entityType: v.optional(entityTypeUnion)
    },
    handler: async (ctx, args) => {
        try {
            if (args.entityType) {
                const batches = await ctx.db
                    .query("syncBatches")
                    .withIndex("entity_status", (q) =>
                        q.eq("entityType", args.entityType!).eq("status", "running")
                    )
                    .collect();
                return batches;
            }

            const activeBatches = await ctx.db
                .query("syncBatches")
                .withIndex("by_status", (q) => q.eq("status", "running"))
                .collect();

            return activeBatches;
        } catch (error) {
            console.error("Ошибка получения активных пакетов синхронизации:", error);
            return [];
        }
    }
});

// Получение конфигурации синхронизации
export const getSyncConfiguration = query({
    args: {
        entityType: v.optional(entityTypeUnion)
    },
    handler: async (ctx, args) => {
        try {
            if (args.entityType !== undefined) {
                const config = await ctx.db
                    .query("syncConfiguration")
                    .withIndex("by_entity", (q) => q.eq("entityType", args.entityType!))
                    .first();
                return config;
            }

            const allConfigs = await ctx.db
                .query("syncConfiguration")
                .fullTableScan()
                .collect();

            const configMap: Record<string, any> = {};
            allConfigs.forEach(config => {
                configMap[config.entityType] = config;
            });

            return configMap;
        } catch (error) {
            console.error("Ошибка получения конфигурации синхронизации:", error);
            return args.entityType !== undefined ? null : {};
        }
    }
});

// Обновление конфигурации синхронизации
export const updateSyncConfiguration = mutation({
    args: {
        entityType: entityTypeUnion,
        syncEnabled: v.boolean(),
        syncInterval: v.number(),
        batchSize: v.number(),
        maxRetries: v.number(),
        retryDelay: v.number(),
        conflictResolutionStrategy: v.union(
            v.literal("server_wins"),
            v.literal("client_wins"),
            v.literal("last_write_wins"),
            v.literal("manual")
        ),
        priority: v.union(
            v.literal("low"),
            v.literal("normal"),
            v.literal("high"),
            v.literal("critical")
        ),
        enableRealTimeSync: v.boolean(),
        enableConflictDetection: v.boolean(),
        enableMetrics: v.boolean(),
        customRules: v.optional(v.array(v.object({
            field: v.string(),
            rule: v.string(),
            value: v.any()
        }))),
        updatedBy: v.string(),
        metadata: v.optional(v.record(v.string(), v.any()))
    },
    handler: async (ctx, args) => {
        try {
            const existingConfig = await ctx.db
                .query("syncConfiguration")
                .withIndex("by_entity", (q) => q.eq("entityType", args.entityType))
                .first();

            const configData = {
                entityType: args.entityType,
                syncEnabled: args.syncEnabled,
                syncInterval: args.syncInterval,
                batchSize: args.batchSize,
                maxRetries: args.maxRetries,
                retryDelay: args.retryDelay,
                conflictResolutionStrategy: args.conflictResolutionStrategy,
                priority: args.priority,
                enableRealTimeSync: args.enableRealTimeSync,
                enableConflictDetection: args.enableConflictDetection,
                enableMetrics: args.enableMetrics,
                customRules: args.customRules,
                updatedBy: args.updatedBy,
                updatedAt: Date.now(),
                metadata: args.metadata
            };

            if (existingConfig) {
                await ctx.db.patch(existingConfig._id, configData);
                return { success: true, updated: true, configId: existingConfig._id };
            } else {
                const configId = await ctx.db.insert("syncConfiguration", configData);
                return { success: true, updated: false, configId };
            }
        } catch (error) {
            console.error("Ошибка обновления конфигурации синхронизации:", error);
            throw new Error(`Не удалось обновить конфигурацию синхронизации: ${error instanceof Error ? error.message : "Неизвестная ошибка"}`);
        }
    }
});

// Создание записи о конфликте
export const createConflictResolution = mutation({
    args: {
        entityType: entityTypeUnion,
        entityId: v.string(),
        conflictType: v.union(
            v.literal("version_mismatch"),
            v.literal("concurrent_update"),
            v.literal("data_inconsistency"),
            v.literal("field_conflict"),
            v.literal("deletion_conflict"),
            v.literal("creation_conflict"),
            v.literal("permission_conflict")
        ),
        serverData: v.any(),
        clientData: v.any(),
        conflictFields: v.array(v.string()),
        priority: v.union(
            v.literal("low"),
            v.literal("medium"),
            v.literal("high"),
            v.literal("critical")
        ),
        notes: v.optional(v.string()),
        metadata: v.optional(v.record(v.string(), v.any()))
    },
    handler: async (ctx, args) => {
        try {
            const conflictId = await ctx.db.insert("conflictResolution", {
                entityType: args.entityType,
                entityId: args.entityId,
                conflictType: args.conflictType,
                serverData: args.serverData,
                clientData: args.clientData,
                conflictFields: args.conflictFields,
                priority: args.priority,
                notes: args.notes,
                createdAt: Date.now(),
                isResolved: false,
                metadata: args.metadata
            });

            return { success: true, conflictId };
        } catch (error) {
            console.error("Ошибка создания записи о конфликте:", error);
            throw new Error(`Не удалось создать запись о конфликте: ${error instanceof Error ? error.message : "Неизвестная ошибка"}`);
        }
    }
});

// Разрешение конфликта через таблицу conflictResolution
export const resolveConflictResolution = mutation({
    args: {
        conflictId: v.id("conflictResolution"),
        resolution: v.union(
            v.literal("server_wins"),
            v.literal("client_wins"),
            v.literal("merge"),
            v.literal("manual")
        ),
        resolvedData: v.any(),
        resolvedBy: v.string(),
        notes: v.optional(v.string())
    },
    handler: async (ctx, args) => {
        try {
            const conflict = await ctx.db.get(args.conflictId);
            if (!conflict) {
                throw new Error("Конфликт не найден");
            }

            // Преобразуем resolution в правильный формат для syncLog
            const conflictResolution = args.resolution === "server_wins" ? "server" :
                args.resolution === "client_wins" ? "client" : "manual";

            await ctx.db.patch(args.conflictId, {
                resolution: args.resolution,
                resolvedData: args.resolvedData,
                resolvedBy: args.resolvedBy,
                resolvedAt: Date.now(),
                isResolved: true,
                notes: args.notes
            });

            // Логируем разрешение конфликта
            await ctx.db.insert("syncLog", {
                entityType: conflict.entityType,
                entityId: conflict.entityId,
                action: "conflict",
                userId: args.resolvedBy,
                timestamp: Date.now(),
                conflictResolution: conflictResolution,
                newData: args.resolvedData,
                metadata: {
                    conflictResolutionId: args.conflictId,
                    resolved: true,
                    conflictType: conflict.conflictType
                }
            });

            return { success: true };
        } catch (error) {
            console.error("Ошибка разрешения конфликта:", error);
            throw new Error(`Не удалось разрешить конфликт: ${error instanceof Error ? error.message : "Неизвестная ошибка"}`);
        }
    }
});

// Получение неразрешенных конфликтов
export const getUnresolvedConflicts = query({
    args: {
        entityType: v.optional(entityTypeUnion),
        priority: v.optional(v.union(
            v.literal("low"),
            v.literal("medium"),
            v.literal("high"),
            v.literal("critical")
        )),
        limit: v.optional(v.number())
    },
    handler: async (ctx, args) => {
        try {
            let conflicts;

            if (args.entityType && args.priority) {
                conflicts = await ctx.db
                    .query("conflictResolution")
                    .withIndex("priority_resolved", (q) =>
                        q.eq("priority", args.priority!).eq("isResolved", false)
                    )
                    .filter((q) => q.eq(q.field("entityType"), args.entityType!))
                    .order("desc")
                    .take(args.limit || 50);
            } else if (args.entityType) {
                conflicts = await ctx.db
                    .query("conflictResolution")
                    .withIndex("entity_resolved", (q) =>
                        q.eq("entityType", args.entityType!).eq("isResolved", false)
                    )
                    .order("desc")
                    .take(args.limit || 50);
            } else if (args.priority) {
                conflicts = await ctx.db
                    .query("conflictResolution")
                    .withIndex("priority_resolved", (q) =>
                        q.eq("priority", args.priority!).eq("isResolved", false)
                    )
                    .order("desc")
                    .take(args.limit || 50);
            } else {
                conflicts = await ctx.db
                    .query("conflictResolution")
                    .withIndex("by_resolved", (q) => q.eq("isResolved", false))
                    .order("desc")
                    .take(args.limit || 50);
            }

            return conflicts;
        } catch (error) {
            console.error("Ошибка получения неразрешенных конфликтов:", error);
            return [];
        }
    }
});

// Создание активной сессии
export const createActiveSession = mutation({
    args: {
        sessionId: v.string(),
        userId: v.string(),
        userType: v.union(
            v.literal("staff"),
            v.literal("member"),
            v.literal("trainer"),
            v.literal("admin")
        ),
        deviceInfo: v.optional(v.string()),
        ipAddress: v.optional(v.string()),
        userAgent: v.optional(v.string()),
        capabilities: v.optional(v.array(v.string())),
        metadata: v.optional(v.record(v.string(), v.any()))
    },
    handler: async (ctx, args) => {
        try {
            const sessionId = await ctx.db.insert("activeSessions", {
                sessionId: args.sessionId,
                userId: args.userId,
                userType: args.userType,
                deviceInfo: args.deviceInfo,
                ipAddress: args.ipAddress,
                userAgent: args.userAgent,
                startedAt: Date.now(),
                lastActivity: Date.now(),
                isActive: true,
                syncStatus: {
                    isConnected: true,
                    lastSync: Date.now(),
                    pendingOperations: 0,
                    errorCount: 0
                },
                capabilities: args.capabilities,
                metadata: args.metadata
            });

            return { success: true, sessionId };
        } catch (error) {
            console.error("Ошибка создания активной сессии:", error);
            throw new Error(`Не удалось создать активную сессию: ${error instanceof Error ? error.message : "Неизвестная ошибка"}`);
        }
    }
});

// Обновление активной сессии
export const updateActiveSession = mutation({
    args: {
        sessionId: v.string(),
        lastActivity: v.optional(v.number()),
        syncStatus: v.optional(v.object({
            isConnected: v.boolean(),
            lastSync: v.number(),
            pendingOperations: v.number(),
            errorCount: v.number()
        })),
        isActive: v.optional(v.boolean()),
        metadata: v.optional(v.record(v.string(), v.any()))
    },
    handler: async (ctx, args) => {
        try {
            const session = await ctx.db
                .query("activeSessions")
                .withIndex("by_session_id", (q) => q.eq("sessionId", args.sessionId))
                .first();

            if (!session) {
                throw new Error("Сессия не найдена");
            }

            const updateData: any = {};

            if (args.lastActivity !== undefined) updateData.lastActivity = args.lastActivity;
            if (args.syncStatus !== undefined) updateData.syncStatus = args.syncStatus;
            if (args.isActive !== undefined) updateData.isActive = args.isActive;
            if (args.metadata !== undefined) updateData.metadata = { ...session.metadata, ...args.metadata };

            // Если сессия деактивируется, устанавливаем время окончания
            if (args.isActive === false) {
                updateData.endedAt = Date.now();
            }

            await ctx.db.patch(session._id, updateData);

            return { success: true };
        } catch (error) {
            console.error("Ошибка обновления активной сессии:", error);
            throw new Error(`Не удалось обновить активную сессию: ${error instanceof Error ? error.message : "Неизвестная ошибка"}`);
        }
    }
});

// Получение активных сессий
export const getActiveSessions = query({
    args: {
        userType: v.optional(v.union(
            v.literal("staff"),
            v.literal("member"),
            v.literal("trainer"),
            v.literal("admin")
        )),
        userId: v.optional(v.string())
    },
    handler: async (ctx, args) => {
        try {
            let sessions;

            if (args.userType && args.userId) {
                sessions = await ctx.db
                    .query("activeSessions")
                    .withIndex("user_active", (q) =>
                        q.eq("userId", args.userId!).eq("isActive", true)
                    )
                    .filter((q) => q.eq(q.field("userType"), args.userType!))
                    .collect();
            } else if (args.userType) {
                sessions = await ctx.db
                    .query("activeSessions")
                    .withIndex("type_active", (q) =>
                        q.eq("userType", args.userType!).eq("isActive", true)
                    )
                    .collect();
            } else if (args.userId) {
                sessions = await ctx.db
                    .query("activeSessions")
                    .withIndex("user_active", (q) =>
                        q.eq("userId", args.userId!).eq("isActive", true)
                    )
                    .collect();
            } else {
                sessions = await ctx.db
                    .query("activeSessions")
                    .withIndex("by_active", (q) => q.eq("isActive", true))
                    .collect();
            }

            return sessions;
        } catch (error) {
            console.error("Ошибка получения активных сессий:", error);
            return [];
        }
    }
});

// Создание записи в кэше
export const createCacheEntry = mutation({
    args: {
        cacheKey: v.string(),
        entityType: v.optional(entityTypeUnion),
        data: v.any(),
        expiresAt: v.number(),
        tags: v.optional(v.array(v.string())),
        metadata: v.optional(v.record(v.string(), v.any()))
    },
    handler: async (ctx, args) => {
        try {
            // Проверяем, существует ли уже запись с таким ключом
            const existingEntry = await ctx.db
                .query("dataCache")
                .withIndex("by_key", (q) => q.eq("cacheKey", args.cacheKey))
                .first();

            const cacheData = {
                cacheKey: args.cacheKey,
                data: args.data,
                expiresAt: args.expiresAt,
                createdAt: Date.now(),
                accessCount: 0,
                lastAccessed: Date.now(),
                ...(args.entityType && { entityType: args.entityType }),
                ...(args.tags && { tags: args.tags }),
                ...(args.metadata && { metadata: args.metadata })
            };

            if (existingEntry) {
                await ctx.db.patch(existingEntry._id, cacheData);
                return { success: true, updated: true, cacheId: existingEntry._id };
            } else {
                const cacheId = await ctx.db.insert("dataCache", cacheData);
                return { success: true, updated: false, cacheId };
            }
        } catch (error) {
            console.error("Ошибка создания записи в кэше:", error);
            throw new Error(`Не удалось создать запись в кэше: ${error instanceof Error ? error.message : "Неизвестная ошибка"}`);
        }
    }
});

export const getCacheEntryReadOnly = query({
    args: {
        cacheKey: v.string()
    },
    handler: async (ctx, args) => {
        try {
            const cacheEntry = await ctx.db
                .query("dataCache")
                .withIndex("by_key", (q) => q.eq("cacheKey", args.cacheKey))
                .first();

            if (!cacheEntry) {
                return null;
            }

            // Проверяем, не истекла ли запись
            if (cacheEntry.expiresAt < Date.now()) {
                return null;
            }

            return {
                data: cacheEntry.data,
                createdAt: cacheEntry.createdAt,
                expiresAt: cacheEntry.expiresAt,
                accessCount: cacheEntry.accessCount,
                tags: cacheEntry.tags,
                metadata: cacheEntry.metadata
            };
        } catch (error) {
            console.error("Ошибка получения записи из кэша:", error);
            return null;
        }
    }
});

// Получение записи из кэша
export const getCacheEntry = mutation({
    args: {
        cacheKey: v.string()
    },
    handler: async (ctx, args) => {
        try {
            const cacheEntry = await ctx.db
                .query("dataCache")
                .withIndex("by_key", (q) => q.eq("cacheKey", args.cacheKey))
                .first();

            if (!cacheEntry) {
                return null;
            }

            // Проверяем, не истекла ли запись
            if (cacheEntry.expiresAt < Date.now()) {
                // Удаляем истекшую запись
                await ctx.db.delete(cacheEntry._id);
                return null;
            }

            // Обновляем счетчик доступа и время последнего доступа
            await ctx.db.patch(cacheEntry._id, {
                accessCount: cacheEntry.accessCount + 1,
                lastAccessed: Date.now()
            });

            return {
                data: cacheEntry.data,
                createdAt: cacheEntry.createdAt,
                expiresAt: cacheEntry.expiresAt,
                accessCount: cacheEntry.accessCount + 1,
                tags: cacheEntry.tags,
                metadata: cacheEntry.metadata
            };
        } catch (error) {
            console.error("Ошибка получения записи из кэша:", error);
            return null;
        }
    }
});

// Очистка истекших записей кэша
export const cleanupExpiredCache = mutation({
    args: {},
    handler: async (ctx) => {
        try {
            const currentTime = Date.now();
            const expiredEntries = await ctx.db
                .query("dataCache")
                .withIndex("by_expires", (q) => q.lt("expiresAt", currentTime))
                .collect();

            let deletedCount = 0;
            for (const entry of expiredEntries) {
                await ctx.db.delete(entry._id);
                deletedCount++;
            }

            return { success: true, deletedCount, totalFound: expiredEntries.length };
        } catch (error) {
            console.error("Ошибка очистки истекших записей кэша:", error);
            throw new Error(`Не удалось очистить истекшие записи кэша: ${error instanceof Error ? error.message : "Неизвестная ошибка"}`);
        }
    }
});

// Запись метрик синхронизации
export const recordSyncMetric = mutation({
    args: {
        entityType: v.union(
            v.literal("messages"),
            v.literal("users"),
            v.literal("trainers"),
            v.literal("clients"),
            v.literal("events"),
            v.literal("schedule_events"),
            v.literal("products"),
            v.literal("orders"),
            v.literal("bookings"),
            v.literal("members"),
            v.literal("staff"),
            v.literal("notifications"),
            v.literal("classes"),
            v.literal("visits"),
            v.literal("purchases"),
            v.literal("workouts"),
            v.literal("memberships"),
            v.literal("global")
        ),
        metricType: v.union(
            v.literal("sync_duration"),
            v.literal("record_count"),
            v.literal("error_rate"),
            v.literal("conflict_rate"),
            v.literal("throughput"),
            v.literal("latency")
        ),
        value: v.number(),
        timeWindow: v.union(
            v.literal("minute"),
            v.literal("hour"),
            v.literal("day"),
            v.literal("week"),
            v.literal("month")
        ),
        metadata: v.optional(v.record(v.string(), v.any()))
    },
    handler: async (ctx, args) => {
        try {
            const metricId = await ctx.db.insert("syncMetrics", {
                entityType: args.entityType,
                metricType: args.metricType,
                value: args.value,
                timestamp: Date.now(),
                timeWindow: args.timeWindow,
                metadata: args.metadata
            });

            return { success: true, metricId };
        } catch (error) {
            console.error("Ошибка записи метрики синхронизации:", error);
            throw new Error(`Не удалось записать метрику синхронизации: ${error instanceof Error ? error.message : "Неизвестная ошибка"}`);
        }
    }
});

// Получение метрик синхронизации
export const getSyncMetricsByType = query({
    args: {
        entityType: v.optional(entityTypeUnion),
        metricType: v.optional(v.union(
            v.literal("sync_duration"),
            v.literal("record_count"),
            v.literal("error_rate"),
            v.literal("conflict_rate"),
            v.literal("throughput"),
            v.literal("latency")
        )),
        timeWindow: v.optional(v.union(
            v.literal("minute"),
            v.literal("hour"),
            v.literal("day"),
            v.literal("week"),
            v.literal("month")
        )),
        timeRange: v.optional(v.object({
            start: v.number(),
            end: v.number()
        })),
        limit: v.optional(v.number())
    },
    handler: async (ctx, args) => {
        try {
            let metrics;

            if (args.entityType !== undefined && args.metricType !== undefined) {
                metrics = await ctx.db
                    .query("syncMetrics")
                    .withIndex("entity_metric", (q) =>
                        q.eq("entityType", args.entityType!).eq("metricType", args.metricType!)
                    )
                    .order("desc")
                    .take(args.limit || 100);
            } else if (args.entityType !== undefined) {
                metrics = await ctx.db
                    .query("syncMetrics")
                    .withIndex("by_entity", (q) => q.eq("entityType", args.entityType!))
                    .order("desc")
                    .take(args.limit || 100);
            } else if (args.metricType !== undefined) {
                metrics = await ctx.db
                    .query("syncMetrics")
                    .withIndex("by_metric", (q) => q.eq("metricType", args.metricType!))
                    .order("desc")
                    .take(args.limit || 100);
            } else {
                metrics = await ctx.db
                    .query("syncMetrics")
                    .withIndex("by_timestamp")
                    .order("desc")
                    .take(args.limit || 100);
            }

            // Фильтруем по временному диапазону
            if (args.timeRange) {
                metrics = metrics.filter(metric =>
                    metric.timestamp >= args.timeRange!.start &&
                    metric.timestamp <= args.timeRange!.end
                );
            }

            // Фильтруем по временному окну
            if (args.timeWindow !== undefined) {
                metrics = metrics.filter(metric => metric.timeWindow === args.timeWindow);
            }

            return metrics;
        } catch (error) {
            console.error("Ошибка получения метрик синхронизации:", error);
            return [];
        }
    }
});

// Создание задачи планировщика
export const createSyncScheduleTask = mutation({
    args: {
        taskId: v.string(),
        taskType: v.union(
            v.literal("full_sync"),
            v.literal("incremental_sync"),
            v.literal("cleanup"),
            v.literal("metrics_collection"),
            v.literal("conflict_resolution"),
            v.literal("health_check")
        ),
        entityType: v.optional(entityTypeUnion),
        scheduledAt: v.number(),
        priority: v.union(
            v.literal("low"),
            v.literal("normal"),
            v.literal("high"),
            v.literal("urgent")
        ),
        recurring: v.optional(v.object({
            pattern: v.union(
                v.literal("once"),
                v.literal("hourly"),
                v.literal("daily"),
                v.literal("weekly"),
                v.literal("monthly")
            ),
            interval: v.number(),
            endDate: v.optional(v.number())
        })),
        parameters: v.optional(v.record(v.string(), v.any())),
        createdBy: v.string()
    },
    handler: async (ctx, args) => {
        try {
            const taskId = await ctx.db.insert("syncSchedule", {
                taskId: args.taskId,
                taskType: args.taskType,
                entityType: args.entityType,
                scheduledAt: args.scheduledAt,
                status: "pending",
                priority: args.priority,
                recurring: args.recurring,
                parameters: args.parameters,
                createdBy: args.createdBy,
                createdAt: Date.now()
            });

            return { success: true, taskId };
        } catch (error) {
            console.error("Ошибка создания задачи планировщика:", error);
            throw new Error(`Не удалось создать задачу планировщика: ${error instanceof Error ? error.message : "Неизвестная ошибка"}`);
        }
    }
});

// Обновление статуса задачи планировщика
export const updateSyncScheduleTask = mutation({
    args: {
        taskId: v.string(),
        status: v.union(
            v.literal("pending"),
            v.literal("running"),
            v.literal("completed"),
            v.literal("failed"),
            v.literal("cancelled"),
            v.literal("skipped")
        ),
        executedAt: v.optional(v.number()),
        result: v.optional(v.object({
            success: v.boolean(),
            recordsProcessed: v.number(),
            errors: v.optional(v.array(v.string())),
            duration: v.number(),
            metadata: v.optional(v.record(v.string(), v.any()))
        }))
    },
    handler: async (ctx, args) => {
        try {
            const task = await ctx.db
                .query("syncSchedule")
                .withIndex("by_task_id", (q) => q.eq("taskId", args.taskId))
                .first();

            if (!task) {
                throw new Error("Задача планировщика не найдена");
            }

            const updateData: any = {
                status: args.status
            };

            if (args.executedAt !== undefined) updateData.executedAt = args.executedAt;
            if (args.result !== undefined) updateData.result = args.result;

            if (args.status === "completed" || args.status === "failed" || args.status === "cancelled") {
                updateData.completedAt = Date.now();
            }

            await ctx.db.patch(task._id, updateData);

            return { success: true };
        } catch (error) {
            console.error("Ошибка обновления задачи планировщика:", error);
            throw new Error(`Не удалось обновить задачу планировщика: ${error instanceof Error ? error.message : "Неизвестная ошибка"}`);
        }
    }
});

// Получение задач планировщика
export const getSyncScheduleTasks = query({
    args: {
        taskType: v.optional(v.union(
            v.literal("full_sync"),
            v.literal("incremental_sync"),
            v.literal("cleanup"),
            v.literal("metrics_collection"),
            v.literal("conflict_resolution"),
            v.literal("health_check")
        )),
        status: v.optional(v.union(
            v.literal("pending"),
            v.literal("running"),
            v.literal("completed"),
            v.literal("failed"),
            v.literal("cancelled"),
            v.literal("skipped")
        )),
        entityType: v.optional(entityTypeUnion),
        priority: v.optional(v.union(
            v.literal("low"),
            v.literal("normal"),
            v.literal("high"),
            v.literal("urgent")
        )),
        limit: v.optional(v.number())
    },
    handler: async (ctx, args) => {
        try {
            let tasks;

            if (args.taskType && args.status) {
                tasks = await ctx.db
                    .query("syncSchedule")
                    .withIndex("type_status", (q) =>
                        q.eq("taskType", args.taskType!).eq("status", args.status!)
                    )
                    .order("desc")
                    .take(args.limit || 50);
            } else if (args.entityType && args.status && args.entityType !== undefined) {
                tasks = await ctx.db
                    .query("syncSchedule")
                    .withIndex("entity_status", (q) =>
                        q.eq("entityType", args.entityType!).eq("status", args.status!)
                    )
                    .order("desc")
                    .take(args.limit || 50);
            } else if (args.priority && args.priority !== undefined) {
                tasks = await ctx.db
                    .query("syncSchedule")
                    .withIndex("by_priority", (q) => q.eq("priority", args.priority!))
                    .order("desc")
                    .take(args.limit || 50);
            } else if (args.taskType && args.taskType !== undefined) {
                tasks = await ctx.db
                    .query("syncSchedule")
                    .withIndex("by_task_type", (q) => q.eq("taskType", args.taskType!))
                    .order("desc")
                    .take(args.limit || 50);
            } else if (args.status && args.status !== undefined) {
                tasks = await ctx.db
                    .query("syncSchedule")
                    .withIndex("by_status", (q) => q.eq("status", args.status!))
                    .order("desc")
                    .take(args.limit || 50);
            } else if (args.entityType && args.entityType !== undefined) {
                tasks = await ctx.db
                    .query("syncSchedule")
                    .withIndex("by_entity", (q) => q.eq("entityType", args.entityType!))
                    .order("desc")
                    .take(args.limit || 50);
            } else {
                // Используем fullTableScan когда нет специфических фильтров
                tasks = await ctx.db
                    .query("syncSchedule")
                    .fullTableScan()
                    .order("desc")
                    .take(args.limit || 50);
            }

            return tasks;
        } catch (error) {
            console.error("Ошибка получения задач планировщика:", error);
            return [];
        }
    }
});

// Получение следующих задач для выполнения
export const getNextScheduledTasks = query({
    args: {
        limit: v.optional(v.number())
    },
    handler: async (ctx, args) => {
        try {
            const currentTime = Date.now();

            const pendingTasks = await ctx.db
                .query("syncSchedule")
                .withIndex("status_scheduled", (q) =>
                    q.eq("status", "pending")
                )
                .filter((q) => q.lte(q.field("scheduledAt"), currentTime))
                .order("asc")
                .take(args.limit || 10);

            // Сортируем по приоритету
            const priorityOrder = { "urgent": 0, "high": 1, "normal": 2, "low": 3 };

            return pendingTasks.sort((a, b) => {
                const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder];
                const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder];

                if (aPriority !== bPriority) {
                    return aPriority - bPriority;
                }

                return a.scheduledAt - b.scheduledAt;
            });
        } catch (error) {
            console.error("Ошибка получения следующих задач планировщика:", error);
            return [];
        }
    }
});

// Получение общей статистики синхронизации
export const getSyncOverview = query({
    args: {},
    handler: async (ctx) => {
        try {
            const [
                totalLogs,
                activeBatches,
                unresolvedConflicts,
                activeSessions,
                recentErrors
            ] = await Promise.all([
                ctx.db.query("syncLog").collect(),
                ctx.db.query("syncBatches")
                    .withIndex("by_status", (q) => q.eq("status", "running"))
                    .collect(),
                ctx.db.query("conflictResolution")
                    .withIndex("by_resolved", (q) => q.eq("isResolved", false))
                    .collect(),
                ctx.db.query("activeSessions")
                    .withIndex("by_active", (q) => q.eq("isActive", true))
                    .collect(),
                ctx.db.query("syncLog")
                    .filter((q) => q.neq(q.field("errorMessage"), undefined))
                    .order("desc")
                    .take(10)
            ]);

            const last24Hours = Date.now() - (24 * 60 * 60 * 1000);
            const recentLogs = totalLogs.filter(log => log.timestamp > last24Hours);

            const overview = {
                totalOperations: totalLogs.length,
                recentOperations: recentLogs.length,
                activeBatches: activeBatches.length,
                unresolvedConflicts: unresolvedConflicts.length,
                activeSessions: activeSessions.length,
                recentErrors: recentErrors.length,

                operationsByType: recentLogs.reduce((acc, log) => {
                    acc[log.action] = (acc[log.action] || 0) + 1;
                    return acc;
                }, {} as Record<string, number>),

                operationsByEntity: recentLogs.reduce((acc, log) => {
                    acc[log.entityType] = (acc[log.entityType] || 0) + 1;
                    return acc;
                }, {} as Record<string, number>),

                healthStatus: {
                    isHealthy: unresolvedConflicts.length < 10 && recentErrors.length < 5,
                    lastSync: Math.max(...totalLogs.map(log => log.timestamp), 0),
                    errorRate: recentLogs.length > 0 ? (recentErrors.length / recentLogs.length) * 100 : 0,
                    conflictRate: recentLogs.length > 0 ? (recentLogs.filter(log => log.action === "conflict").length / recentLogs.length) * 100 : 0
                },

                performance: {
                    averageOperationsPerHour: recentLogs.length / 24,
                    peakHour: (() => {
                        const hourCounts = recentLogs.reduce((acc, log) => {
                            const hour = new Date(log.timestamp).getHours();
                            acc[hour] = (acc[hour] || 0) + 1;
                            return acc;
                        }, {} as Record<number, number>);

                        let maxHour = 0;
                        let maxCount = 0;
                        Object.entries(hourCounts).forEach(([hour, count]) => {
                            if (count > maxCount) {
                                maxCount = count;
                                maxHour = parseInt(hour);
                            }
                        });

                        return maxCount > 0 ? `${maxHour.toString().padStart(2, '0')}:00` : null;
                    })()
                }
            };

            return overview;
        } catch (error) {
            console.error("Ошибка получения обзора синхронизации:", error);
            return {
                totalOperations: 0,
                recentOperations: 0,
                activeBatches: 0,
                unresolvedConflicts: 0,
                activeSessions: 0,
                recentErrors: 0,
                operationsByType: {},
                operationsByEntity: {},
                healthStatus: {
                    isHealthy: false,
                    lastSync: 0,
                    errorRate: 0,
                    conflictRate: 0
                },
                performance: {
                    averageOperationsPerHour: 0,
                    peakHour: null
                },
                error: error instanceof Error ? error.message : "Неизвестная ошибка"
            };
        }
    }
});

// Проверка здоровья системы синхронизации
export const checkSyncHealth = query({
    args: {},
    handler: async (ctx) => {
        try {
            const currentTime = Date.now();
            const last24Hours = currentTime - (24 * 60 * 60 * 1000);
            const lastHour = currentTime - (60 * 60 * 1000);

            const [
                recentLogs,
                recentErrors,
                unresolvedConflicts,
                stuckBatches,
                inactiveSessions,
                syncStatuses
            ] = await Promise.all([
                ctx.db.query("syncLog")
                    .withIndex("by_timestamp", (q) => q.gte("timestamp", last24Hours))
                    .collect(),
                ctx.db.query("syncLog")
                    .withIndex("by_timestamp", (q) => q.gte("timestamp", lastHour))
                    .filter((q) => q.neq(q.field("errorMessage"), undefined))
                    .collect(),
                ctx.db.query("conflictResolution")
                    .withIndex("by_resolved", (q) => q.eq("isResolved", false))
                    .collect(),
                ctx.db.query("syncBatches")
                    .withIndex("by_status", (q) => q.eq("status", "running"))
                    .filter((q) => q.lt(q.field("startedAt"), currentTime - (2 * 60 * 60 * 1000))) // Застрявшие более 2 часов
                    .collect(),
                ctx.db.query("activeSessions")
                    .withIndex("by_active", (q) => q.eq("isActive", true))
                    .filter((q) => q.lt(q.field("lastActivity"), currentTime - (30 * 60 * 1000))) // Неактивные более 30 минут
                    .collect(),
                ctx.db.query("syncStatus").collect()
            ]);

            const healthChecks = {
                errorRate: {
                    value: recentLogs.length > 0 ? (recentErrors.length / recentLogs.length) * 100 : 0,
                    threshold: 5, // 5%
                    status: "healthy" as "healthy" | "warning" | "critical"
                },
                conflictCount: {
                    value: unresolvedConflicts.length,
                    threshold: 10,
                    status: "healthy" as "healthy" | "warning" | "critical"
                },
                stuckBatches: {
                    value: stuckBatches.length,
                    threshold: 0,
                    status: "healthy" as "healthy" | "warning" | "critical"
                },
                inactiveSessions: {
                    value: inactiveSessions.length,
                    threshold: 5,
                    status: "healthy" as "healthy" | "warning" | "critical"
                },
                syncFrequency: {
                    value: recentLogs.length,
                    threshold: 1, // Минимум 1 операция за 24 часа
                    status: "healthy" as "healthy" | "warning" | "critical"
                }
            };

            // Определяем статус каждой проверки
            Object.entries(healthChecks).forEach(([key, check]) => {
                if (key === "syncFrequency") {
                    if (check.value < check.threshold) {
                        check.status = "warning";
                    }
                } else {
                    if (check.value > check.threshold * 2) {
                        check.status = "critical";
                    } else if (check.value > check.threshold) {
                        check.status = "warning";
                    }
                }
            });

            const overallStatus = Object.values(healthChecks).some(check => check.status === "critical")
                ? "critical"
                : Object.values(healthChecks).some(check => check.status === "warning")
                    ? "warning"
                    : "healthy";

            const recommendations = [];

            if (healthChecks.errorRate.status !== "healthy") {
                recommendations.push("Высокий уровень ошибок синхронизации. Проверьте логи и устраните проблемы.");
            }

            if (healthChecks.conflictCount.status !== "healthy") {
                recommendations.push("Много неразрешенных конфликтов. Рассмотрите возможность автоматического разрешения или ручного вмешательства.");
            }

            if (healthChecks.stuckBatches.status !== "healthy") {
                recommendations.push("Обнаружены застрявшие пакеты синхронизации. Перезапустите или отмените их.");
            }

            if (healthChecks.inactiveSessions.status !== "healthy") {
                recommendations.push("Много неактивных сессий. Очистите устаревшие сессии.");
            }

            if (healthChecks.syncFrequency.status !== "healthy") {
                recommendations.push("Низкая активность синхронизации. Проверьте работу планировщика задач.");
            }

            return {
                overallStatus,
                healthChecks,
                recommendations,
                lastCheck: currentTime,
                entityStatuses: syncStatuses.reduce((acc, status) => {
                    acc[status.entityType] = {
                        isHealthy: status.isHealthy,
                        lastSync: status.lastSyncTime,
                        errorCount: status.errorCount,
                        conflictCount: status.conflictedRecords
                    };
                    return acc;
                }, {} as Record<string, any>)
            };
        } catch (error) {
            console.error("Ошибка проверки здоровья системы синхронизации:", error);
            return {
                overallStatus: "critical" as const,
                healthChecks: {},
                recommendations: ["Ошибка при проверке здоровья системы. Обратитесь к администратору."],
                lastCheck: Date.now(),
                entityStatuses: {},
                error: error instanceof Error ? error.message : "Неизвестная ошибка"
            };
        }
    }
});

// Автоматическое восстановление после ошибок
export const autoRecovery = mutation({
    args: {
        recoveryType: v.union(
            v.literal("restart_stuck_batches"),
            v.literal("cleanup_inactive_sessions"),
            v.literal("resolve_simple_conflicts"),
            v.literal("retry_failed_operations")
        ),
        dryRun: v.optional(v.boolean()),
        userId: v.string()
    },
    handler: async (ctx, args) => {
        try {
            const results = {
                type: args.recoveryType,
                dryRun: args.dryRun || false,
                actions: [] as Array<{ action: string; success: boolean; details: string }>,
                summary: {
                    totalActions: 0,
                    successfulActions: 0,
                    failedActions: 0
                }
            };

            const currentTime = Date.now();

            switch (args.recoveryType) {
                case "restart_stuck_batches":
                    const stuckBatches = await ctx.db.query("syncBatches")
                        .withIndex("by_status", (q) => q.eq("status", "running"))
                        .filter((q) => q.lt(q.field("startedAt"), currentTime - (2 * 60 * 60 * 1000)))
                        .collect();

                    for (const batch of stuckBatches) {
                        try {
                            if (!args.dryRun) {
                                await ctx.db.patch(batch._id, {
                                    status: "failed",
                                    completedAt: currentTime,
                                    metadata: {
                                        ...batch.metadata,
                                        autoRecovery: true,
                                        recoveryReason: "stuck_batch_timeout"
                                    }
                                });
                            }

                            results.actions.push({
                                action: `Restart stuck batch ${batch.batchId}`,
                                success: true,
                                details: `Batch was running for ${Math.round((currentTime - batch.startedAt) / (60 * 60 * 1000))} hours`
                            });
                            results.summary.successfulActions++;
                        } catch (error) {
                            results.actions.push({
                                action: `Restart stuck batch ${batch.batchId}`,
                                success: false,
                                details: error instanceof Error ? error.message : "Unknown error"
                            });
                            results.summary.failedActions++;
                        }
                        results.summary.totalActions++;
                    }
                    break;

                case "cleanup_inactive_sessions":
                    const inactiveSessions = await ctx.db.query("activeSessions")
                        .withIndex("by_active", (q) => q.eq("isActive", true))
                        .filter((q) => q.lt(q.field("lastActivity"), currentTime - (30 * 60 * 1000)))
                        .collect();

                    for (const session of inactiveSessions) {
                        try {
                            if (!args.dryRun) {
                                await ctx.db.patch(session._id, {
                                    isActive: false,
                                    metadata: {
                                        ...session.metadata,
                                        autoRecovery: true,
                                        deactivatedAt: currentTime,
                                        reason: "inactive_timeout"
                                    }
                                });
                            }

                            results.actions.push({
                                action: `Deactivate inactive session ${session.sessionId}`,
                                success: true,
                                details: `Session was inactive for ${Math.round((currentTime - session.lastActivity) / (60 * 1000))} minutes`
                            });
                            results.summary.successfulActions++;
                        } catch (error) {
                            results.actions.push({
                                action: `Deactivate inactive session ${session.sessionId}`,
                                success: false,
                                details: error instanceof Error ? error.message : "Unknown error"
                            });
                            results.summary.failedActions++;
                        }
                        results.summary.totalActions++;
                    }
                    break;

                case "resolve_simple_conflicts":
                    const simpleConflicts = await ctx.db.query("conflictResolution")
                        .withIndex("by_resolved", (q) => q.eq("isResolved", false))
                        .filter((q) => q.eq(q.field("conflictType"), "version_mismatch"))
                        .take(10); // Ограничиваем количество для безопасности

                    for (const conflict of simpleConflicts) {
                        try {
                            if (!args.dryRun) {
                                await ctx.db.patch(conflict._id, {
                                    resolution: "server_wins",
                                    resolvedData: conflict.serverData,
                                    resolvedBy: args.userId,
                                    resolvedAt: currentTime,
                                    isResolved: true,
                                    notes: "Auto-resolved: server wins for version mismatch"
                                });
                            }

                            results.actions.push({
                                action: `Auto-resolve conflict for $${conflict.entityType}:$${conflict.entityId}`,
                                success: true,
                                details: "Applied server_wins strategy for version mismatch"
                            });
                            results.summary.successfulActions++;
                        } catch (error) {
                            results.actions.push({
                                action: `Auto-resolve conflict for $${conflict.entityType}:$${conflict.entityId}`,
                                success: false,
                                details: error instanceof Error ? error.message : "Unknown error"
                            });
                            results.summary.failedActions++;
                        }
                        results.summary.totalActions++;
                    }
                    break;

                case "retry_failed_operations":
                    const failedLogs = await ctx.db.query("syncLog")
                        .withIndex("by_timestamp", (q) => q.gte("timestamp", currentTime - (60 * 60 * 1000)))
                        .filter((q) => q.neq(q.field("errorMessage"), undefined))
                        .filter((q) => q.lt(q.field("retryCount"), 3))
                        .take(5); // Ограничиваем для безопасности

                    for (const log of failedLogs) {
                        try {
                            if (!args.dryRun) {
                                await ctx.db.insert("syncLog", {
                                    entityType: log.entityType,
                                    entityId: log.entityId,
                                    action: log.action,
                                    userId: args.userId,
                                    timestamp: currentTime,
                                    oldData: log.oldData,
                                    newData: log.newData,
                                    retryCount: (log.retryCount || 0) + 1,
                                    metadata: {
                                        ...log.metadata,
                                        autoRetry: true,
                                        originalLogId: log._id,
                                        retryReason: "auto_recovery"
                                    }
                                });
                            }

                            results.actions.push({
                                action: `Retry failed operation for $${log.entityType}:$${log.entityId}`,
                                success: true,
                                details: `Retry attempt ${(log.retryCount || 0) + 1}/3`
                            });
                            results.summary.successfulActions++;
                        } catch (error) {
                            results.actions.push({
                                action: `Retry failed operation for $${log.entityType}:$${log.entityId}`,
                                success: false,
                                details: error instanceof Error ? error.message : "Unknown error"
                            });
                            results.summary.failedActions++;
                        }
                        results.summary.totalActions++;
                    }
                    break;
            }

            // Логируем операцию автовосстановления
            if (!args.dryRun) {
                await ctx.db.insert("syncLog", {
                    entityType: "global",
                    entityId: "auto_recovery",
                    action: "sync",
                    userId: args.userId,
                    timestamp: currentTime,
                    metadata: {
                        recoveryType: args.recoveryType,
                        results: results.summary,
                        autoRecovery: true
                    }
                });
            }

            return results;
        } catch (error) {
            console.error("Ошибка автоматического восстановления:", error);
            throw new Error(`Не удалось выполнить автоматическое восстановление: ${error instanceof Error ? error.message : "Неизвестная ошибка"}`);
        }
    }
});

// Экспорт данных синхронизации для анализа
export const exportSyncData = query({
    args: {
        entityType: v.optional(entityTypeUnion),
        timeRange: v.object({
            start: v.number(),
            end: v.number()
        }),
        includeMetadata: v.optional(v.boolean()),
        format: v.optional(v.union(
            v.literal("json"),
            v.literal("csv")
        ))
    },
    handler: async (ctx, args) => {
        try {
            let logs;

            if (args.entityType !== undefined) {
                logs = await ctx.db.query("syncLog")
                    .withIndex("entity_timestamp", (q) => q.eq("entityType", args.entityType!))
                    .filter((q) =>
                        q.gte(q.field("timestamp"), args.timeRange.start) &&
                        q.lte(q.field("timestamp"), args.timeRange.end)
                    )
                    .collect();
            } else {
                logs = await ctx.db.query("syncLog")
                    .withIndex("by_timestamp", (q) =>
                        q.gte("timestamp", args.timeRange.start) &&
                        q.lte("timestamp", args.timeRange.end)
                    )
                    .collect();
            }

            const exportData = logs.map(log => ({
                timestamp: log.timestamp,
                date: new Date(log.timestamp).toISOString(),
                entityType: log.entityType,
                entityId: log.entityId,
                action: log.action,
                userId: log.userId,
                conflictResolution: log.conflictResolution,
                syncSource: log.syncSource,
                batchId: log.batchId,
                retryCount: log.retryCount || 0,
                hasError: !!log.errorMessage,
                errorMessage: log.errorMessage,
                ...(args.includeMetadata && {
                    metadata: JSON.stringify(log.metadata),
                    oldData: JSON.stringify(log.oldData),
                    newData: JSON.stringify(log.newData)
                })
            }));

            return {
                data: exportData,
                totalRecords: exportData.length,
                timeRange: args.timeRange,
                entityType: args.entityType,
                exportedAt: Date.now(),
                format: args.format || "json"
            };
        } catch (error) {
            console.error("Ошибка экспорта данных синхронизации:", error);
            return {
                data: [],
                totalRecords: 0,
                timeRange: args.timeRange,
                entityType: args.entityType,
                exportedAt: Date.now(),
                format: args.format || "json",
                error: error instanceof Error ? error.message : "Неизвестная ошибка"
            };
        }
    }
});

// Массовое обновление версий сущностей
export const bulkUpdateVersions = mutation({
    args: {
        entityType: entityTypeUnion,
        entityIds: v.array(v.string()),
        forceSync: v.optional(v.boolean()),
        userId: v.string()
    },
    handler: async (ctx, args) => {
        try {
            const tableNameMap: Record<string, string> = {
                "schedule_events": "schedule_events",
                "messages": "messages",
                "users": "users",
                "trainers": "trainers",
                "clients": "clients",
                "events": "events",
                "products": "products",
                "orders": "orders",
                "bookings": "bookings",
                "members": "members",
                "staff": "staff",
                "notifications": "notifications",
                "classes": "classes",
                "visits": "visits",
                "purchases": "purchases",
                "workouts": "workouts",
                "memberships": "memberships",
                "global": "syncLog" // Для global используем syncLog как fallback
            };

            const tableName = tableNameMap[args.entityType];
            if (!tableName) {
                throw new Error(`Неизвестный тип сущности: ${args.entityType}`);
            }

            const results = [];
            const batchId = `bulk_update_${Date.now()}`;

            // Создаем пакет синхронизации
            await ctx.db.insert("syncBatches", {
                batchId,
                entityType: args.entityType,
                operation: "incremental_sync",
                status: "running",
                startedAt: Date.now(),
                totalRecords: args.entityIds.length,
                processedRecords: 0,
                successfulRecords: 0,
                failedRecords: 0,
                conflictedRecords: 0,
                initiatedBy: args.userId,
                metadata: { bulkUpdate: true, forceSync: args.forceSync }
            });

            let successCount = 0;
            let failCount = 0;

            // Пропускаем обработку для global, так как это системный тип
            if (args.entityType === "global") {
                return {
                    success: true,
                    batchId,
                    totalProcessed: 0,
                    successfulUpdates: 0,
                    failedUpdates: 0,
                    results: [],
                    message: "Global entity type skipped"
                };
            }

            for (const entityId of args.entityIds) {
                try {
                    const record = await ctx.db
                        .query(tableName as any)
                        .filter((q) => q.eq(q.field("_id"), entityId))
                        .first();

                    if (!record) {
                        results.push({ entityId, success: false, error: "Запись не найдена" });
                        failCount++;
                        continue;
                    }

                    const newVersion = (record._version || 0) + 1;
                    await ctx.db.patch(record._id, {
                        _version: newVersion,
                        _lastSync: Date.now(),
                        _isDirty: args.forceSync ? false : (record._isDirty || false)
                    });

                    // Логируем операцию
                    await ctx.db.insert("syncLog", {
                        entityType: args.entityType,
                        entityId,
                        action: "update",
                        userId: args.userId,
                        timestamp: Date.now(),
                        batchId,
                        metadata: {
                            bulkUpdate: true,
                            forceSync: args.forceSync,
                            previousVersion: record._version || 0,
                            newVersion
                        }
                    });

                    results.push({ entityId, success: true, newVersion });
                    successCount++;
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : "Неизвестная ошибка";
                    results.push({ entityId, success: false, error: errorMessage });
                    failCount++;
                }
            }

            // Обновляем статус пакета
            const batch = await ctx.db
                .query("syncBatches")
                .withIndex("by_batch_id", (q) => q.eq("batchId", batchId))
                .first();

            if (batch) {
                await ctx.db.patch(batch._id, {
                    status: "completed",
                    completedAt: Date.now(),
                    processedRecords: args.entityIds.length,
                    successfulRecords: successCount,
                    failedRecords: failCount
                });
            }

            return {
                success: true,
                batchId,
                totalProcessed: args.entityIds.length,
                successfulUpdates: successCount,
                failedUpdates: failCount,
                results
            };
        } catch (error) {
            console.error("Ошибка массового обновления версий:", error);
            throw new Error(`Не удалось выполнить массовое обновление версий: ${error instanceof Error ? error.message : "Неизвестная ошибка"}`);
        }
    }
});

// Получение статистики производительности синхронизации
export const getSyncPerformanceStats = query({
    args: {
        timeRange: v.optional(v.union(
            v.literal("1h"),
            v.literal("24h"),
            v.literal("7d"),
            v.literal("30d")
        )),
        entityType: v.optional(entityTypeUnion)
    },
    handler: async (ctx, args) => {
        try {
            const timeRangeMs = {
                "1h": 60 * 60 * 1000,
                "24h": 24 * 60 * 60 * 1000,
                "7d": 7 * 24 * 60 * 60 * 1000,
                "30d": 30 * 24 * 60 * 60 * 1000
            };

            const cutoffTime = args.timeRange
                ? Date.now() - timeRangeMs[args.timeRange]
                : Date.now() - timeRangeMs["24h"];

            let logs;
            if (args.entityType !== undefined) {
                logs = await ctx.db.query("syncLog")
                    .withIndex("entity_timestamp", (q) =>
                        q.eq("entityType", args.entityType!).gte("timestamp", cutoffTime)
                    )
                    .collect();
            } else {
                logs = await ctx.db.query("syncLog")
                    .withIndex("by_timestamp", (q) => q.gte("timestamp", cutoffTime))
                    .collect();
            }

            const batches = await ctx.db.query("syncBatches")
                .withIndex("by_started", (q) => q.gte("startedAt", cutoffTime))
                .collect();

            const stats = {
                timeRange: args.timeRange || "24h",
                entityType: args.entityType,

                operations: {
                    total: logs.length,
                    successful: logs.filter(log => !log.errorMessage).length,
                    failed: logs.filter(log => !!log.errorMessage).length,
                    conflicts: logs.filter(log => log.action === "conflict").length,
                    retries: logs.filter(log => (log.retryCount || 0) > 0).length
                },

                batches: {
                    total: batches.length,
                    completed: batches.filter(batch => batch.status === "completed").length,
                    failed: batches.filter(batch => batch.status === "failed").length,
                    running: batches.filter(batch => batch.status === "running").length,
                    averageDuration: batches
                        .filter(batch => batch.completedAt && batch.startedAt)
                        .reduce((sum, batch) => sum + (batch.completedAt! - batch.startedAt), 0) /
                        Math.max(batches.filter(batch => batch.completedAt).length, 1)
                },

                throughput: {
                    operationsPerMinute: logs.length / Math.max((Date.now() - cutoffTime) / (60 * 1000), 1),
                    operationsPerHour: logs.length / Math.max((Date.now() - cutoffTime) / (60 * 60 * 1000), 1),
                    peakMinute: (() => {
                        const minuteCounts = logs.reduce((acc, log) => {
                            const minute = Math.floor(log.timestamp / (60 * 1000));
                            acc[minute] = (acc[minute] || 0) + 1;
                            return acc;
                        }, {} as Record<number, number>);

                        return Math.max(...Object.values(minuteCounts), 0);
                    })()
                },

                errorAnalysis: {
                    errorRate: logs.length > 0 ? (logs.filter(log => !!log.errorMessage).length / logs.length) * 100 : 0,
                    conflictRate: logs.length > 0 ? (logs.filter(log => log.action === "conflict").length / logs.length) * 100 : 0,
                    retryRate: logs.length > 0 ? (logs.filter(log => (log.retryCount || 0) > 0).length / logs.length) * 100 : 0,

                    topErrors: (() => {
                        const errorCounts = logs
                            .filter(log => log.errorMessage)
                            .reduce((acc, log) => {
                                const error = log.errorMessage!;
                                acc[error] = (acc[error] || 0) + 1;
                                return acc;
                            }, {} as Record<string, number>);

                        return Object.entries(errorCounts)
                            .sort(([, a], [, b]) => b - a)
                            .slice(0, 5)
                            .map(([error, count]) => ({ error, count }));
                    })()
                },

                entityBreakdown: (() => {
                    const entityStats = logs.reduce((acc, log) => {
                        if (!acc[log.entityType]) {
                            acc[log.entityType] = {
                                total: 0,
                                successful: 0,
                                failed: 0,
                                conflicts: 0
                            };
                        }

                        acc[log.entityType].total++;

                        if (log.errorMessage) {
                            acc[log.entityType].failed++;
                        } else {
                            acc[log.entityType].successful++;
                        }

                        if (log.action === "conflict") {
                            acc[log.entityType].conflicts++;
                        }

                        return acc;
                    }, {} as Record<string, any>);

                    return entityStats;
                })(),

                timeline: (() => {
                    const timeUnit = args.timeRange === "1h" ? 5 * 60 * 1000 : // 5 минут
                        args.timeRange === "24h" ? 60 * 60 * 1000 : // 1 час
                            args.timeRange === "7d" ? 6 * 60 * 60 * 1000 : // 6 часов
                                24 * 60 * 60 * 1000; // 1 день

                    const timeline = logs.reduce((acc, log) => {
                        const timeSlot = Math.floor(log.timestamp / timeUnit) * timeUnit;
                        if (!acc[timeSlot]) {
                            acc[timeSlot] = {
                                timestamp: timeSlot,
                                operations: 0,
                                errors: 0,
                                conflicts: 0
                            };
                        }

                        acc[timeSlot].operations++;
                        if (log.errorMessage) acc[timeSlot].errors++;
                        if (log.action === "conflict") acc[timeSlot].conflicts++;

                        return acc;
                    }, {} as Record<number, any>);

                    return Object.values(timeline).sort((a, b) => a.timestamp - b.timestamp);
                })()
            };

            return stats;
        } catch (error) {
            console.error("Ошибка получения статистики производительности:", error);
            return {
                timeRange: args.timeRange || "24h",
                entityType: args.entityType,
                operations: { total: 0, successful: 0, failed: 0, conflicts: 0, retries: 0 },
                batches: { total: 0, completed: 0, failed: 0, running: 0, averageDuration: 0 },
                throughput: { operationsPerMinute: 0, operationsPerHour: 0, peakMinute: 0 },
                errorAnalysis: { errorRate: 0, conflictRate: 0, retryRate: 0, topErrors: [] },
                entityBreakdown: {},
                timeline: [],
                error: error instanceof Error ? error.message : "Неизвестная ошибка"
            };
        }
    }
});

// Настройка автоматических правил синхронизации
export const configureAutoSyncRules = mutation({
    args: {
        entityType: entityTypeUnion,
        rules: v.array(v.object({
            name: v.string(),
            condition: v.object({
                field: v.string(),
                operator: v.union(
                    v.literal("equals"),
                    v.literal("not_equals"),
                    v.literal("greater_than"),
                    v.literal("less_than"),
                    v.literal("contains"),
                    v.literal("exists"),
                    v.literal("not_exists")
                ),
                value: v.any()
            }),
            action: v.object({
                type: v.union(
                    v.literal("auto_resolve_conflict"),
                    v.literal("prioritize_sync"),
                    v.literal("skip_sync"),
                    v.literal("force_server_wins"),
                    v.literal("force_client_wins"),
                    v.literal("require_manual_review")
                ),
                parameters: v.optional(v.record(v.string(), v.any()))
            }),
            priority: v.number(),
            enabled: v.boolean()
        })),
        updatedBy: v.string()
    },
    handler: async (ctx, args) => {
        try {
            const existingConfig = await ctx.db
                .query("syncConfiguration")
                .withIndex("by_entity", (q) => q.eq("entityType", args.entityType))
                .first();

            const customRules = args.rules.map(rule => ({
                field: rule.name,
                rule: JSON.stringify({
                    condition: rule.condition,
                    action: rule.action,
                    priority: rule.priority,
                    enabled: rule.enabled
                }),
                value: rule.enabled
            }));

            if (existingConfig) {
                await ctx.db.patch(existingConfig._id, {
                    customRules,
                    updatedBy: args.updatedBy,
                    updatedAt: Date.now(),
                    metadata: {
                        ...existingConfig.metadata,
                        rulesUpdated: true,
                        rulesCount: args.rules.length
                    }
                });
                return { success: true, updated: true, configId: existingConfig._id };
            } else {
                // Создаем новую конфигурацию с правилами по умолчанию
                const configId = await ctx.db.insert("syncConfiguration", {
                    entityType: args.entityType,
                    syncEnabled: true,
                    syncInterval: 60000, // 1 минута
                    batchSize: 100,
                    maxRetries: 3,
                    retryDelay: 5000,
                    conflictResolutionStrategy: "manual",
                    priority: "normal",
                    enableRealTimeSync: true,
                    enableConflictDetection: true,
                    enableMetrics: true,
                    customRules,
                    updatedBy: args.updatedBy,
                    updatedAt: Date.now(),
                    metadata: {
                        rulesCreated: true,
                        rulesCount: args.rules.length
                    }
                });
                return { success: true, updated: false, configId };
            }
        } catch (error) {
            console.error("Ошибка настройки правил автосинхронизации:", error);
            throw new Error(`Не удалось настроить правила автосинхронизации: ${error instanceof Error ? error.message : "Неизвестная ошибка"}`);
        }
    }
});

// Применение правил автосинхронизации
export const applyAutoSyncRules = mutation({
    args: {
        entityType: entityTypeUnion,
        entityId: v.string(),
        entityData: v.any(),
        conflictData: v.optional(v.object({
            serverData: v.any(),
            clientData: v.any(),
            conflictFields: v.array(v.string())
        })),
        userId: v.string()
    },
    handler: async (ctx, args) => {
        try {
            const config = await ctx.db
                .query("syncConfiguration")
                .withIndex("by_entity", (q) => q.eq("entityType", args.entityType))
                .first();

            if (!config || !config.customRules) {
                return {
                    applied: false,
                    reason: "No custom rules configured",
                    action: "manual_review"
                };
            }

            const applicableRules = [];

            // Проверяем каждое правило
            for (const rule of config.customRules) {
                try {
                    const ruleData = JSON.parse(rule.rule);

                    if (!ruleData.enabled) continue;

                    const { condition, action, priority } = ruleData;

                    // Проверяем условие
                    let conditionMet = false;
                    const fieldValue = args.entityData[condition.field];

                    switch (condition.operator) {
                        case "equals":
                            conditionMet = fieldValue === condition.value;
                            break;
                        case "not_equals":
                            conditionMet = fieldValue !== condition.value;
                            break;
                        case "greater_than":
                            conditionMet = fieldValue > condition.value;
                            break;
                        case "less_than":
                            conditionMet = fieldValue < condition.value;
                            break;
                        case "contains":
                            conditionMet = String(fieldValue).includes(condition.value);
                            break;
                        case "exists":
                            conditionMet = fieldValue !== undefined && fieldValue !== null;
                            break;
                        case "not_exists":
                            conditionMet = fieldValue === undefined || fieldValue === null;
                            break;
                    }

                    if (conditionMet) {
                        applicableRules.push({ ...ruleData, name: rule.field });
                    }
                } catch (error) {
                    console.error(`Ошибка обработки правила ${rule.field}:`, error);
                }
            }

            if (applicableRules.length === 0) {
                return {
                    applied: false,
                    reason: "No applicable rules found",
                    action: "manual_review"
                };
            }

            // Сортируем правила по приоритету
            applicableRules.sort((a, b) => a.priority - b.priority);
            const topRule = applicableRules[0];

            // Базовый результат
            let result: {
                applied: boolean;
                ruleName: any;
                action: any;
                parameters: any;
                priority: any;
                resolvedData?: any;
                strategy?: string;
            } = {
                applied: true,
                ruleName: topRule.name,
                action: topRule.action.type,
                parameters: topRule.action.parameters,
                priority: topRule.priority
            };

            // Применяем действие
            switch (topRule.action.type) {
                case "auto_resolve_conflict":
                    if (args.conflictData) {
                        const strategy = topRule.action.parameters?.strategy || "server_wins";
                        const resolvedData = strategy === "server_wins"
                            ? args.conflictData.serverData
                            : args.conflictData.clientData;

                        await ctx.db.insert("syncLog", {
                            entityType: args.entityType,
                            entityId: args.entityId,
                            action: "conflict",
                            userId: args.userId,
                            timestamp: Date.now(),
                            conflictResolution: strategy === "server_wins" ? "server" : "client",
                            newData: resolvedData,
                            metadata: {
                                autoResolved: true,
                                ruleName: topRule.name,
                                strategy
                            }
                        });

                        result.resolvedData = resolvedData;
                        result.strategy = strategy;
                    }
                    break;

                case "prioritize_sync":
                    await ctx.db.insert("syncLog", {
                        entityType: args.entityType,
                        entityId: args.entityId,
                        action: "sync",
                        userId: args.userId,
                        timestamp: Date.now(),
                        metadata: {
                            prioritized: true,
                            ruleName: topRule.name,
                            priority: "high"
                        }
                    });
                    break;

                case "skip_sync":
                    await ctx.db.insert("syncLog", {
                        entityType: args.entityType,
                        entityId: args.entityId,
                        action: "sync",
                        userId: args.userId,
                        timestamp: Date.now(),
                        metadata: {
                            skipped: true,
                            ruleName: topRule.name,
                            reason: topRule.action.parameters?.reason || "Rule-based skip"
                        }
                    });
                    break;

                case "force_server_wins":
                case "force_client_wins":
                    if (args.conflictData) {
                        const strategy = topRule.action.type === "force_server_wins" ? "server_wins" : "client_wins";
                        const resolvedData = strategy === "server_wins"
                            ? args.conflictData.serverData
                            : args.conflictData.clientData;

                        await ctx.db.insert("syncLog", {
                            entityType: args.entityType,
                            entityId: args.entityId,
                            action: "conflict",
                            userId: args.userId,
                            timestamp: Date.now(),
                            conflictResolution: strategy === "server_wins" ? "server" : "client",
                            newData: resolvedData,
                            metadata: {
                                forcedResolution: true,
                                ruleName: topRule.name,
                                strategy
                            }
                        });

                        result.resolvedData = resolvedData;
                        result.strategy = strategy;
                    }
                    break;

                case "require_manual_review":
                    if (args.conflictData) {
                        await ctx.db.insert("conflictResolution", {
                            entityType: args.entityType,
                            entityId: args.entityId,
                            conflictType: "field_conflict",
                            serverData: args.conflictData.serverData,
                            clientData: args.conflictData.clientData,
                            conflictFields: args.conflictData.conflictFields,
                            priority: "high",
                            notes: `Manual review required by rule: ${topRule.name}`,
                            createdAt: Date.now(),
                            isResolved: false,
                            metadata: {
                                ruleName: topRule.name,
                                requiresManualReview: true
                            }
                        });
                    }
                    break;
            }

            return result;
        } catch (error) {
            console.error("Ошибка применения правил автосинхронизации:", error);
            return {
                applied: false,
                reason: error instanceof Error ? error.message : "Неизвестная ошибка",
                action: "manual_review"
            };
        }
    }
});

// Получение отчета о синхронизации
export const generateSyncReport = query({
    args: {
        reportType: v.union(
            v.literal("daily"),
            v.literal("weekly"),
            v.literal("monthly"),
            v.literal("custom")
        ),
        timeRange: v.optional(v.object({
            start: v.number(),
            end: v.number()
        })),
        entityTypes: v.optional(v.array(entityTypeUnion)),
        includeDetails: v.optional(v.boolean())
    },
    handler: async (ctx, args) => {
        try {
            let startTime: number;
            let endTime = Date.now();

            // Определяем временной диапазон
            switch (args.reportType) {
                case "daily":
                    startTime = endTime - (24 * 60 * 60 * 1000);
                    break;
                case "weekly":
                    startTime = endTime - (7 * 24 * 60 * 60 * 1000);
                    break;
                case "monthly":
                    startTime = endTime - (30 * 24 * 60 * 60 * 1000);
                    break;
                case "custom":
                    if (!args.timeRange) {
                        throw new Error("Custom report requires timeRange");
                    }
                    startTime = args.timeRange.start;
                    endTime = args.timeRange.end;
                    break;
            }

            // Получаем данные
            const [logs, batches, conflicts, sessions] = await Promise.all([
                ctx.db.query("syncLog")
                    .withIndex("by_timestamp", (q) =>
                        q.gte("timestamp", startTime).lte("timestamp", endTime)
                    )
                    .collect(),
                ctx.db.query("syncBatches")
                    .withIndex("by_started", (q) =>
                        q.gte("startedAt", startTime).lte("startedAt", endTime)
                    )
                    .collect(),
                ctx.db.query("conflictResolution")
                    .withIndex("by_created", (q) =>
                        q.gte("createdAt", startTime).lte("createdAt", endTime)
                    )
                    .collect(),
                ctx.db.query("activeSessions")
                    .withIndex("by_last_activity", (q) =>
                        q.gte("lastActivity", startTime).lte("lastActivity", endTime)
                    )
                    .collect()
            ]);

            // Фильтруем по типам сущностей, если указано
            let filteredLogs = logs;
            if (args.entityTypes && args.entityTypes.length > 0) {
                filteredLogs = logs.filter(log =>
                    args.entityTypes!.some(entityType => entityType === log.entityType)
                );
            }

            // Остальная часть функции остается без изменений...
            const report = {
                reportType: args.reportType,
                timeRange: { start: startTime, end: endTime },
                generatedAt: Date.now(),

                summary: {
                    totalOperations: filteredLogs.length,
                    successfulOperations: filteredLogs.filter(log => !log.errorMessage).length,
                    failedOperations: filteredLogs.filter(log => !!log.errorMessage).length,
                    conflictOperations: filteredLogs.filter(log => log.action === "conflict").length,

                    totalBatches: batches.length,
                    completedBatches: batches.filter(batch => batch.status === "completed").length,
                    failedBatches: batches.filter(batch => batch.status === "failed").length,

                    totalConflicts: conflicts.length,
                    resolvedConflicts: conflicts.filter(conflict => conflict.isResolved).length,
                    unresolvedConflicts: conflicts.filter(conflict => !conflict.isResolved).length,

                    activeSessions: sessions.filter(session => session.isActive).length,
                    totalSessions: sessions.length
                },

                performance: {
                    averageOperationsPerHour: filteredLogs.length / Math.max((endTime - startTime) / (60 * 60 * 1000), 1),
                    errorRate: filteredLogs.length > 0 ? (filteredLogs.filter(log => !!log.errorMessage).length / filteredLogs.length) * 100 : 0,
                    conflictRate: filteredLogs.length > 0 ? (filteredLogs.filter(log => log.action === "conflict").length / filteredLogs.length) * 100 : 0,

                    averageBatchDuration: batches
                        .filter(batch => batch.completedAt && batch.startedAt)
                        .reduce((sum, batch) => sum + (batch.completedAt! - batch.startedAt), 0) /
                        Math.max(batches.filter(batch => batch.completedAt).length, 1),

                    batchSuccessRate: batches.length > 0 ? (batches.filter(batch => batch.status === "completed").length / batches.length) * 100 : 0
                },

                entityBreakdown: (() => {
                    const breakdown: Record<string, any> = {};

                    filteredLogs.forEach(log => {
                        if (!breakdown[log.entityType]) {
                            breakdown[log.entityType] = {
                                totalOperations: 0,
                                successfulOperations: 0,
                                failedOperations: 0,
                                conflictOperations: 0,
                                lastSync: 0
                            };
                        }

                        breakdown[log.entityType].totalOperations++;

                        if (log.errorMessage) {
                            breakdown[log.entityType].failedOperations++;
                        } else {
                            breakdown[log.entityType].successfulOperations++;
                        }

                        if (log.action === "conflict") {
                            breakdown[log.entityType].conflictOperations++;
                        }

                        if (log.timestamp > breakdown[log.entityType].lastSync) {
                            breakdown[log.entityType].lastSync = log.timestamp;
                        }
                    });

                    return breakdown;
                })(),

                trends: (() => {
                    const timeUnit = args.reportType === "daily" ? 60 * 60 * 1000 : // 1 час
                        args.reportType === "weekly" ? 24 * 60 * 60 * 1000 : // 1 день
                            7 * 24 * 60 * 60 * 1000; // 1 неделя

                    const trends: Record<number, any> = {};

                    filteredLogs.forEach(log => {
                        const timeSlot = Math.floor(log.timestamp / timeUnit) * timeUnit;

                        if (!trends[timeSlot]) {
                            trends[timeSlot] = {
                                timestamp: timeSlot,
                                operations: 0,
                                errors: 0,
                                conflicts: 0,
                                batches: 0
                            };
                        }

                        trends[timeSlot].operations++;
                        if (log.errorMessage) trends[timeSlot].errors++;
                        if (log.action === "conflict") trends[timeSlot].conflicts++;
                    });

                    batches.forEach(batch => {
                        const timeSlot = Math.floor(batch.startedAt / timeUnit) * timeUnit;
                        if (trends[timeSlot]) {
                            trends[timeSlot].batches++;
                        }
                    });

                    return Object.values(trends).sort((a, b) => a.timestamp - b.timestamp);
                })(),

                topErrors: (() => {
                    const errorCounts: Record<string, number> = {};

                    filteredLogs
                        .filter(log => log.errorMessage)
                        .forEach(log => {
                            const error = log.errorMessage!;
                            errorCounts[error] = (errorCounts[error] || 0) + 1;
                        });

                    return Object.entries(errorCounts)
                        .sort(([, a], [, b]) => b - a)
                        .slice(0, 10)
                        .map(([error, count]) => ({ error, count, percentage: (count / filteredLogs.length) * 100 }));
                })(),

                conflictAnalysis: {
                    byType: conflicts.reduce((acc, conflict) => {
                        acc[conflict.conflictType] = (acc[conflict.conflictType] || 0) + 1;
                        return acc;
                    }, {} as Record<string, number>),

                    byPriority: conflicts.reduce((acc, conflict) => {
                        acc[conflict.priority] = (acc[conflict.priority] || 0) + 1;
                        return acc;
                    }, {} as Record<string, number>),

                    resolutionMethods: conflicts
                        .filter(conflict => conflict.isResolved)
                        .reduce((acc, conflict) => {
                            const method = conflict.resolution || "unknown";
                            acc[method] = (acc[method] || 0) + 1;
                            return acc;
                        }, {} as Record<string, number>),

                    averageResolutionTime: (() => {
                        const resolvedConflicts = conflicts.filter(conflict =>
                            conflict.isResolved && conflict.resolvedAt
                        );

                        if (resolvedConflicts.length === 0) return 0;

                        const totalTime = resolvedConflicts.reduce((sum, conflict) =>
                            sum + (conflict.resolvedAt! - conflict.createdAt), 0
                        );

                        return totalTime / resolvedConflicts.length;
                    })()
                },

                recommendations: (() => {
                    const recommendations = [];

                    const errorRate = filteredLogs.length > 0 ?
                        (filteredLogs.filter(log => !!log.errorMessage).length / filteredLogs.length) * 100 : 0;

                    if (errorRate > 10) {
                        recommendations.push({
                            type: "high_error_rate",
                            priority: "high",
                            message: `Высокий уровень ошибок (${errorRate.toFixed(1)}%). Рекомендуется проверить конфигурацию и устранить основные причины ошибок.`
                        });
                    }

                    const conflictRate = filteredLogs.length > 0 ?
                        (filteredLogs.filter(log => log.action === "conflict").length / filteredLogs.length) * 100 : 0;

                    if (conflictRate > 5) {
                        recommendations.push({
                            type: "high_conflict_rate",
                            priority: "medium",
                            message: `Высокий уровень конфликтов (${conflictRate.toFixed(1)}%). Рассмотрите настройку автоматических правил разрешения конфликтов.`
                        });
                    }

                    const unresolvedConflictsCount = conflicts.filter(conflict => !conflict.isResolved).length;
                    if (unresolvedConflictsCount > 10) {
                        recommendations.push({
                            type: "unresolved_conflicts",
                            priority: "medium",
                            message: `Много неразрешенных конфликтов (${unresolvedConflictsCount}). Требуется ручное вмешательство.`
                        });
                    }

                    const failedBatchesCount = batches.filter(batch => batch.status === "failed").length;
                    if (failedBatchesCount > batches.length * 0.1) {
                        recommendations.push({
                            type: "failed_batches",
                            priority: "high",
                            message: `Высокий процент неудачных пакетов синхронизации (${((failedBatchesCount / batches.length) * 100).toFixed(1)}%). Проверьте настройки пакетной обработки.`
                        });
                    }

                    if (filteredLogs.length === 0) {
                        recommendations.push({
                            type: "no_activity",
                            priority: "high",
                            message: "Отсутствует активность синхронизации. Проверьте работу системы синхронизации."
                        });
                    }

                    return recommendations;
                })()
            };

            // Добавляем детальную информацию, если запрошено
            if (args.includeDetails) {
                (report as any).details = {
                    recentLogs: filteredLogs.slice(0, 100).map(log => ({
                        timestamp: log.timestamp,
                        entityType: log.entityType,
                        entityId: log.entityId,
                        action: log.action,
                        userId: log.userId,
                        hasError: !!log.errorMessage,
                        errorMessage: log.errorMessage,
                        conflictResolution: log.conflictResolution,
                        batchId: log.batchId,
                        retryCount: log.retryCount || 0
                    })),

                    recentBatches: batches.slice(0, 50).map(batch => ({
                        batchId: batch.batchId,
                        entityType: batch.entityType,
                        operation: batch.operation,
                        status: batch.status,
                        startedAt: batch.startedAt,
                        completedAt: batch.completedAt,
                        totalRecords: batch.totalRecords,
                        successfulRecords: batch.successfulRecords,
                        failedRecords: batch.failedRecords,
                        duration: batch.completedAt ? batch.completedAt - batch.startedAt : null
                    })),

                    recentConflicts: conflicts.slice(0, 50).map(conflict => ({
                        entityType: conflict.entityType,
                        entityId: conflict.entityId,
                        conflictType: conflict.conflictType,
                        priority: conflict.priority,
                        isResolved: conflict.isResolved,
                        resolution: conflict.resolution,
                        createdAt: conflict.createdAt,
                        resolvedAt: conflict.resolvedAt,
                        conflictFields: conflict.conflictFields
                    }))
                };
            }

            return report;
        } catch (error) {
            console.error("Ошибка генерации отчета о синхронизации:", error);
            return {
                reportType: args.reportType,
                timeRange: args.timeRange || { start: 0, end: Date.now() },
                generatedAt: Date.now(),
                summary: {
                    totalOperations: 0,
                    successfulOperations: 0,
                    failedOperations: 0,
                    conflictOperations: 0,
                    totalBatches: 0,
                    completedBatches: 0,
                    failedBatches: 0,
                    totalConflicts: 0,
                    resolvedConflicts: 0,
                    unresolvedConflicts: 0,
                    activeSessions: 0,
                    totalSessions: 0
                },
                performance: {
                    averageOperationsPerHour: 0,
                    errorRate: 0,
                    conflictRate: 0,
                    averageBatchDuration: 0,
                    batchSuccessRate: 0
                },
                entityBreakdown: {},
                trends: [],
                topErrors: [],
                conflictAnalysis: {
                    byType: {},
                    byPriority: {},
                    resolutionMethods: {},
                    averageResolutionTime: 0
                },
                recommendations: [{
                    type: "system_error",
                    priority: "critical",
                    message: `Ошибка при генерации отчета: ${error instanceof Error ? error.message : "Неизвестная ошибка"}`
                }],
                error: error instanceof Error ? error.message : "Неизвестная ошибка"
            };
        }
    }
});








