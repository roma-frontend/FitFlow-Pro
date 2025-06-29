// app/api/schedule/trainers/route.ts (обновленная версия)
import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from "convex/browser";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET(request: NextRequest) {
  try {
    console.log('🔄 Загрузка тренеров для расписания из Convex...');
    console.log('🔗 Convex URL:', process.env.NEXT_PUBLIC_CONVEX_URL);
    
    // ✅ ПРОВЕРЯЕМ ДОСТУПНОСТЬ CONVEX
    if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
      console.warn('⚠️ NEXT_PUBLIC_CONVEX_URL не настроен, используем mock данные');
      return NextResponse.json(getMockScheduleTrainers());
    }

    // ✅ ПЫТАЕМСЯ ПОЛУЧИТЬ ТРЕНЕРОВ ИЗ CONVEX
    const trainersFromConvex = await convex.query("trainers:getActiveTrainers");
    
    if (trainersFromConvex && trainersFromConvex.length > 0) {
      console.log('✅ Тренеры для расписания загружены из Convex:', trainersFromConvex.length);
      
      // Преобразуем данные из Convex в формат для расписания
      const scheduleTrainers = trainersFromConvex.map((trainer: any) => ({
        trainerId: trainer._id,
        trainerName: trainer.name,
        trainerRole: trainer.role,
        events: [], // События будут загружены отдельно
        workingHours: trainer.workingHours || {
          start: '09:00',
          end: '18:00',
          days: [1, 2, 3, 4, 5]
        }
      }));

      return NextResponse.json(scheduleTrainers);
    } else {
      console.log('⚠️ Нет активных тренеров в Convex, используем mock данные');
      return NextResponse.json(getMockScheduleTrainers());
    }

  } catch (error: any) {
    console.error('❌ Ошибка получения тренеров для расписания из Convex:', error);
    
    // ✅ ДЕТАЛЬНАЯ ОБРАБОТКА ОШИБОК
    if (error.message?.includes('Could not find public function')) {
      console.error('💡 Функция trainers:getActiveTrainers не найдена в Convex');
      console.error('💡 Убедитесь что:');
      console.error('   1. Файл convex/trainers.ts существует');
      console.error('   2. Функция getActiveTrainers экспортирована');
      console.error('   3. Convex dev сервер запущен: npx convex dev');
    } else if (error.message?.includes('fetch')) {
      console.error('💡 Проблема с подключением к Convex');
      console.error('💡 Проверьте NEXT_PUBLIC_CONVEX_URL в .env.local');
    }
    
    console.log('🔄 Переключаемся на mock данные...');
    return NextResponse.json(getMockScheduleTrainers());
  }
}

// ✅ РАСШИРЕННЫЕ MOCK ДАННЫЕ
function getMockScheduleTrainers() {
  console.log('📋 Используем mock данные для тренеров расписания');
  
  return [
    {
      trainerId: 'trainer1',
      trainerName: 'Александр Петров',
      trainerRole: 'Персональный тренер',
      events: [],
      workingHours: {
        start: '09:00',
        end: '18:00',
        days: [1, 2, 3, 4, 5] // пн-пт
      }
    },
    {
      trainerId: 'trainer2',
      trainerName: 'Мария Иванова',
      trainerRole: 'Фитнес-инструктор',
      events: [],
      workingHours: {
        start: '08:00',
        end: '17:00',
        days: [1, 2, 3, 4, 5, 6] // пн-сб
      }
    },
    {
      trainerId: 'trainer3',
      trainerName: 'Дмитрий Козлов',
      trainerRole: 'Йога-инструктор',
      events: [],
      workingHours: {
        start: '10:00',
        end: '19:00',
        days: [1, 2, 3, 4, 5, 6, 0] // каждый день
      }
    },
    {
      trainerId: 'trainer4',
      trainerName: 'Елена Сидорова',
      trainerRole: 'Групповой инструктор',
      events: [],
      workingHours: {
        start: '07:00',
        end: '16:00',
        days: [1, 2, 3, 4, 5, 6] // пн-сб
      }
    },
    {
      trainerId: 'trainer5',
      trainerName: 'Игорь Волков',
      trainerRole: 'Тренер по боксу',
      events: [],
      workingHours: {
        start: '14:00',
        end: '22:00',
        days: [1, 2, 3, 4, 5, 6] // пн-сб
      }
    }
  ];
}
