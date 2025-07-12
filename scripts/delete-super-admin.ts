// scripts/delete-super-admin.ts
import { ConvexHttpClient } from "convex/browser";
import * as readline from 'readline';

// Define the SuperAdmin type
interface SuperAdmin {
  _id: string;
  name: string;
  email: string;
  isActive: boolean;
  role: string;
}

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function deleteSuperAdmin() {
  try {
    console.log('🔍 Получение списка супер-админов...');
    
    // Получаем всех супер-админов
    const superAdmins: SuperAdmin[] = await convex.query("admin:getAllSuperAdmins");
    
    if (!superAdmins || superAdmins.length === 0) {
      console.log('❌ Супер-админы не найдены');
      rl.close();
      return;
    }

    console.log('\n📋 Найденные супер-админы:');
    superAdmins.forEach((admin: SuperAdmin, index: number) => {
      console.log(`${index + 1}. ${admin.name} (${admin.email}) - ${admin.isActive ? 'Активен' : 'Неактивен'}`);
    });

    if (superAdmins.length === 1) {
      console.log('\n⚠️  ВНИМАНИЕ: Это единственный супер-админ! Удаление невозможно.');
      rl.close();
      return;
    }

    console.log('\n🚨 ВНИМАНИЕ: Вы собираетесь удалить супер-администратора!');
    console.log('Это действие необратимо и может нарушить работу системы.');
    
    const action = await askQuestion('\nВыберите действие:\n1. Мягкое удаление (деактивация)\n2. Физическое удаление\n3. Понижение до обычного админа\n4. Отмена\n\nВаш выбор (1-4): ');

    if (action === '4') {
      console.log('❌ Операция отменена');
      rl.close();
      return;
    }

    const email = await askQuestion('\nВведите email супер-админа для удаления: ');
    
    const targetAdmin = superAdmins.find((admin: SuperAdmin) => admin.email === email);
    if (!targetAdmin) {
      console.log('❌ Супер-админ с таким email не найден');
      rl.close();
      return;
    }

    console.log(`\n📧 Найден супер-админ: ${targetAdmin.name} (${targetAdmin.email})`);
    
    const confirm = await askQuestion(`\nВы уверены, что хотите ${action === '1' ? 'деактивировать' : action === '2' ? 'физически удалить' : 'понизить'} этого супер-админа? (да/нет): `);
    
    if (confirm.toLowerCase() !== 'да') {
      console.log('❌ Операция отменена');
      rl.close();
      return;
    }

    let result;
    
    switch (action) {
      case '1':
        // Мягкое удаление (деактивация)
        result = await convex.mutation("admin:deactivateSuperAdmin", {
          userId: targetAdmin._id
        });
        console.log('✅ Супер-админ деактивирован');
        break;
        
      case '2':
        // Физическое удаление
        const finalConfirm = await askQuestion('\n🚨 ПОСЛЕДНЕЕ ПРЕДУПРЕЖДЕНИЕ: Физическое удаление необратимо!\nВведите "УДАЛИТЬ" для подтверждения: ');
        
        if (finalConfirm !== 'УДАЛИТЬ') {
          console.log('❌ Операция отменена');
          rl.close();
          return;
        }
        
        result = await convex.mutation("admin:deleteSuperAdminByEmail", {
          email: targetAdmin.email,
          confirmationCode: "DELETE_SUPER_ADMIN_CONFIRMED"
        });
        console.log('✅ Супер-админ физически удален');
        break;
        
      case '3':
        // Понижение до обычного админа
        result = await convex.mutation("admin:demoteSuperAdmin", {
          userId: targetAdmin._id,
          confirmationCode: "DEMOTE_SUPER_ADMIN_CONFIRMED"
        });
        console.log('✅ Супер-админ понижен до обычного администратора');
        break;
        
      default:
        console.log('❌ Неверный выбор');
        rl.close();
        return;
    }

    console.log('🎉 Операция выполнена успешно!');
    
  } catch (error) {
    console.error('❌ Ошибка при удалении супер-админа:', error);
  } finally {
    rl.close();
  }
}

// Запуск скрипта
console.log('🔧 Скрипт удаления супер-администратора');
console.log('=====================================');
deleteSuperAdmin();