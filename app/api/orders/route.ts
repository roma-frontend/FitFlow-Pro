// app/api/orders/route.ts (обновленный)
import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from "convex/browser";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 API: Получение заказов пользователя");
    
    // Проверяем авторизацию
    const authResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/auth/check`, {
      headers: {
        'Cookie': request.headers.get('cookie') || '',
      },
    });
    
    const authData = await authResponse.json();
    console.log("👤 API: Данные авторизации:", { authenticated: authData.authenticated, userId: authData.user?.id });
    
    if (!authData.authenticated) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    // Получаем заказы пользователя
    let orders = [];
    
    // Пробуем получить как member
    if (authData.user.role === 'member' || authData.user.role === 'client') {
      try {
        orders = await convex.query("orders:getByMember", { 
          memberId: authData.user.id 
        });
        console.log("📦 API: Заказы участника найдены:", orders.length);
      } catch (error) {
        console.log("⚠️ API: Ошибка получения заказов участника, пробуем как user");
        // Если не получилось как member, пробуем как user
        orders = await convex.query("orders:getByUser", { 
          userId: authData.user.id 
        });
        console.log("📦 API: Заказы пользователя найдены:", orders.length);
      }
    } else {
      // Для других ролей получаем как user
      orders = await convex.query("orders:getByUser", { 
        userId: authData.user.id 
      });
      console.log("📦 API: Заказы пользователя найдены:", orders.length);
    }

    return NextResponse.json({
      success: true,
      orders: orders || []
    });

  } catch (error) {
    console.error('❌ API: Ошибка получения заказов:', error);
    return NextResponse.json(
      { 
        error: 'Ошибка получения заказов',
        details: error instanceof Error ? error.message : 'Неизвестная ошибка'
      },
      { status: 500 }
    );
  }
}
