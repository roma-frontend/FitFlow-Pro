import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

// Миграция для удаления поля userRole из существующих заказов
export const removeUserRoleFromOrders = internalMutation({
  args: {},
  handler: async (ctx) => {
    console.log("🔄 Начинаем миграцию: удаление userRole из orders");
    
    // Получаем все заказы
    const orders = await ctx.db.query("orders").collect();
    
    let updatedCount = 0;
    
    for (const order of orders) {
      // Проверяем, есть ли поле userRole
      if ('userRole' in order) {
        console.log(`🔄 Удаляем userRole из заказа ${order._id}`);
        
        // Создаем новый объект без userRole
        const { userRole, ...orderWithoutUserRole } = order as any;
        
        // Обновляем запись
        await ctx.db.replace(order._id, orderWithoutUserRole);
        updatedCount++;
      }
    }
    
    console.log(`✅ Миграция завершена. Обновлено заказов: ${updatedCount}`);
    return { updatedCount };
  },
});

// Альтернативная миграция - полная очистка таблицы orders (если данные не важны)
export const clearAllOrders = internalMutation({
  args: {},
  handler: async (ctx) => {
    console.log("🗑️ Начинаем полную очистку таблицы orders");
    
    const orders = await ctx.db.query("orders").collect();
    
    for (const order of orders) {
      await ctx.db.delete(order._id);
    }
    
    console.log(`🗑️ Удалено заказов: ${orders.length}`);
    return { deletedCount: orders.length };
  },
});
