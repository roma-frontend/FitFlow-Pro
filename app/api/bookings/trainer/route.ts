// app/api/bookings/trainer/route.ts (исправленная версия с улучшенным поиском тренера)
import { NextRequest, NextResponse } from 'next/server';
import { getAuthFromRequest, createAuthErrorResponse } from '@/lib/universal-auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('🔍 trainer-booking: получен запрос на бронирование:', body);

    // Проверяем обязательные поля
    if (!body.trainerId || !body.date || !body.time) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Отсутствуют обязательные поля: trainerId, date, time' 
        },
        { status: 400 }
      );
    }

    // Универсальная проверка авторизации
    const auth = getAuthFromRequest(request);
    const authError = createAuthErrorResponse(auth, ['member']);
    if (authError) {
      return NextResponse.json(authError, { status: 401 });
    }

    const user = auth.user!;
    console.log('✅ trainer-booking: авторизация успешна для:', user.email);

    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!convexUrl) {
      throw new Error('NEXT_PUBLIC_CONVEX_URL не установлен');
    }

    // ИСПРАВЛЕНИЕ: Ищем в таблице users вместо members
    console.log('🔍 trainer-booking: ищем пользователя в таблице users по email:', user.email);
    
    const userResponse = await fetch(`${convexUrl}/api/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path: 'users:getByEmail', // Используем users вместо members
        args: { email: user.email }
      })
    });

    if (!userResponse.ok) {
      const errorText = await userResponse.text();
      console.error('❌ trainer-booking: ошибка поиска пользователя:', userResponse.status, errorText);
      throw new Error('Ошибка при поиске пользователя');
    }

    const userData = await userResponse.json();
    const foundUser = userData.value;

    if (!foundUser) {
      console.log('❌ trainer-booking: пользователь не найден');
      return NextResponse.json(
        { success: false, error: 'Пользователь не найден в базе данных' },
        { status: 404 }
      );
    }

    console.log('👤 trainer-booking: пользователь найден:', foundUser._id);

    // УЛУЧШЕННЫЙ ПОИСК ТРЕНЕРА
    console.log('👨‍💼 trainer-booking: ищем тренера по ID:', body.trainerId);

    // Сначала попробуем getById
    let trainerResponse = await fetch(`${convexUrl}/api/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path: 'trainers:getById',
        args: { id: body.trainerId }
      })
    });

    let trainer = null;
    if (trainerResponse.ok) {
      const trainerData = await trainerResponse.json();
      trainer = trainerData.value;
      console.log('👨‍💼 trainer-booking: поиск по ID результат:', !!trainer);
    } else {
      console.log('❌ trainer-booking: ошибка поиска по ID:', trainerResponse.status);
    }

    // Если не найден по ID, попробуем по slug
    if (!trainer) {
      console.log('👨‍💼 trainer-booking: не найден по ID, пробуем по slug');
      trainerResponse = await fetch(`${convexUrl}/api/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path: 'trainers:getBySlug',
          args: { slug: body.trainerId }
        })
      });

      if (trainerResponse.ok) {
        const trainerData = await trainerResponse.json();
        trainer = trainerData.value;
        console.log('👨‍💼 trainer-booking: поиск по slug результат:', !!trainer);
      } else {
        console.log('❌ trainer-booking: ошибка поиска по slug:', trainerResponse.status);
      }
    }

    // Если все еще не найден, попробуем получить всех тренеров и найти подходящего
    if (!trainer) {
      console.log('👨‍💼 trainer-booking: не найден по slug, получаем всех тренеров');
      const allTrainersResponse = await fetch(`${convexUrl}/api/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path: 'trainers:getAll',
          args: {}
        })
      });

      if (allTrainersResponse.ok) {
        const allTrainersData = await allTrainersResponse.json();
        const allTrainers = allTrainersData.value || [];
        console.log('👨‍💼 trainer-booking: всего тренеров:', allTrainers.length);
        
        // Ищем по различным критериям
        trainer = allTrainers.find((t: any) => 
          t._id === body.trainerId ||
          t.name?.toLowerCase().replace(/\s+/g, '-') === body.trainerId ||
          t.email === body.trainerId ||
          t.name === body.trainerId
        );
        
        if (trainer) {
          console.log('👨‍💼 trainer-booking: найден в списке всех тренеров:', trainer.name);
        } else {
          console.log('👨‍💼 trainer-booking: доступные тренеры:', allTrainers.map((t: any) => ({
            id: t._id,
            name: t.name,
            slug: t.name?.toLowerCase().replace(/\s+/g, '-')
          })));
        }
      }
    }

    if (!trainer) {
      console.log('❌ trainer-booking: тренер не найден ни одним способом');
      return NextResponse.json(
        { 
          success: false, 
          error: 'Тренер не найден',
          debug: {
            searchedId: body.trainerId,
            searchMethods: ['getById', 'getBySlug', 'getAll'],
            suggestion: 'Проверьте ID тренера или создайте тренера в базе данных'
          }
        },
        { status: 404 }
      );
    }

    console.log('👨‍💼 trainer-booking: тренер найден:', trainer.name, 'ID:', trainer._id);

    // Создаем временные метки для начала и конца тренировки
    const startDateTime = new Date(`${body.date}T${body.time}:00`);
    const endDateTime = new Date(startDateTime);
    endDateTime.setHours(endDateTime.getHours() + 1);

    console.log('📅 trainer-booking: создаем бронирование:', {
      userId: foundUser._id,
      trainerId: trainer._id, // Используем реальный ID тренера
      startTime: startDateTime.getTime(),
      endTime: endDateTime.getTime(),
    });

    // Создаем бронирование
    const bookingResponse = await fetch(`${convexUrl}/api/mutation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path: 'bookings:createForUser', // Новая функция для пользователей
        args: {
          userId: foundUser._id,
          trainerId: trainer._id, // Используем реальный ID тренера
          startTime: startDateTime.getTime(),
          endTime: endDateTime.getTime(),
          duration: 60,
          workoutType: body.type || 'Персональная тренировка',
          price: parseFloat(body.price?.replace(/[^\d]/g, '') || '0'),
          notes: body.notes || '',
          status: 'pending',
          createdAt: Date.now(),
          updatedAt: Date.now()
        }
      })
    });

    if (!bookingResponse.ok) {
      const errorText = await bookingResponse.text();
      console.error('❌ trainer-booking: ошибка создания бронирования:', bookingResponse.status, errorText);
      throw new Error('Ошибка при создании бронирования');
    }

    const bookingData = await bookingResponse.json();
    const bookingId = bookingData.value;

    console.log('✅ trainer-booking: бронирование создано с ID:', bookingId);

    return NextResponse.json({
      success: true,
      booking: {
        id: bookingId,
        trainerId: trainer._id,
        trainerName: trainer.name,
        date: body.date,
        time: body.time,
        type: body.type,
        price: body.price,
        status: 'pending',
        createdAt: new Date().toISOString(),
      },
      message: 'Бронирование успешно создано',
      debug: {
        authSystem: auth.system,
        userId: foundUser._id,
        trainerId: trainer._id,
        trainerName: trainer.name
      }
    });

  } catch (error) {
    console.error('❌ trainer-booking: критическая ошибка:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Ошибка при создании бронирования',
        details: error instanceof Error ? error.message : 'Неизвестная ошибка'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 trainer-booking GET: начинаем обработку');

    // Универсальная проверка авторизации
    const auth = getAuthFromRequest(request);
    const authError = createAuthErrorResponse(auth, ['member']);
    if (authError) {
      return NextResponse.json(authError, { status: 401 });
    }

    const user = auth.user!;
    console.log('✅ trainer-booking GET: авторизация успешна для:', user.email);

    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!convexUrl) {
      throw new Error('NEXT_PUBLIC_CONVEX_URL не установлен');
    }

    // Находим пользователя
    const userResponse = await fetch(`${convexUrl}/api/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path: 'users:getByEmail',
        args: { email: user.email }
      })
    });

    if (!userResponse.ok) {
      throw new Error('Ошибка при поиске пользователя');
    }

    const userData = await userResponse.json();
    const foundUser = userData.value;

    if (!foundUser) {
      return NextResponse.json(
        { success: false, error: 'Пользователь не найден' },
        { status: 404 }
      );
    }

    // Получаем бронирования пользователя
    const bookingsResponse = await fetch(`${convexUrl}/api/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path: 'bookings:getByUser',
        args: { userId: foundUser._id }
      })
    });

    if (!bookingsResponse.ok) {
      throw new Error('Ошибка при получении бронирований');
    }

    const bookingsData = await bookingsResponse.json();
    const bookings = bookingsData.value || [];

    console.log('✅ trainer-booking GET: получены бронирования:', bookings.length);

    // Получаем данные тренеров для каждого бронирования
    const bookingsWithTrainers = await Promise.all(
      bookings.map(async (booking: any) => {
        try {
          const trainerResponse = await fetch(`${convexUrl}/api/query`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              path: 'trainers:getById',
              args: { id: booking.trainerId }
            })
          });

          let trainerName = 'Неизвестный тренер';
          if (trainerResponse.ok) {
            const trainerData = await trainerResponse.json();
            const trainer = trainerData.value;
            if (trainer) {
              trainerName = trainer.name;
            }
          }
          
          return {
            id: booking._id,
            trainerId: booking.trainerId,
            trainerName: trainerName,
            date: new Date(booking.startTime).toISOString().split('T')[0],
            time: new Date(booking.startTime).toLocaleTimeString('ru-RU', { 
              hour: '2-digit', 
              minute: '2-digit' 
            }),
            type: booking.workoutType,
            price: booking.price,
            status: booking.status,
            createdAt: new Date(booking.createdAt).toISOString(),
          };
        } catch (error) {
          console.error('Ошибка получения данных тренера:', error);
          return {
            id: booking._id,
            trainerId: booking.trainerId,
            trainerName: 'Неизвестный тренер',
            date: new Date(booking.startTime).toISOString().split('T')[0],
            time: new Date(booking.startTime).toLocaleTimeString('ru-RU', { 
              hour: '2-digit', 
              minute: '2-digit' 
            }),
            type: booking.workoutType,
            price: booking.price,
            status: booking.status,
            createdAt: new Date(booking.createdAt).toISOString(),
          };
        }
      })
    );

    return NextResponse.json({
      success: true,
      bookings: bookingsWithTrainers,
      debug: {
        authSystem: auth.system,
        bookingsCount: bookings.length
      }
    });

  } catch (error) {
    console.error('❌ trainer-booking GET: ошибка:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Ошибка при получении бронирований',
        details: error instanceof Error ? error.message : 'Неизвестная ошибка'
      },
      { status: 500 }
    );
  }
}
