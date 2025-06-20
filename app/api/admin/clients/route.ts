// app/api/admin/clients/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Mock данные клиентов
    const clients = [
      {
        id: 'client1',
        name: 'Анна Смирнова',
        email: 'anna@example.com',
        phone: '+7 (999) 345-67-89',
        trainerId: 'trainer1',
        trainerName: 'Александр Петров',
        status: 'active',
        joinDate: '2024-03-01',
        currentProgram: 'Силовая подготовка',
        totalWorkouts: 24,
        progress: 75,
        lastWorkout: '2024-05-23',
        goals: ['Похудение', 'Увеличение силы', 'Улучшение выносливости'],
        notes: 'Отличная мотивация, быстро прогрессирует'
      },
      {
        id: 'client2',
        name: 'Дмитрий Козлов',
        email: 'dmitry@example.com',
        phone: '+7 (999) 456-78-90',
        trainerId: 'trainer2',
        trainerName: 'Мария Иванова',
        status: 'active',
        joinDate: '2024-04-15',
        currentProgram: 'Йога и растяжка',
        totalWorkouts: 16,
        progress: 60,
        lastWorkout: '2024-05-24',
        goals: ['Гибкость', 'Снятие стресса', 'Улучшение осанки']
      },
      {
        id: 'client3',
        name: 'Елена Васильева',
        email: 'elena@example.com',
        phone: '+7 (999) 567-89-01',
        trainerId: 'trainer1',
        trainerName: 'Александр Петров',
        status: 'trial',
        joinDate: '2024-05-20',
        currentProgram: 'Пробная программа',
        totalWorkouts: 3,
        progress: 30,
        lastWorkout: '2024-05-25',
        goals: ['Общая физическая подготовка', 'Снижение веса']
      },
      {
        id: 'client4',
        name: 'Михаил Петров',
        email: 'mikhail@example.com',
        phone: '+7 (999) 678-90-12',
        trainerId: 'trainer3',
        trainerName: 'Дмитрий Козлов',
        status: 'active',
        joinDate: '2024-04-01',
        currentProgram: 'Йога для начинающих',
        totalWorkouts: 20,
        progress: 80,
        lastWorkout: '2024-05-24',
        goals: ['Гибкость', 'Расслабление', 'Улучшение сна']
      }
    ];

    return NextResponse.json(clients);
  } catch (error) {
    console.error('Ошибка получения клиентов:', error);
    return NextResponse.json(
      { error: 'Ошибка получения клиентов' },
      { status: 500 }
    );
  }
}
