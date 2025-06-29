import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { ConvexHttpClient } from "convex/browser";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-05-28.basil',
});

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: NextRequest) {
    try {
        const { paymentIntentId, membershipOrderId } = await request.json();

        console.log('✅ Confirming membership payment:', { paymentIntentId, membershipOrderId });

        // Получаем информацию о платеже из Stripe
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

        if (paymentIntent.status !== 'succeeded') {
            throw new Error('Платеж не был завершен');
        }

        console.log('💳 Payment succeeded:', {
            id: paymentIntent.id,
            amount: paymentIntent.amount,
            metadata: paymentIntent.metadata
        });

        // Получаем детали charge для дополнительной информации
        let chargeDetails = null;
        if (paymentIntent.latest_charge) {
            try {
                chargeDetails = await stripe.charges.retrieve(paymentIntent.latest_charge as string);
            } catch (chargeError) {
                console.warn('⚠️ Could not retrieve charge details:', chargeError);
            }
        }

        // Список разрешённых полей для Convex
        const allowedFields = [
            "_id", "userId", "planId", "planType", "planName", "price", "duration",
            "autoRenew", "userEmail", "userName", "userPhone", "paymentIntentId", "paymentId", "paidAt"
        ];

        function cleanOrderData(orderData: any) {
            return Object.fromEntries(Object.entries(orderData).filter(([key]) => allowedFields.includes(key)));
        }

        // Обновляем статус заказа
        const updatedOrder = await convex.mutation("membershipOrders:updatePaymentStatus", {
            paymentIntentId,
            status: 'confirmed',
            paymentStatus: 'paid',
            paymentId: paymentIntent.id,
            paidAt: Date.now(),
        });
        console.log('✅ Membership order updated:', updatedOrder);

        // Очищаем orderData перед созданием абонемента
        const cleanedOrder = cleanOrderData(updatedOrder);

        console.log('🔍 About to create active membership:', { orderData: cleanedOrder, paymentIntentId: paymentIntent.id });
        const activeMembership = await convex.mutation("memberships:createFromOrder", {
            orderData: cleanedOrder,
            paymentIntentId: paymentIntent.id
        });
        console.log('🎉 Active membership created:', activeMembership);

        // Извлекаем данные клиента
        const customerEmail = paymentIntent.receipt_email ||
            paymentIntent.metadata?.email ||
            updatedOrder.userEmail ||
            'customer@fitflow-pro.ru';

        const customerName = paymentIntent.metadata?.userName ||
            paymentIntent.shipping?.name ||
            chargeDetails?.billing_details?.name ||
            updatedOrder.userName ||
            'Клиент';

        const customerPhone = paymentIntent.metadata?.userPhone ||
            paymentIntent.shipping?.phone ||
            chargeDetails?.billing_details?.phone ||
            updatedOrder.userPhone ||
            '';

        // Формируем чек
        const receipt = {
            receiptId: `MBR-${Date.now()}`,
            membershipId: activeMembership._id,
            paymentId: paymentIntent.id,
            amount: paymentIntent.amount / 100,
            currency: paymentIntent.currency.toUpperCase(),
            paidAt: new Date().toISOString(),
            customer: {
                email: customerEmail,
                name: customerName,
                phone: customerPhone,
                userId: updatedOrder.userId,
            },
            membership: {
                planName: updatedOrder.planName,
                planType: updatedOrder.planType,
                duration: updatedOrder.duration,
                price: updatedOrder.price,
                startDate: activeMembership.startDate,
                expiresAt: activeMembership.expiresAt,
            },
            company: {
                name: 'FitFlow-Pro',
                address: 'г. Москва, ул. Примерная, д. 1',
                inn: '1234567890',
                phone: '+7 (495) 123-45-67',
                email: 'info@fitflow-pro.ru',
            }
        };

        console.log('📧 Membership receipt generated:', {
            receiptId: receipt.receiptId,
            customer: receipt.customer,
            membership: receipt.membership
        });

        return NextResponse.json({
            success: true,
            receipt,
            membership: activeMembership,
            order: updatedOrder,
        });

    } catch (error) {
        console.error('❌ Error confirming membership payment:', error);

        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Ошибка подтверждения платежа'
            },
            { status: 500 }
        );
    }
}