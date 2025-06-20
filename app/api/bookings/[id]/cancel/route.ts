// app/api/bookings/[id]/cancel/route.ts (исправленная версия для Next.js 15)
import { getSession } from '@/lib/simple-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionId = request.cookies.get('session_id')?.value;

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'Не авторизован' },
        { status: 401 }
      );
    }

    const session = getSession(sessionId);

    if (!session || session.user.role !== 'member') {
      return NextResponse.json(
        { success: false, error: 'Доступ запрещен' },
        { status: 403 }
      );
    }

    // Теперь params нужно await
    const resolvedParams = await params;
    const bookingId = resolvedParams.id;

    console.log(`Отменяем бронирование ${bookingId} для пользователя ${session.user.id}`);

    return NextResponse.json({
      success: true,
      message: 'Бронирование успешно отменено'
    });

  } catch (error) {
    console.error('Ошибка при отмене бронирования:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Ошибка при отмене бронирования' 
      },
      { status: 500 }
    );
  }
}
