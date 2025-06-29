import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { ConvexHttpClient } from "convex/browser";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
});

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: NextRequest) {
  try {
    const { paymentIntentId, orderId } = await request.json();

    console.log('✅ Confirming payment:', { paymentIntentId, orderId });

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

    // ✅ Обновляем заказ напрямую через Convex (без внутреннего API)
    console.log('📦 Updating order status via Convex...');
    
    const updatedOrder = await convex.mutation("orders:updatePaymentStatus", {
      paymentIntentId,
      status: 'confirmed',
      paymentStatus: 'paid',
      paymentId: paymentIntent.id,
      paidAt: Date.now(),
    });

    console.log('✅ Order updated successfully:', updatedOrder);

    // ✅ Извлекаем данные клиента из всех доступных источников
    const customerEmail = paymentIntent.receipt_email || 
                         paymentIntent.metadata?.email ||
                         paymentIntent.metadata?.memberEmail ||
                         chargeDetails?.billing_details?.email ||
                         updatedOrder.customerEmail ||
                         updatedOrder.memberEmail ||
                         'customer@FitFlow-Pros.ru';

    const customerName = paymentIntent.metadata?.customerName ||
                        paymentIntent.metadata?.userName ||
                        paymentIntent.shipping?.name ||
                        chargeDetails?.billing_details?.name ||
                        updatedOrder.customerName ||
                        updatedOrder.memberName ||
                        'Покупатель';

    const customerPhone = paymentIntent.metadata?.customerPhone ||
                         paymentIntent.shipping?.phone ||
                         chargeDetails?.billing_details?.phone ||
                         updatedOrder.customerPhone ||
                         '';

    const userId = paymentIntent.metadata?.userId ||
                  paymentIntent.metadata?.memberId ||
                  updatedOrder.userId || 
                  updatedOrder.memberId || 
                  'guest';

    console.log('👤 Final customer data extracted:', {
      email: customerEmail,
      name: customerName,
      phone: customerPhone,
      userId: userId,
      sources: {
        fromPaymentIntent: {
          receipt_email: paymentIntent.receipt_email,
          metadata: paymentIntent.metadata,
          shipping: paymentIntent.shipping
        },
        fromCharge: chargeDetails ? {
          billing_details: chargeDetails.billing_details
        } : null,
        fromOrder: {
          customerEmail: updatedOrder.customerEmail,
          memberEmail: updatedOrder.memberEmail,
          customerName: updatedOrder.customerName,
          memberName: updatedOrder.memberName,
          customerPhone: updatedOrder.customerPhone
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
      hasPhone: !!customerPhone
    });

    // Формируем чек с реальными данными
    const receipt = {
      receiptId: `RCP-${Date.now()}`,
      orderId: updatedOrder._id,
      paymentId: paymentIntent.id,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency.toUpperCase(),
      paidAt: new Date().toISOString(),
      customer: {
        email: customerEmail,
        name: customerName,
        phone: customerPhone,
        userId: userId,
      },
      items: updatedOrder.items?.map((item: any) => ({
        name: item.productName || 'Товар',
        quantity: item.quantity || 1,
        price: item.price || 0,
        total: item.totalPrice || 0,
      })) || [],
      pickupType: updatedOrder.pickupType || 'pickup',
      notes: updatedOrder.notes || '',
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
        dataSource: 'stripe_and_order'
      }
    };

    console.log('📧 Receipt generated with real customer data:', {
      receiptId: receipt.receiptId,
      customer: receipt.customer,
      itemsCount: receipt.items.length,
      dataQuality: receipt.dataQuality
    });

    return NextResponse.json({
      success: true,
      receipt,
      order: updatedOrder,
    });

  } catch (error) {
    console.error('❌ Error confirming payment:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Ошибка подтверждения платежа'
      },
      { status: 500 }
    );
  }
}
