// convex/products.ts (с логами для отладки)
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Получить все активные продукты
export const getAll = query({
  handler: async (ctx) => {
    console.log("🔄 Convex Query: Получение всех активных продуктов");

    const products = await ctx.db.query("products")
      .filter((q) => q.eq(q.field("isActive"), true))
      .order("desc")
      .collect();

    console.log("✅ Convex Query: Найдено активных продуктов:", products.length);
    return products;
  },
});

export const getAllIncludingDeleted = query({
  handler: async (ctx) => {
    console.log("🔄 Convex Query: Получение ВСЕХ продуктов");

    const products = await ctx.db.query("products")
      .order("desc")
      .collect();

    console.log("✅ Convex Query: Найдено всего продуктов:", products.length);
    console.log("📊 Convex Query: Активных:", products.filter(p => p.isActive).length);
    console.log("📊 Convex Query: Удаленных:", products.filter(p => !p.isActive).length);

    return products;
  },
});


export const getById = query({
  args: { id: v.id("products") },
  handler: async (ctx, args) => {
    console.log("🔄 Convex Query: Получение продукта по ID:", args.id);

    const product = await ctx.db.get(args.id);

    if (!product) {
      console.log("❌ Convex Query: Продукт не найден:", args.id);
      return null;
    }

    console.log("✅ Convex Query: Продукт найден:", product.name, "isActive:", product.isActive);
    return product;
  },
});

// Получить продукты по категории
export const getByCategory = query({
  args: { category: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.query("products")
      .filter((q) => q.and(
        q.eq(q.field("category"), args.category),
        q.eq(q.field("isActive"), true)
      ))
      .collect();
  },
});

export const restore = mutation({
  args: {
    id: v.id("products"),
  },
  handler: async (ctx, args) => {
    console.log("🔄 Convex: Восстановление продукта:", args.id);

    // Проверяем существование продукта
    const existingProduct = await ctx.db.get(args.id);
    if (!existingProduct) {
      throw new Error("Продукт не найден");
    }

    console.log("📦 Convex: Найден продукт:", existingProduct.name);

    // Восстанавливаем продукт
    const result = await ctx.db.patch(args.id, {
      isActive: true,
      updatedAt: Date.now()
    });

    console.log("✅ Convex: Продукт восстановлен");
    return result;
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    console.log("🔄 Convex: Получение списка активных продуктов");

    const products = await ctx.db
      .query("products")
      .filter((q) => q.neq(q.field("isActive"), false)) // Только активные
      .order("desc")
      .collect();

    console.log("✅ Convex: Получено активных продуктов:", products.length);
    return products;
  },
});

export const softDelete = mutation({
  args: {
    id: v.id("products"),
  },
  handler: async (ctx, args) => {
    console.log("🔄 Convex: Мягкое удаление продукта:", args.id);

    // Проверяем существование продукта
    const existingProduct = await ctx.db.get(args.id);
    if (!existingProduct) {
      throw new Error("Продукт не найден");
    }

    console.log("📦 Convex: Найден продукт:", existingProduct.name);

    // Помечаем как неактивный
    const result = await ctx.db.patch(args.id, {
      isActive: false,
      updatedAt: Date.now()
    });

    console.log("✅ Convex: Продукт деактивирован");
    return result;
  },
});

// Физическое удаление - полностью удаляем из БД
export const hardDelete = mutation({
  args: {
    id: v.id("products"),
  },
  handler: async (ctx, args) => {
    console.log("🔄 Convex: Жесткое удаление продукта:", args.id);

    // Проверяем существование продукта
    const existingProduct = await ctx.db.get(args.id);
    if (!existingProduct) {
      throw new Error("Продукт не найден");
    }

    console.log("📦 Convex: Найден продукт:", existingProduct.name);

    // Полностью удаляем из базы
    await ctx.db.delete(args.id);

    console.log("✅ Convex: Продукт удален навсегда");
    return { deleted: true };
  },
});

// Получить популярные продукты
export const getPopular = query({
  handler: async (ctx) => {
    return await ctx.db.query("products")
      .filter((q) => q.and(
        q.eq(q.field("isPopular"), true),
        q.eq(q.field("isActive"), true)
      ))
      .collect();
  },
});

// Создать продукт
export const create = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    category: v.union(
      v.literal("supplements"),
      v.literal("drinks"),
      v.literal("snacks"),
      v.literal("merchandise")
    ),
    price: v.number(),
    imageUrl: v.optional(v.string()), // ✅ Убедитесь, что это есть
    inStock: v.number(),
    minStock: v.optional(v.number()),
    isPopular: v.optional(v.boolean()),
    nutrition: v.optional(v.object({
      calories: v.optional(v.number()),
      protein: v.optional(v.number()),
      carbs: v.optional(v.number()),
      fat: v.optional(v.number()),
      sugar: v.optional(v.number()),
    })),
  },
  handler: async (ctx, args) => {
    console.log("🔄 Convex Mutation: Создание продукта:", args.name);
    console.log("🖼️ Convex Mutation: imageUrl:", args.imageUrl); // Добавьте лог

    const productId = await ctx.db.insert("products", {
      ...args, // ✅ Это должно включать imageUrl
      isActive: true,
      isPopular: args.isPopular || false,
      minStock: args.minStock || 10,
      createdAt: Date.now(),
    });

    console.log("✅ Convex Mutation: Продукт создан с ID:", productId);
    return productId;
  },
});

export const getCount = query({
  handler: async (ctx) => {
    console.log("🔄 Convex Query: Подсчет количества продуктов");

    try {
      const allProducts = await ctx.db.query("products").collect();
      
      const activeCount = allProducts.filter(p => p.isActive !== false).length;
      const inactiveCount = allProducts.filter(p => p.isActive === false).length;
      const totalCount = allProducts.length;

      const result = {
        total: totalCount,
        active: activeCount,
        inactive: inactiveCount,
        deleted: inactiveCount // alias for inactive
      };

      console.log("✅ Convex Query: Подсчет завершен:", result);
      return result;
    } catch (error) {
      console.error("❌ Convex Query: Ошибка подсчета:", error);
      throw error;
    }
  },
});


export const update = mutation({
  args: {
    id: v.id("products"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    category: v.optional(v.union(
      v.literal("supplements"),
      v.literal("drinks"),
      v.literal("snacks"),
      v.literal("merchandise")
    )),
    price: v.optional(v.number()),
    imageUrl: v.optional(v.string()),
    inStock: v.optional(v.number()),
    minStock: v.optional(v.number()),
    isPopular: v.optional(v.boolean()),
    nutrition: v.optional(v.object({
      calories: v.optional(v.number()),
      protein: v.optional(v.number()),
      carbs: v.optional(v.number()),
      fat: v.optional(v.number()),
      sugar: v.optional(v.number()),
    })),
    updatedAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    console.log("🔄 Convex: Обновление продукта:", args.id);
    console.log("🖼️ Convex: Новый imageUrl:", args.imageUrl);

    const { id, ...updateData } = args;

    // Проверяем существование продукта
    const existingProduct = await ctx.db.get(id);
    if (!existingProduct) {
      throw new Error("Продукт не найден");
    }

    // Обновляем продукт
    await ctx.db.patch(id, {
      ...updateData,
      updatedAt: Date.now()
    });

    // Возвращаем обновленный продукт
    const updatedProduct = await ctx.db.get(id);
    console.log("✅ Convex: Продукт обновлен:", updatedProduct);
    
    return updatedProduct;
  },
});

// Мягкое удаление (деактивация)
export const remove = mutation({
  args: { id: v.id("products") },
  handler: async (ctx, args) => {
    console.log("🔄 Convex Mutation: Мягкое удаление продукта:", args.id);

    const result = await ctx.db.patch(args.id, {
      isActive: false,
      updatedAt: Date.now(),
    });

    console.log("✅ Convex Mutation: Продукт деактивирован (мягкое удаление)");
    return result;
  },
});

// Физическое удаление из базы данных
export const deleteForever = mutation({
  args: { id: v.id("products") },
  handler: async (ctx, args) => {
    console.log("🔄 Convex Mutation: Физическое удаление продукта:", args.id);

    const result = await ctx.db.delete(args.id);

    console.log("✅ Convex Mutation: Продукт физически удален из БД");
    return result;
  },
});

// Получить только удаленные продукты
export const getDeleted = query({
  args: {},
  handler: async (ctx) => {
    console.log("🔄 Convex: Получение удаленных продуктов");

    const deletedProducts = await ctx.db
      .query("products")
      .filter((q) => q.eq(q.field("isActive"), false)) // Только неактивные
      .order("desc")
      .collect();

    console.log("✅ Convex: Найдено удаленных продуктов:", deletedProducts.length);
    return deletedProducts;
  },
});

// Для отладки - получить все продукты
export const getAllForDebug = query({
  handler: async (ctx) => {
    console.log("🔄 Convex Debug: Получение ВСЕХ продуктов для отладки");

    const allProducts = await ctx.db.query("products").collect();

    console.log("📊 Convex Debug: Всего продуктов в БД:", allProducts.length);
    console.log("📦 Convex Debug: Все продукты:", allProducts);

    return allProducts;
  },
});

// Обновить остаток
export const updateStock = mutation({
  args: {
    id: v.id("products"),
    newStock: v.number()
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.id, {
      inStock: args.newStock,
      updatedAt: Date.now(),
    });
  },
});
