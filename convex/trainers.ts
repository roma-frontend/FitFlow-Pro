// convex/trainers.ts (исправленная версия с правильной типизацией)
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

// ✅ ТИПЫ ДЛЯ РАБОЧИХ ЧАСОВ
interface SimpleWorkingHours {
  start: string;
  end: string;
  days: number[];
}

interface WeeklyWorkingHours {
  sunday?: { start: string; end: string };
  monday?: { start: string; end: string };
  tuesday?: { start: string; end: string };
  wednesday?: { start: string; end: string };
  thursday?: { start: string; end: string };
  friday?: { start: string; end: string };
  saturday?: { start: string; end: string };
}

type WorkingHours = SimpleWorkingHours | WeeklyWorkingHours | null | undefined;

// ✅ ТИП ДЛЯ ТРЕНЕРА
interface TrainerDocument {
  _id: Id<"trainers">;
  _creationTime: number;
  name: string;
  email: string;
  phone: string;
  password?: string;
  photoUrl?: string;
  avatar?: string;
  bio?: string;
  specializations: string[];
  experience?: number;
  certifications?: string[];
  languages?: string[];
  rating?: number;
  totalReviews?: number;
  workingHours?: WorkingHours;
  hourlyRate?: number;
  isActive?: boolean;
  status?: string;
  role?: string;
  joinDate?: string;
  totalClients?: number;
  activeClients?: number;
  totalWorkouts?: number;
  monthlyRevenue?: number;
  lastActivity?: string;
  createdAt: number;
  updatedAt?: number;
}

// ✅ ФУНКЦИЯ ДЛЯ ПРОВЕРКИ ЧТО ЭТО ТРЕНЕР
function isTrainerDocument(doc: any): doc is TrainerDocument {
  return doc && 
         typeof doc === 'object' && 
         'name' in doc && 
         'email' in doc && 
         ('specializations' in doc || 'hourlyRate' in doc || 'workingHours' in doc);
}

// ✅ ФУНКЦИЯ ДЛЯ НОРМАЛИЗАЦИИ РАБОЧИХ ЧАСОВ С ТИПАМИ
function normalizeWorkingHours(workingHours: WorkingHours): SimpleWorkingHours {
  if (!workingHours) {
    return {
      start: '09:00',
      end: '18:00',
      days: [1, 2, 3, 4, 5]
    };
  }
  
  // ✅ ПРОВЕРЯЕМ ПРОСТОЙ ФОРМАТ
  if ('start' in workingHours && 'end' in workingHours && 'days' in workingHours) {
    return {
      start: workingHours.start,
      end: workingHours.end,
      days: workingHours.days
    };
  }
  
  // ✅ ПРОВЕРЯЕМ ФОРМАТ ПО ДНЯМ НЕДЕЛИ
  const weeklyHours = workingHours as WeeklyWorkingHours;
  if (weeklyHours.monday || weeklyHours.tuesday || weeklyHours.wednesday || 
      weeklyHours.thursday || weeklyHours.friday || weeklyHours.saturday || 
      weeklyHours.sunday) {
    
    const days: number[] = [];
    const dayNames: (keyof WeeklyWorkingHours)[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    
    for (let i = 0; i < dayNames.length; i++) {
      if (weeklyHours[dayNames[i]]) {
        days.push(i);
      }
    }
    
    let startTime = '09:00';
    let endTime = '18:00';
    
    for (const dayName of dayNames) {
      if (weeklyHours[dayName]) {
        startTime = weeklyHours[dayName]!.start;
        endTime = weeklyHours[dayName]!.end;
        break;
      }
    }
    
    return {
      start: startTime,
      end: endTime,
      days: days.length > 0 ? days : [1, 2, 3, 4, 5]
    };
  }
  
  return {
    start: '09:00',
    end: '18:00',
    days: [1, 2, 3, 4, 5]
  };
}

// ✅ ОСНОВНАЯ ФУНКЦИЯ ДЛЯ API
export const getActiveTrainers = query({
  handler: async (ctx) => {
    console.log('🔍 Convex trainers: получаем активных тренеров...');
    
    try {
      const allTrainers = await ctx.db.query("trainers").collect();
      console.log(`📋 Convex trainers: всего тренеров в базе: ${allTrainers.length}`);
      
      const activeTrainers = allTrainers.filter(trainer => {
        return trainer.status === 'active' || 
               trainer.isActive === true || 
               (!trainer.status && trainer.isActive !== false);
      });
      
      console.log(`✅ Convex trainers: найдено ${activeTrainers.length} активных тренеров`);
      
      const normalizedTrainers = activeTrainers.map(trainer => {
        try {
          return {
            _id: trainer._id,
            name: trainer.name,
            email: trainer.email,
            role: trainer.role || trainer.specializations?.[0] || 'Тренер',
            status: trainer.status || (trainer.isActive ? 'active' : 'inactive'),
            workingHours: normalizeWorkingHours(trainer.workingHours),
            specializations: trainer.specializations || [],
            experience: trainer.experience || 0,
            rating: trainer.rating || 0,
            hourlyRate: trainer.hourlyRate || 0,
            createdAt: trainer.createdAt,
            phone: trainer.phone || '',
            bio: trainer.bio || '',
            photoUrl: trainer.photoUrl || trainer.avatar || null
          };
        } catch (error) {
          console.error(`❌ Ошибка нормализации тренера ${trainer.name}:`, error);
          return {
            _id: trainer._id,
            name: trainer.name,
            email: trainer.email,
            role: 'Тренер',
            status: 'active',
            workingHours: {
              start: '09:00',
              end: '18:00',
              days: [1, 2, 3, 4, 5]
            },
            specializations: [],
            experience: 0,
            rating: 0,
            hourlyRate: 0,
            createdAt: trainer.createdAt || Date.now(),
            phone: '',
            bio: '',
            photoUrl: null
          };
        }
      });
      
      return normalizedTrainers;
    } catch (error) {
      console.error('❌ Convex trainers: критическая ошибка:', error);
      return [];
    }
  },
});

// ✅ ФУНКЦИЯ ДЛЯ HEALTH CHECK
export const getAllTrainers = query({
  handler: async (ctx) => {
    console.log('🔍 Convex trainers: getAllTrainers для health check');
    
    try {
      const trainers = await ctx.db.query("trainers").collect();
      console.log('✅ Convex trainers: найдено тренеров:', trainers.length);
      return trainers;
    } catch (error) {
      console.error('❌ Convex trainers: ошибка getAllTrainers:', error);
      return [];
    }
  },
});

// ✅ ИСПРАВЛЕННАЯ ФУНКЦИЯ УДАЛЕНИЯ ТРЕНЕРА
export const deleteTrainer = mutation({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    console.log('🗑️ Удаляем тренера:', args.id);
    
    try {
      // ✅ ПРАВИЛЬНОЕ ПОЛУЧЕНИЕ ДОКУМЕНТА ИЗ ТАБЛИЦЫ TRAINERS
      const trainerId = args.id as Id<"trainers">;
      const trainer = await ctx.db.get(trainerId);
      
      if (!trainer) {
        throw new Error("Тренер не найден");
      }
      
      // ✅ ПРОВЕРЯЕМ ЧТО ЭТО ДЕЙСТВИТЕЛЬНО ТРЕНЕР
      if (!isTrainerDocument(trainer)) {
        throw new Error("Документ не является тренером");
      }
      
      await ctx.db.delete(trainerId);
      
      console.log('✅ Тренер удален:', trainer.name);
      return { success: true, deletedTrainer: trainer };
    } catch (error) {
      console.error("❌ Ошибка удаления тренера:", error);
      throw error;
    }
  },
});

// ✅ АЛИАС ДЛЯ СОВМЕСТИМОСТИ
export const getAll = query({
  handler: async (ctx) => {
    console.log('🔍 Convex trainers: getAll (алиас для getAllTrainers)');
    
    try {
      const trainers = await ctx.db.query("trainers").collect();
      console.log('✅ Convex trainers: найдено тренеров:', trainers.length);
      return trainers;
    } catch (error) {
      console.error('❌ Convex trainers: ошибка getAll:', error);
      return [];
    }
  },
});

// ✅ ИСПРАВЛЕННАЯ ФУНКЦИЯ ПОЛУЧЕНИЯ ТРЕНЕРА ПО ID
export const getById = query({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    console.log('🔍 Convex trainers: ищем тренера по ID:', args.id);
    
    try {
      // ✅ СНАЧАЛА ПРОБУЕМ ПОЛУЧИТЬ ПО ID
      const trainerId = args.id as Id<"trainers">;
      const trainer = await ctx.db.get(trainerId);
      
      if (trainer && isTrainerDocument(trainer)) {
        console.log('✅ Convex trainers: тренер найден по _id');
        return trainer;
      }
    } catch (error) {
      console.log('⚠️ Convex trainers: не найден по _id, пробуем поиск по полям');
    }
    
    // ✅ ЕСЛИ НЕ НАЙДЕН ПО ID, ИЩЕМ ПО EMAIL ИЛИ ИМЕНИ
    const trainer = await ctx.db.query("trainers")
      .filter((q) => q.or(
        q.eq(q.field("email"), args.id),
        q.eq(q.field("name"), args.id)
      ))
      .first();
    
    console.log('✅ Convex trainers: тренер найден:', trainer ? 'да' : 'нет');
    return trainer ?? null;
  },
});

// ✅ ПОЛУЧЕНИЕ ТРЕНЕРА ПО SLUG
export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    console.log('🔍 Convex trainers: ищем тренера по slug:', args.slug);
    
    const allTrainers = await ctx.db.query("trainers").collect();
    
    const slugToNameMap: { [key: string]: string } = {};
    allTrainers.forEach(trainer => {
      const slug = trainer.name
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[а-я]/g, (char) => {
          const map: { [key: string]: string } = {
            'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'e',
            'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
            'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
            'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch',
            'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
          };
          return map[char] || char;
        });
      slugToNameMap[slug] = trainer.name;
    });
    
    const russianName = slugToNameMap[args.slug];
    
    if (!russianName) {
      console.log('❌ Convex trainers: slug не найден в маппинге');
      return null;
    }
    
    const trainer = await ctx.db.query("trainers")
      .filter((q) => q.eq(q.field("name"), russianName))
      .first();
    
    if (trainer) {
      console.log('✅ Convex trainers: найден тренер:', trainer.name);
    } else {
      console.log('❌ Convex trainers: тренер не найден по имени:', russianName);
    }
    
    return trainer ?? null;
  },
});

// ✅ СОЗДАНИЕ ТРЕНЕРА
export const createTrainer = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    phone: v.string(),
    specializations: v.array(v.string()),
    experience: v.optional(v.number()),
    hourlyRate: v.optional(v.number()),
    bio: v.optional(v.string()),
    workingHours: v.optional(v.object({
      start: v.string(),
      end: v.string(),
      days: v.array(v.number())
    }))
  },
  handler: async (ctx, args) => {
    console.log('➕ Convex trainers: создание тренера:', args.name);
    
    try {
      const trainerId = await ctx.db.insert("trainers", {
        name: args.name,
        email: args.email,
        phone: args.phone,
        specializations: args.specializations,
        experience: args.experience || 0,
        hourlyRate: args.hourlyRate || 0,
        bio: args.bio || '',
        workingHours: args.workingHours || {
          start: '09:00',
          end: '18:00',
          days: [1, 2, 3, 4, 5]
        },
                rating: 0,
        totalReviews: 0,
        isActive: true,
        status: 'active',
        createdAt: Date.now()
      });
      
      console.log('✅ Convex trainers: тренер создан с ID:', trainerId);
      return trainerId;
    } catch (error) {
      console.error('❌ Convex trainers: ошибка создания тренера:', error);
      throw error;
    }
  },
});

// ✅ ФУНКЦИЯ ДЛЯ МИГРАЦИИ СУЩЕСТВУЮЩИХ ДАННЫХ
export const migrateWorkingHours = mutation({
  handler: async (ctx) => {
    console.log('🔄 Начинаем миграцию рабочих часов тренеров...');
    
    try {
      const allTrainers = await ctx.db.query("trainers").collect();
      let migratedCount = 0;
      
      for (const trainer of allTrainers) {
        // ✅ БЕЗОПАСНАЯ ПРОВЕРКА С ТИПАМИ
        const workingHours = trainer.workingHours as WorkingHours;
        
        if (workingHours && 
            !('days' in workingHours) && 
            (('monday' in workingHours && workingHours.monday) || 
             ('tuesday' in workingHours && workingHours.tuesday))) {
          
          console.log(`🔄 Мигрируем тренера: ${trainer.name}`);
          
          const normalizedHours = normalizeWorkingHours(workingHours);
          
          await ctx.db.patch(trainer._id, {
            workingHours: normalizedHours,
            updatedAt: Date.now()
          });
          
          migratedCount++;
          console.log(`✅ Мигрирован тренер: ${trainer.name}`);
        }
      }
      
      console.log(`🎉 Миграция завершена. Обновлено тренеров: ${migratedCount}`);
      return { migratedCount, total: allTrainers.length };
    } catch (error) {
      console.error('❌ Ошибка миграции:', error);
      throw error;
    }
  },
});

// ✅ ПОЛУЧЕНИЕ СТАТИСТИКИ
export const getStats = query({
  handler: async (ctx) => {
    console.log('📊 Convex trainers: получение статистики...');
    
    try {
      const allTrainers = await ctx.db.query("trainers").collect();
      const activeTrainers = allTrainers.filter(t => 
        t.status === 'active' || t.isActive === true
      );
      
      const stats = {
        total: allTrainers.length,
        active: activeTrainers.length,
        inactive: allTrainers.length - activeTrainers.length,
        averageRating: activeTrainers.reduce((sum, t) => sum + (t.rating || 0), 0) / activeTrainers.length || 0,
        specializations: [...new Set(allTrainers.flatMap(t => t.specializations || []))]
      };
      
      console.log('✅ Convex trainers: статистика получена:', stats);
      return stats;
    } catch (error) {
      console.error('❌ Convex trainers: ошибка получения статистики:', error);
      return {
        total: 0,
        active: 0,
        inactive: 0,
        averageRating: 0,
        specializations: []
      };
    }
  },
});

// ✅ ОБНОВЛЕНИЕ ТРЕНЕРА
export const updateTrainer = mutation({
  args: {
    id: v.string(),
    updates: v.object({
      name: v.optional(v.string()),
      email: v.optional(v.string()),
      phone: v.optional(v.string()),
      bio: v.optional(v.string()),
      specializations: v.optional(v.array(v.string())),
      experience: v.optional(v.number()),
      hourlyRate: v.optional(v.number()),
      isActive: v.optional(v.boolean()),
      status: v.optional(v.string()),
      photoUrl: v.optional(v.string()),
      workingHours: v.optional(v.object({
        start: v.string(),
        end: v.string(),
        days: v.array(v.number())
      }))
    })
  },
  handler: async (ctx, args) => {
    console.log('🔧 Convex trainers: обновляем тренера:', args.id);
    
    try {
      const trainerId = args.id as Id<"trainers">;
      const existingTrainer = await ctx.db.get(trainerId);
      
      if (!existingTrainer || !isTrainerDocument(existingTrainer)) {
        throw new Error("Тренер не найден");
      }
      
      // Фильтруем undefined значения
      const filteredUpdates: any = {};
      Object.entries(args.updates).forEach(([key, value]) => {
        if (value !== undefined) {
          filteredUpdates[key] = value;
        }
      });
      
      // Синхронизируем статус и isActive
      if (filteredUpdates.isActive !== undefined) {
        filteredUpdates.status = filteredUpdates.isActive ? 'active' : 'inactive';
      }
      if (filteredUpdates.status !== undefined) {
        filteredUpdates.isActive = filteredUpdates.status === 'active';
      }
      
      if (Object.keys(filteredUpdates).length === 0) {
        console.log('ℹ️ Нет данных для обновления');
        return args.id;
      }
      
      await ctx.db.patch(trainerId, {
        ...filteredUpdates,
        updatedAt: Date.now()
      });
      
      console.log('✅ Тренер обновлен успешно');
      return args.id;
    } catch (error) {
      console.error('❌ Ошибка обновления тренера:', error);
      throw error;
    }
  },
});

// ✅ ПОЛУЧЕНИЕ ТРЕНЕРА ПО EMAIL
export const getByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    console.log('🔍 Convex trainers: ищем тренера по email:', args.email);
    
    const trainer = await ctx.db.query("trainers")
      .filter((q) => q.eq(q.field("email"), args.email))
      .first();
    
    console.log('✅ Convex trainers: тренер найден:', trainer ? 'да' : 'нет');
    return trainer ?? null;
  },
});

// ✅ ПОЛУЧЕНИЕ АКТИВНЫХ ТРЕНЕРОВ ДЛЯ РАСПИСАНИЯ
export const getActiveTrainersForSchedule = query({
  handler: async (ctx) => {
    console.log('🔍 Convex trainers: получаем тренеров для расписания...');
    
    try {
      const activeTrainers = await ctx.db.query("trainers")
        .filter((q) => q.or(
          q.eq(q.field("status"), "active"),
          q.eq(q.field("isActive"), true)
        ))
        .collect();
      
      const trainersForSchedule = activeTrainers.map(trainer => ({
        id: trainer._id,
        name: trainer.name,
        email: trainer.email,
        role: trainer.role || 'trainer',
        specializations: trainer.specializations || [],
        workingHours: normalizeWorkingHours(trainer.workingHours),
        hourlyRate: trainer.hourlyRate || 0,
        photoUrl: trainer.photoUrl || trainer.avatar || null
      }));
      
      console.log(`✅ Найдено ${trainersForSchedule.length} активных тренеров для расписания`);
      return trainersForSchedule;
    } catch (error) {
      console.error('❌ Ошибка получения тренеров для расписания:', error);
      return [];
    }
  },
});

// ✅ ПОИСК ТРЕНЕРОВ ПО СПЕЦИАЛИЗАЦИИ
export const getBySpecialization = query({
  args: { specialization: v.string() },
  handler: async (ctx, args) => {
    console.log('🔍 Convex trainers: поиск по специализации:', args.specialization);
    
    try {
      const trainers = await ctx.db.query("trainers")
        .filter((q) => q.and(
          q.or(
            q.eq(q.field("status"), "active"),
            q.eq(q.field("isActive"), true)
          ),
          // Проверяем что специализация содержится в массиве
          q.neq(q.field("specializations"), undefined)
        ))
        .collect();
      
      // Фильтруем по специализации на стороне клиента
      const filteredTrainers = trainers.filter(trainer => 
        trainer.specializations && 
        trainer.specializations.some(spec => 
          spec.toLowerCase().includes(args.specialization.toLowerCase())
        )
      );
      
      console.log(`✅ Найдено ${filteredTrainers.length} тренеров по специализации "${args.specialization}"`);
      return filteredTrainers;
    } catch (error) {
      console.error('❌ Ошибка поиска по специализации:', error);
      return [];
    }
  },
});

// ✅ ПОЛУЧЕНИЕ ТОП ТРЕНЕРОВ ПО РЕЙТИНГУ
export const getTopRatedTrainers = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    console.log('🔍 Convex trainers: получаем топ тренеров по рейтингу...');
    
    try {
      const limit = args.limit || 10;
      const activeTrainers = await ctx.db.query("trainers")
        .filter((q) => q.and(
          q.or(
            q.eq(q.field("status"), "active"),
            q.eq(q.field("isActive"), true)
          ),
          q.gt(q.field("rating"), 0)
        ))
        .collect();
      
      // Сортируем по рейтингу и берем топ
      const topTrainers = activeTrainers
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
        .slice(0, limit);
      
      console.log(`✅ Найдено ${topTrainers.length} топ тренеров`);
      return topTrainers;
    } catch (error) {
      console.error('❌ Ошибка получения топ тренеров:', error);
      return [];
    }
  },
});

