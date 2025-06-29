import { mutation } from "./_generated/server";

export const seedPlans = mutation({
  handler: async (ctx) => {
    console.log("🔄 Начинаем добавление планов абонементов");

    // Проверяем, есть ли уже планы
    const existingPlans = await ctx.db.query("membershipPlans").collect();
    
    if (existingPlans.length > 0) {
      console.log("⚠️ Планы уже существуют, пропускаем");
      return { message: "Планы уже существуют", count: existingPlans.length };
    }

    // Планы для добавления (используем правильные имена полей без подчеркиваний)
    const plans = [
      {
        name: "Базовый",
        type: "basic",
        duration: 30,
        price: 2990,
        description: "Идеально для начинающих",
        features: [
          "Доступ в тренажерный зал",
          "Базовые групповые занятия",
          "Раздевалка и душ",
          "Консультация тренера"
        ],
        isActive: true,
        createdAt: Date.now(),
        syncVersion: 1,
        lastSyncTime: Date.now(),
        isDirty: false
      },
      {
        name: "Премиум",
        type: "premium",
        duration: 30,
        price: 4990,
        description: "Для активных спортсменов",
        features: [
          "Всё из Базового",
          "Все групповые программы",
          "Сауна и бассейн",
          "2 персональные тренировки",
          "Приоритетная запись"
        ],
        isActive: true,
        createdAt: Date.now(),
        syncVersion: 1,
        lastSyncTime: Date.now(),
        isDirty: false
      },
      {
        name: "VIP",
        type: "vip",
        duration: 30,
        price: 7990,
        description: "Максимум возможностей",
        features: [
          "Всё из Премиум",
          "8 персональных тренировок",
          "Личный шкафчик",
          "Питание в фитнес-баре",
          "Массаж 2 раза в месяц",
          "Приоритетная парковка"
        ],
        isActive: true,
        createdAt: Date.now(),
        syncVersion: 1,
        lastSyncTime: Date.now(),
        isDirty: false
      },
      {
        name: "Безлимит",
        type: "unlimited",
        duration: 365,
        price: 39900,
        description: "Годовой абонемент",
        features: [
          "Все возможности VIP",
          "Безлимитные тренировки",
          "Гостевые визиты",
          "Заморозка до 30 дней",
          "Специальные мероприятия",
          "Подарочный фитнес-набор"
        ],
        isActive: true,
        createdAt: Date.now(),
        syncVersion: 1,
        lastSyncTime: Date.now(),
        isDirty: false
      }
    ];

    // Добавляем планы в базу данных
    const insertedIds = [];
    for (const plan of plans) {
      const id = await ctx.db.insert("membershipPlans", plan);
      insertedIds.push(id);
      console.log(`✅ Добавлен план: ${plan.name} (${plan.type})`);
    }

    console.log("✅ Все планы успешно добавлены");
    return { 
      message: "Планы успешно добавлены", 
      count: insertedIds.length,
      ids: insertedIds 
    };
  },
});

// Функция для проверки планов
export const checkPlans = mutation({
  handler: async (ctx) => {
    const plans = await ctx.db.query("membershipPlans").collect();
    
    console.log("📊 Найдено планов:", plans.length);
    plans.forEach(plan => {
      console.log(`- ${plan.name} (${plan.type}): ${plan.price}₽`);
    });
    
    return {
      count: plans.length,
      plans: plans.map(p => ({
        id: p._id,
        name: p.name,
        type: p.type,
        price: p.price,
        isActive: p.isActive
      }))
    };
  },
});