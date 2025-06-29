// app/api/payments/trainer/create/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { ConvexHttpClient } from "convex/browser";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
});

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: NextRequest) {
  try {
    const { 
      trainerId,
      trainerName,
      date,
      time,
      type,
      price,
      userId,
      memberEmail,
      customerName,
      customerPhone
    } = await request.json();

    console.log('💳 Creating trainer booking payment:', {
      trainerId,
      trainerName,
      date,
      time,
      type,
      price,
      userId,
      memberEmail,
      customerName
    });

    // Валидация данных
    if (!trainerId || !date || !time) {
      return NextResponse.json(
        { error: 'Необходимо указать тренера, дату и время' },
        { status: 400 }
      );
    }

    if (!memberEmail || !customerName) {
      return NextResponse.json(
        { error: 'Email и имя клиента обязательны' },
        { status: 400 }
      );
    }

    // Парсим цену из строки (например, "2200₽/час" -> 2200)
    const numericPrice = typeof price === 'string' 
      ? parseInt(price.replace(/[^\d]/g, '')) 
      : price;

    if (!numericPrice || numericPrice <= 0) {
      return NextResponse.json(
        { error: 'Неверная цена тренировки' },
        { status: 400 }
      );
    }

    // Создаем Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(numericPrice * 100), // Stripe работает с копейками
      currency: 'rub',
      
      // Email для чека
      receipt_email: memberEmail,
      
      // Метаданные для последующей обработки
      metadata: {
        bookingType: 'trainer',
        trainerId,
        trainerName,
        date,
        time,
        trainingType: type,
        userId: userId || 'guest',
        memberEmail,
        customerName,
        customerPhone: customerPhone || '',
        createdAt: Date.now().toString(),
      },
      
      description: `Тренировка с ${trainerName} - ${new Date(date).toLocaleDateString('ru-RU')} в ${time}`,
      
      // Информация о получателе
      shipping: {
        name: customerName,
        phone: customerPhone || undefined,
        address: {
          country: 'RU',
          line1: 'Фитнес-центр FitFlow-Pro',
          city: 'Москва',
          state: 'Москва',
          postal_code: '101000',
        }
      },
    });

    console.log('✅ Payment intent created:', {
      id: paymentIntent.id,
      amount: paymentIntent.amount,
      metadata: paymentIntent.metadata
    });

    // Создаем запись о бронировании в Convex
    const bookingId = await convex.mutation("bookings:createTrainerBooking", {
      trainerId,
      trainerName,
      date,
      time,
      type,
      price: numericPrice,
      userId: userId || undefined,
      memberEmail,
      customerName,
      customerPhone,
      paymentIntentId: paymentIntent.id,
      paymentStatus: 'pending',
      status: 'pending',
    });

    console.log('📅 Booking created in Convex:', bookingId);

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      bookingId,
    });

  } catch (error) {
    console.error('❌ Error creating trainer payment:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Ошибка создания платежа'
      },
      { status: 500 }
    );
  }
}