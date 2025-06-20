// app/api/bookings/create/route.ts (новый файл)
import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from "convex/browser";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: NextRequest) {
  try {
    console.log('📅 Создание нового бронирования');

    const body = await request.json();
    const {
      trainerId,
      trainerName,
      service,
      date,
      time,
      client,
      totalPrice
    } = body;

    // Валидация данных
    if (!trainerId || !service || !date || !time || !client.name || !client.phone) {
      return NextResponse.json(
        { error: 'Недостаточно данных для бронирования' },
        { status: 400 }
      );
    }

    // Проверяем доступность слота
    const existingBookings = await convex.query("bookings:getByDateAndTime", {
      trainerId,
      date,
      time
    });

    if (existingBookings && existingBookings.length > 0) {
      return NextResponse.json(
        { error: 'Этот временной слот уже занят' },
        { status: 409 }
      );
    }

    // Создаем бронирование
    const bookingId = await convex.mutation("bookings:create", {
      trainerId,
      trainerName,
      serviceName: service.name,
      servicePrice: service.price,
      serviceDuration: service.duration,
      date,
      time,
      clientName: client.name,
      clientPhone: client.phone,
      clientEmail: client.email || '',
      clientNotes: client.notes || '',
      status: 'confirmed',
      createdAt: Date.now()
    });

    console.log('✅ Бронирование создано:', bookingId);

    // Отправляем уведомления (в реальной системе)
    // await sendBookingConfirmation(client.email, bookingData);
    // await notifyTrainer(trainerId, bookingData);

    return NextResponse.json({
      success: true,
      bookingId,
      message: 'Бронирование успешно создано'
    });

  } catch (error) {
    console.error('💥 Ошибка создания бронирования:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
