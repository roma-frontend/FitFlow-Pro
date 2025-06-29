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
      items, 
      totalAmount, 
      pickupType, 
      notes, 
      userId, 
      memberId,
      memberEmail, 
      customerName,
      customerPhone
    } = await request.json();

    console.log('💳 Creating payment intent with full user data:', {
      totalAmount,
      itemsCount: items?.length,
      pickupType,
      userId,
      memberId,
      memberEmail,
      customerName,
      customerPhone,
      items: items?.map((item: any) => ({ 
        productId: item.productId, 
        name: item.productName || item.name 
      }))
    });

    // Валидация данных
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Товары не указаны' },
        { status: 400 }
      );
    }

    if (!totalAmount || totalAmount <= 0) {
      return NextResponse.json(
        { error: 'Неверная сумма заказа' },
        { status: 400 }
      );
    }

    // ✅ Валидация обязательных данных клиента
    if (!memberEmail || !customerName) {
      return NextResponse.json(
        { error: 'Email и имя клиента обязательны' },
        { status: 400 }
      );
    }

    // ✅ Создаем Payment Intent с полными данными клиента
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100),
      currency: 'rub',
      
      // ✅ Устанавливаем receipt_email
      receipt_email: memberEmail,
      
      // ✅ Полные метаданные
      metadata: {
        userId: userId || 'guest',
        memberId: memberId || userId || '',
        pickupType,
        itemsCount: items.length.toString(),
        notes: notes || '',
        email: memberEmail,
        memberEmail: memberEmail,
        customerName: customerName,
        userName: customerName,
        customerPhone: customerPhone || '',
        createdAt: Date.now().toString(),
        orderType: 'shop',
        source: 'web',
      },
      
      description: `Заказ магазина FitFlow-Pro - ${items.length} товаров для ${customerName}`,
      
            // ✅ Данные доставки/получения
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

    console.log('✅ Payment intent created with full customer data:', {
      id: paymentIntent.id,
      receipt_email: paymentIntent.receipt_email,
      metadata: paymentIntent.metadata,
      shipping: paymentIntent.shipping
    });

    // Подготавливаем items для Convex
    const convexItems = items.map((item: any) => {
      let productId = item.productId;
      
      // Если productId выглядит как Convex ID, используем его
      if (typeof productId === 'string' && productId.startsWith('k')) {
        // Это уже правильный Convex ID
      } else {
        // Если это не Convex ID, преобразуем в строку
        productId = String(productId);
      }
      
      return {
        productId,
        productName: item.productName || item.name,
        quantity: item.quantity,
        price: item.price,
        totalPrice: item.totalPrice || (item.price * item.quantity),
      };
    });

    console.log('📦 Prepared items for Convex:', convexItems);

    // ✅ Создаем заказ в Convex с полными данными клиента
    const orderId = await convex.mutation("orders:create", {
      userId: userId || undefined,
      memberId: memberId || userId || undefined,
      items: convexItems,
      totalAmount,
      pickupType,
      notes,
      paymentIntentId: paymentIntent.id,
      paymentMethod: 'card',
      
      // ✅ Полные данные клиента
      customerEmail: memberEmail,
      memberEmail: memberEmail,
      customerName: customerName,
      memberName: customerName,
      customerPhone: customerPhone,
    });

    console.log('📦 Order created in Convex with full customer data:', orderId);

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      orderId,
    });

  } catch (error) {
    console.error('❌ Error creating payment intent:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Ошибка создания платежа'
      },
      { status: 500 }
    );
  }
}
