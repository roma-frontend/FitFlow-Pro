// app/api/products/create/route.ts (новый файл)
import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from "convex/browser";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Создаем продукт
    const productId = await convex.mutation("products:create", body);

    return NextResponse.json({
      success: true,
      productId
    });

  } catch (error) {
    console.error('Ошибка создания продукта:', error);
    return NextResponse.json(
      { error: 'Ошибка создания продукта' },
      { status: 500 }
    );
  }
}
