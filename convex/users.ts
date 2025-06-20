// convex/users.ts (исправленная версия)
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getAll = query({
  handler: async (ctx) => {
    console.log('Convex users: получаем всех пользователей');
    const users = await ctx.db.query("users").collect();
    console.log('Convex users: найдено пользователей:', users.length);
    return users;
  },
});

export const create = mutation({
  args: {
    email: v.string(),
    password: v.string(),
    name: v.string(),
    role: v.string(),
    isActive: v.boolean(),
    createdAt: v.number(),
    createdBy: v.optional(v.string()),
    photoUrl: v.optional(v.string()),
    faceDescriptor: v.optional(v.array(v.number())),
    // Дополнительные поля для тренеров
    phone: v.optional(v.string()),
    bio: v.optional(v.string()),
    specializations: v.optional(v.array(v.string())),
    experience: v.optional(v.number()),
    hourlyRate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    console.log('🔧 Convex users:create вызван с данными:', {
      email: args.email,
      name: args.name,
      role: args.role,
      isActive: args.isActive,
      createdBy: args.createdBy
    });
    
    try {
      let createdByUserId: string | undefined = undefined;
      
      if (args.createdBy) {
        // Проверяем, является ли createdBy email'ом или уже ID
        if (args.createdBy.includes('@')) {
          // Это email, ищем пользователя
          const creatorUser = await ctx.db
            .query("users")
            .filter((q) => q.eq(q.field("email"), args.createdBy!))
            .first();
          
          if (creatorUser) {
            createdByUserId = creatorUser._id;
            console.log('✅ Найден создатель по email:', args.createdBy, '-> ID:', createdByUserId);
          } else {
            console.log('⚠️ Пользователь-создатель не найден по email:', args.createdBy);
          }
        } else {
          // Предполагаем, что это уже ID
          createdByUserId = args.createdBy;
        }
      }

      // Если роль "trainer", создаем запись в таблице trainers
      if (args.role === "trainer") {
        console.log('👨‍🏫 Создаем тренера в таблице trainers');
        
        const trainerId = await ctx.db.insert("trainers", {
          name: args.name,
          email: args.email,
          phone: args.phone || '',
          password: args.password,
          photoUrl: args.photoUrl,
          bio: args.bio || '',
          specializations: args.specializations || [],
          experience: args.experience || 0,
          hourlyRate: args.hourlyRate || 0,
          workingHours: {
            start: '09:00',
            end: '18:00',
            days: [1, 2, 3, 4, 5]
          },
          rating: 0,
          totalReviews: 0,
          isActive: args.isActive,
          status: args.isActive ? 'active' : 'inactive',
          role: args.role,
          createdAt: args.createdAt,
          updatedAt: args.createdAt,
        });
        
        console.log('✅ Тренер создан в таблице trainers с ID:', trainerId);
        return trainerId;
      } else {
        // Для всех остальных ролей создаем в таблице users
        console.log('👤 Создаем пользователя в таблице users');
        
        const userId = await ctx.db.insert("users", {
          email: args.email,
          password: args.password,
          name: args.name,
          role: args.role,
          isActive: args.isActive,
          createdAt: args.createdAt,
          createdBy: createdByUserId, // ✅ Используем найденный ID или undefined
          photoUrl: args.photoUrl,
          faceDescriptor: args.faceDescriptor || [],
        });
        
        console.log('✅ Пользователь создан в таблице users с ID:', userId);
        return userId;
      }
    } catch (error) {
      console.error('❌ Ошибка вставки в БД:', error);
      throw error;
    }
  },
});

export const getAllFaceDescriptors = query({
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    return users
      .filter(user => user.faceDescriptor && user.faceDescriptor.length > 0)
      .map(user => ({
        id: user._id,
        name: user.name,
        faceDescriptor: user.faceDescriptor
      }));
  },
});


export const getTrainers = query({
  args: {},
  handler: async (ctx) => {
    console.log("Запрос тренеров из базы данных...");
    
    // Получаем тренеров из таблицы trainers
    const trainersFromTrainersTable = await ctx.db
      .query("trainers")
      .collect();

    // Получаем тренеров из таблицы users (для обратной совместимости)
    const trainersFromUsersTable = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("role"), "trainer"))
      .collect();

    console.log("Найдено тренеров в trainers:", trainersFromTrainersTable.length);
    console.log("Найдено тренеров в users:", trainersFromUsersTable.length);

    // Объединяем результаты
    const allTrainers = [
      ...trainersFromTrainersTable.map((trainer) => ({
        id: trainer._id,
        name: trainer.name,
        role: trainer.role || "trainer",
        email: trainer.email || "",
        photoUri: trainer.photoUrl,
        source: "trainers" as const,
      })),
      ...trainersFromUsersTable.map((trainer) => ({
        id: trainer._id,
        name: trainer.name,
        role: trainer.role,
        email: trainer.email || "",
        photoUri: trainer.photoUrl,
        source: "users" as const,
      }))
    ];

    console.log("Всего тренеров:", allTrainers.length);
    return allTrainers;
  },
});


export const getTrainerById = query({
  args: { trainerId: v.string() }, // ✅ Используем trainerId для ясности
  handler: async (ctx, args) => {
    console.log('🔍 getTrainerById вызван для ID:', args.trainerId);
    
    try {
      const document = await ctx.db.get(args.trainerId as any);
      if (!document) {
        return null;
      }
      
      // Проверяем что это тренер (есть специфичные поля или role = trainer)
      if ('specializations' in document || 
          ('role' in document && document.role === 'trainer')) {
        return document;
      }
      
      return null;
    } catch (error) {
      console.error('❌ Ошибка в getTrainerById:', error);
      return null;
    }
  },
});

export const getUserOrTrainerById = query({
  args: { userId: v.string() }, // ✅ Используем userId
  handler: async (ctx, args) => {
    console.log('🔍 Ищем пользователя/тренера по ID:', args.userId);
    
    try {
      const document = await ctx.db.get(args.userId as any);
      if (!document || !document._creationTime) {
        console.log('❌ Документ не найден');
        return null;
      }
      
      // Проверяем что у объекта есть поле role (значит это из users или trainers)
      if ('role' in document) {
        if (document.role !== 'trainer') {
          console.log('✅ Найден пользователь в таблице users');
          return {
            ...document,
            source: 'users' as const,
            tableType: 'users' as const
          };
        }
      }
      
      // Проверяем есть ли поля специфичные для тренеров
      if ('specializations' in document || 'hourlyRate' in document || 'workingHours' in document) {
        console.log('✅ Найден тренер в таблице trainers');
        return {
          ...document,
          source: 'trainers' as const,
          tableType: 'trainers' as const,
          role: 'role' in document ? document.role : 'trainer'
        };
      }
      
      // Если есть role и это users
      if ('role' in document) {
        console.log('✅ Найден пользователь в таблице users');
        return {
          ...document,
          source: 'users' as const,
          tableType: 'users' as const
        };
      }
      
      console.log('❌ Тип документа не определен');
      return null;
      
    } catch (error) {
      console.error('❌ Ошибка поиска пользователя:', error);
      return null;
    }
  },
});

export const getClients = query({
  args: {},
  handler: async (ctx) => {
    console.log("Запрос клиентов из базы данных...");
    
    const clients = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("role"), "member")) // или "client", в зависимости от вашей схемы
      .collect();

    console.log("Найдено клиентов:", clients.length);
    console.log("Клиенты:", clients.map(c => ({ name: c.name, role: c.role })));

    return clients.map((client) => ({
      id: client._id,
      name: client.name,
      role: client.role,
      email: client.email || "",
      photoUri: client.photoUrl,
    }));
  },
});

export const getUsersByRoles = query({
  args: {
    roles: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    console.log("Запрос пользователей с ролями:", args.roles);
    
    const users = await ctx.db
      .query("users")
      .filter((q) => {
        // Создаем условие OR для нескольких ролей
        return args.roles.reduce((acc, role, index) => {
          const condition = q.eq(q.field("role"), role);
          return index === 0 ? condition : q.or(acc, condition);
        }, q.eq(q.field("role"), args.roles[0]));
      })
      .collect();

    console.log(`Найдено пользователей: ${users.length}`);

    return users.map((user) => ({
      id: user._id,
      name: user.name,
      role: user.role,
      email: user.email || "",
      photoUri: user.photoUrl,
    }));
  },
});

export const updateUserOrTrainer = mutation({
  args: { 
    userId: v.string(), // ✅ Изменяем на userId
    updates: v.object({
      name: v.optional(v.string()),
      email: v.optional(v.string()),
      role: v.optional(v.string()),
      isActive: v.optional(v.boolean()),
      photoUrl: v.optional(v.string()),
      password: v.optional(v.string()),
      // Поля специфичные для тренеров
      phone: v.optional(v.string()),
      bio: v.optional(v.string()),
      specializations: v.optional(v.array(v.string())),
      experience: v.optional(v.number()),
      hourlyRate: v.optional(v.number()),
    })
  },
  handler: async (ctx, args) => {
    console.log('🔧 Обновляем пользователя/тренера:', args.userId);
    
    try {
      // Проверяем существование записи
      const existing = await ctx.db.get(args.userId as any);
      if (!existing) {
        throw new Error("Пользователь или тренер не найден");
      }
      
      // Фильтруем обновления
      const filteredUpdates: any = {};
      Object.entries(args.updates).forEach(([key, value]) => {
        if (value !== undefined) {
          filteredUpdates[key] = value;
        }
      });
      
      if (Object.keys(filteredUpdates).length === 0) {
        console.log('ℹ️ Нет данных для обновления');
        return args.userId;
      }
      
      // Определяем тип записи и обновляем
      const isTrainer = 'specializations' in existing || 
                       ('role' in existing && existing.role === 'trainer');
      
      if (isTrainer) {
        console.log('🔧 Обновляем в таблице trainers');
        
        // Для тренеров добавляем специфичные поля
        if (filteredUpdates.isActive !== undefined) {
          filteredUpdates.status = filteredUpdates.isActive ? 'active' : 'inactive';
        }
        
        await ctx.db.patch(args.userId as any, {
          ...filteredUpdates,
          updatedAt: Date.now()
        });
      } else {
        console.log('🔧 Обновляем в таблице users');
        await ctx.db.patch(args.userId as any, {
          ...filteredUpdates,
          updatedAt: Date.now()
        });
      }
      
      console.log('✅ Обновление завершено');
      return args.userId;
      
    } catch (error) {
      console.error('❌ Ошибка обновления:', error);
      throw error;
    }
  },
});

export const getUserById = query({
  args: { userId: v.string() }, // ✅ Изменяем на userId
  handler: async (ctx, args) => {
    console.log('🔍 getUserById вызван для ID:', args.userId);
    
    try {
      const document = await ctx.db.get(args.userId as any);
      if (!document) {
        return null;
      }
      
      // Проверяем что это пользователь из таблицы users и не тренер
      if ('role' in document && 
          'email' in document && 
          !('specializations' in document) &&
          document.role !== 'trainer') {
        return document;
      }
      
      return null;
    } catch (error) {
      console.error('❌ Ошибка в getUserById:', error);
      return null;
    }
  },
});

export const getUserType = query({
  args: { userId: v.string() }, // ✅ Изменяем на userId
  handler: async (ctx, args) => {
    try {
      const document = await ctx.db.get(args.userId as any);
      if (!document) {
        return null;
      }
      
      // Определяем тип по наличию специфичных полей
      if ('specializations' in document || 'hourlyRate' in document) {
        return 'trainer';
      }
      
      if ('role' in document && document.role === 'trainer') {
        return 'trainer';
      }
      
      if ('role' in document) {
        return 'user';
      }
      
      return 'unknown';
    } catch (error) {
      console.error('❌ Ошибка определения типа:', error);
      return null;
    }
  },
});


export const deleteUser = mutation({
  args: { userId: v.string() }, // ✅ Изменяем на userId для консистентности
  handler: async (ctx, args) => {
    try {
      const user = await ctx.db.get(args.userId as any);
      
      if (!user) {
        throw new Error("Пользователь не найден");
      }
      
      await ctx.db.delete(args.userId as any);
      
      return { success: true, deletedUser: user };
    } catch (error) {
      console.error("Ошибка удаления пользователя:", error);
      throw error;
    }
  },
});

export const createAdmin = mutation({
  args: {
    name: v.string(),
    email: v.string(), // Убираем optional
    password: v.string(), // Добавляем пароль
    photoUrl: v.optional(v.string()), // Делаем optional
    faceDescriptor: v.optional(v.array(v.number())), // Делаем optional
  },
  handler: async (ctx, args) => {
    // Проверяем, что пользователь с таким email не существует
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existingUser) {
      throw new Error("Пользователь с таким email уже существует");
    }

    const userId = await ctx.db.insert("users", {
      email: args.email,
      password: args.password,
      name: args.name,
      role: "admin",
      isActive: true,
      createdAt: Date.now(),
      photoUrl: args.photoUrl,
      faceDescriptor: args.faceDescriptor || [],
    });
    return userId;
  },
});

export const list = query({
  args: {},
  handler: async (ctx, args) => {
    return await ctx.db.query("users").collect();
  },
});

export const getByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    console.log('Convex users: ищем пользователя по email:', args.email);
    
    // Сначала ищем в таблице users
    const user = await ctx.db.query("users")
      .filter((q) => q.eq(q.field("email"), args.email))
      .first();
    
    if (user) {
      console.log('Convex users: пользователь найден в users');
      return user;
    }
    
    // Если не найден в users, ищем в trainers
    const trainer = await ctx.db.query("trainers")
      .filter((q) => q.eq(q.field("email"), args.email))
      .first();
    
    if (trainer) {
      console.log('Convex users: пользователь найден в trainers');
      // Адаптируем под формат users
      return {
        ...trainer,
        role: trainer.role || 'trainer'
      };
    }
    
    console.log('Convex users: пользователь не найден');
    return null;
  },
});

export const saveFaceDescriptor = mutation({
  args: { 
    userId: v.string(), // ✅ Изменяем на userId
    faceDescriptor: v.array(v.number()) 
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId as any, {
      faceDescriptor: args.faceDescriptor
    });
  },
});

export const getAllWithFaceDescriptors = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db
      .query("users")
      .filter((q) => q.neq(q.field("faceDescriptor"), undefined))
      .collect();
    
    return users.filter(user => user.faceDescriptor && user.faceDescriptor.length > 0);
  },
});

export const getById = query({
  args: { userId: v.string() }, // ✅ Изменяем на userId для консистентности
  handler: async (ctx, args) => {
    console.log('🔍 getById вызван для ID:', args.userId);
    
    try {
      const document = await ctx.db.get(args.userId as any);
      if (!document) {
        return null;
      }
      
      // Проверяем что это из таблицы users (не trainers)
      if ('role' in document && 'email' in document && !('specializations' in document)) {
        return document;
      }
      
      // Если это тренер, возвращаем null для совместимости с getById для users
      return null;
    } catch (error) {
      console.error('❌ Ошибка в getById:', error);
      return null;
    }
  },
});


export const updateUser = mutation({
  args: { 
    userId: v.id("users"),
    updates: v.object({
      name: v.optional(v.string()),
      email: v.optional(v.string()),
      role: v.optional(v.string()),
      isActive: v.optional(v.boolean()),
      photoUrl: v.optional(v.string()),
      password: v.optional(v.string()),
    })
  },
  handler: async (ctx, args) => {
    console.log('Convex users: обновляем пользователя:', args.userId);
    console.log('Convex users: данные для обновления:', args.updates);
    
    try {
      // Проверяем, существует ли пользователь
      const existingUser = await ctx.db.get(args.userId);
      if (!existingUser) {
        throw new Error("Пользователь не найден");
      }

      // Если обновляется email, проверяем уникальность
      if (args.updates.email && typeof args.updates.email === 'string' && args.updates.email !== existingUser.email) {
        const emailExists = await ctx.db
          .query("users")
          .withIndex("by_email", (q) => q.eq("email", args.updates.email!)) // Используем ! так как мы уже проверили
          .first();
        
        if (emailExists) {
          throw new Error("Пользователь с таким email уже существует");
        }
      }

      // Фильтруем undefined значения перед обновлением
      const filteredUpdates: any = {};
      
      if (args.updates.name !== undefined) {
        filteredUpdates.name = args.updates.name;
      }
      if (args.updates.email !== undefined) {
        filteredUpdates.email = args.updates.email;
      }
      if (args.updates.role !== undefined) {
        filteredUpdates.role = args.updates.role;
      }
      if (args.updates.isActive !== undefined) {
        filteredUpdates.isActive = args.updates.isActive;
      }
      if (args.updates.photoUrl !== undefined) {
        filteredUpdates.photoUrl = args.updates.photoUrl;
      }
      if (args.updates.password !== undefined) {
        filteredUpdates.password = args.updates.password;
      }

      console.log('Convex users: отфильтрованные обновления:', filteredUpdates);

      // Обновляем пользователя только если есть что обновлять
      if (Object.keys(filteredUpdates).length > 0) {
        await ctx.db.patch(args.userId, filteredUpdates);
        console.log('✅ Convex users: пользователь обновлен успешно');
      } else {
        console.log('ℹ️ Convex users: нет данных для обновления');
      }
      
      // Возвращаем обновленного пользователя
      const updatedUser = await ctx.db.get(args.userId);
      return updatedUser;
    } catch (error) {
      console.error('❌ Convex users: ошибка обновления:', error);
      throw error;
    }
  },
});

export const updatePhoto = mutation({
  args: { 
    userId: v.string(), // ✅ Изменяем на userId
    photoUrl: v.string()
  },
  handler: async (ctx, args) => {
    console.log('🖼️ Обновляем фото пользователя:', args.userId);
    
    await ctx.db.patch(args.userId as any, {
      photoUrl: args.photoUrl,
      updatedAt: Date.now()
    });
    
    console.log('✅ Фото обновлено в БД');
    return args.userId;
  },
});
export const updateLastLogin = mutation({
  args: { 
    userId: v.string(), // ✅ Изменяем на userId
    timestamp: v.number()
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId as any, {
      lastLogin: args.timestamp
    });
    return args.userId;
  },
});

export const updateRole = mutation({
  args: { 
    userId: v.string(), // ✅ Изменяем на userId
    role: v.string()
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId as any, {
      role: args.role
    });
    return args.userId;
  },
});


export const toggleStatus = mutation({
  args: { 
    userId: v.string(), // ✅ Изменяем на userId
    isActive: v.boolean()
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId as any, {
      isActive: args.isActive
    });
    return args.userId;
  },
});

export const updatePassword = mutation({
  args: { 
    userId: v.string(), // ✅ Изменяем на userId
    password: v.string()
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId as any, {
      password: args.password
    });
    return args.userId;
  },
});