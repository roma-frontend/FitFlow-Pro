// app/api/bookings/my-bookings/route.ts (универсальная версия)
import { NextRequest, NextResponse } from 'next/server';
import { getAuthFromRequest, createAuthErrorResponse } from '@/lib/universal-auth';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 my-bookings: начинаем обработку запроса');
    
    // Универсальная проверка авторизации
    const auth = getAuthFromRequest(request);
    console.log('🔐 my-bookings: результат авторизации:', {
      authenticated: auth.authenticated,
      system: auth.system,
      userRole: auth.user?.role
    });

    // Проверяем авторизацию и роль
    const authError = createAuthErrorResponse(auth, ['member']);
    if (authError) {
      console.log('❌ my-bookings: ошибка авторизации');
      return NextResponse.json(authError, { status: 401 });
    }

    const user = auth.user!;
    console.log('✅ my-bookings: авторизация успешна для:', user.email);

    // Пока возвращаем демо-данные, но с реальной авторизацией
    const bookings = [
      {
        id: '1',
        type: 'trainer',
        title: 'Персональная тренировка с Анной Петровой',
        instructor: 'Анна Петрова',
        date: '2024-01-20',
        time: '10:00-11:00',
        status: 'confirmed',
        price: '2000₽'
      },
      {
        id: '2',
        type: 'program',
        title: 'Йога и релакс',
        instructor: 'Анна Петрова',
        date: '2024-01-22',
        time: '18:00-19:30',
        status: 'confirmed',
        price: '800₽'
      },
      {
        id: '3',
        type: 'trainer',
        title: 'Силовая тренировка с Михаилом Волковым',
        instructor: 'Михаил Волков',
        date: '2024-01-15',
        time: '19:00-20:00',
        status: 'completed',
        price: '2500₽'
      }
    ];

    console.log('📋 my-bookings: возвращаем бронирования:', bookings.length);

    return NextResponse.json({
      success: true,
      bookings: bookings,
      debug: {
        authSystem: auth.system,
        userEmail: user.email,
        bookingsCount: bookings.length
      }
    });

  } catch (error) {
    console.error('❌ my-bookings: критическая ошибка:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Ошибка при получении бронирований' 
      },
      { status: 500 }
    );
  }
}
