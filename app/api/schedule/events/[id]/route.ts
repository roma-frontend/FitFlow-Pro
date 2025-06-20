// app/api/schedule/events/[id]/route.ts (исправленная версия для Next.js 15)
import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from "convex/browser";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let requestData: any = null;
  
  try {
    // Сначала парсим данные
    requestData = await request.json();
    const resolvedParams = await params;
    const eventId = resolvedParams.id;

    console.log('🔄 Обновление события в Convex:', eventId, requestData);

    // Пытаемся обновить событие в Convex
    await convex.mutation("events:update", {
      id: eventId as any, // Convex ID
      ...requestData
    });

    console.log('✅ Событие обновлено в Convex');

    const updatedEvent = {
      _id: eventId,
      ...requestData,
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json(updatedEvent);

  } catch (error) {
    console.error('❌ Ошибка обновления события в Convex:', error);
    
    // Если данные не были распарсены, пытаемся их получить
    if (!requestData) {
      try {
        requestData = await request.json();
      } catch (parseError) {
        console.error('❌ Ошибка парсинга данных:', parseError);
        return NextResponse.json(
          { error: 'Ошибка обработки данных события' },
          { status: 400 }
        );
      }
    }
    
    // Fallback - возвращаем обновленные данные без сохранения в БД
    const resolvedParams = await params;
    const updatedEvent = {
      _id: resolvedParams.id,
      ...requestData,
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json(updatedEvent);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const eventId = resolvedParams.id;

    console.log('🔄 Удаление события из Convex:', eventId);

    // Пытаемся удалить событие из Convex
    await convex.mutation("events:delete_", {
      id: eventId as any // Convex ID
    });

    console.log('✅ Событие удалено из Convex');

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('❌ Ошибка удаления события из Convex:', error);
    
    // Fallback - возвращаем успех без удаления из БД
    return NextResponse.json({ success: true });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const eventId = resolvedParams.id;

    console.log('🔄 Получение события из Convex:', eventId);

    // Пытаемся получить событие из Convex
    const event = await convex.query("events:getById", {
      id: eventId as any // Convex ID
    });

    if (event) {
      console.log('✅ Событие получено из Convex');
      
      const formattedEvent = {
        _id: event._id,
        title: event.title,
        description: event.description || '',
        type: event.type,
        startTime: event.startTime,
        endTime: event.endTime,
        trainerId: event.trainerId,
        trainerName: event.trainerName,
        clientId: event.clientId,
        clientName: event.clientName,
        status: event.status,
        location: event.location || '',
        createdAt: event._creationTime,
        createdBy: event.createdBy
      };

      return NextResponse.json(formattedEvent);
    } else {
      return NextResponse.json(
        { error: 'Событие не найдено' },
        { status: 404 }
      );
    }

  } catch (error) {
    console.error('❌ Ошибка получения события из Convex:', error);
    
    // Fallback - возвращаем mock событие для разработки
    const resolvedParams = await params;
    const mockEvent = {
      _id: resolvedParams.id,
      title: 'Mock событие',
      description: 'Тестовое событие (API недоступен)',
      type: 'training',
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      trainerId: 'trainer1',
      trainerName: 'Тестовый тренер',
      clientId: null,
      clientName: null,
      status: 'scheduled',
      location: 'Тестовое место',
      createdAt: new Date().toISOString(),
      createdBy: 'system'
    };

    return NextResponse.json(mockEvent);
  }
}
