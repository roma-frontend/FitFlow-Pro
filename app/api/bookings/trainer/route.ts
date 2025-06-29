// app/api/bookings/trainer/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAuthFromRequest, createAuthErrorResponse } from '@/lib/universal-auth';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
});

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
    const auth = await getAuthFromRequest(request);
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

    // Ищем пользователя в таблице users
    console.log('🔍 trainer-booking: ищем пользователя в таблице users по email:', user.email);
    
    const userResponse = await fetch(`${convexUrl}/api/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path: 'users:getByEmail',
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

    // Поиск тренера (используем существующую логику)
    console.log('👨‍💼 trainer-booking: ищем тренера по ID:', body.trainerId);

    let trainer = await findTrainer(convexUrl, body.trainerId);

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

    // Парсим цену
    const price = parseFloat(body.price?.replace(/[^\d]/g, '') || '0');

    // Если указан метод оплаты "card", создаем Payment Intent
    let paymentIntentId = null;
    let clientSecret = null;

    if (body.paymentMethod === 'card') {
      console.log('💳 trainer-booking: создаем Payment Intent для оплаты картой');
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(price * 100), // Stripe работает с копейками
        currency: 'rub',
        receipt_email: user.email,
        metadata: {
          bookingType: 'trainer',
          trainerId: trainer._id,
          trainerName: trainer.name,
          userId: foundUser._id,
          userEmail: user.email,
          userName: foundUser.name || user.email,
          date: body.date,
          time: body.time,
          trainingType: body.type || 'Персональная тренировка',
        },
        description: `Тренировка с ${trainer.name} - ${body.date} в ${body.time}`,
        shipping: {
          name: foundUser.name || user.email,
          phone: foundUser.phone || undefined,
          address: {
            country: 'RU',
            line1: 'Фитнес-центр FitFlow-Pro',
            city: 'Москва',
            state: 'Москва',
            postal_code: '101000',
          }
        },
      });

      paymentIntentId = paymentIntent.id;
      clientSecret = paymentIntent.client_secret;
      
      console.log('✅ Payment intent created:', paymentIntentId);
    }

    console.log('📅 trainer-booking: создаем бронирование:', {
      userId: foundUser._id,
      trainerId: trainer._id,
      startTime: startDateTime.getTime(),
      endTime: endDateTime.getTime(),
      paymentMethod: body.paymentMethod || 'cash',
      paymentIntentId: paymentIntentId,
    });

    // Создаем бронирование
    const bookingResponse = await fetch(`${convexUrl}/api/mutation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path: 'bookings:createForUser',
        args: {
          userId: foundUser._id,
          trainerId: trainer._id,
          startTime: startDateTime.getTime(),
          endTime: endDateTime.getTime(),
          duration: 60,
          workoutType: body.type || 'Персональная тренировка',
          price: price,
          notes: body.notes || '',
          status: 'pending',
          paymentMethod: body.paymentMethod || 'cash',
          paymentIntentId: paymentIntentId,
          paymentStatus: body.paymentMethod === 'cash' ? 'pending' : 'processing',
          createdAt: Date.now(),
          updatedAt: Date.now()
        }
      })
    });

    if (!bookingResponse.ok) {
      const errorText = await bookingResponse.text();
      console.error('❌ trainer-booking: ошибка создания бронирования:', bookingResponse.status, errorText);
      
      // Если был создан Payment Intent, отменяем его
      if (paymentIntentId) {
        await stripe.paymentIntents.cancel(paymentIntentId);
      }
      
      throw new Error('Ошибка при создании бронирования');
    }

    const bookingData = await bookingResponse.json();
    const bookingId = bookingData.value;

    console.log('✅ trainer-booking: бронирование создано с ID:', bookingId);

    // Формируем ответ
    const response: any = {
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
        paymentMethod: body.paymentMethod || 'cash',
        paymentStatus: body.paymentMethod === 'cash' ? 'pending' : 'processing',
        createdAt: new Date().toISOString(),
      },
      message: 'Бронирование успешно создано',
      debug: {
        authSystem: auth.system,
        userId: foundUser._id,
        trainerId: trainer._id,
        trainerName: trainer.name
      }
    };

    // Если оплата картой, добавляем client secret и payment intent id
    if (clientSecret && paymentIntentId) {
      response.clientSecret = clientSecret;
      response.paymentIntentId = paymentIntentId;
      console.log('💳 Возвращаем clientSecret для оплаты картой');
    }

    return NextResponse.json(response);

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

// Вспомогательная функция для поиска тренера
async function findTrainer(convexUrl: string, trainerId: string) {
  let trainer = null;

  // Попробуем getById
  let trainerResponse = await fetch(`${convexUrl}/api/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      path: 'trainers:getById',
      args: { id: trainerId }
    })
  });

  if (trainerResponse.ok) {
    const trainerData = await trainerResponse.json();
    trainer = trainerData.value;
  }

  // Если не найден по ID, попробуем по slug
  if (!trainer) {
    trainerResponse = await fetch(`${convexUrl}/api/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path: 'trainers:getBySlug',
        args: { slug: trainerId }
      })
    });

    if (trainerResponse.ok) {
      const trainerData = await trainerResponse.json();
      trainer = trainerData.value;
    }
  }

  // Если все еще не найден, попробуем получить всех тренеров
  if (!trainer) {
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
      
      trainer = allTrainers.find((t: any) => 
        t._id === trainerId ||
        t.name?.toLowerCase().replace(/\s+/g, '-') === trainerId ||
        t.email === trainerId ||
        t.name === trainerId
      );
    }
  }

  return trainer;
}

// GET запрос остается без изменений
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 trainer-booking GET: начинаем обработку');

    // Универсальная проверка авторизации
    const auth = await getAuthFromRequest(request);
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
            paymentMethod: booking.paymentMethod || 'cash',
            paymentStatus: booking.paymentStatus || 'pending',
            paymentIntentId: booking.paymentIntentId,
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
            paymentMethod: booking.paymentMethod || 'cash',
            paymentStatus: booking.paymentStatus || 'pending',
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