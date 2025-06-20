// app/api/orders/update-payment/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from "convex/browser";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: NextRequest) {
  try {
    const { paymentIntentId, status, paymentStatus, paymentId, paidAt } = await request.json();

    console.log('💳 Updating order payment status:', {
      paymentIntentId,
      status,
      paymentStatus,
      paymentId,
      paidAt
    });

    // Обновляем заказ в Convex
    const updatedOrder = await convex.mutation("orders:updatePaymentStatus", {
      paymentIntentId,
      status,
      paymentStatus,
      paymentId,
      paidAt,
    });

    console.log('✅ Order updated:', updatedOrder._id);

    return NextResponse.json({
      success: true,
      order: updatedOrder,
    });

  } catch (error) {
    console.error('❌ Error updating order:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Ошибка обновления заказа'
      },
      { status: 500 }
    );
  }
}
