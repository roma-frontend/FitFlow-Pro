// app/api/bookings/program/route.ts (универсальная версия)
import { NextRequest, NextResponse } from 'next/server';
import { getAuthFromRequest, createAuthErrorResponse } from '@/lib/universal-auth';

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 program-booking: начинаем обработку запроса');

    // Универсальная проверка авторизации
    const auth = getAuthFromRequest(request);
    console.log('🔐 program-booking: результат авторизации:', {
      authenticated: auth.authenticated,
      system: auth.system,
      userRole: auth.user?.role
    });

    // Проверяем авторизацию и роль
    const authError = createAuthErrorResponse(auth, ['member']);
    if (authError) {
      console.log('❌ program-booking: ошибка авторизации');
      return NextResponse.json(authError, { status: 401 });
    }

    const user = auth.user!;
    console.log('✅ program-booking: авторизация успешна для:', user.email);

    const body = await request.json();
    console.log('📋 program-booking: получен запрос:', body);

    if (!body.programId || body.sessionIndex === undefined) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Отсутствуют обязательные поля: programId, sessionIndex' 
        },
        { status: 400 }
      );
    }

    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!convexUrl) {
      throw new Error('NEXT_PUBLIC_CONVEX_URL не установлен');
    }

    // Находим участника в базе данных
    const memberResponse = await fetch(`${convexUrl}/api/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path: 'members:getByEmail',
        args: { email: user.email }
      })
    });

    if (!memberResponse.ok) {
      console.error('❌ program-booking: ошибка поиска участника:', memberResponse.status);
      throw new Error('Ошибка при поиске участника');
    }

    const memberData = await memberResponse.json();
    const member = memberData.value;

    if (!member) {
      console.log('❌ program-booking: участник не найден');
      return NextResponse.json(
        { success: false, error: 'Участник не найден в базе данных' },
        { status: 404 }
      );
    }

    console.log('👤 program-booking: участник найден:', member._id);

    // Создаем временные метки
    const startDateTime = new Date(`${body.date}T${body.time}:00`);
    const endDateTime = new Date(startDateTime);
    endDateTime.setHours(endDateTime.getHours() + 1);

    console.log('📅 program-booking: создаем бронирование программы:', {
      memberId: member._id,
      programId: body.programId,
      programTitle: body.programTitle,
      startTime: startDateTime.getTime()
    });

    // Сохраняем бронирование программы в отдельную таблицу
    const bookingResponse = await fetch(`${convexUrl}/api/mutation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path: 'programBookings:create',
        args: {
          memberId: member._id,
          programId: body.programId,
          programTitle: body.programTitle,
          sessionIndex: body.sessionIndex,
          sessionType: body.type,
          instructor: body.instructor,
          startTime: startDateTime.getTime(),
          endTime: endDateTime.getTime(),
          duration: 60,
          price: 0,
          notes: `Программа: ${body.programTitle}, Инструктор: ${body.instructor}`,
        }
      })
    });

    if (!bookingResponse.ok) {
      const errorText = await bookingResponse.text();
      console.error('❌ program-booking: ошибка создания бронирования:', bookingResponse.status, errorText);
      throw new Error('Ошибка при создании бронирования программы');
    }

    const bookingData = await bookingResponse.json();
    const bookingId = bookingData.value;

    console.log('✅ program-booking: бронирование программы создано с ID:', bookingId);

    return NextResponse.json({
      success: true,
      booking: {
        id: bookingId,
        userId: user.id,
        programId: body.programId,
        programTitle: body.programTitle,
        sessionIndex: body.sessionIndex,
        date: body.date,
        time: body.time,
        instructor: body.instructor,
        type: body.type,
        status: 'confirmed',
        createdAt: new Date().toISOString()
      },
      message: 'Запись на программу успешно создана',
      debug: {
        authSystem: auth.system,
        memberId: member._id
      }
    });

  } catch (error) {
    console.error('❌ program-booking: критическая ошибка:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Ошибка при записи на программу',
        details: error instanceof Error ? error.message : 'Неизвестная ошибка'
      },
      { status: 500 }
    );
  }
}
