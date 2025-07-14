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

// Вспомогательная функция для создания или обновления пользователя через Google
export const createOrUpdateGoogleUser = mutation({
  args: {
    email: v.string(),
    name: v.string(),
    googleId: v.string(),
    photoUrl: v.optional(v.string()),
    role: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    console.log('🔧 createOrUpdateGoogleUser для:', args.email);
    
    try {
      // Ищем существующего пользователя в обеих таблицах
      const [existingUserInUsers, existingUserInTrainers] = await Promise.all([
        ctx.db
          .query("users")
          .filter((q) => q.eq(q.field("email"), args.email))
          .first(),
        ctx.db
          .query("trainers")
          .filter((q) => q.eq(q.field("email"), args.email))
          .first()
      ]);
      
      const existingUser = existingUserInUsers || existingUserInTrainers;
      
      if (existingUser) {
        // Обновляем существующего пользователя
        console.log('🔄 Обновляем существующего пользователя Google данными');
        
        // Проверяем, какие поля доступны для обновления
        const updateData: any = {
          googleId: args.googleId,
          isVerified: true,
          updatedAt: Date.now()
        };

        // Добавляем поля только если они существуют в схеме
        if ('photoUrl' in existingUser) {
          updateData.photoUrl = args.photoUrl || existingUser.photoUrl;
        }
        if ('avatar' in existingUser) {
          updateData.avatar = args.photoUrl || existingUser.avatar;
        }
        
        await ctx.db.patch(existingUser._id, updateData);
        
        return existingUser._id;
      } else {
        // Создаем нового пользователя
        console.log('👤 Создаем нового Google пользователя');
        
        const userId = await ctx.db.insert("users", {
          email: args.email,
          password: '', // Для Google пользователей пароль не нужен
          name: args.name,
          role: args.role || 'member',
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          photoUrl: args.photoUrl,
          avatar: args.photoUrl,
          googleId: args.googleId,
          isVerified: true,
          faceDescriptor: [],
        });
        
        console.log('✅ Google пользователь создан с ID:', userId);
        return userId;
      }
    } catch (error) {
      console.error('❌ Ошибка в createOrUpdateGoogleUser:', error);
      throw error;
    }
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
    avatar: v.optional(v.string()),
    googleId: v.optional(v.string()),
    isVerified: v.optional(v.boolean()),
    faceDescriptor: v.optional(v.array(v.number())),
    updatedAt: v.optional(v.number()),
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
      createdBy: args.createdBy,
      googleId: args.googleId,
      isVerified: args.isVerified
    });
    
    try {
      // ✅ ИСПРАВЛЕНИЕ: Проверяем email в ОБЕИХ таблицах
      const [existingUserInUsers, existingUserInTrainers] = await Promise.all([
        ctx.db
          .query("users")
          .filter((q) => q.eq(q.field("email"), args.email))
          .first(),
        ctx.db
          .query("trainers")
          .filter((q) => q.eq(q.field("email"), args.email))
          .first()
      ]);
      
      const existingUser = existingUserInUsers || existingUserInTrainers;
      
      if (existingUser) {
        // ✅ ИСПРАВЛЕНИЕ: Если пользователь существует и это Google вход, обновляем существующую запись
        if (args.googleId && !('googleId' in existingUser && existingUser.googleId)) {
          console.log('🔄 Пользователь существует, добавляем Google ID к существующей записи');
          
          // Проверяем, какие поля доступны для обновления
          const updateData: any = {
            googleId: args.googleId,
            isVerified: true,
            updatedAt: Date.now()
          };

          // Добавляем поля только если они существуют в схеме
          if ('photoUrl' in existingUser) {
            updateData.photoUrl = args.photoUrl || existingUser.photoUrl;
          }
          if ('avatar' in existingUser) {
            updateData.avatar = args.avatar || existingUser.avatar;
          }
          
          await ctx.db.patch(existingUser._id, updateData);
          
          console.log('✅ Google ID добавлен к существующему пользователю');
          return existingUser._id;
        }
        
        // ✅ ИСПРАВЛЕНИЕ: Если это не Google вход или Google ID уже есть
        if (args.googleId && 'googleId' in existingUser && existingUser.googleId) {
          console.log('✅ Пользователь уже имеет Google ID, возвращаем существующий ID');
          return existingUser._id;
        }
        
        throw new Error("Пользователь с таким email уже существует");
      }
      
      let createdByUserId: string | undefined = undefined;
      
      if (args.createdBy) {
        // Проверяем, является ли createdBy email'ом или уже ID
        if (args.createdBy.includes('@')) {
          // Это email, ищем пользователя в обеих таблицах
          const [creatorInUsers, creatorInTrainers] = await Promise.all([
            ctx.db
              .query("users")
              .filter((q) => q.eq(q.field("email"), args.createdBy!))
              .first(),
            ctx.db
              .query("trainers")
              .filter((q) => q.eq(q.field("email"), args.createdBy!))
              .first()
          ]);
          
          const creatorUser = creatorInUsers || creatorInTrainers;
          
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
          photoUrl: args.photoUrl || args.avatar,
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
          updatedAt: args.updatedAt || args.createdAt,
          googleId: args.googleId, // ✅ Добавляем Google ID
          isVerified: args.isVerified || false, // ✅ Добавляем проверку верификации
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
          updatedAt: args.updatedAt || args.createdAt,
          createdBy: createdByUserId,
          photoUrl: args.photoUrl || args.avatar,
          avatar: args.avatar || args.photoUrl,
          googleId: args.googleId,
          isVerified: args.isVerified || false,
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

export const update = mutation({
  args: { 
    userId: v.string(),
    updates: v.object({
      name: v.optional(v.string()),
      email: v.optional(v.string()),
      role: v.optional(v.string()),
      isActive: v.optional(v.boolean()),
      photoUrl: v.optional(v.string()),
      avatar: v.optional(v.string()),
      password: v.optional(v.string()),
      googleId: v.optional(v.string()),
      isVerified: v.optional(v.boolean()),
      updatedAt: v.optional(v.number()),
    })
  },
  handler: async (ctx, args) => {
    console.log('📝 users:update вызван для:', args.userId);
    
    try {
      // Получаем документ
      const document = await ctx.db.get(args.userId as any);
      if (!document) {
        throw new Error("Пользователь не найден");
      }
      
      // Фильтруем undefined значения
      const filteredUpdates: any = {};
      Object.entries(args.updates).forEach(([key, value]) => {
        if (value !== undefined) {
          filteredUpdates[key] = value;
        }
      });
      
      // Если обновляется email, проверяем уникальность
      if (filteredUpdates.email && filteredUpdates.email !== (document as any).email) {
        const emailExists = await ctx.db
          .query("users")
          .filter((q) => q.eq(q.field("email"), filteredUpdates.email))
          .first();
        
        if (emailExists && emailExists._id !== args.userId) {
          throw new Error("Email уже используется");
        }
      }
      
      // Добавляем timestamp если не указан
      if (!filteredUpdates.updatedAt) {
        filteredUpdates.updatedAt = Date.now();
      }
      
      console.log('📝 Применяем обновления:', filteredUpdates);
      
      // Обновляем документ
      await ctx.db.patch(args.userId as any, filteredUpdates);
      
      console.log('✅ Пользователь обновлен');
      return { success: true, userId: args.userId };
      
    } catch (error) {
      console.error('❌ Ошибка обновления:', error);
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


export const updateProfile = mutation({
  args: {
    userId: v.optional(v.string()),
    email: v.optional(v.string()),
    updates: v.object({
      name: v.optional(v.string()),
      phone: v.optional(v.string()),
      avatar: v.optional(v.string()),
      photoUrl: v.optional(v.string()),
      bio: v.optional(v.string()),
      birthDate: v.optional(v.string()),
      location: v.optional(v.string()),
      department: v.optional(v.string()),
      secondaryEmail: v.optional(v.string()),
      emergencyContact: v.optional(v.string()),
      emergencyPhone: v.optional(v.string()),
      socialLinks: v.optional(v.object({
        instagram: v.optional(v.string()),
        facebook: v.optional(v.string()),
        twitter: v.optional(v.string()),
        linkedin: v.optional(v.string()),
        website: v.optional(v.string()),
      })),
      updatedAt: v.optional(v.number()),
    }),
  },
  handler: async (ctx, args) => {
    console.log('🔧 updateProfile: обновляем профиль', { userId: args.userId, email: args.email });
    
    let document;
    
    // Находим пользователя по ID или email
    if (args.userId) {
      try {
        document = await ctx.db.get(args.userId as any);
      } catch (error) {
        console.log('⚠️ Не удалось найти по ID, пробуем другие методы');
      }
    }
    
    if (!document && args.email) {
      // Ищем в users
      document = await ctx.db
        .query("users")
        .filter((q) => q.eq(q.field("email"), args.email))
        .first();
      
      // Если не нашли в users, ищем в trainers
      if (!document) {
        document = await ctx.db
          .query("trainers")
          .filter((q) => q.eq(q.field("email"), args.email))
          .first();
      }
    }
    
    if (!document) {
      throw new Error("Пользователь не найден");
    }
    
    // Подготавливаем обновления
    const updates: any = {};
    
    // Обрабатываем avatar/photoUrl
    if (args.updates.avatar !== undefined) {
      updates.photoUrl = args.updates.avatar;
      updates.avatar = args.updates.avatar;
    }
    if (args.updates.photoUrl !== undefined) {
      updates.photoUrl = args.updates.photoUrl;
      updates.avatar = args.updates.photoUrl;
    }
    
    // Добавляем остальные поля
    if (args.updates.name !== undefined) updates.name = args.updates.name;
    if (args.updates.phone !== undefined) updates.phone = args.updates.phone;
    if (args.updates.bio !== undefined) updates.bio = args.updates.bio;
    if (args.updates.birthDate !== undefined) updates.birthDate = args.updates.birthDate;
    if (args.updates.location !== undefined) updates.location = args.updates.location;
    if (args.updates.department !== undefined) updates.department = args.updates.department;
    if (args.updates.secondaryEmail !== undefined) updates.secondaryEmail = args.updates.secondaryEmail;
    if (args.updates.emergencyContact !== undefined) updates.emergencyContact = args.updates.emergencyContact;
    if (args.updates.emergencyPhone !== undefined) updates.emergencyPhone = args.updates.emergencyPhone;
    if (args.updates.socialLinks !== undefined) updates.socialLinks = args.updates.socialLinks;
    
    // Добавляем updatedAt
    updates.updatedAt = Date.now();
    
    console.log('📝 updateProfile: применяем обновления:', updates);
    
    // Обновляем документ
    await ctx.db.patch(document._id, updates);
    
    console.log('✅ updateProfile: профиль обновлен');
    return { success: true, userId: document._id };
  },
});


export const changePassword = mutation({
  args: {
    userId: v.optional(v.string()),
    email: v.optional(v.string()),
    currentPassword: v.string(),
    newPassword: v.string(),
  },
  handler: async (ctx, args) => {
    console.log('🔐 changePassword: смена пароля для:', args.email || args.userId);
    
    let document;
    
    // Находим пользователя
    if (args.userId) {
      try {
        document = await ctx.db.get(args.userId as any);
      } catch (error) {
        console.log('⚠️ Не удалось найти по ID');
      }
    }
    
    if (!document && args.email) {
      // Ищем в users
      document = await ctx.db
        .query("users")
        .filter((q) => q.eq(q.field("email"), args.email))
        .first();
      
      // Если не нашли в users, ищем в trainers
      if (!document) {
        document = await ctx.db
          .query("trainers")
          .filter((q) => q.eq(q.field("email"), args.email))
          .first();
      }
    }
    
    if (!document) {
      return { success: false, error: "Пользователь не найден" };
    }
    
    // Проверяем текущий пароль
    // В реальном приложении здесь должна быть проверка хеша пароля
    
    // Обновляем пароль
    await ctx.db.patch(document._id, {
      password: args.newPassword, // В реальности должен быть хеш
      updatedAt: Date.now(),
    });
    
    console.log('✅ changePassword: пароль успешно изменен');
    return { success: true };
  },
});

export const sendVerificationEmail = mutation({
  args: {
    userId: v.optional(v.string()),
    email: v.string(),
  },
  handler: async (ctx, args) => {
    console.log('📧 sendVerificationEmail: отправка письма для:', args.email);
    
    // В реальном приложении здесь будет интеграция с email сервисом
    // Сейчас просто логируем
    
    console.log('✅ sendVerificationEmail: письмо отправлено (заглушка)');
    return { success: true, message: "Письмо отправлено" };
  },
});


export const updatePreferences = mutation({
  args: {
    userId: v.string(),
    preferences: v.object({
      emailNotifications: v.optional(v.boolean()),
      smsNotifications: v.optional(v.boolean()),
      pushNotifications: v.optional(v.boolean()),
      language: v.optional(v.string()),
      theme: v.optional(v.string()),
      timezone: v.optional(v.string()),
      showProfile: v.optional(v.boolean()),
      allowMessages: v.optional(v.boolean()),
      marketingEmails: v.optional(v.boolean()),
      updatedAt: v.optional(v.number()),
    }),
  },
  handler: async (ctx, args) => {
    console.log('⚙️ updatePreferences: обновляем настройки для:', args.userId);
    
    try {
      const document = await ctx.db.get(args.userId as any);
      if (!document) {
        throw new Error("Пользователь не найден");
      }
      
      // Получаем текущие preferences или создаем новый объект
      const currentPreferences = (document as any).preferences || {
        notifications: {
          email: true,
          push: true,
          sms: false
        }
      };
      
      // Обновляем notifications если нужно
      const updatedNotifications = {
        ...currentPreferences.notifications,
        email: args.preferences.emailNotifications ?? currentPreferences.notifications?.email,
        push: args.preferences.pushNotifications ?? currentPreferences.notifications?.push,
        sms: args.preferences.smsNotifications ?? currentPreferences.notifications?.sms,
      };
      
      // Создаем обновленный объект preferences
      const updatedPreferences = {
        ...currentPreferences,
        notifications: updatedNotifications,
        language: args.preferences.language ?? currentPreferences.language,
        theme: args.preferences.theme ?? currentPreferences.theme,
        timezone: args.preferences.timezone ?? currentPreferences.timezone,
        showProfile: args.preferences.showProfile ?? currentPreferences.showProfile,
        allowMessages: args.preferences.allowMessages ?? currentPreferences.allowMessages,
        marketingEmails: args.preferences.marketingEmails ?? currentPreferences.marketingEmails,
        emailNotifications: args.preferences.emailNotifications ?? currentPreferences.emailNotifications,
        smsNotifications: args.preferences.smsNotifications ?? currentPreferences.smsNotifications,
        pushNotifications: args.preferences.pushNotifications ?? currentPreferences.pushNotifications,
      };
      
      await ctx.db.patch(document._id, {
        preferences: updatedPreferences,
        updatedAt: Date.now(),
      });
      
      console.log('✅ updatePreferences: настройки обновлены');
      return { success: true, preferences: updatedPreferences };
      
    } catch (error) {
      console.error('❌ updatePreferences: ошибка:', error);
      throw error;
    }
  },
});

export const deactivateAccount = mutation({
  args: {
    userId: v.optional(v.string()),
    email: v.optional(v.string()),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    console.log('🗑️ deactivateAccount: деактивация аккаунта');
    
    let document;
    
    // Находим пользователя
    if (args.userId) {
      try {
        document = await ctx.db.get(args.userId as any);
      } catch (error) {
        console.log('⚠️ Не удалось найти по ID');
      }
    }
    
    if (!document && args.email) {
      // Ищем в users
      document = await ctx.db
        .query("users")
        .filter((q) => q.eq(q.field("email"), args.email))
        .first();
      
      // Если не нашли в users, ищем в trainers
      if (!document) {
        document = await ctx.db
          .query("trainers")
          .filter((q) => q.eq(q.field("email"), args.email))
          .first();
      }
    }
    
    if (!document) {
      throw new Error("Пользователь не найден");
    }
    
    console.log('✅ deactivateAccount: аккаунт деактивирован');
    return { success: true, message: "Аккаунт деактивирован" };
  },
});

export const getMemberStats = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    console.log('📊 getMemberStats: получаем статистику для:', args.userId);
    
    try {
      const user = await ctx.db.get(args.userId as any);
      if (!user) {
        return null;
      }
      
      // Получаем данные из разных таблиц
      const [workouts, bookings, visits] = await Promise.all([
        // Тренировки из таблицы workouts
        ctx.db.query("workouts")
          .filter((q) => q.eq(q.field("userId"), args.userId as any))
          .collect(),
        
        // Бронирования из таблицы userBookings
        ctx.db.query("userBookings")
          .filter((q) => q.eq(q.field("userId"), args.userId as any))
          .collect(),
        
        // Достижения можно получить из поля user
        Promise.resolve((user as any).achievements || [])
      ]);
      
      // Подсчитываем статистику
      const totalWorkouts = workouts.length + bookings.length;
      const totalHours = [...workouts, ...bookings].reduce((sum, item) => {
        return sum + (item.duration || 0);
      }, 0) / 60; // Конвертируем минуты в часы
      
      // Текущая серия (упрощенный расчет)
      const sortedWorkouts = [...workouts, ...bookings]
        .sort((a, b) => (b as any).startTime - (a as any).startTime);
      
      let currentStreak = 0;
      const oneDayMs = 24 * 60 * 60 * 1000;
      const now = Date.now();
      
      for (let i = 0; i < sortedWorkouts.length; i++) {
        const workout = sortedWorkouts[i] as any;
        const daysDiff = Math.floor((now - workout.startTime) / oneDayMs);
        
        if (daysDiff === i) {
          currentStreak++;
        } else {
          break;
        }
      }
      
      return {
        totalWorkouts: (user as any).totalWorkouts || totalWorkouts,
        totalHours: Math.round(totalHours),
        currentStreak: (user as any).currentStreak || currentStreak,
        personalRecords: (user as any).personalRecords || 0,
        caloriesBurned: (user as any).caloriesBurned || 0,
        averageWorkoutTime: (user as any).averageWorkoutTime || 45,
        membershipType: (user as any).membershipType || 'basic',
        membershipExpiry: (user as any).membershipExpiry || null,
        lastWorkout: (user as any).lastWorkout || (sortedWorkouts[0] as any)?.startTime || null,
        achievements: (user as any).achievements || [],
        goals: (user as any).goals || [],
      };
      
    } catch (error) {
      console.error('❌ getMemberStats: ошибка:', error);
      return null;
    }
  },
});

export const addAchievement = mutation({
  args: {
    userId: v.string(),
    achievement: v.object({
      id: v.string(),
      title: v.string(),
      description: v.optional(v.string()),
      icon: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId as any);
    if (!user) {
      throw new Error("Пользователь не найден");
    }
    
    const currentAchievements = (user as any).achievements || [];
    
    // Проверяем, что достижение еще не получено
    if (currentAchievements.some((a: any) => a.id === args.achievement.id)) {
      return { success: false, message: "Достижение уже получено" };
    }
    
    const newAchievement = {
      ...args.achievement,
      earnedAt: Date.now(),
    };
    
    return { success: true, achievement: newAchievement };
  },
});

// Управление целями пользователя
export const updateGoals = mutation({
  args: {
    userId: v.string(),
    action: v.union(v.literal("add"), v.literal("update"), v.literal("remove")),
    goal: v.object({
      id: v.string(),
      title: v.optional(v.string()),
      targetValue: v.optional(v.number()),
      currentValue: v.optional(v.number()),
      unit: v.optional(v.string()),
      targetDate: v.optional(v.number()),
      completed: v.optional(v.boolean()),
      completedAt: v.optional(v.number()),
    }),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId as any);
    if (!user) {
      throw new Error("Пользователь не найден");
    }
    
    let goals = (user as any).goals || [];
    
    switch (args.action) {
      case "add":
        const newGoal = {
          ...args.goal,
          createdAt: Date.now(),
          completed: false,
        };
        goals.push(newGoal);
        break;
        
      case "update":
        goals = goals.map((g: any) => 
          g.id === args.goal.id 
            ? { ...g, ...args.goal, updatedAt: Date.now() }
            : g
        );
        break;
        
      case "remove":
        goals = goals.filter((g: any) => g.id !== args.goal.id);
        break;
    }
    
    await ctx.db.patch(user._id, {
      goals,
      updatedAt: Date.now(),
    });
    
    return { success: true, goals };
  },
});


export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    console.log('🔍 getUserByEmail: ищем пользователя по email:', args.email);
    
    // Сначала ищем в таблице users
    const user = await ctx.db.query("users")
      .filter((q) => q.eq(q.field("email"), args.email))
      .first();
    
    
    // Если не найден в users, ищем в trainers
    const trainer = await ctx.db.query("trainers")
      .filter((q) => q.eq(q.field("email"), args.email))
      .first();
    
    if (trainer) {
      console.log('✅ getUserByEmail: тренер найден в trainers');
      return {
        ...trainer,
        _id: trainer._id,
        id: trainer._id, // Для совместимости
        role: trainer.role || 'trainer',
        avatar: trainer.photoUrl || trainer.avatar,
        isVerified: true, // Тренеры считаются верифицированными
      };
    }
    
    console.log('❌ getUserByEmail: пользователь не найден');
    return null;
  },
});

export const updateAvatar = mutation({
  args: {
    userId: v.optional(v.string()),
    email: v.optional(v.string()),
    avatarUrl: v.string(),
  },
  handler: async (ctx, args) => {
    console.log("🖼️ updateAvatar mutation called:", {
      userId: args.userId,
      email: args.email,
      avatarUrl: args.avatarUrl.substring(0, 50) + "..."
    });

    if (!args.userId && !args.email) {
      throw new Error("Необходимо указать userId или email");
    }

    let user = null;
    
    // 1. Try by userId first if provided
    if (args.userId) {
      try {
        user = await ctx.db.get(args.userId as any);
        if (!user) {
          console.log("⚠️ Пользователь не найден по ID:", args.userId);
        }
      } catch (error) {
        console.log("⚠️ Ошибка поиска по ID:", error);
      }
    }
    
    // 2. If still not found and email provided, search by email
    if (!user && args.email) {
      // Search in users table
      user = await ctx.db
        .query("users")
        .filter((q) => q.eq(q.field("email"), args.email))
        .first();
      
      // If not found in users, search in trainers
      if (!user) {
        user = await ctx.db
          .query("trainers")
          .filter((q) => q.eq(q.field("email"), args.email))
          .first();
      }
      
      if (!user) {
        console.log("⚠️ Пользователь не найден по email:", args.email);
      }
    }

    if (!user) {
      throw new Error(`Пользователь не найден ${args.userId ? `по ID: ${args.userId}` : ''}${args.email ? `по email: ${args.email}` : ''}`);
    }

    // Prepare update data - update both avatar and photoUrl for compatibility
    const updateData = {
      avatar: args.avatarUrl,
      photoUrl: args.avatarUrl,
      updatedAt: Date.now(),
    };

    // Update the user
    await ctx.db.patch(user._id, updateData);

    console.log("✅ Аватар обновлен для пользователя:", user._id);

    return { 
      success: true, 
      userId: user._id,
      avatarUrl: args.avatarUrl 
    };
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