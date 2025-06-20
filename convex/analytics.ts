// convex/analytics.ts (исправленная версия)
import { query } from "./_generated/server";
import { v } from "convex/values";
import type { QueryCtx } from "./_generated/server";

// Вспомогательные функции для безопасного получения полей
function getProductName(product: any): string {
  return product?.title || product?.productName || `Product ${product?._id || 'Unknown'}`;
}

function getUserName(user: any): string {
  if (user?.firstName && user?.lastName) {
    return `${user.firstName} ${user.lastName}`;
  }
  return user?.firstName || user?.lastName || user?.email || user?.name || `User ${user?._id || 'Unknown'}`;
}

function getOrderTotal(order: any): number {
  return order?.totalPrice || order?.totalAmount || order?.total || order?.amount || 0;
}

function getProductPrice(product: any): number {
  return product?.price || product?.cost || product?.amount || 0;
}

function getProductStock(product: any): number {
  return product?.stock || product?.inStock || product?.quantity || 0;
}

function getItemName(item: any): string {
  return item?.productName || item?.title || `Item ${item?.productId || 'Unknown'}`;
}

// Функция для проверки валидности Convex ID
function isValidConvexId(id: any): boolean {
  return typeof id === 'string' && id.length > 20 && id.startsWith('k');
}

// Вспомогательная функция для безопасного получения продукта
async function safeGetProduct(ctx: QueryCtx, productId: any) {
  try {
    // Проверяем, является ли productId валидным Convex ID
    if (isValidConvexId(productId)) {
      return await ctx.db.get(productId as any);
    }
    
    // Если это строковый ID, ищем по различным полям
    if (typeof productId === 'string') {
      const products = await ctx.db.query("products").collect();
      return products.find(p => 
        getProductName(p) === productId || 
        p._id === productId
      );
    }
    
    return null;
  } catch (error) {
    console.log(`Error getting product ${productId}:`, error);
    return null;
  }
}

// Функция для безопасного получения пользователя
async function safeGetUser(ctx: QueryCtx, userId: any) {
  try {
    if (isValidConvexId(userId)) {
      return await ctx.db.get(userId as any);
    }
    return null;
  } catch (error) {
    console.log(`Error getting user ${userId}:`, error);
    return null;
  }
}

export const getAnalytics = query({
    args: {
        period: v.string(),
        startDate: v.optional(v.number()),
        endDate: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const { period, startDate, endDate } = args;

        const now = Date.now();
        let periodStart: number;
        let periodEnd = endDate || now;

        switch (period) {
            case "day":
                periodStart = startDate || (now - 24 * 60 * 60 * 1000);
                break;
            case "week":
                periodStart = startDate || (now - 7 * 24 * 60 * 60 * 1000);
                break;
            case "month":
                periodStart = startDate || (now - 30 * 24 * 60 * 60 * 1000);
                break;
            case "year":
                periodStart = startDate || (now - 365 * 24 * 60 * 60 * 1000);
                break;
            default:
                periodStart = startDate || (now - 30 * 24 * 60 * 60 * 1000);
        }

        // Получаем данные пользователей
        const allUsers = await ctx.db.query("users").collect();
        const usersInPeriod = allUsers.filter((user: any) =>
            user._creationTime >= periodStart && user._creationTime <= periodEnd
        );

        // Группируем пользователей по ролям
        const usersByRole: Record<string, number> = {};
        allUsers.forEach((user: any) => {
            const role = user.role || "member";
            usersByRole[role] = (usersByRole[role] || 0) + 1;
        });

        // Вычисляем тренд регистраций (последние 7 дней)
        const registrationTrend = [];
        for (let i = 6; i >= 0; i--) {
            const dayStart = now - (i * 24 * 60 * 60 * 1000);
            const dayEnd = dayStart + (24 * 60 * 60 * 1000);
            const dayUsers = allUsers.filter((user: any) =>
                user._creationTime >= dayStart && user._creationTime < dayEnd
            );
            registrationTrend.push({
                date: new Date(dayStart).toISOString().split('T')[0],
                count: dayUsers.length
            });
        }

        // Получаем данные продуктов
        const allProducts = await ctx.db.query("products").collect();
        const activeProducts = allProducts.filter((p: any) => p.isActive !== false);

        // Группируем продукты по категориям
        const productsByCategory: Record<string, number> = {};
        allProducts.forEach((product: any) => {
            const category = product.category || "other";
            productsByCategory[category] = (productsByCategory[category] || 0) + 1;
        });

        // Получаем данные заказов для выручки
        const allOrders = await ctx.db.query("orders").collect();
        const ordersInPeriod = allOrders.filter((order: any) =>
            order._creationTime >= periodStart && order._creationTime <= periodEnd
        );

        // Вычисляем общую выручку
        const totalRevenue = ordersInPeriod.reduce((sum: number, order: any) => {
            return sum + getOrderTotal(order);
        }, 0);

        // Выручка по продуктам
        const revenueByProduct: Record<string, { name: string; revenue: number }> = {};

        for (const order of ordersInPeriod) {
            if (order.items && Array.isArray(order.items)) {
                for (const item of order.items) {
                    if (item.productId) {
                        // Безопасное получение продукта
                        const product = await safeGetProduct(ctx, item.productId);
                        
                        if (product) {
                            const productName = getProductName(product);
                            const itemRevenue = (item.price || 0) * (item.quantity || 1);

                            const productKey = product._id || item.productId;
                            if (!revenueByProduct[productKey]) {
                                revenueByProduct[productKey] = { name: productName, revenue: 0 };
                            }
                            revenueByProduct[productKey].revenue += itemRevenue;
                        } else {
                            // Если продукт не найден, используем данные из заказа
                            const productName = getItemName(item);
                            const itemRevenue = (item.price || 0) * (item.quantity || 1);
                            
                            const productKey = String(item.productId);
                            if (!revenueByProduct[productKey]) {
                                revenueByProduct[productKey] = { name: productName, revenue: 0 };
                            }
                            revenueByProduct[productKey].revenue += itemRevenue;
                        }
                    }
                }
            }
        }

        // Тренд выручки (последние 7 дней)
        const revenueTrend = [];
        for (let i = 6; i >= 0; i--) {
            const dayStart = now - (i * 24 * 60 * 60 * 1000);
            const dayEnd = dayStart + (24 * 60 * 60 * 1000);
            const dayOrders = allOrders.filter((order: any) =>
                order._creationTime >= dayStart && order._creationTime < dayEnd
            );
            const dayRevenue = dayOrders.reduce((sum: number, order: any) =>
                sum + getOrderTotal(order), 0
            );

            revenueTrend.push({
                date: new Date(dayStart).toISOString().split('T')[0],
                amount: dayRevenue
            });
        }

        // Получаем данные активности (с обработкой ошибок)
        let activityData: {
            totalSessions: number;
            averageSessionTime: number;
            pageViews: number;
            bounceRate: number;
            topPages: Array<{ page: string; views: number }>;
        } = {
            totalSessions: 0,
            averageSessionTime: 0,
            pageViews: 0,
            bounceRate: 0,
            topPages: []
        };

        try {
            const sessions = await ctx.db.query("sessions").collect();
            const sessionsInPeriod = sessions.filter((session: any) =>
                session._creationTime >= periodStart && session._creationTime <= periodEnd
            );

            activityData.totalSessions = sessionsInPeriod.length;

            if (sessionsInPeriod.length > 0) {
                const totalSessionTime = sessionsInPeriod.reduce((sum: number, session: any) =>
                    sum + (session.duration || 0), 0
                );
                activityData.averageSessionTime = totalSessionTime / sessionsInPeriod.length;

                activityData.pageViews = sessionsInPeriod.reduce((sum: number, session: any) =>
                    sum + (session.pageViews || 1), 0
                );
            }
        } catch (error) {
            console.log("Sessions table not found or error occurred, using default values");
            // Используем приблизительные данные на основе пользователей
            activityData.totalSessions = usersInPeriod.length;
            activityData.pageViews = usersInPeriod.length * 3;
            activityData.averageSessionTime = 1200; // 20 минут
            activityData.bounceRate = 25;
            activityData.topPages = [
                { page: "/dashboard", views: Math.floor(usersInPeriod.length * 0.8) },
                { page: "/products", views: Math.floor(usersInPeriod.length * 0.6) },
                { page: "/profile", views: Math.floor(usersInPeriod.length * 0.4) },
            ];
        }

        // Вычисляем рост пользователей
        const previousPeriodStart = periodStart - (periodEnd - periodStart);
        const previousPeriodUsers = allUsers.filter((user: any) =>
            user._creationTime >= previousPeriodStart && user._creationTime < periodStart
        );

        const userGrowth = previousPeriodUsers.length > 0
            ? ((usersInPeriod.length - previousPeriodUsers.length) / previousPeriodUsers.length) * 100
            : 0;

        // Вычисляем рост выручки
        const previousPeriodOrders = allOrders.filter((order: any) =>
            order._creationTime >= previousPeriodStart && order._creationTime < periodStart
        );
        const previousRevenue = previousPeriodOrders.reduce((sum: number, order: any) =>
            sum + getOrderTotal(order), 0
        );
        const revenueGrowth = previousRevenue > 0
            ? ((totalRevenue - previousRevenue) / previousRevenue) * 100
            : 0;

        return {
            users: {
                total: allUsers.length,
                active: allUsers.filter((user: any) => user.isActive !== false).length,
                new: usersInPeriod.length,
                growth: Math.round(userGrowth * 10) / 10,
                byRole: usersByRole,
                registrationTrend
            },
            products: {
                total: allProducts.length,
                inStock: activeProducts.filter((p: any) => getProductStock(p) > 0).length,
                lowStock: activeProducts.filter((p: any) => {
                    const currentStock = getProductStock(p);
                    const minStock = p.minStock || 5;
                    return currentStock > 0 && currentStock <= minStock;
                }).length,
                outOfStock: activeProducts.filter((p: any) => getProductStock(p) === 0).length,
                totalValue: activeProducts.reduce((sum: number, p: any) => {
                    const price = getProductPrice(p);
                    const stock = getProductStock(p);
                    return sum + (price * stock);
                }, 0),
                byCategory: productsByCategory,
                salesTrend: []
            },
            activity: activityData,
            revenue: {
                total: totalRevenue,
                monthly: totalRevenue,
                growth: Math.round(revenueGrowth * 10) / 10,
                byProduct: Object.values(revenueByProduct).sort((a, b) => b.revenue - a.revenue),
                trend: revenueTrend
            }
        };
    },
});

// Остальные функции с исправлениями...

async function getUserStatsInternal(ctx: QueryCtx, period: string) {
    const now = Date.now();
    let periodStart: number;

    switch (period) {
        case "day":
            periodStart = now - 24 * 60 * 60 * 1000;
            break;
        case "week":
            periodStart = now - 7 * 24 * 60 * 60 * 1000;
            break;
        case "month":
            periodStart = now - 30 * 24 * 60 * 60 * 1000;
            break;
        case "year":
            periodStart = now - 365 * 24 * 60 * 60 * 1000;
            break;
        default:
            periodStart = now - 30 * 24 * 60 * 60 * 1000;
    }

    const allUsers = await ctx.db.query("users").collect();
    const newUsers = allUsers.filter((user: any) => user._creationTime >= periodStart);

    // Группируем по ролям с активностью
    const byRole: Record<string, { count: number; active: number }> = {};

    allUsers.forEach((user: any) => {
        const role = user.role || "member";
        if (!byRole[role]) {
            byRole[role] = { count: 0, active: 0 };
        }
        byRole[role].count++;
        if (user.isActive !== false) {
            byRole[role].active++;
        }
    });

    return {
        total: allUsers.length,
        active: allUsers.filter((user: any) => user.isActive !== false).length,
        newInPeriod: newUsers.length,
        byRole,
        activityRate: allUsers.length > 0
            ? (allUsers.filter((user: any) => user.isActive !== false).length / allUsers.length) * 100
            : 0
    };
}

export const getUserStats = query({
    args: { period: v.string() },
    handler: async (ctx, args) => {
        return await getUserStatsInternal(ctx, args.period);
    },
});

async function getProductStatsInternal(ctx: QueryCtx) {
    const allProducts = await ctx.db.query("products").collect();
    const activeProducts = allProducts.filter((p: any) => p.isActive !== false);

    // Группируем по категориям
    const byCategory: Record<string, {
        count: number;
        inStock: number;
        totalValue: number;
        averagePrice: number;
    }> = {};

    allProducts.forEach((product: any) => {
        const category = product.category || "other";
        if (!byCategory[category]) {
            byCategory[category] = { count: 0, inStock: 0, totalValue: 0, averagePrice: 0 };
        }

        byCategory[category].count++;
        const currentStock = getProductStock(product);
        if (currentStock > 0) {
            byCategory[category].inStock++;
        }
        const price = getProductPrice(product);
        byCategory[category].totalValue += price * currentStock;
    });

    // Вычисляем среднюю цену по категориям
    Object.keys(byCategory).forEach(category => {
        const categoryProducts = allProducts.filter((p: any) => (p.category || "other") === category);
        const totalPrice = categoryProducts.reduce((sum: number, p: any) => sum + getProductPrice(p), 0);
        byCategory[category].averagePrice = categoryProducts.length > 0
            ? Math.round(totalPrice / categoryProducts.length)
            : 0;
    });

    // Находим товары с низким остатком
    const lowStockProducts = activeProducts
        .filter((p: any) => {
            const currentStock = getProductStock(p);
            const minStock = p.minStock || 5;
            return currentStock > 0 && currentStock <= minStock;
        })
        .map((p: any) => ({
            id: p._id,
            name: getProductName(p),
            currentStock: getProductStock(p),
            minStock: p.minStock || 5,
            category: p.category || "other"
        }));

    return {
        total: allProducts.length,
        active: activeProducts.length,
        inStock: activeProducts.filter((p: any) => getProductStock(p) > 0).length,
        lowStock: activeProducts.filter((p: any) => {
            const currentStock = getProductStock(p);
            const minStock = p.minStock || 5;
            return currentStock > 0 && currentStock <= minStock;
        }).length,
        outOfStock: activeProducts.filter((p: any) => getProductStock(p) === 0).length,
        totalValue: activeProducts.reduce((sum: number, p: any) => {
            const price = getProductPrice(p);
            const stock = getProductStock(p);
            return sum + (price * stock);
        }, 0),
        byCategory,
        lowStockProducts
    };
}

export const getProductStats = query({
    args: {},
    handler: async (ctx, args) => {
        return await getProductStatsInternal(ctx);
    },
});

async function getRevenueStatsInternal(ctx: QueryCtx, period: string, startDate?: number, endDate?: number) {
    const now = Date.now();
    let periodStart: number;
    let periodEnd = endDate || now;

    switch (period) {
        case "day":
            periodStart = startDate || (now - 24 * 60 * 60 * 1000);
            break;
        case "week":
            periodStart = startDate || (now - 7 * 24 * 60 * 60 * 1000);
            break;
        case "month":
            periodStart = startDate || (now - 30 * 24 * 60 * 60 * 1000);
            break;
        case "year":
            periodStart = startDate || (now - 365 * 24 * 60 * 60 * 1000);
            break;
        default:
            periodStart = startDate || (now - 30 * 24 * 60 * 60 * 1000);
    }

    const allOrders = await ctx.db.query("orders").collect();
    const ordersInPeriod = allOrders.filter((order: any) =>
        order._creationTime >= periodStart && order._creationTime <= periodEnd
    );

    // Вычисляем общую выручку
    const totalRevenue = ordersInPeriod.reduce((sum: number, order: any) =>
        sum + getOrderTotal(order), 0
    );

    // Топ продукты по выручке
    const productRevenue: Record<string, { name: string; revenue: number }> = {};

    for (const order of ordersInPeriod) {
        if (order.items && Array.isArray(order.items)) {
            for (const item of order.items) {
                if (item.productId) {
                    // Безопасное получение продукта
                    const product = await safeGetProduct(ctx, item.productId);
                    
                    if (product) {
                        const productName = getProductName(product);
                        const itemRevenue = (item.price || 0) * (item.quantity || 1);

                        if (!productRevenue[product._id]) {
                            productRevenue[product._id] = { name: productName, revenue: 0 };
                        }
                        productRevenue[product._id].revenue += itemRevenue;
                    } else {
                        // Используем данные из заказа
                        const productName = getItemName(item);
                        const itemRevenue = (item.price || 0) * (item.quantity || 1);
                        
                        const productKey = String(item.productId);
                        if (!productRevenue[productKey]) {
                            productRevenue[productKey] = { name: productName, revenue: 0 };
                        }
                        productRevenue[productKey].revenue += itemRevenue;
                    }
                }
            }
        }
    }

    const topProducts = Object.values(productRevenue)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10);

    // Дневной тренд выручки
    const dailyTrend = [];
    const days = period === "year" ? 30 : period === "month" ? 30 : 7;

    for (let i = days - 1; i >= 0; i--) {
        const dayStart = now - (i * 24 * 60 * 60 * 1000);
        const dayEnd = dayStart + (24 * 60 * 60 * 1000);
        const dayOrders = allOrders.filter((order: any) =>
            order._creationTime >= dayStart && order._creationTime < dayEnd
        );
        const dayRevenue = dayOrders.reduce((sum: number, order: any) =>
            sum + getOrderTotal(order), 0
        );

        dailyTrend.push({
            date: new Date(dayStart).toISOString().split('T')[0],
            amount: dayRevenue,
            orders: dayOrders.length
        });
    }

    // Сравнение с предыдущим периодом
    const previousPeriodStart = periodStart - (periodEnd - periodStart);
    const previousPeriodOrders = allOrders.filter((order: any) =>
        order._creationTime >= previousPeriodStart && order._creationTime < periodStart
    );
    const previousRevenue = previousPeriodOrders.reduce((sum: number, order: any) =>
        sum + getOrderTotal(order), 0
    );

    const growth = previousRevenue > 0
        ? ((totalRevenue - previousRevenue) / previousRevenue) * 100
        : 0;

    const averageOrderValue = ordersInPeriod.length > 0
        ? totalRevenue / ordersInPeriod.length
        : 0;

    return {
        total: totalRevenue,
        growth: Math.round(growth * 10) / 10,
        ordersCount: ordersInPeriod.length,
        averageOrderValue: Math.round(averageOrderValue),
        topProducts,
        dailyTrend,
        previousPeriod: {
            revenue: previousRevenue,
            ordersCount: previousPeriodOrders.length,
        }
    };
}

export const getRevenueStats = query({
    args: {
        period: v.string(),
        startDate: v.optional(v.number()),
        endDate: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        return await getRevenueStatsInternal(ctx, args.period, args.startDate, args.endDate);
    },
});

export const getActivityStats = query({
    args: { period: v.string() },
    handler: async (ctx, args) => {
        const { period } = args;

        const now = Date.now();
        let periodStart: number;

        switch (period) {
            case "day":
                periodStart = now - 24 * 60 * 60 * 1000;
                break;
            case "week":
                periodStart = now - 7 * 24 * 60 * 60 * 1000;
                break;
            case "month":
                periodStart = now - 30 * 24 * 60 * 60 * 1000;
                break;
            case "year":
                periodStart = now - 365 * 24 * 60 * 60 * 1000;
                break;
            default:
                periodStart = now - 30 * 24 * 60 * 60 * 1000;
        }

        let activityData: {
            totalSessions: number;
            averageSessionTime: number;
            pageViews: number;
            bounceRate: number;
            topPages: Array<{ page: string; views: number }>;
        } = {
            totalSessions: 0,
            averageSessionTime: 0,
            pageViews: 0,
            bounceRate: 0,
            topPages: []
        };

        try {
            const sessions = await ctx.db.query("sessions").collect();
            const sessionsInPeriod = sessions.filter((session: any) =>
                session._creationTime >= periodStart && session._creationTime <= now
            );

            activityData.totalSessions = sessionsInPeriod.length;

            if (sessionsInPeriod.length > 0) {
                const totalSessionTime = sessionsInPeriod.reduce((sum: number, session: any) =>
                    sum + (session.duration || 0), 0
                );
                activityData.averageSessionTime = totalSessionTime / sessionsInPeriod.length;

                activityData.pageViews = sessionsInPeriod.reduce((sum: number, session: any) =>
                    sum + (session.pageViews || 1), 0
                );

                // Подсчет популярных страниц
                const pageStats: Record<string, number> = {};
                sessionsInPeriod.forEach((session: any) => {
                    if (session.pages) {
                        session.pages.forEach((page: string) => {
                            pageStats[page] = (pageStats[page] || 0) + 1;
                        });
                    }
                });

                activityData.topPages = Object.entries(pageStats)
                    .map(([page, views]) => ({ page, views }))
                    .sort((a, b) => b.views - a.views)
                    .slice(0, 5);

                // Вычисляем bounce rate (сессии с одной страницей)
                const singlePageSessions = sessionsInPeriod.filter((session: any) =>
                    (session.pageViews || 1) === 1
                );
                activityData.bounceRate = Math.round((singlePageSessions.length / sessionsInPeriod.length) * 100);
            }
        } catch (error) {
            // Если таблица sessions не существует, используем данные пользователей
            const users = await ctx.db.query("users").collect();
            const activeUsers = users.filter((user: any) =>
                user.lastLogin && user.lastLogin >= periodStart
            );

            activityData.totalSessions = activeUsers.length;
            activityData.pageViews = activeUsers.length * 3;
            activityData.averageSessionTime = 1200;
            activityData.bounceRate = 25;
            activityData.topPages = [
                { page: "/dashboard", views: Math.floor(activeUsers.length * 0.8) },
                { page: "/products", views: Math.floor(activeUsers.length * 0.6) },
                { page: "/profile", views: Math.floor(activeUsers.length * 0.4) },
                { page: "/orders", views: Math.floor(activeUsers.length * 0.3) },
                { page: "/settings", views: Math.floor(activeUsers.length * 0.2) },
            ];
        }

        return activityData;
    },
});

// Упрощенные функции для тренеров и абонементов
export const getTrainerStats = query({
    args: {
        period: v.string(),
        trainerId: v.optional(v.id("trainers")),
    },
    handler: async (ctx, args) => {
        return {
            totalClients: 0,
            activeClients: 0,
            revenue: 0,
            sessionsCount: 0,
            averageSessionPrice: 0,
            clientRetentionRate: 0,
        };
    },
});

export const getMembershipStats = query({
    args: { period: v.string() },
    handler: async (ctx, args) => {
        return {
            totalMemberships: 0,
            activeMemberships: 0,
            expiringThisMonth: 0,
            revenue: 0,
            averageMembershipPrice: 0,
        };
    },
});

export const getDashboardAnalytics = query({
    args: {},
    handler: async (ctx, args) => {
        const now = Date.now();
        const todayStart = new Date(now).setHours(0, 0, 0, 0);
        const weekStart = now - (7 * 24 * 60 * 60 * 1000);

        // Сегодняшние данные
        const todayUsers = await ctx.db.query("users")
            .filter(q => q.gte(q.field("_creationTime"), todayStart))
            .collect();

        const todayOrders = await ctx.db.query("orders")
            .filter(q => q.gte(q.field("_creationTime"), todayStart))
            .collect();

        const todayRevenue = todayOrders.reduce((sum: number, order: any) =>
            sum + getOrderTotal(order), 0
        );

        // Недельные данные
        const weekUsers = await ctx.db.query("users")
            .filter(q => q.gte(q.field("_creationTime"), weekStart))
            .collect();

        const weekOrders = await ctx.db.query("orders")
            .filter(q => q.gte(q.field("_creationTime"), weekStart))
            .collect();

        const weekRevenue = weekOrders.reduce((sum: number, order: any) =>
            sum + getOrderTotal(order), 0
        );

        // Примерные данные сессий
        let todaySessions = Math.floor(todayUsers.length * 1.5);
                let weekSessions = Math.floor(weekUsers.length * 2);

        try {
            const sessions = await ctx.db.query("sessions").collect();
            todaySessions = sessions.filter((s: any) => s._creationTime >= todayStart).length;
            weekSessions = sessions.filter((s: any) => s._creationTime >= weekStart).length;
        } catch (error) {
            // Используем расчетные значения
        }

        return {
            todayStats: {
                newUsers: todayUsers.length,
                revenue: todayRevenue,
                orders: todayOrders.length,
                sessions: todaySessions,
            },
            weekStats: {
                newUsers: weekUsers.length,
                revenue: weekRevenue,
                orders: weekOrders.length,
                sessions: weekSessions,
            },
        };
    },
});

export const getExportData = query({
    args: {
        type: v.string(),
        startDate: v.optional(v.number()),
        endDate: v.optional(v.number()),
        format: v.string(),
    },
    handler: async (ctx, args) => {
        const { type, startDate, endDate, format } = args;

        const now = Date.now();
        const periodStart = startDate || (now - 30 * 24 * 60 * 60 * 1000);
        const periodEnd = endDate || now;

        let exportData: any = {};
        let count = 0;

        switch (type) {
            case "users":
                const users = await ctx.db.query("users").collect();
                const filteredUsers = users.filter((user: any) =>
                    user._creationTime >= periodStart && user._creationTime <= periodEnd
                );

                exportData = filteredUsers.map((user: any) => ({
                    id: user._id,
                    name: getUserName(user),
                    role: user.role || "member",
                    isActive: user.isActive,
                    createdAt: new Date(user._creationTime).toISOString(),
                    lastLoginAt: user.lastLogin ? new Date(user.lastLogin).toISOString() : null,
                }));
                count = exportData.length;
                break;

            case "products":
                const products = await ctx.db.query("products").collect();

                exportData = products.map((product: any) => ({
                    id: product._id,
                    name: getProductName(product),
                    category: product.category || "other",
                    price: getProductPrice(product),
                    stock: getProductStock(product),
                    isActive: product.isActive,
                    createdAt: new Date(product._creationTime).toISOString(),
                }));
                count = exportData.length;
                break;

            case "orders":
                const orders = await ctx.db.query("orders").collect();
                const filteredOrders = orders.filter((order: any) =>
                    order._creationTime >= periodStart && order._creationTime <= periodEnd
                );

                exportData = [];
                for (const order of filteredOrders) {
                    let userName = "Unknown";

                    if (order.userId) {
                        const user = await safeGetUser(ctx, order.userId);
                        userName = user ? getUserName(user) : "Unknown";
                    }

                    exportData.push({
                        id: order._id,
                        userId: order.userId || order.memberId || "N/A",
                        userName,
                        totalAmount: getOrderTotal(order),
                        status: order.status || "pending",
                        itemsCount: order.items?.length || 0,
                        createdAt: new Date(order._creationTime).toISOString(),
                    });
                }
                count = exportData.length;
                break;

            case "revenue":
                const revenueOrders = await ctx.db.query("orders").collect();
                const revenueFilteredOrders = revenueOrders.filter((order: any) =>
                    order._creationTime >= periodStart && order._creationTime <= periodEnd
                );

                const productRevenue: Record<string, { name: string; revenue: number; orders: number }> = {};

                for (const order of revenueFilteredOrders) {
                    if (order.items && Array.isArray(order.items)) {
                        for (const item of order.items) {
                            if (item.productId) {
                                // Безопасное получение продукта
                                const product = await safeGetProduct(ctx, item.productId);
                                
                                if (product) {
                                    const productName = getProductName(product);
                                    const itemRevenue = (item.price || 0) * (item.quantity || 1);

                                    if (!productRevenue[product._id]) {
                                        productRevenue[product._id] = { name: productName, revenue: 0, orders: 0 };
                                    }
                                    productRevenue[product._id].revenue += itemRevenue;
                                    productRevenue[product._id].orders += 1;
                                } else {
                                    // Используем данные из заказа
                                    const productName = getItemName(item);
                                    const itemRevenue = (item.price || 0) * (item.quantity || 1);
                                    
                                    const productKey = String(item.productId);
                                    if (!productRevenue[productKey]) {
                                        productRevenue[productKey] = { name: productName, revenue: 0, orders: 0 };
                                    }
                                    productRevenue[productKey].revenue += itemRevenue;
                                    productRevenue[productKey].orders += 1;
                                }
                            }
                        }
                    }
                }

                exportData = Object.entries(productRevenue).map(([productId, data]) => ({
                    productId,
                    productName: data.name,
                    totalRevenue: data.revenue,
                    totalOrders: data.orders,
                    averageOrderValue: data.orders > 0 ? Math.round(data.revenue / data.orders) : 0,
                }));
                count = exportData.length;
                break;

            case "analytics":
            case "full":
                // Для полного экспорта собираем данные напрямую
                const userStatsResult = await getUserStatsInternal(ctx, "month");
                const productStatsResult = await getProductStatsInternal(ctx);
                const revenueStatsResult = await getRevenueStatsInternal(ctx, "month", periodStart, periodEnd);

                // Собираем основную аналитику вручную (без вызова handler)
                const analyticsResult = {
                    users: userStatsResult,
                    products: productStatsResult,
                    revenue: revenueStatsResult,
                    period: {
                        start: periodStart,
                        end: periodEnd,
                        type: "month"
                    }
                };

                exportData = {
                    analytics: analyticsResult,
                    userStats: userStatsResult,
                    productStats: productStatsResult,
                    revenueStats: revenueStatsResult,
                    exportMetadata: {
                        exportType: type,
                        period: {
                            start: new Date(periodStart).toISOString(),
                            end: new Date(periodEnd).toISOString(),
                        },
                        exportedAt: new Date().toISOString(),
                    }
                };
                count = 1;
                break;

            default:
                throw new Error(`Неподдерживаемый тип экспорта: ${type}`);
        }

        return {
            type,
            data: exportData,
            count,
            format,
            period: {
                start: new Date(periodStart).toISOString(),
                end: new Date(periodEnd).toISOString(),
            },
            exportedAt: new Date().toISOString(),
        };
    },
});


