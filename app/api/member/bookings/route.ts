// app/api/member/bookings/route.ts (новый файл)
import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from "convex/browser";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get('memberId');

    if (!memberId) {
      return NextResponse.json(
        { error: 'memberId обязателен' },
        { status: 400 }
      );
    }

    // Получаем бронирования участника
    const bookings = await convex.query("bookings:getByMember", { memberId });
    
    // Получаем информацию о тренерах
    const trainers = await convex.query("trainers:getAll");
    
    // Обогащаем данные о бронированиях
    const enrichedBookings = bookings.map((booking: any) => {
      const trainer = trainers.find((t: any) => t._id === booking.trainerId);
      return {
        ...booking,
        trainerName: trainer?.name || 'Неизвестный тренер',
        trainerPhoto: trainer?.photoUrl
      };
    });

    return NextResponse.json({
      success: true,
      bookings: enrichedBookings
    });

  } catch (error) {
    console.error('Ошибка получения бронирований:', error);
    return NextResponse.json(
      { error: 'Ошибка получения бронирований' },
      { status: 500 }
    );
  }
}
