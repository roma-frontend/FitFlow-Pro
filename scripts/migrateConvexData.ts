// scripts/migrateConvexData.ts
import { ConvexHttpClient } from "convex/browser";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

async function migrateConvexData() {
  console.log('🚀 Запуск миграции данных Convex...');
  
  try {
    // ✅ 1. ПРОВЕРЯЕМ ПОДКЛЮЧЕНИЕ
    console.log('🔍 Проверяем подключение к Convex...');
    const allTrainers = await convex.query("trainers:getAllTrainers");
    console.log(`✅ Подключение успешно. Найдено тренеров: ${allTrainers.length}`);
    
    // ✅ 2. ЗАПУСКАЕМ МИГРАЦИЮ РАБОЧИХ ЧАСОВ
    console.log('🔄 Запускаем миграцию рабочих часов...');
    const migrationResult = await convex.mutation("trainers:migrateWorkingHours");
    console.log('✅ Миграция завершена:', migrationResult);
    
    // ✅ 3. ПРОВЕРЯЕМ РЕЗУЛЬТАТ
    console.log('🔍 Проверяем результат миграции...');
    const activeTrainers = await convex.query("trainers:getActiveTrainers");
    console.log(`✅ Активных тренеров после миграции: ${activeTrainers.length}`);
    
    // ✅ 4. ПОКАЗЫВАЕМ СТАТИСТИКУ
    const stats = await convex.query("trainers:getStats");
    console.log('📊 Статистика тренеров:', stats);
    
    console.log('🎉 Миграция данных завершена успешно!');
    return true;
    
  } catch (error) {
    console.error('❌ Ошибка миграции данных:', error);
    return false;
  }
}

// Запускаем только если файл выполняется напрямую
if (require.main === module) {
  migrateConvexData();
}

export default migrateConvexData;
