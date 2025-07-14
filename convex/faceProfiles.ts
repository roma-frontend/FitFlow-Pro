// convex/faceProfiles.js
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Создание Face ID профиля для тренера
export const create = mutation({
  args: {
    userId: v.id("users"),
    faceDescriptor: v.array(v.number()),
    confidence: v.number(),
    registeredAt: v.number(),
    isActive: v.boolean(),
    metadata: v.optional(v.object({
      registrationMethod: v.string(),
      userAgent: v.optional(v.string()),
      deviceInfo: v.optional(v.string())
    }))
  },
  handler: async (ctx, args) => {
    console.log('🔧 faceProfiles:create для userId:', args.userId);
    
    // Проверяем, что пользователь существует
    const user = await ctx.db.get(args.userId);
    
    if (!user) {
      throw new Error("Пользователь не найден");
    }
    
    // Создаем Face ID профиль с userType
    const profileId = await ctx.db.insert("faceProfiles", {
      userId: args.userId,
      userType: "user", // This is the critical addition
      faceDescriptor: args.faceDescriptor,
      confidence: args.confidence,
      registeredAt: args.registeredAt,
      isActive: args.isActive,
      metadata: args.metadata,
      lastUsed: args.registeredAt
    });
    
    console.log('✅ Face ID профиль создан:', profileId);
    return profileId;
  }
});

// Получение профиля по пользователю
export const getByUserId = query({
  args: {
    userId: v.string(),
    userType: v.optional(v.union(v.literal("user"), v.literal("trainer"))) // Make userType optional
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("faceProfiles")
      .filter(q => q.eq(q.field("userId"), args.userId));

    if (args.userType) {
      query = query.filter(q => q.eq(q.field("userType"), args.userType));
    }

    return await query
      .filter(q => q.eq(q.field("isActive"), true))
      .first();
  }
});

// Получение всех активных профилей
export const listActive = query({
  args: {},
  handler: async (ctx, args) => {
    console.log('📋 faceProfiles:listActive - получение всех активных профилей');

    const profiles = await ctx.db
      .query("faceProfiles")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();

    console.log('📋 Найдено активных профилей:', profiles.length);
    return profiles;
  }
});

// Получение всех профилей с дескрипторами для сравнения
export const getAllForComparison = query({
  handler: async (ctx) => {
    const profiles = await ctx.db.query("faceProfiles")
      .withIndex("by_active", q => q.eq("isActive", true))
      .collect();

    return await Promise.all(profiles.map(async (profile) => {
      let user;
      if (profile.userType === "user") {
        user = await ctx.db.get(profile.userId);
      } else {
        user = await ctx.db.get(profile.userId);
      }

      return {
        id: profile._id,
        userId: profile.userId,
        userType: profile.userType,
        name: user?.name || 'Unknown',
        email: user?.email || '',
        faceDescriptor: profile.faceDescriptor,
        confidence: profile.confidence,
        lastUsed: profile.lastUsed
      };
    }));
  }
});

// Обновление времени последнего использования
export const updateLastUsed = mutation({
  args: {
    profileId: v.id("faceProfiles"),
    timestamp: v.number()
  },
  handler: async (ctx, args) => {
    console.log('🔄 faceProfiles:updateLastUsed для профиля:', args.profileId);

    try {
      await ctx.db.patch(args.profileId, {
        lastUsed: args.timestamp
      });

      console.log('✅ Время последнего использования обновлено');
      return { success: true };
    } catch (error) {
      console.error('❌ Ошибка обновления времени использования:', error);
      throw error;
    }
  }
});

// Обновление дескриптора лица
export const updateFaceDescriptor = mutation({
  args: {
    profileId: v.id("faceProfiles"),
    faceDescriptor: v.array(v.number()),
    confidence: v.number()
  },
  handler: async (ctx, args) => {
    console.log('🔄 faceProfiles:updateFaceDescriptor для профиля:', args.profileId);

    try {
      await ctx.db.patch(args.profileId, {
        faceDescriptor: args.faceDescriptor,
        confidence: args.confidence
      });

      console.log('✅ Дескриптор лица обновлен');
      return { success: true };
    } catch (error) {
      console.error('❌ Ошибка обновления дескриптора:', error);
      throw error;
    }
  }
});

// Удаление Face ID профиля (деактивация)
export const deactivate = mutation({
  args: { profileId: v.id("faceProfiles") },
  handler: async (ctx, args) => {
    console.log('🗑️ faceProfiles:deactivate для профиля:', args.profileId);

    try {
      await ctx.db.patch(args.profileId, {
        isActive: false
      });

      console.log('✅ Face ID профиль деактивирован');
      return { success: true };
    } catch (error) {
      console.error('❌ Ошибка деактивации профиля:', error);
      throw error;
    }
  }
});

// Полное удаление профиля
export const deleteProfile = mutation({
  args: { profileId: v.id("faceProfiles") },
  handler: async (ctx, args) => {
    console.log('🗑️ faceProfiles:deleteProfile для профиля:', args.profileId);

    try {
      await ctx.db.delete(args.profileId);

      console.log('✅ Face ID профиль удален');
      return { success: true };
    } catch (error) {
      console.error('❌ Ошибка удаления профиля:', error);
      throw error;
    }
  }
});

// Получение профиля по ID
export const getById = query({
  args: { profileId: v.id("faceProfiles") },
  handler: async (ctx, args) => {
    console.log('🔍 faceProfiles:getById для профиля:', args.profileId);

    try {
      const profile = await ctx.db.get(args.profileId);

      if (!profile) {
        console.log('❌ Профиль не найден');
        return null;
      }

      console.log('✅ Профиль найден');
      return profile;
    } catch (error) {
      console.error('❌ Ошибка получения профиля:', error);
      return null;
    }
  }
});

// Получение статистики профилей
export const getStats = query({
  args: {},
  handler: async (ctx) => {
    console.log('📊 faceProfiles:getStats - получение статистики');

    const [totalProfiles, activeProfiles, inactiveProfiles] = await Promise.all([
      ctx.db.query("faceProfiles").collect(),
      ctx.db.query("faceProfiles").withIndex("by_active", (q) => q.eq("isActive", true)).collect(),
      ctx.db.query("faceProfiles").withIndex("by_active", (q) => q.eq("isActive", false)).collect()
    ]);

    const stats = {
      total: totalProfiles.length,
      active: activeProfiles.length,
      inactive: inactiveProfiles.length,
      recentlyUsed: activeProfiles.filter(p =>
        p.lastUsed && (Date.now() - p.lastUsed) < 7 * 24 * 60 * 60 * 1000 // последние 7 дней
      ).length
    };

    console.log('📊 Статистика профилей:', stats);
    return stats;
  }
});

// Поиск профиля по параметрам
export const search = query({
  args: {
    userId: v.optional(v.union(v.id("users"), v.id("trainers"))),
    isActive: v.optional(v.boolean()),
    registrationMethod: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("faceProfiles");

    if (args.userId) {
      // Filter using both userId and userType (inferred from the ID)
      query = query.filter((q) => 
        q.eq(q.field("userId"), args.userId)
      );
    }

    // Rest of the filters remain the same
    if (args.isActive !== undefined) {
      query = query.filter((q) => q.eq(q.field("isActive"), args.isActive));
    }

    if (args.registrationMethod) {
      query = query.filter((q) =>
        q.eq(q.field("metadata.registrationMethod"), args.registrationMethod)
      );
    }

    return await query.collect();
  }
});

// Массовое обновление профилей
export const bulkUpdate = mutation({
  args: {
    profileIds: v.array(v.id("faceProfiles")),
    updates: v.object({
      isActive: v.optional(v.boolean()),
      confidence: v.optional(v.number())
    })
  },
  handler: async (ctx, args) => {
    console.log('🔄 faceProfiles:bulkUpdate для профилей:', args.profileIds.length);

    const updatePromises = args.profileIds.map(profileId =>
      ctx.db.patch(profileId, args.updates)
    );

    await Promise.all(updatePromises);

    console.log('✅ Массовое обновление завершено');
    return { success: true, updatedCount: args.profileIds.length };
  }
});

// Получение профилей по множественным пользователям
export const getByUserIds = query({
  args: { userIds: v.array(v.id("users")) },
  handler: async (ctx, args) => {
    console.log('🔍 faceProfiles:getByUserIds для пользователей:', args.userIds.length);

    const profiles = await Promise.all(
      args.userIds.map(async (userId) => {
        return await ctx.db
          .query("faceProfiles")
          .withIndex("by_user", (q) => q.eq("userId", userId))
          .filter((q) => q.eq(q.field("isActive"), true))
          .first();
      })
    );

    const validProfiles = profiles.filter(profile => profile !== null);
    console.log('🔍 Найдено профилей:', validProfiles.length);
    return validProfiles;
  }
});