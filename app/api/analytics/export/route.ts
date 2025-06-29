// app/api/analytics/export/route.ts (исправленная версия)
import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from "convex/browser";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Типы для пользователя
interface User {
  id: string;
  email: string;
  role: 'admin' | 'trainer' | 'client';
}

// Функция для получения аутентифицированного пользователя
async function getAuthenticatedUser(request: NextRequest): Promise<User | null> {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '') || 
                  request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return null;
    }

    // Для примера возвращаем мок-пользователя
    return {
      id: 'user-1',
      email: 'admin@example.com',
      role: 'admin'
    };
  } catch (error) {
    console.error('Ошибка аутентификации:', error);
    return null;
  }
}

// Функция проверки прав
function hasPermission(user: User, resource: string, action: string): boolean {
  if (user.role === 'admin') {
    return true;
  }
  
  if (user.role === 'trainer' && resource === 'analytics' && action === 'read') {
    return true;
  }
  
  return false;
}

// POST /api/analytics/export - Экспорт аналитических данных через Convex
export async function POST(request: NextRequest) {
  try {
    console.log('📤 API: экспорт аналитических данных');

    // Проверка аутентификации и прав
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Не авторизован' },
        { status: 401 }
      );
    }

    if (!hasPermission(user, 'analytics', 'read')) {
      return NextResponse.json(
        { success: false, error: 'Недостаточно прав' },
        { status: 403 }
      );
    }

    const { type, startDate, endDate, format = "json" } = await request.json();

    // Получаем данные через Convex (используем convex.query вместо useQuery)
    const exportData = await convex.query("analytics:getExportData", {
      type,
      startDate,
      endDate,
      format,
    });

    // Если запрашивается CSV формат
    if (format === 'csv') {
      let csvContent = '';
      
      switch (type) {
        case 'users':
          const userHeaders = ['ID', 'Email', 'Имя', 'Роль', 'Активен', 'Дата создания', 'Последний вход'];
          const userRows = exportData.data.map((user: any) => [
            user.id,
            user.email,
            user.name,
            user.role,
            user.isActive ? 'Да' : 'Нет',
            user.createdAt,
            user.lastLoginAt || 'Никогда'
          ]);
          
          csvContent = [
            userHeaders.join(','), 
            ...userRows.map((row: any[]) => row.join(','))
          ].join('\n');
          break;
          
        case 'products':
          const productHeaders = ['ID', 'Название', 'Категория', 'Цена', 'Остаток', 'Активен', 'Дата создания'];
          const productRows = exportData.data.map((product: any) => [
            product.id,
            `"${product.name}"`,
            product.category,
            product.price,
            product.stock,
            product.isActive ? 'Да' : 'Нет',
            product.createdAt
          ]);
          
          csvContent = [
            productHeaders.join(','), 
            ...productRows.map((row: any[]) => row.join(','))
          ].join('\n');
          break;
          
        case 'orders':
          const orderHeaders = ['ID', 'Пользователь', 'Email', 'Сумма', 'Статус', 'Товаров', 'Дата создания'];
          const orderRows = exportData.data.map((order: any) => [
            order.id,
            order.userId,
            order.userEmail,
            order.totalAmount,
            order.status,
            order.itemsCount,
            order.createdAt
          ]);
          
          csvContent = [
            orderHeaders.join(','), 
            ...orderRows.map((row: any[]) => row.join(','))
          ].join('\n');
          break;
          
        default:
          csvContent = JSON.stringify(exportData.data, null, 2);
      }

      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="${type}_export_${new Date().toISOString().split('T')[0]}.csv"`
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: exportData,
    });

  } catch (error: any) {
    console.error('💥 API: ошибка экспорта аналитики:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Ошибка экспорта данных' },
      { status: 500 }
    );
  }
}

// GET метод для обратной совместимости
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const type = url.searchParams.get('type') || 'analytics';
  const format = url.searchParams.get('format') || 'json';
  const period = url.searchParams.get('period') || 'month';
  
  // Создаем новый Request объект для POST
  const requestBody = JSON.stringify({
    type,
    format,
    period,
    startDate: undefined,
    endDate: undefined
  });

  const postRequest = new NextRequest(request.url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...Object.fromEntries(request.headers.entries())
    },
    body: requestBody
  });
  
  return POST(postRequest);
}
