// app/api/my-workouts/route.ts (универсальная версия)
import { NextRequest, NextResponse } from 'next/server';
import { getAuthFromRequest, createAuthErrorResponse } from '@/lib/universal-auth';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 my-workouts: начинаем обработку запроса');
    
    // Универсальная проверка авторизации
    const auth = getAuthFromRequest(request);
    console.log('🔐 my-workouts: результат авторизации:', {
      authenticated: auth.authenticated,
      system: auth.system,
      userRole: auth.user?.role
    });

    // Проверяем авторизацию и роль
    const authError = createAuthErrorResponse(auth, ['member']);
    if (authError) {
      console.log('❌ my-workouts: ошибка авторизации');
      return NextResponse.json(authError, { status: 401 });
    }

    const user = auth.user!; // Теперь мы знаем, что пользователь есть
    console.log('✅ my-workouts: авторизация успешна для:', user.email);

    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!convexUrl) {
      throw new Error('NEXT_PUBLIC_CONVEX_URL не установлен');
    }

    console.log('🔍 my-workouts: ищем участника по email:', user.email);

    // Находим участника в базе данных
    const memberResponse = await fetch(`${convexUrl}/api/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path: 'members:getByEmail',
        args: { email: user.email }
      })
    });

    console.log('📡 my-workouts: ответ поиска участника:', memberResponse.status);

    if (!memberResponse.ok) {
      const errorText = await memberResponse.text();
      console.error('❌ my-workouts: ошибка поиска участника:', memberResponse.status, errorText);
      
      // Возвращаем пустой массив вместо ошибки
      return NextResponse.json({
        success: true,
        workouts: [],
        debug: {
          memberSearchError: `HTTP ${memberResponse.status}`,
          errorText: errorText,
          searchEmail: user.email,
          authSystem: auth.system
        }
      });
    }

    const memberData = await memberResponse.json();
    const member = memberData.value;
    console.log('👤 my-workouts: участник найден:', member ? 'да' : 'нет');

    if (!member) {
      console.log('❌ my-workouts: участник не найден в базе данных');
      
      // Временно возвращаем пустой массив вместо ошибки
      return NextResponse.json({
        success: true,
        workouts: [],
        debug: {
          memberFound: false,
          searchEmail: user.email,
          message: 'Участник не найден в базе данных, но это не критично',
          authSystem: auth.system
        }
      });
    }

    console.log('🔍 my-workouts: получаем бронирования для участника:', member._id);

    // Получаем бронирования пользователя из Convex
    const bookingsResponse = await fetch(`${convexUrl}/api/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path: 'bookings:getByMember',
        args: { memberId: member._id }
      })
    });

    console.log('📡 my-workouts: ответ получения бронирований:', bookingsResponse.status);

    if (!bookingsResponse.ok) {
      const errorText = await bookingsResponse.text();
      console.error('❌ my-workouts: ошибка получения бронирований:', bookingsResponse.status, errorText);
      
      // Возвращаем пустой массив вместо ошибки
      return NextResponse.json({
        success: true,
        workouts: [],
        debug: {
          bookingsError: `HTTP ${bookingsResponse.status}`,
          errorText: errorText,
          memberId: member._id,
          authSystem: auth.system
        }
      });
    }

    const bookingsData = await bookingsResponse.json();
    const bookings = bookingsData.value || [];
    console.log('📋 my-workouts: получено бронирований:', bookings.length);

    // Если нет бронирований, возвращаем пустой массив
    if (bookings.length === 0) {
      console.log('ℹ️ my-workouts: у пользователя нет бронирований');
      return NextResponse.json({
        success: true,
        workouts: [],
        debug: {
          memberFound: true,
          bookingsCount: 0,
          authSystem: auth.system
        }
      });
    }

    // Простая обработка без получения данных тренеров (пока)
    const workouts = bookings.map((booking: any) => ({
      id: booking._id,
      type: booking.workoutType || 'Тренировка',
      date: new Date(booking.startTime).toISOString().split('T')[0],
      time: new Date(booking.startTime).toLocaleTimeString('ru-RU', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      duration: booking.duration || 60,
      status: booking.status || 'confirmed',
      price: booking.price || 0,
      notes: booking.notes || '',
      category: 'trainer',
      trainerId: booking.trainerId,
      trainerName: 'Тренер', // Временно
      trainerSpecializations: [],
      createdAt: new Date(booking.createdAt || Date.now()).toISOString(),
    }));

    console.log('✅ my-workouts: успешно обработано тренировок:', workouts.length);

    return NextResponse.json({
      success: true,
      workouts: workouts,
      debug: {
        memberFound: true,
        bookingsCount: bookings.length,
        processedWorkouts: workouts.length,
        authSystem: auth.system
      }
    });

  } catch (error) {
    console.error('❌ my-workouts: критическая ошибка:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Ошибка при получении тренировок',
        details: error instanceof Error ? error.message : 'Неизвестная ошибка'
      },
      { status: 500 }
    );
  }
}
