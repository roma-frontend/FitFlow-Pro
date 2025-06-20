// app/api/notifications/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { withPermissions, type AuthenticatedRequest } from '@/lib/api-middleware';
import { 
  getMockNotifications, 
  addNotification, 
  setMockNotifications,
  type Notification 
} from '@/lib/notifications-data';

// GET /api/notifications - Получение уведомлений пользователя
export const GET = async (
  req: NextRequest,
  context: { params: Promise<Record<string, string>> }
): Promise<NextResponse> => {
  const handler = withPermissions(
    { resource: 'notifications', action: 'read' },
    async (req: AuthenticatedRequest) => {
      try {
        console.log('🔔 API: получение уведомлений');

        const { user } = req;
        const url = new URL(req.url);
        const page = parseInt(url.searchParams.get('page') || '1');
        const limit = parseInt(url.searchParams.get('limit') || '20');
        const unreadOnly = url.searchParams.get('unreadOnly') === 'true';
        const category = url.searchParams.get('category');
        const priority = url.searchParams.get('priority');
        const type = url.searchParams.get('type');

        const mockNotifications = getMockNotifications();

        // Фильтрация уведомлений для текущего пользователя
        let userNotifications = mockNotifications.filter((notification: Notification) => 
          notification.userId === user.id || notification.userId === 'all'
        );

        // Дополнительные фильтры
        if (unreadOnly) {
          userNotifications = userNotifications.filter((n: Notification) => !n.read);
        }

        if (category) {
          userNotifications = userNotifications.filter((n: Notification) => n.category === category);
        }

        if (priority) {
          userNotifications = userNotifications.filter((n: Notification) => n.priority === priority);
        }

        if (type) {
          userNotifications = userNotifications.filter((n: Notification) => n.type === type);
        }

        // Сортировка по дате создания (новые сначала)
        userNotifications.sort((a: Notification, b: Notification) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        // Пагинация
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedNotifications = userNotifications.slice(startIndex, endIndex);

        // Статистика
        const stats = {
          total: userNotifications.length,
          unread: userNotifications.filter((n: Notification) => !n.read).length,
          byPriority: {
            high: userNotifications.filter((n: Notification) => n.priority === 'high').length,
            medium: userNotifications.filter((n: Notification) => n.priority === 'medium').length,
            low: userNotifications.filter((n: Notification) => n.priority === 'low').length
          },
          byType: {
            info: userNotifications.filter((n: Notification) => n.type === 'info').length,
            warning: userNotifications.filter((n: Notification) => n.type === 'warning').length,
            error: userNotifications.filter((n: Notification) => n.type === 'error').length,
            success: userNotifications.filter((n: Notification) => n.type === 'success').length
          }
        };

        return NextResponse.json({
          success: true,
          data: paginatedNotifications,
          pagination: {
            page,
            limit,
            total: userNotifications.length,
            pages: Math.ceil(userNotifications.length / limit)
          },
          stats,
          filters: {
            unreadOnly,
            category,
            priority,
            type
          }
        });

      } catch (error: any) {
        console.error('💥 API: ошибка получения уведомлений:', error);
        return NextResponse.json(
          { success: false, error: 'Ошибка получения уведомлений' },
          { status: 500 }
        );
      }
    }
  );

  return handler(req, { params: {} });
};

// POST /api/notifications - Создание нового уведомления
export const POST = async (
  req: NextRequest,
  context: { params: Promise<Record<string, string>> }
): Promise<NextResponse> => {
  const handler = withPermissions(
    { resource: 'notifications', action: 'create' },
    async (req: AuthenticatedRequest) => {
      try {
        console.log('➕ API: создание уведомления');

        const body = await req.json();
        const { user } = req;

        // Валидация обязательных полей
        if (!body.title || !body.message) {
          return NextResponse.json(
            { success: false, error: 'Отсутствуют обязательные поля (title, message)' },
            { status: 400 }
          );
        }

        // Валидация типа
        const validTypes = ['info', 'warning', 'error', 'success'];
        if (body.type && !validTypes.includes(body.type)) {
          return NextResponse.json(
            { success: false, error: 'Некорректный тип уведомления' },
            { status: 400 }
          );
        }

        // Валидация приоритета
        const validPriorities = ['low', 'medium', 'high'];
        if (body.priority && !validPriorities.includes(body.priority)) {
          return NextResponse.json(
            { success: false, error: 'Некорректный приоритет' },
            { status: 400 }
          );
        }

        // Создание уведомления
        const newNotification: Notification = {
          id: `notif_${Date.now()}`,
          userId: body.userId || user.id,
          type: body.type || 'info',
          title: body.title,
          message: body.message,
          read: false,
          createdAt: new Date().toISOString(),
          priority: body.priority || 'medium',
          category: body.category,
          actionUrl: body.actionUrl,
          metadata: body.metadata
        };

        addNotification(newNotification);

        console.log(`✅ API: уведомление создано - ${newNotification.title}`);

        return NextResponse.json({
          success: true,
          data: newNotification,
          message: 'Уведомление создано'
        });

      } catch (error: any) {
        console.error('💥 API: ошибка создания уведомления:', error);
        return NextResponse.json(
          { success: false, error: 'Ошибка создания уведомления' },
          { status: 500 }
        );
      }
    }
  );

  return handler(req, { params: {} });
};

// PUT /api/notifications - Массовая отметка уведомлений как прочитанных
export const PUT = async (
  req: NextRequest,
  context: { params: Promise<Record<string, string>> }
): Promise<NextResponse> => {
  const handler = withPermissions(
    { resource: 'notifications', action: 'update' },
    async (req: AuthenticatedRequest) => {
      try {
        console.log('📖 API: массовая отметка уведомлений как прочитанных');

        const body = await req.json();
        const { user } = req;
        const { notificationIds, markAllAsRead = false } = body;

        let updatedCount = 0;
        const mockNotifications = getMockNotifications();

        if (markAllAsRead) {
          // Отметить все уведомления пользователя как прочитанные
          const updatedNotifications = mockNotifications.map((notification: Notification) => {
            if ((notification.userId === user.id || notification.userId === 'all') && !notification.read) {
              updatedCount++;
              return {
                ...notification,
                read: true,
                readAt: new Date().toISOString()
              };
            }
            return notification;
          });
          setMockNotifications(updatedNotifications);
        } else if (notificationIds && Array.isArray(notificationIds)) {
          // Отметить указанные уведомления как прочитанные
          const updatedNotifications = mockNotifications.map((notification: Notification) => {
            if (notificationIds.includes(notification.id) && 
                (notification.userId === user.id || notification.userId === 'all') && 
                !notification.read) {
              updatedCount++;
              return {
                ...notification,
                read: true,
                readAt: new Date().toISOString()
              };
            }
            return notification;
          });
          setMockNotifications(updatedNotifications);
        }

        console.log(`✅ API: отмечено ${updatedCount} уведомлений как прочитанных`);

        return NextResponse.json({
          success: true,
          data: { updatedCount },
          message: `Отмечено ${updatedCount} уведомлений как прочитанных`
        });

      } catch (error: any) {
        console.error('💥 API: ошибка массовой отметки уведомлений:', error);
        return NextResponse.json(
          { success: false, error: 'Ошибка массовой отметки уведомлений' },
          { status: 500 }
        );
      }
    }
  );

  return handler(req, { params: {} });
};

// DELETE /api/notifications - Удаление уведомлений
export const DELETE = async (
  req: NextRequest,
  context: { params: Promise<Record<string, string>> }
): Promise<NextResponse> => {
  const handler = withPermissions(
    { resource: 'notifications', action: 'delete' },
    async (req: AuthenticatedRequest) => {
      try {
        console.log('🗑️ API: удаление уведомлений');

        const body = await req.json();
        const { user } = req;
        const { notificationIds, deleteAllRead = false } = body;

        let deletedCount = 0;
        const mockNotifications = getMockNotifications();

        if (deleteAllRead) {
          // Удалить все прочитанные уведомления пользователя
          const filteredNotifications = mockNotifications.filter((notification: Notification) => {
            const shouldDelete = (notification.userId === user.id || notification.userId === 'all') && notification.read;
            if (shouldDelete) deletedCount++;
            return !shouldDelete;
          });
          setMockNotifications(filteredNotifications);
        } else if (notificationIds && Array.isArray(notificationIds)) {
          // Удалить указанные уведомления
          const filteredNotifications = mockNotifications.filter((notification: Notification) => {
            const shouldDelete = notificationIds.includes(notification.id) && 
                               (notification.userId === user.id || notification.userId === 'all');
            if (shouldDelete) deletedCount++;
            return !shouldDelete;
          });
          setMockNotifications(filteredNotifications);
        }

        console.log(`✅ API: удалено ${deletedCount} уведомлений`);

        return NextResponse.json({
          success: true,
          data: { deletedCount },
          message: `Удалено ${deletedCount} уведомлений`
        });

      } catch (error: any) {
        console.error('💥 API: ошибка удаления уведомлений:', error);
        return NextResponse.json(
          { success: false, error: 'Ошибка удаления уведомлений' },
          { status: 500 }
        );
      }
    }
  );

  return handler(req, { params: {} });
};
