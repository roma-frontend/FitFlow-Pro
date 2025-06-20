import { NextRequest, NextResponse } from 'next/server';

// Типы для событий
interface ScheduleEvent {
  _id: string;
  title: string;
  description?: string;
  type: 'training' | 'consultation' | 'group' | 'maintenance';
  startTime: string;
  endTime: string;
  trainerId: string;
  trainerName: string;
  clientId?: string;
  clientName?: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  location?: string;
  notes?: string;
  recurring?: {
    type: 'daily' | 'weekly' | 'monthly';
    interval: number;
    endDate?: string;
  };
  createdAt: string;
  updatedAt?: string;
  createdBy: string;
}

// Mock данные для событий
const getMockEvents = (): ScheduleEvent[] => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  return [
    {
      _id: 'event_' + Date.now() + '_1',
      title: 'Персональная тренировка',
      description: 'Силовая тренировка на верх тела',
      type: 'training',
      startTime: new Date(today.getTime() + 10 * 60 * 60 * 1000).toISOString(),
      endTime: new Date(today.getTime() + 11 * 60 * 60 * 1000).toISOString(),
      trainerId: 'trainer1',
      trainerName: 'Александр Петров',
      clientId: 'client1',
      clientName: 'Анна Смирнова',
      status: 'confirmed',
      location: 'Зал №1',
      createdAt: new Date().toISOString(),
      createdBy: 'trainer1'
    },
    {
      _id: 'event_' + Date.now() + '_2',
      title: 'Групповая йога',
      description: 'Утренняя практика йоги',
      type: 'group',
      startTime: new Date(today.getTime() + 24 * 60 * 60 * 1000 + 9 * 60 * 60 * 1000).toISOString(),
      endTime: new Date(today.getTime() + 24 * 60 * 60 * 1000 + 10 * 60 * 60 * 1000).toISOString(),
      trainerId: 'trainer2',
      trainerName: 'Мария Иванова',
      status: 'scheduled',
      location: 'Йога-студия',
      createdAt: new Date().toISOString(),
      createdBy: 'trainer2'
    },
    {
      _id: 'event_' + Date.now() + '_3',
      title: 'Функциональная тренировка',
      description: 'Комплексная тренировка с собственным весом',
      type: 'training',
      startTime: new Date(today.getTime() + 14 * 60 * 60 * 1000).toISOString(),
      endTime: new Date(today.getTime() + 15 * 60 * 60 * 1000).toISOString(),
      trainerId: 'trainer1',
      trainerName: 'Александр Петров',
      clientId: 'client3',
      clientName: 'Елена Васильева',
      status: 'confirmed',
      location: 'Зал №2',
      createdAt: new Date().toISOString(),
      createdBy: 'trainer1'
    }
  ];
};

// Хранилище событий (в реальном приложении это будет база данных)
let eventsStore: ScheduleEvent[] = getMockEvents();

// GET - Получение событий
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const trainerId = searchParams.get('trainerId');
    const clientId = searchParams.get('clientId');
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = parseInt(searchParams.get('limit') || '100');
    
    console.log('📅 API: Запрос событий расписания', {
      trainerId,
      clientId,
      status,
      startDate,
      endDate,
      limit
    });
    
    let filteredEvents = [...eventsStore];
    
    // Фильтрация по тренеру
    if (trainerId) {
      filteredEvents = filteredEvents.filter(e => e.trainerId === trainerId);
    }
    
    // Фильтрация по клиенту
    if (clientId) {
      filteredEvents = filteredEvents.filter(e => e.clientId === clientId);
    }
    
    // Фильтрация по статусу
    if (status) {
      filteredEvents = filteredEvents.filter(e => e.status === status);
    }
    
    // Фильтрация по дате
    if (startDate) {
      const start = new Date(startDate);
      filteredEvents = filteredEvents.filter(e => new Date(e.startTime) >= start);
    }
    
    if (endDate) {
      const end = new Date(endDate);
      filteredEvents = filteredEvents.filter(e => new Date(e.startTime) <= end);
    }
    
    // Сортировка по времени начала
    filteredEvents.sort((a, b) => 
      new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );
    
    // Ограничение количества
    const limitedEvents = filteredEvents.slice(0, limit);
    
    console.log('✅ API: События получены:', {
      total: eventsStore.length,
      filtered: filteredEvents.length,
      returned: limitedEvents.length
    });
    
    return NextResponse.json({
      success: true,
      data: limitedEvents,
      meta: {
        total: eventsStore.length,
        filtered: filteredEvents.length,
        statusCounts: {
          scheduled: eventsStore.filter(e => e.status === 'scheduled').length,
          confirmed: eventsStore.filter(e => e.status === 'confirmed').length,
          completed: eventsStore.filter(e => e.status === 'completed').length,
          cancelled: eventsStore.filter(e => e.status === 'cancelled').length
        }
      },
      message: 'События получены успешно'
    });
    
  } catch (error) {
    console.error('❌ API: Ошибка получения событий:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Ошибка получения событий',
      message: error instanceof Error ? error.message : 'Неизвестная ошибка'
    }, { status: 500 });
  }
}

// POST - Создание нового события
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('➕ API: Создание события:', body.title);
    
    // Валидация обязательных полей
    if (!body.title || !body.startTime || !body.endTime || !body.trainerId) {
      return NextResponse.json({
        success: false,
        error: 'Отсутствуют обязательные поля',
        required: ['title', 'startTime', 'endTime', 'trainerId']
      }, { status: 400 });
    }
    
    // Проверка конфликтов времени
    const startTime = new Date(body.startTime);
    const endTime = new Date(body.endTime);
    
    const conflicts = eventsStore.filter(event => {
      if (event.trainerId !== body.trainerId || event.status === 'cancelled') {
        return false;
      }
      
      const eventStart = new Date(event.startTime);
      const eventEnd = new Date(event.endTime);
      
      return (startTime < eventEnd && endTime > eventStart);
    });
    
    if (conflicts.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'Конфликт времени',
        message: 'У тренера уже есть событие в это время',
        conflicts: conflicts.map(c => ({
          id: c._id,
          title: c.title,
          startTime: c.startTime,
          endTime: c.endTime
        }))
      }, { status: 409 });
    }
    
    // Создание нового события
    const newEvent: ScheduleEvent = {
      _id: 'event_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      title: body.title,
      description: body.description,
      type: body.type || 'training',
      startTime: body.startTime,
      endTime: body.endTime,
      trainerId: body.trainerId,
      trainerName: body.trainerName || 'Неизвестный тренер',
      clientId: body.clientId,
      clientName: body.clientName,
      status: body.status || 'scheduled',
      location: body.location,
      notes: body.notes,
      recurring: body.recurring,
      createdAt: new Date().toISOString(),
      createdBy: body.createdBy || 'api'
    };
    
    eventsStore.push(newEvent);
    
    console.log('✅ API: Событие создано:', newEvent._id);
    
    return NextResponse.json({
      success: true,
      data: newEvent,
      message: 'Событие создано успешно'
    }, { status: 201 });
    
  } catch (error) {
    console.error('❌ API: Ошибка создания события:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Ошибка создания события',
      message: error instanceof Error ? error.message : 'Неизвестная ошибка'
    }, { status: 500 });
  }
}
