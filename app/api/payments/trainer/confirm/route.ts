// app/api/payments/trainer/confirm/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { ConvexHttpClient } from "convex/browser";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
});

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: NextRequest) {
  try {
    const { paymentIntentId, bookingId } = await request.json();

    console.log('✅ Confirming trainer payment:', { paymentIntentId, bookingId });

    // Получаем информацию о платеже
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      throw new Error('Платеж не был завершен');
    }

    console.log('💳 PaymentIntent confirmed:', {
      id: paymentIntent.id,
      amount: paymentIntent.amount,
      metadata: paymentIntent.metadata
    });

    // Получаем детали charge для дополнительной информации
    let chargeDetails = null;
    if (paymentIntent.latest_charge) {
      try {
        chargeDetails = await stripe.charges.retrieve(paymentIntent.latest_charge as string);
        console.log('💳 Charge details:', chargeDetails.billing_details);
      } catch (chargeError) {
        console.warn('⚠️ Could not retrieve charge details:', chargeError);
      }
    }

    // Обновляем статус бронирования в Convex
    const updatedBooking = await convex.mutation("bookings:updateTrainerBookingPayment", {
      paymentIntentId,
      paymentStatus: 'paid',
      status: 'confirmed',
      paymentId: paymentIntent.id,
      paidAt: Date.now(),
    });

    console.log('✅ Booking updated successfully:', updatedBooking);

    // Извлекаем данные из метаданных платежа
    const { 
      trainerId,
      trainerName,
      date,
      time,
      trainingType,
      memberEmail,
      customerName,
      customerPhone 
    } = paymentIntent.metadata;

    // Формируем квитанцию
    const receipt = {
      receiptId: `TRAIN-${Date.now()}`,
      bookingId: updatedBooking._id,
      paymentId: paymentIntent.id,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency.toUpperCase(),
      paidAt: new Date().toISOString(),
      
      booking: {
        trainerId,
        trainerName,
        date,
        time,
        type: trainingType,
        endTime: `${parseInt(time.split(':')[0]) + 1}:${time.split(':')[1]}`, // +1 час
      },
      
      customer: {
        email: memberEmail,
        name: customerName,
        phone: customerPhone || '',
      },
      
      company: {
        name: 'FitFlow-Pros',
        address: 'г. Москва, ул. Примерная, д. 1',
        inn: '1234567890',
        phone: '+7 (495) 123-45-67',
        email: 'info@FitFlow-Pros.ru',
      },
    };

    console.log('📧 Trainer booking receipt generated:', {
      receiptId: receipt.receiptId,
      booking: receipt.booking,
      customer: receipt.customer
    });

    // Здесь можно добавить отправку email с подтверждением и квитанцией
    // await sendBookingConfirmationEmail(receipt);

    return NextResponse.json({
      success: true,
      receipt,
      booking: updatedBooking,
    });

  } catch (error) {
    console.error('❌ Error confirming trainer payment:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Ошибка подтверждения платежа'
      },
      { status: 500 }
    );
  }
}