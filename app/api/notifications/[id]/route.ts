// app/api/notifications/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { withPermissions, type AuthenticatedRequest } from '@/lib/api-middleware';
import { 
  updateNotification, 
  deleteNotification, 
  findNotification 
} from '@/lib/notifications-data';

// GET /api/notifications/[id] - Получение конкретного уведомления
export const GET = async (
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> => {
  const handler = withPermissions(
    { resource: 'notifications', action: 'read' },
    async (req: AuthenticatedRequest) => {
      try {
        const params = await context.params;
        const { id } = params;
        const { user } = req;

        if (!id) {
          return NextResponse.json(
            { success: false, error: 'ID уведомления не указан' },
            { status: 400 }
          );
        }

        console.log(`🔔 API: получение уведомления ${id}`);

        const notification = findNotification(id);
        if (!notification) {
          return NextResponse.json(
            { success: false, error: 'Уведомление не найдено' },
            { status: 404 }
          );
        }

        // Проверка прав доступа
        if (notification.userId !== user.id && notification.userId !== 'all') {
          return NextResponse.json(
            { success: false, error: 'Нет доступа к данному уведомлению' },
            { status: 403 }
          );
        }

        return NextResponse.json({
          success: true,
          data: notification
        });

      } catch (error: any) {
        console.error('💥 API: ошибка получения уведомления:', error);
        return NextResponse.json(
          { success: false, error: 'Ошибка получения уведомления' },
          { status: 500 }
        );
      }
    }
  );

  return handler(req, { params: {} });
};

// PATCH /api/notifications/[id] - Обновление уведомления
export const PATCH = async (
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> => {
  const handler = withPermissions(
    { resource: 'notifications', action: 'update' },
    async (req: AuthenticatedRequest) => {
      try {
        const params = await context.params;
        const { id } = params;
        const { user } = req;
        const body = await req.json();

        if (!id) {
          return NextResponse.json(
            { success: false, error: 'ID уведомления не указан' },
            { status: 400 }
          );
        }

        console.log(`📝 API: обновление уведомления ${id}`);

        const notification = findNotification(id);
        if (!notification) {
          return NextResponse.json(
            { success: false, error: 'Уведомление не найдено' },
            { status: 404 }
          );
        }

        // Проверка прав доступа
        if (notification.userId !== user.id && notification.userId !== 'all') {
          return NextResponse.json(
            { success: false, error: 'Нет доступа к данному уведомлению' },
            { status: 403 }
          );
        }

        // Обновление уведомления
        const updates = {
          ...body,
          id: notification.id, // ID не должен изменяться
          userId: notification.userId, // userId не должен изменяться
          createdAt: notification.createdAt // createdAt не должен изменяться
        };

        const updatedNotification = updateNotification(id, updates);

        if (!updatedNotification) {
          return NextResponse.json(
            { success: false, error: 'Ошибка обновления уведомления' },
            { status: 500 }
          );
        }

        console.log(`✅ API: уведомление обновлено - ${updatedNotification.title}`);

        return NextResponse.json({
          success: true,
          data: updatedNotification,
          message: 'Уведомление обновлено'
        });

      } catch (error: any) {
        console.error('💥 API: ошибка обновления уведомления:', error);
        return NextResponse.json(
          { success: false, error: 'Ошибка обновления уведомления' },
          { status: 500 }
        );
      }
    }
  );

  return handler(req, { params: {} });
};

// DELETE /api/notifications/[id] - Удаление конкретного уведомления
export const DELETE = async (
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> => {
  const handler = withPermissions(
    { resource: 'notifications', action: 'delete' },
    async (req: AuthenticatedRequest) => {
      try {
        const params = await context.params;
        const { id } = params;
        const { user } = req;

        if (!id) {
          return NextResponse.json(
            { success: false, error: 'ID уведомления не указан' },
            { status: 400 }
          );
        }

        console.log(`🗑️ API: удаление уведомления ${id}`);

        const notification = findNotification(id);
        if (!notification) {
          return NextResponse.json(
            { success: false, error: 'Уведомление не найдено' },
            { status: 404 }
          );
        }

        // Проверка прав доступа
        if (notification.userId !== user.id && notification.userId !== 'all') {
          return NextResponse.json(
            { success: false, error: 'Нет доступа к данному уведомлению' },
            { status: 403 }
          );
        }

        // Удаление уведомления
        const deletedNotification = deleteNotification(id);

        if (!deletedNotification) {
          return NextResponse.json(
            { success: false, error: 'Ошибка удаления уведомления' },
            { status: 500 }
          );
        }

        console.log(`✅ API: уведомление удалено - ${deletedNotification.title}`);

        return NextResponse.json({
          success: true,
          data: deletedNotification,
          message: 'Уведомление удалено'
        });

      } catch (error: any) {
        console.error('💥 API: ошибка удаления уведомления:', error);
        return NextResponse.json(
          { success: false, error: 'Ошибка удаления уведомления' },
          { status: 500 }
        );
      }
    }
  );

  return handler(req, { params: {} });
};

// PUT /api/notifications/[id] - Пометка уведомления как прочитанного
export const PUT = async (
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> => {
  const handler = withPermissions(
    { resource: 'notifications', action: 'update' },
    async (req: AuthenticatedRequest) => {
      try {
        const params = await context.params;
        const { id } = params;
        const { user } = req;

        if (!id) {
          return NextResponse.json(
            { success: false, error: 'ID уведомления не указан' },
            { status: 400 }
          );
        }

        console.log(`👁️ API: пометка уведомления как прочитанного ${id}`);

        const notification = findNotification(id);
        if (!notification) {
          return NextResponse.json(
            { success: false, error: 'Уведомление не найдено' },
            { status: 404 }
          );
        }

        // Проверка прав доступа
        if (notification.userId !== user.id && notification.userId !== 'all') {
          return NextResponse.json(
            { success: false, error: 'Нет доступа к данному уведомлению' },
            { status: 403 }
          );
        }

        // Пометка как прочитанное
        const updatedNotification = updateNotification(id, {
          read: true,
          readAt: new Date().toISOString()
        });

        if (!updatedNotification) {
          return NextResponse.json(
            { success: false, error: 'Ошибка обновления уведомления' },
            { status: 500 }
          );
        }

        console.log(`✅ API: уведомление помечено как прочитанное - ${notification.title}`);

        return NextResponse.json({
          success: true,
          data: updatedNotification,
          message: 'Уведомление помечено как прочитанное'
        });

      } catch (error: any) {
        console.error('💥 API: ошибка пометки уведомления как прочитанного:', error);
        return NextResponse.json(
          { success: false, error: 'Ошибка пометки уведомления как прочитанного' },
          { status: 500 }
        );
      }
    }
  );

  return handler(req, { params: {} });
};
