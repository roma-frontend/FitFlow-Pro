// app/api/memberships/create-payment/route.ts
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
      planId,
      userId,
      userEmail,
      userName,
      userPhone,
      autoRenew = false
    } = await request.json();

    console.log('💳 Creating membership payment:', {
      planId,
      userId,
      userEmail,
      userName,
      userPhone,
      autoRenew
    });

    // Валидация данных
    if (!planId || !userId || !userEmail || !userName) {
      return NextResponse.json(
        { error: 'Отсутствуют обязательные данные: planId, userId, userEmail, userName' },
        { status: 400 }
      );
    }

    // Получаем информацию о плане из Convex
    const plan = await convex.query("memberships:getPlanById", { id: planId });
    
    if (!plan) {
      return NextResponse.json(
        { error: 'План абонемента не найден' },
        { status: 404 }
      );
    }

    console.log('📋 Plan details:', {
      id: plan._id,
      type: plan.type,
      name: plan.name,
      price: plan.price,
      duration: plan.duration
    });

    // Создаем Payment Intent с полными данными
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(plan.price * 100), // Конвертируем в копейки
      currency: 'rub',
      
      // Email для чека
      receipt_email: userEmail,
      
      // Метаданные
      metadata: {
        userId: userId,
        planId: planId,
        planType: plan.type,
        planName: plan.name,
        planDuration: plan.duration.toString(),
        autoRenew: autoRenew.toString(),
        email: userEmail,
        userName: userName,
        userPhone: userPhone || '',
        createdAt: Date.now().toString(),
        orderType: 'membership',
        source: 'web',
      },
      
      description: `Абонемент "${plan.name}" (${plan.duration} дней) для ${userName}`,
      
      // Данные клиента
      shipping: {
        name: userName,
        phone: userPhone || undefined,
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
      receipt_email: paymentIntent.receipt_email
    });

    // Создаем предварительный заказ абонемента в Convex
    const membershipOrderId = await convex.mutation("membershipOrders:create", {
      userId,
      planId,
      planType: plan.type,
      planName: plan.name,
      price: plan.price,
      duration: plan.duration,
      autoRenew,
      paymentIntentId: paymentIntent.id,
      paymentMethod: 'card',
      status: 'pending',
      
      // Данные клиента
      userEmail,
      userName,
      userPhone,
    });

    console.log('📦 Membership order created:', membershipOrderId);

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      membershipOrderId,
      plan: {
        id: plan._id,
        name: plan.name,
        price: plan.price,
        duration: plan.duration
      }
    });

  } catch (error) {
    console.error('❌ Error creating membership payment:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Ошибка создания платежа'
      },
      { status: 500 }
    );
  }
}