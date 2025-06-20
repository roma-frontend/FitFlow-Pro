// scripts/seedTrainers.ts (создайте папку scripts в корне проекта)
import { ConvexHttpClient } from "convex/browser";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

async function seedTrainers() {
  console.log('🌱 Инициализация тестовых тренеров в Convex...');
  
  const testTrainers = [
    {
      name: 'Александр Петров',
      email: 'alexander.petrov@fitaccess.com',
      role: 'Персональный тренер',
      status: 'active',
      workingHours: {
        start: '09:00',
        end: '18:00',
        days: [1, 2, 3, 4, 5]
      }
    },
    {
      name: 'Мария Иванова',
      email: 'maria.ivanova@fitaccess.com',
      role: 'Фитнес-инструктор',
      status: 'active',
      workingHours: {
        start: '08:00',
        end: '17:00',
                days: [1, 2, 3, 4, 5, 6]
      }
    },
    {
      name: 'Дмитрий Козлов',
      email: 'dmitry.kozlov@fitaccess.com',
      role: 'Йога-инструктор',
      status: 'active',
      workingHours: {
        start: '10:00',
        end: '19:00',
        days: [1, 2, 3, 4, 5, 6, 0]
      }
    },
    {
      name: 'Елена Сидорова',
      email: 'elena.sidorova@fitaccess.com',
      role: 'Групповой инструктор',
      status: 'active',
      workingHours: {
        start: '07:00',
        end: '16:00',
        days: [1, 2, 3, 4, 5, 6]
      }
    },
    {
      name: 'Игорь Волков',
      email: 'igor.volkov@fitaccess.com',
      role: 'Тренер по боксу',
      status: 'active',
      workingHours: {
        start: '14:00',
        end: '22:00',
        days: [1, 2, 3, 4, 5, 6]
      }
    }
  ];

  try {
    for (const trainer of testTrainers) {
      console.log(`➕ Создание тренера: ${trainer.name}`);
      
      const trainerId = await convex.mutation("trainers:createTrainer", trainer);
      console.log(`✅ Тренер создан с ID: ${trainerId}`);
    }
    
    console.log('🎉 Все тестовые тренеры созданы успешно!');
  } catch (error) {
    console.error('❌ Ошибка создания тестовых тренеров:', error);
  }
}

// Запускаем только если файл выполняется напрямую
if (require.main === module) {
  seedTrainers();
}

export default seedTrainers;

