// app/api/system/sync/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { withPermissions, type AuthenticatedRequest } from '@/lib/api-middleware';
import { mockTrainers, mockClients, mockSessions } from '@/lib/mock-data';

// Интерфейсы для результатов синхронизации
interface SyncEntityResult {
  total: number;
  synced: number;
  errors: number;
}

interface SyncResults {
  trainers: SyncEntityResult;
  clients: SyncEntityResult;
  sessions: SyncEntityResult;
  startTime: string;
  endTime: string | null;
  duration: number;
}

interface SyncStatus {
  isRunning: boolean;
  lastSync: string | null;
  nextSync: string | null;
  autoSyncEnabled: boolean;
  syncInterval: number;
  lastResults: {
    success: boolean;
    duration: number;
    totalRecords: number;
    syncedRecords: number;
    errors: number;
  } | null;
}

// POST /api/system/sync - Принудительная синхронизация данных
export const POST = async (
  req: NextRequest,
  context: { params: Promise<Record<string, string>> }
): Promise<NextResponse> => {
  const handler = withPermissions(
    { resource: 'system', action: 'maintenance' },
    async (req: AuthenticatedRequest) => {
      try {
        console.log('🔄 API: запуск принудительной синхронизации');

        const { user } = req;
        const body = await req.json();
        const { force = false, entities = ['trainers', 'clients', 'sessions'] } = body;

        // Валидация параметров
        const validEntities = ['trainers', 'clients', 'sessions'];
        const entitiesToSync = Array.isArray(entities)
          ? entities.filter((entity: string) => validEntities.includes(entity))
          : validEntities;

        if (entitiesToSync.length === 0) {
          return NextResponse.json(
            { success: false, error: 'Не указаны корректные сущности для синхронизации' },
            { status: 400 }
          );
        }

        const startTime = new Date().toISOString();

        // Имитация процесса синхронизации
        const syncResults: SyncResults = {
          trainers: {
            total: 0,
            synced: 0,
            errors: 0
          },
          clients: {
            total: 0,
            synced: 0,
            errors: 0
          },
          sessions: {
            total: 0,
            synced: 0,
            errors: 0
          },
          startTime,
          endTime: null,
          duration: 0
        };

        // Имитация задержки синхронизации
        const syncDelay = force ? 500 : 1000;
        await new Promise(resolve => setTimeout(resolve, syncDelay));

        // Синхронизация тренеров
        if (entitiesToSync.includes('trainers')) {
          syncResults.trainers.total = mockTrainers.length;

          for (const trainer of mockTrainers) {
            try {
              // Имитация синхронизации с внешней системой
              await new Promise(resolve => setTimeout(resolve, 10)); // Небольшая задержка

              if (trainer.status !== 'inactive') {
                syncResults.trainers.synced++;
              }
            } catch (error) {
              syncResults.trainers.errors++;
              console.error(`Ошибка синхронизации тренера ${trainer.id}:`, error);
            }
          }
        }

        // Синхронизация клиентов
        if (entitiesToSync.includes('clients')) {
          syncResults.clients.total = mockClients.length;

          for (const client of mockClients) {
            try {
              await new Promise(resolve => setTimeout(resolve, 10));

              if (client.status !== 'inactive') {
                syncResults.clients.synced++;
              }
            } catch (error) {
              syncResults.clients.errors++;
              console.error(`Ошибка синхронизации клиента ${client.id}:`, error);
            }
          }
        }

        // Синхронизация сессий
        if (entitiesToSync.includes('sessions')) {
          syncResults.sessions.total = mockSessions.length;

          for (const session of mockSessions) {
            try {
              await new Promise(resolve => setTimeout(resolve, 5));

              if (session.status !== 'cancelled') {
                syncResults.sessions.synced++;
              }
            } catch (error) {
              syncResults.sessions.errors++;
              console.error(`Ошибка синхронизации сессии ${session.id}:`, error);
            }
          }
        }

        const endTime = new Date().toISOString();
        syncResults.endTime = endTime;
        syncResults.duration = new Date(endTime).getTime() - new Date(startTime).getTime();

        // Подсчет общих результатов
        const totalRecords = syncResults.trainers.total + syncResults.clients.total + syncResults.sessions.total;
        const totalSynced = syncResults.trainers.synced + syncResults.clients.synced + syncResults.sessions.synced;
        const totalErrors = syncResults.trainers.errors + syncResults.clients.errors + syncResults.sessions.errors;

        console.log(`✅ API: синхронизация завершена за ${syncResults.duration}ms`);
        console.log(`📊 Результаты: $${totalSynced}/$${totalRecords} записей синхронизировано, ${totalErrors} ошибок`);

        // Сохраняем результаты последней синхронизации (в реальном приложении это было бы в БД)
        const lastSyncResults = {
          success: totalErrors === 0,
          duration: syncResults.duration,
          totalRecords,
          syncedRecords: totalSynced,
          errors: totalErrors,
          timestamp: endTime,
          performedBy: user.id,
          entities: entitiesToSync,
          forced: force
        };

        return NextResponse.json({
          success: true,
          data: {
            ...syncResults,
            summary: {
              totalRecords,
              totalSynced,
              totalErrors,
              successRate: totalRecords > 0 ? Math.round((totalSynced / totalRecords) * 100) : 0
            }
          },
          message: totalErrors === 0
            ? 'Синхронизация успешно завершена'
            : `Синхронизация завершена с ${totalErrors} ошибками`
        });

      } catch (error) {
        console.error('💥 API: ошибка синхронизации:', error);
        return NextResponse.json(
          { success: false, error: 'Ошибка выполнения синхронизации' },
          { status: 500 }
        );
      }
    }
  );

  return handler(req, { params: {} });
};

// GET /api/system/sync - Получение статуса синхронизации
export const GET = async (
  req: NextRequest,
  context: { params: Promise<Record<string, string>> }
): Promise<NextResponse> => {
  const handler = withPermissions(
    { resource: 'system', action: 'maintenance' },
    async (req: AuthenticatedRequest) => {
      try {
        console.log('📊 API: получение статуса синхронизации');

        const url = new URL(req.url);
        const includeHistory = url.searchParams.get('includeHistory') === 'true';

        // Имитация статуса синхронизации
        const now = new Date();
        const lastSyncTime = new Date(now.getTime() - 5 * 60 * 1000); // 5 минут назад
        const nextSyncTime = new Date(now.getTime() + 5 * 60 * 1000); // через 5 минут

        const syncStatus: SyncStatus = {
          isRunning: false,
          lastSync: lastSyncTime.toISOString(),
          nextSync: nextSyncTime.toISOString(),
          autoSyncEnabled: true,
          syncInterval: 300000, // 5 минут в миллисекундах
          lastResults: {
            success: true,
            duration: 1250,
            totalRecords: mockTrainers.length + mockClients.length + mockSessions.length,
            syncedRecords: mockTrainers.length + mockClients.length + mockSessions.length - 2,
            errors: 2
          }
        };

        // Дополнительная информация о системе
        const systemInfo = {
          version: '1.0.0',
          environment: process.env.NODE_ENV || 'development',
          uptime: process.uptime(),
          memoryUsage: process.memoryUsage(),
          dataStats: {
            trainers: {
              total: mockTrainers.length,
              active: mockTrainers.filter(t => t.status === 'active').length,
              inactive: mockTrainers.filter(t => t.status === 'inactive').length,
              suspended: mockTrainers.filter(t => t.status === 'suspended').length
            },
            clients: {
              total: mockClients.length,
              active: mockClients.filter(c => c.status === 'active').length,
              inactive: mockClients.filter(c => c.status === 'inactive').length,
              suspended: mockClients.filter(c => c.status === 'suspended').length
            },
            sessions: {
              total: mockSessions.length,
              scheduled: mockSessions.filter(s => s.status === 'scheduled').length,
              completed: mockSessions.filter(s => s.status === 'completed').length,
              cancelled: mockSessions.filter(s => s.status === 'cancelled').length,
              noShow: mockSessions.filter(s => s.status === 'no-show').length
            }
          }
        };

        const response: any = {
          success: true,
          data: {
            syncStatus,
            systemInfo
          }
        };

        // Добавляем историю синхронизации если запрошена
        if (includeHistory) {
          response.data.syncHistory = [
            {
              id: 'sync_1',
              timestamp: new Date(now.getTime() - 5 * 60 * 1000).toISOString(),
              duration: 1250,
              success: true,
              totalRecords: 150,
              syncedRecords: 148,
              errors: 2,
              performedBy: 'system',
              type: 'auto'
            },
            {
              id: 'sync_2',
              timestamp: new Date(now.getTime() - 10 * 60 * 1000).toISOString(),
              duration: 980,
              success: true,
              totalRecords: 148,
              syncedRecords: 148,
              errors: 0,
              performedBy: 'admin_1',
              type: 'manual'
            },
            {
              id: 'sync_3',
              timestamp: new Date(now.getTime() - 15 * 60 * 1000).toISOString(),
              duration: 2100,
              success: false,
              totalRecords: 145,
              syncedRecords: 120,
              errors: 25,
              performedBy: 'system',
              type: 'auto'
            }
          ];
        }

        return NextResponse.json(response);

      } catch (error) {
        console.error('💥 API: ошибка получения статуса синхронизации:', error);
        return NextResponse.json(
          { success: false, error: 'Ошибка получения статуса синхронизации' },
          { status: 500 }
        );
      }
    }
  );

  return handler(req, { params: {} });
};

// PUT /api/system/sync - Настройка параметров синхронизации
export const PUT = async (
  req: NextRequest,
  context: { params: Promise<Record<string, string>> }
): Promise<NextResponse> => {
  const handler = withPermissions(
    { resource: 'system', action: 'maintenance' },
    async (req: AuthenticatedRequest) => {
      try {
        console.log('⚙️ API: обновление настроек синхронизации');

        const { user } = req;
        const body = await req.json();

        // Валидация параметров
        const allowedSettings = ['autoSyncEnabled', 'syncInterval'];
        const updates: any = {};

        for (const [key, value] of Object.entries(body)) {
          if (allowedSettings.includes(key)) {
            if (key === 'autoSyncEnabled' && typeof value === 'boolean') {
              updates[key] = value;
            } else if (key === 'syncInterval' && typeof value === 'number' && value >= 60000) { // минимум 1 минута
              updates[key] = value;
            } else {
              return NextResponse.json(
                { success: false, error: `Некорректное значение для параметра ${key}` },
                { status: 400 }
              );
            }
          }
        }

        if (Object.keys(updates).length === 0) {
          return NextResponse.json(
            { success: false, error: 'Не указаны корректные параметры для обновления' },
            { status: 400 }
          );
        }

        // В реальном приложении здесь было бы сохранение в БД
        console.log(`✅ API: настройки синхронизации обновлены пользователем ${user.id}:`, updates);

        return NextResponse.json({
          success: true,
          data: updates,
          message: 'Настройки синхронизации успешно обновлены'
        });

      } catch (error) {
        console.error('💥 API: ошибка обновления настроек синхронизации:', error);
        return NextResponse.json(
          { success: false, error: 'Ошибка обновления настроек синхронизации' },
          { status: 500 }
        );
      }
    }
  );

  return handler(req, { params: {} });
};

// DELETE /api/system/sync - Остановка текущей синхронизации
export const DELETE = async (
  req: NextRequest,
  context: { params: Promise<Record<string, string>> }
): Promise<NextResponse> => {
  const handler = withPermissions(
    { resource: 'system', action: 'maintenance' },
    async (req: AuthenticatedRequest) => {
      try {
        console.log('🛑 API: остановка синхронизации');

        const { user } = req;

        // В реальном приложении здесь была бы логика остановки процесса синхронизации
        console.log(`✅ API: синхронизация остановлена пользователем ${user.id}`);

        return NextResponse.json({
          success: true,
          message: 'Синхронизация успешно остановлена'
        });

      } catch (error) {
        console.error('💥 API: ошибка остановки синхронизации:', error);
        return NextResponse.json(
          { success: false, error: 'Ошибка остановки синхронизации' },
          { status: 500 }
        );
      }
    }
  );

  return handler(req, { params: {} });
};
