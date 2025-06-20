// app/api/notifications/[id]/read/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { withPermissions, type AuthenticatedRequest } from '@/lib/api-middleware';
import { 
  findNotification, 
  updateNotification 
} from '@/lib/notifications-data';

// PUT /api/notifications/[id]/read - Отметка уведомления как прочитанного
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

        console.log(`📖 API: отметка уведомления как прочитанного ${id}`);

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

        // Проверка, не прочитано ли уже
        if (notification.read) {
          return NextResponse.json({
            success: true,
            data: notification,
            message: 'Уведомление уже отмечено как прочитанное'
          });
        }

        // Отметка как прочитанного
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

        console.log(`✅ API: уведомление отмечено как прочитанное - ${notification.title}`);

        return NextResponse.json({
          success: true,
          data: updatedNotification,
          message: 'Уведомление отмечено как прочитанное'
        });

      } catch (error: any) {
        console.error('💥 API: ошибка отметки уведомления:', error);
        return NextResponse.json(
          { success: false, error: 'Ошибка отметки уведомления как прочитанного' },
          { status: 500 }
        );
      }
    }
  );

  return handler(req, { params: {} });
};

// DELETE /api/notifications/[id]/read - Отметка уведомления как непрочитанного
export const DELETE = async (
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

        console.log(`📖 API: отметка уведомления как непрочитанного ${id}`);

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

        // Отметка как непрочитанного
        const updatedNotification = updateNotification(id, {
          read: false,
          readAt: undefined
        });

        if (!updatedNotification) {
          return NextResponse.json(
            { success: false, error: 'Ошибка обновления уведомления' },
            { status: 500 }
          );
        }

        console.log(`✅ API: уведомление отмечено как непрочитанное - ${notification.title}`);

        return NextResponse.json({
          success: true,
          data: updatedNotification,
          message: 'Уведомление отмечено как непрочитанное'
        });

      } catch (error: any) {
        console.error('💥 ошибка отметки уведомления:', error);
        return NextResponse.json(
          { success: false, error: 'Ошибка отметки уведомления как непрочитанного' },
          { status: 500 }
        );
      }
    }
  );

  return handler(req, { params: {} });
};
