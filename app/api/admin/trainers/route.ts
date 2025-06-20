// app/api/admin/trainers/route.ts (обновленная версия)
import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from "convex/browser";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET(request: NextRequest) {
  try {
    console.log('🔄 Загрузка тренеров из Convex...');
    
    // Пытаемся получить данные из Convex
    const trainersFromConvex = await convex.query("trainers:getAll");
    
    if (trainersFromConvex && trainersFromConvex.length > 0) {
      console.log('✅ Тренеры загружены из Convex:', trainersFromConvex.length);
      
      // Преобразуем данные из Convex в формат для админ панели
      const formattedTrainers = trainersFromConvex.map((trainer: any) => ({
        id: trainer._id,
        name: trainer.name || 'Без имени',
        email: trainer.email || '',
        phone: trainer.phone || '',
        role: trainer.role || 'Тренер',
        avatar: trainer.avatar || '/avatars/default.jpg',
        joinDate: trainer.joinDate || trainer._creationTime || new Date().toISOString(),
        status: trainer.status || 'active',
        specializations: trainer.specializations || [],
        rating: trainer.rating || 4.5,
        totalClients: trainer.totalClients || 0,
        activeClients: trainer.activeClients || 0,
        totalWorkouts: trainer.totalWorkouts || 0,
        monthlyRevenue: trainer.monthlyRevenue || 0,
        workingHours: trainer.workingHours || {
          start: '09:00',
          end: '18:00',
          days: [1, 2, 3, 4, 5]
        },
        lastActivity: trainer.lastActivity || new Date().toISOString()
      }));

      return NextResponse.json(formattedTrainers);
    } else {
      console.log('⚠️ Нет данных в Convex, используем mock данные');
      return NextResponse.json(getMockTrainers());
    }

  } catch (error) {
    console.error('❌ Ошибка получения тренеров из Convex:', error);
    console.log('🔄 Переключаемся на mock данные...');
    
    // Fallback к mock данным при ошибке
    return NextResponse.json(getMockTrainers());
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    console.log('🔄 Создание нового тренера в Convex...');
    
    // Пытаемся создать тренера в Convex
    const newTrainer = await convex.mutation("trainers:create", {
      name: data.name,
      email: data.email,
      phone: data.phone,
      role: data.role || 'Тренер',
      specializations: data.specializations || [],
      workingHours: data.workingHours || {
        start: '09:00',
        end: '18:00',
        days: [1, 2, 3, 4, 5]
      },
      status: 'active'
    });

    console.log('✅ Тренер создан в Convex:', newTrainer);

    // Возвращаем созданного тренера в формате админ панели
    const formattedTrainer = {
      id: newTrainer,
      name: data.name,
      email: data.email,
      phone: data.phone,
      role: data.role || 'Тренер',
      avatar: '/avatars/default.jpg',
      joinDate: new Date().toISOString(),
      status: 'active',
      specializations: data.specializations || [],
      rating: 4.5,
      totalClients: 0,
      activeClients: 0,
      totalWorkouts: 0,
      monthlyRevenue: 0,
      workingHours: data.workingHours || {
        start: '09:00',
        end: '18:00',
        days: [1, 2, 3, 4, 5]
      },
      lastActivity: new Date().toISOString()
    };

    return NextResponse.json(formattedTrainer);

  } catch (error) {
    console.error('❌ Ошибка создания тренера в Convex:', error);
    return NextResponse.json(
      { error: 'Ошибка создания тренера' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    const { id, ...updateData } = data;
    
    console.log('🔄 Обновление тренера в Convex:', id);
    
    // Пытаемся обновить тренера в Convex
    await convex.mutation("trainers:update", {
      id,
      ...updateData
    });

    console.log('✅ Тренер обновлен в Convex');

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('❌ Ошибка обновления тренера в Convex:', error);
    return NextResponse.json(
      { error: 'Ошибка обновления тренера' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID тренера не указан' },
        { status: 400 }
      );
    }
    
    console.log('🔄 Удаление тренера из Convex:', id);
    
    // Пытаемся удалить тренера из Convex
    await convex.mutation("trainers:delete", { id });

    console.log('✅ Тренер удален из Convex');

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('❌ Ошибка удаления тренера из Convex:', error);
    return NextResponse.json(
      { error: 'Ошибка удаления тренера' },
      { status: 500 }
    );
  }
}

// Mock данные для fallback
function getMockTrainers() {
  return [
    {
      id: 'trainer1',
      name: 'Александр Петров',
      email: 'alex@fitaccess.ru',
      phone: '+7 (999) 123-45-67',
      role: 'Персональный тренер',
      avatar: '/avatars/alex.jpg',
      joinDate: '2024-01-15',
      status: 'active',
      specializations: ['Силовые тренировки', 'Функциональный тренинг', 'Реабилитация'],
      rating: 4.8,
      totalClients: 25,
      activeClients: 18,
      totalWorkouts: 342,
      monthlyRevenue: 180000,
      workingHours: {
        start: '09:00',
        end: '18:00',
        days: [1, 2, 3, 4, 5]
      },
      lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'trainer2',
      name: 'Мария Иванова',
      email: 'maria@fitaccess.ru',
      phone: '+7 (999) 234-56-78',
      role: 'Фитнес-инструктор',
      avatar: '/avatars/maria.jpg',
      joinDate: '2024-02-01',
      status: 'active',
      specializations: ['Йога', 'Пилатес', 'Стретчинг'],
      rating: 4.9,
      totalClients: 30,
      activeClients: 22,
      totalWorkouts: 298,
      monthlyRevenue: 165000,
      workingHours: {
        start: '08:00',
        end: '17:00',
        days: [1, 2, 3, 4, 5, 6]
      },
      lastActivity: new Date(Date.now() - 30 * 60 * 1000).toISOString()
    },
    {
      id: 'trainer3',
      name: 'Дмитрий Козлов',
      email: 'dmitry@fitaccess.ru',
      phone: '+7 (999) 345-67-89',
      role: 'Йога-инструктор',
      avatar: '/avatars/dmitry.jpg',
      joinDate: '2024-03-10',
      status: 'active',
      specializations: ['Хатха-йога', 'Виньяса', 'Медитация'],
      rating: 4.7,
      totalClients: 20,
      activeClients: 15,
      totalWorkouts: 156,
      monthlyRevenue: 120000,
      workingHours: {
        start: '10:00',
        end: '19:00',
        days: [1, 2, 3, 4, 5, 6, 0]
      },
      lastActivity: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'trainer4',
      name: 'Елена Сидорова',
      email: 'elena@fitaccess.ru',
      phone: '+7 (999) 456-78-90',
      role: 'Групповой инструктор',
      avatar: '/avatars/elena.jpg',
      joinDate: '2024-04-05',
      status: 'active',
      specializations: ['Аэробика', 'Зумба', 'Степ'],
      rating: 4.6,
      totalClients: 35,
      activeClients: 28,
      totalWorkouts: 220,
      monthlyRevenue: 140000,
      workingHours: {
        start: '07:00',
        end: '16:00',
        days: [1, 2, 3, 4, 5, 6]
      },
      lastActivity: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'trainer5',
      name: 'Игорь Волков',
      email: 'igor@fitaccess.ru',
      phone: '+7 (999) 567-89-01',
      role: 'Тренер по боксу',
      avatar: '/avatars/igor.jpg',
      joinDate: '2024-02-20',
      status: 'active',
      specializations: ['Бокс', 'Кикбоксинг', 'Самооборона'],
      rating: 4.9,
      totalClients: 18,
      activeClients: 15,
      totalWorkouts: 180,
      monthlyRevenue: 200000,
      workingHours: {
        start: '14:00',
        end: '22:00',
        days: [1, 2, 3, 4, 5, 6]
      },
      lastActivity: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
    }
  ];
}
