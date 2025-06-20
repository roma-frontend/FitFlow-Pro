// app/api/admin/schedule/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // В реальном приложении здесь будут запросы к базе данных
    const mockData = {
      events: [
        // ... события
      ],
      stats: {
        // ... статистика
      },
      trainers: [
        // ... тренеры
      ],
      clients: [
        // ... клиенты
      ]
    };

    return NextResponse.json({
      success: true,
      data: mockData
    });
  } catch (error) {
    console.error('Ошибка получения расписания:', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка загрузки расписания' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const eventData = await request.json();
    
    // Создание нового события
    const newEvent = {
      _id: Date.now().toString(),
      ...eventData,
      createdAt: new Date().toISOString(),
      createdBy: 'current-user'
    };

    return NextResponse.json({
      success: true,
      event: newEvent
    });
  } catch (error) {
    console.error('Ошибка создания события:', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка создания события' },
      { status: 500 }
    );
    return NextResponse.json(
      { success: false, error: 'Ошибка создания события' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { eventId, ...updateData } = await request.json();
    
    // Обновление события
    const updatedEvent = {
      _id: eventId,
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      event: updatedEvent
    });
  } catch (error) {
    console.error('Ошибка обновления события:', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка обновления события' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { eventId } = await request.json();
    
    // Удаление события
    return NextResponse.json({
      success: true,
      message: 'Событие удалено успешно'
    });
  } catch (error) {
    console.error('Ошибка удаления события:', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка удаления события' },
      { status: 500 }
    );
  }
}
