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

    // Получаем информацию о платеже из Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      throw new Error('Платеж не был завершен');
    }

    console.log('💳 PaymentIntent full data:', {
      id: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      receipt_email: paymentIntent.receipt_email,
      metadata: paymentIntent.metadata,
      shipping: paymentIntent.shipping,
      billing_details: paymentIntent.latest_charge ? 'Available' : 'Not available'
    });

    // ✅ Получаем детали charge для дополнительной информации
    let chargeDetails = null;
    if (paymentIntent.latest_charge) {
      try {
        chargeDetails = await stripe.charges.retrieve(paymentIntent.latest_charge as string);
        console.log('💳 Charge billing details:', chargeDetails.billing_details);
      } catch (chargeError) {
        console.warn('⚠️ Could not retrieve charge details:', chargeError);
      }
    }

    // ✅ Обновляем бронирование напрямую через Convex (без внутреннего API)
    console.log('📦 Updating booking status via Convex...');
    
    const updatedBooking = await convex.mutation("bookings:updateTrainerBookingPayment", {
      paymentIntentId,
      status: 'confirmed',
      paymentStatus: 'paid',
      paymentId: paymentIntent.id,
      paidAt: Date.now(),
    });

    console.log('✅ Booking updated successfully:', updatedBooking);

    // ✅ Извлекаем данные клиента из всех доступных источников
    const customerEmail = paymentIntent.receipt_email || 
                         paymentIntent.metadata?.email ||
                         paymentIntent.metadata?.memberEmail ||
                         chargeDetails?.billing_details?.email ||
                         updatedBooking.customerEmail ||
                         updatedBooking.memberEmail ||
                         'customer@FitFlow-Pros.ru';

    const customerName = paymentIntent.metadata?.customerName ||
                        paymentIntent.metadata?.userName ||
                        paymentIntent.shipping?.name ||
                        chargeDetails?.billing_details?.name ||
                        updatedBooking.customerName ||
                        updatedBooking.memberName ||
                        'Покупатель';

    const customerPhone = paymentIntent.metadata?.customerPhone ||
                         paymentIntent.shipping?.phone ||
                         chargeDetails?.billing_details?.phone ||
                         updatedBooking.customerPhone ||
                         '';

    const userId = paymentIntent.metadata?.userId ||
                  paymentIntent.metadata?.memberId ||
                  updatedBooking.userId || 
                  updatedBooking.memberId || 
                  'guest';

    // ✅ Извлекаем данные о тренировке из всех источников
    const trainerId = paymentIntent.metadata?.trainerId ||
                     updatedBooking.trainerId ||
                     '';

    const trainerName = paymentIntent.metadata?.trainerName ||
                       updatedBooking.trainerName ||
                       'Тренер';

    const bookingDate = paymentIntent.metadata?.date ||
                       updatedBooking.date ||
                       '';

    const bookingTime = paymentIntent.metadata?.time ||
                       updatedBooking.time ||
                       '';

    const trainingType = paymentIntent.metadata?.trainingType ||
                        updatedBooking.trainingType ||
                        'Персональная тренировка';

    console.log('👤 Final customer data extracted:', {
      email: customerEmail,
      name: customerName,
      phone: customerPhone,
      userId: userId,
      trainer: {
        id: trainerId,
        name: trainerName,
        date: bookingDate,
        time: bookingTime,
        type: trainingType
      },
      sources: {
        fromPaymentIntent: {
          receipt_email: paymentIntent.receipt_email,
          metadata: paymentIntent.metadata,
          shipping: paymentIntent.shipping
        },
        fromCharge: chargeDetails ? {
          billing_details: chargeDetails.billing_details
        } : null,
        fromBooking: {
          customerEmail: updatedBooking.customerEmail,
          memberEmail: updatedBooking.memberEmail,
          customerName: updatedBooking.customerName,
          memberName: updatedBooking.memberName,
          customerPhone: updatedBooking.customerPhone,
          trainerId: updatedBooking.trainerId,
          trainerName: updatedBooking.trainerName
        }
      }
    });

    // ✅ Проверяем качество данных
    const isRealData = customerEmail && 
                      customerEmail !== 'customer@FitFlow-Pros.ru' && 
                      customerName && 
                      customerName !== 'Покупатель';

    console.log('🔍 Data quality check:', {
      isRealData,
      hasRealEmail: customerEmail && !customerEmail.includes('FitFlow-Pros.ru'),
      hasRealName: customerName && customerName !== 'Покупатель',
      hasPhone: !!customerPhone,
      hasTrainerData: !!trainerId && !!trainerName
    });

    // Вычисляем время окончания более безопасно
    let endTime = '';
    if (bookingTime) {
      try {
        const [hours, minutes] = bookingTime.split(':');
        const endHour = parseInt(hours) + 1;
        endTime = `${endHour}:${minutes}`;
      } catch (timeError) {
        console.warn('⚠️ Could not calculate end time:', timeError);
        endTime = bookingTime;
      }
    }

    // Формируем чек с реальными данными
    const receipt = {
      receiptId: `TRAIN-${Date.now()}`,
      bookingId: updatedBooking._id || bookingId,
      paymentId: paymentIntent.id,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency.toUpperCase(),
      paidAt: new Date().toISOString(),
      
      booking: {
        trainerId,
        trainerName,
        date: bookingDate,
        time: bookingTime,
        endTime,
        type: trainingType,
      },
      
      customer: {
        email: customerEmail,
        name: customerName,
        phone: customerPhone,
        userId: userId,
      },
      
      company: {
        name: 'FitFlow-Pros',
        address: 'г. Москва, ул. Примерная, д. 1',
        inn: '1234567890',
        phone: '+7 (495) 123-45-67',
        email: 'info@FitFlow-Pros.ru',
      },

      // ✅ Добавляем метаданные о качестве данных
      dataQuality: {
        isRealData,
        hasRealEmail: customerEmail && !customerEmail.includes('FitFlow-Pros.ru'),
        hasRealName: customerName && customerName !== 'Покупатель',
        hasPhone: !!customerPhone,
        hasTrainerData: !!trainerId && !!trainerName,
        dataSource: 'stripe_and_booking'
      }
    };

    console.log('📧 Trainer booking receipt generated with real customer data:', {
      receiptId: receipt.receiptId,
      bookingId: receipt.bookingId,
      customer: receipt.customer,
      booking: receipt.booking,
      dataQuality: receipt.dataQuality
    });

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