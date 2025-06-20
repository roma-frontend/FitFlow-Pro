// app/api/purchases/route.ts (полная версия)
import { NextRequest, NextResponse } from 'next/server';
import { getAuthFromRequest, createAuthErrorResponse } from '@/lib/universal-auth';

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 purchases: начинаем обработку покупки');

    // Универсальная проверка авторизации
    const auth = getAuthFromRequest(request);
    console.log('🔐 purchases: результат авторизации:', {
      authenticated: auth.authenticated,
      system: auth.system,
      userRole: auth.user?.role
    });

    // Проверяем авторизацию и роль
    const authError = createAuthErrorResponse(auth, ['member']);
    if (authError) {
      console.log('❌ purchases: ошибка авторизации');
      return NextResponse.json(authError, { status: 401 });
    }

    const user = auth.user!;
    console.log('✅ purchases: авторизация успешна для:', user.email);

    const body = await request.json();
    console.log('💳 purchases: данные покупки:', body);

    // Проверяем обязательные поля
    if (!body.type || !body.price) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Отсутствуют обязательные поля: type, price' 
        },
        { status: 400 }
      );
    }

    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!convexUrl) {
      throw new Error('NEXT_PUBLIC_CONVEX_URL не установлен');
    }

    // Находим участника в базе данных
    const memberResponse = await fetch(`${convexUrl}/api/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path: 'members:getByEmail',
        args: { email: user.email }
      })
    });

    if (!memberResponse.ok) {
      console.error('❌ purchases: ошибка поиска участника:', memberResponse.status);
      throw new Error('Ошибка при поиске участника');
    }

    const memberData = await memberResponse.json();
    const member = memberData.value;

    if (!member) {
      console.log('❌ purchases: участник не найден');
      return NextResponse.json(
        { success: false, error: 'Участник не найден в базе данных' },
        { status: 404 }
      );
    }

    console.log('👤 purchases: участник найден:', member._id);

    // Создаем запись о покупке
    const purchaseData = {
      memberId: member._id,
      memberEmail: user.email,
      type: body.type,
      title: body.title || body.type,
      price: parseFloat(body.price.toString().replace(/[^\d.]/g, '')),
      currency: 'RUB',
      status: 'completed',
      paymentMethod: body.paymentMethod || 'card',
      description: body.description || '',
      metadata: {
        duration: body.duration,
        sessions: body.sessions,
        validUntil: body.validUntil,
        features: body.features || []
      },
      purchaseDate: Date.now(),
      createdAt: Date.now()
    };

    console.log('💰 purchases: создаем запись о покупке:', purchaseData);

    // Сохраняем покупку в Convex
    const purchaseResponse = await fetch(`${convexUrl}/api/mutation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path: 'purchases:create',
        args: purchaseData
      })
    });

    if (!purchaseResponse.ok) {
      const errorText = await purchaseResponse.text();
      console.error('❌ purchases: ошибка создания покупки:', purchaseResponse.status, errorText);
      throw new Error('Ошибка при создании записи о покупке');
    }

    const purchaseResult = await purchaseResponse.json();
    const purchaseId = purchaseResult.value;

    console.log('✅ purchases: покупка создана с ID:', purchaseId);

    // Если это абонемент, обновляем информацию об участнике
    if (body.type.includes('абонемент') || body.type.includes('membership') || body.type.includes('Месячный') || body.type.includes('Годовой')) {
      try {
        const membershipData = {
          type: body.type,
          purchaseId: purchaseId,
          startDate: Date.now(),
          endDate: body.validUntil ? new Date(body.validUntil).getTime() : Date.now() + (30 * 24 * 60 * 60 * 1000), // 30 дней по умолчанию
          sessionsRemaining: body.sessions || 0,
          status: 'active'
        };

        console.log('💳 purchases: обновляем абонемент участника:', membershipData);

        const membershipResponse = await fetch(`${convexUrl}/api/mutation`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            path: 'members:updateMembership',
            args: {
              memberId: member._id,
              membership: membershipData
            }
          })
        });

        if (membershipResponse.ok) {
          console.log('✅ purchases: абонемент участника обновлен');
        } else {
          const errorText = await membershipResponse.text();
          console.warn('⚠️ purchases: не удалось обновить абонемент участника:', errorText);
        }
      } catch (membershipError) {
        console.error('⚠️ purchases: ошибка обновления абонемента:', membershipError);
        // Не прерываем процесс, так как основная покупка уже создана
      }
    }

    // Отправляем уведомление (в реальном приложении)
    try {
      console.log('📧 purchases: отправка уведомления о покупке...');
      // Здесь можно добавить отправку email, SMS или push-уведомлений
    } catch (notificationError) {
      console.warn('⚠️ purchases: ошибка отправки уведомления:', notificationError);
    }

    return NextResponse.json({
      success: true,
      purchase: {
        id: purchaseId,
        type: body.type,
        title: body.title,
        price: body.price,
        status: 'completed',
        purchaseDate: new Date().toISOString(),
        memberEmail: user.email
      },
      message: 'Покупка успешно обработана',
      debug: {
        authSystem: auth.system,
        userId: user.id,
        memberId: member._id,
        purchaseId: purchaseId,
        membershipUpdated: body.type.includes('абонемент') || body.type.includes('membership')
      }
    });

  } catch (error) {
    console.error('❌ purchases: критическая ошибка:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Ошибка при обработке покупки',
        details: error instanceof Error ? error.message : 'Неизвестная ошибка'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 purchases GET: получение истории покупок');

    const auth = getAuthFromRequest(request);
    const authError = createAuthErrorResponse(auth, ['member']);
    if (authError) {
      return NextResponse.json(authError, { status: 401 });
    }

    const user = auth.user!;
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!convexUrl) {
      throw new Error('NEXT_PUBLIC_CONVEX_URL не установлен');
    }

    // Находим участника
    const memberResponse = await fetch(`${convexUrl}/api/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path: 'members:getByEmail',
        args: { email: user.email }
      })
    });

    if (!memberResponse.ok) {
      throw new Error('Ошибка при поиске участника');
    }

    const memberData = await memberResponse.json();
    const member = memberData.value;

    if (!member) {
      return NextResponse.json(
        { success: false, error: 'Участник не найден' },
        { status: 404 }
      );
    }

    // Получаем историю покупок
    const purchasesResponse = await fetch(`${convexUrl}/api/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path: 'purchases:getByMember',
        args: { memberId: member._id }
      })
    });

    if (!purchasesResponse.ok) {
      throw new Error('Ошибка при получении покупок');
    }

    const purchasesData = await purchasesResponse.json();
    const purchases = purchasesData.value || [];

    console.log('📋 purchases GET: найдено покупок:', purchases.length);

    const formattedPurchases = purchases.map((purchase: any) => ({
      id: purchase._id,
      type: purchase.type,
      title: purchase.title,
      price: purchase.price,
      currency: purchase.currency,
      status: purchase.status,
      purchaseDate: new Date(purchase.purchaseDate).toISOString(),
      description: purchase.description,
      metadata: purchase.metadata
    }));

    return NextResponse.json({
      success: true,
      purchases: formattedPurchases,
      debug: {
        authSystem: auth.system,
        userEmail: user.email,
        purchasesCount: purchases.length
      }
    });

  } catch (error) {
    console.error('❌ purchases GET: критическая ошибка:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Ошибка при получении истории покупок',
        details: error instanceof Error ? error.message : 'Неизвестная ошибка'
      },
      { status: 500 }
    );
  }
}
