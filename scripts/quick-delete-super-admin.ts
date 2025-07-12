// scripts/quick-delete-super-admin.ts
import { ConvexHttpClient } from "convex/browser";

interface SuperAdmin {
  _id: string;
  name: string;
  email: string;
  isActive: boolean;
  role: string;
}

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

async function quickDeleteSuperAdmin() {
  try {
    const email = "romangulanyan@gmail.com";
    
    console.log('🔍 Поиск супер-админа с email:', email);
    
    // Проверяем, что есть другие супер-админы
    const superAdmins: SuperAdmin[] = await convex.query("admin:getAllSuperAdmins");
    
    if (superAdmins.length <= 1) {
      console.log('❌ Нельзя удалить единственного супер-админа!');
      return;
    }
    
    console.log(`📊 Найдено супер-админов: ${superAdmins.length}`);
    
    // Вариант 1: Мягкое удаление (деактивация)
    console.log('🔄 Выполняем мягкое удаление (деактивацию)...');
    
    const targetAdmin = superAdmins.find(admin => admin.email === email);
    if (!targetAdmin) {
      console.log('❌ Супер-админ с таким email не найден');
      return;
    }
    
    await convex.mutation("admin:deactivateSuperAdmin", {
      userId: targetAdmin._id
    });
    
    console.log('✅ Супер-админ деактивирован');
    
    // Если нужно физическое удаление, раскомментируйте:
    
    // console.log('🔄 Выполняем физическое удаление...');
    // await convex.mutation("admin:deleteSuperAdminByEmail", {
    //   email: email,
    //   confirmationCode: "DELETE_SUPER_ADMIN_CONFIRMED"
    // });
    // console.log('✅ Супер-админ физически удален');
    
  } catch (error) {
    console.error('❌ Ошибка:', error);
  }
}

// Запуск скрипта
quickDeleteSuperAdmin();