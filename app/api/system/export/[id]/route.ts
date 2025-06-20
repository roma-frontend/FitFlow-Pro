// app/api/system/export/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { withPermissions, type AuthenticatedRequest } from '@/lib/api-middleware';

// GET /api/system/export/[id] - Получение информации об экспорте
export const GET = async (
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> => {
  try {
    // Получаем параметры до создания handler'а
    const params = await context.params;
    const { id: exportId } = params;

    if (!exportId) {
      return NextResponse.json(
        { success: false, error: 'ID экспорта не указан' },
        { status: 400 }
      );
    }

    const handler = withPermissions(
      { resource: 'system', action: 'export' },
      async (req: AuthenticatedRequest) => {
        try {
          const { user } = req;

          console.log(`📋 API: получение информации об экспорте ${exportId}`);

          // Проверка прав доступа
          if (user.role === 'trainer' && !exportId.includes(user.id)) {
            return NextResponse.json(
              { success: false, error: 'Нет прав на просмотр этого экспорта' },
              { status: 403 }
            );
          }

          // В реальном приложении здесь был бы поиск в БД
          // Имитация информации об экспорте
          const exportInfo = {
            id: exportId,
            format: exportId.includes('xlsx') ? 'xlsx' : 
                    exportId.includes('csv') ? 'csv' : 'json',
            entities: ['trainers', 'clients', 'sessions'],
            totalRecords: 150,
            recordCounts: {
              trainers: user.role === 'trainer' ? 1 : 25,
              clients: user.role === 'trainer' ? 15 : 100,
              sessions: user.role === 'trainer' ? 45 : 200
            },
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            expiresAt: new Date(Date.now() + 22 * 60 * 60 * 1000).toISOString(),
            status: 'completed' as const,
            downloadUrl: `/api/system/export/${exportId}/download`,
            fileSize: '2.5 MB',
            createdBy: {
              id: user.id,
              name: user.name,
              role: user.role
            },
            filters: {
              status: 'active',
              dateRange: {
                start: '2024-01-01',
                end: '2024-12-31'
              }
            },
            metadata: {
              compression: 'gzip',
              encoding: 'utf-8',
              delimiter: exportId.includes('csv') ? ',' : undefined,
              includeHeaders: true,
              includeDeleted: false
            }
          };

          return NextResponse.json({
            success: true,
            data: exportInfo
          });

        } catch (error) {
          console.error('💥 API: ошибка получения информации об экспорте:', error);
          return NextResponse.json(
            { success: false, error: 'Ошибка получения информации об экспорте' },
            { status: 500 }
          );
        }
      }
    );

    return handler(req, { params: {} });

  } catch (error) {
    console.error('💥 API: ошибка обработки запроса информации об экспорте:', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка обработки запроса' },
      { status: 500 }
    );
  }
};

// DELETE /api/system/export/[id] - Удаление конкретного экспорта
export const DELETE = async (
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> => {
  try {
    // Получаем параметры до создания handler'а
    const params = await context.params;
    const { id: exportId } = params;

    if (!exportId) {
      return NextResponse.json(
        { success: false, error: 'ID экспорта не указан' },
        { status: 400 }
      );
    }

    const handler = withPermissions(
      { resource: 'system', action: 'delete' },
      async (req: AuthenticatedRequest) => {
        try {
          const { user } = req;

          console.log(`🗑️ API: удаление экспорта ${exportId}`);

          // Проверка прав доступа
          if (user.role === 'trainer' && !exportId.includes(user.id)) {
            return NextResponse.json(
              { success: false, error: 'Нет прав на удаление этого экспорта' },
              { status: 403 }
            );
          }

          // В реальном приложении здесь было бы удаление файла и записи из БД
          console.log(`✅ API: экспорт удален - ${exportId}`);

          return NextResponse.json({
            success: true,
            data: {
              deletedExportId: exportId,
              deletedBy: user.id,
              deletedAt: new Date().toISOString()
            },
            message: 'Экспорт успешно удален'
          });

        } catch (error) {
          console.error('💥 API: ошибка удаления экспорта:', error);
          return NextResponse.json(
            { success: false, error: 'Ошибка удаления экспорта' },
            { status: 500 }
          );
        }
      }
    );

    return handler(req, { params: {} });

  } catch (error) {
    console.error('💥 API: ошибка обработки запроса на удаление экспорта:', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка обработки запроса' },
      { status: 500 }
    );
  }
};

// PUT /api/system/export/[id] - Обновление экспорта (продление срока действия)
export const PUT = async (
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> => {
  try {
    // Получаем параметры до создания handler'а
    const params = await context.params;
    const { id: exportId } = params;

    if (!exportId) {
      return NextResponse.json(
        { success: false, error: 'ID экспорта не указан' },
        { status: 400 }
      );
    }

    const handler = withPermissions(
      { resource: 'system', action: 'update' },
      async (req: AuthenticatedRequest) => {
        try {
          const { user } = req;
          const body = await req.json();

          console.log(`🔄 API: обновление экспорта ${exportId}`);

          // Проверка прав доступа
          if (user.role === 'trainer' && !exportId.includes(user.id)) {
            return NextResponse.json(
              { success: false, error: 'Нет прав на обновление этого экспорта' },
              { status: 403 }
            );
          }

          const { action, extendHours = 24 } = body;

          if (action === 'extend') {
            const newExpiryDate = new Date();
            newExpiryDate.setHours(newExpiryDate.getHours() + extendHours);

            console.log(`✅ API: срок действия экспорта продлен до ${newExpiryDate.toISOString()}`);

            return NextResponse.json({
              success: true,
              data: {
                exportId,
                newExpiresAt: newExpiryDate.toISOString(),
                extendedBy: user.id,
                extendedAt: new Date().toISOString(),
                extendHours
              },
              message: `Срок действия экспорта продлен на ${extendHours} часов`
            });
          }

          return NextResponse.json(
            { success: false, error: 'Неизвестное действие' },
            { status: 400 }
          );

        } catch (error) {
          console.error('💥 API: ошибка обновления экспорта:', error);
          return NextResponse.json(
            { success: false, error: 'Ошибка обновления экспорта' },
            { status: 500 }
          );
        }
      }
    );

    return handler(req, { params: {} });

  } catch (error) {
    console.error('💥 API: ошибка обработки запроса на обновление экспорта:', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка обработки запроса' },
      { status: 500 }
    );
  }
};
