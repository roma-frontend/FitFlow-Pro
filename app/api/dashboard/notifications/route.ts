import { NextRequest, NextResponse } from 'next/server';

// Типы для уведомлений
interface DashboardNotification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  priority: 'low' | 'medium' | 'high';
  userId?: string;
}

// Mock данные для уведомлений
const getMockNotifications = (): DashboardNotification[] => {
  const now = new Date();
  
  return [
    {
      id: 'notif_' + Date.now() + '_1',
      type: 'warning',
      title: 'Оборудование требует обслуживания',
      message: 'Беговая дорожка #3 требует планового технического обслуживания',
      timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
      read: false,
      priority: 'high',
      actionUrl: '/admin/equipment'
    },
    {
      id: 'notif_' + Date.now() + '_2',
      type: 'success',
      title: 'Новый клиент',
      message: 'Зарегистрирован новый клиент: Анна Петрова',
      timestamp: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString(),
      read: false,
      priority: 'medium',
      actionUrl: '/admin/clients'
    },
    {
      id: 'notif_' + Date.now() + '_3',
      type: 'info',
      title: 'Отчет готов',
      message: 'Месячный отчет по доходам готов к просмотру',
      timestamp: new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString(),
      read: true,
      priority: 'low',
      actionUrl: '/admin/reports'
    },
    {
      id: 'notif_' + Date.now() + '_4',
      type: 'error',
      title: 'Проблема с платежом',
      message: 'Не удалось обработать платеж клиента ID: 12345',
      timestamp: new Date(now.getTime() - 8 * 60 * 60 * 1000).toISOString(),
      read: false,
      priority: 'high',
      actionUrl: '/admin/payments'
    },
    {
      id: 'notif_' + Date.now() + '_5',
      type: 'info',
      title: 'Расписание обновлено',
      message: 'Тренер Александр Петров обновил свое расписание',
      timestamp: new Date(now.getTime() - 12 * 60 * 60 * 1000).toISOString(),
      read: false,
      priority: 'medium',
      actionUrl: '/admin/schedule'
    }
  ];
};

// Хранилище уведомлений (в реальном приложении это будет база данных)
let notificationsStore: DashboardNotification[] = getMockNotifications();

// GET - Получение уведомлений
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const unreadOnly = searchParams.get('unread') === 'true';
    const priority = searchParams.get('priority') as 'low' | 'medium' | 'high' | null;
    
    console.log('📬 API: Запрос уведомлений Dashboard', {
      limit,
      unreadOnly,
      priority
    });
    
    let filteredNotifications = [...notificationsStore];
    
    // Фильтрация по прочитанности
    if (unreadOnly) {
      filteredNotifications = filteredNotifications.filter(n => !n.read);
    }
    
    // Фильтрация по приоритету
    if (priority) {
      filteredNotifications = filteredNotifications.filter(n => n.priority === priority);
    }
    
    // Сортировка по времени (новые сначала)
    filteredNotifications.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    // Ограничение количества
    const limitedNotifications = filteredNotifications.slice(0, limit);
    
    console.log('✅ API: Уведомления получены:', {
      total: notificationsStore.length,
      filtered: filteredNotifications.length,
      returned: limitedNotifications.length,
      unread: notificationsStore.filter(n => !n.read).length
    });
    
    return NextResponse.json({
      success: true,
      data: limitedNotifications,
      meta: {
        total: notificationsStore.length,
        filtered: filteredNotifications.length,
        unread: notificationsStore.filter(n => !n.read).length,
        highPriority: notificationsStore.filter(n => n.priority === 'high' && !n.read).length
      },
      message: 'Уведомления получены успешно'
    });
    
  } catch (error) {
    console.error('❌ API: Ошибка получения уведомлений:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Ошибка получения уведомлений',
      message: error instanceof Error ? error.message : 'Неизвестная ошибка'
    }, { status: 500 });
  }
}

// POST - Отметка уведомления как прочитанного или создание нового
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('🔄 API: Операция с уведомлением:', body);
    
    if (body.notificationId && body.action === 'read') {
      // Отметка как прочитанного
      const notificationIndex = notificationsStore.findIndex(n => n.id === body.notificationId);
      
      if (notificationIndex === -1) {
        return NextResponse.json({
          success: false,
          error: 'Уведомление не найдено'
        }, { status: 404 });
      }
      
      notificationsStore[notificationIndex].read = true;
      
      console.log('✅ API: Уведомление отмечено как прочитанное:', body.notificationId);
      
      return NextResponse.json({
        success: true,
        data: notificationsStore[notificationIndex],
        message: 'Уведомление отмечено как прочитанное'
      });
      
    } else if (body.type && body.title && body.message) {
      // Создание нового уведомления
      const newNotification: DashboardNotification = {
        id: 'notif_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        type: body.type,
        title: body.title,
        message: body.message,
        timestamp: new Date().toISOString(),
        read: false,
        priority: body.priority || 'medium',
        actionUrl: body.actionUrl,
        userId: body.userId
      };
      
      notificationsStore.unshift(newNotification); // Добавляем в начало
      
      console.log('✅ API: Создано новое уведомление:', newNotification.id);
      
      return NextResponse.json({
        success: true,
        data: newNotification,
        message: 'Уведомление создано успешно'
      });
      
    } else {
      return NextResponse.json({
        success: false,
        error: 'Неверные параметры запроса'
      }, { status: 400 });
    }
    
  } catch (error) {
    console.error('❌ API: Ошибка операции с уведомлением:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Ошибка операции с уведомлением',
      message: error instanceof Error ? error.message : 'Неизвестная ошибка'
    }, { status: 500 });
  }
}

// DELETE - Очистка всех уведомлений или удаление конкретного
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const notificationId = searchParams.get('id');
    
    if (notificationId) {
      // Удаление конкретного уведомления
      const initialLength = notificationsStore.length;
      notificationsStore = notificationsStore.filter(n => n.id !== notificationId);
      
      if (notificationsStore.length === initialLength) {
        return NextResponse.json({
          success: false,
          error: 'Уведомление не найдено'
        }, { status: 404 });
      }
      
      console.log('✅ API: Уведомление удалено:', notificationId);
      
      return NextResponse.json({
        success: true,
        message: 'Уведомление удалено успешно'
      });
      
    } else {
      // Очистка всех уведомлений
      const deletedCount = notificationsStore.length;
      notificationsStore = [];
      
      console.log('✅ API: Все уведомления очищены:', deletedCount);
      
      return NextResponse.json({
        success: true,
        message: `Удалено ${deletedCount} уведомлений`,
        deletedCount
      });
    }
    
  } catch (error) {
    console.error('❌ API: Ошибка удаления уведомлений:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Ошибка удаления уведомлений',
      message: error instanceof Error ? error.message : 'Неизвестная ошибка'
    }, { status: 500 });
  }
}
